// ELearningLessonView.swift
// One Health Cameroon - Vue de lecon E-Learning

import SwiftUI

/// Full-screen lesson viewer that renders content based on type
struct ELearningLessonView: View {

    let lessonId: Int
    let courseSlug: String

    @State private var lesson: ELLesson?
    @State private var isLoading = true
    @State private var isCompleting = false
    @State private var showCompleted = false
    @State private var errorMessage: String?
    @State private var startTime = Date()
    @State private var timeTracker: Timer?
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ZStack {
            AppColors.background.ignoresSafeArea()

            if isLoading {
                ProgressView()
                    .controlSize(.large)
                    .frame(maxWidth: .infinity, minHeight: 400)
            } else if let lesson {
                VStack(spacing: 0) {
                    // Header bar
                    lessonHeader(lesson)

                    // Progress bar
                    if let progress = lesson.progressPercent, progress > 0 {
                        ProgressView(value: Double(progress) / 100.0)
                            .tint(Color(hex: 0x9B59B6))
                            .background(Color.gray.opacity(0.2))
                    }

                    // Main content
                    contentView(lesson)

                    // Bottom bar
                    bottomBar(lesson)
                }
            } else {
                ContentUnavailableView(
                    String(localized: "elearning.lesson_not_found"),
                    systemImage: "doc.questionmark",
                    description: Text(errorMessage ?? "")
                )
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button {
                    stopTimeTracking()
                    dismiss()
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "chevron.left")
                        Text(String(localized: "elearning.back"))
                    }
                    .foregroundStyle(AppColors.textPrimary)
                }
            }
        }
        .task { await loadLesson() }
        .onAppear { startTimeTracking() }
        .onDisappear { stopTimeTracking() }
        .overlay {
            if showCompleted {
                completionOverlay
            }
        }
    }

    // MARK: - Header

    private func lessonHeader(_ lesson: ELLesson) -> some View {
        VStack(spacing: 6) {
            Text(lesson.localizedTitle)
                .font(.headline).fontWeight(.semibold)
                .foregroundStyle(AppColors.textPrimary)
                .lineLimit(2)
                .multilineTextAlignment(.center)

            HStack(spacing: 12) {
                if let type = lesson.contentType {
                    Label(contentTypeLabel(type), systemImage: contentTypeIcon(type))
                        .font(.caption2)
                        .foregroundStyle(AppColors.textSecondary)
                }

                if let mins = lesson.durationMinutes, mins > 0 {
                    Label("\(mins) min", systemImage: "clock")
                        .font(.caption2)
                        .foregroundStyle(AppColors.textSecondary)
                }

                if lesson.isCompleted == true {
                    Label(String(localized: "elearning.completed"), systemImage: "checkmark.circle.fill")
                        .font(.caption2)
                        .foregroundStyle(AppColors.success)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(AppColors.cardBackground)
    }

    // MARK: - Content

    @ViewBuilder
    private func contentView(_ lesson: ELLesson) -> some View {
        switch lesson.contentType {
        case "video":
            VideoContentView(lesson: lesson)
        case "pdf":
            PDFContentView(urlString: lesson.pdfUrl)
        case "powerpoint", "pptx":
            DocumentWebView(url: documentViewerURL(for: lesson.pptxUrl))
        case "word", "docx":
            DocumentWebView(url: documentViewerURL(for: lesson.docxUrl))
        case "excel", "xlsx":
            DocumentWebView(url: documentViewerURL(for: lesson.xlsxUrl))
        case "text", "mixed":
            HTMLContentView(html: lesson.localizedContent ?? "")
        case "interactive":
            InteractiveContentView(json: lesson.localizedContent ?? "")
        default:
            // Fallback: show HTML content if available, otherwise unsupported
            if let content = lesson.localizedContent, !content.isEmpty {
                HTMLContentView(html: content)
            } else {
                ContentUnavailableView(
                    String(localized: "elearning.unsupported_content"),
                    systemImage: "exclamationmark.triangle",
                    description: Text(String(localized: "elearning.unsupported_content_desc"))
                )
            }
        }
    }

    // MARK: - Bottom Bar

    private func bottomBar(_ lesson: ELLesson) -> some View {
        VStack(spacing: 0) {
            Divider()

            HStack(spacing: 12) {
                // Previous lesson
                if let prev = lesson.prevLesson {
                    NavigationLink(destination: ELearningLessonView(lessonId: prev.id, courseSlug: courseSlug)) {
                        HStack(spacing: 4) {
                            Image(systemName: "chevron.left")
                            Text(String(localized: "elearning.previous"))
                        }
                        .font(.subheadline)
                        .foregroundStyle(Color(hex: 0x9B59B6))
                    }
                }

                Spacer()

                // Mark complete button
                if lesson.isCompleted != true {
                    Button {
                        Task { await markComplete() }
                    } label: {
                        HStack(spacing: 6) {
                            if isCompleting {
                                ProgressView().controlSize(.small).tint(.white)
                            }
                            Text(String(localized: "elearning.mark_complete"))
                                .fontWeight(.semibold)
                        }
                        .font(.subheadline)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color(hex: 0x9B59B6))
                        .foregroundStyle(.white)
                        .clipShape(Capsule())
                    }
                    .disabled(isCompleting)
                } else {
                    Label(String(localized: "elearning.completed"), systemImage: "checkmark.circle.fill")
                        .font(.subheadline)
                        .foregroundStyle(AppColors.success)
                }

                Spacer()

                // Next lesson
                if let next = lesson.nextLesson {
                    NavigationLink(destination: ELearningLessonView(lessonId: next.id, courseSlug: courseSlug)) {
                        HStack(spacing: 4) {
                            Text(String(localized: "elearning.next"))
                            Image(systemName: "chevron.right")
                        }
                        .font(.subheadline)
                        .foregroundStyle(Color(hex: 0x9B59B6))
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(AppColors.cardBackground)
        }
    }

    // MARK: - Completion Overlay

    private var completionOverlay: some View {
        ZStack {
            Color.black.opacity(0.5).ignoresSafeArea()

            VStack(spacing: 20) {
                Image(systemName: "checkmark.seal.fill")
                    .font(.system(size: 60))
                    .foregroundStyle(AppColors.success)

                Text(String(localized: "elearning.lesson_completed"))
                    .font(.title2).fontWeight(.bold)
                    .foregroundStyle(AppColors.textPrimary)

                Text(String(localized: "elearning.lesson_completed_desc"))
                    .font(.subheadline)
                    .foregroundStyle(AppColors.textSecondary)
                    .multilineTextAlignment(.center)

                HStack(spacing: 12) {
                    if let next = lesson?.nextLesson {
                        NavigationLink(destination: ELearningLessonView(lessonId: next.id, courseSlug: courseSlug)) {
                            Text(String(localized: "elearning.next_lesson"))
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .background(Color(hex: 0x9B59B6))
                                .foregroundStyle(.white)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                    }

                    Button {
                        showCompleted = false
                    } label: {
                        Text(String(localized: "elearning.close"))
                            .fontWeight(.semibold)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(AppColors.secondaryBackground)
                            .foregroundStyle(AppColors.textPrimary)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                }
            }
            .padding(24)
            .background(AppColors.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 20))
            .shadow(radius: 20)
            .padding(32)
        }
    }

    // MARK: - Helpers

    private func contentTypeIcon(_ type: String?) -> String {
        switch type {
        case "video": "play.rectangle.fill"
        case "pdf": "doc.fill"
        case "powerpoint", "pptx": "rectangle.stack.fill"
        case "word", "docx": "doc.richtext.fill"
        case "excel", "xlsx": "tablecells.fill"
        case "text": "doc.text.fill"
        case "mixed": "doc.text.fill"
        case "interactive": "hand.tap.fill"
        default: "doc.fill"
        }
    }

    private func contentTypeLabel(_ type: String) -> String {
        switch type {
        case "video": String(localized: "elearning.type.video")
        case "pdf": "PDF"
        case "powerpoint", "pptx": "PowerPoint"
        case "word", "docx": "Word"
        case "excel", "xlsx": "Excel"
        case "text": String(localized: "elearning.type.text")
        case "mixed": String(localized: "elearning.type.mixed")
        case "interactive": String(localized: "elearning.type.interactive")
        default: type
        }
    }

    private func documentViewerURL(for relativePath: String?) -> URL? {
        guard let fileURL = serverImageURL(relativePath) else { return nil }
        let encoded = fileURL.absoluteString.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        // Try Microsoft Office Online viewer first
        return URL(string: "https://view.officeapps.live.com/op/embed.aspx?src=\(encoded)")
    }

    // MARK: - Time Tracking

    private func startTimeTracking() {
        startTime = Date()
        timeTracker = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { _ in
            Task { await updateProgress() }
        }
    }

    private func stopTimeTracking() {
        timeTracker?.invalidate()
        timeTracker = nil
        Task { await updateProgress() }
    }

    private func updateProgress() async {
        let elapsed = Int(Date().timeIntervalSince(startTime))
        guard elapsed > 0 else { return }
        _ = try? await ELearningService.shared.updateLessonProgress(
            lessonId: lessonId,
            timeSpent: elapsed
        )
    }

    // MARK: - Actions

    private func loadLesson() async {
        isLoading = true
        do {
            let response = try await ELearningService.shared.getLessonDetail(lessonId: lessonId)
            lesson = response.data
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    private func markComplete() async {
        isCompleting = true
        do {
            let response = try await ELearningService.shared.completeLesson(lessonId: lessonId)
            if response.data?.lessonCompleted == true || response.success {
                lesson?.isCompleted = true
                showCompleted = true
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        isCompleting = false
    }
}
