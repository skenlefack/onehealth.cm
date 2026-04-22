package cm.onehealth.cohrm.data.repository

import cm.onehealth.cohrm.data.local.dao.PhotoDao
import cm.onehealth.cohrm.data.local.dao.ReportDao
import cm.onehealth.cohrm.data.local.entity.PhotoEntity
import cm.onehealth.cohrm.data.local.entity.ReportEntity
import cm.onehealth.cohrm.data.remote.ApiService
import cm.onehealth.cohrm.data.remote.dto.ReportRequest
import cm.onehealth.cohrm.domain.model.Photo
import cm.onehealth.cohrm.domain.model.Report
import cm.onehealth.cohrm.domain.model.SyncStatus
import cm.onehealth.cohrm.domain.model.UploadStatus
import cm.onehealth.cohrm.domain.repository.ReportRepository
import com.squareup.moshi.Moshi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ReportRepositoryImpl @Inject constructor(
    private val reportDao: ReportDao,
    private val photoDao: PhotoDao,
    private val apiService: ApiService,
    private val moshi: Moshi,
) : ReportRepository {

    override fun getAllReports(): Flow<List<Report>> =
        reportDao.getAll().map { entities ->
            entities.map { it.toDomain(photoDao.getByReportId(it.id)) }
        }

    override fun getReportsByStatus(status: SyncStatus): Flow<List<Report>> =
        reportDao.getByStatus(status.name).map { entities ->
            entities.map { it.toDomain(photoDao.getByReportId(it.id)) }
        }

    override suspend fun getReport(id: String): Report? =
        reportDao.getById(id)?.let { entity ->
            entity.toDomain(photoDao.getByReportId(id))
        }

    override suspend fun saveReport(report: Report): String {
        val entity = report.toEntity()
        reportDao.insert(entity)
        photoDao.deleteByReportId(report.id)
        if (report.photos.isNotEmpty()) {
            photoDao.insertAll(report.photos.map { it.toEntity(report.id) })
        }
        return report.id
    }

    override suspend fun submitReport(id: String): Result<String> {
        val report = reportDao.getById(id) ?: return Result.failure(Exception("Report not found"))
        reportDao.updateSyncStatus(id, SyncStatus.SYNCING.name, null)

        return try {
            val request = ReportRequest(
                title = report.title,
                description = report.description,
                region = report.region,
                location = "${report.department}, ${report.district}",
                latitude = report.latitude,
                longitude = report.longitude,
                species = report.species,
                symptoms = report.symptoms,
                affectedCount = report.affectedCount,
                reporterName = report.reporterName,
                reporterPhone = report.reporterPhone,
                deviceId = report.deviceId,
                dateDetection = report.dateDetection.ifBlank { null },
                messageReceived = report.messageReceived.ifBlank { null },
                category = report.category.ifBlank { null },
                themes = report.themes.ifBlank { null }?.split(",")?.filter { it.isNotBlank() },
                gravityComment = report.gravityComment.ifBlank { null },
                sourceType = report.sourceType.ifBlank { "mobile_app" },
                arrondissement = report.arrondissement.ifBlank { null },
                commune = report.commune.ifBlank { null },
                aireSante = report.aireSante.ifBlank { null },
            )

            // Check for photos and use multipart upload if present
            val photos = photoDao.getByReportId(id)
            val photoParts = mutableListOf<MultipartBody.Part>()
            for (photo in photos) {
                val file = File(photo.localPath)
                if (file.exists()) {
                    val requestBody = file.asRequestBody("image/jpeg".toMediaTypeOrNull())
                    val part = MultipartBody.Part.createFormData("photos", file.name, requestBody)
                    photoParts.add(part)
                    photoDao.updateUploadStatus(photo.id, UploadStatus.UPLOADING.name)
                }
            }

            val response = if (photoParts.isNotEmpty()) {
                // Use multipart endpoint with photos
                val adapter = moshi.adapter(ReportRequest::class.java)
                val jsonData = adapter.toJson(request)
                    .toRequestBody("application/json".toMediaTypeOrNull())
                apiService.submitReportWithPhotos(jsonData, photoParts)
            } else {
                // Use JSON-only endpoint
                apiService.submitReport(request)
            }

            if (response.success) {
                val code = response.data?.code ?: ""
                reportDao.updateSyncStatus(id, SyncStatus.SYNCED.name, code)
                // Mark all photos as uploaded
                for (photo in photos) {
                    photoDao.updateUploadStatus(photo.id, UploadStatus.UPLOADED.name)
                }
                Result.success(code)
            } else {
                reportDao.updateSyncStatus(id, SyncStatus.ERROR.name, null)
                for (photo in photos) {
                    photoDao.updateUploadStatus(photo.id, UploadStatus.FAILED.name)
                }
                Result.failure(Exception(response.message ?: "Unknown error"))
            }
        } catch (e: Exception) {
            reportDao.updateSyncStatus(id, SyncStatus.ERROR.name, null)
            // Mark photos as failed
            val photos = photoDao.getByReportId(id)
            for (photo in photos) {
                photoDao.updateUploadStatus(photo.id, UploadStatus.FAILED.name)
            }
            Result.failure(e)
        }
    }

    override suspend fun deleteReport(id: String) {
        photoDao.deleteByReportId(id)
        reportDao.delete(id)
    }

    override suspend fun getPendingSyncReports(): List<Report> =
        reportDao.getPendingSync().map { it.toDomain(photoDao.getByReportId(it.id)) }

    override suspend fun updateSyncStatus(id: String, status: SyncStatus, serverCode: String?) {
        reportDao.updateSyncStatus(id, status.name, serverCode)
    }

    override fun getReportCountByStatus(status: SyncStatus): Flow<Int> =
        reportDao.countByStatus(status.name)
}

