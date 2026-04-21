// FilterChipsView.swift
// COHRM Cameroun - Chips de filtrage horizontal pour les statuts

import SwiftUI

/// Vue horizontale de chips de filtrage de statut
struct FilterChipsView: View {

    /// Statut actuellement selectionne (nil = tous)
    @Binding var selectedStatus: String?

    /// Options de filtre disponibles
    let options: [(key: String?, label: String)]

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: AppDimensions.spacingS) {
                ForEach(Array(options.enumerated()), id: \.offset) { _, option in
                    FilterChip(
                        label: option.label,
                        isSelected: selectedStatus == option.key,
                        color: chipColor(for: option.key)
                    ) {
                        HapticHelper.selection()
                        withAnimation(.easeInOut(duration: 0.2)) {
                            selectedStatus = option.key
                        }
                    }
                }
            }
            .padding(.horizontal, AppDimensions.spacing)
            .padding(.vertical, AppDimensions.spacingXS)
        }
    }

    /// Couleur associee a chaque statut
    private func chipColor(for key: String?) -> Color {
        guard let key else { return AppColors.primary }
        return RumorStatusHelper.color(for: key)
    }
}

// MARK: - Chip individuel

/// Bouton capsule individuel pour un filtre
private struct FilterChip: View {

    let label: String
    let isSelected: Bool
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(AppFonts.badge)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .foregroundStyle(isSelected ? .white : color)
                .background(isSelected ? color : color.opacity(0.1))
                .clipShape(Capsule())
                .overlay(
                    Capsule()
                        .stroke(color.opacity(isSelected ? 0 : 0.3), lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
    }
}
