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

/// TabView principal avec 5 onglets
struct MainTabView: View {

    @State private var selectedTab = 0

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
                HistoryView()
            }
            .tabItem {
                Label(
                    String(localized: "tab.history"),
                    systemImage: "clock.arrow.circlepath"
                )
            }
            .tag(3)

            NavigationStack {
                SettingsView()
            }
            .tabItem {
                Label(
                    String(localized: "tab.settings"),
                    systemImage: "gearshape.fill"
                )
            }
            .tag(4)
        }
        .tint(AppColors.primary)
    }
}

#Preview {
    ContentView()
}
