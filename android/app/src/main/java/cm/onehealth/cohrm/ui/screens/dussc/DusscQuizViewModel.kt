package cm.onehealth.cohrm.ui.screens.dussc

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.data.remote.dussc.*
import cm.onehealth.cohrm.domain.repository.dussc.DusscRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

enum class QuizPhase { LOADING, QUIZ, SUBMITTING, DEMOGRAPHICS, RESULTS, ERROR }

data class DusscQuizState(
    val phase: QuizPhase = QuizPhase.LOADING,
    val questions: List<DusscQuestionDto> = emptyList(),
    val currentIndex: Int = 0,
    val totalQuestions: Int = 0,
    val selectedAnswer: String? = null,
    val feedback: DusscAnswerFeedbackDto? = null,
    val scores: DusscScoresDto? = null,
    val resultDetail: DusscResultDto? = null,
    val error: String? = null,
    val sessionUuid: String = "",
    val profil: String = "",
    val questionStartTime: Long = 0L,
    val region: String = "",
    val milieu: String = "",
    val trancheAge: String = "",
    val sexe: String = "",
) {
    val currentQuestion: DusscQuestionDto? get() = questions.getOrNull(currentIndex)
}

@HiltViewModel
class DusscQuizViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: DusscRepository,
) : ViewModel() {

    private val profil: String = savedStateHandle.get<String>("profil") ?: ""

    private val _state = MutableStateFlow(DusscQuizState(profil = profil))
    val state: StateFlow<DusscQuizState> = _state.asStateFlow()

    init {
        startQuiz()
    }

    private fun startQuiz() {
        val uuid = UUID.randomUUID().toString()
        _state.update { it.copy(phase = QuizPhase.LOADING, sessionUuid = uuid, currentIndex = 0, scores = null, region = "", milieu = "", trancheAge = "", sexe = "") }

        viewModelScope.launch {
            // Create session
            repository.createSession(
                DusscCreateSessionRequest(uuid = uuid, langue = "fr", profil = profil)
            ).fold(
                onSuccess = {
                    // Load quiz
                    repository.getQuiz("fr", profil).fold(
                        onSuccess = { quiz ->
                            val questions = quiz.questions ?: emptyList()
                            _state.update {
                                it.copy(
                                    phase = QuizPhase.QUIZ,
                                    questions = questions,
                                    totalQuestions = questions.size,
                                    currentIndex = 0,
                                    selectedAnswer = null,
                                    feedback = null,
                                    questionStartTime = System.currentTimeMillis(),
                                )
                            }
                        },
                        onFailure = { e -> _state.update { it.copy(phase = QuizPhase.ERROR, error = e.localizedMessage) } },
                    )
                },
                onFailure = { e -> _state.update { it.copy(phase = QuizPhase.ERROR, error = e.localizedMessage) } },
            )
        }
    }

    fun selectAnswer(letter: String) {
        _state.update { it.copy(selectedAnswer = letter) }
    }

    fun submitAnswer() {
        val currentState = _state.value
        val question = currentState.currentQuestion ?: return
        val answer = currentState.selectedAnswer ?: return
        val durationMs = System.currentTimeMillis() - currentState.questionStartTime

        viewModelScope.launch {
            repository.submitAnswer(
                uuid = currentState.sessionUuid,
                request = DusscAnswerRequest(
                    questionId = question.id,
                    answer = answer,
                    bloc = question.bloc,
                    questionOrder = question.order,
                    durationMs = durationMs,
                    optionsOrder = question.optionsOrder,
                    lang = "fr",
                ),
            ).fold(
                onSuccess = { feedback ->
                    _state.update { it.copy(feedback = feedback) }
                },
                onFailure = { /* continue anyway */ },
            )
        }
    }

    fun nextQuestion() {
        val currentState = _state.value
        if (currentState.currentIndex >= currentState.totalQuestions - 1) {
            // Go to demographics phase instead of directly submitting
            _state.update { it.copy(phase = QuizPhase.DEMOGRAPHICS) }
        } else {
            _state.update {
                it.copy(
                    currentIndex = it.currentIndex + 1,
                    selectedAnswer = null,
                    feedback = null,
                    questionStartTime = System.currentTimeMillis(),
                )
            }
        }
    }

    fun updateRegion(value: String) {
        _state.update { it.copy(region = value) }
    }

    fun updateMilieu(value: String) {
        _state.update { it.copy(milieu = value) }
    }

    fun updateTrancheAge(value: String) {
        _state.update { it.copy(trancheAge = value) }
    }

    fun updateSexe(value: String) {
        _state.update { it.copy(sexe = value) }
    }

    fun submitDemographics() {
        _state.update { it.copy(phase = QuizPhase.SUBMITTING) }
        val currentState = _state.value
        viewModelScope.launch {
            repository.completeSession(
                uuid = currentState.sessionUuid,
                request = DusscCompleteRequest(
                    region = currentState.region.ifBlank { null },
                    milieu = currentState.milieu.ifBlank { null },
                    trancheAge = currentState.trancheAge.ifBlank { null },
                    sexe = currentState.sexe.ifBlank { null },
                ),
            ).fold(
                onSuccess = { scores ->
                    _state.update { it.copy(phase = QuizPhase.RESULTS, scores = scores) }
                    // Also load detailed results for review
                    viewModelScope.launch {
                        repository.getResult(_state.value.sessionUuid).fold(
                            onSuccess = { result -> _state.update { it.copy(resultDetail = result) } },
                            onFailure = {},
                        )
                    }
                },
                onFailure = { e ->
                    _state.update { it.copy(phase = QuizPhase.ERROR, error = e.localizedMessage) }
                },
            )
        }
    }

    fun retry() {
        startQuiz()
    }
}
