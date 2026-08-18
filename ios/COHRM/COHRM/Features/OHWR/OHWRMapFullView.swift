// OHWRMapFullView.swift
// One Health Cameroon - Carte plein écran OHWR

import SwiftUI
import MapKit

/// Carte interactive plein écran avec filtres par type de ressource
struct OHWRMapFullView: View {

    @State private var markers: [OHWRMarker] = []
    @State private var isLoading = true
    @State private var showHuman = true
    @State private var showMaterial = true
    @State private var showOrganization = true
    @State private var selectedMarker: OHWRMarker?
    @AppStorage("appLanguage") private var appLanguage = "fr"

    private var filteredMarkers: [OHWRMarker] {
        markers.filter { marker in
            switch marker.type {
            case "human": showHuman
            case "material": showMaterial
            case "organization": showOrganization
            default: true
            }
        }
    }

    var body: some View {
        ZStack(alignment: .top) {
            // Map
            Map(initialPosition: .region(MKCoordinateRegion(
                center: CLLocationCoordinate2D(latitude: 5.96, longitude: 10.15),
                span: MKCoordinateSpan(latitudeDelta: 8, longitudeDelta: 8)
            )), selection: $selectedMarker) {
                ForEach(filteredMarkers) { marker in
                    if let coord = marker.coordinate {
                        Marker(marker.displayName, systemImage: marker.markerIcon, coordinate: coord)
                            .tint(markerColor(marker.type))
                            .tag(marker)
                    }
                }
            }
            .ignoresSafeArea(edges: .bottom)

            // Filter bar
            HStack(spacing: 8) {
                filterToggle("person.fill", appLanguage == "fr" ? "Experts" : "Experts", Color(hex: 0x2196F3), $showHuman)
                filterToggle("building.2.fill", "Orgs", Color(hex: 0x4CAF50), $showOrganization)
                filterToggle("wrench.fill", appLanguage == "fr" ? "Équip." : "Equip.", Color(hex: 0xFF9800), $showMaterial)
            }
            .padding(10)
            .background(.ultraThinMaterial)
            .clipShape(Capsule())
            .padding(.top, 8)

            // Selected marker info
            if let marker = selectedMarker {
                VStack {
                    Spacer()
                    markerDetail(marker)
                        .padding(16)
                        .transition(.move(edge: .bottom))
                }
            }
        }
        .navigationTitle(appLanguage == "fr" ? "Carte" : "Map")
        .navigationBarTitleDisplayMode(.inline)
        .task { await loadMarkers() }
    }

    private func filterToggle(_ icon: String, _ label: String, _ color: Color, _ isOn: Binding<Bool>) -> some View {
        Button {
            withAnimation { isOn.wrappedValue.toggle() }
        } label: {
            HStack(spacing: 4) {
                Image(systemName: icon).font(.caption2)
                Text(label).font(.caption2).fontWeight(.medium)
            }
            .padding(.horizontal, 10).padding(.vertical, 6)
            .background(isOn.wrappedValue ? color : Color.gray.opacity(0.3))
            .foregroundStyle(.white)
            .clipShape(Capsule())
        }
    }

    private func markerDetail(_ marker: OHWRMarker) -> some View {
        HStack(spacing: 12) {
            Image(systemName: marker.markerIcon)
                .font(.title2)
                .foregroundStyle(markerColor(marker.type))
                .frame(width: 44, height: 44)
                .background(markerColor(marker.type).opacity(0.12))
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 3) {
                Text(marker.displayName)
                    .font(.subheadline).fontWeight(.semibold)
                    .foregroundStyle(AppColors.textPrimary)
                HStack(spacing: 8) {
                    if let cat = marker.category ?? marker.title {
                        Text(cat).font(.caption2).foregroundStyle(AppColors.textSecondary)
                    }
                    if let region = marker.region {
                        Label(region, systemImage: "mappin").font(.caption2).foregroundStyle(AppColors.textTertiary)
                    }
                }
            }

            Spacer()

            Button {
                withAnimation { selectedMarker = nil }
            } label: {
                Image(systemName: "xmark.circle.fill")
                    .foregroundStyle(AppColors.muted)
            }
        }
        .padding(14)
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private func markerColor(_ type: String) -> Color {
        switch type {
        case "human": Color(hex: 0x2196F3)
        case "organization": Color(hex: 0x4CAF50)
        case "material": Color(hex: 0xFF9800)
        default: AppColors.muted
        }
    }

    private func loadMarkers() async {
        isLoading = true
        do {
            let response = try await OHWRService.shared.getMarkers()
            markers = response.data ?? []
        } catch { print("[OneHealth] Error: \(error.localizedDescription)") }
        isLoading = false
    }
}
