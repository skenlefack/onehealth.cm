// RumorDetailViewModel.swift
// COHRM Cameroun - ViewModel du detail d'une rumeur

import Foundation

/// ViewModel pour le detail d'une rumeur avec envoi de notes,
/// evaluation du risque et workflow de validation
@MainActor
@Observable
final class RumorDetailViewModel {

    // MARK: - Donnees

    /// Detail complet de la rumeur
    var rumor: RumorDetail?

    /// Indicateur de chargement
    var isLoading = false

    /// Message d'erreur
    var errorMessage: String?

    // MARK: - Notes

    /// Texte de la nouvelle note
    var newNoteText: String = ""

    /// Indicateur d'envoi de note en cours
    var isSendingNote = false

    /// Message de succes apres envoi
    var noteSentSuccess = false

    // MARK: - Risk Assessment

    /// Niveau de risque selectionne
    var selectedRiskLevel: String = "unknown"

    /// Description du risque
    var riskDescription: String = ""

    /// Contexte du risque
    var riskContext: String = ""

    /// Exposition au risque
    var riskExposure: String = ""

    /// Indicateur d'envoi d'evaluation en cours
    var isAssessingRisk = false

    /// Message de succes apres evaluation
    var riskAssessmentSuccess = false

    /// Niveaux de risque disponibles
    static let riskLevels: [(value: String, label: String, color: String)] = [
        ("unknown", "Inconnu", "muted"),
        ("low", "Faible", "success"),
        ("moderate", "Modere", "warning"),
        ("high", "Eleve", "danger"),
        ("very_high", "Tres eleve", "critical"),
    ]

    // MARK: - Feedback

    /// Feedbacks de la rumeur
    var feedbackItems: [FeedbackItem] = []

    /// Indicateur de chargement des feedbacks
    var isLoadingFeedback = false

    // MARK: - Validation Workflow

    /// Historique des validations chargees separement
    var validationHistory: [ValidationHistoryItem] = []

    /// Indicateur de chargement des validations
    var isLoadingValidations = false

    /// Indicateur d'envoi de validation en cours
    var isValidating = false

    /// Message de succes de validation
    var validationSuccess = false

    /// Raison de rejet
    var rejectionReason: String = ""

    /// Notes de validation
    var validationNotes: String = ""

    /// Afficher le formulaire de rejet
    var showRejectionForm = false

    // MARK: - Chargement

    /// Charge le detail complet d'une rumeur
    func loadDetail(id: Int) async {
        isLoading = true
        errorMessage = nil

        do {
            let response = try await APIService.shared.getRumorDetail(id: id)
            rumor = response.data

            // Initialiser les champs de risque depuis les donnees existantes
            if let risk = rumor?.riskLevel, !risk.isEmpty {
                selectedRiskLevel = risk
            }
            if let desc = rumor?.riskDescription, !desc.isEmpty {
                riskDescription = desc
            }
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    /// Envoie une nouvelle note puis recharge le detail
    func sendNote(rumorId: Int) async {
        let content = newNoteText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !content.isEmpty else { return }

        isSendingNote = true
        noteSentSuccess = false

        do {
            _ = try await APIService.shared.addRumorNote(
                rumorId: rumorId,
                content: content
            )
            newNoteText = ""
            noteSentSuccess = true

            // Recharger le detail pour voir la nouvelle note
            await loadDetail(id: rumorId)
        } catch {
            errorMessage = error.localizedDescription
        }

        isSendingNote = false
    }

    // MARK: - Feedback

    /// Charge les feedbacks d'une rumeur
    func loadFeedback(rumorId: Int) async {
        isLoadingFeedback = true
        do {
            let response = try await APIService.shared.getRumorFeedback(rumorId: rumorId)
            if response.success {
                feedbackItems = response.data ?? []
            }
        } catch {
            // Silencieux - les feedbacks sont optionnels
        }
        isLoadingFeedback = false
    }

    // MARK: - Risk Assessment

    /// Soumet une evaluation du risque
    func assessRisk(rumorId: Int) async {
        isAssessingRisk = true
        riskAssessmentSuccess = false
        errorMessage = nil

        let request = RiskAssessmentRequest(
            riskLevel: selectedRiskLevel,
            riskDescription: riskDescription.isEmpty ? nil : riskDescription,
            riskContext: riskContext.isEmpty ? nil : riskContext,
            riskExposure: riskExposure.isEmpty ? nil : riskExposure
        )

        do {
            _ = try await APIService.shared.assessRisk(rumorId: rumorId, request: request)
            riskAssessmentSuccess = true

            // Recharger le detail
            await loadDetail(id: rumorId)
        } catch {
            errorMessage = error.localizedDescription
        }

        isAssessingRisk = false
    }

    // MARK: - Validation Workflow

    /// Charge l'historique des validations
    func loadValidations(rumorId: Int) async {
        isLoadingValidations = true

        do {
            let response = try await APIService.shared.getValidations(rumorId: rumorId)
            validationHistory = response.data ?? []
        } catch {
            // Silencieux - les validations inline du detail suffisent
            validationHistory = []
        }

        isLoadingValidations = false
    }

    /// Valide la rumeur
    func validateRumor(rumorId: Int) async {
        isValidating = true
        validationSuccess = false
        errorMessage = nil

        let request = ValidationRequest(
            actionType: "validate",
            status: "validated",
            notes: validationNotes.isEmpty ? nil : validationNotes,
            rejectionReason: nil
        )

        do {
            _ = try await APIService.shared.validateRumor(rumorId: rumorId, request: request)
            validationSuccess = true
            validationNotes = ""

            await loadDetail(id: rumorId)
            await loadValidations(rumorId: rumorId)
        } catch {
            errorMessage = error.localizedDescription
        }

        isValidating = false
    }

    /// Rejette la rumeur
    func rejectRumor(rumorId: Int) async {
        let reason = rejectionReason.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !reason.isEmpty else { return }

        isValidating = true
        validationSuccess = false
        errorMessage = nil

        let request = ValidationRequest(
            actionType: "reject",
            status: "rejected",
            notes: validationNotes.isEmpty ? nil : validationNotes,
            rejectionReason: reason
        )

        do {
            _ = try await APIService.shared.validateRumor(rumorId: rumorId, request: request)
            validationSuccess = true
            rejectionReason = ""
            validationNotes = ""
            showRejectionForm = false

            await loadDetail(id: rumorId)
            await loadValidations(rumorId: rumorId)
        } catch {
            errorMessage = error.localizedDescription
        }

        isValidating = false
    }

    /// Escalade la rumeur au niveau superieur
    func escalateRumor(rumorId: Int) async {
        isValidating = true
        validationSuccess = false
        errorMessage = nil

        let request = ValidationRequest(
            actionType: "escalate",
            status: "escalated",
            notes: validationNotes.isEmpty ? nil : validationNotes,
            rejectionReason: nil
        )

        do {
            _ = try await APIService.shared.validateRumor(rumorId: rumorId, request: request)
            validationSuccess = true
            validationNotes = ""

            await loadDetail(id: rumorId)
            await loadValidations(rumorId: rumorId)
        } catch {
            errorMessage = error.localizedDescription
        }

        isValidating = false
    }
}
