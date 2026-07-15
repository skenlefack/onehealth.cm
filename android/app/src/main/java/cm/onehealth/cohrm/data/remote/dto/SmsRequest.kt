package cm.onehealth.cohrm.data.remote.dto

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class SmsRequest(
    val from: String = "",
    val text: String,
    val timestamp: String? = null,
)
