package cm.onehealth.cohrm.data.repository.elearning

import cm.onehealth.cohrm.data.remote.elearning.*
import cm.onehealth.cohrm.domain.repository.elearning.ELearningRepository
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ELearningRepositoryImpl @Inject constructor(
    private val api: ELearningApiService,
) : ELearningRepository {

    override suspend fun getCategories(): Result<List<ELCategoryDto>> = runCatching {
        api.getCategories().data ?: emptyList()
    }

    override suspend fun getCourses(page: Int, limit: Int, category: String?, level: String?, search: String?, featured: Boolean?, sort: String?): Result<ELPaginatedResponse<ELCourseDto>> = runCatching {
        api.getCourses(page, limit, category, level, search, featured, sort)
    }

    override suspend fun getFeaturedCourses(limit: Int): Result<List<ELCourseDto>> = runCatching {
        api.getFeaturedCourses(limit).data ?: emptyList()
    }

    override suspend fun getCourseDetail(slug: String): Result<ELCourseDto> = runCatching {
        api.getCourseDetail(slug).data ?: throw Exception("Course not found")
    }

    override suspend fun getCurriculum(courseId: Int): Result<ELCurriculumDto> = runCatching {
        api.getCurriculum(courseId).data ?: throw Exception("Curriculum not found")
    }

    override suspend fun getLessonDetail(id: Int): Result<ELLessonDto> = runCatching {
        api.getLessonDetail(id).data ?: throw Exception("Lesson not found")
    }

    override suspend fun updateLessonProgress(id: Int, request: ELLessonProgressRequest): Result<ELLessonProgressDto> = runCatching {
        api.updateLessonProgress(id, request).data ?: throw Exception("Progress update failed")
    }

    override suspend fun completeLesson(id: Int): Result<ELLessonCompleteResponseDto> = runCatching {
        api.completeLesson(id).data ?: throw Exception("Lesson completion failed")
    }

    override suspend fun enroll(request: ELEnrollRequest): Result<ELEnrollmentDto> = runCatching {
        api.enroll(request).data ?: throw Exception("Enrollment failed")
    }

    override suspend fun getMyEnrollments(status: String?, type: String?): Result<List<ELEnrollmentDto>> = runCatching {
        api.getMyEnrollments(status, type).data ?: emptyList()
    }

    override suspend fun unenroll(id: Int): Result<Unit> = runCatching {
        api.unenroll(id)
        Unit
    }

    override suspend fun getPaths(page: Int, limit: Int, level: String?, search: String?): Result<ELPaginatedResponse<ELLearningPathDto>> = runCatching {
        api.getPaths(page, limit, level, search)
    }

    override suspend fun getPathDetail(slug: String): Result<ELLearningPathDto> = runCatching {
        api.getPathDetail(slug).data ?: throw Exception("Path not found")
    }

    override suspend fun startQuiz(quizId: Int, enrollmentId: Int?): Result<ELQuizStartResponseDto> = runCatching {
        api.startQuiz(quizId, ELQuizStartRequest(enrollmentId)).data ?: throw Exception("Quiz start failed")
    }

    override suspend fun submitQuiz(attemptId: Int, responses: List<ELQuizAnswerDto>): Result<ELQuizSubmitResponseDto> = runCatching {
        api.submitQuiz(attemptId, ELQuizSubmitRequest(responses)).data ?: throw Exception("Quiz submit failed")
    }

    override suspend fun getQuizAttempts(quizId: Int): Result<List<ELQuizAttemptDto>> = runCatching {
        api.getQuizAttempts(quizId).data ?: emptyList()
    }

    override suspend fun getAttemptResults(attemptId: Int): Result<ELAttemptResultsDto> = runCatching {
        api.getAttemptResults(attemptId).data ?: throw Exception("Results not found")
    }

    override suspend fun getMyCertificates(): Result<List<ELCertificateDto>> = runCatching {
        api.getMyCertificates().data ?: emptyList()
    }

    override suspend fun verifyCertificate(code: String): Result<ELCertificateDto> = runCatching {
        api.verifyCertificate(code).data ?: throw Exception("Certificate not found")
    }

    override suspend fun getUserStats(): Result<ELUserStatsDto> = runCatching {
        api.getUserStats().data ?: throw Exception("Stats not available")
    }
}
