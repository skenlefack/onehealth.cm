// ReportsViewModel.swift
// COHRM Cameroun - ViewModel pour les rapports statistiques

import Foundation

/// ViewModel pour la vue des rapports
@MainActor
@Observable
final class ReportsViewModel {

    // MARK: - Donnees

    /// Données de résumé
    var summaryData: ReportSummaryData?

    /// Indicateur de chargement
    var isLoading = false

    /// Message d'erreur
    var errorMessage: String?

    // MARK: - Filtres

    /// Période sélectionnée
    var selectedPeriod: ReportPeriod = .month

    /// Périodes disponibles
    enum ReportPeriod: String, CaseIterable, Identifiable {
        case week = "7d"
        case month = "30d"
        case quarter = "90d"
        case year = "1y"

        var id: String { rawValue }

        var label: String {
            switch self {
            case .week: return "7j"
            case .month: return "30j"
            case .quarter: return "90j"
            case .year: return "1an"
            }
        }
    }

    // MARK: - Accesseurs

    var totalCount: Int { summaryData?.totals?.total ?? 0 }
    var pendingCount: Int { summaryData?.totals?.pending ?? 0 }
    var confirmedCount: Int { summaryData?.totals?.confirmed ?? 0 }
    var closedCount: Int { summaryData?.totals?.closed ?? 0 }
    var highRiskCount: Int { summaryData?.totals?.highRisk ?? 0 }
    var avgResolutionHours: Int { summaryData?.avgResolutionHours ?? 0 }

    var statusDistribution: [StatusCount] { summaryData?.byStatus ?? [] }
    var regionDistribution: [RegionCount] { summaryData?.byRegion ?? [] }
    var sourceDistribution: [SourceCount] { summaryData?.bySource ?? [] }

    /// Maximum pour normaliser les barres de statut
    var maxStatusCount: Int {
        statusDistribution.compactMap(\.count).max() ?? 1
    }

    /// Maximum pour normaliser les barres de region
    var maxRegionCount: Int {
        regionDistribution.compactMap(\.count).max() ?? 1
    }

    // MARK: - Chargement

    /// Charge les données de rapport
    func loadData() async {
        isLoading = true
        errorMessage = nil

        do {
            let response = try await APIService.shared.getReportsSummary(period: selectedPeriod.rawValue)
            if response.success {
                summaryData = response.data
            } else {
                errorMessage = String(localized: "reports.error.load")
            }
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}
