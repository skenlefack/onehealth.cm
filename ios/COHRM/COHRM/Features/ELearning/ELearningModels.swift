// ELearningModels.swift
// One Health Cameroon - Modèles de données E-Learning

import Foundation

// MARK: - Category

struct ELCategory: Codable, Identifiable {
    let id: Int
    let nameFr: String
    let nameEn: String?
    let slug: String
    let icon: String?
    let color: String?
    let courseCount: Int?

    enum CodingKeys: String, CodingKey {
        case id, slug, icon, color
        case nameFr = "name_fr"
        case nameEn = "name_en"
        case courseCount = "course_count"
    }

    var localizedName: String {
        let lang = UserDefaults.standard.string(forKey: "appLanguage") ?? "fr"
        return (lang == "en" ? nameEn : nil) ?? nameFr
    }
}

// MARK: - Course

struct ELCourse: Codable, Identifiable {
    let id: Int
    let titleFr: String
    let titleEn: String?
    let slug: String
    let descriptionFr: String?
    let descriptionEn: String?
    let shortDescriptionFr: String?
    let shortDescriptionEn: String?
    let thumbnail: String?
    let introVideoUrl: String?
    let level: String
    let durationHours: Double?
    let minPassingScore: Int?
    let maxAttempts: Int?
    let sequentialModules: Bool?
    let isFree: Bool?
    let price: Double?
    let isFeatured: Bool?
    let status: String?
    let enrolledCount: Int?
    let completionCount: Int?
    let averageRating: Double?
    let createdAt: String?
    let learningObjectives: [String]?
    let prerequisites: [String]?

    // Category
    let categoryId: Int?
    let categoryNameFr: String?
    let categoryNameEn: String?
    let categorySlug: String?
    let categoryColor: String?

    // Instructor
    let instructorId: Int?
    let instructorFirstName: String?
    let instructorLastName: String?
    let instructorAvatar: String?
    let instructorTitleFr: String?

    // Computed
    let moduleCount: Int?
    let lessonCount: Int?

    // Final quiz
    let finalQuizId: Int?
    let finalQuizWeight: Double?
    let moduleQuizzesWeight: Double?

    // Enrollment (if authenticated)
    var enrollment: ELEnrollment?

    // Modules (from detail view)
    var modules: [ELModule]?

    enum CodingKeys: String, CodingKey {
        case id, slug, thumbnail, level, price, status, enrollment, modules
        case titleFr = "title_fr"
        case titleEn = "title_en"
        case descriptionFr = "description_fr"
        case descriptionEn = "description_en"
        case shortDescriptionFr = "short_description_fr"
        case shortDescriptionEn = "short_description_en"
        case introVideoUrl = "intro_video_url"
        case durationHours = "duration_hours"
        case minPassingScore = "min_passing_score"
        case maxAttempts = "max_attempts"
        case sequentialModules = "sequential_modules"
        case isFree = "is_free"
        case isFeatured = "is_featured"
        case enrolledCount = "enrolled_count"
        case completionCount = "completion_count"
        case averageRating = "average_rating"
        case createdAt = "created_at"
        case learningObjectives = "learning_objectives"
        case prerequisites
        case categoryId = "category_id"
        case categoryNameFr = "category_name_fr"
        case categoryNameEn = "category_name_en"
        case categorySlug = "category_slug"
        case categoryColor = "category_color"
        case instructorId = "instructor_id"
        case instructorFirstName = "instructor_first_name"
        case instructorLastName = "instructor_last_name"
        case instructorAvatar = "instructor_avatar"
        case instructorTitleFr = "instructor_title_fr"
        case moduleCount = "module_count"
        case lessonCount = "lesson_count"
        case finalQuizId = "final_quiz_id"
        case finalQuizWeight = "final_quiz_weight"
        case moduleQuizzesWeight = "module_quizzes_weight"
    }

    var localizedTitle: String {
        let lang = UserDefaults.standard.string(forKey: "appLanguage") ?? "fr"
        return (lang == "en" ? titleEn : nil) ?? titleFr
    }

