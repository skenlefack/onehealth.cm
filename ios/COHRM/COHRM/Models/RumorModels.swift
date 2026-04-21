// RumorModels.swift
// COHRM Cameroun - Extensions et helpers pour les modeles de rumeurs
//
// Les types principaux (RumorSummary, RumorDetail, ValidationItem, NoteItem,
// PhotoItem, ScanRunDTO, ScanItemDTO, ScanDetailDTO, ScanResultDTO,
// NotificationDTO, EmptyDTO) sont definis dans RemoteModels.swift.
// Ce fichier fournit des extensions de commodite et des wrappers de reponse.

import Foundation
import SwiftUI

// MARK: - Wrappers de reponse paginee

/// Reponse paginee pour la liste des rumeurs
struct RumorsListResponse: Codable {
    let success: Bool
    let data: [RumorSummary]?
    let pagination: PaginationInfo?
}

/// Reponse pour le detail d'une rumeur
struct RumorDetailResponse: Codable {
    let success: Bool
    let data: RumorDetail?
}

/// Reponse paginee pour les notifications
struct NotificationsListResponse: Codable {
    let success: Bool
    let data: [NotificationDTO]?
    let pagination: PaginationInfo?
}

// MARK: - Identifiable Conformance

extension RumorDetail: Identifiable {}
extension ScanDetailDTO: Identifiable {}

// MARK: - RumorDetail Extensions

extension RumorDetail {

    /// Nom complet du lieu (region + departement + localite)
    var fullLocation: String {
        [region, department, location]
            .compactMap { $0 }
            .filter { !$0.isEmpty }
            .joined(separator: ", ")
    }

    /// Indique si la rumeur a des coordonnees GPS
    var hasCoordinates: Bool {
        latitude != nil && longitude != nil
    }

    /// Couleur associee au statut
    var statusColor: Color {
        switch status?.lowercased() {
        case "pending", "en_attente":
            return AppColors.warning
        case "investigating", "investigation":
            return AppColors.info
        case "confirmed", "confirmee":
            return AppColors.danger
        case "closed", "fermee", "cloturee":
            return AppColors.success
        case "false_alarm", "fausse_alerte":
            return AppColors.muted
        default:
            return AppColors.muted
        }
    }

    /// Couleur associee a la priorite
    var priorityColor: Color {
        switch priority?.lowercased() {
        case "critical", "critique":
            return AppColors.danger
        case "high", "haute", "elevee":
            return AppColors.alert
        case "medium", "moyenne":
            return AppColors.warning
        case "low", "basse", "faible":
            return AppColors.success
        default:
            return AppColors.muted
        }
    }

    /// Couleur associee au niveau de risque
    var riskColor: Color {
        switch riskLevel?.lowercased() {
        case "critical", "critique":
            return AppColors.danger
        case "high", "eleve", "haute":
            return AppColors.alert
        case "medium", "moyen", "moyenne":
            return AppColors.warning
        case "low", "faible", "basse":
            return AppColors.success
        default:
            return AppColors.muted
        }
    }

    /// Icone SF Symbol pour la categorie
    var categoryIcon: String {
        switch category?.lowercased() {
        case "animal", "animale":
            return "pawprint.fill"
        case "human", "humaine":
            return "person.fill"
        case "environmental", "environnement":
            return "leaf.fill"
        case "zoonotic", "zoonotique":
            return "allergens.fill"
        default:
            return "exclamationmark.circle.fill"
        }
    }

    /// Couleur pour la categorie
    var categoryColor: Color {
        switch category?.lowercased() {
        case "animal", "animale":
            return AppColors.animalHealth
        case "human", "humaine":
            return AppColors.humanHealth
        case "environmental", "environnement":
            return AppColors.environmental
        case "zoonotic", "zoonotique":
            return AppColors.info
        default:
            return AppColors.muted
        }
    }

    /// Date de creation formatee
    var formattedCreatedAt: String {
        guard let dateStr = createdAt else { return "-" }
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        formatter.locale = Locale(identifier: "fr_FR")
        if let date = formatter.date(from: String(dateStr.prefix(19))) {
            return date.dateTimeString
        }
        return String(dateStr.prefix(10))
    }

    /// Date de mise a jour formatee
    var formattedUpdatedAt: String {
        guard let dateStr = updatedAt else { return "-" }
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        formatter.locale = Locale(identifier: "fr_FR")
        if let date = formatter.date(from: String(dateStr.prefix(19))) {
            return date.relativeString
        }
        return String(dateStr.prefix(10))
    }

    /// Nombre de photos attachees
    var photoCount: Int { photos?.count ?? 0 }

    /// Nombre de notes
    var noteCount: Int { notes?.count ?? 0 }

    /// Nombre de validations
    var validationCount: Int { validations?.count ?? 0 }

    /// Titre affichable
    var displayTitle: String {
        title ?? code ?? String(localized: "dashboard.rumor.untitled")
    }
}

// MARK: - ValidationItem Extensions

extension ValidationItem {

