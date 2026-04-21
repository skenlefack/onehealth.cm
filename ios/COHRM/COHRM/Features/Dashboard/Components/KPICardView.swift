// KPICardView.swift
// COHRM Cameroun - Carte KPI réutilisable

import SwiftUI

/// Carte affichant un indicateur clé de performance.
/// Montre une icône, une valeur numérique, un libellé
/// et un accent de couleur personnalisable.
struct KPICardView: View {

    let icon: String
    let value: Int
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: AppDimensions.spacingS) {
            // Icône dans un cercle coloré
            ZStack {
                Circle()
                    .fill(color.opacity(0.12))
                    .frame(width: 40, height: 40)

                Image(systemName: icon)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(color)
            }

            // Valeur numérique grande
            Text("\(value)")
                .font(AppFonts.kpiNumber)
                .foregroundStyle(AppColors.textPrimary)
                .contentTransition(.numericText())

            // Libellé
            Text(label)
                .font(AppFonts.caption)
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)
                .lineLimit(2)
                .minimumScaleFactor(0.75)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, AppDimensions.cardPadding)
        .padding(.horizontal, AppDimensions.spacingXS)
        .cardStyle()
    }
}

#Preview {
    HStack {
        KPICardView(
            icon: "doc.text.fill",
            value: 142,
            label: "Total",
            color: AppColors.primary
        )
        KPICardView(
            icon: "clock.fill",
            value: 23,
            label: "En attente",
            color: AppColors.warning
        )
    }
    .padding()
}
