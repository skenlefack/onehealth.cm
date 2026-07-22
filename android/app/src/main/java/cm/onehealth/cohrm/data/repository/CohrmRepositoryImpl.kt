package cm.onehealth.cohrm.data.repository

import cm.onehealth.cohrm.data.local.dao.RumorDao
import cm.onehealth.cohrm.data.local.entity.RumorEntity
import cm.onehealth.cohrm.data.remote.ApiService
import cm.onehealth.cohrm.data.remote.dto.ActorInfo
import cm.onehealth.cohrm.data.remote.dto.DashboardData
import cm.onehealth.cohrm.data.remote.dto.FeedbackRequest
import cm.onehealth.cohrm.data.remote.dto.RiskAssessmentRequest
import cm.onehealth.cohrm.data.remote.dto.RumorDetail
import cm.onehealth.cohrm.data.remote.dto.RumorUpdateRequest
import cm.onehealth.cohrm.data.remote.dto.RumorsListData
import cm.onehealth.cohrm.data.remote.dto.ValidationItem
import cm.onehealth.cohrm.data.remote.dto.ValidationRequest
import cm.onehealth.cohrm.domain.repository.CohrmRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CohrmRepositoryImpl @Inject constructor(
    private val apiService: ApiService,
    private val rumorDao: RumorDao,
) : CohrmRepository {

    override suspend fun getDashboard(region: String?, period: String?): Result<DashboardData> =
        runCatching {
            val response = apiService.getDashboardStats(region, period)
            response.data ?: throw Exception("No dashboard data")
        }

    override suspend fun getRumors(
        page: Int,
        perPage: Int,
        status: String?,
        category: String?,
        region: String?,
        priority: String?,
        source: String?,
        search: String?,
    ): Result<RumorsListData> = runCatching {
        val response = apiService.getRumors(page, perPage, status, category, region, priority, source, search)
        val data = response.data ?: RumorsListData()

        // Cache page-1 results for offline viewing (no filters = main list)
        if (page == 1 && status == null && category == null && region == null &&
            priority == null && source == null && search.isNullOrBlank()
        ) {
            try {
                val entities = data.rumors.map { it.toEntity() }
                rumorDao.deleteAll()
                rumorDao.insertAll(entities)
            } catch (_: Exception) {
                // Caching failure should not break the API result
            }
        } else if (data.rumors.isNotEmpty()) {
            // Still cache individual rumors for offline detail view
            try {
                rumorDao.insertAll(data.rumors.map { it.toEntity() })
            } catch (_: Exception) {}
        }

        data
    }

    override suspend fun getRumorDetail(id: Int): Result<RumorDetail> = runCatching {
        val response = apiService.getRumorDetail(id)
        val detail = response.data ?: throw Exception("Rumor not found")

        // Cache for offline viewing
        try {
            rumorDao.insert(detail.toEntity())
        } catch (_: Exception) {}

        detail
    }

    override fun getCachedRumors(): Flow<List<RumorDetail>> =
        rumorDao.getRecent(100).map { entities ->
            entities.map { it.toDomain() }
        }

    override suspend fun getCachedRumorDetail(id: Int): RumorDetail? =
        rumorDao.getById(id)?.toDomain()

    override suspend fun updateRumor(
        id: Int,
        status: String?,
        priority: String?,
        riskLevel: String?,
        assignedTo: Int?,
    ): Result<RumorDetail> = runCatching {
        val response = apiService.updateRumor(id, RumorUpdateRequest(status, priority, riskLevel, assignedTo))
        response.data ?: throw Exception("Update failed")
    }

    override suspend fun validateRumor(
        id: Int,
        decision: String,
        notes: String?,
        riskAssessment: String?,
        priorityChange: String?,
    ): Result<RumorDetail> = runCatching {
        // Map mobile decision names to backend status values
        val backendStatus = when (decision) {
            "approved" -> "validated"
            "rejected" -> "rejected"
            "escalated" -> "escalated"
            "needs_info" -> "needs_info"
            else -> decision
        }
        val actionType = when (decision) {
            "approved" -> "validation"
            "rejected" -> "rejection"
            "escalated" -> "escalation"
            "needs_info" -> "needs_info"
            else -> "validation"
        }
        val rejectionReason = if (decision == "rejected") notes else null
        val validationNotes = if (decision != "rejected") notes else null

        val response = apiService.validateRumor(
            id,
            ValidationRequest(
                status = backendStatus,
                actionType = actionType,
                notes = validationNotes,
                rejectionReason = rejectionReason,
            ),
        )
        if (!response.success) throw Exception(response.message ?: "Validation failed")

        // Reload the rumor to get updated data
        val detail = apiService.getRumorDetail(id)
        detail.data ?: throw Exception("Could not reload rumor")
    }

    override suspend fun addFeedback(id: Int, message: String, type: String): Result<RumorDetail> =
        runCatching {
            val response = apiService.addFeedback(id, FeedbackRequest(message, type))
            response.data ?: throw Exception("Feedback failed")
        }

    override suspend fun getActors(region: String?, level: Int?): Result<List<ActorInfo>> =
        runCatching {
            val response = apiService.getActors(region, level)
            response.data
        }

    override suspend fun assessRisk(
        id: Int,
        riskLevel: String,
        riskDescription: String?,
        riskContext: String?,
        riskExposure: String?,
    ): Result<Unit> = runCatching {
        val response = apiService.assessRisk(
            id,
            RiskAssessmentRequest(riskLevel, riskDescription, riskContext, riskExposure),
        )
        if (!response.success) throw Exception(response.message ?: "Risk assessment failed")
    }

    override suspend fun deleteRumor(id: Int): Result<Unit> = runCatching {
        val response = apiService.deleteRumor(id)
        if (!response.success) throw Exception(response.message ?: "Delete failed")
        try { rumorDao.deleteById(id) } catch (_: Exception) {}
    }

    override suspend fun getValidations(id: Int): Result<List<ValidationItem>> =
        runCatching {
            val response = apiService.getValidations(id)
            response.data ?: emptyList()
        }
}

// ---- Entity <-> DTO mapping ----

private fun RumorDetail.toEntity(): RumorEntity = RumorEntity(
    id = id,
    code = code,
    title = title,
    description = description,
    category = category,
    species = species,
    status = status,
    priority = priority,
    riskLevel = riskLevel,
    source = source,
    region = region,
    department = department,
    district = district,
    latitude = latitude,
    longitude = longitude,
    symptoms = symptoms,
    affectedCount = affectedCount,
    reporterName = reporterName,
    reporterPhone = reporterPhone,
    createdAt = createdAt,
    updatedAt = updatedAt,
    assignedTo = assignedTo,
    assignedName = assignedName,
    createdByName = createdByName,
    cachedAt = System.currentTimeMillis(),
)

private fun RumorEntity.toDomain(): RumorDetail = RumorDetail(
    id = id,
    code = code,
    title = title,
    description = description,
    category = category,
    species = species,
    status = status,
    priority = priority,
    riskLevel = riskLevel,
    source = source,
    region = region,
    department = department,
    district = district,
    latitude = latitude,
    longitude = longitude,
    symptoms = symptoms,
    affectedCount = affectedCount,
    reporterName = reporterName,
    reporterPhone = reporterPhone,
    createdAt = createdAt,
    updatedAt = updatedAt,
    assignedTo = assignedTo,
    assignedName = assignedName,
    createdByName = createdByName,
)
