// PublicReportView.swift
// COHRM Cameroun - Vue de signalement public (sans authentification)
//
// Permet a tout citoyen de soumettre un signalement
// et de suivre un signalement existant par son code.

import SwiftUI

/// Vue de signalement public accessible sans connexion
struct PublicReportView: View {

    // MARK: - Proprietes

    @State private var viewModel = PublicReportViewModel()
    @State private var activeSection: ActiveSection = .report
    @Environment(\.dismiss) private var dismiss

    /// Section active (signalement ou suivi)
    enum ActiveSection: String, CaseIterable {
        case report
        case track
    }

    // MARK: - Corps

    var body: some View {
        NavigationStack {
            ZStack(alignment: .top) {
                AppColors.groupedBackground
                    .ignoresSafeArea()

                ScrollView(.vertical, showsIndicators: false) {
                    VStack(spacing: 0) {
                        // En-tete avec degradé
                        headerSection

                        // Contenu principal
                        VStack(spacing: AppDimensions.spacingL) {
                            // Selecteur de section
                            sectionPicker

                            // Contenu selon la section active
                            switch activeSection {
                            case .report:
                                if viewModel.showSuccess {
                                    successView
                                } else {
                                    reportFormSection
                                }
                            case .track:
                                trackingSection
                            }
                        }
                        .padding(.horizontal, AppDimensions.spacing)
                        .padding(.top, AppDimensions.spacingL)
                        .padding(.bottom, AppDimensions.spacingXXL)
                    }
                }
            }
            .navigationBarHidden(true)
            .task {
                await viewModel.loadRegions()
            }
        }
    }

    // MARK: - En-tete

    /// En-tete avec degradé et titre
    private var headerSection: some View {
        ZStack(alignment: .bottomLeading) {
            LinearGradient(
                colors: [Color(hex: 0x1B4F72), Color(hex: 0x2980B9)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .frame(height: 180)
            .clipShape(
                UnevenRoundedRectangle(
                    bottomLeadingRadius: AppDimensions.cornerRadiusXL,
                    bottomTrailingRadius: AppDimensions.cornerRadiusXL
                )
            )

            // Decorations
            ZStack {
                Circle()
                    .fill(.white.opacity(0.05))
                    .frame(width: 180, height: 180)
                    .offset(x: 150, y: -50)

                Circle()
                    .fill(.white.opacity(0.03))
                    .frame(width: 120, height: 120)
                    .offset(x: -60, y: -10)
            }

            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                // Bouton retour
                Button {
                    dismiss()
                } label: {
                    HStack(spacing: AppDimensions.spacingXS) {
                        Image(systemName: "chevron.left")
                            .font(.body.weight(.semibold))
                        Text(String(localized: "public_report.back"))
                            .font(AppFonts.subheadline)
                    }
                    .foregroundStyle(.white.opacity(0.8))
                }
                .padding(.bottom, AppDimensions.spacingS)

                HStack(spacing: AppDimensions.spacingS) {
                    Image(systemName: "megaphone.fill")
                        .font(.system(size: 24, weight: .medium))
                        .foregroundStyle(.white.opacity(0.9))
                        .symbolRenderingMode(.hierarchical)

                    Text(String(localized: "public_report.title"))
                        .font(AppFonts.largeTitle)
                        .foregroundStyle(.white)
                }

                Text(String(localized: "public_report.subtitle"))
                    .font(AppFonts.subheadline)
                    .foregroundStyle(.white.opacity(0.8))
            }
            .padding(.horizontal, AppDimensions.spacingL)
            .padding(.bottom, AppDimensions.spacingL)
        }
    }

    // MARK: - Selecteur de section

    /// Picker segment pour basculer entre signalement et suivi
    private var sectionPicker: some View {
        HStack(spacing: 0) {
            ForEach(ActiveSection.allCases, id: \.rawValue) { section in
                Button {
                    withAnimation(.easeInOut(duration: 0.25)) {
                        activeSection = section
                    }
                    HapticHelper.selection()
                } label: {
                    VStack(spacing: AppDimensions.spacingXS) {
                        HStack(spacing: AppDimensions.spacingXS) {
                            Image(systemName: section == .report ? "plus.circle.fill" : "magnifyingglass.circle.fill")
                                .font(.subheadline.weight(.semibold))
                            Text(section == .report
                                ? String(localized: "public_report.tab.report")
                                : String(localized: "public_report.tab.track")
                            )
                            .font(AppFonts.subheadline)
                        }
                        .foregroundStyle(activeSection == section ? AppColors.primary : AppColors.textTertiary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, AppDimensions.spacingM)

                        Rectangle()
                            .fill(activeSection == section ? AppColors.primary : .clear)
                            .frame(height: 2)
                    }
                }
            }
        }
        .background(AppColors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous))
    }

