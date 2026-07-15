// Report.swift
// COHRM Cameroun - Modèle de signalement (DTO)

import Foundation
import CoreLocation

/// Données d'un signalement avant envoi au serveur
/// Utilisé comme DTO entre les vues et le service API
struct ReportData: Codable {

    // MARK: - Étape 1 : Type d'événement

    var category: String = ""
    var species: String = ""

    // MARK: - Étape 2 : Localisation

    var latitude: Double?
    var longitude: Double?
    var region: String = ""
    var department: String = ""
    var district: String = ""
    var locality: String = ""
    var locationDescription: String = ""

    // MARK: - Étape 3 : Détails

    var title: String = ""
    var description: String = ""
    var symptoms: [String] = []
    var affectedCount: Int?
    var dateStarted: Date?
    var source: String = "mobile"

    // MARK: - Étape 4 : Informations personnelles

    var isAnonymous: Bool = true
    var reporterName: String = ""
    var reporterPhone: String = ""
    var reporterEmail: String = ""

    // MARK: - Étape 5 : Photos

    var photoFileNames: [String] = []

    // MARK: - Métadonnées

    var deviceId: String = ""
    var appVersion: String = ""
    var submittedAt: Date?

    // MARK: - Conversion API

    /// Convertit en dictionnaire pour l'envoi API
    func toAPIPayload() -> [String: Any] {
        var payload: [String: Any] = [
            "category": category,
            "source": source,
            "title": title,
            "description": description,
            "region": region,
        ]

        if !species.isEmpty { payload["species"] = species }
        if let lat = latitude { payload["latitude"] = lat }
        if let lng = longitude { payload["longitude"] = lng }
        if !department.isEmpty { payload["department"] = department }
        if !district.isEmpty { payload["district"] = district }
        if !locality.isEmpty { payload["location"] = locality }
        if !locationDescription.isEmpty { payload["location_details"] = locationDescription }
        if !symptoms.isEmpty { payload["symptoms"] = symptoms.joined(separator: ",") }
        if let count = affectedCount { payload["affected_count"] = count }
        if let date = dateStarted {
            let formatter = ISO8601DateFormatter()
            payload["date_started"] = formatter.string(from: date)
        }
        if !isAnonymous {
            payload["reporter_name"] = reporterName
            payload["reporter_phone"] = reporterPhone
            payload["reporter_email"] = reporterEmail
        }
        payload["is_anonymous"] = isAnonymous

        return payload
    }
}

/// Statut de synchronisation d'un signalement local
enum SyncStatus: String, Codable {
    case draft = "draft"
    case pending = "pending"
    case syncing = "syncing"
    case synced = "synced"
    case error = "error"

    var label: String {
        switch self {
        case .draft: String(localized: "status.draft")
        case .pending: String(localized: "status.pending")
        case .syncing: String(localized: "status.syncing")
        case .synced: String(localized: "status.synced")
        case .error: String(localized: "status.error")
        }
    }

    var icon: String {
        switch self {
        case .draft: "pencil.circle"
        case .pending: "clock.arrow.circlepath"
        case .syncing: "arrow.triangle.2.circlepath"
        case .synced: "checkmark.circle.fill"
        case .error: "exclamationmark.triangle.fill"
        }
    }

    var color: SwiftUI.Color {
        switch self {
        case .draft: AppColors.muted
        case .pending: AppColors.warning
        case .syncing: AppColors.info
        case .synced: AppColors.success
        case .error: AppColors.danger
        }
    }
}

/// Régions du Cameroun avec départements
struct CameroonRegion: Identifiable, Hashable {
    let id: String // code
    let name: String
    let departments: [String]

    /// Toutes les régions du Cameroun
    static let all: [CameroonRegion] = [
        CameroonRegion(id: "AD", name: "Adamaoua", departments: ["Djérem", "Faro-et-Déo", "Mayo-Banyo", "Mbéré", "Vina"]),
        CameroonRegion(id: "CE", name: "Centre", departments: ["Haute-Sanaga", "Lekié", "Mbam-et-Inoubou", "Mbam-et-Kim", "Méfou-et-Afamba", "Méfou-et-Akono", "Mfoundi", "Nyong-et-Kellé", "Nyong-et-Mfoumou", "Nyong-et-So'o"]),
        CameroonRegion(id: "ES", name: "Est", departments: ["Boumba-et-Ngoko", "Haut-Nyong", "Kadey", "Lom-et-Djérem"]),
        CameroonRegion(id: "EN", name: "Extrême-Nord", departments: ["Diamaré", "Logone-et-Chari", "Mayo-Danay", "Mayo-Kani", "Mayo-Sava", "Mayo-Tsanaga"]),
        CameroonRegion(id: "LT", name: "Littoral", departments: ["Moungo", "Nkam", "Sanaga-Maritime", "Wouri"]),
        CameroonRegion(id: "NO", name: "Nord", departments: ["Bénoué", "Faro", "Mayo-Louti", "Mayo-Rey"]),
        CameroonRegion(id: "NW", name: "Nord-Ouest", departments: ["Boyo", "Bui", "Donga-Mantung", "Menchum", "Mezam", "Momo", "Ngo-Ketunjia"]),
        CameroonRegion(id: "OU", name: "Ouest", departments: ["Bamboutos", "Haut-Nkam", "Hauts-Plateaux", "Koung-Khi", "Ménoua", "Mifi", "Ndé", "Noun"]),
        CameroonRegion(id: "SU", name: "Sud", departments: ["Dja-et-Lobo", "Mvila", "Océan", "Vallée-du-Ntem"]),
        CameroonRegion(id: "SW", name: "Sud-Ouest", departments: ["Fako", "Koupé-Manengouba", "Lebialem", "Manyu", "Meme", "Ndian"]),
    ]
}
