package cm.onehealth.cohrm.data.remote.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class PublicReportRequest(
    @Json(name = "reporter_name") val reporterName: String? = null,
    @Json(name = "reporter_phone") val reporterPhone: String,
    @Json(name = "reporter_type") val reporterType: String? = "citizen",
    val region: String? = null,
    val department: String? = null,
    val district: String? = null,
    val location: String? = null,
    val description: String,
    val category: String? = "other",
    val species: String? = null,
    val symptoms: List<String>? = null,
    @Json(name = "affected_count") val affectedCount: Int? = 0,
    @Json(name = "dead_count") val deadCount: Int? = 0,
    val latitude: Double? = null,
    val longitude: Double? = null,
)

@JsonClass(generateAdapter = true)
data class TrackingResponse(
    val success: Boolean,
    val data: TrackingData? = null,
    val message: String? = null,
)

@JsonClass(generateAdapter = true)
data class TrackingData(
    val code: String,
    val status: String,
    val priority: String,
    @Json(name = "created_at") val createdAt: String?,
    @Json(name = "updated_at") val updatedAt: String?,
)

@JsonClass(generateAdapter = true)
data class RegionsResponse(
    val success: Boolean,
    val data: List<RegionItem>? = null,
)

@JsonClass(generateAdapter = true)
data class RegionItem(
    val code: String,
    val name: String,
)

@JsonClass(generateAdapter = true)
data class ReportSummaryResponse(
    val success: Boolean,
    val data: ReportSummaryData? = null,
)

@JsonClass(generateAdapter = true)
data class ReportSummaryData(
    val totals: SummaryTotals? = null,
    val byStatus: List<CategoryCount>? = null,
    val byRegion: List<CategoryCount>? = null,
    val bySource: List<CategoryCount>? = null,
    val avgResolutionHours: Int? = 0,
)

@JsonClass(generateAdapter = true)
data class SummaryTotals(
    val total: Int? = 0,
    val pending: Int? = 0,
    val confirmed: Int? = 0,
    val closed: Int? = 0,
    @Json(name = "high_risk") val highRisk: Int? = 0,
)

@JsonClass(generateAdapter = true)
data class CategoryCount(
    val status: String? = null,
    val region: String? = null,
    val source: String? = null,
    val category: String? = null,
    val count: Int? = 0,
)

@JsonClass(generateAdapter = true)
data class ScannerConfigResponse(
    val success: Boolean,
    val data: ScannerConfig? = null,
)

@JsonClass(generateAdapter = true)
data class ScannerConfig(
    val enabled: Boolean? = false,
    @Json(name = "auto_create_threshold") val autoCreateThreshold: Int? = 15,
    @Json(name = "scan_interval_minutes") val scanIntervalMinutes: Int? = 60,
    @Json(name = "notify_on_new_results") val notifyOnNewResults: Boolean? = true,
)
