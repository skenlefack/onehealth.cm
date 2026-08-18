// ELearningMyLearningView.swift
// One Health Cameroon - Mon apprentissage

import SwiftUI

/// Dashboard personnel de l'apprenant
struct ELearningMyLearningView: View {

    @State private var enrollments: [ELEnrollment] = []
    @State private var stats: ELUserStats?
    @State private var isLoading = true
    @State private var selectedTab = 0

    private let tabs = ["all", "in_progress", "completed"]

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Stats cards
                if let stats {
                    statsSection(stats)
                }

                // Tab filter
                Picker("", selection: $selectedTab) {
                    Text(String(localized: "elearning.filter.all")).tag(0)
                    Text(String(localized: "elearning.filter.in_progress")).tag(1)
                    Text(String(localized: "elearning.filter.completed")).tag(2)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, 16)

                // Enrollments
                if isLoading {
                    ProgressView().padding(.top, 40)
                } else if filteredEnrollments.isEmpty {
                    ContentUnavailableView(
                        String(localized: "elearning.no_enrollments"),
                        systemImage: "book.closed",
                        description: Text(String(localized: "elearning.no_enrollments.desc"))
                    )
                    .padding(.top, 40)
                } else {
                    LazyVStack(spacing: 12) {
                        ForEach(filteredEnrollments) { enrollment in
                            NavigationLink(destination: ELearningCourseDetailView(slug: enrollment.slug ?? "")) {
                                enrollmentRow(enrollment)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, 16)
                }
            }
            .padding(.top, 16)
            .padding(.bottom, 32)
        }
        .background(AppColors.background)
        .navigationTitle(String(localized: "elearning.my_learning"))
        .refreshable { await loadData() }
        .task { await loadData() }
    }

    // MARK: - Stats

    private func statsSection(_ stats: ELUserStats) -> some View {
        HStack(spacing: 12) {
            statCard(value: "\(stats.enrolledCourses ?? 0)", label: String(localized: "elearning.enrolled"), color: Color(hex: 0x2196F3))
            statCard(value: "\(stats.inProgressCourses ?? 0)", label: String(localized: "elearning.in_progress"), color: Color(hex: 0xFF9800))
            statCard(value: "\(stats.completedCourses ?? 0)", label: String(localized: "elearning.completed"), color: Color(hex: 0x4CAF50))
            statCard(value: "\(stats.certificates ?? 0)", label: String(localized: "elearning.certificates"), color: Color(hex: 0x9B59B6))
        }
        .padding(.horizontal, 16)
    }

    private func statCard(value: String, label: String, color: Color) -> some View {
        VStack(spacing: 4) {
            Text(value).font(.title3).fontWeight(.bold).foregroundStyle(color)
            Text(label).font(.caption2).foregroundStyle(AppColors.textSecondary).lineLimit(1)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(color.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }

    // MARK: - Enrollment Row

    private func enrollmentRow(_ enrollment: ELEnrollment) -> some View {
        HStack(spacing: 12) {
            AsyncImage(url: serverImageURL(enrollment.thumbnail)) { image in
                image.resizable().scaledToFill()
            } placeholder: {
                RoundedRectangle(cornerRadius: 10).fill(Color(hex: 0x9B59B6).opacity(0.15))
            }
            .frame(width: 80, height: 60)
            .clipShape(RoundedRectangle(cornerRadius: 10))

            VStack(alignment: .leading, spacing: 6) {
                Text(enrollment.localizedTitle)
                    .font(.subheadline).fontWeight(.medium)
                    .foregroundStyle(AppColors.textPrimary)
                    .lineLimit(2)

                ProgressView(value: Double(enrollment.progressPercent ?? 0) / 100.0)
                    .tint(enrollment.status == "completed" ? AppColors.success : Color(hex: 0x9B59B6))

                HStack {
                    Text("\(enrollment.progressPercent ?? 0)%")
                        .font(.caption2).foregroundStyle(AppColors.textSecondary)
                    Spacer()
                    statusBadge(enrollment.status)
                }
            }
        }
        .padding(12)
        .background(AppColors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private func statusBadge(_ status: String?) -> some View {
        let (label, color): (String, Color) = switch status {
        case "completed": (String(localized: "elearning.status.completed"), AppColors.success)
        case "in_progress": (String(localized: "elearning.status.in_progress"), Color(hex: 0xFF9800))
        case "enrolled": (String(localized: "elearning.status.enrolled"), Color(hex: 0x2196F3))
        default: (status ?? "", AppColors.muted)
        }
        return Text(label)
            .font(.caption2).fontWeight(.medium)
            .padding(.horizontal, 8).padding(.vertical, 2)
            .background(color.opacity(0.15))
            .foregroundStyle(color)
            .clipShape(Capsule())
    }

    // MARK: - Helpers

    private var filteredEnrollments: [ELEnrollment] {
        switch selectedTab {
        case 1: enrollments.filter { $0.status == "in_progress" }
        case 2: enrollments.filter { $0.status == "completed" }
        default: enrollments
        }
    }

    private func loadData() async {
        isLoading = true
        async let e = loadEnrollments()
        async let s = loadStats()
        _ = await (e, s)
        isLoading = false
    }

    private func loadEnrollments() async {
        do {
            let response = try await ELearningService.shared.getMyEnrollments()
            enrollments = response.data ?? []
        } catch { print("[OneHealth] Error: \(error.localizedDescription)") }
    }

    private func loadStats() async {
        do {
            let response = try await ELearningService.shared.getUserStats()
            stats = response.data
        } catch { print("[OneHealth] Error: \(error.localizedDescription)") }
    }

}
