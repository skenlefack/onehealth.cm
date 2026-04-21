package cm.onehealth.cohrm.data.remote.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class NotificationsResponse(
    val success: Boolean = false,
    val data: List<NotificationItem>? = null,
    val pagination: PaginationData? = null,
)

@JsonClass(generateAdapter = true)
data class NotificationItem(
    val id: Int = 0,
    @Json(name = "notification_type") val notificationType: String? = null,
    val status: String? = null,
    val subject: String? = null,
    @Json(name = "recipient_email") val recipientEmail: String? = null,
    @Json(name = "rumor_code") val rumorCode: String? = null,
    @Json(name = "rumor_title") val rumorTitle: String? = null,
    val channel: String? = null,
    @Json(name = "created_at") val createdAt: String? = null,
)

@JsonClass(generateAdapter = true)
data class PaginationData(
    val page: Int = 1,
    val limit: Int = 20,
    val total: Int = 0,
    val pages: Int = 1,
)
