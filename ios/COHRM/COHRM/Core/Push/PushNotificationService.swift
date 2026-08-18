// PushNotificationService.swift
// One Health Cameroon - Service de notifications push (APNs natif)

import Foundation
import UIKit
import UserNotifications

/// Service de gestion des notifications push via APNs natif
/// Le backend utilise FCM qui bridge automatiquement vers APNs.
/// On enregistre le device token APNs directement auprès du backend.
@MainActor
final class PushNotificationService: NSObject, ObservableObject {

    // MARK: - Singleton

    static let shared = PushNotificationService()
    private override init() { super.init() }

    // MARK: - State

    @Published private(set) var isAuthorized = false
    @Published private(set) var deviceToken: String?

    /// Notification reçue à traiter (deep link)
    @Published var pendingNotification: [String: Any]?

    // MARK: - Setup

    /// Configure le service de push. Appelé au lancement de l'app.
    func configure() {
        UNUserNotificationCenter.current().delegate = self
    }

    /// Demande l'autorisation et enregistre pour les notifications push
    func requestAuthorization() async {
        do {
            let granted = try await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .badge, .sound])

            isAuthorized = granted

            if granted {
                // Demander le token APNs
                UIApplication.shared.registerForRemoteNotifications()
            }
        } catch {
            print("[Push] Authorization error: \(error.localizedDescription)")
        }
    }

    /// Appelé quand iOS fournit le device token APNs
    func didRegisterForRemoteNotifications(deviceToken token: Data) {
        let tokenString = token.map { String(format: "%02.2hhx", $0) }.joined()
        self.deviceToken = tokenString
        print("[Push] APNs token: \(tokenString)")

        // Enregistrer auprès du backend
        Task {
            await registerTokenWithBackend(tokenString)
        }
    }

    /// Appelé en cas d'échec d'enregistrement APNs
    func didFailToRegisterForRemoteNotifications(error: Error) {
        print("[Push] Registration failed: \(error.localizedDescription)")
    }

    // MARK: - Backend Registration

    /// Envoie le device token au backend pour recevoir les push via FCM
    private func registerTokenWithBackend(_ token: String) async {
        // Ne pas enregistrer si pas authentifié
        guard AuthManager.shared.isAuthenticated else { return }

        do {
            let deviceInfo: [String: Any] = [
                "model": UIDevice.current.model,
                "systemVersion": UIDevice.current.systemVersion,
                "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
            ]

            let body: [String: Any] = [
                "token": token,
                "platform": "ios",
                "device_info": deviceInfo
            ]

            _ = try await APIClient.shared.post(
                Endpoints.registerDevice,
                body: body,
                responseType: APIResponse<EmptyDTO>.self
            )
            print("[Push] Token registered with backend")
        } catch {
            print("[Push] Backend registration error: \(error.localizedDescription)")
        }
    }

    /// Désenregistre le device token du backend (appelé au logout)
    func unregisterFromBackend() async {
        guard let token = deviceToken else { return }

        do {
            _ = try await APIClient.shared.post(
                Endpoints.unregisterDevice,
                body: ["token": token],
                responseType: APIResponse<EmptyDTO>.self
            )
            print("[Push] Token unregistered from backend")
        } catch {
            print("[Push] Backend unregister error: \(error.localizedDescription)")
        }
    }

    /// Ré-enregistre le token après un login
    func reregisterAfterLogin() {
        guard let token = deviceToken else { return }
        Task {
            await registerTokenWithBackend(token)
        }
    }
}

// MARK: - UNUserNotificationCenterDelegate

extension PushNotificationService: UNUserNotificationCenterDelegate {

    /// Notification reçue en foreground — afficher comme bannière
    nonisolated func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        // Afficher la notification même quand l'app est au premier plan
        completionHandler([.banner, .badge, .sound])
    }

    /// L'utilisateur a tapé sur une notification — deep link
    nonisolated func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo

        Task { @MainActor in
            PushNotificationService.shared.pendingNotification = userInfo as? [String: Any]
            NotificationCenter.default.post(
                name: .pushNotificationReceived,
                object: nil,
                userInfo: userInfo as? [AnyHashable: Any]
            )
        }

        completionHandler()
    }
}

// MARK: - Notification Name

extension Notification.Name {
    static let pushNotificationReceived = Notification.Name("pushNotificationReceived")
}
