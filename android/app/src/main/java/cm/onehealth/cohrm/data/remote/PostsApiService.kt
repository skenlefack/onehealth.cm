package cm.onehealth.cohrm.data.remote

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface PostsApiService {
    @GET("posts")
    suspend fun getPosts(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 5,
        @Query("sort") sort: String = "published_at",
        @Query("order") order: String = "DESC",
    ): PostsResponse

    @GET("posts/{slug}")
    suspend fun getPost(@Path("slug") slug: String): PostDetailResponse
}

@JsonClass(generateAdapter = true)
data class PostsResponse(
    val success: Boolean = false,
    val data: List<PostDto>? = null,
)

@JsonClass(generateAdapter = true)
data class PostDetailResponse(
    val success: Boolean = false,
    val data: PostDto? = null,
)

@JsonClass(generateAdapter = true)
data class PostDto(
    val id: Int,
    val title: String? = null,
    @Json(name = "title_fr") val titleFr: String? = null,
    @Json(name = "title_en") val titleEn: String? = null,
    val slug: String? = null,
    @Json(name = "excerpt_fr") val excerptFr: String? = null,
    @Json(name = "excerpt_en") val excerptEn: String? = null,
    val content: String? = null,
    @Json(name = "content_fr") val contentFr: String? = null,
    @Json(name = "content_en") val contentEn: String? = null,
    @Json(name = "featured_image") val featuredImage: String? = null,
    @Json(name = "author_first_name") val authorFirstName: String? = null,
    @Json(name = "author_last_name") val authorLastName: String? = null,
    @Json(name = "author_avatar") val authorAvatar: String? = null,
    @Json(name = "category_name") val categoryName: String? = null,
    @Json(name = "view_count") val viewCount: Int? = null,
    @Json(name = "published_at") val publishedAt: String? = null,
) {
    val localizedTitle: String get() = titleFr ?: titleEn ?: title ?: ""
    val localizedExcerpt: String get() = excerptFr ?: excerptEn ?: ""
    val localizedContent: String get() = contentFr ?: contentEn ?: content ?: ""
    val authorName: String get() = listOfNotNull(authorFirstName, authorLastName).joinToString(" ")
}
