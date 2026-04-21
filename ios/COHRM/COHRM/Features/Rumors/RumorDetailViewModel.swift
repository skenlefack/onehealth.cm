// RumorDetailViewModel.swift
// COHRM Cameroun - ViewModel du detail d'une rumeur

import Foundation

/// ViewModel pour le detail d'une rumeur avec envoi de notes
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

    // MARK: - Chargement

    /// Charge le detail complet d'une rumeur
    func loadDetail(id: Int) async {
        isLoading = true
        errorMessage = nil

        do {
            let response = try await APIService.shared.getRumorDetail(id: id)
            rumor = response.data
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
}
