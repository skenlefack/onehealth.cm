package cm.onehealth.cohrm.worker

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import cm.onehealth.cohrm.CohrmApp
import cm.onehealth.cohrm.MainActivity
import cm.onehealth.cohrm.R
import cm.onehealth.cohrm.data.local.dao.ScanDao
import cm.onehealth.cohrm.data.local.entity.ScanEntity
import cm.onehealth.cohrm.data.local.entity.ScanResultEntity
import cm.onehealth.cohrm.data.preferences.ScanPreferences
import cm.onehealth.cohrm.data.remote.ApiService
import cm.onehealth.cohrm.data.remote.dto.ScanRunRequest
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first

@HiltWorker
class ScanScheduledWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val apiService: ApiService,
    private val scanDao: ScanDao,
    private val dataStore: DataStore<Preferences>,
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            val prefs = dataStore.data.first()
            val source = prefs[ScanPreferences.SCAN_SOURCE] ?: "all"
            val keywordsStr = prefs[ScanPreferences.SCAN_KEYWORDS] ?: ""
            val keywords = keywordsStr.split(",").map { it.trim() }.filter { it.isNotEmpty() }.ifEmpty { null }

            // Launch scan
            val response = apiService.runScan(ScanRunRequest(source, keywords))
            if (!response.success || response.data == null) {
                return if (runAttemptCount < 3) Result.retry() else Result.failure()
            }

            val scanId = response.data.scanId

            // Poll for completion (max 60s)
            repeat(12) {
                delay(5000)
                try {
                    val detail = apiService.getScanDetail(scanId)
                    val data = detail.data ?: return@repeat
                    if (data.status in listOf("completed", "failed", "partial")) {
                        // Cache results locally
                        scanDao.insertScan(
                            ScanEntity(
                                id = data.id,
                                source = data.source,
                                status = data.status,
                                keywords = data.keywordsList().joinToString(","),
                                itemsScanned = data.itemsScanned,
                                rumorsFound = data.rumorsFound,
                                duration = data.duration ?: 0,
                                createdAt = data.createdAt ?: "",
                                completedAt = data.completedAt ?: "",
                            ),
                        )
                        scanDao.insertResults(
                            data.results.map { r ->
                                ScanResultEntity(
                                    id = r.id,
                                    scanId = scanId,
                                    title = r.title ?: "",
                                    content = r.content ?: "",
                                    url = r.url ?: "",
                                    source = r.source ?: "",
                                    author = r.author ?: "",
                                    relevanceScore = r.relevanceScore ?: 0.0,
                                    status = r.status,
                                    matchedKeywords = r.matchedKeywords?.joinToString(",") ?: "",
                                )
                            },
                        )

                        // Notify if rumors found
                        if (data.rumorsFound > 0) {
                            showNotification(data.rumorsFound)
                        }
                        return Result.success()
                    }
                } catch (_: Exception) {
                    // Continue polling
                }
            }

            Result.success()
        } catch (e: Exception) {
            if (runAttemptCount < 3) Result.retry() else Result.failure()
        }
    }

    private fun showNotification(rumorsFound: Int) {
        try {
            val intent = Intent(applicationContext, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            }
            val pendingIntent = PendingIntent.getActivity(
                applicationContext,
                0,
                intent,
                PendingIntent.FLAG_IMMUTABLE,
            )

            val notification = NotificationCompat.Builder(applicationContext, CohrmApp.SCAN_CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_launcher_foreground)
                .setContentTitle(applicationContext.getString(R.string.scan_completed_title))
                .setContentText(applicationContext.getString(R.string.scan_completed_text, rumorsFound))
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true)
                .build()

            NotificationManagerCompat.from(applicationContext).notify(NOTIFICATION_ID, notification)
        } catch (_: SecurityException) {
            // POST_NOTIFICATIONS permission not granted
        }
    }

    companion object {
        const val WORK_NAME = "cohrm_scheduled_scan"
        private const val NOTIFICATION_ID = 2001
    }
}
