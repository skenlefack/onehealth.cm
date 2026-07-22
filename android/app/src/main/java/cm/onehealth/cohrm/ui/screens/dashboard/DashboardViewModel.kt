package cm.onehealth.cohrm.ui.screens.dashboard

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.domain.model.ChartEntry
import cm.onehealth.cohrm.domain.model.DashboardUiState
import cm.onehealth.cohrm.domain.model.RumorItem
import cm.onehealth.cohrm.domain.model.StatsUi
import cm.onehealth.cohrm.domain.model.TrendEntry
import cm.onehealth.cohrm.domain.repository.CohrmRepository
import cm.onehealth.cohrm.ui.screens.login.LoginViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val cohrmRepository: CohrmRepository,
    private val dataStore: DataStore<Preferences>,
) : ViewModel() {

    private val _state = MutableStateFlow(DashboardUiState())
    val state: StateFlow<DashboardUiState> = _state.asStateFlow()

    private val _userName = MutableStateFlow("")
    val userName: StateFlow<String> = _userName.asStateFlow()

    private val _actorLevel = MutableStateFlow("")
    val actorLevel: StateFlow<String> = _actorLevel.asStateFlow()

    private val _actorRegion = MutableStateFlow("")
    val actorRegion: StateFlow<String> = _actorRegion.asStateFlow()

    init {
        loadUserInfo()
        loadDashboard()
    }

    private fun loadUserInfo() {
        viewModelScope.launch {
            try {
                val prefs = dataStore.data.first()
                _userName.value = prefs[LoginViewModel.USER_NAME] ?: ""
                _actorLevel.value = prefs[LoginViewModel.ACTOR_LEVEL_LABEL] ?: ""
                _actorRegion.value = prefs[LoginViewModel.ACTOR_REGION] ?: ""
            } catch (_: Exception) {
                // DataStore read failed, use defaults
            }
        }
    }

    fun loadDashboard(region: String? = null) {
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            android.util.Log.d("DashboardVM", "loadDashboard called, hasToken=${(cohrmRepository as? Any)?.let { "check_logs" }}")
            try {
                cohrmRepository.getDashboard(region).fold(
                    onSuccess = { data ->
                        val stats = data.stats
                        _state.update {
                            it.copy(
                                isLoading = false,
                                stats = StatsUi(
                                    total = stats?.total ?: 0,
                                    pending = stats?.pending ?: 0,
                                    investigating = stats?.investigating ?: 0,
                                    confirmed = stats?.confirmed ?: 0,
                                    falseAlarm = stats?.falseAlarm ?: 0,
                                    closed = stats?.closed ?: 0,
                                    highPriority = stats?.highPriority ?: 0,
                                    critical = stats?.critical ?: 0,
                                    todayCount = stats?.todayCount ?: 0,
                                    weekCount = stats?.weekCount ?: 0,
                                    monthCount = stats?.monthCount ?: 0,
                                ),
                                byRegion = data.byRegion.map { c -> ChartEntry(c.key, c.label, c.value) },
                                byCategory = data.byCategory.map { c -> ChartEntry(c.key, c.label, c.value) },
                                byStatus = data.byStatus.map { c -> ChartEntry(c.key, c.label, c.value) },
                                bySource = data.bySource.map { c -> ChartEntry(c.key, c.label, c.value) },
                                byPriority = data.byPriority.map { c -> ChartEntry(c.key, c.label, c.value) },
                                byRisk = data.byRisk.map { c -> ChartEntry(c.key, c.label, c.value) },
                                trends = data.trends.map { t -> TrendEntry(t.date, t.count) },
                                recentRumors = data.recentRumors.map { r ->
                                    RumorItem(
                                        id = r.id, code = r.code.orEmpty(), title = r.title.orEmpty(),
                                        category = r.category.orEmpty(), status = r.status.orEmpty(),
                                        priority = r.priority.orEmpty(), risk = r.risk.orEmpty(),
                                        source = r.source.orEmpty(), region = r.region.orEmpty(),
                                        department = r.department.orEmpty(), createdAt = r.createdAt.orEmpty(),
                                        reporterName = r.reporterName,
                                    )
                                },
                            )
                        }
                    },
                    onFailure = { error ->
                        _state.update { it.copy(isLoading = false, error = error.localizedMessage ?: "Erreur réseau") }
                    },
                )
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false, error = e.localizedMessage ?: "Erreur inattendue") }
            }
        }
    }

    fun refresh() = loadDashboard()
}
