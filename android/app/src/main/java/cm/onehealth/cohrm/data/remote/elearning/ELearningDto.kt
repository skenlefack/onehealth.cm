package cm.onehealth.cohrm.data.remote.elearning

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class ELApiResponse<T>(
    @Json(name = "success") val success: Boolean? = null,
    @Json(name = "data") val data: T? = null,
    @Json(name = "message") val message: String? = null,
)

@JsonClass(generateAdapter = true)
data class ELPaginatedResponse<T>(
    @Json(name = "success") val success: Boolean? = null,
    @Json(name = "data") val data: List<T>? = null,
    @Json(name = "pagination") val pagination: ELPaginationDto? = null,
    @Json(name = "message") val message: String? = null,
)

@JsonClass(generateAdapter = true)
data class ELPaginationDto(
    @Json(name = "page") val page: Int? = null,
    @Json(name = "limit") val limit: Int? = null,
    @Json(name = "total") val total: Int? = null,
    @Json(name = "pages") val pages: Int? = null,
)

// --- Category ---

@JsonClass(generateAdapter = true)
data class ELCategoryDto(
    @Json(name = "id") val id: Int,
    @Json(name = "name_fr") val nameFr: String? = null,
    @Json(name = "name_en") val nameEn: String? = null,
    @Json(name = "slug") val slug: String? = null,
    @Json(name = "icon") val icon: String? = null,
    @Json(name = "color") val color: String? = null,
    @Json(name = "course_count") val courseCount: Int? = null,
)

// --- Course ---

@JsonClass(generateAdapter = true)
data class ELCourseDto(
    @Json(name = "id") val id: Int,
    @Json(name = "title_fr") val titleFr: String? = null,
    @Json(name = "title_en") val titleEn: String? = null,
    @Json(name = "slug") val slug: String? = null,
    @Json(name = "description_fr") val descriptionFr: String? = null,
    @Json(name = "description_en") val descriptionEn: String? = null,
    @Json(name = "thumbnail") val thumbnail: String? = null,
    @Json(name = "level") val level: String? = null,
    @Json(name = "duration_hours") val durationHours: Double? = null,
    @Json(name = "min_passing_score") val minPassingScore: Int? = null,
    @Json(name = "max_attempts") val maxAttempts: Int? = null,
    @Json(name = "sequential_modules") val sequentialModules: Boolean? = null,
    @Json(name = "is_free") val isFree: Boolean? = null,
    @Json(name = "price") val price: Double? = null,
    @Json(name = "is_featured") val isFeatured: Boolean? = null,
    @Json(name = "category_id") val categoryId: Int? = null,
    @Json(name = "category_name_fr") val categoryNameFr: String? = null,
    @Json(name = "category_name_en") val categoryNameEn: String? = null,
    @Json(name = "category_color") val categoryColor: String? = null,
    @Json(name = "instructor_id") val instructorId: Int? = null,
    @Json(name = "instructor_first_name") val instructorFirstName: String? = null,
    @Json(name = "instructor_last_name") val instructorLastName: String? = null,
    @Json(name = "instructor_avatar") val instructorAvatar: String? = null,
    @Json(name = "module_count") val moduleCount: Int? = null,
    @Json(name = "lesson_count") val lessonCount: Int? = null,
    @Json(name = "enrolled_count") val enrolledCount: Int? = null,
    @Json(name = "learning_objectives") val learningObjectives: List<String>? = null,
    @Json(name = "prerequisites") val prerequisites: List<String>? = null,
    @Json(name = "final_quiz_id") val finalQuizId: Int? = null,
    @Json(name = "enrollment") val enrollment: ELEnrollmentDto? = null,
    @Json(name = "modules") val modules: List<ELModuleDto>? = null,
) {
    val localizedTitle: String get() = titleFr ?: titleEn ?: ""
    val instructorName: String get() = listOfNotNull(instructorFirstName, instructorLastName).joinToString(" ")
}

// --- Module ---

@JsonClass(generateAdapter = true)
data class ELModuleDto(
    @Json(name = "id") val id: Int,
    @Json(name = "course_id") val courseId: Int? = null,
    @Json(name = "title_fr") val titleFr: String? = null,
    @Json(name = "title_en") val titleEn: String? = null,
    @Json(name = "description_fr") val descriptionFr: String? = null,
    @Json(name = "duration_minutes") val durationMinutes: Int? = null,
    @Json(name = "sort_order") val sortOrder: Int? = null,
    @Json(name = "sequential_lessons") val sequentialLessons: Boolean? = null,
    @Json(name = "has_quiz") val hasQuiz: Boolean? = null,
    @Json(name = "quiz_id") val quizId: Int? = null,
    @Json(name = "lesson_count") val lessonCount: Int? = null,
    @Json(name = "lessons") val lessons: List<ELLessonDto>? = null,
) {
    val localizedTitle: String get() = titleFr ?: titleEn ?: ""
}

