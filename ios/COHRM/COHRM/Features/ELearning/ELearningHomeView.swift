// ELearningHomeView.swift
// One Health Cameroon - Accueil du module E-Learning

import SwiftUI

/// Accueil du module E-Learning avec stats, catégories et cours en vedette
struct ELearningHomeView: View {

    @State private var viewModel = ELearningHomeViewModel()

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
                colors: [Color(hex: 0x7C3AED), Color(hex: 0x9B59B6), Color(hex: 0xA855F7)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .frame(height: 200)
            .clipShape(UnevenRoundedRectangle(bottomLeadingRadius: 28, bottomTrailingRadius: 28))

            VStack(alignment: .leading, spacing: 8) {
                Text(String(localized: "elearning.title"))
                    .font(.title2).fontWeight(.bold)
                    .foregroundStyle(.white)

                Text(String(localized: "elearning.subtitle"))
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.8))

                // Stats pills
                if let stats = viewModel.userStats {
                    HStack(spacing: 12) {
                        statPill(value: "\(stats.enrolledCourses ?? 0)", label: String(localized: "elearning.enrolled"))
                        statPill(value: "\(stats.completedCourses ?? 0)", label: String(localized: "elearning.completed"))
                        statPill(value: "\(stats.certificates ?? 0)", label: String(localized: "elearning.certificates"))
                    }
                    .padding(.top, 4)
                }
            }
            .padding(20)
        }
    }

    private func statPill(value: String, label: String) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.headline).fontWeight(.bold)
                .foregroundStyle(.white)
            Text(label)
                .font(.caption2)
                .foregroundStyle(.white.opacity(0.7))
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(.white.opacity(0.15))
        .clipShape(Capsule())
    }

    // MARK: - Content

    private var contentSection: some View {
        VStack(spacing: 24) {
            // Categories
            if !viewModel.categories.isEmpty {
                categoriesSection
            }

            // Featured courses
            if !viewModel.featuredCourses.isEmpty {
                sectionHeader(title: String(localized: "elearning.featured"), destination: ELearningCourseListView())
                ScrollView(.horizontal, showsIndicators: false) {
                    LazyHStack(spacing: 14) {
                        ForEach(viewModel.featuredCourses) { course in
                            NavigationLink(destination: ELearningCourseDetailView(slug: course.slug)) {
                                CourseCardView(course: course)
                                    .frame(width: 280)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, 16)
                }
            }

            // Continue learning
            if !viewModel.inProgressEnrollments.isEmpty {
                continueSection
            }

            // Quick actions
            quickActionsSection
        }
        .padding(.top, 20)
        .padding(.bottom, 32)
    }

    // MARK: - Categories

    private var categoriesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(String(localized: "elearning.categories"))
                .font(.headline).fontWeight(.semibold)
                .padding(.horizontal, 16)

            ScrollView(.horizontal, showsIndicators: false) {
                LazyHStack(spacing: 10) {
                    ForEach(viewModel.categories) { cat in
                        NavigationLink(destination: ELearningCourseListView(initialCategory: cat.slug)) {
                            VStack(spacing: 6) {
                                Circle()
                                    .fill(Color(hex: UInt(cat.color?.dropFirst().flatMap { UInt($0, radix: 16) } ?? 0x9B59B6)))
                                    .frame(width: 48, height: 48)
                                    .overlay {
                                        Image(systemName: categoryIcon(cat.icon))
                                            .foregroundStyle(.white)
                                            .font(.title3)
                                    }

                                Text(cat.localizedName)
                                    .font(.caption2)
                                    .foregroundStyle(AppColors.textPrimary)
                                    .lineLimit(2)
                                    .multilineTextAlignment(.center)
                                    .frame(width: 70)
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 16)
            }
        }
    }

    // MARK: - Continue Learning

    private var continueSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(String(localized: "elearning.continue"))
                .font(.headline).fontWeight(.semibold)
                .padding(.horizontal, 16)

            ForEach(viewModel.inProgressEnrollments.prefix(3)) { enrollment in
                NavigationLink(destination: ELearningCourseDetailView(slug: enrollment.slug ?? "")) {
                    HStack(spacing: 12) {
                        // Thumbnail
                        AsyncImage(url: serverImageURL(enrollment.thumbnail)) { image in
                            image.resizable().scaledToFill()
                        } placeholder: {
                            RoundedRectangle(cornerRadius: 8).fill(Color(hex: 0x9B59B6).opacity(0.2))
                        }
                        .frame(width: 60, height: 44)
                        .clipShape(RoundedRectangle(cornerRadius: 8))

                        VStack(alignment: .leading, spacing: 4) {
                            Text(enrollment.localizedTitle)
                                .font(.subheadline).fontWeight(.medium)
                                .foregroundStyle(AppColors.textPrimary)
                                .lineLimit(1)

                            ProgressView(value: Double(enrollment.progressPercent ?? 0) / 100.0)
                                .tint(Color(hex: 0x9B59B6))

                            Text("\(enrollment.progressPercent ?? 0)%")
                                .font(.caption2)
                                .foregroundStyle(AppColors.textSecondary)
                        }

                        Image(systemName: "play.circle.fill")
                            .font(.title2)
                            .foregroundStyle(Color(hex: 0x9B59B6))
                    }
                    .padding(12)
                    .background(AppColors.cardBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .buttonStyle(.plain)
                .padding(.horizontal, 16)
            }
        }
    }

    // MARK: - Quick Actions

    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(String(localized: "elearning.explore"))
                .font(.headline).fontWeight(.semibold)
                .padding(.horizontal, 16)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                NavigationLink(destination: ELearningCourseListView()) {
                    quickActionCard(icon: "book.fill", title: String(localized: "elearning.all_courses"), color: Color(hex: 0x2196F3))
                }
                NavigationLink(destination: ELearningMyLearningView()) {
                    quickActionCard(icon: "graduationcap.fill", title: String(localized: "elearning.my_learning"), color: Color(hex: 0x4CAF50))
                }
                NavigationLink(destination: ELearningCertificatesView()) {
                    quickActionCard(icon: "rosette", title: String(localized: "elearning.my_certificates"), color: Color(hex: 0xFF9800))
                }
                NavigationLink(destination: ELearningPathsView()) {
                    quickActionCard(icon: "map.fill", title: String(localized: "elearning.paths"), color: Color(hex: 0x9C27B0))
                }
            }
            .padding(.horizontal, 16)
        }
    }

    private func quickActionCard(icon: String, title: String, color: Color) -> some View {
        VStack(spacing: 10) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)
            Text(title)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundStyle(AppColors.textPrimary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .background(color.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    // MARK: - Helpers

    private func sectionHeader(title: String, destination: some View) -> some View {
        HStack {
            Text(title).font(.headline).fontWeight(.semibold)
            Spacer()
            NavigationLink(destination: destination) {
                Text(String(localized: "elearning.see_all"))
                    .font(.caption).foregroundStyle(Color(hex: 0x9B59B6))
            }
        }
        .padding(.horizontal, 16)
    }

    private func categoryIcon(_ icon: String?) -> String {
        switch icon {
        case "heart": return "heart.fill"
        case "paw": return "pawprint.fill"
        case "leaf": return "leaf.fill"
        case "globe": return "globe"
        case "microscope": return "microscope"
        case "people": return "person.3.fill"
        case "bug": return "ant.fill"
        case "megaphone": return "megaphone.fill"
        default: return "book.fill"
        }
    }

}
