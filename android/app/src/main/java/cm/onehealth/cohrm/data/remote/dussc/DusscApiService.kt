package cm.onehealth.cohrm.data.remote.dussc

import retrofit2.http.*

interface DusscApiService {

    @GET("public/modules")
    suspend fun getModules(@Query("lang") lang: String): DusscApiResponse<List<DusscModuleDto>>

    @GET("public/personas")
    suspend fun getPersonas(@Query("lang") lang: String): DusscApiResponse<List<DusscPersonaDto>>

    @GET("public/consent")
    suspend fun getConsent(@Query("lang") lang: String): DusscApiResponse<DusscConsentDto>

    @GET("public/quiz")
    suspend fun getQuiz(
        @Query("lang") lang: String,
        @Query("profil") profil: String? = null,
    ): DusscApiResponse<DusscQuizDto>

    @POST("public/sessions")
    suspend fun createSession(@Body request: DusscCreateSessionRequest): DusscApiResponse<DusscSessionCreatedDto>

    @POST("public/sessions/{uuid}/responses")
    suspend fun submitAnswer(
        @Path("uuid") uuid: String,
        @Body request: DusscAnswerRequest,
    ): DusscApiResponse<DusscAnswerFeedbackDto>

    @POST("public/sessions/{uuid}/complete")
    suspend fun completeSession(
        @Path("uuid") uuid: String,
        @Body request: DusscCompleteRequest,
    ): DusscApiResponse<DusscScoresDto>

    @GET("public/sessions/{uuid}/result")
    suspend fun getResult(@Path("uuid") uuid: String): DusscApiResponse<DusscResultDto>

    @POST("public/sessions/{uuid}/events")
    suspend fun logEvent(
        @Path("uuid") uuid: String,
        @Body request: DusscEventRequest,
    ): DusscApiResponse<Map<String, String>>
}
