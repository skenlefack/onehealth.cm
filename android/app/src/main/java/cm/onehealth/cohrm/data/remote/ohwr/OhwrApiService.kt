package cm.onehealth.cohrm.data.remote.ohwr

import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.http.*

interface OhwrApiService {

    @GET("stats")
    suspend fun getStats(): OhwrApiResponse<OhwrStatsDto>

    @GET("markers")
    suspend fun getMarkers(@Query("types") types: String? = null): OhwrApiResponse<List<OhwrMarkerDto>>

    @GET("regions")
    suspend fun getRegions(): OhwrApiResponse<List<OhwrRegionDto>>

    @GET("config/all")
    suspend fun getAllConfig(): OhwrApiResponse<OhwrConfigAllDto>

    @GET("experts")
    suspend fun getExperts(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("category") category: String? = null,
        @Query("region") region: String? = null,
        @Query("search") search: String? = null,
    ): OhwrPaginatedResponse<OhwrExpertDto>

    @GET("experts/{id}")
    suspend fun getExpertDetail(@Path("id") id: Int): OhwrApiResponse<OhwrExpertDto>

    @GET("organizations")
    suspend fun getOrganizations(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("type") type: String? = null,
        @Query("region") region: String? = null,
        @Query("search") search: String? = null,
    ): OhwrPaginatedResponse<OhwrOrganizationDto>

    @GET("organizations/{id}")
    suspend fun getOrganizationDetail(@Path("id") id: Int): OhwrApiResponse<OhwrOrganizationDto>

    @GET("materials")
    suspend fun getMaterials(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("type") type: String? = null,
        @Query("status") status: String? = null,
        @Query("region") region: String? = null,
        @Query("search") search: String? = null,
    ): OhwrPaginatedResponse<OhwrMaterialDto>

    @GET("documents")
    suspend fun getDocuments(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("type") type: String? = null,
        @Query("search") search: String? = null,
        @Query("is_featured") isFeatured: Boolean? = null,
    ): OhwrPaginatedResponse<OhwrDocumentDto>

    @GET("documents/featured")
    suspend fun getFeaturedDocuments(@Query("limit") limit: Int = 6): OhwrApiResponse<List<OhwrDocumentDto>>

    @GET("documents/recent")
    suspend fun getRecentDocuments(@Query("limit") limit: Int = 10): OhwrApiResponse<List<OhwrDocumentDto>>

    @GET("documents/{idOrSlug}")
    suspend fun getDocumentDetail(@Path("idOrSlug") idOrSlug: String): OhwrApiResponse<OhwrDocumentDto>

    @Multipart
    @POST("submit/expert")
    suspend fun submitExpert(
        @Part("first_name") firstName: RequestBody,
        @Part("last_name") lastName: RequestBody,
        @Part("title") title: RequestBody,
        @Part("category") category: RequestBody,
        @Part("email") email: RequestBody?,
        @Part("phone") phone: RequestBody?,
        @Part("region") region: RequestBody?,
        @Part("city") city: RequestBody?,
        @Part photo: MultipartBody.Part?,
    ): OhwrApiResponse<Map<String, String>>

    @Multipart
    @POST("submit/organization")
    suspend fun submitOrganization(
        @Part("name") name: RequestBody,
        @Part("acronym") acronym: RequestBody?,
        @Part("type") type: RequestBody?,
        @Part("description") description: RequestBody?,
        @Part("region") region: RequestBody?,
        @Part("contact_email") email: RequestBody?,
        @Part logo: MultipartBody.Part?,
    ): OhwrApiResponse<Map<String, String>>

    @GET("my-submissions")
    suspend fun getMySubmissions(): OhwrApiResponse<List<OhwrSubmissionDto>>
}
