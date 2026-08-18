// COHRMApp.swift
// One Health Cameroon Platform — Point d'entrée de l'application
// Plateforme nationale « Une Seule Santé » du Cameroun
//
// Modules : COHRM, OHWR Mapping, DUSS-C (Défi), E-Learning

import SwiftUI
import SwiftData
import BackgroundTasks

/// Point d'entrée principal de la plateforme One Health Cameroon
@main
struct COHRMApp: App {

    // MARK: - Propriétés

    /// Container SwiftData pour la persistance locale
    let modelContainer: ModelContainer

    /// Service de synchronisation arrière-plan
    @StateObject private var syncService = SyncService.shared
    @StateObject private var networkMonitor = NetworkMonitor.shared

    /// Observateur de phase de scène pour la synchronisation
    @Environment(\.scenePhase) private var scenePhase

    /// Préférences utilisateur
    @AppStorage("hasCompletedOnboarding") private var hasCompletedOnboarding = false
    @AppStorage("appLanguage") private var appLanguage = "fr"

    // MARK: - Initialisation

    init() {
        // Configuration du container SwiftData
        do {
            let schema = Schema([
                ReportModel.self,
                PhotoAttachment.self,
                ReferenceData.self,
                CachedRumor.self,
            ])
            let config = ModelConfiguration(
                schema: schema,
                isStoredInMemoryOnly: false,
                allowsSave: true
            )
            modelContainer = try ModelContainer(for: schema, configurations: [config])
        } catch {
            fatalError("Impossible d'initialiser SwiftData : \(error.localizedDescription)")
        }

        // Fournir le container au service de sync pour les contextes arrière-plan
        SyncService.modelContainer = modelContainer

        // Enregistrement des tâches d'arrière-plan
        registerBackgroundTasks()

        // Configuration de l'apparence globale
        configureAppearance()
    }

    // MARK: - Scene

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.locale, Locale(identifier: appLanguage))
                .environmentObject(syncService)
                .environmentObject(networkMonitor)
        }
        .modelContainer(modelContainer)
        .onChange(of: scenePhase) { _, newPhase in
            switch newPhase {
            case .background:
                // Planifier la synchronisation en arrière-plan
                SyncService.shared.scheduleBackgroundSync()
            case .active:
                // Tenter de synchroniser les rapports en attente au retour
                Task {
                    await SyncService.shared.syncPendingReports()
                }
            default:
                break
            }
        }
    }

    // MARK: - Configuration

    /// Configure l'apparence globale (UIKit bridges)
    private func configureAppearance() {
        // Teinte de navigation
        UINavigationBar.appearance().tintColor = UIColor(AppColors.primary)
        UITabBar.appearance().tintColor = UIColor(AppColors.primary)

        // Désactiver le large title par défaut
        UINavigationBar.appearance().prefersLargeTitles = false
    }

    /// Enregistre les tâches d'arrière-plan pour la synchronisation
    private func registerBackgroundTasks() {
        BGTaskScheduler.shared.register(
            forTaskWithIdentifier: "cm.onehealth.app.sync",
            using: nil
        ) { task in
            guard let bgTask = task as? BGAppRefreshTask else { return }
            Task {
                await SyncService.shared.performBackgroundSync()
                bgTask.setTaskCompleted(success: true)
            }
        }
    }
}
