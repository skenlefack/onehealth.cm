package cm.onehealth.cohrm.data.remote.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class SmsCodesResponse(
    val success: Boolean = false,
    val data: List<SmsCodeDetailDto>? = null,
)

@JsonClass(generateAdapter = true)
data class SmsCodeDetailDto(
    val id: Int,
    val code: String = "",
    val category: String? = null,
    val description: String? = null,
    @Json(name = "created_at") val createdAt: String? = null,
)

@JsonClass(generateAdapter = true)
data class SmsLogsResponse(
    val success: Boolean = false,
    val data: List<SmsLogDto>? = null,
)

@JsonClass(generateAdapter = true)
data class SmsLogDto(
    val id: Int,
    val sender: String? = null,
    val message: String? = null,
    val status: String? = null,
    @Json(name = "decoded_data") val decodedData: String? = null,
    @Json(name = "created_at") val createdAt: String? = null,
)

@JsonClass(generateAdapter = true)
data class SmsDecodeRequest(val message: String)

@JsonClass(generateAdapter = true)
data class SmsDecodeResponse(
    val success: Boolean = false,
    val data: SmsDecodedDto? = null,
)

@JsonClass(generateAdapter = true)
data class SmsDecodedDto(
    val code: String? = null,
    val localite: String? = null,
    val symptomes: String? = null,
    val espece: String? = null,
    val nombre: String? = null,
    val details: String? = null,
)

@JsonClass(generateAdapter = true)
data class SmsCodeCreateRequest(
    val code: String,
    val category: String,
    val description: String? = null,
)