    var localizedDescription: String? {
        let lang = UserDefaults.standard.string(forKey: "appLanguage") ?? "fr"
        return (lang == "en" ? descriptionEn : nil) ?? descriptionFr
    }

    var localizedShortDescription: String? {
        let lang = UserDefaults.standard.string(forKey: "appLanguage") ?? "fr"
        return (lang == "en" ? shortDescriptionEn : nil) ?? shortDescriptionFr
    }

    var instructorName: String? {
        guard let first = instructorFirstName else { return nil }
        return [first, instructorLastName].compactMap { $0 }.joined(separator: " ")
    }

    var localizedLevel: String {
        switch level {
        case "beginner": String(localized: "elearning.level.beginner")
        case "intermediate": String(localized: "elearning.level.intermediate")
        case "advanced": String(localized: "elearning.level.advanced")
        default: level
        }
    }
}

// MARK: - Module

struct ELModule: Codable, Identifiable {
    let id: Int
    let courseId: Int?
    let titleFr: String
    let titleEn: String?
    let descriptionFr: String?
    let durationMinutes: Int?
    let sortOrder: Int?
    let sequentialLessons: Bool?
    let hasQuiz: Bool?
    let quizId: Int?
    let status: String?
    let lessonCount: Int?
    var lessons: [ELLesson]?

    enum CodingKeys: String, CodingKey {
        case id, status, lessons
        case courseId = "course_id"
        case titleFr = "title_fr"
        case titleEn = "title_en"
        case descriptionFr = "description_fr"
        case durationMinutes = "duration_minutes"
        case sortOrder = "sort_order"
        case sequentialLessons = "sequential_lessons"
        case hasQuiz = "has_quiz"
        case quizId = "quiz_id"
        case lessonCount = "lesson_count"
    }

    var localizedTitle: String {
        let lang = UserDefaults.standard.string(forKey: "appLanguage") ?? "fr"
        return (lang == "en" ? titleEn : nil) ?? titleFr
    }
}

// MARK: - Lesson

struct ELLesson: Codable, Identifiable {
    let id: Int
    let moduleId: Int?
    let titleFr: String
    let titleEn: String?
    let contentFr: String?
    let contentEn: String?
    let contentType: String?
    let videoUrl: String?
    let videoDurationSeconds: Int?
    let videoProvider: String?
    let pdfUrl: String?
    let pptxUrl: String?
    let durationMinutes: Int?
    let sortOrder: Int?
    let isPreview: Bool?
    let isRequired: Bool?
    let hasQuiz: Bool?
    let quizId: Int?
    let completionType: String?
    let minVideoWatchPercent: Int?

    // Progress (if authenticated)
    var isCompleted: Bool?
    var isLocked: Bool?
    var progressPercent: Int?

    // Navigation
    var prevLesson: ELLessonNav?
    var nextLesson: ELLessonNav?

    // Progress detail
    var progress: ELLessonProgress?

    // Course info
    let courseId: Int?

    enum CodingKeys: String, CodingKey {
        case id, progress
        case moduleId = "module_id"
        case titleFr = "title_fr"
        case titleEn = "title_en"
        case contentFr = "content_fr"
        case contentEn = "content_en"
        case contentType = "content_type"
        case videoUrl = "video_url"
        case videoDurationSeconds = "video_duration_seconds"
        case videoProvider = "video_provider"
        case pdfUrl = "pdf_url"
        case pptxUrl = "pptx_url"
        case durationMinutes = "duration_minutes"
        case sortOrder = "sort_order"
        case isPreview = "is_preview"
        case isRequired = "is_required"
        case hasQuiz = "has_quiz"
        case quizId = "quiz_id"
        case completionType = "completion_type"
        case minVideoWatchPercent = "min_video_watch_percent"
        case isCompleted = "is_completed"
        case isLocked = "is_locked"
        case progressPercent = "progress_percent"
        case prevLesson = "prev_lesson"
        case nextLesson = "next_lesson"
        case courseId = "course_id"
    }

    var localizedTitle: String {
        let lang = UserDefaults.standard.string(forKey: "appLanguage") ?? "fr"
        return (lang == "en" ? titleEn : nil) ?? titleFr
    }

