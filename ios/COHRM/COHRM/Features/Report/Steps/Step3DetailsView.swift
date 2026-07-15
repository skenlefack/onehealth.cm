// Step3DetailsView.swift
// COHRM Cameroun - Étape 3 : Détails de l'événement
// Titre, description, symptômes, nombre d'affectés, date, photos

import SwiftUI

/// Étape 3 de l'assistant : saisie des détails de l'événement sanitaire
struct Step3DetailsView: View {

    // MARK: - Propriétés

    /// ViewModel partagé de l'assistant
    @Bindable var viewModel: ReportViewModel

    /// Contrôle l'affichage du sélecteur de photos
    @State private var showPhotoPicker = false

    // MARK: - Corps

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppDimensions.spacingL) {

                // Titre de la section
                SectionHeader(
                    title: String(localized: "report.step3.title"),
                    icon: "doc.text.fill"
                )

                Text(String(localized: "report.step3.description"))
                    .font(AppFonts.callout)
                    .foregroundStyle(AppColors.textSecondary)

                // Champ titre
                titleField

                // Champ description
                descriptionField

                // Sélection des symptômes
                symptomsSection

                // Nombre d'affectés et date de début
                countersSection

                // Section photos
                photosSection
            }
            .padding(AppDimensions.spacing)
        }
        .sheet(isPresented: $showPhotoPicker) {
            PhotoPickerView(
                maxSelectionCount: viewModel.maxPhotos - viewModel.selectedPhotos.count
            ) { images in
                viewModel.addPhotos(images)
            }
        }
    }

    // MARK: - Champ titre

    /// Champ de saisie du titre du signalement
    private var titleField: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
            HStack {
                Text(String(localized: "report.step3.event_title"))
                    .font(AppFonts.subheadline)
                    .foregroundStyle(AppColors.textSecondary)
                Text("*")
                    .foregroundStyle(AppColors.danger)
            }

            TextField(
                String(localized: "report.step3.event_title_placeholder"),
                text: $viewModel.reportData.title
            )
            .textFieldStyle(.plain)
            .padding(.horizontal, AppDimensions.spacingM)
            .frame(height: AppDimensions.textFieldHeight)
            .background(AppColors.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous)
                    .stroke(Color(uiColor: .separator), lineWidth: 0.5)
            )

            // Compteur de caractères
            Text("\(viewModel.reportData.title.count) / 200")
                .font(AppFonts.caption)
                .foregroundStyle(
                    viewModel.reportData.title.count > 200 ? AppColors.danger : AppColors.textTertiary
                )
                .frame(maxWidth: .infinity, alignment: .trailing)
        }
    }

    // MARK: - Champ description

    /// Champ de saisie multilignes pour la description
    private var descriptionField: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
            HStack {
                Text(String(localized: "report.step3.event_description"))
                    .font(AppFonts.subheadline)
                    .foregroundStyle(AppColors.textSecondary)
                Text("*")
                    .foregroundStyle(AppColors.danger)
            }

            TextEditor(text: $viewModel.reportData.description)
                .font(AppFonts.body)
                .scrollContentBackground(.hidden)
                .frame(minHeight: 120, maxHeight: 200)
                .padding(AppDimensions.spacingM)
                .background(AppColors.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous)
                        .stroke(Color(uiColor: .separator), lineWidth: 0.5)
                )
                .overlay(alignment: .topLeading) {
                    // Placeholder pour TextEditor
                    if viewModel.reportData.description.isEmpty {
                        Text(String(localized: "report.step3.event_description_placeholder"))
                            .font(AppFonts.body)
                            .foregroundStyle(AppColors.textTertiary)
                            .padding(.horizontal, AppDimensions.spacingM + 4)
                            .padding(.vertical, AppDimensions.spacingM + 8)
                            .allowsHitTesting(false)
                    }
                }
        }
    }

    // MARK: - Sélection de symptômes

    /// Grille fluide de chips de symptômes
    private var symptomsSection: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            SectionHeader(
                title: String(localized: "report.step3.symptoms"),
                icon: "stethoscope"
            )

            Text(String(localized: "report.step3.symptoms_description"))
                .font(AppFonts.callout)
                .foregroundStyle(AppColors.textSecondary)

            // FlowLayout de chips
            FlowLayout(spacing: AppDimensions.spacingS) {
                ForEach(SymptomCode.allCases) { symptom in
                    symptomChip(for: symptom)
                }
            }
        }
    }

    /// Chip individuel de symptôme avec toggle
    private func symptomChip(for symptom: SymptomCode) -> some View {
        let isSelected = viewModel.isSymptomSelected(symptom)

        return Button {
            withAnimation(.easeInOut(duration: 0.15)) {
                viewModel.toggleSymptom(symptom)
            }
        } label: {
            HStack(spacing: AppDimensions.spacingXS) {
                if isSelected {
                    Image(systemName: "checkmark")
                        .font(.caption.weight(.bold))
                }
                Text(symptom.label)
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
                        isSelected ? Color.clear : Color(uiColor: .separator),
                        lineWidth: isSelected ? 0 : 1
                    )
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Compteurs (affectés + date)

    /// Nombre d'affectés et date de début de l'événement
    private var countersSection: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {

            // Nombre d'affectés
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                Text(String(localized: "report.step3.affected_count"))
                    .font(AppFonts.subheadline)
                    .foregroundStyle(AppColors.textSecondary)

                HStack {
                    // Bouton diminuer
                    Button {
                        let current = viewModel.reportData.affectedCount ?? 0
                        if current > 0 {
                            viewModel.reportData.affectedCount = current - 1
                        }
                        HapticHelper.selection()
                    } label: {
                        Image(systemName: "minus.circle.fill")
                            .font(.title2)
                            .foregroundStyle(AppColors.muted)
                    }

                    // Affichage du nombre
                    Text("\(viewModel.reportData.affectedCount ?? 0)")
                        .font(AppFonts.statNumber)
                        .foregroundStyle(AppColors.textPrimary)
                        .frame(minWidth: 60)
                        .multilineTextAlignment(.center)

                    // Bouton augmenter
                    Button {
                        let current = viewModel.reportData.affectedCount ?? 0
                        viewModel.reportData.affectedCount = current + 1
                        HapticHelper.selection()
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                            .foregroundStyle(AppColors.primary)
                    }

                    Spacer()
                }
                .padding(AppDimensions.spacingM)
                .background(AppColors.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous)
                        .stroke(Color(uiColor: .separator), lineWidth: 0.5)
                )
            }

            // Date de début de l'événement
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                Text(String(localized: "report.step3.date_started"))
                    .font(AppFonts.subheadline)
                    .foregroundStyle(AppColors.textSecondary)

                DatePicker(
                    String(localized: "report.step3.date_started"),
                    selection: Binding(
                        get: { viewModel.reportData.dateStarted ?? Date() },
                        set: { viewModel.reportData.dateStarted = $0 }
                    ),
                    in: ...Date(),
                    displayedComponents: [.date]
                )
                .datePickerStyle(.compact)
                .labelsHidden()
                .environment(\.locale, Locale(identifier: "fr_FR"))
                .padding(.horizontal, AppDimensions.spacingM)
                .frame(height: AppDimensions.textFieldHeight)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(AppColors.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous)
                        .stroke(Color(uiColor: .separator), lineWidth: 0.5)
                )
            }
        }
    }

    // MARK: - Section photos

    /// Section d'ajout et d'apercu des photos
    private var photosSection: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            SectionHeader(
                title: String(localized: "report.step3.photos"),
                icon: "camera.fill"
            )

            Text(String(localized: "report.step3.photos_description \(viewModel.maxPhotos)"))
                .font(AppFonts.callout)
                .foregroundStyle(AppColors.textSecondary)

            // Bouton d'ajout de photos
            if viewModel.canAddPhotos {
                Button {
                    showPhotoPicker = true
                    HapticHelper.impact(.light)
                } label: {
                    HStack(spacing: AppDimensions.spacingS) {
                        Image(systemName: "photo.badge.plus")
                            .font(.body.weight(.semibold))
                        Text(String(localized: "report.step3.add_photos"))
                            .font(AppFonts.button)
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: AppDimensions.buttonHeight)
                    .foregroundStyle(AppColors.primary)
                    .background(
                        RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous)
                            .stroke(AppColors.primary, style: StrokeStyle(lineWidth: 1.5, dash: [8, 4]))
                    )
                }
            }

            // Grille de miniatures des photos sélectionnées
            if !viewModel.selectedPhotos.isEmpty {
                LazyVGrid(
                    columns: [
                        GridItem(.adaptive(minimum: AppDimensions.thumbnailSize, maximum: AppDimensions.thumbnailSize + 20)),
                    ],
                    spacing: AppDimensions.spacingS
                ) {
                    ForEach(Array(viewModel.selectedPhotos.enumerated()), id: \.offset) { index, image in
                        PhotoThumbnail(image: image) {
                            viewModel.removePhoto(at: index)
                        }
                    }
                }

                // Compteur de photos
                Text(String(localized: "report.step3.photos_count \(viewModel.selectedPhotos.count) \(viewModel.maxPhotos)"))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textTertiary)
            }
        }
    }
}

// MARK: - Aperçu

#Preview {
    Step3DetailsView(viewModel: ReportViewModel())
}
