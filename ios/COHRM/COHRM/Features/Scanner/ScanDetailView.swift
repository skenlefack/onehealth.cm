// ScanDetailView.swift
// COHRM Cameroun - Vue de detail d'un scan

import SwiftUI

/// Vue affichant le detail et les resultats d'un scan
struct ScanDetailView: View {

    let scanId: Int

    @State private var viewModel = ScannerViewModel()

    var body: some View {
        ZStack {
            AppColors.groupedBackground
                .ignoresSafeArea()

            if viewModel.isLoadingDetail && viewModel.scanDetail == nil {
                ProgressView()
                    .scaleEffect(1.2)
            } else if let error = viewModel.errorMessage, viewModel.scanDetail == nil {
                errorView(message: error)
            } else if let detail = viewModel.scanDetail {
                ScrollView(.vertical, showsIndicators: false) {
                    VStack(spacing: AppDimensions.spacingL) {
                        metadataCard(detail: detail)
                        resultsSection(detail: detail)
                    }
                    .padding(.horizontal, AppDimensions.spacing)
                    .padding(.top, AppDimensions.spacingS)
                    .padding(.bottom, AppDimensions.spacingXXL)
                }
                .refreshable {
                    await viewModel.loadDetail(id: scanId)
                }
            }
        }
        .navigationTitle(String(localized: "scanner.detail.title"))
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadDetail(id: scanId)
        }
    }

    // MARK: - Metadata

    private func metadataCard(detail: ScanDetailDTO) -> some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            SectionHeader(
                title: String(localized: "scanner.detail.info"),
                icon: "info.circle.fill"
            )

            // Source
            HStack(spacing: AppDimensions.spacingS) {
                Image(systemName: sourceIcon(for: detail.source))
                    .font(.subheadline)
                    .foregroundStyle(AppColors.primary)
                    .frame(width: 20)

                VStack(alignment: .leading, spacing: 2) {
                    Text(String(localized: "scanner.detail.source"))
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textTertiary)
                    Text(detail.source?.capitalized ?? String(localized: "scanner.source.all"))
                        .font(AppFonts.callout)
                        .foregroundStyle(AppColors.textPrimary)
                }
            }

            // Keywords
            if let keywords = detail.keywords, !keywords.isEmpty {
                HStack(alignment: .top, spacing: AppDimensions.spacingS) {
                    Image(systemName: "tag.fill")
                        .font(.subheadline)
                        .foregroundStyle(AppColors.primary)
                        .frame(width: 20)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(String(localized: "scanner.detail.keywords"))
                            .font(AppFonts.caption)
                            .foregroundStyle(AppColors.textTertiary)

                        // Afficher les mots-cles comme des chips
                        FlowLayout(spacing: 6) {
                            ForEach(keywords.split(separator: ",").map(String.init), id: \.self) { keyword in
                                Text(keyword.trimmingCharacters(in: .whitespaces))
                                    .font(AppFonts.badge)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 4)
                                    .foregroundStyle(AppColors.primary)
                                    .background(AppColors.primary.opacity(0.1))
                                    .clipShape(Capsule())
                            }
                        }
                    }
                }
            }

            // Status
            if let status = detail.status {
                HStack(spacing: AppDimensions.spacingS) {
                    Image(systemName: "circle.dotted")
                        .font(.subheadline)
                        .foregroundStyle(AppColors.primary)
                        .frame(width: 20)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(String(localized: "scanner.detail.status"))
                            .font(AppFonts.caption)
                            .foregroundStyle(AppColors.textTertiary)
                        StatusBadge(
                            status.capitalized,
                            color: statusColor(for: status)
                        )
                    }
                }
            }

            // Date
            if let dateStr = detail.createdAt {
                HStack(spacing: AppDimensions.spacingS) {
                    Image(systemName: "calendar")
                        .font(.subheadline)
                        .foregroundStyle(AppColors.primary)
                        .frame(width: 20)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(String(localized: "scanner.detail.date"))
                            .font(AppFonts.caption)
                            .foregroundStyle(AppColors.textTertiary)
                        Text(RumorDateHelper.formattedString(from: dateStr))
                            .font(AppFonts.callout)
                            .foregroundStyle(AppColors.textPrimary)
                    }
                }
            }

            // Nombre de resultats
            let count = detail.results?.count ?? 0
            HStack(spacing: AppDimensions.spacingS) {
                Image(systemName: "doc.text.fill")
                    .font(.subheadline)
                    .foregroundStyle(AppColors.primary)
                    .frame(width: 20)

                VStack(alignment: .leading, spacing: 2) {
                    Text(String(localized: "scanner.detail.results_count"))
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textTertiary)
                    Text("\(count)")
                        .font(AppFonts.statNumber)
                        .foregroundStyle(AppColors.textPrimary)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }

    // MARK: - Resultats

    private func resultsSection(detail: ScanDetailDTO) -> some View {
        let results = detail.results ?? []

        return VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            SectionHeader(
                title: String(localized: "scanner.detail.results"),
                icon: "list.bullet.rectangle"
            )

            if results.isEmpty {
                VStack(spacing: AppDimensions.spacingM) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 40, weight: .light))
                        .foregroundStyle(AppColors.muted)

                    Text(String(localized: "scanner.detail.no_results"))
                        .font(AppFonts.callout)
                        .foregroundStyle(AppColors.textSecondary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, AppDimensions.spacingL)
                .cardStyle()
            } else {
                LazyVStack(spacing: AppDimensions.spacingS) {
                    ForEach(results) { result in
                        ScanResultRowView(
                            result: result,
                            scanKeywords: detail.keywords
                        )
                    }
                }
            }
        }
    }

    // MARK: - Erreur

    private func errorView(message: String) -> some View {
        VStack(spacing: AppDimensions.spacingM) {
            Spacer()

            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48, weight: .light))
                .foregroundStyle(AppColors.danger)

            Text(message)
                .font(AppFonts.callout)
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, AppDimensions.spacingXL)

            PrimaryButton(
                String(localized: "rumors.error.retry"),
                icon: "arrow.clockwise"
            ) {
                Task { await viewModel.loadDetail(id: scanId) }
            }
            .padding(.horizontal, AppDimensions.spacingXL)

            Spacer()
        }
    }

    // MARK: - Helpers

    private func sourceIcon(for source: String?) -> String {
        switch source?.lowercased() {
        case "google": return "magnifyingglass"
        case "twitter": return "at"
        case "facebook": return "person.2.fill"
        default: return "globe"
        }
    }

    private func statusColor(for status: String) -> Color {
        switch status.lowercased() {
        case "completed", "done": return AppColors.success
        case "running", "in_progress": return AppColors.info
        case "failed", "error": return AppColors.danger
        default: return AppColors.warning
        }
    }
}

