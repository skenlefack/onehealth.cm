// BarChartView.swift
// COHRM Cameroun - Graphique en barres horizontales

import SwiftUI

/// Graphique en barres horizontales avec libellé, compteur
/// et largeur proportionnelle. Chaque barre est colorée
/// selon sa position ou une couleur personnalisée.
struct BarChartView: View {

    let title: String
    let icon: String
    let items: [ChartItem]

    /// Couleurs par défaut pour les barres
    private let barColors: [Color] = [
        AppColors.primary,
        AppColors.info,
        AppColors.success,
        AppColors.warning,
        AppColors.danger,
        AppColors.accent,
        AppColors.primaryLight,
        AppColors.muted
    ]

    /// Valeur maximale pour le calcul des proportions
    private var maxCount: Int {
        items.map(\.count).max() ?? 1
    }

    var body: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            // Titre
            SectionHeader(title: title, icon: icon)

            if items.isEmpty {
                emptyView
            } else {
                barsContent
            }
        }
    }

    // MARK: - Barres

    private var barsContent: some View {
        VStack(spacing: AppDimensions.spacingS) {
            ForEach(Array(items.prefix(8).enumerated()), id: \.element.id) { index, item in
                barRow(item: item, color: barColors[index % barColors.count])
            }
        }
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }

    private func barRow(item: ChartItem, color: Color) -> some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
            // Libellé et compteur
            HStack {
                Text(item.name)
                    .font(AppFonts.footnote)
                    .foregroundStyle(AppColors.textPrimary)
                    .lineLimit(1)

                Spacer()

                Text("\(item.count)")
                    .font(AppFonts.subheadline)
                    .foregroundStyle(AppColors.textPrimary)
            }

            // Barre proportionnelle
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    // Fond de la barre
                    RoundedRectangle(cornerRadius: 4, style: .continuous)
                        .fill(color.opacity(0.1))
                        .frame(height: 8)

                    // Barre remplie
                    RoundedRectangle(cornerRadius: 4, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [color, color.opacity(0.7)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(
                            width: max(
                                4,
                                geometry.size.width * CGFloat(item.count) / CGFloat(maxCount)
                            ),
                            height: 8
                        )
                }
            }
            .frame(height: 8)
        }
    }

    // MARK: - Vue vide

    private var emptyView: some View {
        VStack(spacing: AppDimensions.spacingS) {
            Image(systemName: "chart.bar")
                .font(.system(size: 28, weight: .light))
                .foregroundStyle(AppColors.muted)

            Text(String(localized: "dashboard.chart.noData"))
                .font(AppFonts.callout)
                .foregroundStyle(AppColors.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, AppDimensions.spacingL)
        .cardStyle()
    }
}

#Preview {
    BarChartView(
        title: "Par region",
        icon: "map.fill",
        items: [
            ChartItem(name: "Centre", count: 42),
            ChartItem(name: "Littoral", count: 35),
            ChartItem(name: "Ouest", count: 28),
            ChartItem(name: "Nord", count: 15),
            ChartItem(name: "Sud", count: 8),
        ]
    )
    .padding()
}
