package cm.onehealth.cohrm.data.repository.ohwr

import cm.onehealth.cohrm.data.remote.ohwr.*
import cm.onehealth.cohrm.domain.repository.ohwr.OhwrRepository
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OhwrRepositoryImpl @Inject constructor(
    private val api: OhwrApiService,
) : OhwrRepository {

    override suspend fun getStats(): Result<OhwrStatsDto> = runCatching {
        api.getStats().data ?: throw Exception("No stats data")
    }

    override suspend fun getMarkers(types: String?): Result<List<OhwrMarkerDto>> = runCatching {
        api.getMarkers(types).data ?: emptyList()
    }

    override suspend fun getRegions(): Result<List<OhwrRegionDto>> = runCatching {
        api.getRegions().data ?: emptyList()
    }

    override suspend fun getAllConfig(): Result<OhwrConfigAllDto> = runCatching {
        api.getAllConfig().data ?: throw Exception("No config data")
    }

    override suspend fun getExperts(page: Int, limit: Int, category: String?, region: String?, search: String?): Result<OhwrPaginatedResponse<OhwrExpertDto>> = runCatching {
        api.getExperts(page, limit, category, region, search)
    }

    override suspend fun getExpertDetail(id: Int): Result<OhwrExpertDto> = runCatching {
        api.getExpertDetail(id).data ?: throw Exception("Expert not found")
    }

    override suspend fun getOrganizations(page: Int, limit: Int, type: String?, region: String?, search: String?): Result<OhwrPaginatedResponse<OhwrOrganizationDto>> = runCatching {
        api.getOrganizations(page, limit, type, region, search)
    }

    override suspend fun getMaterials(page: Int, limit: Int, type: String?, status: String?, region: String?, search: String?): Result<OhwrPaginatedResponse<OhwrMaterialDto>> = runCatching {
        api.getMaterials(page, limit, type, status, region, search)
    }

    override suspend fun getDocuments(page: Int, limit: Int, type: String?, search: String?): Result<OhwrPaginatedResponse<OhwrDocumentDto>> = runCatching {
        api.getDocuments(page, limit, type, search)
    }

    override suspend fun getDocumentDetail(id: Int): Result<OhwrDocumentDto> = runCatching {
        api.getDocumentDetail(id.toString()).data ?: throw Exception("Document not found")
    }

    override suspend fun getRecentDocuments(limit: Int): Result<List<OhwrDocumentDto>> = runCatching {
        api.getRecentDocuments(limit).data ?: emptyList()
    }

    override suspend fun getMySubmissions(): Result<List<OhwrSubmissionDto>> = runCatching {
        api.getMySubmissions().data ?: emptyList()
    }

    private fun String.toTextBody() = toRequestBody("text/plain".toMediaType())
    private fun String?.toOptionalBody() = this?.takeIf { it.isNotBlank() }?.toTextBody()

    override suspend fun submitExpert(fields: Map<String, String>): Result<Map<String, String>> = runCatching {
        api.submitExpert(
            firstName = fields["first_name"]!!.toTextBody(),
            lastName = fields["last_name"]!!.toTextBody(),
            title = fields["title"]!!.toTextBody(),
            category = fields["category"]!!.toTextBody(),
            email = fields["email"].toOptionalBody(),
            phone = fields["phone"].toOptionalBody(),
            region = fields["region"].toOptionalBody(),
            city = fields["city"].toOptionalBody(),
            photo = null,
        ).data ?: emptyMap()
    }

    override suspend fun submitOrganization(fields: Map<String, String>): Result<Map<String, String>> = runCatching {
        api.submitOrganization(
            name = fields["name"]!!.toTextBody(),
            acronym = fields["acronym"].toOptionalBody(),
            type = fields["type"].toOptionalBody(),
            description = fields["description"].toOptionalBody(),
            region = fields["region"].toOptionalBody(),
            email = fields["contact_email"].toOptionalBody(),
            logo = null,
        ).data ?: emptyMap()
    }
}