    // MARK: - Formulaire de signalement

    /// Section formulaire de signalement
    private var reportFormSection: some View {
        VStack(spacing: AppDimensions.spacingL) {
            // Message d'erreur
            if let error = viewModel.error {
                errorBanner(error)
            }

            // Telephone
            FormField(
                label: String(localized: "public_report.field.phone"),
                icon: "phone.fill",
                isRequired: true
            ) {
                TextField(
                    String(localized: "public_report.placeholder.phone"),
                    text: $viewModel.phone
                )
                .keyboardType(.phonePad)
                .textContentType(.telephoneNumber)
            }

            // Nom
            FormField(
                label: String(localized: "public_report.field.name"),
                icon: "person.fill",
                isRequired: false
            ) {
                TextField(
                    String(localized: "public_report.placeholder.name"),
                    text: $viewModel.name
                )
                .textContentType(.name)
            }

            // Region
            FormField(
                label: String(localized: "public_report.field.region"),
                icon: "map.fill",
                isRequired: false
            ) {
                if viewModel.isLoadingRegions {
                    HStack {
                        ProgressView()
                            .controlSize(.small)
                        Text(String(localized: "public_report.loading_regions"))
                            .font(AppFonts.caption)
                            .foregroundStyle(AppColors.textTertiary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.vertical, AppDimensions.spacingS)
                } else {
                    Picker(
                        String(localized: "public_report.placeholder.region"),
                        selection: $viewModel.region
                    ) {
                        Text(String(localized: "public_report.placeholder.region"))
                            .tag("")
                        ForEach(viewModel.regions) { region in
                            Text(region.name).tag(region.code)
                        }
                    }
                    .pickerStyle(.menu)
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            }

            // Categorie
            FormField(
                label: String(localized: "public_report.field.category"),
                icon: "tag.fill",
                isRequired: false
            ) {
                Picker(
                    String(localized: "public_report.field.category"),
                    selection: $viewModel.category
                ) {
                    ForEach(PublicReportViewModel.categories, id: \.value) { cat in
                        Text(cat.label).tag(cat.value)
                    }
                }
                .pickerStyle(.menu)
                .frame(maxWidth: .infinity, alignment: .leading)
            }

            // Description
            FormField(
                label: String(localized: "public_report.field.description"),
                icon: "text.alignleft",
                isRequired: true
            ) {
                TextEditor(text: $viewModel.description)
                    .frame(minHeight: 120)
                    .scrollContentBackground(.hidden)
                    .font(AppFonts.body)
                    .overlay(alignment: .topLeading) {
                        if viewModel.description.isEmpty {
                            Text(String(localized: "public_report.placeholder.description"))
                                .font(AppFonts.body)
                                .foregroundStyle(AppColors.textTertiary)
                                .padding(.top, 8)
                                .padding(.leading, 4)
                                .allowsHitTesting(false)
                        }
                    }
            }

            // Bouton de soumission
            PrimaryButton(
                String(localized: "public_report.submit"),
                icon: "paperplane.fill",
                isLoading: viewModel.isSubmitting
            ) {
                Task {
                    await viewModel.submitReport()
                }
            }
            .disabled(!viewModel.canSubmit)
            .opacity(viewModel.canSubmit ? 1.0 : 0.5)
        }
    }

    // MARK: - Vue de succes

    /// Affichee apres une soumission reussie
    private var successView: some View {
        VStack(spacing: AppDimensions.spacingL) {
            // Icone de succes
            ZStack {
                Circle()
                    .fill(AppColors.success.opacity(0.12))
                    .frame(width: 80, height: 80)

                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 44, weight: .medium))
                    .foregroundStyle(AppColors.success)
                    .symbolRenderingMode(.hierarchical)
            }

            Text(String(localized: "public_report.success.title"))
                .font(AppFonts.title)
                .foregroundStyle(AppColors.textPrimary)
                .multilineTextAlignment(.center)

            Text(String(localized: "public_report.success.message"))
                .font(AppFonts.callout)
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)

            // Code de suivi
            VStack(spacing: AppDimensions.spacingS) {
                Text(String(localized: "public_report.success.code_label"))
                    .font(AppFonts.subheadline)
                    .foregroundStyle(AppColors.textSecondary)

                Text(viewModel.trackingCode)
                    .font(.system(size: 28, weight: .bold, design: .monospaced))
                    .foregroundStyle(AppColors.primary)
                    .padding(.horizontal, AppDimensions.spacingL)
                    .padding(.vertical, AppDimensions.spacingM)
                    .background(AppColors.primary.opacity(0.08))
                    .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous)
                            .stroke(AppColors.primary.opacity(0.2), lineWidth: 1)
                    )
                    .textSelection(.enabled)
            }

            // Bouton copier
            Button {
                UIPasteboard.general.string = viewModel.trackingCode
                HapticHelper.notification(.success)
            } label: {
                HStack(spacing: AppDimensions.spacingS) {
                    Image(systemName: "doc.on.doc")
                        .font(.subheadline.weight(.semibold))
                    Text(String(localized: "public_report.success.copy"))
                        .font(AppFonts.subheadline)
                }
                .foregroundStyle(AppColors.primary)
            }

            // Nouveau signalement
            PrimaryButton(
                String(localized: "public_report.success.new_report"),
                icon: "plus.circle"
            ) {
                withAnimation {
                    viewModel.resetForm()
                }
            }
        }
        .padding(AppDimensions.sectionPadding)
        .cardStyle()
    }

    // MARK: - Section suivi

    /// Section de suivi d'un signalement existant
    private var trackingSection: some View {
        VStack(spacing: AppDimensions.spacingL) {
            // Message d'erreur
            if let error = viewModel.error {
                errorBanner(error)
            }

            // Champ de saisie du code
            FormField(
                label: String(localized: "public_report.track.code_label"),
                icon: "number",
                isRequired: true
            ) {
                TextField(
                    String(localized: "public_report.track.code_placeholder"),
                    text: $viewModel.trackingInput
                )
                .textInputAutocapitalization(.characters)
                .autocorrectionDisabled()
            }

            // Bouton de recherche
            PrimaryButton(
                String(localized: "public_report.track.search"),
                icon: "magnifyingglass",
                isLoading: viewModel.isTracking
            ) {
                Task {
                    await viewModel.trackReport()
                }
            }
            .disabled(viewModel.trackingInput.trimmingCharacters(in: .whitespaces).isEmpty)
            .opacity(viewModel.trackingInput.trimmingCharacters(in: .whitespaces).isEmpty ? 0.5 : 1.0)

            // Resultat du suivi
            if let result = viewModel.trackingResult {
                trackingResultCard(result)
            }
        }
    }

    // MARK: - Carte resultat de suivi

    /// Affiche le resultat du suivi d'un signalement
    private func trackingResultCard(_ data: TrackingData) -> some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            // En-tete
            HStack(spacing: AppDimensions.spacingS) {
                Image(systemName: "doc.text.magnifyingglass")
                    .font(.headline)
                    .foregroundStyle(AppColors.primary)

                Text(String(localized: "public_report.track.result_title"))
                    .font(AppFonts.headline)
                    .foregroundStyle(AppColors.textPrimary)

                Spacer()
            }

            Divider()

            // Code
            trackingInfoRow(
                icon: "number",
                label: String(localized: "public_report.track.field_code"),
                value: data.code
            )

            // Statut
            HStack(spacing: AppDimensions.spacingS) {
                Image(systemName: "circle.fill")
                    .font(.caption2)
                    .foregroundStyle(statusColor(for: data.status))

                Text(String(localized: "public_report.track.field_status"))
                    .font(AppFonts.subheadline)
                    .foregroundStyle(AppColors.textSecondary)

                Spacer()

                StatusBadge(
                    statusLabel(for: data.status),
                    color: statusColor(for: data.status),
                    icon: statusIcon(for: data.status)
                )
            }

            // Priorite
            trackingInfoRow(
                icon: "flag.fill",
                label: String(localized: "public_report.track.field_priority"),
                value: priorityLabel(for: data.priority)
            )

            // Date de creation
            if let date = data.createdAt {
                trackingInfoRow(
                    icon: "calendar",
                    label: String(localized: "public_report.track.field_created"),
                    value: date
                )
            }

            // Derniere mise a jour
            if let date = data.updatedAt {
                trackingInfoRow(
                    icon: "clock.arrow.circlepath",
                    label: String(localized: "public_report.track.field_updated"),
                    value: date
                )
            }
        }
        .padding(AppDimensions.sectionPadding)
        .cardStyle()
        .transition(.move(edge: .bottom).combined(with: .opacity))
    }

    /// Ligne d'information dans la carte de suivi
    private func trackingInfoRow(icon: String, label: String, value: String) -> some View {
        HStack(spacing: AppDimensions.spacingS) {
            Image(systemName: icon)
                .font(.subheadline)
                .foregroundStyle(AppColors.textTertiary)
                .frame(width: 20)

            Text(label)
                .font(AppFonts.subheadline)
                .foregroundStyle(AppColors.textSecondary)

            Spacer()

            Text(value)
                .font(AppFonts.subheadline)
                .foregroundStyle(AppColors.textPrimary)
        }
    }

    // MARK: - Banniere d'erreur

    /// Affiche un message d'erreur
    private func errorBanner(_ message: String) -> some View {
        HStack(spacing: AppDimensions.spacingS) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(AppColors.danger)

            Text(message)
                .font(AppFonts.caption)
                .foregroundStyle(AppColors.danger)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(AppDimensions.cardPadding)
        .background(AppColors.danger.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous)
                .stroke(AppColors.danger.opacity(0.2), lineWidth: 1)
        )
    }

    // MARK: - Helpers statut

    private func statusColor(for status: String) -> Color {
        switch status.lowercased() {
        case "pending": return AppColors.warning
        case "investigating": return AppColors.info
        case "confirmed": return AppColors.danger
        case "closed": return AppColors.success
        case "false_alarm": return AppColors.muted
        default: return AppColors.textSecondary
        }
    }

    private func statusLabel(for status: String) -> String {
        switch status.lowercased() {
        case "pending": return String(localized: "status.pending")
        case "investigating": return String(localized: "status.investigating")
        case "confirmed": return String(localized: "status.confirmed")
        case "closed": return String(localized: "status.closed")
        case "false_alarm": return String(localized: "status.false_alarm")
        default: return status
        }
    }

    private func statusIcon(for status: String) -> String {
        switch status.lowercased() {
        case "pending": return "clock.fill"
        case "investigating": return "magnifyingglass"
        case "confirmed": return "checkmark.shield.fill"
        case "closed": return "checkmark.circle.fill"
        case "false_alarm": return "xmark.circle.fill"
        default: return "questionmark.circle"
        }
    }

    private func priorityLabel(for priority: String) -> String {
        switch priority.lowercased() {
        case "low": return String(localized: "priority.low")
        case "medium": return String(localized: "priority.medium")
        case "high": return String(localized: "priority.high")
        case "critical": return String(localized: "priority.critical")
        default: return priority
        }
    }
}

// MARK: - Composant de champ de formulaire

/// Champ de formulaire avec label, icone et contenu personnalise
private struct FormField<Content: View>: View {

    let label: String
    let icon: String
    let isRequired: Bool
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
            // Label
            HStack(spacing: AppDimensions.spacingXS) {
                Image(systemName: icon)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(AppColors.primary)

                Text(label)
                    .font(AppFonts.subheadline)
                    .foregroundStyle(AppColors.textPrimary)

                if isRequired {
                    Text("*")
                        .font(AppFonts.subheadline)
                        .foregroundStyle(AppColors.danger)
                }
            }

            // Contenu du champ
            content()
                .padding(AppDimensions.cardPadding)
                .background(AppColors.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous)
                        .stroke(AppColors.muted.opacity(0.2), lineWidth: 1)
                )
        }
    }
}

// MARK: - Apercu

#Preview {
    PublicReportView()
}
