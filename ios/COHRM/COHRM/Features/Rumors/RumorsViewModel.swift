// RumorsViewModel.swift
// COHRM Cameroun - ViewModel de la liste des rumeurs

import Foundation

/// ViewModel principal pour la gestion et le filtrage des rumeurs
@MainActor
@Observable
final class RumorsViewModel {

    // MARK: - Donnees

    /// Liste des rumeurs chargees
    var rumors: [RumorSummary] = []

    /// Indicateur de chargement initial
    var isLoading = false

    /// Indicateur de chargement de la page suivante
    var isLoadingMore = false

    /// Message d'erreur eventuel
    var errorMessage: String?

    /// Page courante
    private(set) var currentPage = 1

    /// Nombre total de pages disponibles
    private(set) var totalPages = 1

    /// Indique s'il reste des pages a charger
    var hasMorePages: Bool { currentPage < totalPages }

    // MARK: - Filtres

    /// Statut selectionne (nil = tous)
    var selectedStatus: String? = nil {
        didSet {
            if oldValue != selectedStatus {
                Task { await refresh() }
            }
        }
    }

    /// Texte de recherche
    var searchText: String = "" {
        didSet {
            searchTask?.cancel()
            let text = searchText
            searchTask = Task {
                try? await Task.sleep(for: .milliseconds(400))
                guard !Task.isCancelled else { return }
                if text != oldValue {
                    await refresh()
                }
            }
        }
    }

    /// Tache de debounce pour la recherche
    private var searchTask: Task<Void, Never>?

    // MARK: - Statuts disponibles

    /// Liste des statuts de filtre
    static let statuses: [(key: String?, label: String)] = [
        (nil, String(localized: "rumors.filter.all")),
        ("pending", String(localized: "rumors.filter.pending")),
        ("investigating", String(localized: "rumors.filter.investigating")),
        ("confirmed", String(localized: "rumors.filter.confirmed")),
        ("false_alarm", String(localized: "rumors.filter.false_alarm")),
        ("closed", String(localized: "rumors.filter.closed")),
    ]

    // MARK: - Chargement

    /// Charge une page de rumeurs avec les filtres courants
    func loadRumors(page: Int = 1) async {
        if page == 1 {
            isLoading = true
        } else {
            isLoadingMore = true
        }
        errorMessage = nil

        do {
            let response = try await APIService.shared.getRumors(
                page: page,
                limit: 20,
                status: selectedStatus,
                search: searchText.isEmpty ? nil : searchText
            )

            if let data = response.data {
                if page == 1 {
                    rumors = data
                } else {
                    rumors.append(contentsOf: data)
                }
                currentPage = page
                // Estimate total pages from response count
                if data.count < 20 {
                    totalPages = page
                } else {
                    totalPages = page + 1
                }
            } else {
                if page == 1 { rumors = [] }
                totalPages = page
            }
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
        isLoadingMore = false
    }

    /// Charge la page suivante si disponible
    func loadMore() async {
        guard hasMorePages, !isLoadingMore, !isLoading else { return }
        await loadRumors(page: currentPage + 1)
    }

    /// Rafraichit depuis la premiere page
    func refresh() async {
        currentPage = 1
        totalPages = 1
        await loadRumors(page: 1)
    }
}
