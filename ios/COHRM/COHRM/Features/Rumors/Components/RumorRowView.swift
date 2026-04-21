// RumorRowView.swift
// COHRM Cameroun - Ligne de rumeur reutilisable

import SwiftUI

/// Ligne affichant le resume d'une rumeur dans une liste
struct RumorRowView: View {

    let rumor: RumorSummary

    var body: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
            // Code monospace
            if let code = rumor.code, !code.isEmpty {
                Text(code)
                    .font(.system(size: 12, weight: .medium, design: .monospaced))
                    .foregroundStyle(AppColors.primary)
            }

            // Titre
            Text(rumor.title ?? String(localized: "rumors.untitled"))
                .font(AppFonts.subheadline)
                .foregroundStyle(AppColors.textPrimary)
                .lineLimit(2)

            // Badges statut + priorite
            HStack(spacing: AppDimensions.spacingS) {
                if let status = rumor.status {
                    StatusBadge(
                        RumorStatusHelper.label(for: status),
                        color: RumorStatusHelper.color(for: status),
                        icon: RumorStatusHelper.icon(for: status)
                    )
                }

                if let priority = rumor.priority {
                    StatusBadge(
                        RumorPriorityHelper.label(for: priority),
                        color: RumorPriorityHelper.color(for: priority)
                    )
                }

                if let risk = rumor.riskLevel, !risk.isEmpty {
                    StatusBadge(
                        risk.capitalized,
                        color: RumorPriorityHelper.color(for: risk)
                    )
                }
            }

            // Region + date
            HStack(spacing: AppDimensions.spacingM) {
                if let region = rumor.region, !region.isEmpty {
                    Label(region, systemImage: "mappin")
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textTertiary)
                        .lineLimit(1)
                }

                Spacer()

                if let dateStr = rumor.createdAt {
                    Text(RumorDateHelper.relativeString(from: dateStr))
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textTertiary)
                }
            }
        }
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }
}

// MARK: - Helpers couleurs et labels pour statuts

enum RumorStatusHelper {

    static func color(for status: String) -> Color {
        switch status.lowercased() {
        case "pending": return AppColors.warning
        case "investigating": return AppColors.info
        case "confirmed": return AppColors.danger
        case "false_alarm": return AppColors.muted
        case "closed": return AppColors.success
        default: return AppColors.muted
        }
    }

    static func label(for status: String) -> String {
        switch status.lowercased() {
        case "pending": return String(localized: "rumors.status.pending")
        case "investigating": return String(localized: "rumors.status.investigating")
        case "confirmed": return String(localized: "rumors.status.confirmed")
        case "false_alarm": return String(localized: "rumors.status.false_alarm")
        case "closed": return String(localized: "rumors.status.closed")
        default: return status.capitalized
        }
    }

    static func icon(for status: String) -> String {
        switch status.lowercased() {
        case "pending": return "clock"
        case "investigating": return "magnifyingglass"
        case "confirmed": return "exclamationmark.triangle"
        case "false_alarm": return "xmark.circle"
        case "closed": return "checkmark.circle"
        default: return "questionmark.circle"
        }
    }
}

enum RumorPriorityHelper {

    static func color(for priority: String) -> Color {
        switch priority.lowercased() {
        case "critical": return Color(hex: 0x8E24AA)
        case "high": return AppColors.danger
        case "medium": return AppColors.warning
        case "low": return AppColors.success
        default: return AppColors.muted
        }
    }

    static func label(for priority: String) -> String {
        switch priority.lowercased() {
        case "critical": return String(localized: "rumors.priority.critical")
        case "high": return String(localized: "rumors.priority.high")
        case "medium": return String(localized: "rumors.priority.medium")
        case "low": return String(localized: "rumors.priority.low")
        default: return priority.capitalized
        }
    }
}

// MARK: - Date helper

enum RumorDateHelper {

    private static let isoFormatter: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()

    private static let fallbackFormatter: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime]
        return f
    }()

    private static let relativeFormatter: RelativeDateTimeFormatter = {
        let f = RelativeDateTimeFormatter()
        f.locale = Locale(identifier: "fr_FR")
        f.unitsStyle = .abbreviated
        return f
    }()

    private static let dateFormatter: DateFormatter = {
        let f = DateFormatter()
        f.locale = Locale(identifier: "fr_FR")
        f.dateStyle = .medium
        f.timeStyle = .short
        return f
    }()

    static func parse(_ string: String) -> Date? {
        isoFormatter.date(from: string) ?? fallbackFormatter.date(from: string)
    }

    static func relativeString(from dateString: String) -> String {
        guard let date = parse(dateString) else { return dateString }
        return relativeFormatter.localizedString(for: date, relativeTo: .now)
    }

    static func formattedString(from dateString: String) -> String {
        guard let date = parse(dateString) else { return dateString }
        return dateFormatter.string(from: date)
    }
}