private fun ReportEntity.toDomain(photos: List<PhotoEntity>): Report = Report(
    id = id,
    title = title,
    description = description,
    category = category,
    species = species,
    region = region,
    department = department,
    district = district,
    latitude = latitude,
    longitude = longitude,
    symptoms = if (symptoms.isBlank()) emptyList() else symptoms.split(","),
    affectedCount = affectedCount,
    reporterName = reporterName,
    reporterPhone = reporterPhone,
    deviceId = deviceId,
    dateDetection = dateDetection,
    messageReceived = messageReceived,
    themes = if (themes.isBlank()) emptyList() else themes.split(","),
    gravityComment = gravityComment,
    sourceType = sourceType,
    arrondissement = arrondissement,
    commune = commune,
    aireSante = aireSante,
    syncStatus = try { SyncStatus.valueOf(syncStatus) } catch (_: Exception) { SyncStatus.DRAFT },
    serverCode = serverCode,
    photos = photos.map { it.toDomain() },
    createdAt = java.util.Date(createdAt),
    updatedAt = java.util.Date(updatedAt),
)

private fun PhotoEntity.toDomain(): Photo = Photo(
    id = id,
    reportId = reportId,
    localPath = localPath,
    remoteUrl = remoteUrl,
    caption = caption,
    uploadStatus = try { UploadStatus.valueOf(uploadStatus) } catch (_: Exception) { UploadStatus.PENDING },
)

private fun Report.toEntity(): ReportEntity = ReportEntity(
    id = id,
    title = title,
    description = description,
    category = category,
    species = species,
    region = region,
    department = department,
    district = district,
    latitude = latitude,
    longitude = longitude,
    symptoms = symptoms.joinToString(","),
    affectedCount = affectedCount,
    reporterName = reporterName,
    reporterPhone = reporterPhone,
    deviceId = deviceId,
    dateDetection = dateDetection,
    messageReceived = messageReceived,
    themes = themes.joinToString(","),
    gravityComment = gravityComment,
    sourceType = sourceType,
    arrondissement = arrondissement,
    commune = commune,
    aireSante = aireSante,
    syncStatus = syncStatus.name,
    serverCode = serverCode,
    createdAt = createdAt.time,
    updatedAt = updatedAt.time,
)

private fun Photo.toEntity(reportId: String): PhotoEntity = PhotoEntity(
    id = id,
    reportId = reportId,
    localPath = localPath,
    remoteUrl = remoteUrl,
    caption = caption,
    uploadStatus = uploadStatus.name,
)
