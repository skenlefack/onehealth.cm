package cm.onehealth.cohrm.data.remote.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class DashboardResponse(
    val success: Boolean = false,
    val data: DashboardData? = null,
)

@JsonClass(generateAdapter = true)
data class DashboardData(
    val stats: DashboardStats? = null,
    @Json(name = "by_region") val byRegion: List<ChartItem> = emptyList(),
    @Json(name = "by_category") val byCategory: List<ChartItem> = emptyList(),
    @Json(name = "by_status") val byStatus: List<ChartItem> = emptyList(),
    @Json(name = "by_source") val bySource: List<ChartItem> = emptyList(),
    @Json(name = "by_priority") val byPriority: List<ChartItem> = emptyList(),
    @Json(name = "by_risk") val byRisk: List<ChartItem> = emptyList(),
    val trends: List<TrendItem> = emptyList(),
    @Json(name = "recent_rumors") val recentRumors: List<RumorSummary> = emptyList(),
)

@JsonClass(generateAdapter = true)
data class DashboardStats(
    val total: Int = 0,
    val pending: Int = 0,
    val investigating: Int = 0,
    val confirmed: Int = 0,
    @Json(name = "false_alarm") val falseAlarm: Int = 0,
    val closed: Int = 0,
    @Json(name = "high_priority") val highPriority: Int = 0,
    val critical: Int = 0,
    @Json(name = "today_count") val todayCount: Int = 0,
    @Json(name = "week_count") val weekCount: Int = 0,
    @Json(name = "month_count") val monthCount: Int = 0,
)

@JsonClass(generateAdapter = true)
data class ChartItem(
    val label: String = "",
    val value: Int = 0,
    val key: String = "",
    val color: String? = null,
)

@JsonClass(generateAdapter = true)
data class TrendItem(
    val date: String = "",
    val count: Int = 0,
    val label: String? = null,
)

@JsonClass(generateAdapter = true)
data class RumorSummary(
    val id: Int = 0,
    val code: String = "",
    val title: String = "",
    val category: String = "",
    val status: String = "",
    val priority: String = "",
    val risk: String = "",
    val source: String = "",
    val region: String = "",
    val department: String = "",
    @Json(name = "created_at") val createdAt: String = "",
    @Json(name = "reporter_name") val reporterName: String? = null,
)
