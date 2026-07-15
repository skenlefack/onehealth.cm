package cm.onehealth.cohrm.data.repository

import cm.onehealth.cohrm.data.remote.ApiService
import cm.onehealth.cohrm.data.remote.dto.ActorInfo
import cm.onehealth.cohrm.data.remote.dto.DashboardData
import cm.onehealth.cohrm.data.remote.dto.FeedbackRequest
import cm.onehealth.cohrm.data.remote.dto.RumorDetail
import cm.onehealth.cohrm.data.remote.dto.RumorUpdateRequest
import cm.onehealth.cohrm.data.remote.dto.RumorsListData
import cm.onehealth.cohrm.data.remote.dto.ValidationRequest
import cm.onehealth.cohrm.domain.repository.CohrmRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CohrmRepositoryImpl @Inject constructor(
    private val apiService: ApiService,
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
        response.data ?: RumorsListData()
    }

    override suspend fun getRumorDetail(id: Int): Result<RumorDetail> = runCatching {
        val response = apiService.getRumorDetail(id)
        response.data ?: throw Exception("Rumor not found")
    }

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
        val response = apiService.validateRumor(id, ValidationRequest(decision, notes, riskAssessment, priorityChange))
        response.data ?: throw Exception("Validation failed")
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
}
