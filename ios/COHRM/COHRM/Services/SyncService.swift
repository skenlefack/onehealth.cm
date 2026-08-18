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

    /// Container SwiftData pour créer des contextes en arrière-plan
    static var modelContainer: ModelContainer?

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

    /// Met à jour le compteur de signalements en attente
    func updatePendingCount(modelContext: ModelContext) {
        do {
            let predicate = #Predicate<ReportModel> {
                $0.syncStatusRaw == "pending" || $0.syncStatusRaw == "error"
            }
            let descriptor = FetchDescriptor<ReportModel>(predicate: predicate)
            let count = try modelContext.fetchCount(descriptor)
            pendingCount = count
        } catch {
            print("Erreur comptage rapports en attente : \(error)")
        }
    }

    /// Synchronise tous les signalements en attente
    @discardableResult
    func syncPendingReports() async -> Bool {
        guard !isSyncing else { return false }
        guard NetworkMonitor.shared.isConnected else { return false }
        guard let container = Self.modelContainer else {
            print("SyncService: ModelContainer non configuré")
            return false
        }

        isSyncing = true
        lastError = nil

        do {
            let modelContext = ModelContext(container)

            // Récupérer les rapports en attente ou en erreur
            let predicate = #Predicate<ReportModel> {
                $0.syncStatusRaw == "pending" || $0.syncStatusRaw == "error"
            }
            let descriptor = FetchDescriptor<ReportModel>(
                predicate: predicate,
                sortBy: [SortDescriptor(\.createdAt, order: .forward)]
            )
            let pendingReports = try modelContext.fetch(descriptor)

            var successCount = 0
            var failCount = 0

            for report in pendingReports {
                // Limiter les tentatives de retry (max 5)
                guard report.syncAttempts < 5 else { continue }

                let success = await syncReport(report)
                if success {
                    successCount += 1
                } else {
                    failCount += 1
                }
            }

            // Sauvegarder les changements de statut
            try modelContext.save()

            // Mettre à jour le compteur
            updatePendingCount(modelContext: modelContext)

            isSyncing = false
            lastSyncDate = Date()

            if failCount > 0 {
                lastError = String(localized: "sync.partial_error \(failCount)")
            }

            print("Sync terminée : \(successCount) réussis, \(failCount) échoués")
            return failCount == 0
        } catch {
            isSyncing = false
            lastError = error.localizedDescription
            print("Erreur sync : \(error)")
            return false
        }
    }

    /// Synchronise les données de référence depuis le serveur
    func syncReferenceData(modelContext: ModelContext) async {
        guard NetworkMonitor.shared.isConnected else { return }

        do {
            let response = try await APIService.shared.syncReferenceData()

            guard response.success, let syncData = response.data else { return }

            // Sauvegarder les régions
            if let regions = syncData.regions {
                let encoder = JSONEncoder()
                if let regionsJSON = try? encoder.encode(regions),
                   let regionsString = String(data: regionsJSON, encoding: .utf8) {
                    saveReferenceData(key: "regions", value: regionsString, modelContext: modelContext)
                }
            }

            // Sauvegarder les codes SMS
            if let smsCodes = syncData.smsCodes {
                let encoder = JSONEncoder()
                if let codesJSON = try? encoder.encode(smsCodes),
                   let codesString = String(data: codesJSON, encoding: .utf8) {
                    saveReferenceData(key: "sms_codes", value: codesString, modelContext: modelContext)
                }
            }

            // Sauvegarder la date de dernière mise à jour
            if let lastUpdate = syncData.lastUpdate {
                saveReferenceData(key: "last_update", value: lastUpdate, modelContext: modelContext)
            }

            try modelContext.save()
            print("Données de référence synchronisées")
        } catch {
            print("Erreur sync données de référence : \(error)")
        }
    }

    /// Sauvegarde ou met à jour une donnée de référence
    private func saveReferenceData(key: String, value: String, modelContext: ModelContext) {
        // Chercher une entrée existante
        let predicate = #Predicate<ReferenceData> { $0.key == key }
        let descriptor = FetchDescriptor<ReferenceData>(predicate: predicate)

        if let existing = try? modelContext.fetch(descriptor).first {
            existing.value = value
            existing.lastSyncedAt = Date()
        } else {
            let newData = ReferenceData(key: key, value: value)
            modelContext.insert(newData)
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
        guard let container = SyncService.modelContainer else {
            print("SyncService: ModelContainer non configuré pour la sync arrière-plan")
            return
        }

        // Créer un contexte dédié pour la tâche de fond
        let modelContext = ModelContext(container)

        // Synchroniser les rapports en attente
        await MainActor.run {
            Task {
                await self.syncPendingReports()
            }
        }

        // Synchroniser les données de référence (sur MainActor car SyncService est @MainActor)
        await MainActor.run {
            Task {
                await self.syncReferenceData(modelContext: modelContext)
            }
        }

        // Re-planifier la prochaine synchronisation
        await MainActor.run {
            self.scheduleBackgroundSync()
        }
    }
}
