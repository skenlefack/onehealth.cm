package cm.onehealth.cohrm.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "reports")
data class ReportEntity(
    @PrimaryKey
    val id: String,
    val title: String = "",
    val description: String = "",
    val category: String = "",
    val species: String = "",
    val region: String = "",
    val department: String = "",
    val district: String = "",
    val latitude: Double? = null,
    val longitude: Double? = null,
    val symptoms: String = "", // JSON array stored as string
    val affectedCount: Int? = null,
    val reporterName: String = "",
    val reporterPhone: String = "",
    val deviceId: String = "",
    val dateDetection: String = "",
    val messageReceived: String = "",
    val themes: String = "", // stored as comma-separated
    val gravityComment: String = "",
    val sourceType: String = "mobile_app",
    val arrondissement: String = "",
    val commune: String = "",
    val aireSante: String = "",
    val syncStatus: String = "DRAFT",
    val serverCode: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
)
