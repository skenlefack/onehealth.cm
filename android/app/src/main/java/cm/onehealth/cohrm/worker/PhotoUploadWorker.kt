package cm.onehealth.cohrm.worker

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.BackoffPolicy
import androidx.work.CoroutineWorker
import androidx.work.Data
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import cm.onehealth.cohrm.data.local.dao.PhotoDao
import cm.onehealth.cohrm.data.local.dao.ReportDao
import cm.onehealth.cohrm.data.remote.ApiService
import cm.onehealth.cohrm.data.remote.dto.ReportRequest
import cm.onehealth.cohrm.domain.model.SyncStatus
import cm.onehealth.cohrm.domain.model.UploadStatus
import com.squareup.moshi.Moshi
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import java.util.concurrent.TimeUnit

@HiltWorker
class PhotoUploadWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val reportDao: ReportDao,
    private val photoDao: PhotoDao,
    private val apiService: ApiService,
    private val moshi: Moshi,
) : CoroutineWorker(context, params) {

    companion object {
        const val KEY_REPORT_ID = "report_id"
        private const val MAX_RETRIES = 5

        fun enqueue(context: Context, reportId: String) {
            val request = OneTimeWorkRequestBuilder<PhotoUploadWorker>()
                .setInputData(Data.Builder().putString(KEY_REPORT_ID, reportId).build())
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
                .build()
            WorkManager.getInstance(context).enqueue(request)
        }
    }

    override suspend fun doWork(): Result {
        if (runAttemptCount >= MAX_RETRIES) return Result.failure()

        val reportId = inputData.getString(KEY_REPORT_ID) ?: return Result.failure()
        val report = reportDao.getById(reportId) ?: return Result.failure()

        val photos = photoDao.getByReportId(reportId)
        val pendingPhotos = photos.filter {
            it.uploadStatus == UploadStatus.PENDING.name || it.uploadStatus == UploadStatus.FAILED.name
        }
        if (pendingPhotos.isEmpty()) return Result.success()

        return try {
            val photoParts = mutableListOf<MultipartBody.Part>()
            for (photo in pendingPhotos) {
                val file = File(photo.localPath)
                if (file.exists()) {
                    val requestBody = file.asRequestBody("image/jpeg".toMediaTypeOrNull())
                    val part = MultipartBody.Part.createFormData("photos", file.name, requestBody)
                    photoParts.add(part)
                    photoDao.updateUploadStatus(photo.id, UploadStatus.UPLOADING.name)
                }
            }

            if (photoParts.isEmpty()) return Result.success()

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
                category = report.category.ifBlank { null },
                sourceType = report.sourceType.ifBlank { "mobile_app" },
            )

            val adapter = moshi.adapter(ReportRequest::class.java)
            val jsonData = adapter.toJson(request)
                .toRequestBody("application/json".toMediaTypeOrNull())

            val response = apiService.submitReportWithPhotos(jsonData, photoParts)
            if (response.success) {
                for (photo in pendingPhotos) {
                    photoDao.updateUploadStatus(photo.id, UploadStatus.UPLOADED.name)
                }
                val code = response.data?.code ?: ""
                reportDao.updateSyncStatus(reportId, SyncStatus.SYNCED.name, code)
                Result.success()
            } else {
                for (photo in pendingPhotos) {
                    photoDao.updateUploadStatus(photo.id, UploadStatus.FAILED.name)
                }
                Result.retry()
            }
        } catch (e: Exception) {
            for (photo in pendingPhotos) {
                photoDao.updateUploadStatus(photo.id, UploadStatus.FAILED.name)
            }
            Result.retry()
        }
    }
}
