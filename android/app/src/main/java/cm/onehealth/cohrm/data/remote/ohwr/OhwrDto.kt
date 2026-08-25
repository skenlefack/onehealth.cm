package cm.onehealth.cohrm.data.remote.ohwr

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class OhwrApiResponse<T>(
    @Json(name = "success") val success: Boolean? = null,
    @Json(name = "data") val data: T? = null,
    @Json(name = "message") val message: String? = null,
)

@JsonClass(generateAdapter = true)
data class OhwrPaginatedResponse<T>(
    @Json(name = "success") val success: Boolean? = null,
    @Json(name = "data") val data: List<T>? = null,
    @Json(name = "pagination") val pagination: OhwrPaginationDto? = null,
    @Json(name = "message") val message: String? = null,
)

@JsonClass(generateAdapter = true)
data class OhwrPaginationDto(
    @Json(name = "page") val page: Int? = null,
    @Json(name = "limit") val limit: Int? = null,
    @Json(name = "total") val total: Int? = null,
    @Json(name = "pages") val pages: Int? = null,
)

@JsonClass(generateAdapter = true)
data class OhwrStatsDto(
    @Json(name = "humanResources") val humanResources: OhwrStatGroupDto? = null,
    @Json(name = "materialResources") val materialResources: OhwrStatGroupDto? = null,
    @Json(name = "organizations") val organizations: OhwrStatGroupDto? = null,
    @Json(name = "documents") val documents: OhwrStatGroupDto? = null,
)

@JsonClass(generateAdapter = true)
data class OhwrStatGroupDto(
    @Json(name = "total") val total: Int? = null,
    @Json(name = "byCategory") val byCategory: Map<String, Int>? = null,
    @Json(name = "byRegion") val byRegion: Map<String, Int>? = null,
    @Json(name = "byType") val byType: Map<String, Int>? = null,
)

@JsonClass(generateAdapter = true)
data class OhwrMarkerDto(
    @Json(name = "id") val id: Int,
    @Json(name = "type") val type: String,
    @Json(name = "name") val name: String,
    @Json(name = "title") val title: String? = null,
    @Json(name = "category") val category: String? = null,
    @Json(name = "status") val status: String? = null,
    @Json(name = "acronym") val acronym: String? = null,
    @Json(name = "lat") val lat: Double? = null,
    @Json(name = "lng") val lng: Double? = null,
    @Json(name = "region") val region: String? = null,
    @Json(name = "city") val city: String? = null,
    @Json(name = "photo") val photo: String? = null,
    @Json(name = "logo") val logo: String? = null,
)

@JsonClass(generateAdapter = true)
data class OhwrExpertDto(
    @Json(name = "id") val id: Int,
    @Json(name = "first_name") val firstName: String? = null,
    @Json(name = "last_name") val lastName: String? = null,
    @Json(name = "title") val title: String? = null,
    @Json(name = "category") val category: String? = null,
    @Json(name = "organization_id") val organizationId: Int? = null,
    @Json(name = "organization_name") val organizationName: String? = null,
    @Json(name = "organization_acronym") val organizationAcronym: String? = null,
    @Json(name = "email") val email: String? = null,
    @Json(name = "phone") val phone: String? = null,
    @Json(name = "photo") val photo: String? = null,
    @Json(name = "biography") val biography: String? = null,
    @Json(name = "region") val region: String? = null,
    @Json(name = "city") val city: String? = null,
    @Json(name = "years_experience") val yearsExperience: Int? = null,
    @Json(name = "is_verified") val isVerified: Int? = null,
    @Json(name = "available_for_collaboration") val availableForCollaboration: Int? = null,
    @Json(name = "expertise_summary") val expertiseSummary: String? = null,
    @Json(name = "linkedin_url") val linkedinUrl: String? = null,
    @Json(name = "publications_count") val publicationsCount: Int? = null,
    @Json(name = "projects_count") val projectsCount: Int? = null,
    @Json(name = "submission_status") val submissionStatus: String? = null,
) {
    val fullName: String get() = listOfNotNull(firstName, lastName).joinToString(" ")
}

