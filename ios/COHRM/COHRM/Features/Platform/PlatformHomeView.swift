// PlatformHomeView.swift
// One Health Cameroon Platform — Écran d'accueil multi-modules
//
// Affiche les modules disponibles (COHRM, OHWR, DUSS-C, E-Learning)
// avec des statistiques résumées pour chacun.
// Chaque module ouvre son propre espace avec possibilité de retour.

import SwiftUI
import SwiftData

// MARK: - Vue principale de la plateforme

/// Écran d'accueil de la plateforme One Health Cameroon.
/// Remplace l'ancien HomeView mono-module COHRM.
struct PlatformHomeView: View {

    // MARK: - Environnement

    @EnvironmentObject private var networkMonitor: NetworkMonitor
    @EnvironmentObject private var syncService: SyncService
    @Environment(\.modelContext) private var modelContext

    // MARK: - État

    @State private var platformVM = PlatformHomeViewModel()
    @State private var isVisible = false
    @AppStorage("appLanguage") private var appLanguage = "fr"

    // MARK: - Requêtes locales (COHRM)

    @Query(sort: \ReportModel.createdAt, order: .reverse)
    private var allReports: [ReportModel]

    @Query(filter: #Predicate<ReportModel> { $0.syncStatusRaw == "pending" })
    private var pendingReports: [ReportModel]

    // MARK: - Corps

    var body: some View {
        ZStack(alignment: .top) {
            AppColors.groupedBackground
                .ignoresSafeArea()

            ScrollView(.vertical, showsIndicators: false) {
                VStack(spacing: 0) {
                    // En-tête plateforme
                    platformHeader

                    // Contenu
                    VStack(spacing: AppDimensions.spacingL) {
                        // Bannière hors-ligne
                        offlineBanner

                        // Statistiques globales
                        globalStatsRow

                        // Grille des modules
                        modulesSection

                        // Actions rapides
                        quickActionsSection
                    }
                    .padding(.horizontal, AppDimensions.spacing)
                    .padding(.top, AppDimensions.spacingL)
                    .padding(.bottom, AppDimensions.spacingXXL)
                }
            }
        }
        .navigationBarHidden(true)
        .onAppear {
            withAnimation(.easeOut(duration: 0.6).delay(0.1)) {
                isVisible = true
            }
        }
        .task {
            await platformVM.loadStats()
        }
        .refreshable {
            await platformVM.loadStats()
        }
    }

    // MARK: - En-tête plateforme

    private var platformHeader: some View {
        ZStack(alignment: .bottomLeading) {
            // Fond dégradé
            LinearGradient(
                colors: [Color(hex: 0x0D3B2E), Color(hex: 0x1B6B4A), Color(hex: 0x2980B9)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .frame(height: 220)
            .clipShape(
                UnevenRoundedRectangle(
                    bottomLeadingRadius: AppDimensions.cornerRadiusXL,
                    bottomTrailingRadius: AppDimensions.cornerRadiusXL
                )
            )

            // Décorations
            headerDecorations

            // Contenu
            VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
                // Barre supérieure
                HStack {
                    // Logo
                    HStack(spacing: AppDimensions.spacingS) {
                        Image(systemName: "cross.circle.fill")
                            .font(.system(size: 32, weight: .medium))
                            .foregroundStyle(.white.opacity(0.9))
                            .symbolRenderingMode(.hierarchical)

                        VStack(alignment: .leading, spacing: 0) {
                            Text("One Health")
                                .font(.system(size: 22, weight: .bold, design: .default))
                                .foregroundStyle(.white)

                            Text("Cameroon Platform")
                                .font(.system(size: 13, weight: .medium))
                                .foregroundStyle(.white.opacity(0.7))
                                .tracking(0.5)
                        }
                    }

                    Spacer()

                    // Connexion + Paramètres
                    HStack(spacing: AppDimensions.spacingM) {
                        // Indicateur réseau
                        HStack(spacing: 4) {
                            Circle()
                                .fill(networkMonitor.isConnected ? Color(hex: 0x2ECC71) : AppColors.warning)
                                .frame(width: 8, height: 8)

                            Text(networkMonitor.isConnected
                                ? String(localized: "home.status.online")
                                : String(localized: "home.status.offline")
                            )
                            .font(.system(size: 11, weight: .medium))
                            .foregroundStyle(.white.opacity(0.7))
                        }

                        NavigationLink {
                            SettingsView()
                        } label: {
                            Image(systemName: "gearshape.fill")
                                .font(.system(size: 18))
                                .foregroundStyle(.white.opacity(0.7))
                        }
                    }
                }

                // Sous-titre
                Text(appLanguage == "fr"
                    ? "Plateforme nationale « Une Seule Santé »"
                    : "National One Health Platform"
                )
                .font(.system(size: 14, weight: .regular))
                .foregroundStyle(.white.opacity(0.6))

                // Rail 4 piliers (signature visuelle)
                pillarsRail
            }
            .padding(.horizontal, AppDimensions.spacingL)
            .padding(.bottom, AppDimensions.spacingL)
        }
    }

    /// Rail des 4 piliers One Health (santé humaine, animale, végétale, environnementale)
    private var pillarsRail: some View {
        HStack(spacing: 3) {
            PillarBar(color: Color(hex: 0xE74C3C), label: appLanguage == "fr" ? "Humaine" : "Human")
            PillarBar(color: Color(hex: 0xF39C12), label: appLanguage == "fr" ? "Animale" : "Animal")
            PillarBar(color: Color(hex: 0x27AE60), label: appLanguage == "fr" ? "Végétale" : "Plant")
            PillarBar(color: Color(hex: 0x3498DB), label: appLanguage == "fr" ? "Environnement" : "Environment")
        }
        .padding(.top, AppDimensions.spacingS)
    }

    private var headerDecorations: some View {
        ZStack {
            Circle()
                .fill(.white.opacity(0.04))
                .frame(width: 250, height: 250)
                .offset(x: 160, y: -80)

            Circle()
                .fill(.white.opacity(0.03))
                .frame(width: 180, height: 180)
                .offset(x: -100, y: -30)
        }
    }

    // MARK: - Bannière hors-ligne

    @ViewBuilder
    private var offlineBanner: some View {
        if !networkMonitor.isConnected {
            HStack(spacing: AppDimensions.spacingS) {
                Image(systemName: "wifi.slash")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(AppColors.warning)

                VStack(alignment: .leading, spacing: 2) {
                    Text(String(localized: "home.offline.title"))
                        .font(AppFonts.subheadline)
                        .foregroundStyle(AppColors.textPrimary)

                    Text(String(localized: "home.offline.message"))
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textSecondary)
                }
                Spacer()
            }
            .padding(AppDimensions.cardPadding)
            .background(AppColors.warning.opacity(0.1))
            .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous)
                    .stroke(AppColors.warning.opacity(0.3), lineWidth: 1)
            )
        }
    }

    // MARK: - Stats globales

    private var globalStatsRow: some View {
        HStack(spacing: AppDimensions.spacingM) {
            GlobalStatPill(
                value: platformVM.totalRumors + allReports.count,
                label: appLanguage == "fr" ? "Signalements" : "Reports",
                icon: "exclamationmark.triangle.fill",
                color: AppColors.warning
            )

            GlobalStatPill(
                value: platformVM.totalResources,
                label: appLanguage == "fr" ? "Ressources" : "Resources",
                icon: "map.fill",
                color: AppColors.info
            )

            GlobalStatPill(
                value: platformVM.totalQuizSessions,
                label: appLanguage == "fr" ? "Quiz" : "Quizzes",
                icon: "brain.fill",
                color: Color(hex: 0x27AE60)
            )
        }
        .opacity(isVisible ? 1.0 : 0.0)
        .offset(y: isVisible ? 0 : 15)
    }

    // MARK: - Grille des modules

    private var modulesSection: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            SectionHeader(
                title: appLanguage == "fr" ? "Modules" : "Modules",
                icon: "square.grid.2x2.fill"
            )

            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: AppDimensions.spacingM),
                GridItem(.flexible(), spacing: AppDimensions.spacingM)
            ], spacing: AppDimensions.spacingM) {

                // COHRM — Rumor Management
                ModuleCard(
                    module: .cohrm,
                    stats: [
                        ModuleStat(
                            label: appLanguage == "fr" ? "Rumeurs" : "Rumors",
                            value: platformVM.totalRumors
                        ),
                        ModuleStat(
                            label: appLanguage == "fr" ? "En attente" : "Pending",
                            value: platformVM.pendingRumors
                        ),
                        ModuleStat(
                            label: appLanguage == "fr" ? "Critiques" : "Critical",
                            value: platformVM.criticalRumors
                        )
                    ],
                    isVisible: isVisible,
                    delay: 0.0
                )

                // OHWR — Resource Mapping
                ModuleCard(
                    module: .ohwr,
                    stats: [
                        ModuleStat(
                            label: appLanguage == "fr" ? "Ressources" : "Resources",
                            value: platformVM.totalResources
                        ),
                        ModuleStat(
                            label: appLanguage == "fr" ? "Experts" : "Experts",
                            value: platformVM.totalExperts
                        ),
                        ModuleStat(
                            label: appLanguage == "fr" ? "Régions" : "Regions",
                            value: platformVM.coveredRegions
                        )
                    ],
                    isVisible: isVisible,
                    delay: 0.05
                )

                // DUSS-C — Défi Une Seule Santé
                ModuleCard(
                    module: .dussc,
                    stats: [
                        ModuleStat(
                            label: appLanguage == "fr" ? "Sessions" : "Sessions",
                            value: platformVM.totalQuizSessions
                        ),
                        ModuleStat(
                            label: appLanguage == "fr" ? "Questions" : "Questions",
                            value: platformVM.totalQuestions
                        ),
                        ModuleStat(
                            label: appLanguage == "fr" ? "Gain moyen" : "Avg Gain",
                            value: platformVM.avgGain,
                            suffix: "pts"
                        )
                    ],
                    isVisible: isVisible,
                    delay: 0.1
                )

                // E-Learning
                ModuleCard(
                    module: .elearning,
                    stats: [
                        ModuleStat(
                            label: appLanguage == "fr" ? "Cours" : "Courses",
                            value: platformVM.totalCourses
                        ),
                        ModuleStat(
                            label: appLanguage == "fr" ? "Inscrits" : "Enrolled",
                            value: platformVM.totalEnrollments
                        ),
                        ModuleStat(
                            label: appLanguage == "fr" ? "Certifiés" : "Certified",
                            value: platformVM.totalCertified
                        )
                    ],
                    isVisible: isVisible,
                    delay: 0.15
                )
            }
        }
        .opacity(isVisible ? 1.0 : 0.0)
    }

    // MARK: - Actions rapides

    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            SectionHeader(
                title: appLanguage == "fr" ? "Actions rapides" : "Quick Actions",
                icon: "bolt.fill"
            )

            // Signalement rapide
            NavigationLink {
                ReportWizardView()
                    .environmentObject(networkMonitor)
            } label: {
                QuickActionRow(
                    icon: "exclamationmark.bubble.fill",
                    title: appLanguage == "fr" ? "Signaler un événement" : "Report an Event",
                    subtitle: appLanguage == "fr" ? "Rumeur, maladie, mortalité animale" : "Rumor, disease, animal mortality",
                    color: AppColors.danger,
                    badge: pendingReports.count > 0 ? "\(pendingReports.count)" : nil
                )
            }

            // Notifications
            NavigationLink {
                NotificationsView()
            } label: {
                QuickActionRow(
                    icon: "bell.badge.fill",
                    title: appLanguage == "fr" ? "Notifications" : "Notifications",
                    subtitle: appLanguage == "fr" ? "Alertes et mises à jour" : "Alerts and updates",
                    color: AppColors.warning
                )
            }
        }
        .opacity(isVisible ? 1.0 : 0.0)
        .offset(y: isVisible ? 0 : 10)
    }
}