    var localizedContent: String? {
        let lang = UserDefaults.standard.string(forKey: "appLanguage") ?? "fr"
        return (lang == "en" ? contentEn : nil) ?? contentFr
    }
}

struct ELLessonNav: Codable {
    let id: Int
    let titleFr: String?
    let sortOrder: Int?

    enum CodingKeys: String, CodingKey {
        case id
        case titleFr = "title_fr"
        case sortOrder = "sort_order"
    }
}

struct ELLessonProgress: Codable {
    let status: String?
    let progressPercent: Int?
    let videoWatchTimeSeconds: Int?
    let videoLastPositionSeconds: Int?
    let timeSpentSeconds: Int?
    let completedAt: String?

    enum CodingKeys: String, CodingKey {
        case status
        case progressPercent = "progress_percent"
        case videoWatchTimeSeconds = "video_watch_time_seconds"
        case videoLastPositionSeconds = "video_last_position_seconds"
        case timeSpentSeconds = "time_spent_seconds"
        case completedAt = "completed_at"
    }
}

// MARK: - Enrollment

struct ELEnrollment: Codable, Identifiable {
    let id: Int
    let userId: Int?
    let enrollableType: String?
    let enrollableId: Int?
    let status: String?
    let progressPercent: Int?
    let enrolledAt: String?
    let startedAt: String?
    let completedAt: String?
    let lastAccessedAt: String?
    let finalScore: Double?
    let totalTimeSpentMinutes: Int?
    let certificateId: Int?
    let lessonsCompleted: Int?

    // Joined
    let titleFr: String?
    let titleEn: String?
    let thumbnail: String?
    let level: String?
    let slug: String?

    enum CodingKeys: String, CodingKey {
        case id, status, thumbnail, level, slug
        case userId = "user_id"
        case enrollableType = "enrollable_type"
        case enrollableId = "enrollable_id"
        case progressPercent = "progress_percent"
        case enrolledAt = "enrolled_at"
        case startedAt = "started_at"
        case completedAt = "completed_at"
        case lastAccessedAt = "last_accessed_at"
        case finalScore = "final_score"
        case totalTimeSpentMinutes = "total_time_spent_minutes"
        case certificateId = "certificate_id"
        case lessonsCompleted = "lessons_completed"
        case titleFr = "title_fr"
        case titleEn = "title_en"
    }

    var localizedTitle: String {
        let lang = UserDefaults.standard.string(forKey: "appLanguage") ?? "fr"
        return (lang == "en" ? titleEn : nil) ?? titleFr ?? ""
    }
}

// MARK: - Certificate

struct ELCertificate: Codable, Identifiable {
    let id: Int
    let certificateNumber: String?
    let enrollableType: String?
    let enrollableId: Int?
    let recipientName: String?
    let titleFr: String?
    let titleEn: String?
    let finalScore: Double?
    let totalHours: Double?
    let issueDate: String?
    let expiryDate: String?
    let verificationCode: String?
    let status: String?
    let courseTitleFr: String?
    let courseTitleEn: String?
    let thumbnail: String?

    enum CodingKeys: String, CodingKey {
        case id, status, thumbnail
        case certificateNumber = "certificate_number"
        case enrollableType = "enrollable_type"
        case enrollableId = "enrollable_id"
        case recipientName = "recipient_name"
        case titleFr = "title_fr"
        case titleEn = "title_en"
        case finalScore = "final_score"
        case totalHours = "total_hours"
        case issueDate = "issue_date"
        case expiryDate = "expiry_date"
        case verificationCode = "verification_code"
        case courseTitleFr = "course_title_fr"
        case courseTitleEn = "course_title_en"
    }
}

// MARK: - User Stats

struct ELUserStats: Codable {
    let enrolledCourses: Int?
    let completedCourses: Int?
    let inProgressCourses: Int?
    let certificates: Int?
    let totalTimeSpent: Int?
    let lessonsCompleted: Int?
}

// MARK: - Curriculum

struct ELCurriculum: Codable {
    let course: ELCurriculumCourse?
    let modules: [ELModule]?
}

