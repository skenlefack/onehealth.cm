// DUSSCQuizView.swift
// One Health Cameroon - Interface de quiz DUSS-C

import SwiftUI

/// Interface de quiz DUSS-C avec progression, feedback et résultats
struct DUSSCQuizView: View {

    let personaCode: String?

    @Environment(\.dismiss) private var dismiss
    @AppStorage("appLanguage") private var appLanguage = "fr"

    @State private var quiz: DUSSCQuiz?
    @State private var sessionUUID: String = UUID().uuidString
    @State private var currentIndex = 0
    @State private var selectedAnswer: String?
    @State private var feedback: DUSSCAnswerFeedback?
    @State private var isLoading = true
    @State private var isSubmitting = false
    @State private var scores: DUSSCScores?
    @State private var correctCount = 0
    @State private var startTime = Date()
    @State private var questionStartTime = Date()
    @State private var errorMessage: String?

    private var questions: [DUSSCQuestion] { quiz?.questions ?? [] }
    private var currentQuestion: DUSSCQuestion? {
        guard currentIndex < questions.count else { return nil }
        return questions[currentIndex]
    }
    private var isComplete: Bool { scores != nil }
    private var progress: Double {
        guard !questions.isEmpty else { return 0 }
        return Double(currentIndex) / Double(questions.count)
    }

