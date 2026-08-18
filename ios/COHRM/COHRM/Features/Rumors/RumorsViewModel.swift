// RumorsViewModel.swift
// One Health Cameroon - ViewModel de la liste des rumeurs

import Foundation
import SwiftData

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

    /// Indique si les données affichées proviennent du cache hors-ligne
    var isOfflineData = false

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

    /// Priorite selectionnee (nil = toutes)
    var selectedPriority: String? = nil {
        didSet {
            if oldValue != selectedPriority {
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

    /// Liste des priorites de filtre
    static let priorities: [(key: String?, label: String)] = [
        (nil, String(localized: "rumors.filter.all_priorities")),
        ("low", String(localized: "rumors.priority.low")),
        ("medium", String(localized: "rumors.priority.medium")),
        ("high", String(localized: "rumors.priority.high")),
        ("critical", String(localized: "rumors.priority.critical")),
    ]

    // MARK: - Chargement

    /// Charge une page de rumeurs avec les filtres courants
    func loadRumors(page: Int = 1, modelContext: ModelContext? = nil) async {
        if page == 1 {
            isLoading = true
        } else {
            isLoadingMore = true
        }
        errorMessage = nil
        if page == 1 { isOfflineData = false }

        do {
            let response = try await APIService.shared.getRumors(
                page: page,
                limit: 20,
                status: selectedStatus,
                priority: selectedPriority,
                search: searchText.isEmpty ? nil : searchText
            )

            if let data = response.data {
                if page == 1 {
                    rumors = data
                    // Mettre en cache les résultats pour consultation hors-ligne
                    if let modelContext = modelContext {
                        cacheRumors(data, modelContext: modelContext)
                    }
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
            // Fallback hors-ligne : charger depuis le cache si la liste est vide
            if page == 1 && rumors.isEmpty, let modelContext = modelContext {
                loadCachedRumors(modelContext: modelContext)
            } else {
                errorMessage = error.localizedDescription
            }
        }

        isLoading = false
        isLoadingMore = false
    }

    /// Charge la page suivante si disponible
    func loadMore(modelContext: ModelContext? = nil) async {
        guard hasMorePages, !isLoadingMore, !isLoading else { return }
        await loadRumors(page: currentPage + 1, modelContext: modelContext)
    }

    /// Rafraichit depuis la premiere page
    func refresh(modelContext: ModelContext? = nil) async {
        currentPage = 1
        totalPages = 1
        await loadRumors(page: 1, modelContext: modelContext)
    }

    // MARK: - Cache hors-ligne

    /// Met en cache les rumeurs récupérées depuis l'API
    private func cacheRumors(_ rumors: [RumorSummary], modelContext: ModelContext) {
        do {
            // Supprimer les anciennes entrées du cache
            try modelContext.delete(model: CachedRumor.self)

            // Insérer les nouvelles
            for rumor in rumors {
                let cached = CachedRumor(from: rumor)
                modelContext.insert(cached)
            }

            try modelContext.save()
        } catch {
            print("Erreur mise en cache des rumeurs : \(error)")
        }
    }

    /// Charge les rumeurs depuis le cache SwiftData en cas d'erreur réseau
    private func loadCachedRumors(modelContext: ModelContext) {
        do {
            let descriptor = FetchDescriptor<CachedRumor>(
                sortBy: [SortDescriptor(\.cachedAt, order: .reverse)]
            )
            let cachedRumors = try modelContext.fetch(descriptor)

            if !cachedRumors.isEmpty {
                rumors = cachedRumors.map { $0.toRumorSummary() }
                isOfflineData = true
                totalPages = 1
                currentPage = 1
                errorMessage = nil
            } else {
                errorMessage = String(localized: "rumors.error.no_cache")
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
