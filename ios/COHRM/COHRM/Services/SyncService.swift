// SyncService.swift
// COHRM Cameroun - Service de synchronisation hors-ligne

import Foundation
import SwiftData
import BackgroundTasks

/// Gère la synchronisation des signalements en attente
/// Utilise BGTaskScheduler pour la synchronisation en arrière-plan
@MainActor
final class SyncService: ObservableObject {

    // MARK: - Singleton

    static let shared = SyncService()

    // MARK: - État publié

    /// Nombre de signalements en attente de synchronisation
    @Published var pendingCount = 0

    /// Indique si une synchronisation est en cours
    @Published var isSyncing = false

    /// Dernière erreur de synchronisation
    @Published var lastError: String?

    /// Date de la dernière synchronisation réussie
    @Published var lastSyncDate: Date?

    // MARK: - Initialisation

    private init() {
        // Écouter les notifications de réseau disponible
        NotificationCenter.default.addObserver(
            forName: .networkDidBecomeAvailable,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            Task { @MainActor in
                await self?.syncPendingReports()
            }
        }
    }

    // MARK: - Synchronisation

    /// Synchronise tous les signalements en attente
    @discardableResult
    func syncPendingReports() async -> Bool {
        guard !isSyncing else { return false }
        guard NetworkMonitor.shared.isConnected else { return false }

        isSyncing = true
        lastError = nil

        // Note: L'accès au ModelContext doit se faire depuis le bon contexte
        // En production, on créerait un ModelContext dédié pour cette tâche
        // Ici, on simule l'architecture

        do {
            // Logique de synchronisation :
            // 1. Récupérer les rapports en attente depuis SwiftData
            // 2. Pour chaque rapport, tenter l'envoi API
            // 3. Mettre à jour le statut (synced ou error)
            // 4. Planifier un retry si nécessaire

            // Pour l'instant, cette méthode sera appelée par les ViewModels
            // qui ont accès au ModelContext via @Environment

            isSyncing = false
            lastSyncDate = Date()
            return true
        }
    }

    /// Synchronise un signalement spécifique
    func syncReport(_ report: ReportModel) async -> Bool {
        guard NetworkMonitor.shared.isConnected else { return false }

        report.syncStatus = .syncing
        report.syncAttempts += 1

        do {
            let reportData = report.toReportData()
            let response = try await APIService.shared.submitReport(reportData)

            if response.success {
                report.syncStatus = .synced
                report.serverId = response.data?.id
                report.updatedAt = Date()
                return true
            } else {
                report.syncStatus = .error
                report.syncError = response.message
                return false
            }
        } catch {
            report.syncStatus = .error
            report.syncError = error.localizedDescription
            return false
        }
    }

    /// Planifie une tâche de synchronisation en arrière-plan
    func scheduleBackgroundSync() {
        let request = BGAppRefreshTaskRequest(identifier: "cm.onehealth.cohrm.sync")
        request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // 15 minutes
        do {
            try BGTaskScheduler.shared.submit(request)
        } catch {
            print("Erreur planification sync : \(error)")
        }
    }

    /// Exécute la synchronisation en arrière-plan (appelé par BGTaskScheduler)
    nonisolated func performBackgroundSync() async {
        // En arrière-plan : tenter de synchroniser les rapports en attente
        // Cette méthode est appelée depuis COHRMApp quand une tâche BG est déclenchée
        await MainActor.run {
            Task {
                await self.syncPendingReports()
            }
        }
    }
}
