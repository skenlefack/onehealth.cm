package cm.onehealth.cohrm.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import cm.onehealth.cohrm.data.local.entity.RumorEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface RumorDao {

    @Query("SELECT * FROM rumors ORDER BY createdAt DESC")
    fun getAll(): Flow<List<RumorEntity>>

    @Query("SELECT * FROM rumors WHERE id = :id")
    suspend fun getById(id: Int): RumorEntity?

    @Query("SELECT * FROM rumors WHERE status = :status ORDER BY createdAt DESC")
    fun getByStatus(status: String): Flow<List<RumorEntity>>

    @Query("SELECT * FROM rumors ORDER BY createdAt DESC LIMIT :limit")
    fun getRecent(limit: Int = 50): Flow<List<RumorEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(rumors: List<RumorEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(rumor: RumorEntity)

    @Query("DELETE FROM rumors WHERE id = :id")
    suspend fun deleteById(id: Int)

    @Query("DELETE FROM rumors")
    suspend fun deleteAll()

    @Query("SELECT COUNT(*) FROM rumors")
    suspend fun count(): Int
}
