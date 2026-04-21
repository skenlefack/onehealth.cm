// CohrmAPIService.swift
// COHRM Cameroun - Service API specialise pour les operations COHRM avancees
//
// Fournit un acces type-safe aux endpoints COHRM avec support
// des filtres avances, de la pagination et de l'authentification.
// Delegue les appels reseau a APIClient.shared.

import Foundation
import UIKit

/// Service API specialise pour les operations COHRM avancees.
/// Complement de APIService pour les fonctionnalites du tableau de bord,
/// la gestion des rumeurs, le scanner et les notifications.
actor CohrmAPIService {

    // MARK: - Singleton

    static let shared = CohrmAPIService()
    private let client = APIClient.shared

    private init() {}

    // MARK: - Authentification

    /// Authentifie un utilisateur via le endpoint mobile
    /// - Parameters:
    ///   - email: Adresse email
    ///   - password: Mot de passe
    /// - Returns: Reponse contenant le token et les informations utilisateur
    func login(email: String, password: String) async throws -> APIResponse<LoginUser> {
        return try await client.post(
            Endpoints.mobileLogin,
            body: [
                "email": email,
                "password": password
            ],
            responseType: APIResponse<LoginUser>.self
        )
    }

    // MARK: - Dashboard

    /// Recupere les donnees completes du tableau de bord
    /// - Parameter region: Filtre optionnel par region
    /// - Returns: Donnees du tableau de bord (stats, graphiques, tendances, rumeurs recentes)
    func getDashboard(region: String? = nil) async throws -> APIResponse<DashboardData> {
        var params: [String: String] = [:]
        if let region = region, !region.isEmpty {
            params["region"] = region
        }
        return try await client.get(
            Endpoints.dashboard,
            queryParams: params,
            responseType: APIResponse<DashboardData>.self
        )
    }

    // MARK: - Rumeurs

    /// Recupere la liste des rumeurs avec filtres et pagination
    /// - Parameters:
    ///   - page: Numero de page (commence a 1)
    ///   - limit: Nombre d'elements par page
    ///   - status: Filtre par statut (pending, investigating, confirmed, closed, false_alarm)
    ///   - priority: Filtre par priorite (low, medium, high, critical)
    ///   - search: Recherche textuelle libre
    ///   - region: Filtre par region
    /// - Returns: Liste paginee de rumeurs
    func getRumors(
        page: Int = 1,
        limit: Int = 20,
        status: String? = nil,
        priority: String? = nil,
        search: String? = nil,
        region: String? = nil
    ) async throws -> APIResponse<[RumorSummary]> {
        var params: [String: String] = [
            "page": "\(page)",
            "limit": "\(limit)"
        ]
        if let status = status, !status.isEmpty { params["status"] = status }
        if let priority = priority, !priority.isEmpty { params["priority"] = priority }
        if let search = search, !search.isEmpty { params["search"] = search }
        if let region = region, !region.isEmpty { params["region"] = region }

        return try await client.get(
            Endpoints.rumors,
            queryParams: params,
            responseType: APIResponse<[RumorSummary]>.self
        )
    }

    /// Recupere le detail complet d'une rumeur
    /// - Parameter id: Identifiant de la rumeur
    /// - Returns: Detail de la rumeur avec validations, notes et photos
    func getRumorDetail(id: Int) async throws -> APIResponse<RumorDetail> {
        return try await client.get(
            Endpoints.rumorDetail(id),
            responseType: APIResponse<RumorDetail>.self
        )
    }

    /// Ajoute une note a une rumeur
    /// - Parameters:
    ///   - rumorId: Identifiant de la rumeur
    ///   - content: Contenu de la note
    ///   - isPrivate: Si la note est privee (visible uniquement par l'auteur et les admins)
    /// - Returns: Reponse de confirmation
    func addNote(rumorId: Int, content: String, isPrivate: Bool = false) async throws -> APIResponse<EmptyDTO> {
        return try await client.post(
            Endpoints.rumorNotes(rumorId),
            body: [
                "content": content,
                "is_private": isPrivate
            ],
            responseType: APIResponse<EmptyDTO>.self
        )
    }

    /// Valide une rumeur a un niveau donne
    /// - Parameters:
    ///   - rumorId: Identifiant de la rumeur
    ///   - actionType: Type d'action (approve, reject, escalate, investigate)
    ///   - notes: Notes de validation optionnelles
    /// - Returns: Reponse de confirmation
    func validateRumor(rumorId: Int, actionType: String, notes: String? = nil) async throws -> APIResponse<EmptyDTO> {
        var body: [String: Any] = ["action_type": actionType]
        if let notes = notes, !notes.isEmpty {
            body["notes"] = notes
        }
        return try await client.post(
            Endpoints.rumorValidate(rumorId),
            body: body,
            responseType: APIResponse<EmptyDTO>.self
        )
    }

    // MARK: - Scanner

    /// Lance un nouveau scan de surveillance
    /// - Parameters:
    ///   - source: Source a scanner (web, social, news, all)
    ///   - keywords: Mots-cles de recherche separes par des virgules
    /// - Returns: Reponse contenant l'identifiant du scan lance
    func runScan(source: String? = nil, keywords: String? = nil) async throws -> APIResponse<ScanRunDTO> {
        var body: [String: Any] = [:]
        if let source = source, !source.isEmpty { body["source"] = source }
        if let keywords = keywords, !keywords.isEmpty { body["keywords"] = keywords }
        return try await client.post(
            Endpoints.scanRun,
            body: body,
            responseType: APIResponse<ScanRunDTO>.self
        )
    }

    /// Recupere l'historique des scans avec pagination
    /// - Parameters:
    ///   - page: Numero de page
    ///   - limit: Nombre d'elements par page
    /// - Returns: Liste paginee de scans
    func getScanHistory(page: Int = 1, limit: Int = 20) async throws -> APIResponse<[ScanItemDTO]> {
        return try await client.get(
            Endpoints.scanHistory,
            queryParams: [
                "page": "\(page)",
                "limit": "\(limit)"
            ],
            responseType: APIResponse<[ScanItemDTO]>.self
        )
    }

    /// Recupere le detail d'un scan avec ses resultats
    /// - Parameter id: Identifiant du scan
    /// - Returns: Detail du scan avec la liste des resultats
    func getScanDetail(id: Int) async throws -> APIResponse<ScanDetailDTO> {
        return try await client.get(
            Endpoints.scanDetail(id),
            responseType: APIResponse<ScanDetailDTO>.self
        )
    }

    // MARK: - Notifications

    /// Recupere les notifications de l'utilisateur connecte
    /// - Parameters:
    ///   - page: Numero de page
    ///   - limit: Nombre d'elements par page
    /// - Returns: Liste paginee de notifications
    func getMyNotifications(page: Int = 1, limit: Int = 20) async throws -> APIResponse<[NotificationDTO]> {
        return try await client.get(
            Endpoints.myNotifications,
            queryParams: [
                "page": "\(page)",
                "limit": "\(limit)"
            ],
            responseType: APIResponse<[NotificationDTO]>.self
        )
    }
}
