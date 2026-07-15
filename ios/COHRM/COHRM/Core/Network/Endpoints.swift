// Endpoints.swift
// COHRM Cameroun - Définition des endpoints API

import Foundation

/// Endpoints de l'API COHRM
enum Endpoints {

    // MARK: - Mobile

    /// Soumettre un signalement public
    /// POST /cohrm/mobile/report
    static let mobileReport = "/cohrm/mobile/report"

    /// Soumettre un signalement SMS
    /// POST /cohrm/mobile/sms
    static let mobileSMS = "/cohrm/mobile/sms"

    /// Synchroniser les données de référence
    /// GET /cohrm/mobile/sync
    static let mobileSync = "/cohrm/mobile/sync"

    /// Authentification mobile
    /// POST /cohrm/mobile/login
    static let mobileLogin = "/cohrm/mobile/login"

    // MARK: - SMS

    /// Décoder un SMS structuré
    /// POST /cohrm/decode-sms
    static let decodeSMS = "/cohrm/decode-sms"

    /// Récupérer les codes SMS actifs
    /// GET /cohrm/sms-codes
    static let smsCodes = "/cohrm/sms-codes"

    // MARK: - Régions

    /// Liste des régions avec départements
    /// GET /cohrm/regions
    static let regions = "/cohrm/regions"

    // MARK: - Dashboard

    /// Tableau de bord analytique mobile
    /// GET /cohrm/mobile/dashboard
    static let dashboard = "/cohrm/mobile/dashboard"

    // MARK: - Rumeurs

    /// Liste des rumeurs
    /// GET /cohrm/rumors
    static let rumors = "/cohrm/rumors"

    /// Détail d'une rumeur
    /// GET /cohrm/rumors/:id
    static func rumorDetail(_ id: Int) -> String { "/cohrm/rumors/\(id)" }

    /// Notes d'une rumeur
    /// GET/POST /cohrm/rumors/:id/notes
    static func rumorNotes(_ id: Int) -> String { "/cohrm/rumors/\(id)/notes" }

    /// Valider une rumeur
    /// POST /cohrm/rumors/:id/validate
    static func rumorValidate(_ id: Int) -> String { "/cohrm/rumors/\(id)/validate" }

    // MARK: - Scanner

    /// Lancer un scan
    /// POST /cohrm/scan/run
    static let scanRun = "/cohrm/scan/run"

    /// Historique des scans
    /// GET /cohrm/scan-history
    static let scanHistory = "/cohrm/scan-history"

    /// Détail d'un scan
    /// GET /cohrm/scan-history/:id
    static func scanDetail(_ id: Int) -> String { "/cohrm/scan-history/\(id)" }

    // MARK: - Notifications

    /// Mes notifications
    /// GET /cohrm/notifications/my
    static let myNotifications = "/cohrm/notifications/my"

    /// Marquer une notification comme lue
    /// PUT /cohrm/notifications/:id/read
    static func markNotificationRead(_ id: Int) -> String { "/cohrm/notifications/\(id)/read" }

    /// Marquer toutes les notifications comme lues
    /// PUT /cohrm/notifications/read-all
    static let markAllNotificationsRead = "/cohrm/notifications/read-all"

    // MARK: - Public (sans authentification)

    /// Soumettre un signalement public
    /// POST /cohrm/public/report
    static let publicReport = "/cohrm/public/report"

    /// Suivre un signalement public par code
    /// GET /cohrm/public/track/:code
    static func publicTrack(_ code: String) -> String { "/cohrm/public/track/\(code)" }

    /// Liste des régions publiques
    /// GET /cohrm/public/regions
    static let publicRegions = "/cohrm/public/regions"

    // MARK: - Reports

    /// Résumé des signalements
    /// GET /cohrm/reports/summary
    static let reportsSummary = "/cohrm/reports/summary"

    // MARK: - Scanner Config

    /// Configuration du scanner
    /// GET /cohrm/scanner/config
    static let scannerConfig = "/cohrm/scanner/config"
}
