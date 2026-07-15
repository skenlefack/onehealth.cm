// RemoteModels.swift
// COHRM Cameroun - Modèles de données distants (DTOs API)

import Foundation

// MARK: - Dashboard

/// Données du tableau de bord analytique
struct DashboardData: Codable {
    let total: Int?
    let pending: Int?
    let investigating: Int?
    let confirmed: Int?
    let falseAlarm: Int?
    let closed: Int?
    let highPriority: Int?
    let critical: Int?
    let todayCount: Int?
    let weekCount: Int?
    let monthCount: Int?
    let byRegion: [ChartItem]?
    let byCategory: [ChartItem]?
    let byStatus: [ChartItem]?
    let bySource: [ChartItem]?
    let byPriority: [ChartItem]?
    let byRiskLevel: [ChartItem]?
    let trends: [TrendItem]?
    let recentRumors: [RumorSummary]?

    enum CodingKeys: String, CodingKey {
        case total, pending, investigating, confirmed, closed
        case falseAlarm = "false_alarm"
        case highPriority = "high_priority"
        case critical
        case todayCount = "today_count"
        case weekCount = "week_count"
        case monthCount = "month_count"
        case byRegion, byCategory, byStatus, bySource, byPriority, byRiskLevel
        case trends, recentRumors
    }
}

/// Élément de graphique (région, catégorie, etc.)
struct ChartItem: Codable, Identifiable {
    var id: String { "\(name)-\(count)" }
    let name: String
    let count: Int
    let key: String?
    let color: String?

    enum CodingKeys: String, CodingKey {
        case name, count, key, color
    }

    init(name: String, count: Int, key: String? = nil, color: String? = nil) {
        self.name = name
        self.count = count
        self.key = key
        self.color = color
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        name = (try? c.decode(String.self, forKey: .name)) ?? ""
        count = (try? c.decode(Int.self, forKey: .count)) ?? 0
        key = try? c.decode(String.self, forKey: .key)
        color = try? c.decode(String.self, forKey: .color)
    }
}

/// Élément de tendance temporelle
struct TrendItem: Codable, Identifiable {
    var id: String { date }
    let date: String
    let count: Int
}

// MARK: - Rumeurs

/// Résumé d'une rumeur (liste)
struct RumorSummary: Codable, Identifiable {
    let id: Int
    let code: String?
    let title: String?
    let category: String?
    let status: String?
    let priority: String?
    let region: String?
    let riskLevel: String?
    let source: String?
    let reporterName: String?
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, code, title, category, status, priority, region, source
        case riskLevel = "risk_level"
        case reporterName = "reporter_name"
        case createdAt = "created_at"
    }
}

/// Détail complet d'une rumeur
struct RumorDetail: Codable {
    let id: Int
    let code: String?
    let title: String?
    let description: String?
    let category: String?
    let status: String?
    let priority: String?
    let region: String?
    let department: String?
    let location: String?
    let latitude: Double?
    let longitude: Double?
    let species: String?
    let symptoms: String?
    let affectedCount: Int?
    let deathsCount: Int?
    let riskLevel: String?
    let riskDescription: String?
    let source: String?
    let reporterName: String?
    let reporterPhone: String?
    let createdAt: String?
    let updatedAt: String?
    let validations: [ValidationItem]?
    let notes: [NoteItem]?
    let photos: [PhotoItem]?

    enum CodingKeys: String, CodingKey {
        case id, code, title, description, category, status, priority
        case region, department, location, latitude, longitude
        case species, symptoms, source
        case affectedCount = "affected_count"
        case deathsCount = "deaths_count"
        case riskLevel = "risk_level"
        case riskDescription = "risk_description"
        case reporterName = "reporter_name"
        case reporterPhone = "reporter_phone"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case validations, notes, photos
    }
}

/// Élément de validation d'une rumeur
struct ValidationItem: Codable, Identifiable {
    var id: String { "\(actorName ?? "")-\(createdAt ?? "")" }
    let actionType: String?
    let status: String?
    let level: Int?
    let notes: String?
    let actorName: String?
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case actionType = "action_type"
        case status, level, notes
        case actorName = "actor_name"
        case createdAt = "created_at"
    }
}

/// Note attachée à une rumeur
struct NoteItem: Codable, Identifiable {
    let id: Int
    let content: String?
    let isPrivate: Bool?
    let authorName: String?
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, content
        case isPrivate = "is_private"
        case authorName = "author_name"
        case createdAt = "created_at"
    }
}

/// Photo attachée à une rumeur
struct PhotoItem: Codable, Identifiable {
    let id: Int
    let filePath: String?
    let caption: String?

    enum CodingKeys: String, CodingKey {
        case id
        case filePath = "file_path"
        case caption
    }
}

// MARK: - Risk Assessment

