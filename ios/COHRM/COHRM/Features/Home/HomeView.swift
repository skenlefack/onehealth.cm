// HomeView.swift
// COHRM Cameroun - Écran d'accueil principal (premier onglet)
//
// Affiche le tableau de bord avec statistiques rapides,
// bouton de signalement, indicateur réseau et derniers rapports.

import SwiftUI
import SwiftData

// MARK: - Vue principale de l'accueil

/// Écran d'accueil de l'application COHRM.
/// Premier onglet affiché après l'onboarding.
/// Présente les statistiques locales, un CTA de signalement,
/// l'état du réseau et les derniers signalements enregistrés.
struct HomeView: View {

    // MARK: - Environnement

    /// Moniteur réseau injecté depuis `COHRMApp`
    @EnvironmentObject private var networkMonitor: NetworkMonitor

    /// Service de synchronisation injecté depuis `COHRMApp`
    @EnvironmentObject private var syncService: SyncService

    /// Contexte SwiftData pour les opérations de persistance
    @Environment(\.modelContext) private var modelContext

    // MARK: - Requêtes SwiftData

    /// Tous les signalements locaux, triés par date de création décroissante
    @Query(sort: \ReportModel.createdAt, order: .reverse)
    private var allReports: [ReportModel]

    /// Signalements en attente de synchronisation
    @Query(filter: #Predicate<ReportModel> { $0.syncStatusRaw == "pending" })
    private var pendingReports: [ReportModel]

    /// Signalements synchronisés avec succès
    @Query(filter: #Predicate<ReportModel> { $0.syncStatusRaw == "synced" })
    private var syncedReports: [ReportModel]

    // MARK: - État local

    /// Contrôle l'animation d'apparition des cartes
    @State private var isVisible = false

    // MARK: - Corps

    var body: some View {
        NavigationStack {
            ZStack(alignment: .top) {
                // Fond principal
                AppColors.groupedBackground
                    .ignoresSafeArea()

                ScrollView(.vertical, showsIndicators: false) {
                    VStack(spacing: 0) {
                        // En-tête avec dégradé
                        headerSection

                        // Contenu principal
                        VStack(spacing: AppDimensions.spacingL) {
                            // Bannière hors-ligne
                            offlineBanner

                            // Bouton CTA de signalement
                            reportCTASection

                            // Statistiques rapides
                            quickStatsSection

                            // Lien vers le signalement public
                            publicReportLink

                            // Lien vers le signalement SMS
                            smsReportLink

                            // Derniers signalements
                            recentReportsSection
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
        }
    }

    // MARK: - En-tête

    /// En-tête avec dégradé principal, titre et sous-titre
    private var headerSection: some View {
        ZStack(alignment: .bottomLeading) {
            // Fond avec dégradé
            LinearGradient(
                colors: [Color(hex: 0x1B4F72), Color(hex: 0x2980B9)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .frame(height: 200)
            .clipShape(
                UnevenRoundedRectangle(
                    bottomLeadingRadius: AppDimensions.cornerRadiusXL,
                    bottomTrailingRadius: AppDimensions.cornerRadiusXL
                )
            )

            // Motif décoratif (cercles subtils)
            headerDecorations

            // Contenu texte
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                // Logo et titre
                HStack(spacing: AppDimensions.spacingS) {
                    Image(systemName: "cross.circle.fill")
                        .font(.system(size: 28, weight: .medium))
                        .foregroundStyle(.white.opacity(0.9))
                        .symbolRenderingMode(.hierarchical)

                    Text(String(localized: "home.title"))
                        .font(AppFonts.largeTitle)
                        .foregroundStyle(.white)
                }

                Text(String(localized: "home.subtitle"))
                    .font(AppFonts.subheadline)
                    .foregroundStyle(.white.opacity(0.8))

                // Indicateur de connexion dans l'en-tête
                HStack(spacing: AppDimensions.spacingXS) {
                    Circle()
                        .fill(networkMonitor.isConnected ? AppColors.accentLight : AppColors.warning)
                        .frame(width: 8, height: 8)

                    Text(networkMonitor.isConnected
                        ? String(localized: "home.status.online")
                        : String(localized: "home.status.offline")
                    )
                    .font(AppFonts.caption)
                    .foregroundStyle(.white.opacity(0.7))
                }
                .padding(.top, AppDimensions.spacingXS)
            }
            .padding(.horizontal, AppDimensions.spacingL)
            .padding(.bottom, AppDimensions.spacingL)
        }
    }

    /// Cercles décoratifs dans l'en-tête
    private var headerDecorations: some View {
        ZStack {
            Circle()
                .fill(.white.opacity(0.05))
                .frame(width: 200, height: 200)
                .offset(x: 140, y: -60)

            Circle()
                .fill(.white.opacity(0.03))
                .frame(width: 150, height: 150)
                .offset(x: -80, y: -20)
        }
    }

    // MARK: - Bannière hors-ligne

    /// Bannière affichée quand l'appareil est déconnecté
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
            .transition(.move(edge: .top).combined(with: .opacity))
            .animation(.spring(response: 0.4, dampingFraction: 0.8), value: networkMonitor.isConnected)
        }
    }

    // MARK: - CTA Signalement

    /// Bouton principal de signalement d'un événement
    private var reportCTASection: some View {
        NavigationLink {
            // Navigation vers l'assistant de signalement
            ReportWizardPlaceholderView()
        } label: {
            HStack(spacing: AppDimensions.spacingM) {
                // Icône dans un cercle
                ZStack {
                    Circle()
                        .fill(.white.opacity(0.2))
                        .frame(width: 52, height: 52)

                    Image(systemName: "exclamationmark.bubble.fill")
                        .font(.system(size: 24, weight: .medium))
                        .foregroundStyle(.white)
                        .symbolRenderingMode(.hierarchical)
                }

                VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                    Text(String(localized: "home.cta.title"))
                        .font(AppFonts.headline)
                        .foregroundStyle(.white)

                    Text(String(localized: "home.cta.subtitle"))
                        .font(AppFonts.caption)
                        .foregroundStyle(.white.opacity(0.8))
                }

                Spacer()

                Image(systemName: "chevron.right.circle.fill")
                    .font(.system(size: 24))
                    .foregroundStyle(.white.opacity(0.7))
                    .symbolRenderingMode(.hierarchical)
            }
            .padding(AppDimensions.sectionPadding)
            .background(AppColors.primaryGradient)
            .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusL, style: .continuous))
            .shadow(color: AppColors.primary.opacity(0.3), radius: 12, x: 0, y: 6)
        }
        .opacity(isVisible ? 1.0 : 0.0)
        .offset(y: isVisible ? 0 : 20)
    }

    // MARK: - Statistiques rapides

    /// Section des 3 cartes de statistiques
    private var quickStatsSection: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            SectionHeader(
                title: String(localized: "home.stats.header"),
                icon: "chart.bar.fill"
            )

            HStack(spacing: AppDimensions.spacingM) {
                // Total des signalements
                StatCard(
                    value: allReports.count,
                    label: String(localized: "home.stats.total"),
                    icon: "doc.text.fill",
                    color: AppColors.primary
                )

                // En attente de synchronisation
                StatCard(
                    value: pendingReports.count,
                    label: String(localized: "home.stats.pending"),
                    icon: "clock.arrow.circlepath",
                    color: AppColors.warning
                )

                // Synchronisés
                StatCard(
                    value: syncedReports.count,
                    label: String(localized: "home.stats.synced"),
                    icon: "checkmark.circle.fill",
                    color: AppColors.success
                )
            }
        }
        .opacity(isVisible ? 1.0 : 0.0)
        .offset(y: isVisible ? 0 : 15)
    }

