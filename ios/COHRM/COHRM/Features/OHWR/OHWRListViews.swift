// OHWRListViews.swift
// One Health Cameroon - Listes des 4 piliers OHWR

import SwiftUI

// MARK: - Experts List

struct OHWRExpertsListView: View {

    @State private var experts: [OHWRExpert] = []
    @State private var isLoading = true
    @State private var searchText = ""
    @State private var currentPage = 1
    @State private var hasMore = true
    @AppStorage("appLanguage") private var appLanguage = "fr"

    var body: some View {
        Group {
            if isLoading && experts.isEmpty {
                ProgressView().controlSize(.large).frame(maxWidth: .infinity, minHeight: 300)
            } else if experts.isEmpty {
                ContentUnavailableView(
                    appLanguage == "fr" ? "Aucun expert trouvé" : "No experts found",
                    systemImage: "person.3"
                )
            } else {
                List {
                    ForEach(experts) { expert in
                        NavigationLink(destination: OHWRExpertDetailView(expertId: expert.id)) {
                            expertRow(expert)
                        }
                        .onAppear {
                            if expert.id == experts.last?.id && hasMore {
                                Task { await loadMore() }
                            }
                        }
                    }
                }
                .listStyle(.plain)
            }
        }
        .navigationTitle(appLanguage == "fr" ? "Experts" : "Experts")
        .searchable(text: $searchText, prompt: appLanguage == "fr" ? "Rechercher un expert..." : "Search for an expert...")
        .onSubmit(of: .search) { Task { await reload() } }
        .task { await reload() }
    }

    private func expertRow(_ expert: OHWRExpert) -> some View {
        HStack(spacing: 12) {
            // Avatar
            ZStack {
                Circle().fill(Color(hex: 0x2196F3).opacity(0.12))
                    .frame(width: 44, height: 44)
                Text(String(expert.firstName?.prefix(1) ?? "?"))
                    .font(.headline).foregroundStyle(Color(hex: 0x2196F3))
            }

            VStack(alignment: .leading, spacing: 3) {
                Text(expert.fullName)
                    .font(.subheadline).fontWeight(.medium)
                if let title = expert.title {
                    Text(title).font(.caption2).foregroundStyle(AppColors.textSecondary)
                }
                HStack(spacing: 8) {
                    if let cat = expert.category {
                        Text(cat).font(.caption2).foregroundStyle(Color(hex: 0x2196F3))
                    }
                    if let region = expert.region {
                        Label(region, systemImage: "mappin")
                            .font(.caption2).foregroundStyle(AppColors.textTertiary)
                    }
                }
            }

            Spacer()

            if expert.isVerified == 1 {
                Image(systemName: "checkmark.seal.fill")
                    .foregroundStyle(Color(hex: 0x2196F3))
                    .font(.caption)
            }
        }
    }

    private func reload() async {
        currentPage = 1; hasMore = true; isLoading = true
        do {
            let response = try await OHWRService.shared.getExperts(search: searchText.isEmpty ? nil : searchText)
            experts = response.data ?? []
            hasMore = (response.pagination?.page ?? 1) < (response.pagination?.pages ?? 1)
        } catch {}
        isLoading = false
    }

    private func loadMore() async {
        guard !isLoading else { return }
        currentPage += 1; isLoading = true
        do {
            let response = try await OHWRService.shared.getExperts(page: currentPage, search: searchText.isEmpty ? nil : searchText)
            if let data = response.data { experts.append(contentsOf: data) }
            hasMore = (response.pagination?.page ?? 1) < (response.pagination?.pages ?? 1)
        } catch { currentPage -= 1 }
        isLoading = false
    }
}

// MARK: - Expert Detail

struct OHWRExpertDetailView: View {

    let expertId: Int
    @State private var expert: OHWRExpert?
    @State private var isLoading = true
    @AppStorage("appLanguage") private var appLanguage = "fr"