// --- Lesson ---

@JsonClass(generateAdapter = true)
data class ELLessonDto(
    @Json(name = "id") val id: Int,
    @Json(name = "module_id") val moduleId: Int? = null,
    @Json(name = "title_fr") val titleFr: String? = null,
    @Json(name = "title_en") val titleEn: String? = null,
    @Json(name = "content_fr") val contentFr: String? = null,
    @Json(name = "content_en") val contentEn: String? = null,
    @Json(name = "content_type") val contentType: String? = null,
    @Json(name = "video_url") val videoUrl: String? = null,
    @Json(name = "video_duration_seconds") val videoDurationSeconds: Int? = null,
    @Json(name = "video_provider") val videoProvider: String? = null,
    @Json(name = "pdf_url") val pdfUrl: String? = null,
    @Json(name = "pptx_url") val pptxUrl: String? = null,
    @Json(name = "docx_url") val docxUrl: String? = null,
    @Json(name = "xlsx_url") val xlsxUrl: String? = null,
    @Json(name = "duration_minutes") val durationMinutes: Int? = null,
    @Json(name = "sort_order") val sortOrder: Int? = null,
    @Json(name = "is_preview") val isPreview: Boolean? = null,
    @Json(name = "is_required") val isRequired: Boolean? = null,
    @Json(name = "has_quiz") val hasQuiz: Boolean? = null,
    @Json(name = "quiz_id") val quizId: Int? = null,
    @Json(name = "completion_type") val completionType: String? = null,
    @Json(name = "min_video_watch_percent") val minVideoWatchPercent: Int? = null,
    @Json(name = "is_completed") val isCompleted: Boolean? = null,
    @Json(name = "is_locked") val isLocked: Boolean? = null,
    @Json(name = "progress_percent") val progressPercent: Int? = null,
    @Json(name = "prev_lesson") val prevLesson: ELLessonNavDto? = null,
    @Json(name = "next_lesson") val nextLesson: ELLessonNavDto? = null,
    @Json(name = "progress") val progress: ELLessonProgressDto? = null,
) {
    val localizedTitle: String get() = titleFr ?: titleEn ?: ""
    val localizedContent: String get() = contentFr ?: contentEn ?: ""
}

@JsonClass(generateAdapter = true)
data class ELLessonNavDto(
    @Json(name = "id") val id: Int,
    @Json(name = "title_fr") val titleFr: String? = null,
    @Json(name = "title_en") val titleEn: String? = null,
)

@JsonClass(generateAdapter = true)
data class ELLessonProgressDto(
    @Json(name = "progress_percent") val progressPercent: Int? = null,
    @Json(name = "video_watch_time_seconds") val videoWatchTimeSeconds: Int? = null,
    @Json(name = "video_last_position_seconds") val videoLastPositionSeconds: Int? = null,
    @Json(name = "time_spent_seconds") val timeSpentSeconds: Int? = null,
    @Json(name = "access_count") val accessCount: Int? = null,
    @Json(name = "is_completed") val isCompleted: Boolean? = null,
)

@JsonClass(generateAdapter = true)
data class ELLessonCompleteResponseDto(
    @Json(name = "lesson_completed") val lessonCompleted: Boolean? = null,
    @Json(name = "course_progress") val courseProgress: Int? = null,
    @Json(name = "course_completed") val courseCompleted: Boolean? = null,
)

// --- Enrollment ---

@JsonClass(generateAdapter = true)
data class ELEnrollmentDto(
    @Json(name = "id") val id: Int,
    @Json(name = "user_id") val userId: Int? = null,
    @Json(name = "enrollable_type") val enrollableType: String? = null,
    @Json(name = "enrollable_id") val enrollableId: Int? = null,
    @Json(name = "status") val status: String? = null,
    @Json(name = "progress_percent") val progressPercent: Int? = null,
    @Json(name = "enrolled_at") val enrolledAt: String? = null,
    @Json(name = "started_at") val startedAt: String? = null,
    @Json(name = "completed_at") val completedAt: String? = null,
    @Json(name = "last_accessed_at") val lastAccessedAt: String? = null,
    @Json(name = "final_score") val finalScore: Double? = null,
    @Json(name = "total_time_spent_minutes") val totalTimeSpentMinutes: Int? = null,
    @Json(name = "certificate_id") val certificateId: Int? = null,
    @Json(name = "lessons_completed") val lessonsCompleted: Int? = null,
    @Json(name = "title_fr") val titleFr: String? = null,
    @Json(name = "title_en") val titleEn: String? = null,
    @Json(name = "thumbnail") val thumbnail: String? = null,
    @Json(name = "level") val level: String? = null,
    @Json(name = "slug") val slug: String? = null,
) {
    val localizedTitle: String get() = titleFr ?: titleEn ?: ""
}

