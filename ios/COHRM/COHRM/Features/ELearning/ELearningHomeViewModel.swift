// ELearningHomeViewModel.swift
// One Health Cameroon - ViewModel pour l'accueil E-Learning

import Foundation

@MainActor
@Observable
final class ELearningHomeViewModel {

    var categories: [ELCategory] = []
    var featuredCourses: [ELCourse] = []
    var inProgressEnrollments: [ELEnrollment] = []
    var userStats: ELUserStats?
    var isLoading = false
    var errorMessage: String?

    func loadAll() async {
        isLoading = true
        errorMessage = nil

        async let cats = loadCategories()
        async let featured = loadFeatured()
        async let enrollments = loadEnrollments()
        async let stats = loadStats()

        _ = await (cats, featured, enrollments, stats)
        isLoading = false
    }

    private func loadCategories() async {
        do {
            let response = try await ELearningService.shared.getCategories()
            if let data = response.data { categories = data }
        } catch {
            print("[E-Learning] Categories error: \(error.localizedDescription)")
        }
    }

    private func loadFeatured() async {
        do {
            let response = try await ELearningService.shared.getCourses(limit: 6, featured: true)
            if let data = response.data { featuredCourses = data }
        } catch {
            print("[E-Learning] Featured error: \(error.localizedDescription)")
        }
    }

    private func loadEnrollments() async {
        do {
            let response = try await ELearningService.shared.getMyEnrollments(status: "in_progress", type: "course")
            if let data = response.data { inProgressEnrollments = data }
        } catch {
            print("[E-Learning] Enrollments error: \(error.localizedDescription)")
        }
    }

    private func loadStats() async {
        do {
            let response = try await ELearningService.shared.getUserStats()
            userStats = response.data
        } catch {
            print("[E-Learning] Stats error: \(error.localizedDescription)")
        }
    }
}
