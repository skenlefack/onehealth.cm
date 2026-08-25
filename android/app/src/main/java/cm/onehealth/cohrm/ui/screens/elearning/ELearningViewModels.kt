package cm.onehealth.cohrm.ui.screens.elearning

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cm.onehealth.cohrm.data.remote.elearning.*
import cm.onehealth.cohrm.domain.repository.elearning.ELearningRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

// === Home ===
data class ELHomeState(
    val isLoading: Boolean = false,
    val stats: ELUserStatsDto? = null,
    val featuredCourses: List<ELCourseDto> = emptyList(),
    val inProgressEnrollments: List<ELEnrollmentDto> = emptyList(),
    val categories: List<ELCategoryDto> = emptyList(),
)

@HiltViewModel
class ELearningHomeViewModel @Inject constructor(private val repo: ELearningRepository) : ViewModel() {
    private val _state = MutableStateFlow(ELHomeState())
    val state: StateFlow<ELHomeState> = _state.asStateFlow()
    init { load() }
    private fun load() {
        _state.update { it.copy(isLoading = true) }
        viewModelScope.launch { repo.getUserStats().fold(onSuccess = { s -> _state.update { it.copy(stats = s) } }, onFailure = {}) }
        viewModelScope.launch { repo.getFeaturedCourses().fold(onSuccess = { c -> _state.update { it.copy(featuredCourses = c) } }, onFailure = {}) }
        viewModelScope.launch { repo.getMyEnrollments(status = "in_progress").fold(onSuccess = { e -> _state.update { it.copy(inProgressEnrollments = e) } }, onFailure = {}) }
        viewModelScope.launch { repo.getCategories().fold(onSuccess = { c -> _state.update { it.copy(categories = c, isLoading = false) } }, onFailure = { _state.update { it.copy(isLoading = false) } }) }
    }
}

// === Course List ===
data class ELCourseListState(
    val isLoading: Boolean = false, val courses: List<ELCourseDto> = emptyList(),
    val search: String = "", val level: String? = null, val category: String? = null, val sort: String? = null,
    val page: Int = 1, val totalPages: Int = 1, val categories: List<ELCategoryDto> = emptyList(),
)

@HiltViewModel
class CourseListViewModel @Inject constructor(private val repo: ELearningRepository) : ViewModel() {
    private val _state = MutableStateFlow(ELCourseListState())
    val state: StateFlow<ELCourseListState> = _state.asStateFlow()
    init { loadCategories(); load() }
    private fun loadCategories() { viewModelScope.launch { repo.getCategories().fold(onSuccess = { c -> _state.update { it.copy(categories = c) } }, onFailure = {}) } }
    private fun load() {
        _state.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            val s = _state.value
            repo.getCourses(page = s.page, search = s.search.ifBlank { null }, level = s.level, category = s.category, sort = s.sort).fold(
                onSuccess = { resp -> _state.update { it.copy(isLoading = false, courses = if (it.page == 1) resp.data ?: emptyList() else it.courses + (resp.data ?: emptyList()), totalPages = resp.pagination?.pages ?: 1) } },
                onFailure = { _state.update { it.copy(isLoading = false) } },
            )
        }
    }
    fun setSearch(q: String) { _state.update { it.copy(search = q, page = 1, courses = emptyList()) }; load() }
    fun setLevel(l: String?) { _state.update { it.copy(level = l, page = 1, courses = emptyList()) }; load() }
    fun setCategory(c: String?) { _state.update { it.copy(category = c, page = 1, courses = emptyList()) }; load() }
    fun setSort(s: String?) { _state.update { it.copy(sort = s, page = 1, courses = emptyList()) }; load() }
    fun loadMore() { _state.update { it.copy(page = it.page + 1) }; load() }
}

// === Course Detail ===
data class ELCourseDetailState(
    val isLoading: Boolean = false, val course: ELCourseDto? = null,
    val curriculum: ELCurriculumDto? = null, val isEnrolling: Boolean = false, val error: String? = null,
)

