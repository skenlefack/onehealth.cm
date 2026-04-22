package cm.onehealth.cohrm.data.remote.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class ProfileUpdateRequest(
    val name: String,
    val email: String,
    val phone: String? = null,
    val organization: String? = null,
    val region: String? = null,
)

@JsonClass(generateAdapter = true)
data class ProfileResponse(
    val success: Boolean,
    val message: String? = null,
)

@JsonClass(generateAdapter = true)
data class ChangePasswordRequest(
    @Json(name = "current_password") val currentPassword: String,
    @Json(name = "new_password") val newPassword: String,
)

@JsonClass(generateAdapter = true)
data class GenericResponse(
    val success: Boolean,
    val message: String? = null,
)
