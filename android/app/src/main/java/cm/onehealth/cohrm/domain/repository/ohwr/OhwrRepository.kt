package cm.onehealth.cohrm.domain.repository.ohwr

import cm.onehealth.cohrm.data.remote.ohwr.*

interface OhwrRepository {
    suspend fun getStats(): Result<OhwrStatsDto>
    suspend fun getMarkers(types: String? = null): Result<List<OhwrMarkerDto>>
    suspend fun getRegions(): Result<List<OhwrRegionDto>>
    suspend fun getAllConfig(): Result<OhwrConfigAllDto>
    suspend fun getExperts(page: Int = 1, limit: Int = 20, category: String? = null, region: String? = null, search: String? = null): Result<OhwrPaginatedResponse<OhwrExpertDto>>
    suspend fun getExpertDetail(id: Int): Result<OhwrExpertDto>
    suspend fun getOrganizations(page: Int = 1, limit: Int = 20, type: String? = null, region: String? = null, search: String? = null): Result<OhwrPaginatedResponse<OhwrOrganizationDto>>
    suspend fun getMaterials(page: Int = 1, limit: Int = 20, type: String? = null, status: String? = null, region: String? = null, search: String? = null): Result<OhwrPaginatedResponse<OhwrMaterialDto>>
    suspend fun getDocuments(page: Int = 1, limit: Int = 20, type: String? = null, search: String? = null): Result<OhwrPaginatedResponse<OhwrDocumentDto>>
    suspend fun getDocumentDetail(id: Int): Result<OhwrDocumentDto>
    suspend fun getRecentDocuments(limit: Int = 10): Result<List<OhwrDocumentDto>>
    suspend fun getMySubmissions(): Result<List<OhwrSubmissionDto>>
    suspend fun submitExpert(fields: Map<String, String>): Result<Map<String, String>>
    suspend fun submitOrganization(fields: Map<String, String>): Result<Map<String, String>>
}
