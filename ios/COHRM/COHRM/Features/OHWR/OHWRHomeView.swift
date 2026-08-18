// OHWRHomeView.swift
// One Health Cameroon - Accueil du module OHWR (Cartographie des Ressources)

import SwiftUI
import MapKit

/// Accueil OHWR avec carte interactive, stats et navigation par pilier
struct OHWRHomeView: View {

    @State private var viewModel = OHWRHomeViewModel()
    @AppStorage("appLanguage") private var appLanguage = "fr"

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                headerSection
                contentSection
            }
        }
        .background(AppColors.background)
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .refreshable { await viewModel.loadAll() }
        .task { await viewModel.loadAll() }
    }

    // MARK: - Header

    private var headerSection: some View {
        ZStack(alignment: .bottomLeading) {
            LinearGradient(
                colors: [Color(hex: 0x1A5276), Color(hex: 0x2980B9), Color(hex: 0x3498DB)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .frame(height: 200)
            .clipShape(UnevenRoundedRectangle(bottomLeadingRadius: 28, bottomTrailingRadius: 28))

            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 8) {
                    Image(systemName: "map.fill").font(.title2)
                    Text(appLanguage == "fr" ? "Cartographie des Ressources" : "Resource Mapping")
                        .font(.title3).fontWeight(.bold)
                }

                Text(appLanguage == "fr"
                     ? "Experts, organisations, équipements et documents One Health"
                     : "One Health experts, organizations, equipment and documents")
                    .font(.caption)
                    .opacity(0.85)

                // Stats pills
                if let stats = viewModel.stats {
                    HStack(spacing: 10) {
                        statPill("\(stats.humanResources?.total ?? 0)", appLanguage == "fr" ? "Experts" : "Experts")
                        statPill("\(stats.organizations?.total ?? 0)", appLanguage == "fr" ? "Orgs" : "Orgs")
                        statPill("\(stats.materialResources?.total ?? 0)", appLanguage == "fr" ? "Équip." : "Equip.")
                        statPill("\(stats.documents?.total ?? 0)", "Docs")
                    }
                    .padding(.top, 4)
                }
            }
            .foregroundStyle(.white)
            .padding(20)
        }
    }

    private func statPill(_ value: String, _ label: String) -> some View {
        VStack(spacing: 1) {
            Text(value).font(.subheadline).fontWeight(.bold)
            Text(label).font(.caption2).opacity(0.7)
        }
        .padding(.horizontal, 10).padding(.vertical, 5)
        .background(.white.opacity(0.15))
        .clipShape(Capsule())
    }

    // MARK: - Content

    private var contentSection: some View {
        VStack(spacing: 24) {
            // Interactive map
            mapSection

            // 4 Pillars navigation
            pillarsSection

            // Recent documents
            if !viewModel.featuredDocs.isEmpty {
                documentsSection
            }
        }
        .padding(.top, 16)
        .padding(.bottom, 32)
    }

    // MARK: - Map

    private var mapSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(appLanguage == "fr" ? "Carte des ressources" : "Resource map")
                    .font(.headline).fontWeight(.semibold)
                Spacer()
                NavigationLink(destination: OHWRMapFullView()) {
                    Text(appLanguage == "fr" ? "Plein écran" : "Full screen")
                        .font(.caption).foregroundStyle(Color(hex: 0x2980B9))
                }
            }
            .padding(.horizontal, 16)

            // Mini map
            Map(initialPosition: .region(MKCoordinateRegion(
                center: CLLocationCoordinate2D(latitude: 5.96, longitude: 10.15),
                span: MKCoordinateSpan(latitudeDelta: 8, longitudeDelta: 8)
            ))) {
                ForEach(viewModel.markers) { marker in
                    if let coord = marker.coordinate {
                        Marker(marker.displayName, systemImage: marker.markerIcon, coordinate: coord)
                            .tint(markerColor(marker.type))
                    }
                }
            }
            .frame(height: 220)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .padding(.horizontal, 16)

            // Legend
            HStack(spacing: 16) {
                legendItem("person.fill", appLanguage == "fr" ? "Experts" : "Experts", Color(hex: 0x2196F3))
                legendItem("building.2.fill", appLanguage == "fr" ? "Organisations" : "Organizations", Color(hex: 0x4CAF50))
                legendItem("wrench.and.screwdriver.fill", appLanguage == "fr" ? "Équipements" : "Equipment", Color(hex: 0xFF9800))
            }
            .font(.caption2)
            .padding(.horizontal, 16)
        }
    }

    private func legendItem(_ icon: String, _ label: String, _ color: Color) -> some View {
        HStack(spacing: 4) {
            Image(systemName: icon).foregroundStyle(color)
            Text(label).foregroundStyle(AppColors.textSecondary)
        }
    }

    private func markerColor(_ type: String) -> Color {
        switch type {
        case "human": Color(hex: 0x2196F3)
        case "organization": Color(hex: 0x4CAF50)
        case "material": Color(hex: 0xFF9800)
        default: AppColors.muted
        }
    }

    // MARK: - 4 Pillars

    private var pillarsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(appLanguage == "fr" ? "Explorer par pilier" : "Explore by pillar")
                .font(.headline).fontWeight(.semibold)
                .padding(.horizontal, 16)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                pillarCard(
                    icon: "person.3.fill",
                    title: appLanguage == "fr" ? "Experts" : "Experts",
                    subtitle: "\(viewModel.stats?.humanResources?.total ?? 0) " + (appLanguage == "fr" ? "répertoriés" : "listed"),
                    color: Color(hex: 0x2196F3),
                    destination: OHWRExpertsListView()
                )
                pillarCard(
                    icon: "wrench.and.screwdriver.fill",
                    title: appLanguage == "fr" ? "Équipements" : "Equipment",
                    subtitle: "\(viewModel.stats?.materialResources?.total ?? 0) " + (appLanguage == "fr" ? "répertoriés" : "listed"),
                    color: Color(hex: 0xFF9800),
                    destination: OHWRMaterialsListView()
                )
                pillarCard(
                    icon: "building.2.fill",
                    title: appLanguage == "fr" ? "Organisations" : "Organizations",
                    subtitle: "\(viewModel.stats?.organizations?.total ?? 0) " + (appLanguage == "fr" ? "répertoriées" : "listed"),
                    color: Color(hex: 0x4CAF50),
                    destination: OHWROrganizationsListView()
                )
                pillarCard(
                    icon: "doc.text.fill",
                    title: "Documents",
                    subtitle: "\(viewModel.stats?.documents?.total ?? 0) " + (appLanguage == "fr" ? "disponibles" : "available"),
                    color: Color(hex: 0x9B59B6),
                    destination: OHWRDocumentsListView()
                )
            }
            .padding(.horizontal, 16)
        }
    }

    private func pillarCard(icon: String, title: String, subtitle: String, color: Color, destination: some View) -> some View {
        NavigationLink(destination: destination) {
            VStack(spacing: 10) {
                Image(systemName: icon)
                    .font(.title2).foregroundStyle(color)
                Text(title)
                    .font(.subheadline).fontWeight(.semibold)
                    .foregroundStyle(AppColors.textPrimary)
                Text(subtitle)
                    .font(.caption2).foregroundStyle(AppColors.textSecondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
            .background(color.opacity(0.08))
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .buttonStyle(.plain)
    }

    // MARK: - Documents

    private var documentsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(appLanguage == "fr" ? "Documents récents" : "Recent documents")
                    .font(.headline).fontWeight(.semibold)
                Spacer()
                NavigationLink(destination: OHWRDocumentsListView()) {
                    Text(appLanguage == "fr" ? "Voir tout" : "See all")
                        .font(.caption).foregroundStyle(Color(hex: 0x2980B9))
                }
            }
            .padding(.horizontal, 16)

            ForEach(viewModel.featuredDocs.prefix(3)) { doc in
                HStack(spacing: 12) {
                    Image(systemName: docIcon(doc.type))
                        .font(.title3).foregroundStyle(Color(hex: 0x9B59B6))
                        .frame(width: 40, height: 40)
                        .background(Color(hex: 0x9B59B6).opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: 8))

                    VStack(alignment: .leading, spacing: 3) {
                        Text(doc.title)
                            .font(.subheadline).fontWeight(.medium)
                            .foregroundStyle(AppColors.textPrimary)
                            .lineLimit(2)
                        HStack(spacing: 8) {
                            if let org = doc.organizationAcronym ?? doc.organizationName {
                                Text(org).font(.caption2).foregroundStyle(AppColors.textSecondary)
                            }
                            if let date = doc.publicationDate {
                                Text(String(date.prefix(10))).font(.caption2).foregroundStyle(AppColors.textTertiary)
                            }
                        }
                    }
                    Spacer()
                }
                .padding(12)
                .background(AppColors.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .padding(.horizontal, 16)
            }
        }
    }

    private func docIcon(_ type: String?) -> String {
        switch type {
        case "guide": "book.fill"
        case "protocol": "doc.badge.gearshape.fill"
        case "article": "newspaper.fill"
        case "report": "chart.bar.doc.horizontal.fill"
        case "policy": "building.columns.fill"
        default: "doc.text.fill"
        }
    }
}
