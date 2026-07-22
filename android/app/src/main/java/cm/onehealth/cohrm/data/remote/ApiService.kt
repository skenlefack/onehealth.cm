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
import cm.onehealth.cohrm.data.remote.dto.NotificationPrefsResponse
import cm.onehealth.cohrm.data.remote.dto.NotificationPrefsUpdate
import cm.onehealth.cohrm.data.remote.dto.ProfileResponse
import cm.onehealth.cohrm.data.remote.dto.ProfileUpdateRequest
import cm.onehealth.cohrm.data.remote.dto.PublicReportRequest
import cm.onehealth.cohrm.data.remote.dto.RegionsResponse
import cm.onehealth.cohrm.data.remote.dto.ReportGeographicResponse
import cm.onehealth.cohrm.data.remote.dto.ReportPerformanceResponse
import cm.onehealth.cohrm.data.remote.dto.ReportSummaryResponse
import cm.onehealth.cohrm.data.remote.dto.ReportTrendsResponse
import cm.onehealth.cohrm.data.remote.dto.ScannerConfigResponse
import cm.onehealth.cohrm.data.remote.dto.SmsRequest
import cm.onehealth.cohrm.data.remote.dto.SyncResponse
import cm.onehealth.cohrm.data.remote.dto.TrackingResponse
import cm.onehealth.cohrm.data.remote.dto.ConvertRequest
import cm.onehealth.cohrm.data.remote.dto.ReviewRequest
import cm.onehealth.cohrm.data.remote.dto.RiskAssessmentRequest
import cm.onehealth.cohrm.data.remote.dto.ScannerResultsResponse
import cm.onehealth.cohrm.data.remote.dto.ValidationRequest
import cm.onehealth.cohrm.data.remote.dto.ValidationsResponse
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.PUT
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

    @retrofit2.http.DELETE("rumors/{id}")
    suspend fun deleteRumor(@Path("id") id: Int): GenericResponse

    @PUT("rumors/{id}")
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

    // Risk Assessment
    @POST("cohrm/rumors/{id}/risk-assessment")
    suspend fun assessRisk(
        @Path("id") id: Int,
        @Body request: RiskAssessmentRequest,
    ): GenericResponse

    // Validations list
    @GET("cohrm/rumors/{id}/validations")
    suspend fun getValidations(@Path("id") id: Int): ValidationsResponse

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

    // Public form (no auth)
    @POST("cohrm/public/report")
    suspend fun submitPublicReport(@Body request: PublicReportRequest): ReportResponse

    @GET("cohrm/public/track/{code}")
    suspend fun trackPublicReport(@Path("code") code: String): TrackingResponse

    @GET("cohrm/public/regions")
    suspend fun getPublicRegions(): RegionsResponse

    // Reports summary
    @GET("cohrm/reports/summary")
    suspend fun getReportSummary(
        @Query("date_from") dateFrom: String?,
        @Query("date_to") dateTo: String?,
        @Query("region") region: String?,
        @Query("group_by") groupBy: String? = "day",
    ): ReportSummaryResponse

    @GET("cohrm/reports/trends")
    suspend fun getReportTrends(
        @Query("date_from") dateFrom: String?,
        @Query("date_to") dateTo: String?,
        @Query("region") region: String?,
        @Query("group_by") groupBy: String? = "day",
    ): ReportTrendsResponse

    @GET("cohrm/reports/geographic")
    suspend fun getReportGeographic(
        @Query("date_from") dateFrom: String?,
        @Query("date_to") dateTo: String?,
    ): ReportGeographicResponse

    @GET("cohrm/reports/performance")
    suspend fun getReportPerformance(
        @Query("date_from") dateFrom: String?,
        @Query("date_to") dateTo: String?,
        @Query("region") region: String?,
    ): ReportPerformanceResponse

    // Scanner config
    @GET("cohrm/scanner/config")
    suspend fun getScannerConfig(): ScannerConfigResponse

    // Scanner results
    @GET("cohrm/scanner/results")
    suspend fun getScannerResults(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("status") status: String? = null,
    ): ScannerResultsResponse

    @PUT("cohrm/scanner/results/{id}/review")
    suspend fun reviewScanResult(
        @Path("id") id: Int,
        @Body request: ReviewRequest,
    ): GenericResponse

    @POST("cohrm/scanner/results/{id}/convert")
    suspend fun convertScanResult(
        @Path("id") id: Int,
        @Body request: ConvertRequest,
    ): GenericResponse

    // Notification preferences
    @GET("cohrm/notification-preferences")
    suspend fun getNotificationPreferences(): NotificationPrefsResponse

    @PUT("cohrm/notification-preferences")
    suspend fun updateNotificationPreferences(@Body prefs: NotificationPrefsUpdate): GenericResponse

    // Notifications mark read
    @PUT("cohrm/notifications/{id}/read")
    suspend fun markNotificationRead(@Path("id") id: Int): GenericResponse

    @PUT("cohrm/notifications/read-all")
    suspend fun markAllNotificationsRead(): GenericResponse
}
