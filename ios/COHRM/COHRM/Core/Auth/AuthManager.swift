// AuthManager.swift
// One Health Cameroon - Gestion de l'état d'authentification

import Foundation
import SwiftUI

/// Gestionnaire central d'authentification
@MainActor
@Observable
final class AuthManager {

    // MARK: - Singleton

    static let shared = AuthManager()

    // MARK: - State

    /// L'utilisateur est-il authentifié ?
    private(set) var isAuthenticated = false

    /// Chargement en cours (restauration session ou login)
    private(set) var isLoading = false

    /// Erreur de login
    private(set) var loginError: String?

    /// Utilisateur connecté
    private(set) var currentUser: LoginUser?

    /// Acteur COHRM associé
    private(set) var currentActor: LoginActor?

    // MARK: - Init

    private init() {
        // Observer l'expiration de session (401)
        NotificationCenter.default.addObserver(
            forName: .authSessionExpired,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            Task { @MainActor in
                self?.logout()
            }
        }
    }

    // MARK: - Actions

    /// Restaure la session depuis le Keychain au lancement
    func restoreSession() async {
        isLoading = true
        defer { isLoading = false }

        let token = await KeychainService.shared.getToken()
        let user = await KeychainService.shared.getUser()

        if let token, let user {
            // Configurer le token dans APIClient
            await APIClient.shared.setAuthToken(token)
            currentUser = user
            currentActor = await KeychainService.shared.getActor()
            isAuthenticated = true
        }
    }

    /// Connecte l'utilisateur
    func login(email: String, password: String) async {
        isLoading = true
        loginError = nil

        do {
            let response = try await APIService.shared.login(email: email, password: password)

            guard response.success, let data = response.data else {
                loginError = response.message ?? String(localized: "login.error.invalid_credentials")
                isLoading = false
                return
            }

            // Sauvegarder dans le Keychain
            try await KeychainService.shared.saveToken(data.token)
            try await KeychainService.shared.saveUser(data.user)
            if let actor = data.actor {
                try await KeychainService.shared.saveActor(actor)
            }

            // Configurer le token dans APIClient
            await APIClient.shared.setAuthToken(data.token)

            // Mettre à jour l'état
            currentUser = data.user
            currentActor = data.actor
            isAuthenticated = true

            // Enregistrer le device token push si disponible
            PushNotificationService.shared.reregisterAfterLogin()

        } catch let error as APIError {
            switch error {
            case .unauthorized:
                loginError = String(localized: "login.error.invalid_credentials")
            case .serverError:
                loginError = String(localized: "login.error.server")
            default:
                loginError = error.localizedDescription
            }
        } catch {
            loginError = String(localized: "login.error.network")
        }

        isLoading = false
    }

    /// Déconnecte l'utilisateur
    func logout() {
        // Désenregistrer les push notifications
        Task {
            await PushNotificationService.shared.unregisterFromBackend()
            await KeychainService.shared.clearAll()
            await APIClient.shared.setAuthToken(nil)
        }

        // Réinitialiser l'état
        currentUser = nil
        currentActor = nil
        isAuthenticated = false
        loginError = nil
    }
}
