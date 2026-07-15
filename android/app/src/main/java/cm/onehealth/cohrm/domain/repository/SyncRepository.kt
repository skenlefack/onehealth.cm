package cm.onehealth.cohrm.domain.repository

import cm.onehealth.cohrm.domain.model.ReferenceData
import kotlinx.coroutines.flow.Flow

interface SyncRepository {
    suspend fun syncReferenceData(): Result<Unit>
    fun getSmsCodes(): Flow<List<ReferenceData>>
    fun getRegions(): Flow<List<ReferenceData>>
    suspend fun getLastSyncTime(): Long
    suspend fun setLastSyncTime(timestamp: Long)
}