struct ELCurriculumCourse: Codable {
    let id: Int
    let titleFr: String?
    let sequentialModules: Bool?

    enum CodingKeys: String, CodingKey {
        case id
        case titleFr = "title_fr"
        case sequentialModules = "sequential_modules"
    }
}

// MARK: - Quiz

struct ELQuiz: Codable, Identifiable {
    let id: Int
    let titleFr: String?
    let titleEn: String?
    let instructionsFr: String?
    let instructionsEn: String?
    let timeLimitMinutes: Int?
    let passingScore: Int?
    let shuffleOptions: Bool?
    let showCorrectAnswers: Bool?
    let showExplanation: Bool?
    let maxAttempts: Int?

    enum CodingKeys: String, CodingKey {
        case id
        case titleFr = "title_fr"
        case titleEn = "title_en"
        case instructionsFr = "instructions_fr"
        case instructionsEn = "instructions_en"
        case timeLimitMinutes = "time_limit_minutes"
        case passingScore = "passing_score"
        case shuffleOptions = "shuffle_options"
        case showCorrectAnswers = "show_correct_answers"
        case showExplanation = "show_explanation"
        case maxAttempts = "max_attempts"
    }

    var localizedTitle: String {
        let lang = UserDefaults.standard.string(forKey: "appLanguage") ?? "fr"
        return (lang == "en" ? titleEn : nil) ?? titleFr ?? ""
    }
}

struct ELQuizQuestion: Codable, Identifiable {
    let id: Int
    let questionTextFr: String?
    let questionTextEn: String?
    let questionType: String?
    let imageUrl: String?
    let points: Int?
    let hintFr: String?
    let hintEn: String?
    let options: [ELQuizOption]?

    enum CodingKeys: String, CodingKey {
        case id, options, points
        case questionTextFr = "question_text_fr"
        case questionTextEn = "question_text_en"
        case questionType = "question_type"
        case imageUrl = "image_url"
        case hintFr = "hint_fr"
        case hintEn = "hint_en"
    }

    var localizedText: String {
        let lang = UserDefaults.standard.string(forKey: "appLanguage") ?? "fr"
        return (lang == "en" ? questionTextEn : nil) ?? questionTextFr ?? ""
    }
}

struct ELQuizOption: Codable, Identifiable {
    let id: Int
    let textFr: String?
    let textEn: String?
    let imageUrl: String?

    enum CodingKeys: String, CodingKey {
        case id
        case textFr = "text_fr"
        case textEn = "text_en"
        case imageUrl = "image_url"
    }

    var localizedText: String {
        let lang = UserDefaults.standard.string(forKey: "appLanguage") ?? "fr"
        return (lang == "en" ? textEn : nil) ?? textFr ?? ""
    }
}

// MARK: - Quiz Attempt

struct ELQuizStartResponse: Codable {
    let attempt: ELQuizAttempt?
    let quiz: ELQuiz?
    let questions: [ELQuizQuestion]?
}

struct ELQuizAttempt: Codable, Identifiable {
    let id: Int
    let quizId: Int?
    let attemptNumber: Int?
    let status: String?
    let score: Double?
    let scorePercent: Double?
    let maxScore: Double?
    let correctCount: Int?
    let totalQuestions: Int?
    let passed: Bool?
    let timeSpentSeconds: Int?
    let startedAt: String?
    let completedAt: String?

    enum CodingKeys: String, CodingKey {
        case id, status, score, passed
        case quizId = "quiz_id"
        case attemptNumber = "attempt_number"
        case scorePercent = "score_percent"
        case maxScore = "max_score"
        case correctCount = "correct_count"
        case totalQuestions = "total_questions"
        case timeSpentSeconds = "time_spent_seconds"
        case startedAt = "started_at"
        case completedAt = "completed_at"
    }
}

struct ELQuizSubmitResponse: Codable {
    let score: Double?
    let scorePercent: Double?
    let maxScore: Double?
    let correctCount: Int?
    let totalQuestions: Int?
    let passed: Bool?
    let timeSpentSeconds: Int?
    let showCorrectAnswers: Bool?
    let showExplanation: Bool?

