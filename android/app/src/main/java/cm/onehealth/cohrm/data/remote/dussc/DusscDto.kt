package cm.onehealth.cohrm.data.remote.dussc

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class DusscApiResponse<T>(
    @Json(name = "success") val success: Boolean? = null,
    @Json(name = "data") val data: T? = null,
    @Json(name = "message") val message: String? = null,
)

@JsonClass(generateAdapter = true)
data class DusscModuleDto(
    @Json(name = "code") val code: String,
    @Json(name = "name") val name: String,
    @Json(name = "description") val description: String? = null,
    @Json(name = "icon") val icon: String? = null,
    @Json(name = "color") val color: String? = null,
)

@JsonClass(generateAdapter = true)
data class DusscPersonaDto(
    @Json(name = "code") val code: String,
    @Json(name = "family") val family: String,
    @Json(name = "name") val name: String,
    @Json(name = "description") val description: String? = null,
)

@JsonClass(generateAdapter = true)
data class DusscConsentDto(
    @Json(name = "text") val text: String? = null,
)

@JsonClass(generateAdapter = true)
data class DusscQuizDto(
    @Json(name = "template_id") val templateId: Int? = null,
    @Json(name = "template_code") val templateCode: String? = null,
    @Json(name = "lang") val lang: String? = null,
    @Json(name = "profil") val profil: String? = null,
    @Json(name = "total_questions") val totalQuestions: Int? = null,
    @Json(name = "show_progress_bar") val showProgressBar: Boolean? = null,
    @Json(name = "require_consent") val requireConsent: Boolean? = null,
    @Json(name = "questions") val questions: List<DusscQuestionDto>? = null,
)

@JsonClass(generateAdapter = true)
data class DusscQuestionDto(
    @Json(name = "id") val id: Int,
    @Json(name = "order") val order: Int? = null,
    @Json(name = "bloc") val bloc: String? = null,
    @Json(name = "module_code") val moduleCode: String? = null,
    @Json(name = "module_name") val moduleName: String? = null,
    @Json(name = "enonce") val enonce: String? = null,
    @Json(name = "options") val options: List<DusscOptionDto>? = null,
    @Json(name = "options_order") val optionsOrder: List<String>? = null,
    @Json(name = "show_feedback") val showFeedback: Boolean? = null,
)

@JsonClass(generateAdapter = true)
data class DusscOptionDto(
    @Json(name = "letter") val letter: String,
    @Json(name = "text") val text: String,
)

@JsonClass(generateAdapter = true)
data class DusscSessionCreatedDto(
    @Json(name = "session_id") val sessionId: Int? = null,
    @Json(name = "uuid") val uuid: String? = null,
)

@JsonClass(generateAdapter = true)
data class DusscAnswerFeedbackDto(
    @Json(name = "is_correct") val isCorrect: Boolean? = null,
    @Json(name = "correct_answer") val correctAnswer: String? = null,
    @Json(name = "explication") val explication: String? = null,
    @Json(name = "action") val action: String? = null,
    @Json(name = "idee_fausse") val ideeFausse: String? = null,
)

@JsonClass(generateAdapter = true)
data class DusscScoresDto(
    @Json(name = "score_pre") val scorePre: Int? = null,
    @Json(name = "score_post") val scorePost: Int? = null,
    @Json(name = "gain") val gain: Int? = null,
    @Json(name = "pct_pre") val pctPre: Int? = null,
    @Json(name = "pct_post") val pctPost: Int? = null,
    @Json(name = "total_questions") val totalQuestions: Int? = null,
    @Json(name = "total_correct") val totalCorrect: Int? = null,
    @Json(name = "pct_total") val pctTotal: Int? = null,
)

@JsonClass(generateAdapter = true)
data class DusscResultDto(
    @Json(name = "session") val session: DusscSessionResultDto? = null,
    @Json(name = "responses") val responses: List<DusscResponseDetailDto>? = null,
)

@JsonClass(generateAdapter = true)
data class DusscSessionResultDto(
    @Json(name = "uuid") val uuid: String? = null,
    @Json(name = "score_pre") val scorePre: Int? = null,
    @Json(name = "score_post") val scorePost: Int? = null,
    @Json(name = "gain") val gain: Int? = null,
    @Json(name = "pct_pre") val pctPre: Double? = null,
    @Json(name = "pct_post") val pctPost: Double? = null,
    @Json(name = "total_questions") val totalQuestions: Int? = null,
    @Json(name = "total_correct") val totalCorrect: Int? = null,
    @Json(name = "duration_seconds") val durationSeconds: Int? = null,
    @Json(name = "completed_at") val completedAt: String? = null,
)

@JsonClass(generateAdapter = true)
data class DusscResponseDetailDto(
    @Json(name = "id") val id: Int,
    @Json(name = "question_id") val questionId: Int? = null,
    @Json(name = "question_order") val questionOrder: Int? = null,
    @Json(name = "answer_given") val answerGiven: String? = null,
    @Json(name = "is_correct") val isCorrect: Int? = null,
    @Json(name = "bloc") val bloc: String? = null,
    @Json(name = "duration_ms") val durationMs: Int? = null,
    @Json(name = "enoncee_fr") val enonceeFr: String? = null,
    @Json(name = "enoncee_en") val enonceeEn: String? = null,
    @Json(name = "explication_fr") val explicationFr: String? = null,
    @Json(name = "explication_en") val explicationEn: String? = null,
    @Json(name = "action_fr") val actionFr: String? = null,
    @Json(name = "action_en") val actionEn: String? = null,
    @Json(name = "reponse_correcte") val reponseCorrecte: String? = null,
    @Json(name = "module_code") val moduleCode: String? = null,
)

// --- Request DTOs ---

@JsonClass(generateAdapter = true)
data class DusscCreateSessionRequest(
    @Json(name = "uuid") val uuid: String,
    @Json(name = "langue") val langue: String,
    @Json(name = "consent") val consent: String = "true",
    @Json(name = "canal") val canal: String = "mobile",
    @Json(name = "profil") val profil: String? = null,
)

@JsonClass(generateAdapter = true)
data class DusscAnswerRequest(
    @Json(name = "question_id") val questionId: Int,
    @Json(name = "answer") val answer: String,
    @Json(name = "bloc") val bloc: String? = null,
    @Json(name = "question_order") val questionOrder: Int? = null,
    @Json(name = "duration_ms") val durationMs: Long? = null,
    @Json(name = "options_order") val optionsOrder: List<String>? = null,
    @Json(name = "lang") val lang: String? = null,
)

@JsonClass(generateAdapter = true)
data class DusscCompleteRequest(
    @Json(name = "duration_seconds") val durationSeconds: Int? = null,
    @Json(name = "region") val region: String? = null,
    @Json(name = "milieu") val milieu: String? = null,
    @Json(name = "tranche_age") val trancheAge: String? = null,
    @Json(name = "sexe") val sexe: String? = null,
)

@JsonClass(generateAdapter = true)
data class DusscEventRequest(
    @Json(name = "event_type") val eventType: String,
    @Json(name = "screen_number") val screenNumber: Int? = null,
    @Json(name = "screen_name") val screenName: String? = null,
    @Json(name = "duration_ms") val durationMs: Long? = null,
    @Json(name = "metadata") val metadata: Map<String, String>? = null,
)