    var body: some View {
        ScrollView {
            if isLoading {
                ProgressView().controlSize(.large).frame(maxWidth: .infinity, minHeight: 300)
            } else if let expert {
                VStack(spacing: 16) {
                    // Header card
                    VStack(spacing: 12) {
                        ZStack {
                            Circle().fill(Color(hex: 0x2196F3).opacity(0.12)).frame(width: 80, height: 80)
                            Text(String(expert.firstName?.prefix(1) ?? ""))
                                .font(.largeTitle).foregroundStyle(Color(hex: 0x2196F3))
                        }
                        Text(expert.fullName).font(.title3).fontWeight(.bold)
                        if let title = expert.title {
                            Text(title).font(.subheadline).foregroundStyle(AppColors.textSecondary)
                        }
                        if expert.isVerified == 1 {
                            Label(appLanguage == "fr" ? "Vérifié" : "Verified", systemImage: "checkmark.seal.fill")
                                .font(.caption2).foregroundStyle(Color(hex: 0x2196F3))
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(20)
                    .background(AppColors.cardBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 16))

                    // Info card
                    VStack(alignment: .leading, spacing: 10) {
                        if let cat = expert.category {
                            detailRow("briefcase.fill", appLanguage == "fr" ? "Catégorie" : "Category", cat)
                        }
                        if let org = expert.organizationName {
                            detailRow("building.2.fill", appLanguage == "fr" ? "Organisation" : "Organization", org)
                        }
                        if let region = expert.region {
                            detailRow("mappin.circle.fill", appLanguage == "fr" ? "Région" : "Region", region)
                        }
                        if let years = expert.yearsExperience, years > 0 {
                            detailRow("clock.fill", appLanguage == "fr" ? "Expérience" : "Experience", "\(years) " + (appLanguage == "fr" ? "ans" : "years"))
                        }
                        if let email = expert.email {
                            detailRow("envelope.fill", "Email", email)
                        }
                        if let phone = expert.phone {
                            detailRow("phone.fill", appLanguage == "fr" ? "Téléphone" : "Phone", phone)
                        }
                    }
                    .padding(16)
                    .background(AppColors.cardBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 14))

                    // Bio
                    if let bio = expert.biography, !bio.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text(appLanguage == "fr" ? "Biographie" : "Biography")
                                .font(.headline).fontWeight(.semibold)
                            Text(bio).font(.subheadline).foregroundStyle(AppColors.textSecondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(16)
                        .background(AppColors.cardBackground)
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                }
                .padding(16)
            }
        }
        .background(AppColors.background)
        .navigationBarTitleDisplayMode(.inline)
        .task {
            do {
                let response = try await OHWRService.shared.getExpertDetail(id: expertId)
                expert = response.data
            } catch {}
            isLoading = false
        }
    }

    private func detailRow(_ icon: String, _ label: String, _ value: String) -> some View {
        HStack(spacing: 10) {
            Image(systemName: icon).foregroundStyle(Color(hex: 0x2196F3)).frame(width: 20)
            VStack(alignment: .leading, spacing: 1) {
                Text(label).font(.caption2).foregroundStyle(AppColors.textTertiary)
                Text(value).font(.subheadline).foregroundStyle(AppColors.textPrimary)
            }
        }
    }
}

// MARK: - Organizations List

struct OHWROrganizationsListView: View {

    @State private var items: [OHWROrganization] = []
    @State private var isLoading = true
    @State private var searchText = ""
    @AppStorage("appLanguage") private var appLanguage = "fr"

    var body: some View {
        Group {
            if isLoading && items.isEmpty {
                ProgressView().controlSize(.large).frame(maxWidth: .infinity, minHeight: 300)
            } else if items.isEmpty {
                ContentUnavailableView(appLanguage == "fr" ? "Aucune organisation" : "No organizations", systemImage: "building.2")
            } else {
                List(items) { org in
                    HStack(spacing: 12) {
                        ZStack {
                            Circle().fill(Color(hex: 0x4CAF50).opacity(0.12)).frame(width: 44, height: 44)
                            Image(systemName: "building.2.fill").foregroundStyle(Color(hex: 0x4CAF50))
                        }
                        VStack(alignment: .leading, spacing: 3) {
                            Text(org.displayName).font(.subheadline).fontWeight(.medium)
                            if let type = org.type {
                                Text(type).font(.caption2).foregroundStyle(Color(hex: 0x4CAF50))
                            }
                            if let region = org.region {
                                Label(region, systemImage: "mappin").font(.caption2).foregroundStyle(AppColors.textTertiary)
                            }
                        }
                    }
                }
                .listStyle(.plain)
            }
        }
        .navigationTitle(appLanguage == "fr" ? "Organisations" : "Organizations")
        .searchable(text: $searchText)
        .onSubmit(of: .search) { Task { await reload() } }
        .task { await reload() }
    }

