// NotificationsViewModel.swift
// COHRM Cameroun - ViewModel des notifications

import Foundation

/// ViewModel pour la liste des notifications utilisateur
@MainActor
@Observable
final class NotificationsViewModel {

    // MARK: - Donnees

    /// Liste des notifications
    var notifications: [NotificationDTO] = []

    /// Indicateur de chargement
    var isLoading = false

    /// Indicateur de chargement de la page suivante
    var isLoadingMore = false

    /// Message d'erreur
    var errorMessage: String?

    /// Page courante
    private(set) var currentPage = 1

    /// Indique s'il y a plus de pages
    var hasMorePages = false

    // MARK: - Chargement

    /// Charge une page de notifications
    func loadNotifications(page: Int = 1) async {
        if page == 1 {
            isLoading = true
        } else {
            isLoadingMore = true
        }
        errorMessage = nil

        do {
            let response = try await APIService.shared.getMyNotifications(page: page)

            if let data = response.data {
                if page == 1 {
                    notifications = data
                } else {
                    notifications.append(contentsOf: data)
                }
                currentPage = page
                hasMorePages = data.count >= 20
            } else {
                if page == 1 { notifications = [] }
                hasMorePages = false
            }
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
        isLoadingMore = false
    }

    /// Charge la page suivante
    func loadMore() async {
        guard hasMorePages, !isLoadingMore, !isLoading else { return }
        await loadNotifications(page: currentPage + 1)
    }

    /// Rafraichit depuis la premiere page
    func refresh() async {
        await loadNotifications(page: 1)
    }

    // MARK: - Actions

    /// Marque une notification comme lue
    func markAsRead(id: Int) async {
        do {
            let _ = try await APIService.shared.markNotificationRead(id: id)
            // Retirer la notification de la liste locale ou la mettre à jour
            if let index = notifications.firstIndex(where: { $0.id == id }) {
                notifications.remove(at: index)
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    /// Marque toutes les notifications comme lues
    func markAllAsRead() async {
        do {
            let _ = try await APIService.shared.markAllNotificationsRead()
            notifications.removeAll()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
