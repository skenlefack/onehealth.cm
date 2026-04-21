// ScannerViewModel.swift
// COHRM Cameroun - ViewModel du scanner de rumeurs

import Foundation

/// ViewModel pour le scanner de rumeurs en ligne
@MainActor
@Observable
final class ScannerViewModel {

    // MARK: - Donnees

    /// Historique des scans
    var scans: [ScanItemDTO] = []

    /// Detail du scan selectionne
    var scanDetail: ScanDetailDTO?

    // MARK: - Inputs

    /// Source selectionnee pour le scan
    var selectedSource: ScanSource = .all

    /// Mots-cles de recherche
    var keywords: String = ""

    // MARK: - Etats

    /// Scan en cours d'execution
    var isScanning = false

    /// Chargement de l'historique
    var isLoadingHistory = false

    /// Chargement du detail
    var isLoadingDetail = false

    /// Message d'erreur
    var errorMessage: String?

    /// Message de succes
    var successMessage: String?

    /// Page courante de l'historique
    private(set) var currentPage = 1

    /// S'il y a plus de pages
    var hasMorePages = false

    // MARK: - Sources disponibles

    /// Sources de scan
    enum ScanSource: String, CaseIterable, Identifiable {
        case all = "all"
        case google = "google"
        case twitter = "twitter"
        case facebook = "facebook"

        var id: String { rawValue }

        var label: String {
            switch self {
            case .all: return String(localized: "scanner.source.all")
            case .google: return String(localized: "scanner.source.google")
            case .twitter: return String(localized: "scanner.source.twitter")
            case .facebook: return String(localized: "scanner.source.facebook")
            }
        }

        var icon: String {
            switch self {
            case .all: return "globe"
            case .google: return "magnifyingglass"
            case .twitter: return "at"
            case .facebook: return "person.2.fill"
            }
        }

        var apiValue: String? {
            self == .all ? nil : rawValue
        }
    }

    // MARK: - Actions

    /// Lance un nouveau scan
    func runScan() async {
        let keywordList = keywords
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }

        guard !keywordList.isEmpty else {
            errorMessage = String(localized: "scanner.error.no_keywords")
            return
        }

        isScanning = true
        errorMessage = nil
        successMessage = nil

        do {
            let response = try await APIService.shared.runScan(
                source: selectedSource.apiValue,
                keywords: keywordList
            )

            if response.success {
                successMessage = String(localized: "scanner.success.started")
                keywords = ""
                // Recharger l'historique pour voir le nouveau scan
                await loadHistory()
            } else {
                errorMessage = response.message ?? String(localized: "scanner.error.generic")
            }
        } catch {
            errorMessage = error.localizedDescription
        }

        isScanning = false
    }

    /// Charge l'historique des scans
    func loadHistory(page: Int = 1) async {
        isLoadingHistory = true
        errorMessage = nil

        do {
            let response = try await APIService.shared.getScanHistory(
                page: page,
                limit: 20
            )

            if let data = response.data {
                if page == 1 {
                    scans = data
                } else {
                    scans.append(contentsOf: data)
                }
                currentPage = page
                hasMorePages = data.count >= 20
            } else {
                if page == 1 { scans = [] }
                hasMorePages = false
            }
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoadingHistory = false
    }

    /// Charge le detail d'un scan
    func loadDetail(id: Int) async {
        isLoadingDetail = true
        errorMessage = nil

        do {
            let response = try await APIService.shared.getScanDetail(id: id)
            scanDetail = response.data
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoadingDetail = false
    }

    /// Charge la page suivante de l'historique
    func loadMore() async {
        guard hasMorePages, !isLoadingHistory else { return }
        await loadHistory(page: currentPage + 1)
    }
}
