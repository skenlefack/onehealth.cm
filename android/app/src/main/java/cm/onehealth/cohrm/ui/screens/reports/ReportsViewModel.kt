package cm.onehealth.cohrm.ui.screens.reports

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.data.remote.ApiService
import cm.onehealth.cohrm.data.remote.dto.ActorWorkload
import cm.onehealth.cohrm.data.remote.dto.CategoryCount
import cm.onehealth.cohrm.data.remote.dto.RegionStat
import cm.onehealth.cohrm.data.remote.dto.SummaryTotals
import cm.onehealth.cohrm.data.remote.dto.TrendPoint
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import javax.inject.Inject

data class ReportsUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val selectedPeriod: String = "30",
    val totals: SummaryTotals? = null,
    val byStatus: List<CategoryCount> = emptyList(),
    val byRegion: List<CategoryCount> = emptyList(),
    val avgResolutionHours: Int = 0,
    val createdTrends: List<TrendPoint> = emptyList(),
    val resolvedTrends: List<TrendPoint> = emptyList(),
    val regionStats: List<RegionStat> = emptyList(),
    val avgFirstValidationHours: Int = 0,
    val avgCloseTimeHours: Int = 0,
    val actorWorkload: List<ActorWorkload> = emptyList(),
)

@HiltViewModel
class ReportsViewModel @Inject constructor(
    private val apiService: ApiService,
) : ViewModel() {

    private val _state = MutableStateFlow(ReportsUiState())
    val state: StateFlow<ReportsUiState> = _state.asStateFlow()

    init {
        loadReports("30")
    }

    fun selectPeriod(days: String) {
        _state.update { it.copy(selectedPeriod = days) }
        loadReports(days)
    }

    fun refresh() {
        loadReports(_state.value.selectedPeriod)
    }

    private fun loadReports(days: String) {
        _state.update { it.copy(isLoading = true, error = null) }

        val dateTo = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
        val dateFrom = LocalDate.now().minusDays(days.toLongOrNull() ?: 30L)
            .format(DateTimeFormatter.ISO_LOCAL_DATE)

        viewModelScope.launch {
            try {
                val summaryDeferred = async {
                    runCatching { apiService.getReportSummary(dateFrom, dateTo, null) }
                }
                val trendsDeferred = async {
                    runCatching { apiService.getReportTrends(dateFrom, dateTo, null) }
                }
                val geoDeferred = async {
                    runCatching { apiService.getReportGeographic(dateFrom, dateTo) }
                }
                val perfDeferred = async {
                    runCatching { apiService.getReportPerformance(dateFrom, dateTo, null) }
                }

                val summaryResult = summaryDeferred.await()
                val trendsResult = trendsDeferred.await()
                val geoResult = geoDeferred.await()
                val perfResult = perfDeferred.await()

                val summaryData = summaryResult.getOrNull()?.data
                val trendsData = trendsResult.getOrNull()?.data
                val geoData = geoResult.getOrNull()?.data
                val perfData = perfResult.getOrNull()?.data

                _state.update {
                    it.copy(
                        isLoading = false,
                        totals = summaryData?.totals,
                        byStatus = summaryData?.byStatus ?: emptyList(),
                        byRegion = summaryData?.byRegion ?: emptyList(),
                        avgResolutionHours = summaryData?.avgResolutionHours ?: 0,
                        createdTrends = trendsData?.created ?: emptyList(),
                        resolvedTrends = trendsData?.resolved ?: emptyList(),
                        regionStats = geoData?.byRegion ?: emptyList(),
                        avgFirstValidationHours = perfData?.avgFirstValidationHours ?: 0,
                        avgCloseTimeHours = perfData?.avgCloseTimeHours ?: 0,
                        actorWorkload = perfData?.actorWorkload ?: emptyList(),
                    )
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(
                        isLoading = false,
                        error = e.localizedMessage ?: "Erreur lors du chargement des rapports",
                    )
                }
            }
        }
    }
}
