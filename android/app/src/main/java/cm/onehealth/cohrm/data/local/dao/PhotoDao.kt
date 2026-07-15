package cm.onehealth.cohrm.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import cm.onehealth.cohrm.data.local.entity.PhotoEntity

@Dao
interface PhotoDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(photo: PhotoEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(photos: List<PhotoEntity>)

    @Query("SELECT * FROM photos WHERE reportId = :reportId")
    suspend fun getByReportId(reportId: String): List<PhotoEntity>

    @Query("UPDATE photos SET uploadStatus = :status, remoteUrl = :remoteUrl WHERE id = :id")
    suspend fun updateUploadStatus(id: String, status: String, remoteUrl: String? = null)

    @Query("DELETE FROM photos WHERE id = :id")
    suspend fun delete(id: String)

    @Query("DELETE FROM photos WHERE reportId = :reportId")
    suspend fun deleteByReportId(reportId: String)
}