/// Requete d'evaluation du risque
struct RiskAssessmentRequest: Codable {
    let riskLevel: String
    let riskDescription: String?
    let riskContext: String?
    let riskExposure: String?

    enum CodingKeys: String, CodingKey {
        case riskLevel = "risk_level"
        case riskDescription = "risk_description"
        case riskContext = "risk_context"
        case riskExposure = "risk_exposure"
    }
}

// MARK: - Validation Workflow

/// Reponse contenant l'historique des validations
struct ValidationsResponse: Codable {
    let success: Bool
    let data: [ValidationHistoryItem]?
}

/// Element d'historique de validation detaille
struct ValidationHistoryItem: Codable, Identifiable {
    let id: Int
    let level: Int?
    let actionType: String?
    let status: String?
    let notes: String?
    let rejectionReason: String?
    let validatedAt: String?
    let userName: String?

    enum CodingKeys: String, CodingKey {
        case id, level, status, notes
        case actionType = "action_type"
        case rejectionReason = "rejection_reason"
        case validatedAt = "validated_at"
        case userName = "user_name"
    }
}

/// Requete de validation d'une rumeur
struct ValidationRequest: Codable {
    let actionType: String
    let status: String
    let notes: String?
    let rejectionReason: String?

    enum CodingKeys: String, CodingKey {
        case actionType = "action_type"
        case status, notes
        case rejectionReason = "rejection_reason"
    }
}

// MARK: - Scanner Results

/// Resultat individuel du scanner (pour la liste globale)
struct ScannerResultItem: Codable, Identifiable {
    let id: Int
    let title: String?
    let content: String?
    let url: String?
    let source: String?
    let relevanceScore: Double?
    let status: String?
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, title, content, url, source, status
        case relevanceScore = "relevance_score"
        case createdAt = "created_at"
    }
}

// MARK: - Scanner

/// Résultat de lancement d'un scan
struct ScanRunDTO: Codable {
    let scanId: Int?
    enum CodingKeys: String, CodingKey {
        case scanId = "scan_id"
    }
}

/// Élément d'historique de scan
struct ScanItemDTO: Codable, Identifiable {
    let id: Int
    let source: String?
    let keywords: String?
    let status: String?
    let resultsCount: Int?
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, source, keywords, status
        case resultsCount = "results_count"
        case createdAt = "created_at"
    }
}

/// Détail d'un scan avec résultats
struct ScanDetailDTO: Codable {
    let id: Int
    let source: String?
    let keywords: String?
    let status: String?
    let results: [ScanResultDTO]?
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, source, keywords, status, results
        case createdAt = "created_at"
    }
}

/// Résultat individuel d'un scan
struct ScanResultDTO: Codable, Identifiable {
    let id: Int
    let title: String?
    let url: String?
    let snippet: String?
    let source: String?
    let matchedKeywords: String?
    let relevanceScore: Double?
    let isRumor: Bool?
    let rumorId: Int?

    enum CodingKeys: String, CodingKey {
        case id, title, url, snippet, source
        case matchedKeywords = "matched_keywords"
        case relevanceScore = "relevance_score"
        case isRumor = "is_rumor"
        case rumorId = "rumor_id"
    }
}

// MARK: - Notifications

/// Notification utilisateur
struct NotificationDTO: Codable, Identifiable {
    let id: Int
    let notificationType: String?
    let channel: String?
    let recipientEmail: String?
    let subject: String?
    let status: String?
    let rumorId: Int?
    let rumorCode: String?
    let rumorTitle: String?
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id
        case notificationType = "notification_type"
        case channel
        case recipientEmail = "recipient_email"
        case subject, status
        case rumorId = "rumor_id"
        case rumorCode = "rumor_code"
        case rumorTitle = "rumor_title"
        case createdAt = "created_at"
    }
}

// MARK: - Pagination

/// Informations de pagination pour les listes paginées
struct PaginationInfo: Codable {
    let page: Int
    let limit: Int
    let total: Int
    let pages: Int
}

// MARK: - Authentification

/// Utilisateur connecté
struct LoginUser: Codable {
    let id: Int
    let username: String?
    let email: String?
    let firstName: String?
    let lastName: String?
    let role: String?
    let actorLevel: Int?
    let actorRegion: String?

    enum CodingKeys: String, CodingKey {
        case id, username, email
        case firstName = "first_name"
        case lastName = "last_name"
        case role
        case actorLevel = "actor_level"
        case actorRegion = "actor_region"
    }

    /// Nom complet de l'utilisateur
    var fullName: String {
        [firstName, lastName].compactMap { $0 }.joined(separator: " ")
    }
}

// MARK: - Réponse vide

/// DTO pour les réponses sans données
struct EmptyDTO: Codable {}

// MARK: - Signalement public

