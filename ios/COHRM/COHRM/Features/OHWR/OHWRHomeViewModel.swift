// OHWRHomeViewModel.swift
// One Health Cameroon - ViewModel pour l'accueil OHWR

import Foundation

@MainActor
@Observable
final class OHWRHomeViewModel {

    var stats: OHWRStats?
    var markers: [OHWRMarker] = []
    var featuredDocs: [OHWRDocument] = []
    var isLoading = false

    func loadAll() async {
        isLoading = true
        async let s = loadStats()
        async let m = loadMarkers()
        async let d = loadDocs()
        _ = await (s, m, d)
        isLoading = false
    }

    private func loadStats() async {
        do {
            let response = try await OHWRService.shared.getStats()
            stats = response.data
        } catch {
            print("[OHWR] Stats error: \(error.localizedDescription)")
        }
    }

    private func loadMarkers() async {
        do {
            let response = try await OHWRService.shared.getMarkers(types: "human,material,organization")
            markers = response.data ?? []
        } catch {
            print("[OHWR] Markers error: \(error.localizedDescription)")
        }
    }

    private func loadDocs() async {
        do {
            let response = try await OHWRService.shared.getFeaturedDocuments(limit: 5)
            featuredDocs = response.data ?? []
        } catch {
            print("[OHWR] Docs error: \(error.localizedDescription)")
        }
    }
}
