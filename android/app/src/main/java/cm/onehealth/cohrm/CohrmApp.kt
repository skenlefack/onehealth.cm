package cm.onehealth.cohrm

import android.app.Application
import android.content.Context
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import androidx.work.BackoffPolicy
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import cm.onehealth.cohrm.worker.SyncWorker
import dagger.hilt.android.HiltAndroidApp
import java.io.File
import java.io.PrintWriter
import java.io.StringWriter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.TimeUnit
import javax.inject.Inject

@HiltAndroidApp
class CohrmApp : Application(), Configuration.Provider {

    @Inject
    lateinit var workerFactory: HiltWorkerFactory

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()

        // Global crash handler - saves crash to file for visual display
        val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            android.util.Log.e("CohrmApp", "UNCAUGHT EXCEPTION on ${thread.name}", throwable)
            saveCrashLog(throwable)
            defaultHandler?.uncaughtException(thread, throwable)
        }

        scheduleSyncWorker()
    }

    private fun saveCrashLog(throwable: Throwable) {
        try {
            val sw = StringWriter()
            throwable.printStackTrace(PrintWriter(sw))
            val timestamp = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())
            val crashText = "=== CRASH at $timestamp ===\n${throwable.message}\n\n$sw"
            val file = File(filesDir, CRASH_LOG_FILE)
            file.writeText(crashText)
        } catch (_: Exception) {
            // Can't save crash log, ignore
        }
    }

    private fun createNotificationChannels() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            val scanChannel = android.app.NotificationChannel(
                SCAN_CHANNEL_ID,
                "Alertes Scanner COHRM",
                android.app.NotificationManager.IMPORTANCE_DEFAULT,
            ).apply {
                description = "Notifications des r\u00e9sultats de scan automatique"
            }

            val pushChannel = android.app.NotificationChannel(
                PUSH_CHANNEL_ID,
                "Notifications COHRM",
                android.app.NotificationManager.IMPORTANCE_HIGH,
            ).apply {
                description = "Notifications push du syst\u00e8me COHRM"
            }

            val manager = getSystemService(android.app.NotificationManager::class.java)
            manager.createNotificationChannel(scanChannel)
            manager.createNotificationChannel(pushChannel)
        }
    }

    private fun scheduleSyncWorker() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val syncRequest = PeriodicWorkRequestBuilder<SyncWorker>(
            15, TimeUnit.MINUTES,
        ).setConstraints(constraints)
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
            .build()

        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            SyncWorker.WORK_NAME,
            ExistingPeriodicWorkPolicy.KEEP,
            syncRequest,
        )
    }

    companion object {
        const val SCAN_CHANNEL_ID = "cohrm_scan_alerts"
        const val PUSH_CHANNEL_ID = "cohrm_push"
        const val CRASH_LOG_FILE = "last_crash.txt"

        fun getCrashLog(context: Context): String? {
            return try {
                val file = File(context.filesDir, CRASH_LOG_FILE)
                if (file.exists()) file.readText() else null
            } catch (_: Exception) {
                null
            }
        }

        fun clearCrashLog(context: Context) {
            try {
                File(context.filesDir, CRASH_LOG_FILE).delete()
            } catch (_: Exception) {}
        }
    }
}