// MARK: - Composants réutilisables

/// Barre d'un pilier One Health dans le rail
private struct PillarBar: View {
    let color: Color
    let label: String

    var body: some View {
        VStack(spacing: 3) {
            RoundedRectangle(cornerRadius: 2)
                .fill(color)
                .frame(height: 5)

            Text(label)
                .font(.system(size: 9, weight: .medium))
                .foregroundStyle(.white.opacity(0.5))
        }
    }
}

/// Pilule de statistique globale en haut de l'écran
private struct GlobalStatPill: View {
    let value: Int
    let label: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: AppDimensions.spacingXS) {
            Image(systemName: icon)
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(color)

            Text("\(value)")
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .foregroundStyle(AppColors.textPrimary)
                .contentTransition(.numericText())

            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(AppColors.textSecondary)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, AppDimensions.spacingM)
        .cardStyle()
    }
}

/// Ligne d'action rapide
private struct QuickActionRow: View {
    let icon: String
    let title: String
    let subtitle: String
    let color: Color
    var badge: String? = nil

    var body: some View {
        HStack(spacing: AppDimensions.spacingM) {
            ZStack {
                RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous)
                    .fill(color.opacity(0.12))
                    .frame(width: 44, height: 44)

                Image(systemName: icon)
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(color)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(AppFonts.headline)
                    .foregroundStyle(AppColors.textPrimary)

                Text(subtitle)
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)
            }

            Spacer()

            if let badge {
                Text(badge)
                    .font(AppFonts.badge)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(color)
                    .clipShape(Capsule())
            }

            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(AppColors.textTertiary)
        }
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }
}

// MARK: - Previews

#Preview("Platform Home") {
    NavigationStack {
        PlatformHomeView()
    }
    .environmentObject(NetworkMonitor.shared)
    .environmentObject(SyncService.shared)
    .modelContainer(for: [ReportModel.self, PhotoAttachment.self], inMemory: true)
}

#Preview("Platform Home - Dark") {
    NavigationStack {
        PlatformHomeView()
    }
    .environmentObject(NetworkMonitor.shared)
    .environmentObject(SyncService.shared)
    .modelContainer(for: [ReportModel.self, PhotoAttachment.self], inMemory: true)
    .preferredColorScheme(.dark)
}
