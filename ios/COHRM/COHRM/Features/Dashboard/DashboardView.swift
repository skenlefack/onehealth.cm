// DashboardView.swift
// COHRM Cameroun - Tableau de bord analytique

import SwiftUI
import Charts

/// Vue principale du tableau de bord analytique COHRM.
/// Affiche les KPIs, tendances, graphiques de distribution
/// et les rumeurs récentes avec prise en charge du pull-to-refresh.
struct DashboardView: View {

    // MARK: - ViewModel

    @State private var viewModel = DashboardViewModel()

    // MARK: - État local

    @State private var isVisible = false

    // MARK: - Corps

    var body: some View {
        ZStack(alignment: .top) {
            // Fond principal
            AppColors.groupedBackground
                .ignoresSafeArea()

            if viewModel.isLoading && viewModel.stats == nil {
                loadingView
            } else if let error = viewModel.errorMessage, viewModel.stats == nil {
                errorView(message: error)
            } else {
                contentScrollView
            }
        }
        .navigationBarHidden(true)
        .task {
            await viewModel.loadDashboard()
            withAnimation(.easeOut(duration: 0.6).delay(0.1)) {
                isVisible = true
            }
        }
    }

    // MARK: - Contenu principal

    private var contentScrollView: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(spacing: 0) {
                // En-tete avec degrade
                headerSection

                // Contenu
                VStack(spacing: AppDimensions.spacingL) {
                    // Cartes KPI (grille 2 colonnes)
                    kpiGridSection

                    // Statistiques rapides (Aujourd'hui / Semaine / Mois)
                    quickStatsRow

                    // Graphique de tendance
                    trendSection

                    // Distribution par region
                    if let byRegion = viewModel.stats?.byRegion, !byRegion.isEmpty {
                        BarChartView(
                            title: String(localized: "dashboard.byRegion.title"),
                            icon: "map.fill",
                            items: byRegion
                        )
                        .opacity(isVisible ? 1.0 : 0.0)
                        .offset(y: isVisible ? 0 : 10)
                    }

                    // Distribution par categorie
                    if let byCategory = viewModel.stats?.byCategory, !byCategory.isEmpty {
                        BarChartView(
                            title: String(localized: "dashboard.byCategory.title"),
                            icon: "tag.fill",
                            items: byCategory
                        )
                        .opacity(isVisible ? 1.0 : 0.0)
                        .offset(y: isVisible ? 0 : 10)
                    }

                    // Distribution par statut
                    if let byStatus = viewModel.stats?.byStatus, !byStatus.isEmpty {
                        BarChartView(
                            title: String(localized: "dashboard.byStatus.title"),
                            icon: "chart.pie.fill",
                            items: byStatus
                        )
                        .opacity(isVisible ? 1.0 : 0.0)
                        .offset(y: isVisible ? 0 : 10)
                    }

                    // Rumeurs recentes
                    RecentRumorsSection(
                        rumors: viewModel.stats?.recentRumors ?? []
                    )
                    .opacity(isVisible ? 1.0 : 0.0)
                    .offset(y: isVisible ? 0 : 10)
                }
                .padding(.horizontal, AppDimensions.spacing)
                .padding(.top, AppDimensions.spacingL)
                .padding(.bottom, AppDimensions.spacingXXL)
            }
        }
        .refreshable {
            await viewModel.loadDashboard()
        }
    }

    // MARK: - En-tete

    /// En-tete avec degrade principal, titre et icone
    private var headerSection: some View {
        ZStack(alignment: .bottomLeading) {
            // Fond avec degrede
            LinearGradient(
                colors: [Color(hex: 0x1B4F72), Color(hex: 0x2980B9)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .frame(height: 180)
            .clipShape(
                UnevenRoundedRectangle(
                    bottomLeadingRadius: AppDimensions.cornerRadiusXL,
                    bottomTrailingRadius: AppDimensions.cornerRadiusXL
                )
            )

            // Decorations
            headerDecorations

            // Contenu texte
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                HStack(spacing: AppDimensions.spacingS) {
                    Image(systemName: "chart.bar.fill")
                        .font(.system(size: 26, weight: .medium))
                        .foregroundStyle(.white.opacity(0.9))
                        .symbolRenderingMode(.hierarchical)

                    Text(String(localized: "dashboard.title"))
                        .font(AppFonts.largeTitle)
                        .foregroundStyle(.white)
                }

                Text(String(localized: "dashboard.subtitle"))
                    .font(AppFonts.subheadline)
                    .foregroundStyle(.white.opacity(0.8))

                // Indicateur de chargement en rafraichissement
                if viewModel.isLoading && viewModel.stats != nil {
                    HStack(spacing: AppDimensions.spacingXS) {
                        ProgressView()
                            .tint(.white)
                            .scaleEffect(0.7)

                        Text(String(localized: "dashboard.refreshing"))
                            .font(AppFonts.caption)
                            .foregroundStyle(.white.opacity(0.7))
                    }
                    .padding(.top, AppDimensions.spacingXS)
                }
            }
            .padding(.horizontal, AppDimensions.spacingL)
            .padding(.bottom, AppDimensions.spacingL)
        }
    }

    /// Cercles decoratifs dans l'en-tete
    private var headerDecorations: some View {
        ZStack {
            Circle()
                .fill(.white.opacity(0.05))
                .frame(width: 180, height: 180)
                .offset(x: 150, y: -50)

            Circle()
                .fill(.white.opacity(0.03))
                .frame(width: 120, height: 120)
                .offset(x: -70, y: -10)
        }
    }

    // MARK: - KPI Grid

    /// Grille de 6 cartes KPI (2 colonnes)
    private var kpiGridSection: some View {
        LazyVGrid(
            columns: [
                GridItem(.flexible(), spacing: AppDimensions.spacingM),
                GridItem(.flexible(), spacing: AppDimensions.spacingM)
            ],
            spacing: AppDimensions.spacingM
        ) {
            KPICardView(
                icon: "doc.text.fill",
                value: viewModel.totalRumors,
                label: String(localized: "dashboard.kpi.total"),
                color: AppColors.primary
            )

            KPICardView(
                icon: "clock.fill",
                value: viewModel.pendingCount,
                label: String(localized: "dashboard.kpi.pending"),
                color: AppColors.warning
            )

            KPICardView(
                icon: "magnifyingglass.circle.fill",
                value: viewModel.investigatingCount,
                label: String(localized: "dashboard.kpi.investigating"),
                color: AppColors.info
            )

            KPICardView(
                icon: "checkmark.seal.fill",
                value: viewModel.confirmedCount,
                label: String(localized: "dashboard.kpi.confirmed"),
                color: AppColors.danger
            )

            KPICardView(
                icon: "exclamationmark.triangle.fill",
                value: viewModel.highPriorityCount,
                label: String(localized: "dashboard.kpi.highPriority"),
                color: AppColors.alert
            )

            KPICardView(
                icon: "archivebox.fill",
                value: viewModel.closedCount,
                label: String(localized: "dashboard.kpi.closed"),
                color: AppColors.success
            )
        }
        .opacity(isVisible ? 1.0 : 0.0)
        .offset(y: isVisible ? 0 : 20)
    }

    // MARK: - Quick Stats

    /// Ligne de statistiques rapides: Aujourd'hui / Semaine / Mois
    private var quickStatsRow: some View {
        HStack(spacing: AppDimensions.spacingM) {
            quickStatItem(
                value: viewModel.todayCount,
                label: String(localized: "dashboard.quickStat.today"),
                icon: "sun.max.fill",
                color: AppColors.warning
            )

            quickStatItem(
                value: viewModel.weekCount,
                label: String(localized: "dashboard.quickStat.week"),
                icon: "calendar",
                color: AppColors.info
            )

            quickStatItem(
                value: viewModel.monthCount,
                label: String(localized: "dashboard.quickStat.month"),
                icon: "calendar.badge.clock",
                color: AppColors.primary
            )
        }
        .opacity(isVisible ? 1.0 : 0.0)
        .offset(y: isVisible ? 0 : 15)
    }

    private func quickStatItem(value: Int, label: String, icon: String, color: Color) -> some View {
        VStack(spacing: AppDimensions.spacingS) {
            Image(systemName: icon)
                .font(.system(size: 16, weight: .medium))
                .foregroundStyle(color)

            Text("\(value)")
                .font(AppFonts.statNumber)
                .foregroundStyle(AppColors.textPrimary)
                .contentTransition(.numericText())

            Text(label)
                .font(AppFonts.caption)
                .foregroundStyle(AppColors.textSecondary)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, AppDimensions.cardPadding)
        .cardStyle()
    }

    // MARK: - Tendance

    /// Section du graphique de tendance
    private var trendSection: some View {
        TrendChartView(
            trends: viewModel.stats?.trends ?? [],
            title: String(localized: "dashboard.trends.title")
        )
        .opacity(isVisible ? 1.0 : 0.0)
        .offset(y: isVisible ? 0 : 10)
    }

    // MARK: - Chargement

    private var loadingView: some View {
        VStack(spacing: AppDimensions.spacingL) {
            Spacer()

            ProgressView()
                .scaleEffect(1.5)
                .tint(AppColors.primary)

            Text(String(localized: "dashboard.loading"))
                .font(AppFonts.callout)
                .foregroundStyle(AppColors.textSecondary)

            Spacer()
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Erreur

    private func errorView(message: String) -> some View {
        VStack(spacing: AppDimensions.spacingL) {
            Spacer()

            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 48, weight: .light))
                .foregroundStyle(AppColors.warning)

            Text(String(localized: "dashboard.error.title"))
                .font(AppFonts.title)
                .foregroundStyle(AppColors.textPrimary)

            Text(message)
                .font(AppFonts.callout)
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, AppDimensions.spacingXL)

            Button {
                Task {
                    await viewModel.loadDashboard()
                }
            } label: {
                HStack(spacing: AppDimensions.spacingS) {
                    Image(systemName: "arrow.clockwise")
                    Text(String(localized: "dashboard.error.retry"))
                }
                .font(AppFonts.button)
                .foregroundStyle(.white)
                .padding(.horizontal, AppDimensions.spacingL)
                .padding(.vertical, AppDimensions.spacingM)
                .background(AppColors.primaryGradient)
                .clipShape(Capsule())
            }

            Spacer()
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Aperçus

#Preview("Dashboard") {
    NavigationStack {
        DashboardView()
    }
}

#Preview("Dashboard - Dark") {
    NavigationStack {
        DashboardView()
    }
    .preferredColorScheme(.dark)
}
