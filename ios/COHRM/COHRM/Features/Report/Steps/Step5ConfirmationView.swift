// Step5ConfirmationView.swift
// COHRM Cameroun - Étape 5 : Confirmation et envoi du signalement
// Récapitulatif complet avec bouton d'envoi

import SwiftUI
import SwiftData

/// Étape 5 de l'assistant : récapitulatif des données et soumission
struct Step5ConfirmationView: View {

    // MARK: - Propriétés

    /// ViewModel partagé de l'assistant
    @Bindable var viewModel: ReportViewModel

    /// Contexte SwiftData pour la persistance
    let modelContext: ModelContext

    /// Surveillance réseau pour l'indicateur hors-ligne
    @EnvironmentObject private var networkMonitor: NetworkMonitor

    // MARK: - Corps

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppDimensions.spacingL) {

                // Titre de la section
                SectionHeader(
                    title: String(localized: "report.step5.title"),
                    icon: "checkmark.seal.fill"
                )

                Text(String(localized: "report.step5.description"))
                    .font(AppFonts.callout)
                    .foregroundStyle(AppColors.textSecondary)

                // Indicateur de connectivité réseau
                networkStatusBanner

                // Section : Type d'événement
                eventTypeSection

                // Section : Localisation
                locationSection

                // Section : Détails
                detailsSection

                // Section : Photos
                if !viewModel.selectedPhotos.isEmpty {
                    photosSection
                }

                // Section : Informations personnelles
                personalInfoSection

                // Bouton d'envoi
                submitButton
                    .padding(.top, AppDimensions.spacingS)
            }
            .padding(AppDimensions.spacing)
        }
    }

    // MARK: - Indicateur réseau

    /// Bannière indiquant l'état de la connexion réseau
    private var networkStatusBanner: some View {
        HStack(spacing: AppDimensions.spacingS) {
            Image(systemName: networkMonitor.isConnected ? "wifi" : "wifi.slash")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(networkMonitor.isConnected ? AppColors.success : AppColors.warning)

            VStack(alignment: .leading, spacing: 2) {
                Text(networkMonitor.isConnected
                     ? String(localized: "report.step5.network_online")
                     : String(localized: "report.step5.network_offline"))
                    .font(AppFonts.subheadline)
                    .foregroundStyle(AppColors.textPrimary)

                Text(networkMonitor.isConnected
                     ? String(localized: "report.step5.network_online_hint")
                     : String(localized: "report.step5.network_offline_hint"))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)
            }

            Spacer()
        }
        .padding(AppDimensions.spacingM)
        .background(
            (networkMonitor.isConnected ? AppColors.success : AppColors.warning).opacity(0.08)
        )
        .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous))
    }

    // MARK: - Section type d'événement

    /// Récapitulatif de la catégorie et de l'espèce sélectionnées
    private var eventTypeSection: some View {
        SummaryCard(
            title: String(localized: "report.step5.section.type"),
            icon: "tag.fill"
        ) {
            VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
                // Catégorie
                if let category = EventCategory(rawValue: viewModel.reportData.category) {
                    SummaryRow(
                        label: String(localized: "report.step5.category"),
                        value: category.label,
                        valueColor: category.color,
                        valueIcon: category.icon
                    )
                }

                // Espèce
                if let species = SpeciesCode(rawValue: viewModel.reportData.species) {
                    SummaryRow(
                        label: String(localized: "report.step5.species"),
                        value: species.label,
                        valueIcon: species.icon
                    )
                }
            }
        }
    }

    // MARK: - Section localisation

    /// Récapitulatif de la localisation
    private var locationSection: some View {
        SummaryCard(
            title: String(localized: "report.step5.section.location"),
            icon: "mappin.and.ellipse"
        ) {
            VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
                // Région
                if let region = CameroonRegion.all.first(where: { $0.id == viewModel.reportData.region }) {
                    SummaryRow(
                        label: String(localized: "report.step5.region"),
                        value: region.name
                    )
                }

                // Département
                if !viewModel.reportData.department.isEmpty {
                    SummaryRow(
                        label: String(localized: "report.step5.department"),
                        value: viewModel.reportData.department
                    )
                }

                // District
                if !viewModel.reportData.district.isEmpty {
                    SummaryRow(
                        label: String(localized: "report.step5.district"),
                        value: viewModel.reportData.district
                    )
                }

                // Localité
                if !viewModel.reportData.locality.isEmpty {
                    SummaryRow(
                        label: String(localized: "report.step5.locality"),
                        value: viewModel.reportData.locality
                    )
                }

                // Description du lieu
                if !viewModel.reportData.locationDescription.isEmpty {
                    SummaryRow(
                        label: String(localized: "report.step5.location_description"),
                        value: viewModel.reportData.locationDescription
                    )
                }

                // Coordonnées GPS
                if let lat = viewModel.reportData.latitude,
                   let lng = viewModel.reportData.longitude {
                    SummaryRow(
                        label: String(localized: "report.step5.gps"),
                        value: "\(String(format: "%.4f", lat)), \(String(format: "%.4f", lng))",
                        valueIcon: "location.fill"
                    )
                }
            }
        }
    }

    // MARK: - Section détails

    /// Récapitulatif des détails de l'événement
    private var detailsSection: some View {
        SummaryCard(
            title: String(localized: "report.step5.section.details"),
            icon: "doc.text.fill"
        ) {
            VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
                // Titre
                SummaryRow(
                    label: String(localized: "report.step5.event_title"),
                    value: viewModel.reportData.title
                )

                // Description
                SummaryRow(
                    label: String(localized: "report.step5.event_description"),
                    value: viewModel.reportData.description.truncated(to: 200)
                )

                // Symptômes
                if !viewModel.reportData.symptoms.isEmpty {
                    VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                        Text(String(localized: "report.step5.symptoms"))
                            .font(AppFonts.caption)
                            .foregroundStyle(AppColors.textTertiary)

                        // Chips de symptômes sélectionnés
                        FlowLayout(spacing: AppDimensions.spacingXS) {
                            ForEach(viewModel.reportData.symptoms, id: \.self) { code in
                                if let symptom = SymptomCode(rawValue: code) {
                                    StatusBadge(symptom.label, color: AppColors.primary)
                                }
                            }
                        }
                    }
                }

                // Nombre d'affectés
                if let count = viewModel.reportData.affectedCount, count > 0 {
                    SummaryRow(
                        label: String(localized: "report.step5.affected_count"),
                        value: "\(count)"
                    )
                }

                // Date de début
                if let date = viewModel.reportData.dateStarted {
                    SummaryRow(
                        label: String(localized: "report.step5.date_started"),
                        value: date.shortLocalizedString
                    )
                }
            }
        }
    }

    // MARK: - Section photos

    /// Aperçu des photos sélectionnées
    private var photosSection: some View {
        SummaryCard(
            title: String(localized: "report.step5.section.photos"),
            icon: "camera.fill"
        ) {
            VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
                Text(String(localized: "report.step5.photos_count \(viewModel.selectedPhotos.count)"))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)

                // Miniatures défilantes
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: AppDimensions.spacingS) {
                        ForEach(Array(viewModel.selectedPhotos.enumerated()), id: \.offset) { _, image in
                            Image(uiImage: image)
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(
                                    width: AppDimensions.thumbnailSize,
                                    height: AppDimensions.thumbnailSize
                                )
                                .clipShape(
                                    RoundedRectangle(
                                        cornerRadius: AppDimensions.cornerRadiusS,
                                        style: .continuous
                                    )
                                )
                        }
                    }
                }
            }
        }
    }

    // MARK: - Section informations personnelles

    /// Récapitulatif des informations du déclarant
    private var personalInfoSection: some View {
        SummaryCard(
            title: String(localized: "report.step5.section.personal"),
            icon: "person.fill"
        ) {
            VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
                if viewModel.reportData.isAnonymous {
                    HStack(spacing: AppDimensions.spacingS) {
                        Image(systemName: "eye.slash.fill")
                            .font(.subheadline)
                            .foregroundStyle(AppColors.info)
                        Text(String(localized: "report.step5.anonymous"))
                            .font(AppFonts.callout)
                            .foregroundStyle(AppColors.textSecondary)
                    }
                } else {
                    // Nom
                    if !viewModel.reportData.reporterName.isEmpty {
                        SummaryRow(
                            label: String(localized: "report.step5.reporter_name"),
                            value: viewModel.reportData.reporterName,
                            valueIcon: "person.fill"
                        )
                    }

                    // Téléphone
                    if !viewModel.reportData.reporterPhone.isEmpty {
                        SummaryRow(
                            label: String(localized: "report.step5.reporter_phone"),
                            value: "+237 \(viewModel.reportData.reporterPhone)",
                            valueIcon: "phone.fill"
                        )
                    }

                    // Email
                    if !viewModel.reportData.reporterEmail.isEmpty {
                        SummaryRow(
                            label: String(localized: "report.step5.reporter_email"),
                            value: viewModel.reportData.reporterEmail,
                            valueIcon: "envelope.fill"
                        )
                    }
                }
            }
        }
    }

    // MARK: - Bouton d'envoi

    /// Bouton principal d'envoi du signalement
    private var submitButton: some View {
        PrimaryButton(
            String(localized: "report.step5.submit"),
            icon: "paperplane.fill",
            isLoading: viewModel.isSubmitting
        ) {
            Task {
                await viewModel.submitReport(modelContext: modelContext)
            }
        }
        .disabled(viewModel.isSubmitting)
    }
}

