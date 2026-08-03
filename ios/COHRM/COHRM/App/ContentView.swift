// ContentView.swift
// One Health Cameroon Platform — Vue racine avec routage onboarding / plateforme
//
// Architecture :
//   Onboarding → PlatformHomeView (accueil multi-modules)
//                  └── NavigationLink → ModuleContainerView (espace dédié par module)
//                                        └── TabView interne au module
//                                        └── Bouton retour → PlatformHomeView

import SwiftUI

/// Vue racine qui gère la transition onboarding → plateforme
struct ContentView: View {

    @AppStorage("hasCompletedOnboarding") private var hasCompletedOnboarding = false

    var body: some View {
        Group {
            if hasCompletedOnboarding {
                PlatformRootView()
                    .transition(.opacity)
            } else {
                OnboardingView {
                    withAnimation(.easeInOut(duration: 0.5)) {
                        hasCompletedOnboarding = true
                    }
                }
                .transition(.opacity)
            }
        }
        .animation(.easeInOut, value: hasCompletedOnboarding)
    }
}

/// Vue racine de la plateforme avec NavigationStack global.
/// L'écran d'accueil affiche les modules ; chaque module s'ouvre
/// en push dans le NavigationStack, permettant un retour simple.
struct PlatformRootView: View {

    @State private var notificationsVM = NotificationsViewModel()

    var body: some View {
        NavigationStack {
            PlatformHomeView()
        }
        .tint(AppColors.primary)
        .task {
            await notificationsVM.loadNotifications()
        }
    }
}

// MARK: - Legacy MainTabView (conservé pour compatibilité interne)

/// TabView COHRM complet — utilisé à l'intérieur du ModuleContainerView
/// quand l'utilisateur ouvre le module COHRM depuis l'accueil.
struct MainTabView: View {

    @State private var selectedTab = 0
    @State private var notificationsVM = NotificationsViewModel()

    var body: some View {
        TabView(selection: $selectedTab) {
            NavigationStack {
                HomeView()
            }
            .tabItem {
                Label(
                    String(localized: "tab.home"),
                    systemImage: "house.fill"
                )
            }
            .tag(0)

            NavigationStack {
                DashboardView()
            }
            .tabItem {
                Label(
                    String(localized: "tab.dashboard"),
                    systemImage: "chart.bar.fill"
                )
            }
            .tag(1)

            NavigationStack {
                RumorsListView()
            }
            .tabItem {
                Label(
                    String(localized: "tab.rumors"),
                    systemImage: "megaphone.fill"
                )
            }
            .tag(2)

            NavigationStack {
                ScannerView()
            }
            .tabItem {
                Label(
                    String(localized: "tab.scanner"),
                    systemImage: "doc.text.magnifyingglass"
                )
            }
            .tag(3)

            NavigationStack {
                NotificationsView()
            }
            .tabItem {
                Label(
                    String(localized: "tab.notifications"),
                    systemImage: "bell.fill"
                )
            }
            .tag(4)
            .badge(notificationsVM.unreadCount)

            NavigationStack {
                HistoryView()
            }
            .tabItem {
                Label(
                    String(localized: "tab.history"),
                    systemImage: "clock.arrow.circlepath"
                )
            }
            .tag(5)

            NavigationStack {
                SettingsView()
            }
            .tabItem {
                Label(
                    String(localized: "tab.settings"),
                    systemImage: "gearshape.fill"
                )
            }
            .tag(6)
        }
        .tint(AppColors.primary)
        .task {
            await notificationsVM.loadNotifications()
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(NetworkMonitor.shared)
        .environmentObject(SyncService.shared)
        .modelContainer(for: [ReportModel.self, PhotoAttachment.self], inMemory: true)
}
