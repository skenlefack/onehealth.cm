package cm.onehealth.cohrm.data.repository.dussc

import cm.onehealth.cohrm.data.remote.dussc.*
import cm.onehealth.cohrm.domain.repository.dussc.DusscRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DusscRepositoryImpl @Inject constructor(
    private val api: DusscApiService,
) : DusscRepository {

    override suspend fun getModules(lang: String): Result<List<DusscModuleDto>> = runCatching {
        api.getModules(lang).data ?: emptyList()
    }

    override suspend fun getPersonas(lang: String): Result<List<DusscPersonaDto>> = runCatching {
        api.getPersonas(lang).data ?: emptyList()
    }

    override suspend fun getConsent(lang: String): Result<DusscConsentDto> = runCatching {
        api.getConsent(lang).data ?: throw Exception("No consent data")
    }

    override suspend fun getQuiz(lang: String, profil: String?): Result<DusscQuizDto> = runCatching {
        api.getQuiz(lang, profil).data ?: throw Exception("No quiz data")
    }

    override suspend fun createSession(request: DusscCreateSessionRequest): Result<DusscSessionCreatedDto> = runCatching {
        api.createSession(request).data ?: throw Exception("Session creation failed")
    }

    override suspend fun submitAnswer(uuid: String, request: DusscAnswerRequest): Result<DusscAnswerFeedbackDto> = runCatching {
        api.submitAnswer(uuid, request).data ?: throw Exception("Answer submission failed")
    }

    override suspend fun completeSession(uuid: String, request: DusscCompleteRequest): Result<DusscScoresDto> = runCatching {
        api.completeSession(uuid, request).data ?: throw Exception("Session completion failed")
    }

    override suspend fun getResult(uuid: String): Result<DusscResultDto> = runCatching {
        api.getResult(uuid).data ?: throw Exception("No result data")
    }
}
