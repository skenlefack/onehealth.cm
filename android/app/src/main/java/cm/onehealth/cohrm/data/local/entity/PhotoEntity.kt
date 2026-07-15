package cm.onehealth.cohrm.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "photos",
    foreignKeys = [
        ForeignKey(
            entity = ReportEntity::class,
            parentColumns = ["id"],
            childColumns = ["reportId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("reportId")]
)
data class PhotoEntity(
    @PrimaryKey
    val id: String,
    val reportId: String,
    val localPath: String = "",
    val remoteUrl: String? = null,
    val caption: String = "",
    val uploadStatus: String = "PENDING",
)
