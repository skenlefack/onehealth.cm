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
                comingSoonView
            case .dussc:
                comingSoonView
            case .elearning:
                comingSoonView
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

    // MARK: - Module à venir

    /// Vue placeholder pour les modules pas encore implémentés
    private var comingSoonView: some View {
        VStack(spacing: AppDimensions.spacingXL) {
            Spacer()

            // Icône du module
            ZStack {
                Circle()
                    .fill(module.gradient.opacity(0.15))
                    .frame(width: 120, height: 120)

                Circle()
                    .fill(module.gradient.opacity(0.1))
                    .frame(width: 90, height: 90)

                Image(systemName: module.icon)
                    .font(.system(size: 40, weight: .medium))
                    .foregroundStyle(module.color)
            }

            // Titre
            VStack(spacing: AppDimensions.spacingS) {
                Text(module.title(lang: appLanguage))
                    .font(.system(size: 24, weight: .bold))
                    .foregroundStyle(AppColors.textPrimary)

                Text(module.subtitle(lang: appLanguage))
                    .font(.system(size: 15, weight: .medium))
                    .foregroundStyle(module.color)
            }

            // Description
            Text(module.description(lang: appLanguage))
                .font(.system(size: 15))
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, AppDimensions.spacingXL)

            // Badge
            HStack(spacing: AppDimensions.spacingS) {
                Image(systemName: "hammer.fill")
                    .font(.system(size: 14))
                Text(appLanguage == "fr" ? "En cours de développement" : "Under Development")
                    .font(.system(size: 14, weight: .semibold))
            }
            .foregroundStyle(module.color)
            .padding(.horizontal, AppDimensions.spacingL)
            .padding(.vertical, AppDimensions.spacingM)
            .background(module.color.opacity(0.1))
            .clipShape(Capsule())

            Spacer()
            Spacer()
        }
        .frame(maxWidth: .infinity)
        .background(AppColors.groupedBackground)
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

#Preview("DUSS-C Coming Soon") {
    NavigationStack {
        ModuleContainerView(module: .dussc)
    }
}

#Preview("E-Learning Coming Soon") {
    NavigationStack {
        ModuleContainerView(module: .elearning)
    }
}
