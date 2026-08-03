// PlatformHomeViewModel.swift
// One Health Cameroon Platform — ViewModel de l'écran d'accueil
//
// Charge les statistiques résumées de chaque module
// depuis les API respectives.

import SwiftUI

/// ViewModel de l'écran d'accueil plateforme.
/// Agrège les statistiques des différents modules.
@Observable
@MainActor
final class PlatformHomeViewModel {

    // MARK: - Stats COHRM

    var totalRumors: Int = 0
    var pendingRumors: Int = 0
    var criticalRumors: Int = 0
    var investigatingRumors: Int = 0

    // MARK: - Stats OHWR (Resource Mapping)

    var totalResources: Int = 0
    var totalExperts: Int = 0
    var coveredRegions: Int = 0

    // MARK: - Stats DUSS-C (Défi)

    var totalQuizSessions: Int = 0
    var totalQuestions: Int = 0
    var avgGain: Int = 0
    var completionRate: Int = 0

    // MARK: - Stats E-Learning

    var totalCourses: Int = 0
    var totalEnrollments: Int = 0
    var totalCertified: Int = 0

    // MARK: - État

    var isLoading = false
    var error: String?

    // MARK: - Chargement

    /// Charge les statistiques de tous les modules en parallèle
    func loadStats() async {
        isLoading = true
        error = nil

        // Charger en parallèle
        async let cohrmStats = loadCohrmStats()
        async let ohwrStats = loadOhwrStats()
        async let dusscStats = loadDusscStats()
        async let elearningStats = loadElearningStats()

        // Attendre tous les résultats (on ignore les erreurs individuelles)
        _ = await (cohrmStats, ohwrStats, dusscStats, elearningStats)

        isLoading = false
    }

    // MARK: - COHRM

    private func loadCohrmStats() async {
        do {
            let data: CohrmDashboardResponse = try await APIClient.shared.get(
                endpoint: "/cohrm/mobile/dashboard"
            )
            totalRumors = data.stats?.total ?? 0
            pendingRumors = data.stats?.pending ?? 0
            criticalRumors = data.stats?.critical ?? 0
            investigatingRumors = data.stats?.investigating ?? 0
        } catch {
            // Fail silently — module may not be available
            print("[Platform] COHRM stats error: \(error.localizedDescription)")
        }
    }

    // MARK: - OHWR

    private func loadOhwrStats() async {
        do {
            let data: OhwrStatsResponse = try await APIClient.shared.get(
                endpoint: "/mapping/stats"
            )
            totalResources = data.totalResources ?? 0
            totalExperts = data.totalExperts ?? 0
            coveredRegions = data.coveredRegions ?? 0
        } catch {
            print("[Platform] OHWR stats error: \(error.localizedDescription)")
        }
    }

    // MARK: - DUSS-C

    private func loadDusscStats() async {
        do {
            let data: DusscStatsResponse = try await APIClient.shared.get(
                endpoint: "/dussc/analytics/advocacy"
            )
            totalQuizSessions = data.totalSessions ?? 0
            totalQuestions = data.totalQuestions ?? 0
            avgGain = data.avgGain ?? 0
            completionRate = data.completionRate ?? 0
        } catch {
            print("[Platform] DUSS-C stats error: \(error.localizedDescription)")
        }
    }

    // MARK: - E-Learning

    private func loadElearningStats() async {
        do {
            let data: ElearningStatsResponse = try await APIClient.shared.get(
                endpoint: "/elearning/stats"
            )
            totalCourses = data.totalCourses ?? 0
            totalEnrollments = data.totalEnrollments ?? 0
            totalCertified = data.totalCertified ?? 0
        } catch {
            print("[Platform] E-Learning stats error: \(error.localizedDescription)")
        }
    }
}

// MARK: - Response DTOs

/// Réponse du dashboard COHRM existant
struct CohrmDashboardResponse: Codable {
    let stats: CohrmStats?

    struct CohrmStats: Codable {
        let total: Int?
        let pending: Int?
        let investigating: Int?
        let confirmed: Int?
        let critical: Int?
        let closed: Int?
    }
}

/// Réponse stats OHWR
struct OhwrStatsResponse: Codable {
    let totalResources: Int?
    let totalExperts: Int?
    let coveredRegions: Int?

    enum CodingKeys: String, CodingKey {
        case totalResources = "total_resources"
        case totalExperts = "total_experts"
        case coveredRegions = "covered_regions"
    }
}

/// Réponse stats DUSS-C
struct DusscStatsResponse: Codable {
    let totalSessions: Int?
    let totalQuestions: Int?
    let avgGain: Int?
    let completionRate: Int?

    enum CodingKeys: String, CodingKey {
        case totalSessions = "total_sessions"
        case totalQuestions = "total_questions"
        case avgGain = "avg_gain"
        case completionRate = "completion_rate"
    }
}

/// Réponse stats E-Learning
struct ElearningStatsResponse: Codable {
    let totalCourses: Int?
    let totalEnrollments: Int?
    let totalCertified: Int?

    enum CodingKeys: String, CodingKey {
        case totalCourses = "total_courses"
        case totalEnrollments = "total_enrollments"
        case totalCertified = "total_certified"
    }
}
