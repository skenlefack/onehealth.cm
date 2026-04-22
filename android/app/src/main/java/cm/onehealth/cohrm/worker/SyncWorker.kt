package cm.onehealth.cohrm.worker

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import cm.onehealth.cohrm.domain.model.SyncStatus
import cm.onehealth.cohrm.domain.repository.ReportRepository
import cm.onehealth.cohrm.domain.repository.SyncRepository
import cm.onehealth.cohrm.util.SyncStatusBroadcaster
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject

@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val reportRepository: ReportRepository,
    private val syncRepository: SyncRepository,
    private val syncStatusBroadcaster: SyncStatusBroadcaster,
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            // 1. Upload pending reports
            val pendingReports = reportRepository.getPendingSyncReports()
            val total = pendingReports.size + 1 // +1 for reference data sync
            var synced = 0
            var failed = 0

            syncStatusBroadcaster.emitSyncing(0, total)

            for ((index, report) in pendingReports.withIndex()) {
                syncStatusBroadcaster.emitSyncing(index + 1, total)
                reportRepository.updateSyncStatus(report.id, SyncStatus.SYNCING)
                val result = reportRepository.submitReport(report.id)
                if (result.isSuccess) {
                    synced++
                } else {
                    reportRepository.updateSyncStatus(report.id, SyncStatus.ERROR)
                    failed++
                }
            }

            // 2. Download reference data
            syncStatusBroadcaster.emitSyncing(total, total)
            syncRepository.syncReferenceData()
            synced++

            syncStatusBroadcaster.emitCompleted(synced, failed)
            Result.success()
        } catch (e: Exception) {
            syncStatusBroadcaster.emitFailed(e.message ?: "Sync failed")
            if (runAttemptCount < 3) Result.retry() else Result.failure()
        }
    }

    companion object {
        const val WORK_NAME = "cohrm_sync"
    }
}
