// ModuleContainerView.swift
// One Health Cameroon Platform — Conteneur de module
//
// Vue wrapper qui encapsule chaque module dans son propre espace
// avec un en-tête identifiant le module et un bouton retour
// vers l'écran d'accueil de la plateforme.

import SwiftUI

// MARK: - Conteneur de module

/// Conteneur pour chaque module de la plateforme.
/// Fournit un TabView interne propre au module avec ses onglets spécifiques.
/// La navigation retour vers l'accueil est gérée par le NavigationStack parent.
struct ModuleContainerView: View {

    let module: PlatformModule

    @AppStorage("appLanguage") private var appLanguage = "fr"
    @State private var selectedTab = 0

    var body: some View {
        Group {
            switch module {
            case .cohrm:
                cohrmModule
            case .ohwr:
                OHWRHomeView()
            case .dussc:
                DUSSCHomeView()
            case .elearning:
                ELearningHomeView()
            }
        }
        .navigationTitle(module.title(lang: appLanguage))
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(module.color, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
    }

    // MARK: - COHRM Module

    /// Module COHRM complet avec ses onglets internes
    private var cohrmModule: some View {
        TabView(selection: $selectedTab) {
            // Dashboard COHRM
            DashboardView()
                .tabItem {
                    Label(
                        appLanguage == "fr" ? "Tableau de bord" : "Dashboard",
                        systemImage: "chart.bar.fill"
                    )
                }
                .tag(0)

            // Liste des rumeurs
            RumorsListView()
                .tabItem {
                    Label(
                        appLanguage == "fr" ? "Rumeurs" : "Rumors",
                        systemImage: "megaphone.fill"
                    )
                }
                .tag(1)

            // Signalement
            ReportWizardView()
                .tabItem {
                    Label(
                        appLanguage == "fr" ? "Signaler" : "Report",
                        systemImage: "plus.circle.fill"
                    )
                }
                .tag(2)

            // Scanner
            ScannerView()
                .tabItem {
                    Label(
                        appLanguage == "fr" ? "Scanner" : "Scanner",
                        systemImage: "doc.text.magnifyingglass"
                    )
                }
                .tag(3)

            // Historique
            HistoryView()
                .tabItem {
                    Label(
                        appLanguage == "fr" ? "Historique" : "History",
                        systemImage: "clock.arrow.circlepath"
                    )
                }
                .tag(4)
        }
        .tint(module.color)
    }

}

// MARK: - Preview

#Preview("COHRM Module") {
    NavigationStack {
        ModuleContainerView(module: .cohrm)
    }
    .environmentObject(NetworkMonitor.shared)
    .environmentObject(SyncService.shared)
    .modelContainer(for: [ReportModel.self, PhotoAttachment.self], inMemory: true)
}

#Preview("E-Learning Module") {
    NavigationStack {
        ModuleContainerView(module: .elearning)
    }
}

#Preview("DUSS-C Module") {
    NavigationStack {
        ModuleContainerView(module: .dussc)
    }
}

#Preview("OHWR Module") {
    NavigationStack {
        ModuleContainerView(module: .ohwr)
    }
}
