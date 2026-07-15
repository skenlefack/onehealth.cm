package cm.onehealth.cohrm.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import cm.onehealth.cohrm.data.local.entity.ReferenceDataEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ReferenceDataDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(data: List<ReferenceDataEntity>)

    @Query("SELECT * FROM reference_data WHERE category = :category")
    fun getByCategory(category: String): Flow<List<ReferenceDataEntity>>

    @Query("SELECT * FROM reference_data")
    fun getAll(): Flow<List<ReferenceDataEntity>>

    @Query("DELETE FROM reference_data")
    suspend fun deleteAll()

    @Query("DELETE FROM reference_data WHERE category = :category")
    suspend fun deleteByCategory(category: String)
}