// --- Certificate ---

@JsonClass(generateAdapter = true)
data class ELCertificateDto(
    @Json(name = "id") val id: Int,
    @Json(name = "certificate_number") val certificateNumber: String? = null,
    @Json(name = "enrollable_type") val enrollableType: String? = null,
    @Json(name = "enrollable_id") val enrollableId: Int? = null,
    @Json(name = "recipient_name") val recipientName: String? = null,
    @Json(name = "title_fr") val titleFr: String? = null,
    @Json(name = "title_en") val titleEn: String? = null,
    @Json(name = "final_score") val finalScore: Double? = null,
    @Json(name = "total_hours") val totalHours: Double? = null,
    @Json(name = "issue_date") val issueDate: String? = null,
    @Json(name = "expiry_date") val expiryDate: String? = null,
    @Json(name = "verification_code") val verificationCode: String? = null,
    @Json(name = "status") val status: String? = null,
)

// --- Quiz ---

@JsonClass(generateAdapter = true)
data class ELQuizDto(
    @Json(name = "id") val id: Int,
    @Json(name = "title_fr") val titleFr: String? = null,
    @Json(name = "title_en") val titleEn: String? = null,
    @Json(name = "instructions_fr") val instructionsFr: String? = null,
    @Json(name = "instructions_en") val instructionsEn: String? = null,
    @Json(name = "time_limit_minutes") val timeLimitMinutes: Int? = null,
    @Json(name = "passing_score") val passingScore: Int? = null,
    @Json(name = "max_attempts") val maxAttempts: Int? = null,
    @Json(name = "shuffle_options") val shuffleOptions: Boolean? = null,
    @Json(name = "show_correct_answers") val showCorrectAnswers: Boolean? = null,
    @Json(name = "show_explanation") val showExplanation: Boolean? = null,
)

@JsonClass(generateAdapter = true)
data class ELQuizQuestionDto(
    @Json(name = "id") val id: Int,
    @Json(name = "question_text_fr") val questionTextFr: String? = null,
    @Json(name = "question_text_en") val questionTextEn: String? = null,
    @Json(name = "question_type") val questionType: String? = null,
    @Json(name = "image_url") val imageUrl: String? = null,
    @Json(name = "points") val points: Int? = null,
    @Json(name = "hint_fr") val hintFr: String? = null,
    @Json(name = "hint_en") val hintEn: String? = null,
    @Json(name = "options") val options: List<ELQuizOptionDto>? = null,
    @Json(name = "correct_answer") val correctAnswer: String? = null,
) {
    val localizedText: String get() = questionTextFr ?: questionTextEn ?: ""
}

@JsonClass(generateAdapter = true)
data class ELQuizOptionDto(
    @Json(name = "id") val id: Int,
    @Json(name = "text_fr") val textFr: String? = null,
    @Json(name = "text_en") val textEn: String? = null,
    @Json(name = "image_url") val imageUrl: String? = null,
) {
    val localizedText: String get() = textFr ?: textEn ?: ""
}

@JsonClass(generateAdapter = true)
data class ELQuizAttemptDto(
    @Json(name = "id") val id: Int,
    @Json(name = "quiz_id") val quizId: Int? = null,
    @Json(name = "attempt_number") val attemptNumber: Int? = null,
    @Json(name = "status") val status: String? = null,
    @Json(name = "score") val score: Double? = null,
    @Json(name = "score_percent") val scorePercent: Double? = null,
    @Json(name = "max_score") val maxScore: Double? = null,
    @Json(name = "correct_count") val correctCount: Int? = null,
    @Json(name = "total_questions") val totalQuestions: Int? = null,
    @Json(name = "passed") val passed: Boolean? = null,
    @Json(name = "time_spent_seconds") val timeSpentSeconds: Int? = null,
    @Json(name = "started_at") val startedAt: String? = null,
    @Json(name = "completed_at") val completedAt: String? = null,
)

@JsonClass(generateAdapter = true)
data class ELQuizStartResponseDto(
    @Json(name = "attempt") val attempt: ELQuizAttemptDto? = null,
    @Json(name = "quiz") val quiz: ELQuizDto? = null,
    @Json(name = "questions") val questions: List<ELQuizQuestionDto>? = null,
)

