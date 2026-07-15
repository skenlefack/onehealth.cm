package cm.onehealth.cohrm.data.remote.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class NotificationPrefsResponse(
    val success: Boolean,
    val data: NotificationPrefs? = null,
)

@JsonClass(generateAdapter = true)
data class NotificationPrefs(
    @Json(name = "notify_new_rumor") val notifyNewRumor: Boolean? = true,
    @Json(name = "notify_escalation") val notifyEscalation: Boolean? = true,
    @Json(name = "notify_validation") val notifyValidation: Boolean? = true,
    @Json(name = "notify_rejection") val notifyRejection: Boolean? = true,
    @Json(name = "notify_risk_assessment") val notifyRiskAssessment: Boolean? = true,
    @Json(name = "notify_reminder") val notifyReminder: Boolean? = true,
    @Json(name = "notify_feedback") val notifyFeedback: Boolean? = true,
    @Json(name = "prefer_email") val preferEmail: Boolean? = true,
    @Json(name = "prefer_sms") val preferSms: Boolean? = false,
    @Json(name = "prefer_push") val preferPush: Boolean? = false,
)

@JsonClass(generateAdapter = true)
data class NotificationPrefsUpdate(
    @Json(name = "notify_new_rumor") val notifyNewRumor: Boolean? = null,
    @Json(name = "notify_escalation") val notifyEscalation: Boolean? = null,
    @Json(name = "notify_validation") val notifyValidation: Boolean? = null,
    @Json(name = "notify_rejection") val notifyRejection: Boolean? = null,
    @Json(name = "notify_risk_assessment") val notifyRiskAssessment: Boolean? = null,
    @Json(name = "notify_reminder") val notifyReminder: Boolean? = null,
    @Json(name = "notify_feedback") val notifyFeedback: Boolean? = null,
    @Json(name = "prefer_email") val preferEmail: Boolean? = null,
    @Json(name = "prefer_sms") val preferSms: Boolean? = null,
    @Json(name = "prefer_push") val preferPush: Boolean? = null,
)
