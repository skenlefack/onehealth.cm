// ELearningCourseListView.swift
// One Health Cameroon - Liste des cours avec filtres

import SwiftUI

/// Catalogue des cours avec recherche et filtres
struct ELearningCourseListView: View {

    var initialCategory: String? = nil

    @State private var courses: [ELCourse] = []
    @State private var categories: [ELCategory] = []
    @State private var isLoading = false
    @State private var searchText = ""
    @State private var selectedLevel: String?
    @State private var selectedCategory: String?
    @State private var currentPage = 1
    @State private var hasMore = true

    var body: some View {
        VStack(spacing: 0) {
            // Filters
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    // Level chips
                    ForEach(["beginner", "intermediate", "advanced"], id: \.self) { level in
                        filterChip(
                            label: levelLabel(level),
                            isSelected: selectedLevel == level
                        ) {
                            selectedLevel = selectedLevel == level ? nil : level
                            Task { await reload() }
                        }
                    }

                    Divider().frame(height: 24)

                    // Category chips
                    ForEach(categories) { cat in
                        filterChip(
                            label: cat.localizedName,
                            isSelected: selectedCategory == cat.slug
                        ) {
                            selectedCategory = selectedCategory == cat.slug ? nil : cat.slug
                            Task { await reload() }
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
            }

            // Course grid
            if isLoading && courses.isEmpty {
                Spacer()
                ProgressView()
                    .controlSize(.large)
                Spacer()
            } else if courses.isEmpty {
                ContentUnavailableView(
                    String(localized: "elearning.no_courses"),
                    systemImage: "book.closed",
                    description: Text(String(localized: "elearning.no_courses.desc"))
                )
            } else {
                ScrollView {
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 14) {
                        ForEach(courses) { course in
                            NavigationLink(destination: ELearningCourseDetailView(slug: course.slug)) {
                                CourseCardView(course: course)
                            }
                            .buttonStyle(.plain)
                            .onAppear {
                                if course.id == courses.last?.id && hasMore {
                                    Task { await loadMore() }
                                }
                            }
                        }
                    }
                    .padding(16)

                    if isLoading {
                        ProgressView().padding()
                    }
                }
            }
        }
        .navigationTitle(String(localized: "elearning.courses"))
        .searchable(text: $searchText, prompt: String(localized: "elearning.search"))
        .onSubmit(of: .search) { Task { await reload() } }
        .onChange(of: searchText) { _, newValue in
            if newValue.isEmpty { Task { await reload() } }
        }
        .task {
            selectedCategory = initialCategory
            await loadCategories()
            await reload()
        }
    }

    // MARK: - Data

    private func reload() async {
        currentPage = 1
        hasMore = true
        isLoading = true
        do {
            let response = try await ELearningService.shared.getCourses(
                page: 1, limit: 12,
                category: selectedCategory,
                level: selectedLevel,
                search: searchText.isEmpty ? nil : searchText
            )
            courses = response.data ?? []
            hasMore = (response.pagination?.page ?? 1) < (response.pagination?.pages ?? 1)
        } catch {
            print("[E-Learning] Courses error: \(error)")
        }
        isLoading = false
    }

    private func loadMore() async {
        guard !isLoading else { return }
        currentPage += 1
        isLoading = true
        do {
            let response = try await ELearningService.shared.getCourses(
                page: currentPage, limit: 12,
                category: selectedCategory,
                level: selectedLevel,
                search: searchText.isEmpty ? nil : searchText
            )
            if let data = response.data { courses.append(contentsOf: data) }
            hasMore = (response.pagination?.page ?? 1) < (response.pagination?.pages ?? 1)
        } catch {
            currentPage -= 1
        }
        isLoading = false
    }

    private func loadCategories() async {
        do {
            let response = try await ELearningService.shared.getCategories()
            categories = response.data ?? []
        } catch {}
    }

    // MARK: - UI Helpers

    private func filterChip(label: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label)
                .font(.caption).fontWeight(.medium)
                .padding(.horizontal, 12).padding(.vertical, 6)
                .background(isSelected ? Color(hex: 0x9B59B6) : AppColors.secondaryBackground)
                .foregroundStyle(isSelected ? .white : AppColors.textPrimary)
                .clipShape(Capsule())
        }
    }

    private func levelLabel(_ level: String) -> String {
        switch level {
        case "beginner": String(localized: "elearning.level.beginner")
        case "intermediate": String(localized: "elearning.level.intermediate")
        case "advanced": String(localized: "elearning.level.advanced")
        default: level
        }
    }
}
