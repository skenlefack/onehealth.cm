package cm.onehealth.cohrm.data.remote

import cm.onehealth.cohrm.data.remote.dto.ActorsResponse
import cm.onehealth.cohrm.data.remote.dto.DashboardResponse
import cm.onehealth.cohrm.data.remote.dto.NotificationsResponse
import cm.onehealth.cohrm.data.remote.dto.FeedbackRequest
import cm.onehealth.cohrm.data.remote.dto.LoginRequest
import cm.onehealth.cohrm.data.remote.dto.LoginResponse
import cm.onehealth.cohrm.data.remote.dto.ReportRequest
import cm.onehealth.cohrm.data.remote.dto.ReportResponse
import cm.onehealth.cohrm.data.remote.dto.RumorDetailResponse
import cm.onehealth.cohrm.data.remote.dto.RumorUpdateRequest
import cm.onehealth.cohrm.data.remote.dto.RumorsListResponse
import cm.onehealth.cohrm.data.remote.dto.ScanDetailResponse
import cm.onehealth.cohrm.data.remote.dto.ScanHistoryResponse
import cm.onehealth.cohrm.data.remote.dto.ScanRunRequest
import cm.onehealth.cohrm.data.remote.dto.ScanRunResponse
import cm.onehealth.cohrm.data.remote.dto.ChangePasswordRequest
import cm.onehealth.cohrm.data.remote.dto.DeviceRegistrationRequest
import cm.onehealth.cohrm.data.remote.dto.GenericResponse
import cm.onehealth.cohrm.data.remote.dto.ProfileResponse
import cm.onehealth.cohrm.data.remote.dto.ProfileUpdateRequest
import cm.onehealth.cohrm.data.remote.dto.SmsRequest
import cm.onehealth.cohrm.data.remote.dto.SyncResponse
import cm.onehealth.cohrm.data.remote.dto.ValidationRequest
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {
    // Auth
    @POST("mobile/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse

    // Mobile report submission
    @POST("mobile/report")
    suspend fun submitReport(@Body request: ReportRequest): ReportResponse

    @Multipart
    @POST("mobile/report")
    suspend fun submitReportWithPhotos(
        @Part("data") data: RequestBody,
        @Part photos: List<MultipartBody.Part>,
    ): ReportResponse

    @POST("mobile/sms")
    suspend fun submitSms(@Body request: SmsRequest): ReportResponse

    @GET("mobile/sync")
    suspend fun syncData(
        @Query("device_id") deviceId: String? = null,
        @Query("last_sync") lastSync: String? = null,
    ): SyncResponse

    // Dashboard
    @GET("mobile/dashboard")
    suspend fun getDashboardStats(
        @Query("region") region: String? = null,
        @Query("period") period: String? = null,
    ): DashboardResponse

    // Rumors
    @GET("rumors")
    suspend fun getRumors(
        @Query("page") page: Int = 1,
        @Query("per_page") perPage: Int = 20,
        @Query("status") status: String? = null,
        @Query("category") category: String? = null,
        @Query("region") region: String? = null,
        @Query("priority") priority: String? = null,
        @Query("source") source: String? = null,
        @Query("search") search: String? = null,
        @Query("sort") sort: String? = null,
    ): RumorsListResponse

    @GET("rumors/{id}")
    suspend fun getRumorDetail(@Path("id") id: Int): RumorDetailResponse

    @PATCH("rumors/{id}")
    suspend fun updateRumor(
        @Path("id") id: Int,
        @Body request: RumorUpdateRequest,
    ): RumorDetailResponse

    // Validations
    @POST("rumors/{id}/validate")
    suspend fun validateRumor(
        @Path("id") id: Int,
        @Body request: ValidationRequest,
    ): RumorDetailResponse

    // Feedback
    @POST("rumors/{id}/feedback")
    suspend fun addFeedback(
        @Path("id") id: Int,
        @Body request: FeedbackRequest,
    ): RumorDetailResponse

    // Actors
    @GET("actors")
    suspend fun getActors(
        @Query("region") region: String? = null,
        @Query("level") level: Int? = null,
    ): ActorsResponse

    // Scans
    @POST("scan/run")
    suspend fun runScan(@Body request: ScanRunRequest): ScanRunResponse

    @GET("scan-history")
    suspend fun getScanHistory(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("source") source: String? = null,
        @Query("status") status: String? = null,
    ): ScanHistoryResponse

    @GET("scan-history/{id}")
    suspend fun getScanDetail(@Path("id") id: Int): ScanDetailResponse

    // Notifications
    @GET("cohrm/notifications/my")
    suspend fun getMyNotifications(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
    ): NotificationsResponse

    // Profile
    @PATCH("mobile/profile")
    suspend fun updateProfile(@Body request: ProfileUpdateRequest): ProfileResponse

    @POST("mobile/change-password")
    suspend fun changePassword(@Body request: ChangePasswordRequest): ProfileResponse

    // Device registration (FCM)
    @POST("mobile/device/register")
    suspend fun registerDevice(@Body request: DeviceRegistrationRequest): GenericResponse
}
