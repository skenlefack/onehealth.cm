// HistoryView.swift
// COHRM Cameroun - Vue de l'historique des signalements
//
// Affiche la liste complète des signalements locaux, groupés par mois,
// avec recherche, filtrage par statut, et actions par glissement.

import SwiftUI
import SwiftData

/// Vue principale de l'historique des signalements
struct HistoryView: View {

    // MARK: - SwiftData

    /// Tous les signalements locaux triés par date de création décroissante
    @Query(sort: \ReportModel.createdAt, order: .reverse)
    private var allReports: [ReportModel]

    /// Contexte SwiftData pour les opérations CRUD
    @Environment(\.modelContext) private var modelContext

    // MARK: - ViewModel

    @State private var viewModel = HistoryViewModel()

    // MARK: - État local

    /// Texte de recherche
    @State private var searchText = ""

    /// Filtre de statut sélectionné
    @State private var selectedFilter: SyncStatusFilter = .all

    /// Signalement à supprimer (confirmation)
    @State private var reportToDelete: ReportModel?

    /// Affiche l'alerte de confirmation de suppression
    @State private var showDeleteConfirmation = false

    /// Affiche l'alerte d'erreur
    @State private var showError = false

    // MARK: - Filtrage par statut

    /// Options de filtrage par statut de synchronisation
    enum SyncStatusFilter: String, CaseIterable, Identifiable {
        case all
        case pending
        case synced
        case error
        case draft

        var id: String { rawValue }

        var label: String {
            switch self {
            case .all:      String(localized: "history.filter.all")
            case .pending:  String(localized: "history.filter.pending")
            case .synced:   String(localized: "history.filter.synced")
            case .error:    String(localized: "history.filter.error")
            case .draft:    String(localized: "history.filter.draft")
            }
        }
    }

    // MARK: - Corps