    // MARK: - Lien signalement public

    /// Lien de navigation vers le signalement public (sans connexion)
    private var publicReportLink: some View {
        NavigationLink {
            PublicReportView()
        } label: {
            HStack(spacing: AppDimensions.spacingM) {
                ZStack {
                    RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous)
                        .fill(AppColors.info.opacity(0.12))
                        .frame(width: 44, height: 44)

                    Image(systemName: "megaphone.fill")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundStyle(AppColors.info)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(String(localized: "home.public_report.title"))
                        .font(AppFonts.headline)
                        .foregroundStyle(AppColors.textPrimary)

                    Text(String(localized: "home.public_report.subtitle"))
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textSecondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(AppColors.textTertiary)
            }
            .padding(AppDimensions.cardPadding)
            .cardStyle()
        }
        .opacity(isVisible ? 1.0 : 0.0)
        .offset(y: isVisible ? 0 : 10)
    }

    // MARK: - Lien SMS

    /// Lien de navigation vers le signalement par SMS
    private var smsReportLink: some View {
        NavigationLink {
            // Navigation vers la vue de signalement SMS
            SMSReportPlaceholderView()
        } label: {
            HStack(spacing: AppDimensions.spacingM) {
                ZStack {
                    RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous)
                        .fill(AppColors.accent.opacity(0.12))
                        .frame(width: 44, height: 44)

                    Image(systemName: "message.fill")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundStyle(AppColors.accent)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(String(localized: "home.sms.title"))
                        .font(AppFonts.headline)
                        .foregroundStyle(AppColors.textPrimary)

                    Text(String(localized: "home.sms.subtitle"))
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textSecondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(AppColors.textTertiary)
            }
            .padding(AppDimensions.cardPadding)
            .cardStyle()
        }
        .opacity(isVisible ? 1.0 : 0.0)
        .offset(y: isVisible ? 0 : 10)
    }

