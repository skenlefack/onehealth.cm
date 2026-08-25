package cm.onehealth.cohrm.domain.repository.elearning

import cm.onehealth.cohrm.data.remote.elearning.*

interface ELearningRepository {
    suspend fun getCategories(): Result<List<ELCategoryDto>>
    suspend fun getCourses(page: Int = 1, limit: Int = 12, category: String? = null, level: String? = null, search: String? = null, featured: Boolean? = null, sort: String? = null): Result<ELPaginatedResponse<ELCourseDto>>
    suspend fun getFeaturedCourses(limit: Int = 6): Result<List<ELCourseDto>>
    suspend fun getCourseDetail(slug: String): Result<ELCourseDto>
    suspend fun getCurriculum(courseId: Int): Result<ELCurriculumDto>
    suspend fun getLessonDetail(id: Int): Result<ELLessonDto>
    suspend fun updateLessonProgress(id: Int, request: ELLessonProgressRequest): Result<ELLessonProgressDto>
    suspend fun completeLesson(id: Int): Result<ELLessonCompleteResponseDto>
    suspend fun enroll(request: ELEnrollRequest): Result<ELEnrollmentDto>
    suspend fun getMyEnrollments(status: String? = null, type: String? = null): Result<List<ELEnrollmentDto>>
    suspend fun unenroll(id: Int): Result<Unit>
    suspend fun getPaths(page: Int = 1, limit: Int = 12, level: String? = null, search: String? = null): Result<ELPaginatedResponse<ELLearningPathDto>>
    suspend fun getPathDetail(slug: String): Result<ELLearningPathDto>
    suspend fun startQuiz(quizId: Int, enrollmentId: Int? = null): Result<ELQuizStartResponseDto>
    suspend fun submitQuiz(attemptId: Int, responses: List<ELQuizAnswerDto>): Result<ELQuizSubmitResponseDto>
    suspend fun getQuizAttempts(quizId: Int): Result<List<ELQuizAttemptDto>>
    suspend fun getAttemptResults(attemptId: Int): Result<ELAttemptResultsDto>
    suspend fun getMyCertificates(): Result<List<ELCertificateDto>>
    suspend fun verifyCertificate(code: String): Result<ELCertificateDto>
    suspend fun getUserStats(): Result<ELUserStatsDto>
}
