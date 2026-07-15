package cm.onehealth.cohrm.data.remote.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class ReportRequest(
    val title: String,
    val description: String = "",
    val source: String = "mobile",
    val region: String,
    val location: String = "",
    val latitude: Double? = null,
    val longitude: Double? = null,
    val species: String = "",
    val symptoms: String = "",
    @Json(name = "affected_count") val affectedCount: Int? = null,
    @Json(name = "reporter_name") val reporterName: String = "",
    @Json(name = "reporter_phone") val reporterPhone: String = "",
    @Json(name = "device_id") val deviceId: String = "",
    val photos: List<String> = emptyList(),
    @Json(name = "date_detection") val dateDetection: String? = null,
    @Json(name = "message_received") val messageReceived: String? = null,
    val category: String? = null,
    val themes: List<String>? = null,
    @Json(name = "gravity_comment") val gravityComment: String? = null,
    @Json(name = "source_type") val sourceType: String = "mobile_app",
    val arrondissement: String? = null,
    val commune: String? = null,
    @Json(name = "aire_sante") val aireSante: String? = null,
)
