package cm.onehealth.cohrm.data.remote.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class DeviceRegistrationRequest(
    @Json(name = "fcm_token") val fcmToken: String,
    @Json(name = "device_id") val deviceId: String,
    val platform: String = "android",
)
