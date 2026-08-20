// ELearningQuizView.swift
// One Health Cameroon - Interface de quiz E-Learning

import SwiftUI
import Combine

/// Quiz-taking view for E-Learning module quizzes
struct ELearningQuizView: View {

    let quizId: Int
    let quizTitle: String
    let enrollmentId: Int?
    let passingScore: Int?
    let maxAttempts: Int?
    let timeLimitMinutes: Int?
    var onComplete: (() -> Void)?

    @Environment(\.dismiss) private var dismiss
    @AppStorage("appLanguage") private var appLanguage = "fr"

    // MARK: - State

    enum QuizPhase { case intro, taking, submitting, results }

    @State private var phase: QuizPhase = .intro
    @State private var quiz: ELQuiz?
    @State private var questions: [ELQuizQuestion] = []
    @State private var responses: [Int: AnyCodableValue] = [:]
    @State private var currentIndex = 0
    @State private var attemptId: Int?
    @State private var timeRemaining: Int = 0
    @State private var timerCancellable: AnyCancellable?
    @State private var previousAttempts: [ELQuizAttempt] = []
    @State private var submitResult: ELQuizSubmitResponse?
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showSubmitConfirm = false
    @State private var showHint = false
    @State private var shortAnswerText: String = ""
    @State private var fillBlankText: String = ""
    @State private var matchingSelections: [Int: Int] = [:]
    @State private var orderingItems: [ELQuizOption] = []
    @State private var scoreAnimation: Double = 0

    private var currentQuestion: ELQuizQuestion? {
        guard currentIndex >= 0 && currentIndex < questions.count else { return nil }
        return questions[currentIndex]
    }

    private var answeredCount: Int {
        responses.count
    }

    private var allAnswered: Bool {
        answeredCount == questions.count
    }

    private var hasTimeLimit: Bool {
        (timeLimitMinutes ?? quiz?.timeLimitMinutes ?? 0) > 0
    }

    private var attemptsUsed: Int {
        previousAttempts.count
    }

    private var maxAttemptsValue: Int? {
        maxAttempts ?? quiz?.maxAttempts
    }

    private var canRetake: Bool {
        guard let max = maxAttemptsValue else { return true }
        return max == 0 || attemptsUsed < max
    }

    // MARK: - Body

