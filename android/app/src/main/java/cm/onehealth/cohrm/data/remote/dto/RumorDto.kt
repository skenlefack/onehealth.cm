package cm.onehealth.cohrm.data.remote.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class RumorsListResponse(
    val success: Boolean = false,
    val data: RumorsListData? = null,
)

@JsonClass(generateAdapter = true)
data class RumorsListData(
    val rumors: List<RumorDetail> = emptyList(),
    val total: Int = 0,
    val page: Int = 1,
    @Json(name = "per_page") val perPage: Int = 20,
    @Json(name = "total_pages") val totalPages: Int = 1,
)

@JsonClass(generateAdapter = true)
data class RumorDetailResponse(
    val success: Boolean = false,
    val data: RumorDetail? = null,
)

@JsonClass(generateAdapter = true)
data class RumorDetail(
    val id: Int = 0,
    val code: String = "",
    val title: String = "",
    val description: String = "",
    val category: String = "",
    val species: String? = null,
    val status: String = "pending",
    val priority: String = "medium",
    @Json(name = "risk_level") val riskLevel: String = "unknown",
    val source: String = "mobile",
    val region: String = "",
    val department: String = "",
    val district: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val symptoms: String? = null,
    @Json(name = "affected_count") val affectedCount: Int? = null,
    @Json(name = "reporter_name") val reporterName: String? = null,
    @Json(name = "reporter_phone") val reporterPhone: String? = null,
    @Json(name = "reporter_email") val reporterEmail: String? = null,
    @Json(name = "device_id") val deviceId: String? = null,
    @Json(name = "assigned_to") val assignedTo: Int? = null,
    @Json(name = "assigned_name") val assignedName: String? = null,
    @Json(name = "created_at") val createdAt: String = "",
    @Json(name = "updated_at") val updatedAt: String? = null,
    @Json(name = "closed_at") val closedAt: String? = null,
    val photos: List<RumorPhoto> = emptyList(),
    val validations: List<ValidationItem> = emptyList(),
    val feedback: List<FeedbackItem> = emptyList(),
    @Json(name = "created_by_name") val createdByName: String? = null,
)

@JsonClass(generateAdapter = true)
data class RumorPhoto(
    val id: Int = 0,
    val url: String = "",
    @Json(name = "thumbnail_url") val thumbnailUrl: String? = null,
    val caption: String? = null,
)

@JsonClass(generateAdapter = true)
data class ValidationItem(
    val id: Int = 0,
    @Json(name = "actor_id") val actorId: Int = 0,
    @Json(name = "actor_name") val actorName: String = "",
    @Json(name = "actor_level") val actorLevel: Int = 0,
    @Json(name = "actor_level_label") val actorLevelLabel: String = "",
    val decision: String = "",
    val notes: String? = null,
    @Json(name = "risk_assessment") val riskAssessment: String? = null,
    @Json(name = "priority_change") val priorityChange: String? = null,
    @Json(name = "created_at") val createdAt: String = "",
)

@JsonClass(generateAdapter = true)
data class FeedbackItem(
    val id: Int = 0,
    @Json(name = "user_name") val userName: String = "",
    val message: String = "",
    val type: String = "comment",
    @Json(name = "created_at") val createdAt: String = "",
)

@JsonClass(generateAdapter = true)
data class ValidationRequest(
    val status: String,
    @Json(name = "action_type") val actionType: String = "validation",
    val notes: String? = null,
    @Json(name = "rejection_reason") val rejectionReason: String? = null,
)

@JsonClass(generateAdapter = true)
data class FeedbackRequest(
    val message: String,
    val type: String = "comment",
)

@JsonClass(generateAdapter = true)
data class RumorUpdateRequest(
    val status: String? = null,
    val priority: String? = null,
    @Json(name = "risk_level") val riskLevel: String? = null,
    @Json(name = "assigned_to") val assignedTo: Int? = null,
)

@JsonClass(generateAdapter = true)
data class RiskAssessmentRequest(
    @Json(name = "risk_level") val riskLevel: String,
    @Json(name = "risk_description") val riskDescription: String? = null,
    @Json(name = "risk_context") val riskContext: String? = null,
    @Json(name = "risk_exposure") val riskExposure: String? = null,
)

@JsonClass(generateAdapter = true)
data class ValidationsResponse(
    val success: Boolean = false,
    val data: List<ValidationItem>? = null,
)

@JsonClass(generateAdapter = true)
data class ActorsResponse(
    val success: Boolean = false,
    val data: List<ActorInfo> = emptyList(),
)

@JsonClass(generateAdapter = true)
data class ActorInfo(
    val id: Int = 0,
    @Json(name = "user_id") val userId: Int = 0,
    val name: String = "",
    val email: String = "",
    val level: Int = 0,
    @Json(name = "level_label") val levelLabel: String = "",
    val type: String = "",
    val region: String = "",
    val department: String = "",
    val district: String? = null,
    val organization: String = "",
    val phone: String = "",
    val active: Boolean = true,
)
