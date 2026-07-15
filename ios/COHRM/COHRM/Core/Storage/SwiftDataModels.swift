// SwiftDataModels.swift
// COHRM Cameroun - Modèles SwiftData pour la persistance locale

import Foundation
import SwiftData

/// Signalement persisté localement (mode hors-ligne)
@Model
final class ReportModel {

    // MARK: - Identifiant

    /// Identifiant unique local
    var id: UUID

    /// Identifiant serveur (après synchronisation)
    var serverId: Int?

    // MARK: - Étape 1 : Type

    var category: String
    var species: String

    // MARK: - Étape 2 : Localisation

    var latitude: Double?
    var longitude: Double?
    var region: String
    var department: String
    var district: String
    var locality: String
    var locationDescription: String

    // MARK: - Étape 3 : Détails

    var title: String
    var reportDescription: String
    var symptoms: String // séparés par des virgules
    var affectedCount: Int?
    var dateStarted: Date?
    var source: String

    // MARK: - Étape 4 : Informations personnelles

    var isAnonymous: Bool
    var reporterName: String
    var reporterPhone: String
    var reporterEmail: String

    // MARK: - Synchronisation

    var syncStatusRaw: String
    var syncError: String?
    var syncAttempts: Int

    // MARK: - Métadonnées

    var createdAt: Date
    var updatedAt: Date
    var deviceId: String

    // MARK: - Relations

    @Relationship(deleteRule: .cascade)
    var photos: [PhotoAttachment]

    // MARK: - Computed

    var syncStatus: SyncStatus {
        get { SyncStatus(rawValue: syncStatusRaw) ?? .draft }
        set { syncStatusRaw = newValue.rawValue }
    }

    var symptomsList: [String] {
        symptoms.split(separator: ",").map(String.init).filter { !$0.isEmpty }
    }

    var eventCategory: EventCategory? {
        EventCategory(rawValue: category)
    }

    // MARK: - Initialisation

    init(from data: ReportData) {
        self.id = UUID()
        self.category = data.category
        self.species = data.species
        self.latitude = data.latitude
        self.longitude = data.longitude
        self.region = data.region
        self.department = data.department
        self.district = data.district
        self.locality = data.locality
        self.locationDescription = data.locationDescription
        self.title = data.title
        self.reportDescription = data.description
        self.symptoms = data.symptoms.joined(separator: ",")
        self.affectedCount = data.affectedCount
        self.dateStarted = data.dateStarted
        self.source = data.source
        self.isAnonymous = data.isAnonymous
        self.reporterName = data.reporterName
        self.reporterPhone = data.reporterPhone
        self.reporterEmail = data.reporterEmail
        self.syncStatusRaw = SyncStatus.pending.rawValue
        self.syncAttempts = 0
        self.createdAt = Date()
        self.updatedAt = Date()
        self.deviceId = DeviceHelper.deviceId
        self.photos = []
    }

    /// Convertit en ReportData pour l'envoi API
    func toReportData() -> ReportData {
        var data = ReportData()
        data.category = category
        data.species = species
        data.latitude = latitude
        data.longitude = longitude
        data.region = region
        data.department = department
        data.district = district
        data.locality = locality
        data.locationDescription = locationDescription
        data.title = title
        data.description = reportDescription
        data.symptoms = symptomsList
        data.affectedCount = affectedCount
        data.dateStarted = dateStarted
        data.source = source
        data.isAnonymous = isAnonymous
        data.reporterName = reporterName
        data.reporterPhone = reporterPhone
        data.reporterEmail = reporterEmail
        data.deviceId = deviceId
        data.appVersion = Bundle.main.appVersion
        return data
    }
}

/// Photo attachée à un signalement
@Model
final class PhotoAttachment {

    var id: UUID
    var fileName: String
    var fileSize: Int
    var mimeType: String
    var localPath: String
    var isUploaded: Bool
    var createdAt: Date

    @Relationship(inverse: \ReportModel.photos)
    var report: ReportModel?

    init(fileName: String, fileSize: Int, localPath: String) {
        self.id = UUID()
        self.fileName = fileName
        self.fileSize = fileSize
        self.mimeType = "image/jpeg"
        self.localPath = localPath
        self.isUploaded = false
        self.createdAt = Date()
    }

    /// Chemin complet du fichier dans le répertoire documents
    var fullPath: URL {
        let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        return documentsURL.appendingPathComponent(localPath)
    }
}

/// Données de référence synchronisées depuis le serveur
@Model
final class ReferenceData {

    var id: UUID
    var key: String
    var value: String // JSON sérialisé
    var lastSyncedAt: Date

    init(key: String, value: String) {
        self.id = UUID()
        self.key = key
        self.value = value
        self.lastSyncedAt = Date()
    }
}
