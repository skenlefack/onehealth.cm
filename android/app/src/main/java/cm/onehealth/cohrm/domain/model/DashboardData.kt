package cm.onehealth.cohrm.domain.model

data class DashboardUiState(
    val isLoading: Boolean = true,
    val error: String? = null,
    val stats: StatsUi = StatsUi(),
    val byRegion: List<ChartEntry> = emptyList(),
    val byCategory: List<ChartEntry> = emptyList(),
    val byStatus: List<ChartEntry> = emptyList(),
    val bySource: List<ChartEntry> = emptyList(),
    val byPriority: List<ChartEntry> = emptyList(),
    val byRisk: List<ChartEntry> = emptyList(),
    val trends: List<TrendEntry> = emptyList(),
    val recentRumors: List<RumorItem> = emptyList(),
)

data class StatsUi(
    val total: Int = 0,
    val pending: Int = 0,
    val investigating: Int = 0,
    val confirmed: Int = 0,
    val falseAlarm: Int = 0,
    val closed: Int = 0,
    val highPriority: Int = 0,
    val critical: Int = 0,
    val todayCount: Int = 0,
    val weekCount: Int = 0,
    val monthCount: Int = 0,
)

data class ChartEntry(
    val key: String,
    val label: String,
    val value: Int,
    val color: Long? = null,
)

data class TrendEntry(
    val date: String,
    val count: Int,
)

data class RumorItem(
    val id: Int,
    val code: String,
    val title: String,
    val category: String,
    val status: String,
    val priority: String,
    val risk: String,
    val source: String,
    val region: String,
    val department: String,
    val createdAt: String,
    val reporterName: String?,
)
