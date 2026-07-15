// ReportsView.swift
// COHRM Cameroun - Vue des rapports statistiques

import SwiftUI

/// Vue des rapports avec résumé, distribution par statut et par région
struct ReportsView: View {

    @State private var viewModel = ReportsViewModel()

    var body: some View {
        ZStack {
            AppColors.groupedBackground
                .ignoresSafeArea()

            if viewModel.isLoading && viewModel.summaryData == nil {
                ProgressView()
                    .scaleEffect(1.2)
            } else if let error = viewModel.errorMessage, viewModel.summaryData == nil {
                errorView(message: error)
            } else {
                ScrollView(.vertical, showsIndicators: false) {
                    VStack(spacing: AppDimensions.spacingL) {
                        periodSelector
                        summaryCards
                        resolutionCard
                        statusDistributionSection
                        regionDistributionSection
                    }
                    .padding(.horizontal, AppDimensions.spacing)
                    .padding(.top, AppDimensions.spacingS)
                    .padding(.bottom, AppDimensions.spacingXXL)
                }
                .refreshable {
                    await viewModel.loadData()
                }
            }
        }
        .navigationTitle(String(localized: "reports.title"))
        .navigationBarTitleDisplayMode(.large)
        .task {
            await viewModel.loadData()
        }
        .onChange(of: viewModel.selectedPeriod) { _, _ in
            Task { await viewModel.loadData() }
        }
    }

    // MARK: - Selecteur de période

    private var periodSelector: some View {
        Picker(
            String(localized: "reports.period"),
            selection: $viewModel.selectedPeriod
        ) {
            ForEach(ReportsViewModel.ReportPeriod.allCases) { period in
                Text(period.label).tag(period)
            }
        }
        .pickerStyle(.segmented)
    }

    // MARK: - Cartes resumé

    private var summaryCards: some View {
        VStack(spacing: AppDimensions.spacingM) {
            HStack(spacing: AppDimensions.spacingM) {
                ReportKPICard(
                    value: viewModel.totalCount,
                    label: String(localized: "reports.total"),
                    icon: "doc.text.fill",
                    color: AppColors.primary
                )

                ReportKPICard(
                    value: viewModel.closedCount,
                    label: String(localized: "reports.resolved"),
                    icon: "checkmark.circle.fill",
                    color: AppColors.success
                )
            }

            HStack(spacing: AppDimensions.spacingM) {
                ReportKPICard(
                    value: viewModel.pendingCount,
                    label: String(localized: "reports.pending"),
                    icon: "clock.fill",
                    color: AppColors.warning
                )

                ReportKPICard(
                    value: viewModel.highRiskCount,
                    label: String(localized: "reports.high_risk"),
                    icon: "exclamationmark.triangle.fill",
                    color: AppColors.danger
                )
            }
        }
    }

    // MARK: - Temps de resolution

