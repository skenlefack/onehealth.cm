package cm.onehealth.cohrm.domain.repository.dussc

import cm.onehealth.cohrm.data.remote.dussc.*

interface DusscRepository {
    suspend fun getModules(lang: String): Result<List<DusscModuleDto>>
    suspend fun getPersonas(lang: String): Result<List<DusscPersonaDto>>
    suspend fun getConsent(lang: String): Result<DusscConsentDto>
    suspend fun getQuiz(lang: String, profil: String?): Result<DusscQuizDto>
    suspend fun createSession(request: DusscCreateSessionRequest): Result<DusscSessionCreatedDto>
    suspend fun submitAnswer(uuid: String, request: DusscAnswerRequest): Result<DusscAnswerFeedbackDto>
    suspend fun completeSession(uuid: String, request: DusscCompleteRequest): Result<DusscScoresDto>
    suspend fun getResult(uuid: String): Result<DusscResultDto>
}
