// Step1EventTypeView.swift
// COHRM Cameroun - Étape 1 : Sélection du type d'événement
// Grille de catégories + sélection d'espèce

import SwiftUI

/// Étape 1 de l'assistant : choix de la catégorie d'événement et de l'espèce
struct Step1EventTypeView: View {

    // MARK: - Propriétés

    /// ViewModel partagé de l'assistant
    @Bindable var viewModel: ReportViewModel

    /// Colonnes de la grille (2 colonnes)
    private let columns = [
        GridItem(.flexible(), spacing: AppDimensions.spacingM),
        GridItem(.flexible(), spacing: AppDimensions.spacingM),
    ]

    // MARK: - Corps

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppDimensions.spacingL) {

                // Titre de la section
                SectionHeader(
                    title: String(localized: "report.step1.title"),
                    icon: "tag.fill"
                )

                // Description
                Text(String(localized: "report.step1.description"))
                    .font(AppFonts.callout)
                    .foregroundStyle(AppColors.textSecondary)

                // Grille de catégories
                categoryGrid

                // Sélection d'espèce (visible après sélection de catégorie)
                if viewModel.selectedCategory != nil {
                    speciesSection
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                }
            }
            .padding(AppDimensions.spacing)
        }
        .animation(.easeInOut(duration: 0.3), value: viewModel.selectedCategory)
    }

    // MARK: - Grille de catégories

    /// Grille 2 colonnes avec les catégories d'événements
    private var categoryGrid: some View {
        LazyVGrid(columns: columns, spacing: AppDimensions.spacingM) {
            ForEach(EventCategory.allCases) { category in
                categoryCard(for: category)
            }
        }
    }

    /// Carte de catégorie individuelle
    private func categoryCard(for category: EventCategory) -> some View {
        let isSelected = viewModel.selectedCategory == category

        return Button {
            withAnimation(.easeInOut(duration: 0.2)) {
                viewModel.selectedCategory = category
            }
            HapticHelper.selection()
        } label: {
            VStack(spacing: AppDimensions.spacingS) {
                ZStack(alignment: .topTrailing) {
                    // Icône de la catégorie
                    Image(systemName: category.icon)
                        .font(.system(size: 32, weight: .medium))
                        .foregroundStyle(isSelected ? .white : category.color)
                        .frame(width: 56, height: 56)
                        .background(
                            Circle()
                                .fill(isSelected ? category.color : category.color.opacity(0.12))
                        )

                    // Coche de sélection
                    if isSelected {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.body.weight(.bold))
                            .foregroundStyle(.white)
                            .background(
                                Circle()
                                    .fill(AppColors.success)
                                    .frame(width: 20, height: 20)
                            )
                            .offset(x: 4, y: -4)
                    }
                }

                // Libellé de la catégorie
                Text(category.label)
                    .font(AppFonts.subheadline)
                    .foregroundStyle(isSelected ? category.color : AppColors.textPrimary)
                    .lineLimit(2)
                    .multilineTextAlignment(.center)
                    .minimumScaleFactor(0.8)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, AppDimensions.spacingM)
            .padding(.horizontal, AppDimensions.spacingS)
            .background(
                RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusL, style: .continuous)
                    .fill(AppColors.cardBackground)
            )
            .overlay(
                RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusL, style: .continuous)
                    .stroke(
                        isSelected ? category.color : Color.clear,
                        lineWidth: isSelected ? 2.5 : 0
                    )
            )
            .shadow(
                color: isSelected ? category.color.opacity(0.2) : .black.opacity(0.04),
                radius: isSelected ? 8 : 4,
                x: 0,
                y: isSelected ? 4 : 2
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Section espèce

    /// Sélection de l'espèce concernée (défilement horizontal de chips)
    private var speciesSection: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            // Titre
            SectionHeader(
                title: String(localized: "report.step1.species"),
                icon: "pawprint.fill"
            )

            Text(String(localized: "report.step1.species_description"))
                .font(AppFonts.callout)
                .foregroundStyle(AppColors.textSecondary)

            // Chips défilantes horizontalement
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: AppDimensions.spacingS) {
                    ForEach(SpeciesCode.allCases) { species in
                        speciesChip(for: species)
                    }
                }
                .padding(.horizontal, AppDimensions.spacingXS)
            }
        }
        .padding(.top, AppDimensions.spacingS)
    }

    /// Chip individuel pour une espèce
    private func speciesChip(for species: SpeciesCode) -> some View {
        let isSelected = viewModel.selectedSpecies == species

        return Button {
            withAnimation(.easeInOut(duration: 0.2)) {
                if isSelected {
                    viewModel.selectedSpecies = nil
                } else {
                    viewModel.selectedSpecies = species
                }
            }
            HapticHelper.selection()
        } label: {
            HStack(spacing: AppDimensions.spacingXS) {
                Image(systemName: species.icon)
                    .font(.subheadline)
                Text(species.label)
                    .font(AppFonts.subheadline)
            }
            .padding(.horizontal, AppDimensions.spacingM)
            .padding(.vertical, AppDimensions.spacingS)
            .foregroundStyle(isSelected ? .white : AppColors.textPrimary)
            .background(
                Capsule()
                    .fill(isSelected ? AppColors.primary : AppColors.cardBackground)
            )
            .overlay(
                Capsule()
                    .stroke(
                        isSelected ? AppColors.primary : Color(uiColor: .separator),
                        lineWidth: isSelected ? 0 : 1
                    )
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Aperçu

#Preview {
    Step1EventTypeView(viewModel: ReportViewModel())
}
