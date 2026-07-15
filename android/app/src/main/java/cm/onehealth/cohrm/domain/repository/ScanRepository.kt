package cm.onehealth.cohrm.domain.repository

import cm.onehealth.cohrm.data.local.entity.ScanEntity
import cm.onehealth.cohrm.data.local.entity.ScanResultEntity
import cm.onehealth.cohrm.data.remote.dto.ScanDetail
import cm.onehealth.cohrm.data.remote.dto.ScanSummary
import kotlinx.coroutines.flow.Flow

interface ScanRepository {
    suspend fun runScan(source: String = "all", keywords: List<String>? = null): Result<Int>
    suspend fun getScanHistory(page: Int = 1): Result<List<ScanSummary>>
    suspend fun getScanDetail(id: Int): Result<ScanDetail>
    fun getCachedScans(): Flow<List<ScanEntity>>
    fun getCachedResults(scanId: Int): Flow<List<ScanResultEntity>>
}