    // MARK: - Derniers signalements

    /// Section listant les signalements locaux récents
    private var recentReportsSection: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            // En-tête de section avec compteur
            HStack {
                SectionHeader(
                    title: String(localized: "home.recent.header"),
                    icon: "clock.fill"
                )

                Spacer()

                if !allReports.isEmpty {
                    Text("\(allReports.count)")
                        .font(AppFonts.badge)
                        .foregroundStyle(AppColors.primary)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(AppColors.primary.opacity(0.1))
                        .clipShape(Capsule())
                }
            }

            if allReports.isEmpty {
                // État vide
                emptyReportsView
            } else {
                // Liste des 5 derniers signalements
                VStack(spacing: AppDimensions.spacingS) {
                    ForEach(allReports.prefix(5)) { report in
                        ReportRowView(report: report)
                    }
                }
            }
        }
        .opacity(isVisible ? 1.0 : 0.0)
        .offset(y: isVisible ? 0 : 10)
    }

    /// Vue affichée quand aucun signalement n'existe
    private var emptyReportsView: some View {
        VStack(spacing: AppDimensions.spacingM) {
            Image(systemName: "tray")
                .font(.system(size: 40, weight: .light))
                .foregroundStyle(AppColors.muted)

            Text(String(localized: "home.recent.empty"))
                .font(AppFonts.callout)
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, AppDimensions.spacingXL)
        .cardStyle()
    }
}

// MARK: - Carte de statistique

/// Carte affichant une valeur numérique avec icône et libellé
private struct StatCard: View {

    let value: Int
    let label: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: AppDimensions.spacingS) {
            // Icône dans un cercle coloré
            ZStack {
                Circle()
                    .fill(color.opacity(0.12))
                    .frame(width: 36, height: 36)

                Image(systemName: icon)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(color)
            }

            // Valeur numérique
            Text("\(value)")
                .font(AppFonts.statNumber)
                .foregroundStyle(AppColors.textPrimary)
                .contentTransition(.numericText())

            // Libellé
            Text(label)
                .font(AppFonts.caption)
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)
                .lineLimit(2)
                .minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, AppDimensions.cardPadding)
        .padding(.horizontal, AppDimensions.spacingS)
        .cardStyle()
    }
}

