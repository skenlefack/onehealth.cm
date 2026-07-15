package cm.onehealth.cohrm.data.remote.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class LoginRequest(
    val email: String,
    val password: String,
)

@JsonClass(generateAdapter = true)
data class LoginResponse(
    val success: Boolean,
    val data: LoginData? = null,
    val message: String? = null,
)

@JsonClass(generateAdapter = true)
data class LoginData(
    val user: LoginUser? = null,
    val actor: LoginActor? = null,
    val token: String? = null,
)

@JsonClass(generateAdapter = true)
data class LoginUser(
    val id: Int = 0,
    val name: String = "",
    val email: String = "",
    val username: String = "",
    val role: String = "",
    val avatar: String? = null,
    val permissions: List<String> = emptyList(),
)

@JsonClass(generateAdapter = true)
data class LoginActor(
    val id: Int? = null,
    val level: Int = 0,
    @Json(name = "level_label") val levelLabel: String = "",
    val type: String = "",
    val region: String = "",
    val department: String = "",
    val district: String = "",
    val organization: String = "",
    val phone: String = "",
)
