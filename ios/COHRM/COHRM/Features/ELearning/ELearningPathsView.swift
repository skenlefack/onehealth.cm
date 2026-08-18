// ELearningPathsView.swift
// One Health Cameroon - Parcours diplômants

import SwiftUI

/// Liste des parcours d'apprentissage (learning paths)
struct ELearningPathsView: View {

    @State private var paths: [ELLearningPath] = []
    @State private var isLoading = true
    @State private var searchText = ""

    var body: some View {
        Group {
            if isLoading {
                LoadingView()
            } else if paths.isEmpty {
                ContentUnavailableView(
                    String(localized: "elearning.no_paths"),
                    systemImage: "map",
                    description: Text(String(localized: "elearning.no_paths.desc"))
                )
            } else {
                ScrollView {
                    LazyVStack(spacing: 14) {
                        ForEach(paths) { path in
                            NavigationLink(destination: ELearningPathDetailView(slug: path.slug)) {
                                pathCard(path)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(16)
                }
            }
        }
        .background(AppColors.background)
        .navigationTitle(String(localized: "elearning.paths"))
        .searchable(text: $searchText, prompt: String(localized: "elearning.search"))
        .onSubmit(of: .search) { Task { await loadPaths() } }
        .task { await loadPaths() }
    }

    private func pathCard(_ path: ELLearningPath) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                // Icon
                ZStack {
                    Circle().fill(Color(hex: 0x9C27B0).opacity(0.12))
                        .frame(width: 48, height: 48)
                    Image(systemName: "map.fill")
                        .foregroundStyle(Color(hex: 0x9C27B0))
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(path.localizedTitle)
                        .font(.subheadline).fontWeight(.semibold)
                        .foregroundStyle(AppColors.textPrimary)
                        .lineLimit(2)

                    if let instructor = path.instructorName {
                        Text(instructor)
                            .font(.caption2).foregroundStyle(AppColors.textSecondary)
                    }
                }

                Spacer()

                if path.certificateEnabled == true {
                    Image(systemName: "rosette")
                        .foregroundStyle(Color(hex: 0xFFD700))
                }
            }

            HStack(spacing: 16) {
                Label("\(path.courseCount ?? 0) " + String(localized: "elearning.courses_count"), systemImage: "book")
                if let hours = path.durationHours {
                    Label("\(Int(hours))h", systemImage: "clock")
                }
                if let enrolled = path.enrolledCount, enrolled > 0 {
                    Label("\(enrolled)", systemImage: "person.2")
                }
            }
            .font(.caption2)
            .foregroundStyle(AppColors.textTertiary)
        }
        .padding(16)
        .background(AppColors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private func loadPaths() async {
        isLoading = true
        do {
            let response = try await ELearningService.shared.getPaths(search: searchText.isEmpty ? nil : searchText)
            paths = response.data ?? []
        } catch { print("[OneHealth] Error: \(error.localizedDescription)") }
        isLoading = false
    }
}

/// Détail d'un parcours
struct ELearningPathDetailView: View {

    let slug: String

    @State private var path: ELLearningPath?
    @State private var isLoading = true

    var body: some View {
        ScrollView {
            if isLoading {
                LoadingView()
            } else if let path {
                VStack(spacing: 20) {
                    // Header
                    VStack(alignment: .leading, spacing: 8) {
                        Text(path.localizedTitle)
                            .font(.title3).fontWeight(.bold)
                            .foregroundStyle(AppColors.textPrimary)

                        if let desc = path.descriptionFr {
                            Text(desc.replacingOccurrences(of: "<[^>]+>", with: "", options: .regularExpression))
                                .font(.subheadline).foregroundStyle(AppColors.textSecondary)
                        }

                        HStack(spacing: 16) {
                            Label("\(path.courseCount ?? 0) " + String(localized: "elearning.courses_count"), systemImage: "book")
                            if let hours = path.durationHours {
                                Label("\(Int(hours))h", systemImage: "clock")
                            }
                        }
                        .font(.caption).foregroundStyle(AppColors.textTertiary)
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(AppColors.cardBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 14))

                    // Courses
                    if let courses = path.courses, !courses.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text(String(localized: "elearning.path_courses"))
                                .font(.headline).fontWeight(.semibold)
                                .foregroundStyle(AppColors.textPrimary)

                            ForEach(Array(courses.enumerated()), id: \.element.id) { index, course in
                                NavigationLink(destination: ELearningCourseDetailView(slug: course.slug)) {
                                    HStack(spacing: 12) {
                                        Text("\(index + 1)")
                                            .font(.caption).fontWeight(.bold)
                                            .frame(width: 28, height: 28)
                                            .background(Color(hex: 0x9C27B0).opacity(0.15))
                                            .foregroundStyle(Color(hex: 0x9C27B0))
                                            .clipShape(Circle())

                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(course.localizedTitle)
                                                .font(.subheadline).fontWeight(.medium)
                                                .foregroundStyle(AppColors.textPrimary)
                                                .lineLimit(1)
                                            Text("\(course.moduleCount ?? 0) modules • \(Int(course.durationHours ?? 0))h")
                                                .font(.caption2).foregroundStyle(AppColors.textSecondary)
                                        }

                                        Spacer()
                                        Image(systemName: "chevron.right")
                                            .font(.caption).foregroundStyle(AppColors.textTertiary)
                                    }
                                    .padding(12)
                                    .background(AppColors.cardBackground)
                                    .clipShape(RoundedRectangle(cornerRadius: 10))
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }
                .padding(16)
            }
        }
        .background(AppColors.background)
        .navigationBarTitleDisplayMode(.inline)
        .task { await loadPath() }
    }

    private func loadPath() async {
        isLoading = true
        do {
            let response = try await ELearningService.shared.getPathDetail(slug: slug)
            path = response.data
        } catch { print("[OneHealth] Error: \(error.localizedDescription)") }
        isLoading = false
    }
}
