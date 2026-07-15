// ReportWizardView.swift
// COHRM Cameroun - Vue principale de l'assistant de signalement
// Conteneur avec barre de progression et navigation entre étapes

import SwiftUI
import SwiftData

/// Vue principale de l'assistant de signalement en 5 étapes
struct ReportWizardView: View {

    // MARK: - Propriétés

    /// ViewModel de l'assistant
    @State private var viewModel = ReportViewModel()

    /// Contexte SwiftData pour la persistance locale
    @Environment(\.modelContext) private var modelContext

    /// Pour fermer la vue modale
    @Environment(\.dismiss) private var dismiss

    /// Surveillance réseau
    @EnvironmentObject private var networkMonitor: NetworkMonitor

    // MARK: - Corps

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Barre de progression des étapes
                stepProgressBar
                    .padding(.horizontal, AppDimensions.spacing)
                    .padding(.top, AppDimensions.spacingS)
                    .padding(.bottom, AppDimensions.spacingM)

                // Contenu de l'étape courante
                stepContent
                    .frame(maxWidth: .infinity, maxHeight: .infinity)

                // Barre de navigation bas (Précédent / Suivant)
                bottomNavigationBar
                    .padding(.horizontal, AppDimensions.spacing)
                    .padding(.vertical, AppDimensions.spacingM)
                    .background(
                        AppColors.background
                            .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: -4)
                    )
            }
            .background(AppColors.groupedBackground)
            .navigationTitle(String(localized: "report.title"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(String(localized: "report.cancel")) {
                        viewModel.showCancelAlert = true
                    }
                    .foregroundStyle(AppColors.danger)
                }
            }
            // Alerte d'annulation
            .alert(
                String(localized: "report.cancel.title"),
                isPresented: $viewModel.showCancelAlert
            ) {
                Button(String(localized: "report.cancel.continue"), role: .cancel) {}
                Button(String(localized: "report.cancel.discard"), role: .destructive) {
                    viewModel.clearDraft()
                    dismiss()
                }
                Button(String(localized: "report.cancel.save_draft")) {
                    viewModel.saveDraft()
                    dismiss()
                }
            } message: {
                Text(String(localized: "report.cancel.message"))
            }
            // Alerte de succès
            .alert(
                String(localized: "report.success.title"),
                isPresented: $viewModel.showSuccessAlert
            ) {
                Button(String(localized: "report.success.ok")) {
                    dismiss()
                }
            } message: {
                if NetworkMonitor.shared.isConnected {
                    if let code = viewModel.createdReportCode {
                        Text(String(localized: "report.success.message_with_code \(code)"))
                    } else {
                        Text(String(localized: "report.success.message"))
                    }
                } else {
                    Text(String(localized: "report.success.message_offline"))
                }
            }
            // Alerte d'erreur
            .alert(
                String(localized: "report.error.title"),
                isPresented: $viewModel.showErrorAlert
            ) {
                Button(String(localized: "report.error.ok")) {}
            } message: {
                Text(viewModel.submitError ?? String(localized: "report.error.unknown"))
            }
        }
    }

    // MARK: - Barre de progression

    /// Affiche les 5 étapes avec indicateurs visuels
    private var stepProgressBar: some View {
        HStack(spacing: AppDimensions.spacingXS) {
            ForEach(1...viewModel.totalSteps, id: \.self) { step in
                VStack(spacing: AppDimensions.spacingXS) {
                    // Cercle numéroté
                    ZStack {
                        Circle()
                            .fill(stepColor(for: step))
                            .frame(width: 28, height: 28)

                        if step < viewModel.currentStep {
                            // Étape complétée
                            Image(systemName: "checkmark")
                                .font(.caption.weight(.bold))
                                .foregroundStyle(.white)
                        } else {
                            Text("\(step)")
                                .font(.caption.weight(.bold))
                                .foregroundStyle(step == viewModel.currentStep ? .white : AppColors.textTertiary)
                        }
                    }

                    // Libellé de l'étape
                    Text(ReportViewModel.stepLabels[step - 1])
                        .font(AppFonts.caption2)
                        .foregroundStyle(step == viewModel.currentStep ? AppColors.primary : AppColors.textTertiary)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                }
                .frame(maxWidth: .infinity)

                // Ligne de connexion entre les étapes
                if step < viewModel.totalSteps {
                    Rectangle()
                        .fill(step < viewModel.currentStep ? AppColors.primary : AppColors.muted.opacity(0.3))
                        .frame(height: 2)
                        .frame(maxWidth: 20)
                        .offset(y: -8)
                }
            }
        }
    }

    /// Couleur du cercle d'étape
    private func stepColor(for step: Int) -> Color {
        if step < viewModel.currentStep {
            return AppColors.success
        } else if step == viewModel.currentStep {
            return AppColors.primary
        } else {
            return AppColors.muted.opacity(0.3)
        }
    }

    // MARK: - Contenu de l'étape courante

    /// Affiche la vue correspondant à l'étape active
    @ViewBuilder
    private var stepContent: some View {
        Group {
            switch viewModel.currentStep {
            case 1:
                Step1EventTypeView(viewModel: viewModel)
            case 2:
                Step2LocationView(viewModel: viewModel)
            case 3:
                Step3DetailsView(viewModel: viewModel)
            case 4:
                Step4PersonalInfoView(viewModel: viewModel)
            case 5:
                Step5ConfirmationView(viewModel: viewModel, modelContext: modelContext)
            default:
                EmptyView()
            }
        }
        .transition(.asymmetric(
            insertion: .move(edge: .trailing).combined(with: .opacity),
            removal: .move(edge: .leading).combined(with: .opacity)
        ))
        .animation(.easeInOut(duration: 0.3), value: viewModel.currentStep)
    }

    // MARK: - Barre de navigation inférieure

    /// Boutons Précédent / Suivant en bas de l'écran
    private var bottomNavigationBar: some View {
        HStack(spacing: AppDimensions.spacingM) {
            // Bouton Précédent (masqué sur l'étape 1)
            if !viewModel.isFirstStep {
                SecondaryButton(
                    String(localized: "report.previous"),
                    icon: "chevron.left"
                ) {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        viewModel.previousStep()
                    }
                }
            }

            // Bouton Suivant / Envoyer
            // À l'étape 5, le bouton est dans Step5ConfirmationView
            if !viewModel.isLastStep {
                PrimaryButton(
                    viewModel.nextButtonTitle,
                    icon: viewModel.nextButtonIcon
                ) {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        viewModel.nextStep()
                    }
                }
                .disabled(!viewModel.canProceed)
                .opacity(viewModel.canProceed ? 1.0 : 0.5)
            }
        }
    }
}

// MARK: - Aperçu

#Preview {
    ReportWizardView()
        .environmentObject(NetworkMonitor.shared)
}
