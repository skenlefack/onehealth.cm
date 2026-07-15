// HistoryViewModel.swift
// COHRM Cameroun - ViewModel de l'historique des signalements
//
// Gère la logique métier de l'écran d'historique :
// suppression, resynchronisation, recherche et filtrage.

import Foundation
import SwiftData
import Observation

/// ViewModel pour l'écran d'historique des signalements
@Observable
final class HistoryViewModel {

    // MARK: - État observable

    /// Message d'erreur à afficher
    var errorMessage: String?

    /// Indique si l'alerte d'erreur est visible
    var showError = false

    /// Indique si une synchronisation est en cours pour un signalement
    var syncingReportId: UUID?

    // MARK: - Suppression

    /// Supprime un signalement du stockage local SwiftData.
    /// Supprime également les photos associées du disque.
    ///
    /// - Parameters:
    ///   - report: Le signalement à supprimer
    ///   - modelContext: Contexte SwiftData depuis @Environment
    func deleteReport(_ report: ReportModel, modelContext: ModelContext) {
        // Supprimer les photos associées du disque
        for photo in report.photos {
            Task {
                try? await PhotoService.shared.deletePhoto(path: photo.localPath)
            }
        }

        // Supprimer le signalement de SwiftData (cascade supprime les PhotoAttachment)
        modelContext.delete(report)

        do {
            try modelContext.save()
            HapticHelper.notification(.success)
        } catch {
            errorMessage = String(
                localized: "history.error.delete \(error.localizedDescription)"
            )
            showError = true
            HapticHelper.notification(.error)
        }
    }

    // MARK: - Resynchronisation

    /// Tente de resynchroniser un signalement en erreur ou en attente.
    ///
    /// - Parameters:
    ///   - report: Le signalement à resynchroniser
    ///   - modelContext: Contexte SwiftData
    @MainActor
    func retrySync(for report: ReportModel, modelContext: ModelContext) async {
        guard NetworkMonitor.shared.isConnected else {
            errorMessage = String(localized: "history.error.no_network")
            showError = true
            HapticHelper.notification(.warning)
            return
        }

        // Vérifier que le signalement n'est pas déjà synchronisé
        guard report.syncStatus != .synced else { return }

        // Marquer le signalement comme en cours de synchronisation
        syncingReportId = report.id

        let success = await SyncService.shared.syncReport(report)

        // Sauvegarder le changement de statut
        do {
            try modelContext.save()
        } catch {
            errorMessage = String(
                localized: "history.error.save \(error.localizedDescription)"
            )
            showError = true
        }

        if success {
            HapticHelper.notification(.success)
        } else {
            errorMessage = report.syncError ?? String(localized: "history.error.sync_failed")
            showError = true
            HapticHelper.notification(.error)
        }

        syncingReportId = nil
    }

    // MARK: - Recherche et filtrage

    /// Filtre les signalements selon le texte de recherche et le statut.
    ///
    /// La recherche porte sur :
    /// - Le titre du signalement
    /// - La description
    /// - La région
    /// - Le département
    /// - La catégorie (libellé)
    ///
    /// - Parameters:
    ///   - reports: Liste complète des signalements
    ///   - searchText: Texte de recherche saisi par l'utilisateur
    ///   - statusFilter: Filtre de statut optionnel
    /// - Returns: Liste filtrée des signalements
    func filteredReports(
        from reports: [ReportModel],
        searchText: String,
        statusFilter: SyncStatus?
    ) -> [ReportModel] {
        var result = reports

        // Filtrer par statut de synchronisation
        if let statusFilter {
            result = result.filter { $0.syncStatus == statusFilter }
        }

        // Filtrer par texte de recherche
        let trimmed = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return result }

        let lowercased = trimmed.lowercased()

        result = result.filter { report in
            // Recherche dans le titre
            if report.title.lowercased().contains(lowercased) {
                return true
            }
            // Recherche dans la description
            if report.reportDescription.lowercased().contains(lowercased) {
                return true
            }
            // Recherche dans la région
            if report.region.lowercased().contains(lowercased) {
                return true
            }
            // Recherche dans le département
            if report.department.lowercased().contains(lowercased) {
                return true
            }
            // Recherche dans le libellé de la catégorie
            if let category = report.eventCategory,
               category.label.lowercased().contains(lowercased) {
                return true
            }
            // Recherche dans les symptômes
            if report.symptoms.lowercased().contains(lowercased) {
                return true
            }
            return false
        }

        return result
    }

    // MARK: - Statistiques rapides

    /// Retourne le nombre de signalements par statut pour un ensemble donné.
    ///
    /// - Parameter reports: Liste des signalements
    /// - Returns: Dictionnaire statut -> nombre
    func statusCounts(from reports: [ReportModel]) -> [SyncStatus: Int] {
        var counts: [SyncStatus: Int] = [:]
        for report in reports {
            counts[report.syncStatus, default: 0] += 1
        }
        return counts
    }
}
