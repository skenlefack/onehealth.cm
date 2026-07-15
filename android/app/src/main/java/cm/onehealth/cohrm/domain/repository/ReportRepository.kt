package cm.onehealth.cohrm.domain.repository

import cm.onehealth.cohrm.domain.model.Report
import cm.onehealth.cohrm.domain.model.SyncStatus
import kotlinx.coroutines.flow.Flow

interface ReportRepository {
    fun getAllReports(): Flow<List<Report>>
    fun getReportsByStatus(status: SyncStatus): Flow<List<Report>>
    suspend fun getReport(id: String): Report?
    suspend fun saveReport(report: Report): String
    suspend fun submitReport(id: String): Result<String>
    suspend fun deleteReport(id: String)
    suspend fun getPendingSyncReports(): List<Report>
    suspend fun updateSyncStatus(id: String, status: SyncStatus, serverCode: String? = null)
    fun getReportCountByStatus(status: SyncStatus): Flow<Int>
}
