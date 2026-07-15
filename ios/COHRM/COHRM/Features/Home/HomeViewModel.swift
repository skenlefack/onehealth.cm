// HomeViewModel.swift
// COHRM Cameroun - ViewModel de la page d'accueil
//
// Gère les statistiques du tableau de bord et déclenche
// la synchronisation des signalements en attente.

import Foundation
import SwiftData
import Observation

/// Statistiques agrégées affichées sur l'écran d'accueil
struct HomeStats: Equatable {
    /// Nombre total de signalements locaux
    var totalReports: Int = 0

    /// Nombre de signalements en attente de synchronisation
    var pendingSync: Int = 0

    /// Nombre de signalements synchronisés avec succès
    var syncedCount: Int = 0

    /// Nombre de signalements en erreur
    var errorCount: Int = 0

    /// Nombre de brouillons
    var draftCount: Int = 0

    /// Répartition par catégorie (clé = rawValue d'EventCategory)
    var categoryCounts: [String: Int] = [:]
}

/// ViewModel pour l'écran d'accueil
/// Calcule les KPIs à partir des signalements SwiftData
/// et coordonne la synchronisation via SyncService.
@Observable
final class HomeViewModel {

    // MARK: - État observable

    /// Statistiques calculées depuis les signalements locaux
    var stats = HomeStats()

    /// Indique si une synchronisation manuelle est en cours
    var isSyncing = false

    /// Message d'erreur à afficher (alerte)
    var errorMessage: String?

    /// Indique si l'alerte d'erreur est visible
    var showError = false

    /// Date de la dernière synchronisation réussie
    var lastSyncDate: Date? {
        SyncService.shared.lastSyncDate
    }

    /// Indique si le réseau est disponible
    var isOnline: Bool {
        NetworkMonitor.shared.isConnected
    }

    // MARK: - Calcul des statistiques

    /// Met à jour les statistiques à partir d'un tableau de signalements.
    /// Appelé par la vue chaque fois que la @Query SwiftData change.
    ///
    /// - Parameter reports: Liste de tous les signalements locaux
    func computeStats(from reports: [ReportModel]) {
        var newStats = HomeStats()

        newStats.totalReports = reports.count

        for report in reports {
            // Comptage par statut de synchronisation
            switch report.syncStatus {
            case .draft:
                newStats.draftCount += 1
            case .pending:
                newStats.pendingSync += 1
            case .syncing:
                newStats.pendingSync += 1
            case .synced:
                newStats.syncedCount += 1
            case .error:
                newStats.errorCount += 1
            }

            // Comptage par catégorie
            let key = report.category
            newStats.categoryCounts[key, default: 0] += 1
        }

        stats = newStats
    }

    // MARK: - Synchronisation

    /// Déclenche la synchronisation de tous les signalements en attente.
    /// Nécessite un ModelContext pour accéder aux signalements SwiftData.
    ///
    /// - Parameter modelContext: Contexte SwiftData depuis @Environment
    @MainActor
    func syncPendingReports(modelContext: ModelContext) async {
        guard !isSyncing else { return }

        guard NetworkMonitor.shared.isConnected else {
            errorMessage = String(localized: "home.error.no_network")
            showError = true
            return
        }

        isSyncing = true
        errorMessage = nil

        do {
            // Récupérer les signalements en attente ou en erreur
            let pendingDescriptor = FetchDescriptor<ReportModel>(
                predicate: #Predicate<ReportModel> { report in
                    report.syncStatusRaw == "pending" || report.syncStatusRaw == "error"
                },
                sortBy: [SortDescriptor(\.createdAt, order: .forward)]
            )

            let pendingReports = try modelContext.fetch(pendingDescriptor)

            guard !pendingReports.isEmpty else {
                isSyncing = false
                return
            }

            // Synchroniser chaque signalement séquentiellement
            var successCount = 0
            var failCount = 0

            for report in pendingReports {
                let success = await SyncService.shared.syncReport(report)
                if success {
                    successCount += 1
                } else {
                    failCount += 1
                }
            }

            // Sauvegarder les changements de statut dans SwiftData
            try modelContext.save()

            // Afficher une erreur si certains signalements ont échoué
            if failCount > 0 {
                errorMessage = String(
                    localized: "home.sync.partial_failure \(failCount)"
                )
                showError = true
            }

        } catch {
            errorMessage = String(
                localized: "home.sync.error \(error.localizedDescription)"
            )
            showError = true
        }

        isSyncing = false
    }

    /// Synchronise un signalement spécifique par son identifiant.
    ///
    /// - Parameters:
    ///   - report: Le signalement à synchroniser
    ///   - modelContext: Contexte SwiftData
    @MainActor
    func syncSingleReport(_ report: ReportModel, modelContext: ModelContext) async {
        guard NetworkMonitor.shared.isConnected else {
            errorMessage = String(localized: "home.error.no_network")
            showError = true
            return
        }

        let success = await SyncService.shared.syncReport(report)

        do {
            try modelContext.save()
        } catch {
            errorMessage = String(
                localized: "home.sync.save_error \(error.localizedDescription)"
            )
            showError = true
        }

        if !success {
            errorMessage = report.syncError ?? String(localized: "home.sync.unknown_error")
            showError = true
        }
    }

    // MARK: - Utilitaires

    /// Formate la date de dernière synchronisation pour l'affichage.
    var formattedLastSync: String {
        guard let date = lastSyncDate else {
            return String(localized: "home.sync.never")
        }
        return date.relativeString
    }

    /// Pourcentage de signalements synchronisés (0...1)
    var syncProgress: Double {
        guard stats.totalReports > 0 else { return 0 }
        return Double(stats.syncedCount) / Double(stats.totalReports)
    }

    /// Couleur du badge de statut global
    var overallStatusColor: SwiftUI.Color {
        if stats.errorCount > 0 {
            return AppColors.danger
        } else if stats.pendingSync > 0 {
            return AppColors.warning
        } else if stats.syncedCount > 0 {
            return AppColors.success
        }
        return AppColors.muted
    }
}
