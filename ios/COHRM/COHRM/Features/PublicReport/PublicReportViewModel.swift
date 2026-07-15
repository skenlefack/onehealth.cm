// PublicReportViewModel.swift
// COHRM Cameroun - ViewModel pour le signalement public

import Foundation

/// ViewModel pour le signalement public (sans authentification)
@MainActor
@Observable
final class PublicReportViewModel {

    // MARK: - Formulaire de signalement

    /// Telephone du declarant (obligatoire)
    var phone = ""

    /// Nom du declarant (optionnel)
    var name = ""

    /// Region selectionnee
    var region = ""

    /// Description de l'evenement (obligatoire)
    var description = ""

    /// Categorie de l'evenement
    var category = "other"

    // MARK: - Suivi

    /// Code de suivi recu apres soumission
    var trackingCode = ""

    /// Code saisi pour le suivi d'un signalement existant
    var trackingInput = ""

    /// Resultat du suivi
    var trackingResult: TrackingData?

    // MARK: - Etat

    /// Indicateur de soumission en cours
    var isSubmitting = false

    /// Indicateur de suivi en cours
    var isTracking = false

    /// Affiche le message de succes
    var showSuccess = false

    /// Message d'erreur
    var error: String?

    /// Liste des regions disponibles
    var regions: [RegionItem] = []

    /// Indicateur de chargement des regions
    var isLoadingRegions = false

    // MARK: - Categories disponibles

    /// Liste des categories de signalement
    static let categories: [(value: String, label: String)] = [
        ("human_health", String(localized: "public_report.category.human_health")),
        ("animal_health", String(localized: "public_report.category.animal_health")),
        ("environmental", String(localized: "public_report.category.environmental")),
        ("food_safety", String(localized: "public_report.category.food_safety")),
        ("other", String(localized: "public_report.category.other")),
    ]

    // MARK: - Validation

    /// Verifie que le formulaire est valide pour soumission
    var canSubmit: Bool {
        !phone.trimmingCharacters(in: .whitespaces).isEmpty
            && phone.count >= 9
            && !description.trimmingCharacters(in: .whitespaces).isEmpty
            && description.count >= 10
    }

    // MARK: - Actions

    /// Charge les regions depuis le serveur
    func loadRegions() async {
        guard regions.isEmpty else { return }
        isLoadingRegions = true

        do {
            let response = try await APIService.shared.getPublicRegions()
            if let data = response.data {
                regions = data
            }
        } catch {
            // Les regions ne sont pas critiques, on continue sans
            self.error = nil
        }

        isLoadingRegions = false
    }

    /// Soumet le signalement public
    func submitReport() async {
        guard canSubmit else { return }

        isSubmitting = true
        error = nil

        let request = PublicReportRequest(
            reporterName: name.isEmpty ? nil : name,
            reporterPhone: phone,
            region: region.isEmpty ? nil : region,
            description: description,
            category: category
        )

        do {
            let response = try await APIService.shared.submitPublicReport(request)
            if response.success, let code = response.code {
                trackingCode = code
                showSuccess = true
                HapticHelper.notification(.success)
            } else {
                error = response.message ?? String(localized: "public_report.error.submit")
                HapticHelper.notification(.error)
            }
        } catch {
            self.error = error.localizedDescription
            HapticHelper.notification(.error)
        }

        isSubmitting = false
    }

    /// Suit un signalement par son code
    func trackReport() async {
        let code = trackingInput.trimmingCharacters(in: .whitespaces)
        guard !code.isEmpty else { return }

        isTracking = true
        error = nil
        trackingResult = nil

        do {
            let response = try await APIService.shared.trackPublicReport(code: code)
            if response.success, let data = response.data {
                trackingResult = data
                HapticHelper.notification(.success)
            } else {
                error = response.message ?? String(localized: "public_report.error.track")
                HapticHelper.notification(.error)
            }
        } catch {
            self.error = error.localizedDescription
            HapticHelper.notification(.error)
        }

        isTracking = false
    }

    /// Reinitialise le formulaire
    func resetForm() {
        phone = ""
        name = ""
        region = ""
        description = ""
        category = "other"
        trackingCode = ""
        error = nil
        showSuccess = false
    }
}