@JsonClass(generateAdapter = true)
data class ELQuizSubmitResponseDto(
    @Json(name = "score") val score: Double? = null,
    @Json(name = "score_percent") val scorePercent: Double? = null,
    @Json(name = "max_score") val maxScore: Double? = null,
    @Json(name = "correct_count") val correctCount: Int? = null,
    @Json(name = "total_questions") val totalQuestions: Int? = null,
    @Json(name = "passed") val passed: Boolean? = null,
    @Json(name = "time_spent_seconds") val timeSpentSeconds: Int? = null,
    @Json(name = "show_correct_answers") val showCorrectAnswers: Boolean? = null,
    @Json(name = "show_explanation") val showExplanation: Boolean? = null,
)

@JsonClass(generateAdapter = true)
data class ELAttemptResultsDto(
    @Json(name = "attempt") val attempt: ELQuizAttemptDto? = null,
    @Json(name = "results") val results: List<ELQuestionResultDto>? = null,
    @Json(name = "summary") val summary: ELQuizSubmitResponseDto? = null,
)

@JsonClass(generateAdapter = true)
data class ELQuestionResultDto(
    @Json(name = "question_id") val questionId: Int? = null,
    @Json(name = "question_text") val questionText: String? = null,
    @Json(name = "question_type") val questionType: String? = null,
    @Json(name = "user_answer") val userAnswer: String? = null,
    @Json(name = "correct_answer") val correctAnswer: String? = null,
    @Json(name = "is_correct") val isCorrect: Boolean? = null,
    @Json(name = "points_earned") val pointsEarned: Double? = null,
    @Json(name = "points_possible") val pointsPossible: Double? = null,
    @Json(name = "explanation") val explanation: String? = null,
)

// --- Learning Path ---

@JsonClass(generateAdapter = true)
data class ELLearningPathDto(
    @Json(name = "id") val id: Int,
    @Json(name = "title_fr") val titleFr: String? = null,
    @Json(name = "title_en") val titleEn: String? = null,
    @Json(name = "slug") val slug: String? = null,
    @Json(name = "description_fr") val descriptionFr: String? = null,
    @Json(name = "description_en") val descriptionEn: String? = null,
    @Json(name = "thumbnail") val thumbnail: String? = null,
    @Json(name = "level") val level: String? = null,
    @Json(name = "duration_hours") val durationHours: Double? = null,
    @Json(name = "certificate_enabled") val certificateEnabled: Boolean? = null,
    @Json(name = "is_featured") val isFeatured: Boolean? = null,
    @Json(name = "enrolled_count") val enrolledCount: Int? = null,
    @Json(name = "course_count") val courseCount: Int? = null,
    @Json(name = "courses") val courses: List<ELCourseDto>? = null,
    @Json(name = "enrollment") val enrollment: ELEnrollmentDto? = null,
) {
    val localizedTitle: String get() = titleFr ?: titleEn ?: ""
}

// --- Curriculum ---

@JsonClass(generateAdapter = true)
data class ELCurriculumDto(
    @Json(name = "course") val course: ELCourseDto? = null,
    @Json(name = "modules") val modules: List<ELModuleDto>? = null,
)

// --- User Stats ---

@JsonClass(generateAdapter = true)
data class ELUserStatsDto(
    @Json(name = "enrolled") val enrolled: Int? = null,
    @Json(name = "in_progress") val inProgress: Int? = null,
    @Json(name = "completed") val completed: Int? = null,
    @Json(name = "certificates") val certificates: Int? = null,
    @Json(name = "total_time_spent_minutes") val totalTimeSpentMinutes: Int? = null,
    @Json(name = "lessons_completed") val lessonsCompleted: Int? = null,
)

// --- Request DTOs ---

@JsonClass(generateAdapter = true)
data class ELEnrollRequest(
    @Json(name = "enrollable_type") val enrollableType: String,
    @Json(name = "enrollable_id") val enrollableId: Int,
)

@JsonClass(generateAdapter = true)
data class ELLessonProgressRequest(
    @Json(name = "progress_percent") val progressPercent: Int? = null,
    @Json(name = "video_watch_time_seconds") val videoWatchTimeSeconds: Int? = null,
    @Json(name = "video_last_position_seconds") val videoLastPositionSeconds: Int? = null,
    @Json(name = "time_spent_seconds") val timeSpentSeconds: Int? = null,
)

@JsonClass(generateAdapter = true)
data class ELQuizStartRequest(
    @Json(name = "enrollment_id") val enrollmentId: Int? = null,
)

@JsonClass(generateAdapter = true)
data class ELQuizSubmitRequest(
    @Json(name = "responses") val responses: List<ELQuizAnswerDto>,
)

@JsonClass(generateAdapter = true)
data class ELQuizAnswerDto(
    @Json(name = "question_id") val questionId: Int,
    @Json(name = "answer") val answer: String?,
)
