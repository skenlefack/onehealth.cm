// ReportViewModel.swift
// COHRM Cameroun - ViewModel pour l'assistant de signalement
// Gère la navigation, la validation et la soumission du rapport

import SwiftUI
import SwiftData
import Observation

/// ViewModel principal de l'assistant de signalement en 5 étapes
@Observable
final class ReportViewModel {

    // MARK: - Navigation

    /// Étape actuelle (1 à 5)
    var currentStep: Int = 1

    /// Nombre total d'étapes
    let totalSteps = 5

    // MARK: - Données du signalement

    /// Structure DTO contenant toutes les données saisies
    var reportData = ReportData()

    /// Photos sélectionnées par l'utilisateur
    var selectedPhotos: [UIImage] = []

    // MARK: - État de l'interface

    /// Indique si la soumission est en cours
    var isSubmitting = false

    /// Indique si la soumission a réussi
    var didSubmitSuccessfully = false

    /// Message d'erreur éventuel après soumission
    var submitError: String?

    /// Affiche l'alerte d'annulation
    var showCancelAlert = false

    /// Affiche l'alerte de succès
    var showSuccessAlert = false

    /// Affiche l'alerte d'erreur
    var showErrorAlert = false

    /// Code du signalement créé (retourné par le serveur)
    var createdReportCode: String?

    // MARK: - Clé UserDefaults pour le brouillon

    private static let draftKey = "cohrm_report_draft"
    private static let draftPhotosCountKey = "cohrm_report_draft_photos_count"

    // MARK: - Initialisation

    init() {
        restoreDraft()
    }

    // MARK: - Navigation entre étapes

    /// Passe à l'étape suivante si la validation est OK
    func nextStep() {
        guard canProceed else { return }
        if currentStep < totalSteps {
            currentStep += 1
            saveDraft()
            HapticHelper.impact(.light)
        }
    }

    /// Revient à l'étape précédente
    func previousStep() {
        if currentStep > 1 {
            currentStep -= 1
            HapticHelper.impact(.light)
        }
    }

    /// Indique si l'utilisateur peut avancer à l'étape suivante
    var canProceed: Bool {
        switch currentStep {
        case 1:
            return validateStep1()
        case 2:
            return validateStep2()
        case 3:
            return validateStep3()
        case 4:
            return validateStep4()
        case 5:
            return true // L'étape de confirmation est toujours valide
        default:
            return false
        }
    }

    /// Libellé du bouton suivant selon l'étape
    var nextButtonTitle: String {
        if currentStep == totalSteps {
            return String(localized: "report.submit")
        }
        return String(localized: "report.next")
    }

    /// Icône du bouton suivant selon l'étape
    var nextButtonIcon: String? {
        if currentStep == totalSteps {
            return "paperplane.fill"
        }
        return "chevron.right"
    }

    /// Indique si l'on est sur la première étape
    var isFirstStep: Bool {
        currentStep == 1
    }

    /// Indique si l'on est sur la dernière étape
    var isLastStep: Bool {
        currentStep == totalSteps
    }

    // MARK: - Validation par étape

    /// Étape 1 : catégorie d'événement obligatoire
    private func validateStep1() -> Bool {
        !reportData.category.isEmpty
    }

    /// Étape 2 : région obligatoire
    private func validateStep2() -> Bool {
        !reportData.region.isEmpty
    }

