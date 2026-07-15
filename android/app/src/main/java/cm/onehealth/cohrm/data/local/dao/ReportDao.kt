package cm.onehealth.cohrm.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import cm.onehealth.cohrm.data.local.entity.ReportEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ReportDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(report: ReportEntity)

    @Update
    suspend fun update(report: ReportEntity)

    @Query("SELECT * FROM reports ORDER BY createdAt DESC")
    fun getAll(): Flow<List<ReportEntity>>

    @Query("SELECT * FROM reports WHERE id = :id")
    suspend fun getById(id: String): ReportEntity?

    @Query("SELECT * FROM reports WHERE syncStatus = :status ORDER BY createdAt DESC")
    fun getByStatus(status: String): Flow<List<ReportEntity>>

    @Query("SELECT * FROM reports WHERE syncStatus = 'PENDING' OR syncStatus = 'ERROR'")
    suspend fun getPendingSync(): List<ReportEntity>

    @Query("UPDATE reports SET syncStatus = :status, serverCode = :serverCode, updatedAt = :updatedAt WHERE id = :id")
    suspend fun updateSyncStatus(id: String, status: String, serverCode: String?, updatedAt: Long = System.currentTimeMillis())

    @Query("DELETE FROM reports WHERE id = :id")
    suspend fun delete(id: String)

    @Query("SELECT COUNT(*) FROM reports WHERE syncStatus = :status")
    fun countByStatus(status: String): Flow<Int>
}
