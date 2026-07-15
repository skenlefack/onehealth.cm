package cm.onehealth.cohrm.data.repository

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.longPreferencesKey
import cm.onehealth.cohrm.data.local.dao.ReferenceDataDao
import cm.onehealth.cohrm.data.local.entity.ReferenceDataEntity
import cm.onehealth.cohrm.data.remote.ApiService
import cm.onehealth.cohrm.domain.model.ReferenceData
import cm.onehealth.cohrm.domain.repository.SyncRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SyncRepositoryImpl @Inject constructor(
    private val referenceDataDao: ReferenceDataDao,
    private val apiService: ApiService,
    private val dataStore: DataStore<Preferences>,
) : SyncRepository {

    companion object {
        private val LAST_SYNC_KEY = longPreferencesKey("last_sync_time")
    }

    override suspend fun syncReferenceData(): Result<Unit> {
        return try {
            val response = apiService.syncData()
            if (response.success && response.data != null) {
                // Save SMS codes
                val smsCodes = response.data.smsCodes.map { dto ->
                    ReferenceDataEntity(
                        code = dto.code,
                        labelFr = dto.labelFr,
                        labelEn = dto.labelEn,
                        category = dto.category.ifBlank { "sms_code" },
                    )
                }
                if (smsCodes.isNotEmpty()) {
                    referenceDataDao.deleteByCategory("sms_code")
                    referenceDataDao.insertAll(smsCodes)
                }

                // Save regions
                val regions = response.data.regions.map { dto ->
                    ReferenceDataEntity(
                        code = dto.code,
                        labelFr = dto.name,
                        labelEn = dto.name,
                        category = "region",
                    )
                }
                if (regions.isNotEmpty()) {
                    referenceDataDao.deleteByCategory("region")
                    referenceDataDao.insertAll(regions)
                }

                setLastSyncTime(System.currentTimeMillis())
                Result.success(Unit)
            } else {
                Result.failure(Exception("Sync failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override fun getSmsCodes(): Flow<List<ReferenceData>> =
        referenceDataDao.getByCategory("sms_code").map { entities ->
            entities.map { it.toDomain() }
        }

    override fun getRegions(): Flow<List<ReferenceData>> =
        referenceDataDao.getByCategory("region").map { entities ->
            entities.map { it.toDomain() }
        }

    override suspend fun getLastSyncTime(): Long {
        val prefs = dataStore.data.first()
        return prefs[LAST_SYNC_KEY] ?: 0L
    }

    override suspend fun setLastSyncTime(timestamp: Long) {
        dataStore.edit { prefs ->
            prefs[LAST_SYNC_KEY] = timestamp
        }
    }
}

private fun ReferenceDataEntity.toDomain(): ReferenceData = ReferenceData(
    code = code,
    labelFr = labelFr,
    labelEn = labelEn,
    category = category,
)
