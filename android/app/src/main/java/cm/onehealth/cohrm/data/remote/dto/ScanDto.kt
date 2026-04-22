package cm.onehealth.cohrm.data.remote.dto

import com.squareup.moshi.FromJson
import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass
import com.squareup.moshi.ToJson

@JsonClass(generateAdapter = true)
data class ScanRunRequest(
    val source: String = "all",
    val keywords: List<String>? = null,
)

@JsonClass(generateAdapter = true)
data class ScanRunResponse(
    val success: Boolean = false,
    val message: String? = null,
    val data: ScanRunData? = null,
)

@JsonClass(generateAdapter = true)
data class ScanRunData(
    @Json(name = "scan_id") val scanId: Int = 0,
)

@JsonClass(generateAdapter = true)
data class ScanHistoryResponse(
    val success: Boolean = false,
    val data: List<ScanSummary> = emptyList(),
    val pagination: ScanPagination? = null,
)

@JsonClass(generateAdapter = true)
data class ScanPagination(
    val total: Int = 0,
    val page: Int = 1,
    val limit: Int = 20,
    @Json(name = "total_pages") val totalPages: Int = 1,
)

@JsonClass(generateAdapter = true)
data class ScanSummary(
    val id: Int = 0,
    val source: String = "",
    val status: String = "",
    val keywords: String? = null,
    @Json(name = "items_scanned") val itemsScanned: Int = 0,
    @Json(name = "rumors_found") val rumorsFound: Int = 0,
    @Json(name = "rumors_created") val rumorsCreated: Int = 0,
    val duration: Int? = null,
    @Json(name = "created_at") val createdAt: String? = null,
    @Json(name = "completed_at") val completedAt: String? = null,
) {
    fun keywordsList(): List<String> = parseKeywords(keywords)
}

@JsonClass(generateAdapter = true)
data class ScanDetailResponse(
    val success: Boolean = false,
    val data: ScanDetail? = null,
)

@JsonClass(generateAdapter = true)
data class ScanDetail(
    val id: Int = 0,
    val source: String = "",
    val status: String = "",
    val keywords: String? = null,
    @Json(name = "items_scanned") val itemsScanned: Int = 0,
    @Json(name = "rumors_found") val rumorsFound: Int = 0,
    @Json(name = "rumors_created") val rumorsCreated: Int = 0,
    val duration: Int? = null,
    @Json(name = "created_at") val createdAt: String? = null,
    @Json(name = "completed_at") val completedAt: String? = null,
    val results: List<ScanResultItem> = emptyList(),
    @Json(name = "rumorsCreated") val rumorsCreatedList: List<ScanRumorItem>? = null,
) {
    fun keywordsList(): List<String> = parseKeywords(keywords)
}

@JsonClass(generateAdapter = true)
data class ScanResultItem(
    val id: Int = 0,
    val title: String? = null,
    val content: String? = null,
    val url: String? = null,
    val source: String? = null,
    val author: String? = null,
    @Json(name = "published_at") val publishedAt: String? = null,
    @Json(name = "relevance_score") val relevanceScore: Double? = null,
    val status: String = "new",
    @Json(name = "matched_keywords") val matchedKeywords: List<String>? = null,
)

@JsonClass(generateAdapter = true)
data class ScanRumorItem(
    val id: Int = 0,
    val code: String = "",
    val title: String = "",
    val status: String = "",
)

/** Parse keywords that come as JSON string from MySQL (e.g. "[\"cholera\",\"epidemie\"]") */
private fun parseKeywords(raw: String?): List<String> {
    if (raw.isNullOrBlank()) return emptyList()
    return try {
        // Try to parse as JSON array string
        val trimmed = raw.trim()
        if (trimmed.startsWith("[")) {
            trimmed.removeSurrounding("[", "]")
                .split(",")
                .map { it.trim().removeSurrounding("\"") }
                .filter { it.isNotBlank() }
        } else {
            // Plain comma-separated
            trimmed.split(",").map { it.trim() }.filter { it.isNotBlank() }
        }
    } catch (_: Exception) {
        emptyList()
    }
}
