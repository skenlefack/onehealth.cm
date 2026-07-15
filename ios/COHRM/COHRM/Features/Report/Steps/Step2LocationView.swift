// Step2LocationView.swift
// COHRM Cameroun - Étape 2 : Localisation de l'événement
// Carte interactive, sélection de région/département, champs de localité

import SwiftUI
import MapKit

/// Étape 2 de l'assistant : localisation géographique de l'événement
struct Step2LocationView: View {

    // MARK: - Propriétés

    /// ViewModel partagé de l'assistant
    @Bindable var viewModel: ReportViewModel

    /// Gestionnaire de localisation GPS
    @StateObject private var locationManager = LocationManager()

    /// Position de la carte
    @State private var cameraPosition: MapCameraPosition = .region(LocationManager.cameroonRegion)

    /// Coordonnée de l'annotation draggable
    @State private var annotationCoordinate: CLLocationCoordinate2D = LocationManager.defaultCoordinate

    /// Indique si l'annotation a été positionnée par l'utilisateur
    @State private var hasPlacedPin = false

    // MARK: - Corps

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppDimensions.spacingL) {

                // Titre de la section
                SectionHeader(
                    title: String(localized: "report.step2.title"),
                    icon: "mappin.and.ellipse"
                )

                Text(String(localized: "report.step2.description"))
                    .font(AppFonts.callout)
                    .foregroundStyle(AppColors.textSecondary)

                // Carte interactive
                mapSection

                // Bouton de géolocalisation
                locateButton

                // Sélecteurs région et département
                regionDepartmentSection

                // Champs de localité
                localitySection
            }
            .padding(AppDimensions.spacing)
        }
        .onChange(of: locationManager.location) { _, newLocation in
            guard let coordinate = newLocation else { return }
            updateFromGPS(coordinate)
        }
    }

    // MARK: - Carte

    /// Carte MapKit avec annotation positionnée
    private var mapSection: some View {
        Map(position: $cameraPosition, interactionModes: [.pan, .zoom]) {
            // Annotation de la position sélectionnée
            if hasPlacedPin {
                Annotation(
                    String(localized: "report.step2.pin_label"),
                    coordinate: annotationCoordinate
                ) {
                    Image(systemName: "mappin.circle.fill")
                        .font(.title)
                        .foregroundStyle(AppColors.danger)
                        .background(
                            Circle()
                                .fill(.white)
                                .frame(width: 24, height: 24)
                        )
                }
            }
        }
        .frame(height: 220)
        .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusL, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusL, style: .continuous)
                .stroke(Color(uiColor: .separator), lineWidth: 0.5)
        )
        .onTapGesture { location in
            // Note: Pour un positionnement plus précis,
            // on utilise MapReader dans une version ultérieure.
            // Ici, on utilise le bouton "Localiser" pour le GPS.
        }
    }

    /// Bouton pour récupérer la position GPS actuelle
    private var locateButton: some View {
        Button {
            locationManager.getCurrentLocation()
            HapticHelper.impact(.medium)
        } label: {
            HStack(spacing: AppDimensions.spacingS) {
                if locationManager.isLocating {
                    ProgressView()
                        .tint(AppColors.primary)
                } else {
                    Image(systemName: "location.fill")
                        .font(.body.weight(.semibold))
                }

                Text(String(localized: "report.step2.locate"))
                    .font(AppFonts.button)
            }
            .frame(maxWidth: .infinity)
            .frame(height: AppDimensions.buttonHeight)
            .foregroundStyle(AppColors.primary)
            .background(AppColors.primary.opacity(0.1))
            .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous))
        }
        .disabled(locationManager.isLocating)

        // Affichage d'erreur de localisation
        if let error = locationManager.error {
            Text(error)
                .font(AppFonts.caption)
                .foregroundStyle(AppColors.danger)
                .padding(.top, AppDimensions.spacingXS)
        }
    }

    // MARK: - Sélecteurs région / département

    /// Sélecteurs en Picker pour la région et le département
    private var regionDepartmentSection: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {

            // Sélecteur de région
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                Text(String(localized: "report.step2.region"))
                    .font(AppFonts.subheadline)
                    .foregroundStyle(AppColors.textSecondary)

                Picker(
                    String(localized: "report.step2.region"),
                    selection: $viewModel.reportData.region
                ) {
                    Text(String(localized: "report.step2.select_region"))
                        .tag("")

                    ForEach(CameroonRegion.all) { region in
                        Text(region.name).tag(region.id)
                    }
                }
                .pickerStyle(.menu)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, AppDimensions.spacingM)
                .frame(height: AppDimensions.textFieldHeight)
                .background(AppColors.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous)
                        .stroke(Color(uiColor: .separator), lineWidth: 0.5)
                )
            }

            // Sélecteur de département (filtré par région)
            if let selectedRegion = CameroonRegion.all.first(where: { $0.id == viewModel.reportData.region }) {
                VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                    Text(String(localized: "report.step2.department"))
                        .font(AppFonts.subheadline)
                        .foregroundStyle(AppColors.textSecondary)

                    Picker(
                        String(localized: "report.step2.department"),
                        selection: $viewModel.reportData.department
                    ) {
                        Text(String(localized: "report.step2.select_department"))
                            .tag("")

                        ForEach(selectedRegion.departments, id: \.self) { department in
                            Text(department).tag(department)
                        }
                    }
                    .pickerStyle(.menu)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, AppDimensions.spacingM)
                    .frame(height: AppDimensions.textFieldHeight)
                    .background(AppColors.cardBackground)
                    .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous)
                            .stroke(Color(uiColor: .separator), lineWidth: 0.5)
                    )
                }
                .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.2), value: viewModel.reportData.region)
    }

    // MARK: - Champs de localité

    /// Champs texte pour le district, la localité et la description
    private var localitySection: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {

            // District
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                Text(String(localized: "report.step2.district"))
                    .font(AppFonts.subheadline)
                    .foregroundStyle(AppColors.textSecondary)

                TextField(
                    String(localized: "report.step2.district_placeholder"),
                    text: $viewModel.reportData.district
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
            }

            // Localité
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                Text(String(localized: "report.step2.locality"))
                    .font(AppFonts.subheadline)
                    .foregroundStyle(AppColors.textSecondary)

                TextField(
                    String(localized: "report.step2.locality_placeholder"),
                    text: $viewModel.reportData.locality
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
            }

            // Description de la localisation
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                Text(String(localized: "report.step2.location_description"))
                    .font(AppFonts.subheadline)
                    .foregroundStyle(AppColors.textSecondary)

                TextField(
                    String(localized: "report.step2.location_description_placeholder"),
                    text: $viewModel.reportData.locationDescription,
                    axis: .vertical
                )
                .textFieldStyle(.plain)
                .lineLimit(2...4)
                .padding(AppDimensions.spacingM)
                .background(AppColors.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous)
                        .stroke(Color(uiColor: .separator), lineWidth: 0.5)
                )
            }

            // Coordonnées GPS affichées si disponibles
            if let lat = viewModel.reportData.latitude,
               let lng = viewModel.reportData.longitude {
                HStack(spacing: AppDimensions.spacingXS) {
                    Image(systemName: "location.circle")
                        .font(.caption)
                        .foregroundStyle(AppColors.success)
                    Text(String(localized: "report.step2.coordinates \(String(format: "%.4f", lat)) \(String(format: "%.4f", lng))"))
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textTertiary)
                }
            }
        }
    }

    // MARK: - Fonctions utilitaires

    /// Met à jour les données depuis les coordonnées GPS
    private func updateFromGPS(_ coordinate: CLLocationCoordinate2D) {
        annotationCoordinate = coordinate
        hasPlacedPin = true
        viewModel.reportData.latitude = coordinate.latitude
        viewModel.reportData.longitude = coordinate.longitude

        // Centrer la carte sur la position
        cameraPosition = .region(
            MKCoordinateRegion(
                center: coordinate,
                span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
            )
        )

        // Remplir automatiquement les champs depuis le geocoding
        if let placemark = locationManager.placemark {
            // Tenter de mapper la région administrative au code CameroonRegion
            if let adminArea = placemark.administrativeArea {
                let matchedRegion = CameroonRegion.all.first { region in
                    adminArea.localizedCaseInsensitiveContains(region.name)
                }
                if let region = matchedRegion {
                    viewModel.reportData.region = region.id
                }
            }

            // Département
            if let subAdmin = placemark.subAdministrativeArea {
                viewModel.reportData.department = subAdmin
            }

            // Localité
            if let locality = placemark.locality ?? placemark.name {
                viewModel.reportData.locality = locality
            }
        }
    }
}

// MARK: - Aperçu

#Preview {
    Step2LocationView(viewModel: ReportViewModel())
}
