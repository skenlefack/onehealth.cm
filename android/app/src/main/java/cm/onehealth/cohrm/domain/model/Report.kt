package cm.onehealth.cohrm.domain.model

import java.util.Date
import java.util.UUID

data class Report(
    val id: String = UUID.randomUUID().toString(),
    val title: String = "",
    val description: String = "",
    val category: String = "",
    val species: String = "",
    val region: String = "",
    val department: String = "",
    val district: String = "",
    val latitude: Double? = null,
    val longitude: Double? = null,
    val symptoms: List<String> = emptyList(),
    val affectedCount: Int? = null,
    val reporterName: String = "",
    val reporterPhone: String = "",
    val deviceId: String = "",
    val dateDetection: String = "",
    val messageReceived: String = "",
    val themes: List<String> = emptyList(),
    val gravityComment: String = "",
    val sourceType: String = "mobile_app",
    val arrondissement: String = "",
    val commune: String = "",
    val aireSante: String = "",
    val syncStatus: SyncStatus = SyncStatus.DRAFT,
    val serverCode: String? = null,
    val photos: List<Photo> = emptyList(),
    val createdAt: Date = Date(),
    val updatedAt: Date = Date(),
)

data class Photo(
    val id: String = UUID.randomUUID().toString(),
    val reportId: String = "",
    val localPath: String = "",
    val remoteUrl: String? = null,
    val caption: String = "",
    val uploadStatus: UploadStatus = UploadStatus.PENDING,
)

enum class SyncStatus {
    DRAFT,
    PENDING,
    SYNCING,
    SYNCED,
    ERROR,
    CONFLICT,
}

enum class UploadStatus {
    PENDING,
    UPLOADING,
    UPLOADED,
    FAILED,
    ERROR,
}
