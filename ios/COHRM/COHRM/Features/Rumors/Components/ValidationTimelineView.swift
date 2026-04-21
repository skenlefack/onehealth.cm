// ValidationTimelineView.swift
// COHRM Cameroun - Timeline de validation des rumeurs

import SwiftUI

/// Timeline verticale affichant les etapes de validation d'une rumeur
struct ValidationTimelineView: View {

    let validations: [ValidationItem]

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(Array(validations.enumerated()), id: \.element.id) { index, item in
                HStack(alignment: .top, spacing: AppDimensions.spacingM) {
                    // Colonne gauche : cercle + ligne
                    VStack(spacing: 0) {
                        // Cercle avec numero de niveau
                        ZStack {
                            Circle()
                                .fill(timelineColor(for: item).opacity(0.15))
                                .frame(width: 36, height: 36)

                            Circle()
                                .stroke(timelineColor(for: item), lineWidth: 2)
                                .frame(width: 36, height: 36)

                            Text("\(item.level ?? (index + 1))")
                                .font(.system(size: 14, weight: .bold, design: .rounded))
                                .foregroundStyle(timelineColor(for: item))
                        }

                        // Ligne de connexion (sauf pour le dernier)
                        if index < validations.count - 1 {
                            Rectangle()
                                .fill(AppColors.muted.opacity(0.3))
                                .frame(width: 2)
                                .frame(minHeight: 40)
                        }
                    }

                    // Contenu
                    VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                        // Type d'action
                        if let action = item.actionType {
                            Text(actionLabel(for: action))
                                .font(AppFonts.subheadline)
                                .foregroundStyle(AppColors.textPrimary)
                        }

                        // Acteur
                        if let actor = item.actorName, !actor.isEmpty {
                            HStack(spacing: AppDimensions.spacingXS) {
                                Image(systemName: "person.fill")
                                    .font(.caption2)
                                    .foregroundStyle(AppColors.textTertiary)

                                Text(actor)
                                    .font(AppFonts.footnote)
                                    .foregroundStyle(AppColors.textSecondary)
                            }
                        }

                        // Statut resultant
                        if let status = item.status {
                            StatusBadge(
                                RumorStatusHelper.label(for: status),
                                color: RumorStatusHelper.color(for: status),
                                icon: RumorStatusHelper.icon(for: status)
                            )
                        }

                        // Notes
                        if let notes = item.notes, !notes.isEmpty {
                            Text(notes)
                                .font(AppFonts.caption)
                                .foregroundStyle(AppColors.textSecondary)
                                .fixedSize(horizontal: false, vertical: true)
                        }

                        // Date
                        if let dateStr = item.createdAt {
                            Text(RumorDateHelper.formattedString(from: dateStr))
                                .font(AppFonts.caption2)
                                .foregroundStyle(AppColors.textTertiary)
                        }
                    }
                    .padding(.bottom, index < validations.count - 1 ? AppDimensions.spacingM : 0)

                    Spacer()
                }
            }
        }
    }

    // MARK: - Helpers

    /// Couleur du cercle en fonction de l'action
    private func timelineColor(for item: ValidationItem) -> Color {
        switch item.actionType?.lowercased() ?? "" {
        case "approve", "confirm": return AppColors.success
        case "reject", "close": return AppColors.danger
        case "escalate": return AppColors.warning
        case "investigate": return AppColors.info
        default: return AppColors.primary
        }
    }

    /// Label traduit pour le type d'action
    private func actionLabel(for action: String) -> String {
        switch action.lowercased() {
        case "approve": return String(localized: "rumors.action.approve")
        case "reject": return String(localized: "rumors.action.reject")
        case "escalate": return String(localized: "rumors.action.escalate")
        case "investigate": return String(localized: "rumors.action.investigate")
        case "confirm": return String(localized: "rumors.action.confirm")
        case "close": return String(localized: "rumors.action.close")
        case "create": return String(localized: "rumors.action.create")
        default: return action.capitalized
        }
    }
}