/// Requête de signalement public (sans authentification)
struct PublicReportRequest: Codable {
    var reporterName: String?
    var reporterPhone: String
    var reporterType: String?
    var region: String?
    var department: String?
    var location: String?
    var description: String
    var category: String?
    var species: String?
    var affectedCount: Int?
    var deadCount: Int?
    var latitude: Double?
    var longitude: Double?

    enum CodingKeys: String, CodingKey {
        case reporterName = "reporter_name"
        case reporterPhone = "reporter_phone"
        case reporterType = "reporter_type"
        case region, department, location, description, category, species
        case affectedCount = "affected_count"
        case deadCount = "dead_count"
        case latitude, longitude
    }
}

/// Réponse de soumission d'un signalement public
struct PublicReportResponse: Codable {
    let success: Bool
    let code: String?
    let message: String?
}

/// Réponse de suivi d'un signalement
struct TrackingResponse: Codable {
    let success: Bool
    let data: TrackingData?
    let message: String?
}

/// Données de suivi d'un signalement
struct TrackingData: Codable {
    let code: String
    let status: String
    let priority: String
    let createdAt: String?
    let updatedAt: String?

    enum CodingKeys: String, CodingKey {
        case code, status, priority
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

/// Région avec code et nom
struct RegionItem: Codable, Identifiable {
    let code: String
    let name: String
    var id: String { code }
}

/// Réponse liste des régions publiques
struct RegionsResponse: Codable {
    let success: Bool
    let data: [RegionItem]?
}

// MARK: - Photos (endpoint dédié)

/// Réponse pour les photos d'une rumeur
struct PhotosResponse: Codable {
    let success: Bool
    let data: [RumorPhoto]?
}

/// Photo de rumeur (endpoint dédié)
struct RumorPhoto: Codable, Identifiable {
    let id: Int
    let url: String?
    let filePath: String?
    let caption: String?
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, url, caption
        case filePath = "file_path"
        case createdAt = "created_at"
    }

    /// URL résolue pour l'affichage
    var resolvedURL: URL? {
        if let url = url, url.hasPrefix("http") { return URL(string: url) }
        if let path = filePath ?? url {
            let base = UserDefaults.standard.string(forKey: "serverURL") ?? "https://onehealth.cm/api"
            return URL(string: "\(base)/uploads/\(path)")
        }
        return nil
    }
}

// MARK: - Feedback

/// Réponse pour les feedbacks d'une rumeur
struct FeedbackResponse: Codable {
    let success: Bool
    let data: [FeedbackItem]?
}

/// Element de feedback
struct FeedbackItem: Codable, Identifiable {
    let id: Int
    let feedbackType: String?
    let message: String?
    let channel: String?
    let status: String?
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, message, channel, status
        case feedbackType = "feedback_type"
        case createdAt = "created_at"
    }
}

// MARK: - Profil

/// Requête de mise a jour du profil
struct ProfileUpdateRequest: Codable {
    let firstName: String?
    let lastName: String?
    let phone: String?

    enum CodingKeys: String, CodingKey {
        case firstName = "first_name"
        case lastName = "last_name"
        case phone
    }
}

/// Requête de changement de mot de passe
struct ChangePasswordRequest: Codable {
    let currentPassword: String
    let newPassword: String

    enum CodingKeys: String, CodingKey {
        case currentPassword = "current_password"
        case newPassword = "new_password"
    }
}

// MARK: - Reports

/// Réponse du résumé des rapports
struct ReportSummaryResponse: Codable {
    let success: Bool
    let data: ReportSummaryData?
}

/// Données de résumé des rapports
struct ReportSummaryData: Codable {
    let totals: SummaryTotals?
    let byStatus: [StatusCount]?
    let byRegion: [RegionCount]?
    let bySource: [SourceCount]?
    let avgResolutionHours: Int?

    enum CodingKeys: String, CodingKey {
        case totals
        case byStatus = "by_status"
        case byRegion = "by_region"
        case bySource = "by_source"
        case avgResolutionHours = "avg_resolution_hours"
    }
}

/// Totaux du résumé
struct SummaryTotals: Codable {
    let total: Int?
    let pending: Int?
    let confirmed: Int?
    let closed: Int?
    let highRisk: Int?

    enum CodingKeys: String, CodingKey {
        case total, pending, confirmed, closed
        case highRisk = "high_risk"
    }
}

/// Comptage par statut
struct StatusCount: Codable, Identifiable {
    var id: String { status ?? UUID().uuidString }
    let status: String?
    let count: Int?
}

/// Comptage par région
struct RegionCount: Codable, Identifiable {
    var id: String { region ?? UUID().uuidString }
    let region: String?
    let count: Int?
}

/// Comptage par source
struct SourceCount: Codable, Identifiable {
    var id: String { source ?? UUID().uuidString }
    let source: String?
    let count: Int?
}
