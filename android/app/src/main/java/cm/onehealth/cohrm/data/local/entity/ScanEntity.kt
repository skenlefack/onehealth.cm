package cm.onehealth.cohrm.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "scans")
data class ScanEntity(
    @PrimaryKey val id: Int,
    val source: String = "",
    val status: String = "",
    val keywords: String = "", // comma-separated
    val itemsScanned: Int = 0,
    val rumorsFound: Int = 0,
    val duration: Int = 0,
    val createdAt: String = "",
    val completedAt: String = "",
)

@Entity(tableName = "scan_results")
data class ScanResultEntity(
    @PrimaryKey val id: Int,
    val scanId: Int,
    val title: String = "",
    val content: String = "",
    val url: String = "",
    val source: String = "",
    val author: String = "",
    val relevanceScore: Double = 0.0,
    val status: String = "new",
    val matchedKeywords: String = "", // comma-separated
)
