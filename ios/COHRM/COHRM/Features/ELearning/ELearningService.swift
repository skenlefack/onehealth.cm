// ELearningService.swift
// One Health Cameroon - Service API pour le module E-Learning

import Foundation

/// Service API pour le module E-Learning
actor ELearningService {

    static let shared = ELearningService()
    private let client = APIClient.shared
    private init() {}

    private let base = "/elearning"

    // MARK: - Categories

    func getCategories() async throws -> APIResponse<[ELCategory]> {
        try await client.get("\(base)/categories", responseType: APIResponse<[ELCategory]>.self)
    }

    // MARK: - Courses

    func getCourses(page: Int = 1, limit: Int = 12, category: String? = nil, level: String? = nil, search: String? = nil, featured: Bool? = nil) async throws -> ELPaginatedResponse<ELCourse> {
        var params: [String: String] = ["page": "\(page)", "limit": "\(limit)"]
        if let category { params["category"] = category }
        if let level { params["level"] = level }
        if let search, !search.isEmpty { params["search"] = search }
        if featured == true { params["featured"] = "true" }
        return try await client.get("\(base)/courses", queryParams: params, responseType: ELPaginatedResponse<ELCourse>.self)
    }

    func getCourseDetail(slug: String) async throws -> APIResponse<ELCourse> {
        try await client.get("\(base)/courses/\(slug)", responseType: APIResponse<ELCourse>.self)
    }

    func getCurriculum(courseId: Int) async throws -> APIResponse<ELCurriculum> {
        try await client.get("\(base)/courses/\(courseId)/curriculum", responseType: APIResponse<ELCurriculum>.self)
    }

    // MARK: - Lessons

    func getLessonDetail(lessonId: Int) async throws -> APIResponse<ELLesson> {
        try await client.get("\(base)/lessons/\(lessonId)", responseType: APIResponse<ELLesson>.self)
    }

    func updateLessonProgress(lessonId: Int, progressPercent: Int? = nil, videoWatchTime: Int? = nil, videoPosition: Int? = nil, timeSpent: Int? = nil) async throws -> APIResponse<ELLessonProgress> {
        var body: [String: Any] = [:]
        if let progressPercent { body["progress_percent"] = progressPercent }
        if let videoWatchTime { body["video_watch_time_seconds"] = videoWatchTime }
        if let videoPosition { body["video_last_position_seconds"] = videoPosition }
        if let timeSpent { body["time_spent_seconds"] = timeSpent }
        return try await client.post("\(base)/lessons/\(lessonId)/progress", body: body, responseType: APIResponse<ELLessonProgress>.self)
    }

    func completeLesson(lessonId: Int) async throws -> APIResponse<ELLessonCompleteResponse> {
        try await client.post("\(base)/lessons/\(lessonId)/complete", body: [:], responseType: APIResponse<ELLessonCompleteResponse>.self)
    }

    // MARK: - Enrollments

    func enroll(type: String, id: Int) async throws -> APIResponse<ELEnrollment> {
        try await client.post("\(base)/enroll", body: ["enrollable_type": type, "enrollable_id": id], responseType: APIResponse<ELEnrollment>.self)
    }

    func getMyEnrollments(status: String? = nil, type: String? = nil) async throws -> APIResponse<[ELEnrollment]> {
        var params: [String: String] = [:]
        if let status { params["status"] = status }
        if let type { params["type"] = type }
        return try await client.get("\(base)/enrollments", queryParams: params, responseType: APIResponse<[ELEnrollment]>.self)
    }

    // MARK: - Learning Paths

    func getPaths(page: Int = 1, limit: Int = 12, level: String? = nil, search: String? = nil) async throws -> ELPaginatedResponse<ELLearningPath> {
        var params: [String: String] = ["page": "\(page)", "limit": "\(limit)"]
        if let level { params["level"] = level }
        if let search, !search.isEmpty { params["search"] = search }
        return try await client.get("\(base)/paths", queryParams: params, responseType: ELPaginatedResponse<ELLearningPath>.self)
    }

    func getPathDetail(slug: String) async throws -> APIResponse<ELLearningPath> {
        try await client.get("\(base)/paths/\(slug)", responseType: APIResponse<ELLearningPath>.self)
    }

    // MARK: - Quiz

    func startQuiz(quizId: Int, enrollmentId: Int? = nil) async throws -> APIResponse<ELQuizStartResponse> {
        var body: [String: Any] = [:]
        if let enrollmentId { body["enrollment_id"] = enrollmentId }
        return try await client.post("\(base)/quizzes/\(quizId)/start", body: body, responseType: APIResponse<ELQuizStartResponse>.self)
    }

    func submitQuiz(attemptId: Int, responses: [[String: Any]]) async throws -> APIResponse<ELQuizSubmitResponse> {
        try await client.post("\(base)/attempts/\(attemptId)/submit", body: ["responses": responses], responseType: APIResponse<ELQuizSubmitResponse>.self)
    }

    func getQuizHistory(quizId: Int) async throws -> APIResponse<[ELQuizAttempt]> {
        try await client.get("\(base)/quizzes/\(quizId)/attempts", responseType: APIResponse<[ELQuizAttempt]>.self)
    }

    // MARK: - Certificates

    func getMyCertificates() async throws -> APIResponse<[ELCertificate]> {
        try await client.get("\(base)/certificates", responseType: APIResponse<[ELCertificate]>.self)
    }

    func verifyCertificate(code: String) async throws -> APIResponse<ELCertificate> {
        try await client.get("\(base)/certificates/verify/\(code)", responseType: APIResponse<ELCertificate>.self)
    }

    // MARK: - Stats

    func getUserStats() async throws -> APIResponse<ELUserStats> {
        try await client.get("\(base)/stats/user", responseType: APIResponse<ELUserStats>.self)
    }
}
