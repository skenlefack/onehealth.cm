// ELearningQuizResultsView.swift
// One Health Cameroon - Résultats de quiz E-Learning

import SwiftUI

/// Results view displayed after quiz submission
struct ELearningQuizResultsView: View {

    let result: ELQuizSubmitResponse
    let passingScore: Int
    let canRetake: Bool
    var onRetake: () -> Void
    var onDismiss: () -> Void

    @AppStorage("appLanguage") private var appLanguage = "fr"
    @State private var animatedScore: Double = 0
    @State private var showDetails = false

    private var scorePercent: Double {
        result.scorePercent ?? 0
    }

    private var passed: Bool {
        result.passed ?? (scorePercent >= Double(passingScore))
    }

    private var scoreColor: Color {
        if passed { return AppColors.success }
        if scorePercent >= Double(passingScore) * 0.7 { return AppColors.warning }
        return AppColors.danger
    }

    private var timeSpentString: String {
        let seconds = result.timeSpentSeconds ?? 0
        let m = seconds / 60
        let s = seconds % 60
        return String(format: "%d:%02d", m, s)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 28) {
                // Score circle
                scoreCircle
                    .padding(.top, 32)

                // Pass / Fail badge
                passBadge

                // Stats grid
                statsGrid

                // Message
                resultMessage

                // Actions
                actionButtons
            }
            .padding(.bottom, 40)
        }
        .background(AppColors.background)
        .onAppear {
            withAnimation(.easeOut(duration: 1.2)) {
                animatedScore = scorePercent
            }
        }
    }

    // MARK: - Score Circle

    private var scoreCircle: some View {
        ZStack {
            // Background ring
            Circle()
                .stroke(Color.gray.opacity(0.12), lineWidth: 14)
                .frame(width: 160, height: 160)

            // Animated progress ring
            Circle()
                .trim(from: 0, to: animatedScore / 100.0)
                .stroke(scoreColor, style: StrokeStyle(lineWidth: 14, lineCap: .round))
                .frame(width: 160, height: 160)
                .rotationEffect(.degrees(-90))

            // Score text
            VStack(spacing: 4) {
                Text("\(Int(animatedScore))%")
                    .font(.system(size: 42, weight: .bold, design: .rounded))
                    .foregroundStyle(scoreColor)
                    .contentTransition(.numericText())

                Text("\(result.correctCount ?? 0)/\(result.totalQuestions ?? 0)")
                    .font(.subheadline)
                    .foregroundStyle(AppColors.textSecondary)
            }
        }
    }

    // MARK: - Pass Badge

    private var passBadge: some View {
        HStack(spacing: 8) {
            Image(systemName: passed ? "checkmark.seal.fill" : "xmark.seal.fill")
                .font(.title3)
            Text(passed
                 ? (appLanguage == "fr" ? "Quiz réussi !" : "Quiz passed!")
                 : (appLanguage == "fr" ? "Quiz non réussi" : "Quiz not passed"))
                .font(.headline).fontWeight(.bold)
        }
        .foregroundStyle(passed ? AppColors.success : AppColors.danger)
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background((passed ? AppColors.success : AppColors.danger).opacity(0.1))
        .clipShape(Capsule())
    }

    // MARK: - Stats Grid

    private var statsGrid: some View {
        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible())
        ], spacing: 12) {
            statCard(
                icon: "checkmark.circle.fill",
                color: AppColors.success,
                label: appLanguage == "fr" ? "Correctes" : "Correct",
                value: "\(result.correctCount ?? 0)"
            )

            statCard(
                icon: "xmark.circle.fill",
                color: AppColors.danger,
                label: appLanguage == "fr" ? "Incorrectes" : "Incorrect",
                value: "\((result.totalQuestions ?? 0) - (result.correctCount ?? 0))"
            )

            statCard(
                icon: "clock.fill",
                color: AppColors.info,
                label: appLanguage == "fr" ? "Temps" : "Time",
                value: timeSpentString
            )

            statCard(
                icon: "target",
                color: AppColors.warning,
                label: appLanguage == "fr" ? "Score requis" : "Required",
                value: "\(passingScore)%"
            )
        }
        .padding(.horizontal, 16)
    }

    private func statCard(icon: String, color: Color, label: String, value: String) -> some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)

            Text(value)
                .font(.title3).fontWeight(.bold)
                .foregroundStyle(AppColors.textPrimary)

            Text(label)
                .font(.caption)
                .foregroundStyle(AppColors.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(AppColors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    // MARK: - Message

    private var resultMessage: some View {
        Group {
            if passed {
                Text(appLanguage == "fr"
                     ? "Félicitations ! Vous avez atteint le score minimum requis."
                     : "Congratulations! You achieved the required passing score.")
            } else {
                Text(appLanguage == "fr"
                     ? "Vous n'avez pas atteint le score minimum de \(passingScore)%. Réessayez pour améliorer votre résultat."
                     : "You did not reach the minimum score of \(passingScore)%. Try again to improve your result.")
            }
        }
        .font(.subheadline)
        .foregroundStyle(AppColors.textSecondary)
        .multilineTextAlignment(.center)
        .padding(.horizontal, 24)
    }

    // MARK: - Actions

    private var actionButtons: some View {
        VStack(spacing: 12) {
            if canRetake && !passed {
                Button {
                    onRetake()
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "arrow.counterclockwise")
                        Text(appLanguage == "fr" ? "Reprendre le quiz" : "Retake quiz")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(AppColors.moduleElearning)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }
            }

            Button {
                onDismiss()
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "arrow.left")
                    Text(appLanguage == "fr" ? "Retour au cours" : "Back to course")
                        .fontWeight(.medium)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(AppColors.secondaryBackground)
                .foregroundStyle(AppColors.textPrimary)
                .clipShape(RoundedRectangle(cornerRadius: 14))
            }
        }
        .padding(.horizontal, 16)
    }
}