    enum CodingKeys: String, CodingKey {
        case score, passed
        case scorePercent = "score_percent"
        case maxScore = "max_score"
        case correctCount = "correct_count"
        case totalQuestions = "total_questions"
        case timeSpentSeconds = "time_spent_seconds"
        case showCorrectAnswers = "show_correct_answers"
        case showExplanation = "show_explanation"
    }
}

// MARK: - Quiz Response (answer submission)

struct ELQuizAnswer: Codable {
    let questionId: Int
    let answer: AnyCodableValue

    enum CodingKeys: String, CodingKey {
        case questionId = "question_id"
        case answer
    }
}

/// Wrapper for polymorphic answer values (Int, [Int], Bool, String, [String])
enum AnyCodableValue: Codable {
    case int(Int)
    case intArray([Int])
    case bool(Bool)
    case string(String)
    case stringArray([String])

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .int(let v): try container.encode(v)
        case .intArray(let v): try container.encode(v)
        case .bool(let v): try container.encode(v)
        case .string(let v): try container.encode(v)
        case .stringArray(let v): try container.encode(v)
        }
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let v = try? container.decode(Bool.self) { self = .bool(v); return }
        if let v = try? container.decode(Int.self) { self = .int(v); return }
        if let v = try? container.decode([Int].self) { self = .intArray(v); return }
        if let v = try? container.decode(String.self) { self = .string(v); return }
        if let v = try? container.decode([String].self) { self = .stringArray(v); return }
        throw DecodingError.dataCorruptedError(in: container, debugDescription: "Cannot decode AnyCodableValue")
    }
}

// MARK: - Learning Path

struct ELLearningPath: Codable, Identifiable {
    let id: Int
    let titleFr: String
    let titleEn: String?
    let slug: String
    let descriptionFr: String?
    let descriptionEn: String?
    let thumbnail: String?
    let level: String?
    let durationHours: Double?
    let minPassingScore: Int?
    let requireAllCourses: Bool?
    let requireFinalExam: Bool?
    let certificateEnabled: Bool?
    let isFeatured: Bool?
    let enrolledCount: Int?
    let courseCount: Int?
    let categoryNameFr: String?
    let instructorFirstName: String?
    let instructorLastName: String?

    var courses: [ELCourse]?
    var enrollment: ELEnrollment?

    enum CodingKeys: String, CodingKey {
        case id, slug, thumbnail, level, courses, enrollment
        case titleFr = "title_fr"
        case titleEn = "title_en"
        case descriptionFr = "description_fr"
        case descriptionEn = "description_en"
        case durationHours = "duration_hours"
        case minPassingScore = "min_passing_score"
        case requireAllCourses = "require_all_courses"
        case requireFinalExam = "require_final_exam"
        case certificateEnabled = "certificate_enabled"
        case isFeatured = "is_featured"
        case enrolledCount = "enrolled_count"
        case courseCount = "course_count"
        case categoryNameFr = "category_name_fr"
        case instructorFirstName = "instructor_first_name"
        case instructorLastName = "instructor_last_name"
    }

    var localizedTitle: String {
        let lang = UserDefaults.standard.string(forKey: "appLanguage") ?? "fr"
        return (lang == "en" ? titleEn : nil) ?? titleFr
    }

    var instructorName: String? {
        guard let first = instructorFirstName else { return nil }
        return [first, instructorLastName].compactMap { $0 }.joined(separator: " ")
    }
}

// MARK: - Pagination

struct ELPagination: Codable {
    let page: Int?
    let limit: Int?
    let total: Int?
    let pages: Int?
}

// MARK: - Paginated Response

struct ELPaginatedResponse<T: Codable>: Codable {
    let success: Bool
    let data: [T]?
    let pagination: ELPagination?
    let message: String?
}

// MARK: - Lesson completion response

struct ELLessonCompleteResponse: Codable {
    let lessonCompleted: Bool?
    let courseProgress: Int?
    let courseCompleted: Bool?

    enum CodingKeys: String, CodingKey {
        case lessonCompleted = "lesson_completed"
        case courseProgress = "course_progress"
        case courseCompleted = "course_completed"
    }
}
