package cm.onehealth.cohrm.ui.screens.scanner

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import cm.onehealth.cohrm.data.preferences.ScanPreferences
import cm.onehealth.cohrm.data.remote.dto.ScanSummary
import cm.onehealth.cohrm.data.remote.dto.ScannerResultItem
import cm.onehealth.cohrm.domain.repository.ScanRepository
import cm.onehealth.cohrm.ui.screens.login.LoginViewModel
import cm.onehealth.cohrm.worker.ScanScheduledWorker
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit
import javax.inject.Inject

data class ScannerUiState(
    val isLoading: Boolean = false,
    val isScanning: Boolean = false,
    val activeScanId: Int? = null,
    val selectedSource: String = "all",
    val keywords: String = "",
    val scans: List<ScanSummary> = emptyList(),
    val error: String? = null,
    val hasAccess: Boolean = false,
    val isAutoScanEnabled: Boolean = false,
    val autoScanFrequency: Int = 60,
    val autoScanSource: String = "all",
    val autoScanKeywords: String = "",
    val scannerResults: List<ScannerResultItem> = emptyList(),
    val isLoadingResults: Boolean = false,
    val selectedResultFilter: String? = null,
)

sealed interface ScannerEvent {
    data class ScanCompleted(val scanId: Int, val rumorsFound: Int) : ScannerEvent
    data class Error(val message: String) : ScannerEvent
    data class Success(val message: String) : ScannerEvent
}

