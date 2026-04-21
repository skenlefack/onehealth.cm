// RumorsListView.swift
// COHRM Cameroun - Liste des rumeurs avec filtres et recherche

import SwiftUI

/// Vue principale de la liste des rumeurs
struct RumorsListView: View {

    @State private var viewModel = RumorsViewModel()

    var body: some View {
        ZStack {
            AppColors.groupedBackground
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Chips de filtrage
                FilterChipsView(
                    selectedStatus: $viewModel.selectedStatus,
                    options: RumorsViewModel.statuses
                )
                .padding(.vertical, AppDimensions.spacingS)

                // Contenu principal
                if viewModel.isLoading && viewModel.rumors.isEmpty {
                    loadingView
                } else if let error = viewModel.errorMessage, viewModel.rumors.isEmpty {
                    errorView(message: error)
                } else if viewModel.rumors.isEmpty {
                    emptyView
                } else {
                    rumorsList
                }
            }
        }
        .navigationTitle(String(localized: "rumors.title"))
        .navigationBarTitleDisplayMode(.large)
        .searchable(
            text: $viewModel.searchText,
            prompt: String(localized: "rumors.search.placeholder")
        )
        .refreshable {
            await viewModel.refresh()
        }
        .task {
            if viewModel.rumors.isEmpty {
                await viewModel.loadRumors()
            }
        }
    }

    // MARK: - Liste

    private var rumorsList: some View {
        ScrollView {
            LazyVStack(spacing: AppDimensions.spacingS) {
                ForEach(viewModel.rumors) { rumor in
                    NavigationLink(value: rumor.id) {
                        RumorRowView(rumor: rumor)
                    }
                    .buttonStyle(.plain)
                    .onAppear {
                        // Infinite scroll : charger plus quand le dernier element apparait
                        if rumor.id == viewModel.rumors.last?.id {
                            Task { await viewModel.loadMore() }
                        }
                    }
                }

                // Indicateur de chargement en bas
                if viewModel.isLoadingMore {
                    HStack {
                        Spacer()
                        ProgressView()
                            .padding(AppDimensions.spacing)
                        Spacer()
                    }
                }
            }
            .padding(.horizontal, AppDimensions.spacing)
            .padding(.bottom, AppDimensions.spacingXXL)
        }
        .navigationDestination(for: Int.self) { rumorId in
            RumorDetailView(rumorId: rumorId)
        }
    }

    // MARK: - Etats

    private var loadingView: some View {
        VStack(spacing: AppDimensions.spacingM) {
            Spacer()
            ProgressView()
                .scaleEffect(1.2)
            Text(String(localized: "rumors.loading"))
                .font(AppFonts.callout)
                .foregroundStyle(AppColors.textSecondary)
            Spacer()
        }
    }

    private func errorView(message: String) -> some View {
        VStack(spacing: AppDimensions.spacingM) {
            Spacer()

            Image(systemName: "wifi.exclamationmark")
                .font(.system(size: 48, weight: .light))
                .foregroundStyle(AppColors.danger)

            Text(String(localized: "rumors.error.title"))
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
                Task { await viewModel.refresh() }
            }
            .padding(.horizontal, AppDimensions.spacingXL)

            Spacer()
        }
    }

    private var emptyView: some View {
        VStack(spacing: AppDimensions.spacingM) {
            Spacer()

            Image(systemName: "tray")
                .font(.system(size: 48, weight: .light))
                .foregroundStyle(AppColors.muted)

            Text(String(localized: "rumors.empty.title"))
                .font(AppFonts.headline)
                .foregroundStyle(AppColors.textPrimary)

            Text(String(localized: "rumors.empty.message"))
                .font(AppFonts.callout)
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, AppDimensions.spacingXL)

            Spacer()
        }
    }
}

#Preview {
    NavigationStack {
        RumorsListView()
    }
}
