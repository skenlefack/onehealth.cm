package cm.onehealth.cohrm.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import cm.onehealth.cohrm.data.local.entity.ScanEntity
import cm.onehealth.cohrm.data.local.entity.ScanResultEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ScanDao {
    @Query("SELECT * FROM scans ORDER BY createdAt DESC")
    fun getAllScans(): Flow<List<ScanEntity>>

    @Query("SELECT * FROM scans WHERE id = :id")
    suspend fun getScanById(id: Int): ScanEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertScan(scan: ScanEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertScans(scans: List<ScanEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertResults(results: List<ScanResultEntity>)

    @Query("SELECT * FROM scan_results WHERE scanId = :scanId ORDER BY relevanceScore DESC")
    fun getResultsForScan(scanId: Int): Flow<List<ScanResultEntity>>

    @Query("UPDATE scans SET status = :status WHERE id = :id")
    suspend fun updateScanStatus(id: Int, status: String)

    @Query("DELETE FROM scans")
    suspend fun deleteAll()
}