@HiltViewModel
class ScannerViewModel @Inject constructor(
    private val scanRepository: ScanRepository,
    private val dataStore: DataStore<Preferences>,
    private val workManager: WorkManager,
) : ViewModel() {

    private val _state = MutableStateFlow(ScannerUiState())
    val state: StateFlow<ScannerUiState> = _state.asStateFlow()

    private val _events = MutableSharedFlow<ScannerEvent>()
    val events: SharedFlow<ScannerEvent> = _events.asSharedFlow()

    init {
        checkAccess()
        loadHistory()
        loadSchedulePrefs()
        loadScannerResults()
    }

    private fun checkAccess() {
        viewModelScope.launch {
            try {
                val prefs = dataStore.data.first()
                val role = prefs[LoginViewModel.USER_ROLE] ?: ""
                val level = prefs[LoginViewModel.ACTOR_LEVEL] ?: 0
                _state.update { it.copy(hasAccess = role == "admin" || level >= 4) }
            } catch (_: Exception) {}
        }
    }

    fun updateSource(source: String) = _state.update { it.copy(selectedSource = source) }
    fun updateKeywords(keywords: String) = _state.update { it.copy(keywords = keywords) }

    fun loadHistory() {
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            scanRepository.getScanHistory().fold(
                onSuccess = { scans -> _state.update { it.copy(isLoading = false, scans = scans) } },
                onFailure = { e -> _state.update { it.copy(isLoading = false, error = e.localizedMessage) } },
            )
        }
    }

    fun runScan() {
        val s = _state.value
        if (s.isScanning) return
        _state.update { it.copy(isScanning = true, error = null) }

        val keywordList = s.keywords.split(",").map { it.trim() }.filter { it.isNotEmpty() }.ifEmpty { null }

        viewModelScope.launch {
            scanRepository.runScan(s.selectedSource, keywordList).fold(
                onSuccess = { scanId ->
                    _state.update { it.copy(activeScanId = scanId) }
                    pollScanStatus(scanId)
                },
                onFailure = { e ->
                    _state.update { it.copy(isScanning = false, error = e.localizedMessage) }
                    _events.emit(ScannerEvent.Error(e.localizedMessage ?: "Erreur"))
                },
            )
        }
    }

    private suspend fun pollScanStatus(scanId: Int) {
        repeat(20) {
            delay(3000)
            scanRepository.getScanDetail(scanId).fold(
                onSuccess = { detail ->
                    if (detail.status in listOf("completed", "failed", "partial")) {
                        _state.update { it.copy(isScanning = false, activeScanId = null) }
                        _events.emit(ScannerEvent.ScanCompleted(scanId, detail.rumorsFound))
                        loadHistory()
                        return
                    }
                },
                onFailure = { /* continue polling */ },
            )
        }
        // Timeout
        _state.update { it.copy(isScanning = false, activeScanId = null) }
        loadHistory()
    }

    // --- Auto-scan schedule management ---

    private fun loadSchedulePrefs() {
        viewModelScope.launch {
            try {
                val prefs = dataStore.data.first()
                val enabled = prefs[ScanPreferences.SCAN_ENABLED] ?: false
                val frequency = prefs[ScanPreferences.SCAN_FREQUENCY] ?: 60
                val source = prefs[ScanPreferences.SCAN_SOURCE] ?: "all"
                val keywords = prefs[ScanPreferences.SCAN_KEYWORDS] ?: ""
                _state.update {
                    it.copy(
                        isAutoScanEnabled = enabled,
                        autoScanFrequency = frequency,
                        autoScanSource = source,
                        autoScanKeywords = keywords,
                    )
                }
            } catch (_: Exception) {}
        }
    }

    fun updateAutoScanEnabled(enabled: Boolean) {
        _state.update { it.copy(isAutoScanEnabled = enabled) }
        viewModelScope.launch {
            dataStore.edit { it[ScanPreferences.SCAN_ENABLED] = enabled }
            if (enabled) {
                scheduleAutoScan(_state.value.autoScanFrequency)
            } else {
                cancelAutoScan()
            }
        }
    }

    fun updateAutoScanFrequency(minutes: Int) {
        _state.update { it.copy(autoScanFrequency = minutes) }
        viewModelScope.launch {
            dataStore.edit { it[ScanPreferences.SCAN_FREQUENCY] = minutes }
            if (_state.value.isAutoScanEnabled) {
                scheduleAutoScan(minutes)
            }
        }
    }

    fun updateAutoScanSource(source: String) {
        _state.update { it.copy(autoScanSource = source) }
        viewModelScope.launch {
            dataStore.edit { it[ScanPreferences.SCAN_SOURCE] = source }
        }
    }

    fun updateAutoScanKeywords(keywords: String) {
        _state.update { it.copy(autoScanKeywords = keywords) }
        viewModelScope.launch {
            dataStore.edit { it[ScanPreferences.SCAN_KEYWORDS] = keywords }
        }
    }

    private fun scheduleAutoScan(frequencyMinutes: Int) {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
        val request = PeriodicWorkRequestBuilder<ScanScheduledWorker>(
            frequencyMinutes.toLong(), TimeUnit.MINUTES,
        ).setConstraints(constraints).build()
        workManager.enqueueUniquePeriodicWork(
            ScanScheduledWorker.WORK_NAME,
            ExistingPeriodicWorkPolicy.UPDATE,
            request,
        )
    }

    private fun cancelAutoScan() {
        workManager.cancelUniqueWork(ScanScheduledWorker.WORK_NAME)
    }

    // --- Scanner results management ---

    fun loadScannerResults(status: String? = _state.value.selectedResultFilter) {
        _state.update { it.copy(isLoadingResults = true) }
        viewModelScope.launch {
            scanRepository.getScannerResults(status = status).fold(
                onSuccess = { results ->
                    _state.update { it.copy(isLoadingResults = false, scannerResults = results) }
                },
                onFailure = { e ->
                    _state.update { it.copy(isLoadingResults = false) }
                    _events.emit(ScannerEvent.Error(e.localizedMessage ?: "Erreur"))
                },
            )
        }
    }

    fun updateResultFilter(status: String?) {
        _state.update { it.copy(selectedResultFilter = status) }
        loadScannerResults(status)
    }

    fun reviewResult(id: Int, status: String) {
        viewModelScope.launch {
            scanRepository.reviewScanResult(id, status).fold(
                onSuccess = {
                    _events.emit(ScannerEvent.Success(if (status == "dismissed") "Résultat ignoré" else "Résultat examiné"))
                    loadScannerResults()
                },
                onFailure = { e ->
                    _events.emit(ScannerEvent.Error(e.localizedMessage ?: "Erreur"))
                },
            )
        }
    }

    fun convertToRumor(id: Int, title: String? = null, description: String? = null) {
        viewModelScope.launch {
            scanRepository.convertScanResult(id, title, description).fold(
                onSuccess = {
                    _events.emit(ScannerEvent.Success("Converti en rumeur"))
                    loadScannerResults()
                },
                onFailure = { e ->
                    _events.emit(ScannerEvent.Error(e.localizedMessage ?: "Erreur"))
                },
            )
        }
    }
}