    private var resolutionCard: some View {
        HStack(spacing: AppDimensions.spacingM) {
            ZStack {
                Circle()
                    .fill(AppColors.info.opacity(0.12))
                    .frame(width: 44, height: 44)

                Image(systemName: "timer")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundStyle(AppColors.info)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(String(localized: "reports.avg_resolution"))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)

                Text("\(viewModel.avgResolutionHours)h")
                    .font(AppFonts.statNumber)
                    .foregroundStyle(AppColors.textPrimary)
                    .contentTransition(.numericText())
            }

            Spacer()
        }
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }

    // MARK: - Distribution par statut

    private var statusDistributionSection: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            SectionHeader(
                title: String(localized: "reports.by_status"),
                icon: "chart.bar.fill"
            )

            if viewModel.statusDistribution.isEmpty {
                Text(String(localized: "reports.no_data"))
                    .font(AppFonts.callout)
                    .foregroundStyle(AppColors.textTertiary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, AppDimensions.spacingM)
            } else {
                VStack(spacing: AppDimensions.spacingS) {
                    ForEach(viewModel.statusDistribution) { item in
                        DistributionBar(
                            label: RumorStatusHelper.label(for: item.status ?? ""),
                            count: item.count ?? 0,
                            maxCount: viewModel.maxStatusCount,
                            color: RumorStatusHelper.color(for: item.status ?? "")
                        )
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }

    // MARK: - Distribution par région

    private var regionDistributionSection: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            SectionHeader(
                title: String(localized: "reports.by_region"),
                icon: "map.fill"
            )

            if viewModel.regionDistribution.isEmpty {
                Text(String(localized: "reports.no_data"))
                    .font(AppFonts.callout)
                    .foregroundStyle(AppColors.textTertiary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, AppDimensions.spacingM)
            } else {
                VStack(spacing: AppDimensions.spacingS) {
                    ForEach(viewModel.regionDistribution) { item in
                        DistributionBar(
                            label: item.region ?? "-",
                            count: item.count ?? 0,
                            maxCount: viewModel.maxRegionCount,
                            color: AppColors.primary
                        )
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }

    // MARK: - Erreur

    private func errorView(message: String) -> some View {
        VStack(spacing: AppDimensions.spacingM) {
            Spacer()

            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48, weight: .light))
                .foregroundStyle(AppColors.danger)

            Text(String(localized: "reports.error.title"))
                .font(AppFonts.headline)
                .foregroundStyle(AppColors.textPrimary)

            Text(message)
                .font(AppFonts.caption)
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, AppDimensions.spacingXL)

            PrimaryButton(
                String(localized: "rumors.error.retry"),
                icon: "arrow.clockwise"
            ) {
                Task { await viewModel.loadData() }
            }
            .padding(.horizontal, AppDimensions.spacingXL)

            Spacer()
        }
    }
}

// MARK: - Carte KPI

/// Carte compacte affichant un indicateur chiffré
private struct ReportKPICard: View {

    let value: Int
    let label: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: AppDimensions.spacingS) {
            HStack(spacing: AppDimensions.spacingS) {
                Image(systemName: icon)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(color)

                Spacer()
            }

            Text("\(value)")
                .font(AppFonts.statNumber)
                .foregroundStyle(AppColors.textPrimary)
                .contentTransition(.numericText())
                .frame(maxWidth: .infinity, alignment: .leading)

            Text(label)
                .font(AppFonts.caption)
                .foregroundStyle(AppColors.textSecondary)
                .frame(maxWidth: .infinity, alignment: .leading)
                .lineLimit(1)
        }
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }
}

// MARK: - Barre de distribution

/// Barre horizontale colorée avec label et compteur
private struct DistributionBar: View {

    let label: String
    let count: Int
    let maxCount: Int
    let color: Color

    /// Ratio normalisé entre 0 et 1
    private var ratio: CGFloat {
        guard maxCount > 0 else { return 0 }
        return CGFloat(count) / CGFloat(maxCount)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
            HStack {
                Text(label)
                    .font(AppFonts.footnote)
                    .foregroundStyle(AppColors.textPrimary)
                    .lineLimit(1)

                Spacer()

                Text("\(count)")
                    .font(AppFonts.subheadline)
                    .foregroundStyle(color)
            }

            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: AppDimensions.progressBarHeight / 2, style: .continuous)
                        .fill(color.opacity(0.12))
                        .frame(height: AppDimensions.progressBarHeight * 2)

                    RoundedRectangle(cornerRadius: AppDimensions.progressBarHeight / 2, style: .continuous)
                        .fill(color)
                        .frame(
                            width: max(AppDimensions.progressBarHeight * 2, geometry.size.width * ratio),
                            height: AppDimensions.progressBarHeight * 2
                        )
                        .animation(.easeInOut(duration: 0.5), value: ratio)
                }
            }
            .frame(height: AppDimensions.progressBarHeight * 2)
        }
    }
}

// MARK: - Apercu

#Preview {
    NavigationStack {
        ReportsView()
    }
}
