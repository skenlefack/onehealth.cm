package cm.onehealth.cohrm.data.remote.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class SyncResponse(
    val success: Boolean,
    val data: SyncData? = null,
)

@JsonClass(generateAdapter = true)
data class SyncData(
    @Json(name = "sms_codes") val smsCodes: List<SmsCodeDto> = emptyList(),
    val regions: List<RegionDto> = emptyList(),
    @Json(name = "sync_timestamp") val syncTimestamp: String? = null,
)

@JsonClass(generateAdapter = true)
data class SmsCodeDto(
    val code: String,
    @Json(name = "label_fr") val labelFr: String = "",
    @Json(name = "label_en") val labelEn: String = "",
    val category: String = "",
)

@JsonClass(generateAdapter = true)
data class RegionDto(
    val code: String,
    val name: String = "",
)