    var body: some View {
        VStack(spacing: 0) {
            if isLoading {
                loadingView
            } else if isComplete {
                resultView
            } else if let question = currentQuestion {
                questionView(question)
            } else {
                errorView
            }
        }
        .background(AppColors.background)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button {
                    dismiss()
                } label: {
                    Image(systemName: "xmark")
                        .foregroundStyle(AppColors.textPrimary)
                }
            }
            ToolbarItem(placement: .principal) {
                Text(appLanguage == "fr" ? "Défi Santé" : "Health Challenge")
                    .font(.headline)
            }
        }
        .task { await startQuiz() }
    }

    // MARK: - Loading

    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView().controlSize(.large)
            Text(appLanguage == "fr" ? "Chargement du quiz..." : "Loading quiz...")
                .foregroundStyle(AppColors.textSecondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: - Error

    private var errorView: some View {
        ContentUnavailableView(
            appLanguage == "fr" ? "Erreur de chargement" : "Loading error",
            systemImage: "exclamationmark.triangle",
            description: Text(errorMessage ?? "")
        )
    }

    // MARK: - Question

    private func questionView(_ question: DUSSCQuestion) -> some View {
        VStack(spacing: 0) {
            // Progress bar
            VStack(spacing: 6) {
                ProgressView(value: progress)
                    .tint(Color(hex: 0x27AE60))

                HStack {
                    Text(blocLabel(question.bloc))
                        .font(.caption2).fontWeight(.medium)
                        .foregroundStyle(blocColor(question.bloc))
                    Spacer()
                    Text("\(currentIndex + 1)/\(questions.count)")
                        .font(.caption2).foregroundStyle(AppColors.textSecondary)
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)

            ScrollView {
                VStack(spacing: 20) {
                    // Module badge
                    if let module = question.moduleName {
                        HStack(spacing: 6) {
                            Circle().fill(Color(hex: 0x27AE60)).frame(width: 8, height: 8)
                            Text(module)
                                .font(.caption2).foregroundStyle(AppColors.textSecondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }

                    // Question text
                    Text(question.enonce ?? "")
                        .font(.body).fontWeight(.medium)
                        .foregroundStyle(AppColors.textPrimary)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    // Options
                    VStack(spacing: 10) {
                        ForEach(question.options ?? [], id: \.letter) { option in
                            optionButton(option, question: question)
                        }
                    }

                    // Feedback
                    if let feedback {
                        feedbackCard(feedback)
                    }
                }
                .padding(16)
            }

            // Bottom action
            bottomButton
        }
    }

    private func optionButton(_ option: DUSSCOption, question: DUSSCQuestion) -> some View {
        Button {
            guard feedback == nil else { return }
            selectedAnswer = option.letter
        } label: {
            HStack(spacing: 12) {
                // Letter circle
                Text(option.letter)
                    .font(.subheadline).fontWeight(.bold)
                    .frame(width: 36, height: 36)
                    .background(optionCircleColor(option.letter))
                    .foregroundStyle(optionCircleForeground(option.letter))
                    .clipShape(Circle())

                Text(option.text)
                    .font(.subheadline)
                    .foregroundStyle(AppColors.textPrimary)
                    .multilineTextAlignment(.leading)

                Spacer()

                if let feedback {
                    if option.letter == feedback.correctAnswer {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(AppColors.success)
                    } else if option.letter == selectedAnswer && !(feedback.isCorrect ?? false) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(AppColors.danger)
                    }
                }
            }
            .padding(12)
            .background(optionBackground(option.letter))
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(optionBorder(option.letter), lineWidth: selectedAnswer == option.letter ? 2 : 0)
            )
        }
        .disabled(feedback != nil)
    }

    // MARK: - Feedback Card

    private func feedbackCard(_ fb: DUSSCAnswerFeedback) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Image(systemName: fb.isCorrect == true ? "checkmark.circle.fill" : "xmark.circle.fill")
                    .font(.title3)
                Text(fb.isCorrect == true
                     ? (appLanguage == "fr" ? "Bonne réponse !" : "Correct!")
                     : (appLanguage == "fr" ? "Mauvaise réponse" : "Incorrect"))
                    .font(.subheadline).fontWeight(.semibold)
            }
            .foregroundStyle(fb.isCorrect == true ? AppColors.success : AppColors.danger)

            if let explication = fb.explication {
                Text(explication)
                    .font(.caption)
                    .foregroundStyle(AppColors.textPrimary)
            }

            if let action = fb.action {
                HStack(alignment: .top, spacing: 6) {
                    Image(systemName: "lightbulb.fill")
                        .foregroundStyle(AppColors.warning)
                        .font(.caption)
                    Text(action)
                        .font(.caption)
                        .foregroundStyle(AppColors.textSecondary)
                }
            }

            if let ideeFausse = fb.ideeFausse, !(fb.isCorrect ?? false) {
                HStack(alignment: .top, spacing: 6) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundStyle(AppColors.danger)
                        .font(.caption)
                    Text(ideeFausse)
                        .font(.caption)
                        .foregroundStyle(AppColors.textSecondary)
                }
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            (fb.isCorrect == true ? AppColors.success : AppColors.danger).opacity(0.08)
        )
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Bottom Button

    private var bottomButton: some View {
        VStack {
            Divider()
            if feedback != nil {
                // Next question
                Button {
                    nextQuestion()
                } label: {
                    Text(currentIndex < questions.count - 1
                         ? (appLanguage == "fr" ? "Question suivante" : "Next question")
                         : (appLanguage == "fr" ? "Voir les résultats" : "See results"))
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color(hex: 0x27AE60))
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .padding(16)
            } else {
                // Submit answer
                Button {
                    Task { await submitAnswer() }
                } label: {
                    HStack {
                        if isSubmitting { ProgressView().tint(.white) }
                        Text(appLanguage == "fr" ? "Valider" : "Submit")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(selectedAnswer != nil ? Color(hex: 0x2F5D3A) : Color.gray.opacity(0.3))
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .disabled(selectedAnswer == nil || isSubmitting)
                .padding(16)
            }
        }
        .background(AppColors.background)
    }

    // MARK: - Result

    private var resultView: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Score circle
                ZStack {
                    Circle()
                        .stroke(Color.gray.opacity(0.15), lineWidth: 12)
                        .frame(width: 150, height: 150)
                    Circle()
                        .trim(from: 0, to: Double(scores?.pctTotal ?? 0) / 100.0)
                        .stroke(scoreColor, style: StrokeStyle(lineWidth: 12, lineCap: .round))
                        .frame(width: 150, height: 150)
                        .rotationEffect(.degrees(-90))

                    VStack(spacing: 2) {
                        Text("\(scores?.pctTotal ?? 0)%")
                            .font(.system(size: 36, weight: .bold))
                            .foregroundStyle(scoreColor)
                        Text("\(scores?.totalCorrect ?? 0)/\(scores?.totalQuestions ?? 0)")
                            .font(.caption).foregroundStyle(AppColors.textSecondary)
                    }
                }
                .padding(.top, 20)

                // Pre/Post comparison
                if let scorePre = scores?.pctPre, let scorePost = scores?.pctPost {
                    HStack(spacing: 20) {
                        VStack(spacing: 4) {
                            Text("PRE-TEST")
                                .font(.caption2).fontWeight(.bold).foregroundStyle(AppColors.textTertiary)
                            Text("\(scorePre)%")
                                .font(.title2).fontWeight(.bold).foregroundStyle(Color(hex: 0xFF9800))
                        }

                        Image(systemName: "arrow.right")
                            .foregroundStyle(AppColors.textTertiary)

                        VStack(spacing: 4) {
                            Text("POST-TEST")
                                .font(.caption2).fontWeight(.bold).foregroundStyle(AppColors.textTertiary)
                            Text("\(scorePost)%")
                                .font(.title2).fontWeight(.bold).foregroundStyle(Color(hex: 0x27AE60))
                        }

                        if let gain = scores?.gain, gain > 0 {
                            VStack(spacing: 4) {
                                Text("GAIN")
                                    .font(.caption2).fontWeight(.bold).foregroundStyle(AppColors.textTertiary)
                                Text("+\(gain)")
                                    .font(.title2).fontWeight(.bold).foregroundStyle(AppColors.success)
                            }
                        }
                    }
                    .padding(16)
                    .background(AppColors.cardBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }

                // Message
                Text(resultMessage)
                    .font(.subheadline)
                    .foregroundStyle(AppColors.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 20)

                // Actions
                VStack(spacing: 12) {
                    Button {
                        // Reset and restart
                        resetQuiz()
                        Task { await startQuiz() }
                    } label: {
                        HStack {
                            Image(systemName: "arrow.counterclockwise")
                            Text(appLanguage == "fr" ? "Refaire le défi" : "Retry challenge")
                                .fontWeight(.semibold)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color(hex: 0x27AE60))
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }

                    Button {
                        dismiss()
                    } label: {
                        Text(appLanguage == "fr" ? "Retour à l'accueil" : "Back to home")
                            .fontWeight(.medium)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(AppColors.secondaryBackground)
                            .foregroundStyle(AppColors.textPrimary)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                }
                .padding(.horizontal, 16)
            }
            .padding(.bottom, 32)
        }
    }

    // MARK: - Logic

    private func startQuiz() async {
        isLoading = true
        startTime = Date()
        do {
            let quizResponse = try await DUSSCService.shared.getQuiz(profil: personaCode)
            quiz = quizResponse.data

            let sessionResponse = try await DUSSCService.shared.createSession(
                uuid: sessionUUID,
                profil: personaCode
            )
            _ = sessionResponse.data
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    private func submitAnswer() async {
        guard let question = currentQuestion, let answer = selectedAnswer else { return }
        isSubmitting = true

        let durationMs = Int(Date().timeIntervalSince(questionStartTime) * 1000)

        do {
            let response = try await DUSSCService.shared.submitAnswer(
                uuid: sessionUUID,
                questionId: question.id,
                answer: answer,
                bloc: question.bloc ?? "tronc_commun",
                questionOrder: question.order,
                durationMs: durationMs,
                optionsOrder: question.optionsOrder
            )
            feedback = response.data
            if response.data?.isCorrect == true {
                correctCount += 1
            }
        } catch {
            // On error, still allow progression
            feedback = DUSSCAnswerFeedback(isCorrect: nil, correctAnswer: nil, explication: nil, action: nil, ideeFausse: nil)
        }
        isSubmitting = false
    }

    private func nextQuestion() {
        if currentIndex < questions.count - 1 {
            currentIndex += 1
            selectedAnswer = nil
            feedback = nil
            questionStartTime = Date()
        } else {
            Task { await completeQuiz() }
        }
    }

    private func completeQuiz() async {
        isLoading = true
        let duration = Int(Date().timeIntervalSince(startTime))
        do {
            let response = try await DUSSCService.shared.completeSession(
                uuid: sessionUUID,
                durationSeconds: duration
            )
            scores = response.data
        } catch {}
        isLoading = false
    }

    private func resetQuiz() {
        sessionUUID = UUID().uuidString
        currentIndex = 0
        selectedAnswer = nil
        feedback = nil
        scores = nil
        correctCount = 0
        quiz = nil
        errorMessage = nil
    }

    // MARK: - UI Helpers

    private func optionCircleColor(_ letter: String) -> Color {
        if let fb = feedback {
            if letter == fb.correctAnswer { return AppColors.success }
            if letter == selectedAnswer && !(fb.isCorrect ?? false) { return AppColors.danger }
        }
        return selectedAnswer == letter ? Color(hex: 0x2F5D3A) : AppColors.secondaryBackground
    }

    private func optionCircleForeground(_ letter: String) -> Color {
        if feedback != nil || selectedAnswer == letter { return .white }
        return AppColors.textPrimary
    }

    private func optionBackground(_ letter: String) -> Color {
        if let fb = feedback {
            if letter == fb.correctAnswer { return AppColors.success.opacity(0.08) }
            if letter == selectedAnswer && !(fb.isCorrect ?? false) { return AppColors.danger.opacity(0.08) }
        }
        return AppColors.cardBackground
    }

    private func optionBorder(_ letter: String) -> Color {
        if let fb = feedback {
            if letter == fb.correctAnswer { return AppColors.success }
            if letter == selectedAnswer && !(fb.isCorrect ?? false) { return AppColors.danger }
            return .clear
        }
        return selectedAnswer == letter ? Color(hex: 0x2F5D3A) : .clear
    }

    private func blocLabel(_ bloc: String?) -> String {
        switch bloc {
        case "pre_test": appLanguage == "fr" ? "Pré-test" : "Pre-test"
        case "tronc_commun": appLanguage == "fr" ? "Tronc commun" : "Common core"
        case "profil": appLanguage == "fr" ? "Profil" : "Profile"
        case "post_test": appLanguage == "fr" ? "Post-test" : "Post-test"
        default: ""
        }
    }

    private func blocColor(_ bloc: String?) -> Color {
        switch bloc {
        case "pre_test": Color(hex: 0xFF9800)
        case "tronc_commun": Color(hex: 0x2196F3)
        case "profil": Color(hex: 0x9B59B6)
        case "post_test": Color(hex: 0x27AE60)
        default: AppColors.muted
        }
    }

    private var scoreColor: Color {
        guard let pct = scores?.pctTotal else { return AppColors.muted }
        if pct >= 80 { return AppColors.success }
        if pct >= 50 { return Color(hex: 0xFF9800) }
        return AppColors.danger
    }

    private var resultMessage: String {
        guard let pct = scores?.pctTotal else { return "" }
        if pct >= 80 {
            return appLanguage == "fr"
                ? "Excellent ! Vous maîtrisez les concepts One Health."
                : "Excellent! You master the One Health concepts."
        } else if pct >= 50 {
            return appLanguage == "fr"
                ? "Bien ! Continuez à approfondir vos connaissances."
                : "Good! Keep deepening your knowledge."
        } else {
            return appLanguage == "fr"
                ? "Courage ! Explorez nos ressources pour progresser."
                : "Keep going! Explore our resources to improve."
        }
    }
}