    /// Étape 3 : titre et description obligatoires
    private func validateStep3() -> Bool {
        !reportData.title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            && !reportData.description.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    /// Étape 4 : si non-anonyme, le nom et le téléphone sont obligatoires
    private func validateStep4() -> Bool {
        if reportData.isAnonymous {
            return true
        }
        let hasName = !reportData.reporterName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        let hasPhone = reportData.reporterPhone.replacingOccurrences(of: " ", with: "")
            .replacingOccurrences(of: "+237", with: "").count == 9
        return hasName && hasPhone
    }

    // MARK: - Sélection catégorie / espèce

    /// Catégorie d'événement sélectionnée (binding)
    var selectedCategory: EventCategory? {
        get { EventCategory(rawValue: reportData.category) }
        set {
            reportData.category = newValue?.rawValue ?? ""
            // Réinitialiser l'espèce si on change de catégorie
            reportData.species = ""
        }
    }

    /// Espèce sélectionnée (binding)
    var selectedSpecies: SpeciesCode? {
        get { SpeciesCode(rawValue: reportData.species) }
        set { reportData.species = newValue?.rawValue ?? "" }
    }

    // MARK: - Gestion des symptômes

    /// Vérifie si un symptôme est sélectionné
    func isSymptomSelected(_ symptom: SymptomCode) -> Bool {
        reportData.symptoms.contains(symptom.rawValue)
    }

    /// Bascule la sélection d'un symptôme
    func toggleSymptom(_ symptom: SymptomCode) {
        if let index = reportData.symptoms.firstIndex(of: symptom.rawValue) {
            reportData.symptoms.remove(at: index)
        } else {
            reportData.symptoms.append(symptom.rawValue)
        }
        HapticHelper.selection()
    }

    // MARK: - Gestion des photos

    /// Ajoute des photos sélectionnées
    func addPhotos(_ images: [UIImage]) {
        // Limiter à 5 photos maximum
        let remaining = 5 - selectedPhotos.count
        let toAdd = Array(images.prefix(remaining))
        selectedPhotos.append(contentsOf: toAdd)
    }

    /// Supprime une photo à l'index donné
    func removePhoto(at index: Int) {
        guard selectedPhotos.indices.contains(index) else { return }
        selectedPhotos.remove(at: index)
        HapticHelper.impact(.light)
    }

    /// Nombre maximum de photos autorisées
    var maxPhotos: Int { 5 }

    /// Indique si on peut encore ajouter des photos
    var canAddPhotos: Bool {
        selectedPhotos.count < maxPhotos
    }

    // MARK: - Soumission

    /// Soumet le signalement : sauvegarde locale SwiftData + tentative d'envoi API
    @MainActor
    func submitReport(modelContext: ModelContext) async {
        guard !isSubmitting else { return }

        isSubmitting = true
        submitError = nil

        // Compléter les métadonnées
        reportData.deviceId = DeviceHelper.deviceId
        reportData.appVersion = Bundle.main.appVersion
        reportData.submittedAt = Date()

        // 1. Sauvegarder les photos localement
        var savedPhotoAttachments: [PhotoAttachment] = []
        for photo in selectedPhotos {
            do {
                let result = try await PhotoService.shared.savePhoto(photo)
                let attachment = PhotoAttachment(
                    fileName: result.fileName,
                    fileSize: result.fileSize,
                    localPath: result.fileName
                )
                savedPhotoAttachments.append(attachment)
                reportData.photoFileNames.append(result.fileName)
            } catch {
                print("Erreur sauvegarde photo : \(error.localizedDescription)")
            }
        }

        // 2. Créer le modèle SwiftData local
        let reportModel = ReportModel(from: reportData)
        reportModel.photos = savedPhotoAttachments
        modelContext.insert(reportModel)

        do {
            try modelContext.save()
        } catch {
            submitError = String(localized: "report.error.save_local")
            isSubmitting = false
            showErrorAlert = true
            return
        }

        // 3. Tenter l'envoi API si connecté
        if NetworkMonitor.shared.isConnected {
            do {
                let response = try await APIService.shared.submitReport(
                    reportData,
                    photos: selectedPhotos
                )

                if response.success {
                    reportModel.syncStatus = .synced
                    reportModel.serverId = response.data?.id
                    createdReportCode = response.data?.code
                    try? modelContext.save()
                } else {
                    // L'envoi a échoué mais le rapport est sauvegardé localement
                    reportModel.syncStatus = .pending
                    reportModel.syncError = response.message
                    try? modelContext.save()
                }

                didSubmitSuccessfully = true
                showSuccessAlert = true
                clearDraft()
                HapticHelper.notification(.success)
            } catch {
                // Erreur réseau : le rapport sera synchronisé plus tard
                reportModel.syncStatus = .pending
                reportModel.syncError = error.localizedDescription
                try? modelContext.save()

                didSubmitSuccessfully = true
                showSuccessAlert = true
                clearDraft()
                HapticHelper.notification(.warning)

                // Planifier la synchronisation en arrière-plan
                SyncService.shared.scheduleBackgroundSync()
            }
        } else {
            // Hors ligne : le rapport sera synchronisé au retour du réseau
            reportModel.syncStatus = .pending
            try? modelContext.save()

            didSubmitSuccessfully = true
            showSuccessAlert = true
            clearDraft()
            HapticHelper.notification(.warning)

            SyncService.shared.scheduleBackgroundSync()
        }

        isSubmitting = false
    }

    // MARK: - Sauvegarde de brouillon (UserDefaults)

    /// Sauvegarde le brouillon partiel dans UserDefaults
    func saveDraft() {
        let encoder = JSONEncoder()
        if let data = try? encoder.encode(reportData) {
            UserDefaults.standard.set(data, forKey: Self.draftKey)
            UserDefaults.standard.set(selectedPhotos.count, forKey: Self.draftPhotosCountKey)
        }
    }

    /// Restaure le brouillon depuis UserDefaults
    private func restoreDraft() {
        guard let data = UserDefaults.standard.data(forKey: Self.draftKey) else { return }
        let decoder = JSONDecoder()
        if let draft = try? decoder.decode(ReportData.self, from: data) {
            reportData = draft
        }
    }

    /// Supprime le brouillon sauvegardé
    func clearDraft() {
        UserDefaults.standard.removeObject(forKey: Self.draftKey)
        UserDefaults.standard.removeObject(forKey: Self.draftPhotosCountKey)
    }

    /// Réinitialise complètement le formulaire
    func resetForm() {
        currentStep = 1
        reportData = ReportData()
        selectedPhotos = []
        isSubmitting = false
        didSubmitSuccessfully = false
        submitError = nil
        createdReportCode = nil
        clearDraft()
    }

    // MARK: - Labels des étapes (pour la barre de progression)

    /// Libellés des 5 étapes de l'assistant
    static let stepLabels: [String] = [
        String(localized: "report.step.type"),
        String(localized: "report.step.location"),
        String(localized: "report.step.details"),
        String(localized: "report.step.personal"),
        String(localized: "report.step.confirm"),
    ]
}
