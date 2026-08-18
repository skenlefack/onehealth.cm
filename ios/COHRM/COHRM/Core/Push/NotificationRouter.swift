// NotificationRouter.swift
// One Health Cameroon - Deep linking depuis les notifications push

import Foundation
import SwiftUI

/// Routeur de notifications pour le deep linking depuis les push
@MainActor
@Observable
final class NotificationRouter {

    // MARK: - Singleton

    static let shared = NotificationRouter()
    private init() {
        // Observer les notifications push reçues
        NotificationCenter.default.addObserver(
            forName: .pushNotificationReceived,
            object: nil,
            queue: .main
        ) { [weak self] notification in
            guard let userInfo = notification.userInfo as? [String: Any] else { return }
            Task { @MainActor in
                self?.handleNotification(userInfo)
            }
        }
    }

    // MARK: - State

    /// Destination de navigation en attente
    var pendingDestination: NotificationDestination?

    // MARK: - Routing

    /// Parse le payload de notification et détermine la destination
    func handleNotification(_ userInfo: [String: Any]) {
        // Extraire les données du payload FCM/APNs
        // Le backend envoie: { notification_type, rumor_id, rumor_code, ... }
        let data = (userInfo["data"] as? [String: Any]) ?? userInfo

        guard let notificationType = data["notification_type"] as? String else {
            print("[NotificationRouter] No notification_type in payload")
            return
        }

        switch notificationType {
        case "new_rumor", "status_change", "validation", "escalation", "assignment":
            if let rumorIdStr = data["rumor_id"] as? String,
               let rumorId = Int(rumorIdStr) {
                pendingDestination = .rumorDetail(id: rumorId)
            } else if let rumorId = data["rumor_id"] as? Int {
                pendingDestination = .rumorDetail(id: rumorId)
            }

        case "alert":
            pendingDestination = .notifications

        case "reminder":
            pendingDestination = .dashboard

        default:
            pendingDestination = .notifications
        }
    }

    /// Réinitialise la destination après navigation
    func clearPendingDestination() {
        pendingDestination = nil
    }
}

// MARK: - Destinations

/// Destinations possibles depuis une notification push
enum NotificationDestination: Equatable {
    case rumorDetail(id: Int)
    case notifications
    case dashboard
}
