package cm.onehealth.cohrm.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "reference_data")
data class ReferenceDataEntity(
    @PrimaryKey
    val code: String,
    val labelFr: String = "",
    val labelEn: String = "",
    val category: String = "",
    val updatedAt: Long = System.currentTimeMillis(),
)