@JsonClass(generateAdapter = true)
data class OhwrOrganizationDto(
    @Json(name = "id") val id: Int,
    @Json(name = "name") val name: String,
    @Json(name = "acronym") val acronym: String? = null,
    @Json(name = "type") val type: String? = null,
    @Json(name = "description") val description: String? = null,
    @Json(name = "mission") val mission: String? = null,
    @Json(name = "logo") val logo: String? = null,
    @Json(name = "website") val website: String? = null,
    @Json(name = "region") val region: String? = null,
    @Json(name = "city") val city: String? = null,
    @Json(name = "address") val address: String? = null,
    @Json(name = "contact_email") val contactEmail: String? = null,
    @Json(name = "contact_phone") val contactPhone: String? = null,
    @Json(name = "submission_status") val submissionStatus: String? = null,
    @Json(name = "expert_count") val expertCount: Int? = null,
) {
    val displayName: String get() = if (acronym != null) "$name ($acronym)" else name
}

@JsonClass(generateAdapter = true)
data class OhwrMaterialDto(
    @Json(name = "id") val id: Int,
    @Json(name = "name") val name: String,
    @Json(name = "type") val type: String? = null,
    @Json(name = "description") val description: String? = null,
    @Json(name = "capacity") val capacity: String? = null,
    @Json(name = "organization_name") val organizationName: String? = null,
    @Json(name = "organization_acronym") val organizationAcronym: String? = null,
    @Json(name = "region") val region: String? = null,
    @Json(name = "city") val city: String? = null,
    @Json(name = "status") val status: String? = null,
    @Json(name = "image") val image: String? = null,
    @Json(name = "contact_email") val contactEmail: String? = null,
    @Json(name = "contact_phone") val contactPhone: String? = null,
    @Json(name = "submission_status") val submissionStatus: String? = null,
)

@JsonClass(generateAdapter = true)
data class OhwrDocumentDto(
    @Json(name = "id") val id: Int,
    @Json(name = "title") val title: String,
    @Json(name = "slug") val slug: String? = null,
    @Json(name = "type") val type: String? = null,
    @Json(name = "description") val description: String? = null,
    @Json(name = "file_path") val filePath: String? = null,
    @Json(name = "file_type") val fileType: String? = null,
    @Json(name = "thumbnail") val thumbnail: String? = null,
    @Json(name = "organization_name") val organizationName: String? = null,
    @Json(name = "organization_acronym") val organizationAcronym: String? = null,
    @Json(name = "publication_date") val publicationDate: String? = null,
    @Json(name = "language") val language: String? = null,
    @Json(name = "is_featured") val isFeatured: Int? = null,
    @Json(name = "view_count") val viewCount: Int? = null,
    @Json(name = "download_count") val downloadCount: Int? = null,
    @Json(name = "access_level") val accessLevel: String? = null,
    @Json(name = "submission_status") val submissionStatus: String? = null,
)

@JsonClass(generateAdapter = true)
data class OhwrConfigAllDto(
    @Json(name = "materialTypes") val materialTypes: List<OhwrConfigItemDto>? = null,
    @Json(name = "organizationTypes") val organizationTypes: List<OhwrConfigItemDto>? = null,
    @Json(name = "documentTypes") val documentTypes: List<OhwrConfigItemDto>? = null,
    @Json(name = "expertCategories") val expertCategories: List<OhwrConfigItemDto>? = null,
)

@JsonClass(generateAdapter = true)
data class OhwrConfigItemDto(
    @Json(name = "id") val id: Int,
    @Json(name = "name") val name: String,
    @Json(name = "name_en") val nameEn: String? = null,
    @Json(name = "slug") val slug: String? = null,
    @Json(name = "description") val description: String? = null,
    @Json(name = "icon") val icon: String? = null,
    @Json(name = "color") val color: String? = null,
    @Json(name = "display_order") val displayOrder: Int? = null,
    @Json(name = "is_active") val isActive: Int? = null,
)

@JsonClass(generateAdapter = true)
data class OhwrRegionDto(
    @Json(name = "id") val id: Int,
    @Json(name = "name") val name: String,
    @Json(name = "code") val code: String? = null,
    @Json(name = "center_lat") val centerLat: String? = null,
    @Json(name = "center_lng") val centerLng: String? = null,
)

@JsonClass(generateAdapter = true)
data class OhwrSubmissionDto(
    val id: Int,
    @Json(name = "resource_type") val resourceType: String? = null,
    @Json(name = "resource_name") val resourceName: String? = null,
    @Json(name = "submission_status") val submissionStatus: String? = null,
    @Json(name = "submitted_at") val submittedAt: String? = null,
    @Json(name = "rejection_reason") val rejectionReason: String? = null,
)
