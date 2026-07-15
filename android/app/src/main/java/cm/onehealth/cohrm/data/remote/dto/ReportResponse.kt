package cm.onehealth.cohrm.data.remote.dto

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class ReportResponse(
    val success: Boolean,
    val message: String? = null,
    val data: ReportResponseData? = null,
)

@JsonClass(generateAdapter = true)
data class ReportResponseData(
    val id: Int? = null,
    val code: String? = null,
    @Suppress("PropertyName")
    val rumor_id: Int? = null,
)
