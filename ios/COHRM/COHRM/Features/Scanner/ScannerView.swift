// ScannerView.swift
// COHRM Cameroun - Vue principale du scanner de rumeurs

import SwiftUI

/// Vue du scanner : lancement de scan + historique
struct ScannerView: View {

    @State private var viewModel = ScannerViewModel()

    var body: some View {
        ZStack {
            AppColors.groupedBackground
                .ignoresSafeArea()

            ScrollView(.vertical, showsIndicators: false) {
                VStack(spacing: AppDimensions.spacingL) {
                    launchCard
                    historySection
                }
                .padding(.horizontal, AppDimensions.spacing)
                .padding(.top, AppDimensions.spacingS)
                .padding(.bottom, AppDimensions.spacingXXL)
            }
            .refreshable {
                await viewModel.loadHistory()
            }
        }
        .navigationTitle(String(localized: "scanner.title"))
        .navigationBarTitleDisplayMode(.large)
        .task {
            if viewModel.scans.isEmpty {
                await viewModel.loadHistory()
            }
        }
    }

    // MARK: - Carte de lancement

    private var launchCard: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            SectionHeader(
                title: String(localized: "scanner.launch.title"),
                icon: "antenna.radiowaves.left.and.right"
            )

            // Source picker
            VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
                Text(String(localized: "scanner.source.label"))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: AppDimensions.spacingS) {
                        ForEach(ScannerViewModel.ScanSource.allCases) { source in
                            SourceChip(
                                source: source,
                                isSelected: viewModel.selectedSource == source
                            ) {
                                HapticHelper.selection()
                                withAnimation(.easeInOut(duration: 0.2)) {
                                    viewModel.selectedSource = source
                                }
                            }
                        }
                    }
                }
            }

            // Keywords
            VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
                Text(String(localized: "scanner.keywords.label"))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)

                TextField(
                    String(localized: "scanner.keywords.placeholder"),
                    text: $viewModel.keywords,
                    axis: .vertical
                )
                .font(AppFonts.body)
                .lineLimit(1...3)
                .textFieldStyle(.plain)
                .padding(AppDimensions.spacingM)
                .background(AppColors.secondaryBackground)
                .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous))
            }

            // Messages
            if let error = viewModel.errorMessage {
                HStack(spacing: AppDimensions.spacingXS) {
                    Image(systemName: "exclamationmark.circle.fill")
                        .foregroundStyle(AppColors.danger)
                    Text(error)
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.danger)
                }
            }

            if let success = viewModel.successMessage {
                HStack(spacing: AppDimensions.spacingXS) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(AppColors.success)
                    Text(success)
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.success)
                }
            }

            // Bouton
            PrimaryButton(
                String(localized: "scanner.launch.button"),
                icon: "play.fill",
                isLoading: viewModel.isScanning
            ) {
                Task { await viewModel.runScan() }
            }
        }
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }

    // MARK: - Historique

    private var historySection: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            SectionHeader(
                title: String(localized: "scanner.history.title"),
                icon: "clock.fill"
            )

            if viewModel.isLoadingHistory && viewModel.scans.isEmpty {
                HStack {
                    Spacer()
                    ProgressView()
                        .padding(AppDimensions.spacingL)
                    Spacer()
                }
            } else if viewModel.scans.isEmpty {
                emptyHistoryView
            } else {
                LazyVStack(spacing: AppDimensions.spacingS) {
                    ForEach(viewModel.scans) { scan in
                        NavigationLink(value: scan.id) {
                            ScanRowView(scan: scan)
                        }
                        .buttonStyle(.plain)
                        .onAppear {
                            if scan.id == viewModel.scans.last?.id {
                                Task { await viewModel.loadMore() }
                            }
                        }
                    }

                    if viewModel.isLoadingHistory {
                        HStack {
                            Spacer()
                            ProgressView()
                                .padding(AppDimensions.spacingS)
                            Spacer()
                        }
                    }
                }
            }
        }
        .navigationDestination(for: Int.self) { scanId in
            ScanDetailView(scanId: scanId)
        }
    }

    private var emptyHistoryView: some View {
        VStack(spacing: AppDimensions.spacingM) {
            Image(systemName: "doc.text.magnifyingglass")
                .font(.system(size: 40, weight: .light))
                .foregroundStyle(AppColors.muted)

            Text(String(localized: "scanner.history.empty"))
                .font(AppFonts.callout)
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, AppDimensions.spacingXL)
        .cardStyle()
    }
}

// MARK: - Chip de source

/// Bouton capsule pour la selection de source
private struct SourceChip: View {
    let source: ScannerViewModel.ScanSource
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: source.icon)
                    .font(.caption)
                Text(source.label)
                    .font(AppFonts.badge)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .foregroundStyle(isSelected ? .white : AppColors.primary)
            .background(isSelected ? AppColors.primary : AppColors.primary.opacity(0.1))
            .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Ligne d'historique de scan

/// Ligne affichant un resume de scan dans l'historique
private struct ScanRowView: View {
    let scan: ScanItemDTO

    var body: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
            // Source et statut
            HStack {
                Label(
                    scan.source?.capitalized ?? String(localized: "scanner.source.all"),
                    systemImage: sourceIcon(for: scan.source)
                )
                .font(AppFonts.subheadline)
                .foregroundStyle(AppColors.textPrimary)

                Spacer()

                if let status = scan.status {
                    StatusBadge(
                        scanStatusLabel(for: status),
                        color: scanStatusColor(for: status),
                        icon: scanStatusIcon(for: status)
                    )
                }
            }

            // Mots-cles
            if let keywords = scan.keywords, !keywords.isEmpty {
                Text(keywords)
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)
                    .lineLimit(2)
            }

            // Date et nombre de resultats
            HStack {
                if let count = scan.resultsCount {
                    Label(
                        String(format: String(localized: "scanner.results.count"), count),
                        systemImage: "doc.text.fill"
                    )
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textTertiary)
                }

                Spacer()

                if let dateStr = scan.createdAt {
                    Text(RumorDateHelper.relativeString(from: dateStr))
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textTertiary)
                }
            }
        }
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }

    private func sourceIcon(for source: String?) -> String {
        switch source?.lowercased() {
        case "google": return "magnifyingglass"
        case "twitter": return "at"
        case "facebook": return "person.2.fill"
        default: return "globe"
        }
    }

    private func scanStatusLabel(for status: String) -> String {
        switch status.lowercased() {
        case "running", "in_progress": return String(localized: "scanner.status.running")
        case "completed", "done": return String(localized: "scanner.status.completed")
        case "failed", "error": return String(localized: "scanner.status.failed")
        case "queued", "pending": return String(localized: "scanner.status.queued")
        default: return status.capitalized
        }
    }

    private func scanStatusColor(for status: String) -> Color {
        switch status.lowercased() {
        case "running", "in_progress": return AppColors.info
        case "completed", "done": return AppColors.success
        case "failed", "error": return AppColors.danger
        case "queued", "pending": return AppColors.warning
        default: return AppColors.muted
        }
    }

    private func scanStatusIcon(for status: String) -> String {
        switch status.lowercased() {
        case "running", "in_progress": return "arrow.triangle.2.circlepath"
        case "completed", "done": return "checkmark.circle"
        case "failed", "error": return "xmark.circle"
        case "queued", "pending": return "clock"
        default: return "questionmark.circle"
        }
    }
}

#Preview {
    NavigationStack {
        ScannerView()
    }
}