    /// Couleur associee au statut de validation
    var statusColor: Color {
        switch status?.lowercased() {
        case "approved", "approuve":
            return AppColors.success
        case "rejected", "rejete":
            return AppColors.danger
        case "pending", "en_attente":
            return AppColors.warning
        case "escalated", "escalade":
            return AppColors.alert
        default:
            return AppColors.muted
        }
    }

    /// Icone associee au type d'action
    var actionIcon: String {
        switch actionType?.lowercased() {
        case "approve", "validation":
            return "checkmark.circle.fill"
        case "reject", "rejection":
            return "xmark.circle.fill"
        case "escalate", "escalation":
            return "arrow.up.circle.fill"
        case "investigate", "investigation":
            return "magnifyingglass.circle.fill"
        default:
            return "circle.fill"
        }
    }

    /// Date de creation formatee
    var formattedDate: String {
        guard let dateStr = createdAt else { return "-" }
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        formatter.locale = Locale(identifier: "fr_FR")
        if let date = formatter.date(from: String(dateStr.prefix(19))) {
            return date.relativeString
        }
        return String(dateStr.prefix(10))
    }
}

// MARK: - NoteItem Extensions

extension NoteItem {

    /// Date de creation formatee
    var formattedDate: String {
        guard let dateStr = createdAt else { return "-" }
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        formatter.locale = Locale(identifier: "fr_FR")
        if let date = formatter.date(from: String(dateStr.prefix(19))) {
            return date.relativeString
        }
        return String(dateStr.prefix(10))
    }

    /// Indique si la note est privee
    var isPrivateNote: Bool {
        isPrivate ?? false
    }
}

// MARK: - ScanItemDTO Extensions

extension ScanItemDTO {

    /// Couleur associee au statut du scan
    var statusColor: Color {
        switch status?.lowercased() {
        case "completed", "termine":
            return AppColors.success
        case "running", "en_cours":
            return AppColors.info
        case "failed", "echoue":
            return AppColors.danger
        case "pending", "en_attente":
            return AppColors.warning
        default:
            return AppColors.muted
        }
    }

    /// Date de creation formatee
    var formattedDate: String {
        guard let dateStr = createdAt else { return "-" }
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        formatter.locale = Locale(identifier: "fr_FR")
        if let date = formatter.date(from: String(dateStr.prefix(19))) {
            return date.relativeString
        }
        return String(dateStr.prefix(10))
    }
}

// MARK: - ScanResultDTO Extensions

extension ScanResultDTO {

    /// Score de pertinence formate en pourcentage
    var formattedScore: String {
        guard let score = relevanceScore else { return "-" }
        return String(format: "%.0f%%", score * 100)
    }

    /// Couleur selon le score de pertinence
    var scoreColor: Color {
        guard let score = relevanceScore else { return AppColors.muted }
        switch score {
        case 0.8...: return AppColors.danger
        case 0.6..<0.8: return AppColors.warning
        case 0.4..<0.6: return AppColors.info
        default: return AppColors.muted
        }
    }
}

// MARK: - NotificationDTO Extensions

extension NotificationDTO {

    /// Icone associee au type de notification
    var typeIcon: String {
        switch notificationType?.lowercased() {
        case "alert", "alerte":
            return "exclamationmark.triangle.fill"
        case "validation":
            return "checkmark.seal.fill"
        case "escalation":
            return "arrow.up.circle.fill"
        case "reminder", "rappel":
            return "bell.fill"
        case "scan":
            return "doc.text.magnifyingglass"
        default:
            return "bell.badge.fill"
        }
    }

    /// Couleur associee au type de notification
    var typeColor: Color {
        switch notificationType?.lowercased() {
        case "alert", "alerte":
            return AppColors.danger
        case "validation":
            return AppColors.success
        case "escalation":
            return AppColors.alert
        case "reminder", "rappel":
            return AppColors.info
        case "scan":
            return AppColors.primary
        default:
            return AppColors.muted
        }
    }

    /// Date de creation formatee
    var formattedDate: String {
        guard let dateStr = createdAt else { return "-" }
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        formatter.locale = Locale(identifier: "fr_FR")
        if let date = formatter.date(from: String(dateStr.prefix(19))) {
            return date.relativeString
        }
        return String(dateStr.prefix(10))
    }

    /// Indique si la notification est lue
    var isRead: Bool {
        status?.lowercased() == "read" || status?.lowercased() == "lu"
    }
}

// MARK: - LoginUser Extensions

extension LoginUser {

    /// Initiales de l'utilisateur pour avatar
    var initials: String {
        let first = firstName?.prefix(1) ?? ""
        let last = lastName?.prefix(1) ?? ""
        let result = "\(first)\(last)".uppercased()
        return result.isEmpty ? "?" : result
    }

    /// Libelle du role localise
    var localizedRole: String {
        switch role?.lowercased() {
        case "admin":
            return String(localized: "role.admin")
        case "validator", "validateur":
            return String(localized: "role.validator")
        case "investigator", "investigateur":
            return String(localized: "role.investigator")
        case "reporter", "rapporteur":
            return String(localized: "role.reporter")
        case "viewer", "lecteur":
            return String(localized: "role.viewer")
        default:
            return role ?? "-"
        }
    }
}
