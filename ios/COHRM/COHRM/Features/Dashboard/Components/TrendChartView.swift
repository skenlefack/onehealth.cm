// TrendChartView.swift
// COHRM Cameroun - Graphique de tendance temporelle

import SwiftUI
import Charts

/// Graphique de tendance montrant l'évolution des signalements
/// dans le temps avec un LineMark et un AreaMark en dégradé.
struct TrendChartView: View {

    let trends: [TrendItem]
    let title: String

    /// Formate une date ISO en date courte
    private func shortDate(_ dateString: String) -> String {
        let parts = dateString.split(separator: "-")
        guard parts.count >= 2 else { return dateString }
        let day = parts.count >= 3 ? String(parts[2].prefix(2)) : ""
        let month = String(parts[1])
        return "\(day)/\(month)"
    }

    /// Parse une date ISO en Date
    private func parseDate(_ dateString: String) -> Date {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.locale = Locale(identifier: "fr_FR")
        return formatter.date(from: String(dateString.prefix(10))) ?? .now
    }

    /// Valeur maximale pour dimensionner l'axe Y
    private var maxCount: Int {
        (trends.map(\.count).max() ?? 1) + 1
    }

    var body: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            // Titre de section
            SectionHeader(title: title, icon: "chart.xyaxis.line")

            if trends.isEmpty {
                emptyChartView
            } else {
                chartContent
            }
        }
    }

    // MARK: - Graphique

    private var chartContent: some View {
        Chart {
            ForEach(trends) { item in
                let date = parseDate(item.date)

                // Zone dégradée sous la ligne
                AreaMark(
                    x: .value(String(localized: "dashboard.chart.date"), date),
                    y: .value(String(localized: "dashboard.chart.count"), item.count)
                )
                .foregroundStyle(
                    LinearGradient(
                        colors: [
                            AppColors.primary.opacity(0.3),
                            AppColors.primary.opacity(0.05)
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .interpolationMethod(.catmullRom)

                // Ligne principale
                LineMark(
                    x: .value(String(localized: "dashboard.chart.date"), date),
                    y: .value(String(localized: "dashboard.chart.count"), item.count)
                )
                .foregroundStyle(AppColors.primary)
                .lineStyle(StrokeStyle(lineWidth: 2.5, lineCap: .round))
                .interpolationMethod(.catmullRom)

                // Points sur la ligne
                PointMark(
                    x: .value(String(localized: "dashboard.chart.date"), date),
                    y: .value(String(localized: "dashboard.chart.count"), item.count)
                )
                .foregroundStyle(AppColors.primary)
                .symbolSize(20)
            }
        }
        .chartYScale(domain: 0...maxCount)
        .chartXAxis {
            AxisMarks(values: .automatic(desiredCount: 5)) { value in
                AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5, dash: [4]))
                    .foregroundStyle(AppColors.muted.opacity(0.3))
                AxisValueLabel {
                    if let date = value.as(Date.self) {
                        Text(date, format: .dateTime.day().month(.abbreviated))
                            .font(AppFonts.caption2)
                            .foregroundStyle(AppColors.textTertiary)
                    }
                }
            }
        }
        .chartYAxis {
            AxisMarks(position: .leading, values: .automatic(desiredCount: 4)) { _ in
                AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5, dash: [4]))
                    .foregroundStyle(AppColors.muted.opacity(0.3))
                AxisValueLabel()
                    .font(AppFonts.caption2)
                    .foregroundStyle(AppColors.textTertiary)
            }
        }
        .frame(height: 200)
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }

    // MARK: - Vue vide

    private var emptyChartView: some View {
        VStack(spacing: AppDimensions.spacingS) {
            Image(systemName: "chart.line.downtrend.xyaxis")
                .font(.system(size: 32, weight: .light))
                .foregroundStyle(AppColors.muted)

            Text(String(localized: "dashboard.chart.noData"))
                .font(AppFonts.callout)
                .foregroundStyle(AppColors.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .frame(height: 160)
        .cardStyle()
    }
}

#Preview {
    TrendChartView(
        trends: [
            TrendItem(date: "2026-04-15", count: 3),
            TrendItem(date: "2026-04-16", count: 5),
            TrendItem(date: "2026-04-17", count: 2),
            TrendItem(date: "2026-04-18", count: 8),
            TrendItem(date: "2026-04-19", count: 6),
            TrendItem(date: "2026-04-20", count: 4),
            TrendItem(date: "2026-04-21", count: 7),
        ],
        title: "Tendance (7 jours)"
    )
    .padding()
}
