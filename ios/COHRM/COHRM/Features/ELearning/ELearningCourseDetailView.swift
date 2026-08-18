// ELearningCourseDetailView.swift
// One Health Cameroon - Détail d'un cours E-Learning

import SwiftUI

/// Vue détaillée d'un cours avec curriculum, inscription et progression
struct ELearningCourseDetailView: View {

    let slug: String

    @State private var course: ELCourse?
    @State private var curriculum: ELCurriculum?
    @State private var isLoading = true
    @State private var isEnrolling = false
    @State private var errorMessage: String?
    @State private var expandedModules: Set<Int> = []

    var body: some View {
        ScrollView {
            if isLoading {
                ProgressView()
                    .controlSize(.large)
                    .frame(maxWidth: .infinity, minHeight: 400)
            } else if let course {
                VStack(spacing: 0) {
                    heroSection(course)
                    detailContent(course)
                }
            } else {
                ContentUnavailableView(
                    String(localized: "elearning.course_not_found"),
                    systemImage: "book.closed"
                )
            }
        }
        .background(AppColors.background)
        .navigationBarTitleDisplayMode(.inline)
        .task { await loadCourse() }
    }

    // MARK: - Hero

    private func heroSection(_ course: ELCourse) -> some View {
        ZStack(alignment: .bottomLeading) {
            // Background image or gradient
            if let thumb = course.thumbnail {
                AsyncImage(url: imageURL(thumb)) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    LinearGradient(colors: [Color(hex: 0x7C3AED), Color(hex: 0x9B59B6)], startPoint: .topLeading, endPoint: .bottomTrailing)
                }
                .frame(height: 220)
                .clipped()
                .overlay(LinearGradient(colors: [.clear, .black.opacity(0.7)], startPoint: .top, endPoint: .bottom))
            } else {
                LinearGradient(colors: [Color(hex: 0x7C3AED), Color(hex: 0x9B59B6)], startPoint: .topLeading, endPoint: .bottomTrailing)
                    .frame(height: 220)
            }

            VStack(alignment: .leading, spacing: 8) {
                // Level + Category badges
                HStack(spacing: 8) {
                    Text(course.localizedLevel)
                        .font(.caption2).fontWeight(.bold)
                        .padding(.horizontal, 8).padding(.vertical, 3)
                        .background(.white.opacity(0.2))
                        .clipShape(Capsule())

                    if let cat = course.categoryNameFr {
                        Text(cat)
                            .font(.caption2)
                            .padding(.horizontal, 8).padding(.vertical, 3)
                            .background(.white.opacity(0.2))
                            .clipShape(Capsule())
                    }
                }

                Text(course.localizedTitle)
                    .font(.title3).fontWeight(.bold)
                    .lineLimit(3)

                if let instructor = course.instructorName {
                    Text(instructor)
                        .font(.caption)
                        .opacity(0.8)
                }
            }
            .foregroundStyle(.white)
            .padding(20)
        }
    }

    // MARK: - Detail Content

    private func detailContent(_ course: ELCourse) -> some View {
        VStack(spacing: 20) {
            // Stats bar
            statsBar(course)

            // Enrollment card
            enrollmentCard(course)

            // Description
            if let desc = course.localizedDescription {
                sectionCard(title: String(localized: "elearning.description")) {
                    Text(desc.replacingOccurrences(of: "<[^>]+>", with: "", options: .regularExpression))
                        .font(.subheadline)
                        .foregroundStyle(AppColors.textSecondary)
                }
            }

            // Learning objectives
            if let objectives = course.learningObjectives, !objectives.isEmpty {
                sectionCard(title: String(localized: "elearning.objectives")) {
                    ForEach(objectives, id: \.self) { obj in
                        HStack(alignment: .top, spacing: 8) {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(AppColors.success)
                                .font(.caption)
                                .padding(.top, 2)
                            Text(obj).font(.subheadline).foregroundStyle(AppColors.textPrimary)
                        }
                    }
                }
            }

            // Curriculum
            if let modules = curriculum?.modules, !modules.isEmpty {
                curriculumSection(modules)
            }
        }
        .padding(16)
        .padding(.bottom, 24)
    }

    // MARK: - Stats Bar

    private func statsBar(_ course: ELCourse) -> some View {
        HStack(spacing: 0) {
            statItem(value: "\(Int(course.durationHours ?? 0))h", label: String(localized: "elearning.duration"), icon: "clock")
            Divider().frame(height: 30)
            statItem(value: "\(course.moduleCount ?? 0)", label: String(localized: "elearning.modules"), icon: "folder")
            Divider().frame(height: 30)
            statItem(value: "\(course.lessonCount ?? 0)", label: String(localized: "elearning.lessons"), icon: "play.rectangle")
            Divider().frame(height: 30)
            statItem(value: "\(course.enrolledCount ?? 0)", label: String(localized: "elearning.students"), icon: "person.2")
        }
        .padding(.vertical, 12)
        .background(AppColors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private func statItem(value: String, label: String, icon: String) -> some View {
        VStack(spacing: 4) {
            Image(systemName: icon).font(.caption).foregroundStyle(Color(hex: 0x9B59B6))
            Text(value).font(.subheadline).fontWeight(.bold).foregroundStyle(AppColors.textPrimary)
            Text(label).font(.caption2).foregroundStyle(AppColors.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Enrollment Card

    private func enrollmentCard(_ course: ELCourse) -> some View {
        Group {
            if let enrollment = course.enrollment {
                // Already enrolled
                VStack(spacing: 12) {
                    ProgressView(value: Double(enrollment.progressPercent ?? 0) / 100.0)
                        .tint(Color(hex: 0x9B59B6))

                    HStack {
                        Text("\(enrollment.progressPercent ?? 0)% " + String(localized: "elearning.progress"))
                            .font(.caption).foregroundStyle(AppColors.textSecondary)
                        Spacer()
                        Text(enrollment.status ?? "")
                            .font(.caption).fontWeight(.medium)
                            .foregroundStyle(Color(hex: 0x9B59B6))
                    }

                    if enrollment.status != "completed" {
                        Button {
                            // Navigate to first incomplete lesson
                        } label: {
                            Text(String(localized: "elearning.continue_learning"))
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .background(Color(hex: 0x9B59B6))
                                .foregroundStyle(.white)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                    }
                }
                .padding(16)
                .background(AppColors.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: 14))
            } else {
                // Not enrolled — Enroll button
                Button {
                    Task { await enrollInCourse(course.id) }
                } label: {
                    HStack {
                        if isEnrolling {
                            ProgressView().tint(.white)
                        }
                        Text(course.isFree == true
                             ? String(localized: "elearning.enroll_free")
                             : String(localized: "elearning.enroll"))
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color(hex: 0x9B59B6))
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }
                .disabled(isEnrolling)
            }
        }
    }

    // MARK: - Curriculum

    private func curriculumSection(_ modules: [ELModule]) -> some View {
        sectionCard(title: String(localized: "elearning.curriculum")) {
            ForEach(Array(modules.enumerated()), id: \.element.id) { index, module in
                VStack(spacing: 0) {
                    // Module header
                    Button {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            if expandedModules.contains(module.id) {
                                expandedModules.remove(module.id)
                            } else {
                                expandedModules.insert(module.id)
                            }
                        }
                    } label: {
                        HStack(spacing: 10) {
                            Text("\(index + 1)")
                                .font(.caption).fontWeight(.bold)
                                .frame(width: 28, height: 28)
                                .background(Color(hex: 0x9B59B6).opacity(0.15))
                                .foregroundStyle(Color(hex: 0x9B59B6))
                                .clipShape(Circle())

                            VStack(alignment: .leading, spacing: 2) {
                                Text(module.localizedTitle)
                                    .font(.subheadline).fontWeight(.medium)
                                    .foregroundStyle(AppColors.textPrimary)

                                Text("\(module.lessonCount ?? module.lessons?.count ?? 0) " + String(localized: "elearning.lessons"))
                                    .font(.caption2)
                                    .foregroundStyle(AppColors.textSecondary)
                            }

                            Spacer()

                            Image(systemName: expandedModules.contains(module.id) ? "chevron.up" : "chevron.down")
                                .font(.caption)
                                .foregroundStyle(AppColors.textTertiary)
                        }
                        .padding(.vertical, 10)
                    }
                    .buttonStyle(.plain)

                    // Lessons
                    if expandedModules.contains(module.id), let lessons = module.lessons {
                        VStack(spacing: 0) {
                            ForEach(lessons) { lesson in
                                HStack(spacing: 10) {
                                    // Status icon
                                    Image(systemName: lessonIcon(lesson))
                                        .font(.caption)
                                        .foregroundStyle(lessonColor(lesson))
                                        .frame(width: 20)

                                    Text(lesson.localizedTitle)
                                        .font(.caption)
                                        .foregroundStyle(lesson.isLocked == true ? AppColors.textTertiary : AppColors.textPrimary)
                                        .lineLimit(1)

                                    Spacer()

                                    // Content type icon
                                    Image(systemName: contentTypeIcon(lesson.contentType))
                                        .font(.caption2)
                                        .foregroundStyle(AppColors.textTertiary)

                                    if let mins = lesson.durationMinutes, mins > 0 {
                                        Text("\(mins)min")
                                            .font(.caption2)
                                            .foregroundStyle(AppColors.textTertiary)
                                    }
                                }
                                .padding(.vertical, 6)
                                .padding(.leading, 38)
                            }
                        }
                    }

                    if index < modules.count - 1 {
                        Divider()
                    }
                }
            }
        }
    }

    // MARK: - Helpers

    private func sectionCard(title: String, @ViewBuilder content: () -> some View) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline).fontWeight(.semibold)
                .foregroundStyle(AppColors.textPrimary)

            content()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(AppColors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private func lessonIcon(_ lesson: ELLesson) -> String {
        if lesson.isLocked == true { return "lock.fill" }
        if lesson.isCompleted == true { return "checkmark.circle.fill" }
        if (lesson.progressPercent ?? 0) > 0 { return "circle.lefthalf.fill" }
        return "circle"
    }

    private func lessonColor(_ lesson: ELLesson) -> Color {
        if lesson.isLocked == true { return AppColors.muted }
        if lesson.isCompleted == true { return AppColors.success }
        if (lesson.progressPercent ?? 0) > 0 { return Color(hex: 0x9B59B6) }
        return AppColors.muted
    }

    private func contentTypeIcon(_ type: String?) -> String {
        switch type {
        case "video": "play.rectangle.fill"
        case "pdf": "doc.fill"
        case "powerpoint", "pptx": "rectangle.stack.fill"
        case "quiz": "questionmark.circle.fill"
        case "text": "doc.text.fill"
        default: "doc.fill"
        }
    }

    private func imageURL(_ path: String?) -> URL? {
        guard let path else { return nil }
        let base = UserDefaults.standard.string(forKey: "serverURL") ?? "https://onehealth.cm/api"
        return URL(string: base.replacingOccurrences(of: "/api", with: "") + path)
    }

    // MARK: - Actions

    private func loadCourse() async {
        isLoading = true
        do {
            let response = try await ELearningService.shared.getCourseDetail(slug: slug)
            course = response.data
            if let courseId = course?.id {
                let currResponse = try await ELearningService.shared.getCurriculum(courseId: courseId)
                curriculum = currResponse.data
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    private func enrollInCourse(_ courseId: Int) async {
        isEnrolling = true
        do {
            let response = try await ELearningService.shared.enroll(type: "course", id: courseId)
            if response.success {
                await loadCourse()
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        isEnrolling = false
    }
}
