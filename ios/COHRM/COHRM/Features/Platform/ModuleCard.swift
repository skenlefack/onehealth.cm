// ModuleCard.swift
// One Health Cameroon Platform — Carte de module
//
// Carte interactive affichée sur l'écran d'accueil pour chaque module.
// Montre l'icône, le titre, les stats résumées et le statut.
// Un tap ouvre le module dans son propre espace.

import SwiftUI

// MARK: - Carte de module

/// Carte d'un module sur la grille de l'écran d'accueil.
/// Design : gradient en fond, icône, titre, 3 mini-stats, badge "À venir" si pas encore dispo.
struct ModuleCard: View {

    let module: PlatformModule
    let stats: [ModuleStat]
    var isVisible: Bool = true
    var delay: Double = 0.0

    @AppStorage("appLanguage") private var appLanguage = "fr"

    var body: some View {
        NavigationLink {
            ModuleContainerView(module: module)
        } label: {
            cardContent
        }
        .disabled(!module.isAvailable)
        .opacity(isVisible ? 1.0 : 0.0)
        .offset(y: isVisible ? 0 : 20)
        .animation(.easeOut(duration: 0.5).delay(delay), value: isVisible)
    }

    // MARK: - Contenu de la carte

    private var cardContent: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
            // En-tête : icône + badge
            HStack {
                // Icône dans un cercle
                ZStack {
                    Circle()
                        .fill(module.color.opacity(0.15))
                        .frame(width: 44, height: 44)

                    Image(systemName: module.icon)
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(module.color)
                }

                Spacer()

                // Badge statut
                if !module.isAvailable {
                    Text(appLanguage == "fr" ? "Bientôt" : "Soon")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(AppColors.muted)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(AppColors.muted.opacity(0.15))
                        .clipShape(Capsule())
                } else {
                    Circle()
                        .fill(Color(hex: 0x2ECC71))
                        .frame(width: 8, height: 8)
                }
            }

            // Titre
            Text(module.title(lang: appLanguage))
                .font(.system(size: 14, weight: .bold))
                .foregroundStyle(AppColors.textPrimary)
                .lineLimit(2)
                .multilineTextAlignment(.leading)
                .fixedSize(horizontal: false, vertical: true)

            // Sous-titre
            Text(module.subtitle(lang: appLanguage))
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(AppColors.textTertiary)

            Spacer(minLength: 4)

            // Mini-stats (3 colonnes)
            if module.isAvailable {
                miniStatsRow
            } else {
                // Description courte pour les modules à venir
                Text(module.description(lang: appLanguage))
                    .font(.system(size: 11))
                    .foregroundStyle(AppColors.textSecondary)
                    .lineLimit(3)
            }
        }
        .padding(AppDimensions.cardPadding)
        .frame(minHeight: 190)
        .background(
            RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusL, style: .continuous)
                .fill(AppColors.cardBackground)
        )
        .overlay(
            RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusL, style: .continuous)
                .stroke(module.isAvailable ? module.color.opacity(0.2) : AppColors.muted.opacity(0.15), lineWidth: 1)
        )
        .overlay(alignment: .topTrailing) {
            // Accent gradient subtil en haut à droite
            if module.isAvailable {
                Circle()
                    .fill(module.gradient.opacity(0.08))
                    .frame(width: 80, height: 80)
                    .offset(x: 20, y: -20)
                    .clipShape(
                        RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusL, style: .continuous)
                    )
            }
        }
        .opacity(module.isAvailable ? 1.0 : 0.6)
    }

    // MARK: - Mini-stats

    private var miniStatsRow: some View {
        HStack(spacing: 0) {
            ForEach(stats) { stat in
                VStack(spacing: 2) {
                    Text(stat.suffix != nil ? "\(stat.value)\(stat.suffix!)" : "\(stat.value)")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundStyle(module.color)
                        .contentTransition(.numericText())

                    Text(stat.label)
                        .font(.system(size: 9, weight: .medium))
                        .foregroundStyle(AppColors.textTertiary)
                        .lineLimit(1)
                }
                .frame(maxWidth: .infinity)
            }
        }
        .padding(.vertical, AppDimensions.spacingS)
        .background(module.color.opacity(0.05))
        .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous))
    }
}

// MARK: - Preview

#Preview("Module Cards") {
    LazyVGrid(columns: [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ], spacing: 12) {
        ModuleCard(
            module: .cohrm,
            stats: [
                ModuleStat(label: "Rumeurs", value: 234),
                ModuleStat(label: "En attente", value: 12),
                ModuleStat(label: "Critiques", value: 3)
            ]
        )

        ModuleCard(
            module: .dussc,
            stats: [
                ModuleStat(label: "Sessions", value: 1520),
                ModuleStat(label: "Questions", value: 144),
                ModuleStat(label: "Gain", value: 18, suffix: "pts")
            ]
        )

        ModuleCard(
            module: .ohwr,
            stats: [
                ModuleStat(label: "Ressources", value: 89),
                ModuleStat(label: "Experts", value: 45),
                ModuleStat(label: "Régions", value: 8)
            ]
        )

        ModuleCard(
            module: .elearning,
            stats: [
                ModuleStat(label: "Cours", value: 12),
                ModuleStat(label: "Inscrits", value: 340),
                ModuleStat(label: "Certifiés", value: 85)
            ]
        )
    }
    .padding()
}
