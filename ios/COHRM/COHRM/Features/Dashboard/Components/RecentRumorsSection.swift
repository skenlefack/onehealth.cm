// RecentRumorsSection.swift
// COHRM Cameroun - Section des rumeurs récentes

import SwiftUI

/// Section affichant les dernières rumeurs signalées.
/// Chaque ligne montre le code, le titre, les badges de statut
/// et de priorité, ainsi que la date de création.
struct RecentRumorsSection: View {

    let rumors: [RumorSummary]

    var body: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            // En-tête avec compteur
            HStack {
                SectionHeader(
                    title: String(localized: "dashboard.recentRumors.title"),
                    icon: "list.bullet.rectangle.fill"
                )

                Spacer()

                if !rumors.isEmpty {
                    Text("\(rumors.count)")
                        .font(AppFonts.badge)
                        .foregroundStyle(AppColors.primary)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(AppColors.primary.opacity(0.1))
                        .clipShape(Capsule())
                }
            }

            if rumors.isEmpty {
                emptyView
            } else {
                VStack(spacing: AppDimensions.spacingS) {
                    ForEach(rumors.prefix(10)) { rumor in
                        RumorRow(rumor: rumor)
                    }
                }
            }
        }
    }

    // MARK: - Vue vide

    private var emptyView: some View {
        VStack(spacing: AppDimensions.spacingM) {
            Image(systemName: "tray")
                .font(.system(size: 36, weight: .light))
                .foregroundStyle(AppColors.muted)

            Text(String(localized: "dashboard.recentRumors.empty"))
                .font(AppFonts.callout)
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, AppDimensions.spacingXL)
        .cardStyle()
    }
}

// MARK: - Ligne de rumeur

/// Ligne individuelle affichant un résumé de rumeur
private struct RumorRow: View {

    let rumor: RumorSummary

    /// Couleur associée au statut
    private var statusColor: Color {
        switch rumor.status?.lowercased() {
        case "pending", "en_attente": return AppColors.warning
        case "investigating", "investigation": return AppColors.info
        case "confirmed", "confirmee": return AppColors.danger
        case "closed", "fermee", "cloturee": return AppColors.success
        case "false_alarm", "fausse_alerte": return AppColors.muted
        default: return AppColors.muted
        }
    }

    /// Libellé du statut localisé
    private var statusLabel: String {
        switch rumor.status?.lowercased() {
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
            return rumor.status ?? "-"
        }
    }

    /// Couleur associée à la priorité
    private var priorityColor: Color {
        switch rumor.priority?.lowercased() {
        case "critical", "critique": return AppColors.danger
        case "high", "haute", "elevee": return AppColors.alert
        case "medium", "moyenne": return AppColors.warning
        case "low", "basse", "faible": return AppColors.success
        default: return AppColors.muted
        }
    }

    /// Formate une date ISO en format relatif court
    private var formattedDate: String {
        guard let dateStr = rumor.createdAt else { return "" }
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        formatter.locale = Locale(identifier: "fr_FR")

        // Essai avec et sans millisecondes
        if let date = formatter.date(from: String(dateStr.prefix(19))) {
            let relative = RelativeDateTimeFormatter()
            relative.locale = Locale(identifier: "fr_FR")
            relative.unitsStyle = .abbreviated
            return relative.localizedString(for: date, relativeTo: .now)
        }
        // Fallback: afficher le début de la date
        return String(dateStr.prefix(10))
    }

    var body: some View {
        HStack(spacing: AppDimensions.spacingM) {
            // Indicateur de statut vertical
            RoundedRectangle(cornerRadius: 2)
                .fill(statusColor)
                .frame(width: 4, height: 44)

            // Contenu principal
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                // Code et titre
                HStack(spacing: AppDimensions.spacingS) {
                    if let code = rumor.code {
                        Text(code)
                            .font(AppFonts.badge)
                            .foregroundStyle(AppColors.primary)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(AppColors.primary.opacity(0.08))
                            .clipShape(RoundedRectangle(cornerRadius: 4, style: .continuous))
                    }

                    Text(rumor.title ?? String(localized: "dashboard.rumor.untitled"))
                        .font(AppFonts.subheadline)
                        .foregroundStyle(AppColors.textPrimary)
                        .lineLimit(1)
                }

                // Badges et date
                HStack(spacing: AppDimensions.spacingS) {
                    // Badge statut
                    StatusBadge(statusLabel, color: statusColor)

                    // Badge priorité
                    if let priority = rumor.priority {
                        StatusBadge(priority, color: priorityColor)
                    }

                    Spacer()

                    // Date
                    Text(formattedDate)
                        .font(AppFonts.caption2)
                        .foregroundStyle(AppColors.textTertiary)
                }
            }
        }
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }
}

#Preview {
    RecentRumorsSection(
        rumors: [
            RumorSummary(
                id: 1,
                code: "RUM-001",
                title: "Grippe aviaire suspecte",
                category: "animal",
                status: "pending",
                priority: "high",
                region: "Centre",
                riskLevel: "high",
                source: "community",
                reporterName: "Jean Dupont",
                createdAt: "2026-04-21T10:30:00"
            ),
            RumorSummary(
                id: 2,
                code: "RUM-002",
                title: "Cas de cholera signale",
                category: "human",
                status: "investigating",
                priority: "critical",
                region: "Littoral",
                riskLevel: "critical",
                source: "health_facility",
                reporterName: "Marie Ngo",
                createdAt: "2026-04-20T14:15:00"
            ),
        ]
    )
    .padding()
}
