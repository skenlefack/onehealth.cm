// KeychainService.swift
// One Health Cameroon - Stockage sécurisé via Keychain natif

import Foundation
import Security

/// Service de stockage sécurisé utilisant le Keychain iOS natif
actor KeychainService {

    // MARK: - Singleton

    static let shared = KeychainService()
    private init() {}

    // MARK: - Constantes

    private let serviceName = "cm.onehealth.app"
    private let tokenKey = "authToken"
    private let userKey = "userData"
    private let actorKey = "actorData"

    // MARK: - Token

    /// Sauvegarde le JWT dans le Keychain
    func saveToken(_ token: String) throws {
        guard let data = token.data(using: .utf8) else { return }
        try save(data: data, forKey: tokenKey)
    }

    /// Récupère le JWT depuis le Keychain
    func getToken() -> String? {
        guard let data = getData(forKey: tokenKey) else { return nil }
        return String(data: data, encoding: .utf8)
    }

    /// Supprime le JWT du Keychain
    func deleteToken() {
        delete(forKey: tokenKey)
    }

    // MARK: - User Data

    /// Sauvegarde les données utilisateur
    func saveUser(_ user: LoginUser) throws {
        let data = try JSONEncoder().encode(user)
        try save(data: data, forKey: userKey)
    }

    /// Récupère les données utilisateur
    func getUser() -> LoginUser? {
        guard let data = getData(forKey: userKey) else { return nil }
        return try? JSONDecoder().decode(LoginUser.self, from: data)
    }

    /// Sauvegarde les données acteur
    func saveActor(_ actor: LoginActor) throws {
        let data = try JSONEncoder().encode(actor)
        try save(data: data, forKey: actorKey)
    }

    /// Récupère les données acteur
    func getActor() -> LoginActor? {
        guard let data = getData(forKey: actorKey) else { return nil }
        return try? JSONDecoder().decode(LoginActor.self, from: data)
    }

    /// Supprime toutes les données de session
    func clearAll() {
        delete(forKey: tokenKey)
        delete(forKey: userKey)
        delete(forKey: actorKey)
    }

    // MARK: - Keychain primitives

    private func save(data: Data, forKey key: String) throws {
        // Supprimer l'entrée existante d'abord
        delete(forKey: key)

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock,
        ]

        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw KeychainError.saveFailed(status)
        }
    }

    private func getData(forKey key: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess else { return nil }
        return result as? Data
    }

    private func delete(forKey key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key,
        ]
        SecItemDelete(query as CFDictionary)
    }
}

// MARK: - Erreurs

enum KeychainError: LocalizedError {
    case saveFailed(OSStatus)

    var errorDescription: String? {
        switch self {
        case .saveFailed(let status):
            "Keychain save failed with status: \(status)"
        }
    }
}
