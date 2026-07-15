package cm.onehealth.cohrm.domain.repository

import cm.onehealth.cohrm.data.local.entity.ScanEntity
import cm.onehealth.cohrm.data.local.entity.ScanResultEntity
import cm.onehealth.cohrm.data.remote.dto.ScanDetail
import cm.onehealth.cohrm.data.remote.dto.ScanSummary
import cm.onehealth.cohrm.data.remote.dto.ScannerResultItem
import kotlinx.coroutines.flow.Flow

interface ScanRepository {
    suspend fun runScan(source: String = "all", keywords: List<String>? = null): Result<Int>
    suspend fun getScanHistory(page: Int = 1): Result<List<ScanSummary>>
    suspend fun getScanDetail(id: Int): Result<ScanDetail>
    fun getCachedScans(): Flow<List<ScanEntity>>
    fun getCachedResults(scanId: Int): Flow<List<ScanResultEntity>>
    suspend fun getScannerResults(page: Int = 1, limit: Int = 20, status: String? = null): Result<List<ScannerResultItem>>
    suspend fun reviewScanResult(id: Int, status: String): Result<Unit>
    suspend fun convertScanResult(id: Int, title: String? = null, description: String? = null): Result<Unit>
}
