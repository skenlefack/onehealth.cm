package cm.onehealth.cohrm.domain.repository

import cm.onehealth.cohrm.data.remote.dto.DashboardData
import cm.onehealth.cohrm.data.remote.dto.RumorDetail
import cm.onehealth.cohrm.data.remote.dto.RumorsListData
import cm.onehealth.cohrm.data.remote.dto.ActorInfo

interface CohrmRepository {
    suspend fun getDashboard(region: String? = null, period: String? = null): Result<DashboardData>
    suspend fun getRumors(
        page: Int = 1,
        perPage: Int = 20,
        status: String? = null,
        category: String? = null,
        region: String? = null,
        priority: String? = null,
        source: String? = null,
        search: String? = null,
    ): Result<RumorsListData>
    suspend fun getRumorDetail(id: Int): Result<RumorDetail>
    suspend fun updateRumor(id: Int, status: String? = null, priority: String? = null, riskLevel: String? = null, assignedTo: Int? = null): Result<RumorDetail>
    suspend fun validateRumor(id: Int, decision: String, notes: String? = null, riskAssessment: String? = null, priorityChange: String? = null): Result<RumorDetail>
    suspend fun addFeedback(id: Int, message: String, type: String = "comment"): Result<RumorDetail>
    suspend fun getActors(region: String? = null, level: Int? = null): Result<List<ActorInfo>>
}
