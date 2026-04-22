package cm.onehealth.cohrm.ui.screens.home

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.domain.model.SyncStatus
import cm.onehealth.cohrm.domain.repository.ReportRepository
import cm.onehealth.cohrm.domain.repository.SyncRepository
import cm.onehealth.cohrm.ui.components.SyncState
import cm.onehealth.cohrm.ui.screens.login.LoginViewModel
import cm.onehealth.cohrm.util.SyncEvent
import cm.onehealth.cohrm.util.SyncStatusBroadcaster
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val reportRepository: ReportRepository,
    private val syncRepository: SyncRepository,
    private val dataStore: DataStore<Preferences>,
    private val syncStatusBroadcaster: SyncStatusBroadcaster,
) : ViewModel() {

    val draftCount: StateFlow<Int> = reportRepository.getReportCountByStatus(SyncStatus.DRAFT)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val pendingCount: StateFlow<Int> = reportRepository.getReportCountByStatus(SyncStatus.PENDING)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val syncedCount: StateFlow<Int> = reportRepository.getReportCountByStatus(SyncStatus.SYNCED)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val errorCount: StateFlow<Int> = reportRepository.getReportCountByStatus(SyncStatus.ERROR)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    private val _syncState = MutableStateFlow(SyncState.SYNCED)
    val syncState: StateFlow<SyncState> = _syncState.asStateFlow()

    private val _lastSyncTime = MutableStateFlow(0L)
    val lastSyncTime: StateFlow<Long> = _lastSyncTime.asStateFlow()

    private val _userName = MutableStateFlow("")
    val userName: StateFlow<String> = _userName.asStateFlow()

    private val _actorLevelLabel = MutableStateFlow("")
    val actorLevelLabel: StateFlow<String> = _actorLevelLabel.asStateFlow()

    private val _actorRegion = MutableStateFlow("")
    val actorRegion: StateFlow<String> = _actorRegion.asStateFlow()

    init {
        viewModelScope.launch {
            _lastSyncTime.value = syncRepository.getLastSyncTime()
        }
        viewModelScope.launch {
            dataStore.data.collect { prefs ->
                _userName.value = prefs[LoginViewModel.USER_NAME] ?: ""
                _actorLevelLabel.value = prefs[LoginViewModel.ACTOR_LEVEL_LABEL] ?: ""
                _actorRegion.value = prefs[LoginViewModel.ACTOR_REGION] ?: ""
            }
        }
        // Subscribe to sync status events
        viewModelScope.launch {
            syncStatusBroadcaster.syncStatus.collect { event ->
                _syncState.value = when (event) {
                    is SyncEvent.Idle -> if (pendingCount.value > 0) SyncState.PENDING else SyncState.SYNCED
                    is SyncEvent.Syncing -> SyncState.SYNCING
                    is SyncEvent.Completed -> {
                        _lastSyncTime.value = System.currentTimeMillis()
                        if (event.failed > 0) SyncState.ERROR else SyncState.SYNCED
                    }
                    is SyncEvent.Failed -> SyncState.ERROR
                }
            }
        }
    }
}