    var body: some View {
        VStack(spacing: 0) {
            switch phase {
            case .intro:
                introView
            case .taking:
                quizTakingView
            case .submitting:
                submittingView
            case .results:
                if let result = submitResult {
                    ELearningQuizResultsView(
                        result: result,
                        passingScore: passingScore ?? quiz?.passingScore ?? 50,
                        canRetake: canRetake,
                        onRetake: {
                            resetForRetake()
                        },
                        onDismiss: {
                            onComplete?()
                            dismiss()
                        }
                    )
                }
            }
        }
        .background(AppColors.background)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button {
                    if phase == .taking {
                        // Confirm leaving during quiz
                        showSubmitConfirm = true
                    } else {
                        dismiss()
                    }
                } label: {
                    Image(systemName: "xmark")
                        .foregroundStyle(AppColors.textPrimary)
                }
            }
            ToolbarItem(placement: .principal) {
                Text(quizTitle)
                    .font(.headline)
                    .lineLimit(1)
            }
        }
        .alert(
            appLanguage == "fr" ? "Soumettre le quiz ?" : "Submit quiz?",
            isPresented: $showSubmitConfirm
        ) {
            Button(appLanguage == "fr" ? "Annuler" : "Cancel", role: .cancel) {}
            Button(appLanguage == "fr" ? "Soumettre" : "Submit") {
                Task { await submitQuiz() }
            }
        } message: {
            let unanswered = questions.count - answeredCount
            if unanswered > 0 {
                Text(appLanguage == "fr"
                     ? "\(unanswered) question(s) sans réponse. Voulez-vous soumettre quand même ?"
                     : "\(unanswered) unanswered question(s). Submit anyway?")
            } else {
                Text(appLanguage == "fr"
                     ? "Êtes-vous sûr de vouloir soumettre vos réponses ?"
                     : "Are you sure you want to submit your answers?")
            }
        }
        .task { await loadHistory() }
    }

    // MARK: - Intro View

    private var introView: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Quiz icon
                ZStack {
                    Circle()
                        .fill(AppColors.moduleElearning.opacity(0.12))
                        .frame(width: 100, height: 100)
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 44))
                        .foregroundStyle(AppColors.moduleElearning)
                }
                .padding(.top, 32)

                // Title
                Text(quizTitle)
                    .font(.title2).fontWeight(.bold)
                    .foregroundStyle(AppColors.textPrimary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 20)

                // Info cards
                VStack(spacing: 12) {
                    if let minutes = timeLimitMinutes ?? quiz?.timeLimitMinutes, minutes > 0 {
                        infoRow(icon: "clock.fill", color: AppColors.warning,
                                label: appLanguage == "fr" ? "Durée limite" : "Time limit",
                                value: "\(minutes) min")
                    } else {
                        infoRow(icon: "clock.fill", color: AppColors.muted,
                                label: appLanguage == "fr" ? "Durée" : "Duration",
                                value: appLanguage == "fr" ? "Illimitée" : "Unlimited")
                    }

                    if let score = passingScore ?? quiz?.passingScore {
                        infoRow(icon: "target", color: AppColors.success,
                                label: appLanguage == "fr" ? "Score de passage" : "Passing score",
                                value: "\(score)%")
                    }

                    if let max = maxAttemptsValue, max > 0 {
                        infoRow(icon: "arrow.counterclockwise", color: AppColors.info,
                                label: appLanguage == "fr" ? "Tentatives" : "Attempts",
                                value: "\(attemptsUsed)/\(max)")
                    }
                }
                .padding(16)
                .background(AppColors.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .padding(.horizontal, 16)

                // Previous attempts
                if !previousAttempts.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text(appLanguage == "fr" ? "Tentatives précédentes" : "Previous attempts")
                            .font(.subheadline).fontWeight(.semibold)
                            .foregroundStyle(AppColors.textPrimary)

                        ForEach(previousAttempts) { attempt in
                            attemptRow(attempt)
                        }
                    }
                    .padding(16)
                    .background(AppColors.cardBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .padding(.horizontal, 16)
                }

                // Error
                if let error = errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(AppColors.danger)
                        .padding(.horizontal, 16)
                }

                // Start button
                Button {
                    Task { await startQuiz() }
                } label: {
                    HStack(spacing: 8) {
                        if isLoading {
                            ProgressView().tint(.white)
                        }
                        Image(systemName: "play.fill")
                        Text(attemptsUsed > 0
                             ? (appLanguage == "fr" ? "Reprendre le quiz" : "Retake quiz")
                             : (appLanguage == "fr" ? "Commencer le quiz" : "Start quiz"))
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(canRetake ? AppColors.moduleElearning : Color.gray.opacity(0.3))
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }
                .disabled(!canRetake || isLoading)
                .padding(.horizontal, 16)

                if !canRetake {
                    Text(appLanguage == "fr"
                         ? "Nombre maximum de tentatives atteint"
                         : "Maximum number of attempts reached")
                        .font(.caption)
                        .foregroundStyle(AppColors.danger)
                }
            }
            .padding(.bottom, 32)
        }
    }

    private func infoRow(icon: String, color: Color, label: String, value: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.body)
                .foregroundStyle(color)
                .frame(width: 24)
            Text(label)
                .font(.subheadline)
                .foregroundStyle(AppColors.textSecondary)
            Spacer()
            Text(value)
                .font(.subheadline).fontWeight(.semibold)
                .foregroundStyle(AppColors.textPrimary)
        }
    }

    private func attemptRow(_ attempt: ELQuizAttempt) -> some View {
        HStack(spacing: 12) {
            Image(systemName: attempt.passed == true ? "checkmark.circle.fill" : "xmark.circle.fill")
                .foregroundStyle(attempt.passed == true ? AppColors.success : AppColors.danger)

            VStack(alignment: .leading, spacing: 2) {
                Text(appLanguage == "fr"
                     ? "Tentative \(attempt.attemptNumber ?? 0)"
                     : "Attempt \(attempt.attemptNumber ?? 0)")
                    .font(.subheadline).fontWeight(.medium)
                    .foregroundStyle(AppColors.textPrimary)

                if let date = attempt.completedAt {
                    Text(date.prefix(10))
                        .font(.caption2)
                        .foregroundStyle(AppColors.textTertiary)
                }
            }

            Spacer()

            if let pct = attempt.scorePercent {
                Text("\(Int(pct))%")
                    .font(.headline).fontWeight(.bold)
                    .foregroundStyle(attempt.passed == true ? AppColors.success : AppColors.danger)
            }
        }
        .padding(12)
        .background(AppColors.secondaryBackground)
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }

    // MARK: - Quiz Taking View

    private var quizTakingView: some View {
        VStack(spacing: 0) {
            // Fixed header
            quizHeader

            // Question navigation dots
            questionNavigationDots

            // Content
            ScrollView {
                VStack(spacing: 20) {
                    if let question = currentQuestion {
                        questionContent(question)
                    }
                }
                .padding(16)
            }

            // Bottom navigation
            quizBottomBar
        }
    }

    private var quizHeader: some View {
        VStack(spacing: 8) {
            HStack {
                // Timer
                if hasTimeLimit {
                    HStack(spacing: 4) {
                        Image(systemName: "clock.fill")
                            .font(.caption)
                        Text(timerString)
                            .font(.system(.subheadline, design: .monospaced))
                            .fontWeight(.semibold)
                    }
                    .foregroundStyle(timeRemaining < 60 ? AppColors.danger : AppColors.textPrimary)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(
                        (timeRemaining < 60 ? AppColors.danger : AppColors.muted).opacity(0.12)
                    )
                    .clipShape(Capsule())
                }

                Spacer()

                // Question counter
                Text("\(currentIndex + 1)/\(questions.count)")
                    .font(.subheadline).fontWeight(.medium)
                    .foregroundStyle(AppColors.textSecondary)
            }

            // Progress bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 3)
                        .fill(Color.gray.opacity(0.15))
                        .frame(height: 6)
                    RoundedRectangle(cornerRadius: 3)
                        .fill(AppColors.moduleElearning)
                        .frame(width: geo.size.width * progressValue, height: 6)
                }
            }
            .frame(height: 6)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(AppColors.background)
    }

    private var questionNavigationDots: some View {
        ScrollViewReader { proxy in
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(0..<questions.count, id: \.self) { index in
                        Button {
                            withAnimation(.easeInOut(duration: 0.2)) {
                                syncCurrentResponse()
                                currentIndex = index
                                loadResponseForCurrent()
                            }
                        } label: {
                            Text("\(index + 1)")
                                .font(.caption2).fontWeight(.bold)
                                .frame(width: 32, height: 32)
                                .background(dotBackground(for: index))
                                .foregroundStyle(dotForeground(for: index))
                                .clipShape(Circle())
                                .overlay(
                                    Circle()
                                        .stroke(index == currentIndex ? AppColors.moduleElearning : .clear, lineWidth: 2)
                                )
                        }
                        .id(index)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
            }
            .onChange(of: currentIndex) { _, newIndex in
                withAnimation {
                    proxy.scrollTo(newIndex, anchor: .center)
                }
            }
        }
        .background(AppColors.background)
    }

    @ViewBuilder
    private func questionContent(_ question: ELQuizQuestion) -> some View {
        // Points badge
        if let pts = question.points, pts > 0 {
            HStack {
                Label("\(pts) \(pts == 1 ? "point" : "points")", systemImage: "star.fill")
                    .font(.caption2).fontWeight(.medium)
                    .foregroundStyle(AppColors.warning)
                Spacer()
            }
        }

        // Question text
        Text(question.localizedText)
            .font(.body).fontWeight(.medium)
            .foregroundStyle(AppColors.textPrimary)
            .frame(maxWidth: .infinity, alignment: .leading)

        // Question image
        if let imageUrl = question.imageUrl, let url = URL(string: imageUrl) {
            AsyncImage(url: url) { phase in
                switch phase {
                case .success(let img):
                    img.resizable().aspectRatio(contentMode: .fit)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                case .failure:
                    EmptyView()
                default:
                    ProgressView().frame(height: 120)
                }
            }
            .frame(maxHeight: 200)
        }

        // Answer area based on question type
        answerArea(for: question)

        // Hint toggle
        if let hint = (appLanguage == "fr" ? question.hintFr : question.hintEn) ?? question.hintFr {
            VStack(alignment: .leading, spacing: 6) {
                Button {
                    withAnimation { showHint.toggle() }
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "lightbulb.fill")
                        Text(appLanguage == "fr" ? "Indice" : "Hint")
                            .font(.caption).fontWeight(.medium)
                        Image(systemName: showHint ? "chevron.up" : "chevron.down")
                            .font(.caption2)
                    }
                    .foregroundStyle(AppColors.warning)
                }

                if showHint {
                    Text(hint)
                        .font(.caption)
                        .foregroundStyle(AppColors.textSecondary)
                        .padding(10)
                        .background(AppColors.warning.opacity(0.08))
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                        .transition(.opacity.combined(with: .move(edge: .top)))
                }
            }
        }
    }

    // MARK: - Answer Areas

    @ViewBuilder
    private func answerArea(for question: ELQuizQuestion) -> some View {
        let type = question.questionType ?? "mcq"
        switch type {
        case "mcq":
            mcqView(question)
        case "multiple_select":
            multipleSelectView(question)
        case "true_false":
            trueFalseView(question)
        case "short_answer":
            shortAnswerView(question)
        case "fill_blank":
            fillBlankView(question)
        case "matching":
            matchingView(question)
        case "ordering":
            orderingView(question)
        default:
            mcqView(question)
        }
    }

    // MCQ - Single choice with radio-style
    private func mcqView(_ question: ELQuizQuestion) -> some View {
        let options = question.options ?? []
        let letters = ["A", "B", "C", "D", "E", "F", "G", "H"]

        return VStack(spacing: 10) {
            ForEach(Array(options.enumerated()), id: \.element.id) { idx, option in
                let letter = idx < letters.count ? letters[idx] : "\(idx + 1)"
                let isSelected = isOptionSelected(optionId: option.id, for: question)

                Button {
                    hapticFeedback()
                    responses[question.id] = .int(option.id)
                } label: {
                    HStack(spacing: 12) {
                        Text(letter)
                            .font(.subheadline).fontWeight(.bold)
                            .frame(width: 36, height: 36)
                            .background(isSelected ? AppColors.moduleElearning : AppColors.secondaryBackground)
                            .foregroundStyle(isSelected ? .white : AppColors.textPrimary)
                            .clipShape(Circle())

                        Text(option.localizedText)
                            .font(.subheadline)
                            .foregroundStyle(AppColors.textPrimary)
                            .multilineTextAlignment(.leading)

                        Spacer()

                        if isSelected {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(AppColors.moduleElearning)
                        }
                    }
                    .padding(12)
                    .background(isSelected ? AppColors.moduleElearning.opacity(0.08) : AppColors.cardBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(isSelected ? AppColors.moduleElearning : .clear, lineWidth: 2)
                    )
                }
            }
        }
    }

    // Multiple Select - Checkbox style
    private func multipleSelectView(_ question: ELQuizQuestion) -> some View {
        let options = question.options ?? []
        let selectedIds = currentSelectedIds(for: question)

        return VStack(spacing: 10) {
            HStack {
                Image(systemName: "info.circle")
                    .font(.caption2)
                Text(appLanguage == "fr" ? "Plusieurs réponses possibles" : "Multiple answers allowed")
                    .font(.caption2)
            }
            .foregroundStyle(AppColors.textTertiary)
            .frame(maxWidth: .infinity, alignment: .leading)

            ForEach(options) { option in
                let isChecked = selectedIds.contains(option.id)

                Button {
                    hapticFeedback()
                    toggleMultiSelect(optionId: option.id, questionId: question.id)
                } label: {
                    HStack(spacing: 12) {
                        Image(systemName: isChecked ? "checkmark.square.fill" : "square")
                            .font(.title3)
                            .foregroundStyle(isChecked ? AppColors.moduleElearning : AppColors.muted)

                        Text(option.localizedText)
                            .font(.subheadline)
                            .foregroundStyle(AppColors.textPrimary)
                            .multilineTextAlignment(.leading)

                        Spacer()
                    }
                    .padding(12)
                    .background(isChecked ? AppColors.moduleElearning.opacity(0.08) : AppColors.cardBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(isChecked ? AppColors.moduleElearning : .clear, lineWidth: 2)
                    )
                }
            }
        }
    }

    // True/False
    private func trueFalseView(_ question: ELQuizQuestion) -> some View {
        let current = responses[question.id]
        let isTrue: Bool? = {
            if case .bool(let v) = current { return v }
            return nil
        }()

        return HStack(spacing: 16) {
            trueFalseButton(
                isTrue: true,
                isSelected: isTrue == true,
                questionId: question.id
            )
            trueFalseButton(
                isTrue: false,
                isSelected: isTrue == false,
                questionId: question.id
            )
        }
    }

    private func trueFalseButton(isTrue: Bool, isSelected: Bool, questionId: Int) -> some View {
        Button {
            hapticFeedback()
            responses[questionId] = .bool(isTrue)
        } label: {
            VStack(spacing: 10) {
                Image(systemName: isTrue ? "checkmark.circle.fill" : "xmark.circle.fill")
                    .font(.system(size: 36))
                    .foregroundStyle(isSelected
                        ? (isTrue ? AppColors.success : AppColors.danger)
                        : AppColors.muted)

                Text(isTrue
                     ? (appLanguage == "fr" ? "Vrai" : "True")
                     : (appLanguage == "fr" ? "Faux" : "False"))
                    .font(.headline).fontWeight(.semibold)
                    .foregroundStyle(isSelected ? AppColors.textPrimary : AppColors.textSecondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 24)
            .background(isSelected
                ? (isTrue ? AppColors.success : AppColors.danger).opacity(0.1)
                : AppColors.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(isSelected
                        ? (isTrue ? AppColors.success : AppColors.danger)
                        : .clear, lineWidth: 2)
            )
        }
    }

    // Short Answer
    private func shortAnswerView(_ question: ELQuizQuestion) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(appLanguage == "fr" ? "Votre réponse" : "Your answer")
                .font(.caption).fontWeight(.medium)
                .foregroundStyle(AppColors.textSecondary)

            TextField(
                appLanguage == "fr" ? "Tapez votre réponse ici..." : "Type your answer here...",
                text: $shortAnswerText,
                axis: .vertical
            )
            .lineLimit(3...6)
            .textFieldStyle(.plain)
            .padding(14)
            .background(AppColors.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(AppColors.muted.opacity(0.3), lineWidth: 1)
            )
            .onChange(of: shortAnswerText) { _, newValue in
                if !newValue.isEmpty {
                    responses[question.id] = .string(newValue)
                } else {
                    responses.removeValue(forKey: question.id)
                }
            }
        }
    }

    // Fill Blank
    private func fillBlankView(_ question: ELQuizQuestion) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(appLanguage == "fr" ? "Complétez le texte" : "Fill in the blank")
                .font(.caption).fontWeight(.medium)
                .foregroundStyle(AppColors.textSecondary)

            TextField(
                appLanguage == "fr" ? "Votre réponse..." : "Your answer...",
                text: $fillBlankText
            )
            .textFieldStyle(.plain)
            .padding(14)
            .background(AppColors.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(AppColors.muted.opacity(0.3), lineWidth: 1)
            )
            .onChange(of: fillBlankText) { _, newValue in
                if !newValue.isEmpty {
                    responses[question.id] = .string(newValue)
                } else {
                    responses.removeValue(forKey: question.id)
                }
            }
        }
    }

    // Matching
    private func matchingView(_ question: ELQuizQuestion) -> some View {
        let options = question.options ?? []
        // Assume first half are left items, second half are right items (match targets)
        let halfCount = options.count / 2
        let leftItems = Array(options.prefix(halfCount))
        let rightItems = Array(options.suffix(from: halfCount))

        return VStack(spacing: 12) {
            Text(appLanguage == "fr" ? "Associez chaque élément" : "Match each item")
                .font(.caption).fontWeight(.medium)
                .foregroundStyle(AppColors.textSecondary)
                .frame(maxWidth: .infinity, alignment: .leading)

            ForEach(leftItems) { leftOption in
                HStack(spacing: 10) {
                    Text(leftOption.localizedText)
                        .font(.subheadline)
                        .foregroundStyle(AppColors.textPrimary)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    Image(systemName: "arrow.right")
                        .font(.caption)
                        .foregroundStyle(AppColors.muted)

                    Picker("", selection: Binding(
                        get: { matchingSelections[leftOption.id] ?? -1 },
                        set: { newVal in
                            matchingSelections[leftOption.id] = newVal == -1 ? nil : newVal
                            updateMatchingResponse(questionId: question.id)
                        }
                    )) {
                        Text("--").tag(-1)
                        ForEach(rightItems) { rightOption in
                            Text(rightOption.localizedText).tag(rightOption.id)
                        }
                    }
                    .tint(AppColors.moduleElearning)
                }
                .padding(10)
                .background(AppColors.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
    }

    // Ordering
    private func orderingView(_ question: ELQuizQuestion) -> some View {
        VStack(spacing: 12) {
            Text(appLanguage == "fr" ? "Ordonnez les éléments" : "Order the items")
                .font(.caption).fontWeight(.medium)
                .foregroundStyle(AppColors.textSecondary)
                .frame(maxWidth: .infinity, alignment: .leading)

            ForEach(Array(orderingItems.enumerated()), id: \.element.id) { idx, item in
                HStack(spacing: 10) {
                    // Position number
                    Text("\(idx + 1)")
                        .font(.caption).fontWeight(.bold)
                        .frame(width: 28, height: 28)
                        .background(AppColors.moduleElearning.opacity(0.15))
                        .foregroundStyle(AppColors.moduleElearning)
                        .clipShape(Circle())

                    Text(item.localizedText)
                        .font(.subheadline)
                        .foregroundStyle(AppColors.textPrimary)

                    Spacer()

                    // Move buttons
                    VStack(spacing: 2) {
                        Button {
                            moveOrderingItem(at: idx, direction: -1, questionId: question.id)
                        } label: {
                            Image(systemName: "chevron.up")
                                .font(.caption2).fontWeight(.bold)
                                .frame(width: 28, height: 20)
                        }
                        .disabled(idx == 0)

                        Button {
                            moveOrderingItem(at: idx, direction: 1, questionId: question.id)
                        } label: {
                            Image(systemName: "chevron.down")
                                .font(.caption2).fontWeight(.bold)
                                .frame(width: 28, height: 20)
                        }
                        .disabled(idx == orderingItems.count - 1)
                    }
                    .foregroundStyle(AppColors.moduleElearning)
                }
                .padding(10)
                .background(AppColors.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
    }

    // MARK: - Bottom Bar

    private var quizBottomBar: some View {
        VStack(spacing: 0) {
            Divider()

            HStack(spacing: 12) {
                // Previous
                Button {
                    navigateQuestion(direction: -1)
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "chevron.left")
                        Text(appLanguage == "fr" ? "Précédent" : "Previous")
                            .font(.subheadline)
                    }
                    .foregroundStyle(currentIndex > 0 ? AppColors.moduleElearning : AppColors.muted)
                }
                .disabled(currentIndex == 0)

                Spacer()

                // Submit button (visible when all answered or on last question)
                if currentIndex == questions.count - 1 || allAnswered {
                    Button {
                        showSubmitConfirm = true
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "paperplane.fill")
                            Text(appLanguage == "fr" ? "Soumettre" : "Submit")
                                .font(.subheadline).fontWeight(.semibold)
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(AppColors.moduleElearning)
                        .foregroundStyle(.white)
                        .clipShape(Capsule())
                    }
                }

                Spacer()

                // Next
                Button {
                    navigateQuestion(direction: 1)
                } label: {
                    HStack(spacing: 4) {
                        Text(appLanguage == "fr" ? "Suivant" : "Next")
                            .font(.subheadline)
                        Image(systemName: "chevron.right")
                    }
                    .foregroundStyle(currentIndex < questions.count - 1 ? AppColors.moduleElearning : AppColors.muted)
                }
                .disabled(currentIndex >= questions.count - 1)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(AppColors.background)
        }
    }

    // MARK: - Submitting View

    private var submittingView: some View {
        VStack(spacing: 20) {
            ProgressView()
                .controlSize(.large)
            Text(appLanguage == "fr" ? "Envoi des réponses..." : "Submitting answers...")
                .font(.subheadline)
                .foregroundStyle(AppColors.textSecondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: - Helpers

    private var timerString: String {
        let m = timeRemaining / 60
        let s = timeRemaining % 60
        return String(format: "%02d:%02d", m, s)
    }

    private var progressValue: Double {
        guard !questions.isEmpty else { return 0 }
        return Double(answeredCount) / Double(questions.count)
    }

    private func dotBackground(for index: Int) -> Color {
        if index == currentIndex {
            return AppColors.moduleElearning.opacity(0.15)
        }
        if responses[questions[index].id] != nil {
            return AppColors.success.opacity(0.15)
        }
        return AppColors.secondaryBackground
    }

    private func dotForeground(for index: Int) -> Color {
        if index == currentIndex { return AppColors.moduleElearning }
        if responses[questions[index].id] != nil { return AppColors.success }
        return AppColors.textTertiary
    }

    private func isOptionSelected(optionId: Int, for question: ELQuizQuestion) -> Bool {
        guard let response = responses[question.id] else { return false }
        switch response {
        case .int(let v): return v == optionId
        default: return false
        }
    }

    private func currentSelectedIds(for question: ELQuizQuestion) -> Set<Int> {
        guard let response = responses[question.id] else { return [] }
        switch response {
        case .intArray(let arr): return Set(arr)
        default: return []
        }
    }

    private func toggleMultiSelect(optionId: Int, questionId: Int) {
        var ids = currentSelectedIds(for: questions.first(where: { $0.id == questionId })!)
        if ids.contains(optionId) {
            ids.remove(optionId)
        } else {
            ids.insert(optionId)
        }
        if ids.isEmpty {
            responses.removeValue(forKey: questionId)
        } else {
            responses[questionId] = .intArray(Array(ids))
        }
    }

    private func updateMatchingResponse(questionId: Int) {
        let pairs = matchingSelections.compactMap { key, val -> String? in
            guard val != -1 else { return nil }
            return "\(key):\(val)"
        }
        if pairs.isEmpty {
            responses.removeValue(forKey: questionId)
        } else {
            responses[questionId] = .stringArray(pairs)
        }
    }

    private func moveOrderingItem(at index: Int, direction: Int, questionId: Int) {
        let newIndex = index + direction
        guard newIndex >= 0 && newIndex < orderingItems.count else { return }
        hapticFeedback()
        withAnimation(.easeInOut(duration: 0.2)) {
            orderingItems.swapAt(index, newIndex)
        }
        responses[questionId] = .intArray(orderingItems.map(\.id))
    }

    private func syncCurrentResponse() {
        guard let question = currentQuestion else { return }
        let type = question.questionType ?? "mcq"
        switch type {
        case "short_answer":
            if !shortAnswerText.isEmpty {
                responses[question.id] = .string(shortAnswerText)
            }
        case "fill_blank":
            if !fillBlankText.isEmpty {
                responses[question.id] = .string(fillBlankText)
            }
        default:
            break
        }
    }

    private func loadResponseForCurrent() {
        guard let question = currentQuestion else { return }
        showHint = false
        let type = question.questionType ?? "mcq"

        switch type {
        case "short_answer":
            if case .string(let val) = responses[question.id] {
                shortAnswerText = val
            } else {
                shortAnswerText = ""
            }
        case "fill_blank":
            if case .string(let val) = responses[question.id] {
                fillBlankText = val
            } else {
                fillBlankText = ""
            }
        case "matching":
            matchingSelections = [:]
            if case .stringArray(let pairs) = responses[question.id] {
                for pair in pairs {
                    let parts = pair.split(separator: ":").compactMap { Int($0) }
                    if parts.count == 2 {
                        matchingSelections[parts[0]] = parts[1]
                    }
                }
            }
        case "ordering":
            if let opts = question.options {
                if case .intArray(let ids) = responses[question.id] {
                    // Restore saved ordering
                    orderingItems = ids.compactMap { id in opts.first(where: { $0.id == id }) }
                    // Add any missing items
                    let existing = Set(orderingItems.map(\.id))
                    orderingItems += opts.filter { !existing.contains($0.id) }
                } else {
                    orderingItems = opts
                    responses[question.id] = .intArray(opts.map(\.id))
                }
            }
        default:
            break
        }
    }

    private func navigateQuestion(direction: Int) {
        let newIndex = currentIndex + direction
        guard newIndex >= 0 && newIndex < questions.count else { return }
        syncCurrentResponse()
        withAnimation(.easeInOut(duration: 0.2)) {
            currentIndex = newIndex
        }
        loadResponseForCurrent()
    }

    private func hapticFeedback() {
        let generator = UIImpactFeedbackGenerator(style: .light)
        generator.impactOccurred()
    }

    // MARK: - Timer

    private func startTimer() {
        guard hasTimeLimit else { return }
        let minutes = timeLimitMinutes ?? quiz?.timeLimitMinutes ?? 0
        timeRemaining = minutes * 60

        timerCancellable = Timer.publish(every: 1, on: .main, in: .common)
            .autoconnect()
            .sink { _ in
                if timeRemaining > 0 {
                    timeRemaining -= 1
                    if timeRemaining == 59 {
                        // Haptic when entering danger zone
                        let gen = UINotificationFeedbackGenerator()
                        gen.notificationOccurred(.warning)
                    }
                } else {
                    // Auto-submit
                    timerCancellable?.cancel()
                    Task { await submitQuiz() }
                }
            }
    }

    private func stopTimer() {
        timerCancellable?.cancel()
        timerCancellable = nil
    }

    // MARK: - Network

    private func loadHistory() async {
        do {
            let response = try await ELearningService.shared.getQuizHistory(quizId: quizId)
            previousAttempts = response.data ?? []
        } catch {
            // Non-critical, just show empty history
        }
    }

    private func startQuiz() async {
        isLoading = true
        errorMessage = nil

        do {
            let response = try await ELearningService.shared.startQuiz(
                quizId: quizId,
                enrollmentId: enrollmentId
            )
            if let data = response.data {
                quiz = data.quiz
                questions = data.questions ?? []
                attemptId = data.attempt?.id
                responses = [:]
                currentIndex = 0
                shortAnswerText = ""
                fillBlankText = ""
                matchingSelections = [:]

                // Init ordering for first question if needed
                loadResponseForCurrent()

                phase = .taking
                startTimer()
            } else {
                errorMessage = response.message ?? (appLanguage == "fr" ? "Erreur de chargement" : "Loading error")
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    private func submitQuiz() async {
        syncCurrentResponse()
        stopTimer()
        phase = .submitting

        guard let aId = attemptId else {
            errorMessage = appLanguage == "fr" ? "Tentative introuvable" : "Attempt not found"
            phase = .taking
            return
        }

        // Build response array
        var responsesArray: [[String: Any]] = []
        for (questionId, answer) in responses {
            var entry: [String: Any] = ["question_id": questionId]
            switch answer {
            case .int(let v): entry["answer"] = v
            case .intArray(let v): entry["answer"] = v
            case .bool(let v): entry["answer"] = v
            case .string(let v): entry["answer"] = v
            case .stringArray(let v): entry["answer"] = v
            }
            responsesArray.append(entry)
        }

        do {
            let response = try await ELearningService.shared.submitQuiz(
                attemptId: aId,
                responses: responsesArray
            )
            submitResult = response.data

            // Reload history for retake logic
            await loadHistory()

            phase = .results
        } catch {
            errorMessage = error.localizedDescription
            phase = .taking
            startTimer() // Resume timer if submission failed
        }
    }

    private func resetForRetake() {
        stopTimer()
        phase = .intro
        quiz = nil
        questions = []
        responses = [:]
        currentIndex = 0
        attemptId = nil
        submitResult = nil
        errorMessage = nil
        shortAnswerText = ""
        fillBlankText = ""
        matchingSelections = [:]
        orderingItems = []
        showHint = false
    }
}
