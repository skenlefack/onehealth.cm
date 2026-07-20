// ContentView.swift
// COHRM Cameroun - Vue racine avec routage onboarding / main

import SwiftUI

/// Vue racine qui gère la transition onboarding → app principale
struct ContentView: View {

    @AppStorage("hasCompletedOnboarding") private var hasCompletedOnboarding = false

    var body: some View {
        Group {
            if hasCompletedOnboarding {
                MainTabView()
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

/// TabView principal avec 7 onglets (More tab pour Scanner, Notifications, Rapports)
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
}