// MARK: - Ligne de resultat

/// Vue affichant un resultat individuel de scan
private struct ScanResultRowView: View {
    let result: ScanResultDTO
    let scanKeywords: String?

    var body: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
            // Titre
            HStack(alignment: .top) {
                Text(result.title ?? String(localized: "scanner.result.untitled"))
                    .font(AppFonts.subheadline)
                    .foregroundStyle(AppColors.textPrimary)
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)

                Spacer()

                // Badge si converti en rumeur
                if result.isRumor == true {
                    StatusBadge(
                        String(localized: "scanner.result.is_rumor"),
                        color: AppColors.accent,
                        icon: "megaphone.fill"
                    )
                }
            }

            // Snippet
            if let snippet = result.snippet, !snippet.isEmpty {
                Text(snippet)
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)
                    .lineLimit(4)
                    .fixedSize(horizontal: false, vertical: true)
            }

            // Mots-cles correspondants
            if let matched = result.matchedKeywords, !matched.isEmpty {
                HStack(spacing: AppDimensions.spacingXS) {
                    Image(systemName: "tag.fill")
                        .font(.caption2)
                        .foregroundStyle(AppColors.warning)

                    FlowLayout(spacing: 4) {
                        ForEach(matched.split(separator: ",").map(String.init), id: \.self) { kw in
                            Text(kw.trimmingCharacters(in: .whitespaces))
                                .font(AppFonts.caption2)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 2)
                                .foregroundStyle(AppColors.warning)
                                .background(AppColors.warning.opacity(0.1))
                                .clipShape(Capsule())
                        }
                    }
                }
            }

            // URL + Score
            HStack {
                if let url = result.url, !url.isEmpty {
                    Link(destination: URL(string: url) ?? URL(string: "about:blank")!) {
                        HStack(spacing: AppDimensions.spacingXS) {
                            Image(systemName: "link")
                            Text(String(localized: "scanner.result.open_link"))
                        }
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.info)
                    }
                }

                Spacer()

                // Score de pertinence
                if let score = result.relevanceScore {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.caption2)
                            .foregroundStyle(relevanceColor(score: score))
                        Text(String(format: "%.0f%%", score * 100))
                            .font(AppFonts.badge)
                            .foregroundStyle(relevanceColor(score: score))
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(relevanceColor(score: score).opacity(0.1))
                    .clipShape(Capsule())
                }

                // Source
                if let source = result.source, !source.isEmpty {
                    Text(source.capitalized)
                        .font(AppFonts.caption2)
                        .foregroundStyle(AppColors.textTertiary)
                }
            }
        }
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }

    /// Couleur basee sur le score de pertinence
    private func relevanceColor(score: Double) -> Color {
        if score >= 0.8 { return AppColors.success }
        if score >= 0.5 { return AppColors.warning }
        return AppColors.muted
    }
}

#Preview {
    NavigationStack {
        ScanDetailView(scanId: 1)
    }
}