// MARK: - Composants récapitulatifs

/// Carte récapitulative avec titre et contenu
struct SummaryCard<Content: View>: View {

    let title: String
    let icon: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            // En-tête de la carte
            HStack(spacing: AppDimensions.spacingS) {
                Image(systemName: icon)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(AppColors.primary)
                Text(title)
                    .font(AppFonts.headline)
                    .foregroundStyle(AppColors.textPrimary)
            }

            content()
        }
        .padding(AppDimensions.cardPadding)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(AppColors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusL, style: .continuous)
                .stroke(Color(uiColor: .separator), lineWidth: 0.5)
        )
    }
}

/// Ligne de récapitulatif : label / valeur
struct SummaryRow: View {

    let label: String
    let value: String
    var valueColor: Color = AppColors.textPrimary
    var valueIcon: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(AppFonts.caption)
                .foregroundStyle(AppColors.textTertiary)

            HStack(spacing: AppDimensions.spacingXS) {
                if let icon = valueIcon {
                    Image(systemName: icon)
                        .font(.caption)
                        .foregroundStyle(valueColor)
                }

                Text(value)
                    .font(AppFonts.callout)
                    .foregroundStyle(valueColor)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}

// MARK: - Aperçu

#Preview {
    let config = ModelConfiguration(isStoredInMemoryOnly: true)
    let container = try! ModelContainer(
        for: ReportModel.self, PhotoAttachment.self,
        configurations: config
    )

    Step5ConfirmationView(
        viewModel: ReportViewModel(),
        modelContext: container.mainContext
    )
    .environmentObject(NetworkMonitor.shared)
}