@HiltViewModel
class CourseDetailViewModel @Inject constructor(savedStateHandle: SavedStateHandle, private val repo: ELearningRepository) : ViewModel() {
    private val slug: String = savedStateHandle.get<String>("slug") ?: ""
    private val _state = MutableStateFlow(ELCourseDetailState())
    val state: StateFlow<ELCourseDetailState> = _state.asStateFlow()
    init {
        _state.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            repo.getCourseDetail(slug).fold(
                onSuccess = { course ->
                    _state.update { it.copy(course = course, isLoading = false) }
                    if (course.id > 0) viewModelScope.launch {
                        repo.getCurriculum(course.id).fold(onSuccess = { cur -> _state.update { it.copy(curriculum = cur) } }, onFailure = {})
                    }
                },
                onFailure = { e -> _state.update { it.copy(isLoading = false, error = e.localizedMessage) } },
            )
        }
    }
    fun enroll() {
        val course = _state.value.course ?: return
        _state.update { it.copy(isEnrolling = true) }
        viewModelScope.launch {
            repo.enroll(ELEnrollRequest(enrollableType = "course", enrollableId = course.id)).fold(
                onSuccess = { enrollment -> _state.update { it.copy(isEnrolling = false, course = it.course?.copy(enrollment = enrollment)) } },
                onFailure = { e -> _state.update { it.copy(isEnrolling = false, error = e.localizedMessage) } },
            )
        }
    }
    fun unenroll() {
        val enrollment = _state.value.course?.enrollment ?: return
        viewModelScope.launch {
            repo.unenroll(enrollment.id).fold(
                onSuccess = { _state.update { it.copy(course = it.course?.copy(enrollment = null)) } },
                onFailure = { e -> _state.update { it.copy(error = e.localizedMessage) } },
            )
        }
    }
}

// === Lesson ===
data class ELLessonState(
    val isLoading: Boolean = false, val lesson: ELLessonDto? = null, val error: String? = null, val isCompleting: Boolean = false, val completionResult: ELLessonCompleteResponseDto? = null,
)

@HiltViewModel
class LessonViewModel @Inject constructor(savedStateHandle: SavedStateHandle, private val repo: ELearningRepository) : ViewModel() {
    private val lessonId: Int = savedStateHandle.get<Int>("lessonId") ?: 0
    private val _state = MutableStateFlow(ELLessonState())
    val state: StateFlow<ELLessonState> = _state.asStateFlow()
    init {
        _state.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            repo.getLessonDetail(lessonId).fold(
                onSuccess = { lesson -> _state.update { it.copy(isLoading = false, lesson = lesson) } },
                onFailure = { e -> _state.update { it.copy(isLoading = false, error = e.localizedMessage) } },
            )
        }
    }
    fun completeLesson() {
        _state.update { it.copy(isCompleting = true) }
        viewModelScope.launch {
            repo.completeLesson(lessonId).fold(
                onSuccess = { result -> _state.update { it.copy(isCompleting = false, completionResult = result) } },
                onFailure = { _state.update { it.copy(isCompleting = false) } },
            )
        }
    }

    fun updateProgress(progressPercent: Int, videoPosition: Int? = null, timeSpent: Int? = null) {
        viewModelScope.launch {
            repo.updateLessonProgress(lessonId, ELLessonProgressRequest(
                progressPercent = progressPercent,
                videoLastPositionSeconds = videoPosition,
                timeSpentSeconds = timeSpent,
            ))
        }
    }
}

// === Quiz ===
data class ELQuizState(
    val phase: String = "loading", val quiz: ELQuizDto? = null, val questions: List<ELQuizQuestionDto> = emptyList(),
    val attemptId: Int = 0, val currentIndex: Int = 0, val answers: MutableMap<Int, String?> = mutableMapOf(),
    val result: ELQuizSubmitResponseDto? = null, val attempts: List<ELQuizAttemptDto> = emptyList(), val error: String? = null,
    val timeRemainingSeconds: Int = 0,
)

@HiltViewModel
class QuizViewModel @Inject constructor(savedStateHandle: SavedStateHandle, private val repo: ELearningRepository) : ViewModel() {
    private val quizId: Int = savedStateHandle.get<Int>("quizId") ?: 0
    private val _state = MutableStateFlow(ELQuizState())
    val state: StateFlow<ELQuizState> = _state.asStateFlow()
    val attemptResults = MutableStateFlow<ELAttemptResultsDto?>(null)
    init {
        viewModelScope.launch {
            repo.getQuizAttempts(quizId).fold(onSuccess = { a -> _state.update { it.copy(attempts = a) } }, onFailure = {})
        }
        startQuiz()
    }
    private fun startQuiz() {
        viewModelScope.launch {
            repo.startQuiz(quizId).fold(
                onSuccess = { resp ->
                    _state.update { it.copy(
                        phase = "taking", quiz = resp.quiz, questions = resp.questions ?: emptyList(),
                        attemptId = resp.attempt?.id ?: 0, currentIndex = 0, answers = mutableMapOf(),
                        timeRemainingSeconds = (resp.quiz?.timeLimitMinutes ?: 30) * 60,
                    ) }
                },
                onFailure = { e -> _state.update { it.copy(phase = "error", error = e.localizedMessage) } },
            )
        }
    }
    fun setAnswer(questionId: Int, answer: String?) { _state.update { it.copy(answers = it.answers.apply { put(questionId, answer) }) } }
    fun nextQuestion() { _state.update { it.copy(currentIndex = (it.currentIndex + 1).coerceAtMost(it.questions.size - 1)) } }
    fun prevQuestion() { _state.update { it.copy(currentIndex = (it.currentIndex - 1).coerceAtLeast(0)) } }
    fun submit() {
        _state.update { it.copy(phase = "submitting") }
        viewModelScope.launch {
            val responses = _state.value.answers.map { (qId, ans) -> ELQuizAnswerDto(questionId = qId, answer = ans) }
            repo.submitQuiz(_state.value.attemptId, responses).fold(
                onSuccess = { result ->
                    _state.update { it.copy(phase = "results", result = result) }
                    loadResults()
                },
                onFailure = { e -> _state.update { it.copy(phase = "error", error = e.localizedMessage) } },
            )
        }
    }
    fun loadResults() {
        viewModelScope.launch {
            repo.getAttemptResults(_state.value.attemptId).fold(
                onSuccess = { results -> attemptResults.value = results },
                onFailure = {},
            )
        }
    }
}

