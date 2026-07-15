package cm.onehealth.cohrm.data.remote.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class ReportTrendsResponse(
    val success: Boolean,
    val data: TrendsData? = null,
)

@JsonClass(generateAdapter = true)
data class TrendsData(
    val created: List<TrendPoint>? = null,
    val resolved: List<TrendPoint>? = null,
)

@JsonClass(generateAdapter = true)
data class TrendPoint(
    val period: String? = null,
    val count: Int? = 0,
)

@JsonClass(generateAdapter = true)
data class ReportGeographicResponse(
    val success: Boolean,
    val data: GeographicData? = null,
)

@JsonClass(generateAdapter = true)
data class GeographicData(
    @Json(name = "byRegion") val byRegion: List<RegionStat>? = null,
)

@JsonClass(generateAdapter = true)
data class RegionStat(
    val region: String? = null,
    val count: Int? = 0,
    val confirmed: Int? = 0,
    @Json(name = "high_priority") val highPriority: Int? = 0,
)

@JsonClass(generateAdapter = true)
data class ReportPerformanceResponse(
    val success: Boolean,
    val data: PerformanceData? = null,
)

@JsonClass(generateAdapter = true)
data class PerformanceData(
    @Json(name = "avgFirstValidationHours") val avgFirstValidationHours: Int? = 0,
    @Json(name = "avgCloseTimeHours") val avgCloseTimeHours: Int? = 0,
    @Json(name = "actorWorkload") val actorWorkload: List<ActorWorkload>? = null,
)

@JsonClass(generateAdapter = true)
data class ActorWorkload(
    val name: String? = null,
    @Json(name = "actor_level") val actorLevel: Int? = 0,
    @Json(name = "validations_count") val validationsCount: Int? = 0,
)
