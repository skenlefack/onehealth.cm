// DashboardModels.swift
// COHRM Cameroun - Extensions et helpers pour les modeles du tableau de bord
//
// Les types principaux (DashboardData, ChartItem, TrendItem, RumorSummary)
// sont definis dans RemoteModels.swift pour eviter la duplication.
// Ce fichier fournit des extensions de commodite pour le Dashboard.

import Foundation
import SwiftUI

// MARK: - DashboardData Extensions

extension DashboardData {

    /// Nombre total de signalements ou 0 si nil
    var safeTotal: Int { total ?? 0 }

    /// Nombre de signalements en attente ou 0 si nil
    var safePending: Int { pending ?? 0 }

    /// Nombre de signalements en investigation ou 0 si nil
    var safeInvestigating: Int { investigating ?? 0 }

    /// Nombre de signalements confirmes ou 0 si nil
    var safeConfirmed: Int { confirmed ?? 0 }

    /// Nombre de fausses alertes ou 0 si nil
    var safeFalseAlarm: Int { falseAlarm ?? 0 }

    /// Nombre de signalements clos ou 0 si nil
    var safeClosed: Int { closed ?? 0 }

    /// Nombre de signalements haute priorite ou 0 si nil
    var safeHighPriority: Int { highPriority ?? 0 }

    /// Nombre de signalements critiques ou 0 si nil
    var safeCritical: Int { critical ?? 0 }

    /// Nombre de signalements du jour ou 0 si nil
    var safeTodayCount: Int { todayCount ?? 0 }

    /// Nombre de signalements de la semaine ou 0 si nil
    var safeWeekCount: Int { weekCount ?? 0 }

    /// Nombre de signalements du mois ou 0 si nil
    var safeMonthCount: Int { monthCount ?? 0 }

    /// Pourcentage de signalements en attente par rapport au total
    var pendingPercentage: Double {
        guard safeTotal > 0 else { return 0 }
        return Double(safePending) / Double(safeTotal) * 100
    }

    /// Pourcentage de signalements confirmes par rapport au total
    var confirmedPercentage: Double {
        guard safeTotal > 0 else { return 0 }
        return Double(safeConfirmed) / Double(safeTotal) * 100
    }

    /// Pourcentage de signalements clos par rapport au total
    var closedPercentage: Double {
        guard safeTotal > 0 else { return 0 }
        return Double(safeClosed) / Double(safeTotal) * 100
    }

    /// Les 3 premieres regions par nombre de signalements
    var topRegions: [ChartItem] {
        (byRegion ?? [])
            .sorted { $0.count > $1.count }
            .prefix(3)
            .map { $0 }
    }

    /// Les 3 premieres categories par nombre de signalements
    var topCategories: [ChartItem] {
        (byCategory ?? [])
            .sorted { $0.count > $1.count }
            .prefix(3)
            .map { $0 }
    }
}

// MARK: - ChartItem Extensions

extension ChartItem {

    /// Couleur SwiftUI resolue a partir de la chaine hex ou couleur par defaut
    var resolvedColor: Color {
        guard let colorHex = color, !colorHex.isEmpty else {
            return AppColors.primary
        }
        let hex = colorHex.hasPrefix("#") ? String(colorHex.dropFirst()) : colorHex
        guard let value = UInt(hex, radix: 16) else {
            return AppColors.primary
        }
        return Color(hex: value)
    }

    /// Proportion par rapport a la valeur maximale d'une liste
    func proportion(in items: [ChartItem]) -> Double {
        let maxVal = items.map(\.count).max() ?? 1
        guard maxVal > 0 else { return 0 }
        return Double(count) / Double(maxVal)
    }
}

// MARK: - TrendItem Extensions

extension TrendItem {

    /// Parse la date ISO en objet Date
    var parsedDate: Date {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.locale = Locale(identifier: "fr_FR")
        return formatter.date(from: String(date.prefix(10))) ?? .now
    }

    /// Date formatee en format court (ex: "15/04")
    var shortDateLabel: String {
        let parts = date.split(separator: "-")
        guard parts.count >= 3 else { return date }
        let day = String(parts[2].prefix(2))
        let month = String(parts[1])
        return "\(day)/\(month)"
    }
}

// MARK: - RumorSummary Extensions

extension RumorSummary {

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

    /// Libelle du statut localise
    var localizedStatus: String {
        switch status?.lowercased() {
        case "pending", "en_attente":
            return String(localized: "dashboard.status.pending")
        case "investigating", "investigation":
            return String(localized: "dashboard.status.investigating")
        case "confirmed", "confirmee":
            return String(localized: "dashboard.status.confirmed")
        case "closed", "fermee", "cloturee":
            return String(localized: "dashboard.status.closed")
        case "false_alarm", "fausse_alerte":
            return String(localized: "dashboard.status.falseAlarm")
        default:
            return status ?? "-"
        }
    }

    /// Date de creation formatee relativement
    var relativeDate: String {
        guard let dateStr = createdAt else { return "" }
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        formatter.locale = Locale(identifier: "fr_FR")

        if let date = formatter.date(from: String(dateStr.prefix(19))) {
            let relative = RelativeDateTimeFormatter()
            relative.locale = Locale(identifier: "fr_FR")
            relative.unitsStyle = .abbreviated
            return relative.localizedString(for: date, relativeTo: .now)
        }
        return String(dateStr.prefix(10))
    }

    /// Titre affichable (avec fallback)
    var displayTitle: String {
        title ?? String(localized: "dashboard.rumor.untitled")
    }
}
