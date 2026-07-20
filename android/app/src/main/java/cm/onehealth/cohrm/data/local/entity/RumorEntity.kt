package cm.onehealth.cohrm.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Cached rumor for offline viewing.
 * Fields mirror [cm.onehealth.cohrm.data.remote.dto.RumorDetail].
 */
@Entity(tableName = "rumors")
data class RumorEntity(
    @PrimaryKey val id: Int,
    val code: String = "",
    val title: String = "",
    val description: String = "",
    val category: String = "",
    val species: String? = null,
    val status: String = "pending",
    val priority: String = "medium",
    val riskLevel: String = "unknown",
    val source: String = "mobile",
    val region: String = "",
    val department: String = "",
    val district: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val symptoms: String? = null,
    val affectedCount: Int? = null,
    val reporterName: String? = null,
    val reporterPhone: String? = null,
    val createdAt: String = "",
    val updatedAt: String? = null,
    val assignedTo: Int? = null,
    val assignedName: String? = null,
    val createdByName: String? = null,
    /** Timestamp when this row was last refreshed from the server */
    val cachedAt: Long = System.currentTimeMillis(),
)
