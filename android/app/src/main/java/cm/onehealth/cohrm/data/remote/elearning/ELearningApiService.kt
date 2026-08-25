package cm.onehealth.cohrm.data.remote.elearning

import retrofit2.http.*

interface ELearningApiService {

    // --- Categories ---
    @GET("categories")
    suspend fun getCategories(): ELApiResponse<List<ELCategoryDto>>

    // --- Courses ---
    @GET("courses")
    suspend fun getCourses(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 12,
        @Query("category") category: String? = null,
        @Query("level") level: String? = null,
        @Query("search") search: String? = null,
        @Query("featured") featured: Boolean? = null,
        @Query("sort") sort: String? = null,
        @Query("order") order: String? = null,
    ): ELPaginatedResponse<ELCourseDto>

    @GET("courses/featured")
    suspend fun getFeaturedCourses(@Query("limit") limit: Int = 6): ELApiResponse<List<ELCourseDto>>

    @GET("courses/{slug}")
    suspend fun getCourseDetail(@Path("slug") slug: String): ELApiResponse<ELCourseDto>

    @GET("courses/{id}/curriculum")
    suspend fun getCurriculum(@Path("id") id: Int): ELApiResponse<ELCurriculumDto>

    // --- Lessons ---
    @GET("lessons/{id}")
    suspend fun getLessonDetail(@Path("id") id: Int): ELApiResponse<ELLessonDto>

    @POST("lessons/{id}/progress")
    suspend fun updateLessonProgress(
        @Path("id") id: Int,
        @Body request: ELLessonProgressRequest,
    ): ELApiResponse<ELLessonProgressDto>

    @POST("lessons/{id}/complete")
    suspend fun completeLesson(@Path("id") id: Int): ELApiResponse<ELLessonCompleteResponseDto>

    // --- Enrollments ---
    @POST("enroll")
    suspend fun enroll(@Body request: ELEnrollRequest): ELApiResponse<ELEnrollmentDto>

    @GET("enrollments")
    suspend fun getMyEnrollments(
        @Query("status") status: String? = null,
        @Query("type") type: String? = null,
    ): ELApiResponse<List<ELEnrollmentDto>>

    @DELETE("enrollments/{id}")
    suspend fun unenroll(@Path("id") id: Int): ELApiResponse<Map<String, String>>

    // --- Learning Paths ---
    @GET("paths")
    suspend fun getPaths(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 12,
        @Query("level") level: String? = null,
        @Query("search") search: String? = null,
        @Query("featured") featured: Boolean? = null,
    ): ELPaginatedResponse<ELLearningPathDto>

    @GET("paths/{slug}")
    suspend fun getPathDetail(@Path("slug") slug: String): ELApiResponse<ELLearningPathDto>

    // --- Quizzes ---
    @POST("quizzes/{id}/start")
    suspend fun startQuiz(
        @Path("id") id: Int,
        @Body request: ELQuizStartRequest,
    ): ELApiResponse<ELQuizStartResponseDto>

    @POST("attempts/{id}/submit")
    suspend fun submitQuiz(
        @Path("id") id: Int,
        @Body request: ELQuizSubmitRequest,
    ): ELApiResponse<ELQuizSubmitResponseDto>

    @GET("attempts/{id}/results")
    suspend fun getAttemptResults(@Path("id") id: Int): ELApiResponse<ELAttemptResultsDto>

    @GET("quizzes/{id}/attempts")
    suspend fun getQuizAttempts(@Path("id") id: Int): ELApiResponse<List<ELQuizAttemptDto>>

    // --- Certificates ---
    @GET("certificates/my")
    suspend fun getMyCertificates(): ELApiResponse<List<ELCertificateDto>>

    @GET("certificates/verify/{code}")
    suspend fun verifyCertificate(@Path("code") code: String): ELApiResponse<ELCertificateDto>

    // --- Stats ---
    @GET("stats/user")
    suspend fun getUserStats(): ELApiResponse<ELUserStatsDto>
}
