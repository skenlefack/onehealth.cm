// COHRMApp.swift
// COHRM Cameroun - Point d'entrée de l'application
// Cameroon One Health Rumor Management

import SwiftUI
import SwiftData
import BackgroundTasks

/// Point d'entrée principal de l'application COHRM
@main
struct COHRMApp: App {

    // MARK: - Propriétés

    /// Container SwiftData pour la persistance locale
    let modelContainer: ModelContainer

    /// Service de synchronisation arrière-plan
    @StateObject private var syncService = SyncService.shared
    @StateObject private var networkMonitor = NetworkMonitor.shared

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
            forTaskWithIdentifier: "cm.onehealth.cohrm.sync",
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
