// APIService.swift
// COHRM Cameroun - Service API haut niveau

import Foundation
import UIKit

/// Service API de haut niveau pour les opérations COHRM
actor APIService {

    static let shared = APIService()
    private let client = APIClient.shared

    private init() {}

    // MARK: - Signalement

    /// Soumet un signalement au serveur
    /// - Parameters:
    ///   - report: Données du signalement
    ///   - photos: Images à uploader
    /// - Returns: Réponse du serveur avec l'ID du signalement créé
    func submitReport(_ report: ReportData, photos: [UIImage] = []) async throws -> APIResponse<ReportCreatedDTO> {
        if photos.isEmpty {
            // Envoi simple JSON
            return try await client.post(
                Endpoints.mobileReport,
                body: report.toAPIPayload(),
                responseType: APIResponse<ReportCreatedDTO>.self
            )
        } else {
            // Envoi multipart avec photos
            var fields: [String: String] = [:]
            for (key, value) in report.toAPIPayload() {
                fields[key] = "\(value)"
            }

            let files = photos.enumerated().compactMap { index, image -> (name: String, filename: String, data: Data, mimeType: String)? in
                guard let data = image.compressed() else { return nil }
                return (
                    name: "photos",
                    filename: "photo_\(index).jpg",
                    data: data,
                    mimeType: "image/jpeg"
                )
            }

            return try await client.uploadMultipart(
                Endpoints.mobileReport,
                fields: fields,
                files: files,
                responseType: APIResponse<ReportCreatedDTO>.self
            )
        }
    }

    // MARK: - SMS

    /// Décode un message SMS structuré
    func decodeSMS(text: String, senderPhone: String) async throws -> APIResponse<SMSDecodedDTO> {
        return try await client.post(
            Endpoints.decodeSMS,
            body: [
                "sms_text": text,
                "sender_phone": senderPhone,
            ],
            responseType: APIResponse<SMSDecodedDTO>.self
        )
    }

    // MARK: - Synchronisation

    /// Synchronise les données de référence depuis le serveur
    func syncReferenceData() async throws -> APIResponse<SyncDataDTO> {
        return try await client.get(
            Endpoints.mobileSync,
            responseType: APIResponse<SyncDataDTO>.self
        )
    }

    /// Récupère les codes SMS actifs
    func getSMSCodes() async throws -> APIResponse<[SMSCodeDTO]> {
        return try await client.get(
            Endpoints.smsCodes,
            responseType: APIResponse<[SMSCodeDTO]>.self
        )
    }

    // MARK: - Dashboard

    /// Récupère les données du tableau de bord
    func getDashboard(region: String? = nil) async throws -> APIResponse<DashboardData> {
        var params: [String: String] = [:]
        if let region = region { params["region"] = region }
        return try await client.get(
            Endpoints.dashboard,
            queryParams: params,
            responseType: APIResponse<DashboardData>.self
        )
    }

    // MARK: - Rumeurs

    /// Liste les rumeurs avec filtres
    func getRumors(page: Int = 1, limit: Int = 20, status: String? = nil, search: String? = nil) async throws -> APIResponse<[RumorSummary]> {
        var params: [String: String] = ["page": "\(page)", "limit": "\(limit)"]
        if let status = status { params["status"] = status }
        if let search = search { params["search"] = search }
        return try await client.get(
            Endpoints.rumors,
            queryParams: params,
            responseType: APIResponse<[RumorSummary]>.self
        )
    }

    /// Détail d'une rumeur
    func getRumorDetail(id: Int) async throws -> APIResponse<RumorDetail> {
        return try await client.get(
            Endpoints.rumorDetail(id),
            responseType: APIResponse<RumorDetail>.self
        )
    }

    /// Ajouter une note à une rumeur
    func addRumorNote(rumorId: Int, content: String, isPrivate: Bool = false) async throws -> APIResponse<EmptyDTO> {
        let body: [String: Any] = ["content": content, "is_private": isPrivate]
        return try await client.post(
            Endpoints.rumorNotes(rumorId),
            body: body,
            responseType: APIResponse<EmptyDTO>.self
        )
    }

    // MARK: - Scanner

    /// Lancer un nouveau scan
    func runScan(source: String?, keywords: [String]) async throws -> APIResponse<ScanRunDTO> {
        var body: [String: Any] = ["keywords": keywords]
        if let source = source { body["source"] = source }
        return try await client.post(
            Endpoints.scanRun,
            body: body,
            responseType: APIResponse<ScanRunDTO>.self
        )
    }

    /// Historique des scans
    func getScanHistory(page: Int = 1, limit: Int = 20) async throws -> APIResponse<[ScanItemDTO]> {
        return try await client.get(
            Endpoints.scanHistory,
            queryParams: ["page": "\(page)", "limit": "\(limit)"],
            responseType: APIResponse<[ScanItemDTO]>.self
        )
    }

    /// Détail d'un scan
    func getScanDetail(id: Int) async throws -> APIResponse<ScanDetailDTO> {
        return try await client.get(
            Endpoints.scanDetail(id),
            responseType: APIResponse<ScanDetailDTO>.self
        )
    }

    // MARK: - Notifications

    /// Mes notifications
    func getMyNotifications(page: Int = 1) async throws -> APIResponse<[NotificationDTO]> {
        return try await client.get(
            Endpoints.myNotifications,
            queryParams: ["page": "\(page)", "limit": "20"],
            responseType: APIResponse<[NotificationDTO]>.self
        )
    }

    // MARK: - Authentification

    /// Connexion mobile
    func login(email: String, password: String) async throws -> APIResponse<LoginUser> {
        return try await client.post(
            Endpoints.mobileLogin,
            body: ["email": email, "password": password],
            responseType: APIResponse<LoginUser>.self
        )
    }

    // MARK: - Signalement public (sans authentification)

    /// Soumet un signalement public
    func submitPublicReport(_ request: PublicReportRequest) async throws -> PublicReportResponse {
        return try await client.postEncodable(
            Endpoints.publicReport,
            body: request,
            responseType: PublicReportResponse.self
        )
    }

    /// Suit un signalement public par code de suivi
    func trackPublicReport(code: String) async throws -> TrackingResponse {
        return try await client.get(
            Endpoints.publicTrack(code),
            responseType: TrackingResponse.self
        )
    }

    /// Récupère la liste des régions publiques
    func getPublicRegions() async throws -> RegionsResponse {
        return try await client.get(
            Endpoints.publicRegions,
            responseType: RegionsResponse.self
        )
    }

    // MARK: - Actions notifications

    /// Marque une notification comme lue
    func markNotificationRead(id: Int) async throws -> APIResponse<EmptyDTO> {
        return try await client.put(
            Endpoints.markNotificationRead(id),
            responseType: APIResponse<EmptyDTO>.self
        )
    }

    /// Marque toutes les notifications comme lues
    func markAllNotificationsRead() async throws -> APIResponse<EmptyDTO> {
        return try await client.put(
            Endpoints.markAllNotificationsRead,
            responseType: APIResponse<EmptyDTO>.self
        )
    }
}

// MARK: - DTOs

struct ReportCreatedDTO: Decodable {
    let id: Int?
    let code: String?
}

struct SMSDecodedDTO: Decodable {
    let category: String?
    let species: String?
    let symptoms: [String]?
    let region: String?
    let description: String?
}

struct SyncDataDTO: Decodable {
    let regions: [RegionDTO]?
    let smsCodes: [SMSCodeDTO]?
    let lastUpdate: String?
}

struct RegionDTO: Decodable {
    let code: String
    let name: String
    let departments: [String]?
}

struct SMSCodeDTO: Decodable, Identifiable {
    let id: Int
    let code: String
    let labelFr: String?
    let labelEn: String?
    let category: String?

    enum CodingKeys: String, CodingKey {
        case id, code, category
        case labelFr = "label_fr"
        case labelEn = "label_en"
    }
}
