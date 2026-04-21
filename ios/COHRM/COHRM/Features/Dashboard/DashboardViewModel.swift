// DashboardViewModel.swift
// COHRM Cameroun - ViewModel du tableau de bord analytique

import Foundation
import SwiftUI

/// ViewModel pour le tableau de bord analytique COHRM.
/// Gère le chargement des données depuis l'API et expose
/// les statistiques, graphiques et rumeurs récentes.
@MainActor
@Observable
final class DashboardViewModel {

    // MARK: - Propriétés publiées

    /// Données brutes du tableau de bord
    var stats: DashboardData?

    /// Indicateur de chargement
    var isLoading = false

    /// Message d'erreur éventuel
    var errorMessage: String?

    /// Filtre par région (optionnel)
    var selectedRegion: String?

    // MARK: - Chargement

    /// Charge les données du tableau de bord depuis l'API
    func loadDashboard() async {
        isLoading = true
        errorMessage = nil
        do {
            let response = try await APIService.shared.getDashboard(region: selectedRegion)
            if response.success, let data = response.data {
                stats = data
            } else {
                errorMessage = response.message ?? String(localized: "dashboard.error.loadFailed")
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    // MARK: - Accesseurs pratiques

    var totalRumors: Int { stats?.total ?? 0 }
    var pendingCount: Int { stats?.pending ?? 0 }
    var investigatingCount: Int { stats?.investigating ?? 0 }
    var confirmedCount: Int { stats?.confirmed ?? 0 }
    var closedCount: Int { stats?.closed ?? 0 }
    var highPriorityCount: Int { stats?.highPriority ?? 0 }
    var todayCount: Int { stats?.todayCount ?? 0 }
    var weekCount: Int { stats?.weekCount ?? 0 }
    var monthCount: Int { stats?.monthCount ?? 0 }
}