// === My Learning ===
data class ELMyLearningState(
    val isLoading: Boolean = false, val enrollments: List<ELEnrollmentDto> = emptyList(), val filter: String = "all",
)

@HiltViewModel
class MyLearningViewModel @Inject constructor(private val repo: ELearningRepository) : ViewModel() {
    private val _state = MutableStateFlow(ELMyLearningState())
    val state: StateFlow<ELMyLearningState> = _state.asStateFlow()
    init { load() }
    private fun load() {
        _state.update { it.copy(isLoading = true) }
        val status = if (_state.value.filter == "all") null else _state.value.filter
        viewModelScope.launch {
            repo.getMyEnrollments(status = status).fold(
                onSuccess = { e -> _state.update { it.copy(isLoading = false, enrollments = e) } },
                onFailure = { _state.update { it.copy(isLoading = false) } },
            )
        }
    }
    fun setFilter(f: String) { _state.update { it.copy(filter = f, enrollments = emptyList()) }; load() }
}

// === Certificates ===
data class ELCertificatesState(
    val isLoading: Boolean = false, val stats: ELUserStatsDto? = null,
    val certificates: List<ELCertificateDto> = emptyList(), val error: String? = null,
)

@HiltViewModel
class CertificatesViewModel @Inject constructor(private val repo: ELearningRepository) : ViewModel() {
    private val _state = MutableStateFlow(ELCertificatesState())
    val state: StateFlow<ELCertificatesState> = _state.asStateFlow()
    init {
        _state.update { it.copy(isLoading = true) }
        viewModelScope.launch { repo.getUserStats().fold(onSuccess = { s -> _state.update { it.copy(stats = s) } }, onFailure = {}) }
        viewModelScope.launch {
            repo.getMyCertificates().fold(
                onSuccess = { certs -> _state.update { it.copy(isLoading = false, certificates = certs) } },
                onFailure = { e -> _state.update { it.copy(isLoading = false, error = e.localizedMessage) } },
            )
        }
    }
}

// === Paths ===
data class ELPathsState(val isLoading: Boolean = false, val paths: List<ELLearningPathDto> = emptyList(), val page: Int = 1, val totalPages: Int = 1, val search: String = "")

@HiltViewModel
class PathsViewModel @Inject constructor(private val repo: ELearningRepository) : ViewModel() {
    private val _state = MutableStateFlow(ELPathsState())
    val state: StateFlow<ELPathsState> = _state.asStateFlow()
    init { load() }
    private fun load() {
        _state.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            repo.getPaths(page = _state.value.page, search = _state.value.search.ifBlank { null }).fold(
                onSuccess = { resp -> _state.update { it.copy(isLoading = false, paths = if (it.page == 1) resp.data ?: emptyList() else it.paths + (resp.data ?: emptyList()), totalPages = resp.pagination?.pages ?: 1) } },
                onFailure = { _state.update { it.copy(isLoading = false) } },
            )
        }
    }
    fun setSearch(q: String) { _state.update { it.copy(search = q, page = 1, paths = emptyList()) }; load() }
    fun loadMore() { _state.update { it.copy(page = it.page + 1) }; load() }
}

// === Path Detail ===
data class ELPathDetailState(val isLoading: Boolean = false, val path: ELLearningPathDto? = null, val error: String? = null)

@HiltViewModel
class PathDetailViewModel @Inject constructor(savedStateHandle: SavedStateHandle, private val repo: ELearningRepository) : ViewModel() {
    private val slug: String = savedStateHandle.get<String>("slug") ?: ""
    private val _state = MutableStateFlow(ELPathDetailState())
    val state: StateFlow<ELPathDetailState> = _state.asStateFlow()
    init {
        _state.update { it.copy(isLoading = true) }
        viewModelScope.launch {
            repo.getPathDetail(slug).fold(
                onSuccess = { path -> _state.update { it.copy(isLoading = false, path = path) } },
                onFailure = { e -> _state.update { it.copy(isLoading = false, error = e.localizedMessage) } },
            )
        }
    }
}