    var body: some View {
        Group {
            if allReports.isEmpty {
                emptyStateView
            } else if filteredReports.isEmpty {
                noResultsView
            } else {
                reportListView
            }
        }
        .navigationTitle(String(localized: "history.title"))
        .searchable(
            text: $searchText,
            prompt: String(localized: "history.search.prompt")
        )
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                filterPicker
            }
        }
        .alert(
            String(localized: "history.delete.title"),
            isPresented: $showDeleteConfirmation,
            presenting: reportToDelete
        ) { report in
            Button(String(localized: "history.delete.cancel"), role: .cancel) {
                reportToDelete = nil
            }
            Button(String(localized: "history.delete.confirm"), role: .destructive) {
                viewModel.deleteReport(report, modelContext: modelContext)
                reportToDelete = nil
            }
        } message: { report in
            Text(
                String(localized: "history.delete.message \(report.title)")
            )
        }
        .alert(
            String(localized: "history.error.title"),
            isPresented: $showError
        ) {
            Button(String(localized: "history.error.ok")) {}
        } message: {
            if let error = viewModel.errorMessage {
                Text(error)
            }
        }
        .onChange(of: viewModel.showError) { _, newValue in
            showError = newValue
        }
    }

    // MARK: - Signalements filtrés et recherchés

    /// Applique la recherche textuelle et le filtre de statut
    private var filteredReports: [ReportModel] {
        viewModel.filteredReports(
            from: allReports,
            searchText: searchText,
            statusFilter: selectedFilter == .all ? nil : SyncStatus(rawValue: selectedFilter.rawValue)
        )
    }

    /// Signalements groupés par mois (clé = "Mars 2026", etc.)
    private var groupedByMonth: [(key: String, reports: [ReportModel])] {
        let grouped = Dictionary(grouping: filteredReports) { report in
            monthKey(for: report.createdAt)
        }

        // Trier les groupes par date décroissante (le plus récent en premier)
        return grouped
            .map { (key: $0.key, reports: $0.value) }
            .sorted { group1, group2 in
                guard let date1 = group1.reports.first?.createdAt,
                      let date2 = group2.reports.first?.createdAt else { return false }
                return date1 > date2
            }
    }

    // MARK: - Sous-vues

    /// Liste des signalements groupés par mois
    private var reportListView: some View {
        List {
            ForEach(groupedByMonth, id: \.key) { group in
                Section {
                    ForEach(group.reports, id: \.id) { report in
                        reportRow(report)
                            .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                                // Bouton supprimer
                                Button(role: .destructive) {
                                    reportToDelete = report
                                    showDeleteConfirmation = true
                                } label: {
                                    Label(
                                        String(localized: "history.action.delete"),
                                        systemImage: "trash.fill"
                                    )
                                }
                            }
                            .swipeActions(edge: .leading, allowsFullSwipe: true) {
                                // Bouton réessayer la synchronisation (seulement si en erreur ou en attente)
                                if report.syncStatus == .error || report.syncStatus == .pending {
                                    Button {
                                        Task {
                                            await viewModel.retrySync(
                                                for: report,
                                                modelContext: modelContext
                                            )
                                        }
                                    } label: {
                                        Label(
                                            String(localized: "history.action.retry"),
                                            systemImage: "arrow.clockwise"
                                        )
                                    }
                                    .tint(AppColors.info)
                                }
                            }
                    }
                } header: {
                    Text(group.key)
                        .font(AppFonts.subheadline)
                        .foregroundStyle(AppColors.textSecondary)
                }
            }
        }
        .listStyle(.insetGrouped)
    }

    /// Ligne d'un signalement dans la liste
    private func reportRow(_ report: ReportModel) -> some View {
        HStack(spacing: AppDimensions.spacingM) {
            // Icône de catégorie avec couleur
            categoryIcon(for: report)

            // Informations textuelles
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                Text(report.title.isEmpty
                     ? String(localized: "history.row.untitled")
                     : report.title)
                    .font(AppFonts.headline)
                    .foregroundStyle(AppColors.textPrimary)
                    .lineLimit(1)

                HStack(spacing: AppDimensions.spacingS) {
                    // Région
                    if !report.region.isEmpty {
                        Label(report.region, systemImage: "mappin")
                            .font(AppFonts.caption)
                            .foregroundStyle(AppColors.textTertiary)
                    }

                    // Date relative
                    Text(report.createdAt.relativeString)
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textTertiary)
                }
            }

            Spacer()

            // Badge de statut de synchronisation
            syncStatusBadge(for: report.syncStatus)
        }
        .padding(.vertical, AppDimensions.spacingXS)
    }

    /// Icône de catégorie avec fond coloré
    private func categoryIcon(for report: ReportModel) -> some View {
        let category = report.eventCategory
        let icon = category?.icon ?? "questionmark.circle.fill"
        let color = category?.color ?? AppColors.muted

        return Image(systemName: icon)
            .font(.body.weight(.semibold))
            .foregroundStyle(.white)
            .frame(width: AppDimensions.eventIconSize, height: AppDimensions.eventIconSize)
            .background(color.gradient)
            .clipShape(RoundedRectangle(
                cornerRadius: AppDimensions.cornerRadiusS,
                style: .continuous
            ))
    }

    /// Badge de statut de synchronisation
    private func syncStatusBadge(for status: SyncStatus) -> some View {
        StatusBadge(
            status.label,
            color: status.color,
            icon: status.icon
        )
    }

    /// Sélecteur de filtre dans la toolbar
    private var filterPicker: some View {
        Menu {
            Picker(
                String(localized: "history.filter.label"),
                selection: $selectedFilter
            ) {
                ForEach(SyncStatusFilter.allCases) { filter in
                    Text(filter.label)
                        .tag(filter)
                }
            }
        } label: {
            Label(
                String(localized: "history.filter.label"),
                systemImage: selectedFilter == .all
                    ? "line.3.horizontal.decrease.circle"
                    : "line.3.horizontal.decrease.circle.fill"
            )
        }
    }

    /// Vue d'état vide (aucun signalement)
    private var emptyStateView: some View {
        ContentUnavailableView {
            Label(
                String(localized: "history.empty.title"),
                systemImage: "doc.text.magnifyingglass"
            )
        } description: {
            Text(String(localized: "history.empty.description"))
        } actions: {
            // Le bouton pourrait naviguer vers la création de signalement
            Text(String(localized: "history.empty.hint"))
                .font(AppFonts.footnote)
                .foregroundStyle(AppColors.textTertiary)
        }
    }

    /// Vue quand la recherche/le filtre ne renvoie aucun résultat
    private var noResultsView: some View {
        ContentUnavailableView {
            Label(
                String(localized: "history.no_results.title"),
                systemImage: "magnifyingglass"
            )
        } description: {
            Text(String(localized: "history.no_results.description"))
        }
    }

    // MARK: - Utilitaires

    /// Génère une clé de regroupement par mois à partir d'une date.
    /// Ex : "Mars 2026"
    private func monthKey(for date: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.dateFormat = "MMMM yyyy"
        return formatter.string(from: date).localizedCapitalized
    }
}

// MARK: - Prévisualisation

#Preview {
    NavigationStack {
        HistoryView()
            .modelContainer(for: ReportModel.self, inMemory: true)
    }
}