// MARK: - Ligne de signalement

/// Ligne affichant un résumé de signalement dans la liste récente
private struct ReportRowView: View {

    let report: ReportModel

    /// Catégorie d'événement résolue
    private var category: EventCategory {
        report.eventCategory ?? .other
    }

    var body: some View {
        HStack(spacing: AppDimensions.spacingM) {
            // Icône de catégorie
            ZStack {
                RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous)
                    .fill(category.color.opacity(0.12))
                    .frame(width: AppDimensions.eventIconSize, height: AppDimensions.eventIconSize)

                Image(systemName: category.icon)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(category.color)
            }

            // Informations du signalement
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                Text(report.title.isEmpty
                    ? category.label
                    : report.title
                )
                .font(AppFonts.subheadline)
                .foregroundStyle(AppColors.textPrimary)
                .lineLimit(1)

                HStack(spacing: AppDimensions.spacingS) {
                    // Région
                    if !report.region.isEmpty {
                        Label(report.region, systemImage: "mappin")
                            .font(AppFonts.caption)
                            .foregroundStyle(AppColors.textTertiary)
                            .lineLimit(1)
                    }

                    // Date relative
                    Text(report.createdAt.relativeString)
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textTertiary)
                        .lineLimit(1)
                }
            }

            Spacer()

            // Badge de statut de synchronisation
            StatusBadge(
                report.syncStatus.label,
                color: report.syncStatus.color,
                icon: report.syncStatus.icon
            )
        }
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }
}

// MARK: - Vues placeholder (à remplacer par les vraies vues)

/// Placeholder pour la vue de signalement (ReportWizardView)
/// Sera remplacée par la vraie implémentation dans Features/Report
private struct ReportWizardPlaceholderView: View {
    var body: some View {
        VStack(spacing: AppDimensions.spacingL) {
            Image(systemName: "doc.badge.plus")
                .font(.system(size: 48, weight: .light))
                .foregroundStyle(AppColors.primary)

            Text(String(localized: "home.cta.title"))
                .font(AppFonts.title)
                .foregroundStyle(AppColors.textPrimary)

            Text(String(localized: "report.wizard.placeholder"))
                .font(AppFonts.callout)
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(AppDimensions.spacingXL)
        .navigationTitle(String(localized: "home.cta.title"))
        .navigationBarTitleDisplayMode(.inline)
    }
}

/// Placeholder pour la vue de signalement SMS
/// Sera remplacée par la vraie implémentation dans Features/SMSReport
private struct SMSReportPlaceholderView: View {
    var body: some View {
        VStack(spacing: AppDimensions.spacingL) {
            Image(systemName: "message.badge.waveform.fill")
                .font(.system(size: 48, weight: .light))
                .foregroundStyle(AppColors.accent)

            Text(String(localized: "home.sms.title"))
                .font(AppFonts.title)
                .foregroundStyle(AppColors.textPrimary)

            Text(String(localized: "sms.report.placeholder"))
                .font(AppFonts.callout)
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(AppDimensions.spacingXL)
        .navigationTitle(String(localized: "home.sms.title"))
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Aperçus

#Preview("Accueil") {
    HomeView()
        .environmentObject(NetworkMonitor.shared)
        .environmentObject(SyncService.shared)
        .modelContainer(for: [ReportModel.self, PhotoAttachment.self], inMemory: true)
}

#Preview("Accueil - Hors-ligne") {
    HomeView()
        .environmentObject(NetworkMonitor.shared)
        .environmentObject(SyncService.shared)
        .modelContainer(for: [ReportModel.self, PhotoAttachment.self], inMemory: true)
}

#Preview("Accueil - Dark") {
    HomeView()
        .environmentObject(NetworkMonitor.shared)
        .environmentObject(SyncService.shared)
        .modelContainer(for: [ReportModel.self, PhotoAttachment.self], inMemory: true)
        .preferredColorScheme(.dark)
}
