package cm.onehealth.cohrm.data.repository

import cm.onehealth.cohrm.data.local.dao.ScanDao
import cm.onehealth.cohrm.data.local.entity.ScanEntity
import cm.onehealth.cohrm.data.local.entity.ScanResultEntity
import cm.onehealth.cohrm.data.remote.ApiService
import cm.onehealth.cohrm.data.remote.dto.ScanDetail
import cm.onehealth.cohrm.data.remote.dto.ConvertRequest
import cm.onehealth.cohrm.data.remote.dto.ReviewRequest
import cm.onehealth.cohrm.data.remote.dto.ScanRunRequest
import cm.onehealth.cohrm.data.remote.dto.ScanSummary
import cm.onehealth.cohrm.data.remote.dto.ScannerResultItem
import cm.onehealth.cohrm.domain.repository.ScanRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ScanRepositoryImpl @Inject constructor(
    private val apiService: ApiService,
    private val scanDao: ScanDao,
) : ScanRepository {

    override suspend fun runScan(source: String, keywords: List<String>?): Result<Int> =
        runCatching {
            val response = apiService.runScan(ScanRunRequest(source, keywords))
            if (response.success && response.data != null) {
                response.data.scanId
            } else {
                throw Exception(response.message ?: "Scan failed")
            }
        }

    override suspend fun getScanHistory(page: Int): Result<List<ScanSummary>> =
        runCatching {
            val response = apiService.getScanHistory(page)
            val scans = response.data
            // Cache locally
            scanDao.insertScans(scans.map { it.toEntity() })
            scans
        }

    override suspend fun getScanDetail(id: Int): Result<ScanDetail> =
        runCatching {
            val response = apiService.getScanDetail(id)
            val detail = response.data ?: throw Exception("Scan not found")
            // Cache scan + results
            scanDao.insertScan(ScanEntity(
                id = detail.id, source = detail.source, status = detail.status,
                keywords = detail.keywordsList().joinToString(","),
                itemsScanned = detail.itemsScanned, rumorsFound = detail.rumorsFound,
                duration = detail.duration ?: 0,
                createdAt = detail.createdAt ?: "", completedAt = detail.completedAt ?: "",
            ))
            scanDao.insertResults(detail.results.map { r ->
                ScanResultEntity(
                    id = r.id, scanId = id, title = r.title ?: "", content = r.content ?: "",
                    url = r.url ?: "", source = r.source ?: "", author = r.author ?: "",
                    relevanceScore = r.relevanceScore ?: 0.0, status = r.status,
                    matchedKeywords = r.matchedKeywordsList().joinToString(","),
                )
            })
            detail
        }

    override fun getCachedScans(): Flow<List<ScanEntity>> = scanDao.getAllScans()

    override fun getCachedResults(scanId: Int): Flow<List<ScanResultEntity>> =
        scanDao.getResultsForScan(scanId)

    override suspend fun getScannerResults(page: Int, limit: Int, status: String?): Result<List<ScannerResultItem>> =
        runCatching {
            val response = apiService.getScannerResults(page, limit, status)
            response.data ?: emptyList()
        }

    override suspend fun reviewScanResult(id: Int, status: String): Result<Unit> =
        runCatching {
            val response = apiService.reviewScanResult(id, ReviewRequest(status))
            if (!response.success) throw Exception(response.message ?: "Review failed")
        }

    override suspend fun convertScanResult(id: Int, title: String?, description: String?): Result<Unit> =
        runCatching {
            val response = apiService.convertScanResult(id, ConvertRequest(title, description))
            if (!response.success) throw Exception(response.message ?: "Conversion failed")
        }
}

private fun ScanSummary.toEntity(): ScanEntity = ScanEntity(
    id = id, source = source, status = status,
    keywords = keywordsList().joinToString(","),
    itemsScanned = itemsScanned, rumorsFound = rumorsFound,
    duration = duration ?: 0,
    createdAt = createdAt ?: "", completedAt = completedAt ?: "",
)