    private func reload() async {
        isLoading = true
        do {
            let response = try await OHWRService.shared.getOrganizations(search: searchText.isEmpty ? nil : searchText)
            items = response.data ?? []
        } catch {}
        isLoading = false
    }
}

// MARK: - Materials List

struct OHWRMaterialsListView: View {

    @State private var items: [OHWRMaterial] = []
    @State private var isLoading = true
    @State private var searchText = ""
    @AppStorage("appLanguage") private var appLanguage = "fr"

    var body: some View {
        Group {
            if isLoading && items.isEmpty {
                ProgressView().controlSize(.large).frame(maxWidth: .infinity, minHeight: 300)
            } else if items.isEmpty {
                ContentUnavailableView(appLanguage == "fr" ? "Aucun équipement" : "No equipment", systemImage: "wrench.and.screwdriver")
            } else {
                List(items) { mat in
                    HStack(spacing: 12) {
                        ZStack {
                            Circle().fill(Color(hex: 0xFF9800).opacity(0.12)).frame(width: 44, height: 44)
                            Image(systemName: "wrench.and.screwdriver.fill").foregroundStyle(Color(hex: 0xFF9800))
                        }
                        VStack(alignment: .leading, spacing: 3) {
                            Text(mat.name).font(.subheadline).fontWeight(.medium)
                            HStack(spacing: 8) {
                                if let type = mat.type {
                                    Text(type).font(.caption2).foregroundStyle(Color(hex: 0xFF9800))
                                }
                                if let status = mat.status {
                                    Text(status).font(.caption2).foregroundStyle(AppColors.success)
                                }
                            }
                            if let region = mat.region {
                                Label(region, systemImage: "mappin").font(.caption2).foregroundStyle(AppColors.textTertiary)
                            }
                        }
                    }
                }
                .listStyle(.plain)
            }
        }
        .navigationTitle(appLanguage == "fr" ? "Équipements" : "Equipment")
        .searchable(text: $searchText)
        .onSubmit(of: .search) { Task { await reload() } }
        .task { await reload() }
    }

    private func reload() async {
        isLoading = true
        do {
            let response = try await OHWRService.shared.getMaterials(search: searchText.isEmpty ? nil : searchText)
            items = response.data ?? []
        } catch {}
        isLoading = false
    }
}

// MARK: - Documents List

struct OHWRDocumentsListView: View {

    @State private var items: [OHWRDocument] = []
    @State private var isLoading = true
    @State private var searchText = ""
    @AppStorage("appLanguage") private var appLanguage = "fr"

    var body: some View {
        Group {
            if isLoading && items.isEmpty {
                ProgressView().controlSize(.large).frame(maxWidth: .infinity, minHeight: 300)
            } else if items.isEmpty {
                ContentUnavailableView(appLanguage == "fr" ? "Aucun document" : "No documents", systemImage: "doc.text")
            } else {
                List(items) { doc in
                    HStack(spacing: 12) {
                        ZStack {
                            Circle().fill(Color(hex: 0x9B59B6).opacity(0.12)).frame(width: 44, height: 44)
                            Image(systemName: "doc.text.fill").foregroundStyle(Color(hex: 0x9B59B6))
                        }
                        VStack(alignment: .leading, spacing: 3) {
                            Text(doc.title).font(.subheadline).fontWeight(.medium).lineLimit(2)
                            HStack(spacing: 8) {
                                if let type = doc.type {
                                    Text(type).font(.caption2).foregroundStyle(Color(hex: 0x9B59B6))
                                }
                                if let org = doc.organizationAcronym {
                                    Text(org).font(.caption2).foregroundStyle(AppColors.textSecondary)
                                }
                            }
                            if let date = doc.publicationDate {
                                Text(String(date.prefix(10))).font(.caption2).foregroundStyle(AppColors.textTertiary)
                            }
                        }
                    }
                }
                .listStyle(.plain)
            }
        }
        .navigationTitle("Documents")
        .searchable(text: $searchText)
        .onSubmit(of: .search) { Task { await reload() } }
        .task { await reload() }
    }

    private func reload() async {
        isLoading = true
        do {
            let response = try await OHWRService.shared.getDocuments(search: searchText.isEmpty ? nil : searchText)
            items = response.data ?? []
        } catch {}
        isLoading = false
    }
}
