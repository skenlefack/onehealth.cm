// RumorDetailView.swift
// COHRM Cameroun - Vue de detail d'une rumeur

import SwiftUI

/// Vue detaillee d'une rumeur avec toutes les sections
struct RumorDetailView: View {

    let rumorId: Int

    @State private var viewModel = RumorDetailViewModel()

    var body: some View {
        ZStack {
            AppColors.groupedBackground
                .ignoresSafeArea()

            if viewModel.isLoading && viewModel.rumor == nil {
                ProgressView()
                    .scaleEffect(1.2)
            } else if let error = viewModel.errorMessage, viewModel.rumor == nil {
                errorView(message: error)
            } else if let rumor = viewModel.rumor {
                ScrollView(.vertical, showsIndicators: false) {
                    VStack(spacing: AppDimensions.spacingL) {
                        headerSection(rumor: rumor)
                        infoSection(rumor: rumor)
                        locationSection(rumor: rumor)
                        riskAssessmentSection(rumor: rumor)
                        reporterSection(rumor: rumor)
                        photosSection(rumor: rumor)
                        PhotoGalleryView(rumorId: rumorId)
                        feedbackSection
                        validationSection(rumor: rumor)
                        validationWorkflowSection(rumor: rumor)
                        notesSection(rumor: rumor)
                    }
                    .padding(.horizontal, AppDimensions.spacing)
                    .padding(.top, AppDimensions.spacingS)
                    .padding(.bottom, AppDimensions.spacingXXL)
                }
                .refreshable {
                    await viewModel.loadDetail(id: rumorId)
                    await viewModel.loadValidations(rumorId: rumorId)
                    await viewModel.loadFeedback(rumorId: rumorId)
                }
            }
        }
        .navigationTitle(viewModel.rumor?.code ?? String(localized: "rumors.detail.title"))
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadDetail(id: rumorId)
            await viewModel.loadValidations(rumorId: rumorId)
            await viewModel.loadFeedback(rumorId: rumorId)
        }
    }

    // MARK: - En-tete

    private func headerSection(rumor: RumorDetail) -> some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            // Code
            if let code = rumor.code, !code.isEmpty {
                Text(code)
                    .font(.system(size: 14, weight: .semibold, design: .monospaced))
                    .foregroundStyle(AppColors.primary)
            }

            // Titre
            Text(rumor.title ?? String(localized: "rumors.untitled"))
                .font(AppFonts.title)
                .foregroundStyle(AppColors.textPrimary)
                .fixedSize(horizontal: false, vertical: true)

            // Badges
            FlowLayout(spacing: AppDimensions.spacingS) {
                if let status = rumor.status {
                    StatusBadge(
                        RumorStatusHelper.label(for: status),
                        color: RumorStatusHelper.color(for: status),
                        icon: RumorStatusHelper.icon(for: status)
                    )
                }

                if let priority = rumor.priority {
                    StatusBadge(
                        RumorPriorityHelper.label(for: priority),
                        color: RumorPriorityHelper.color(for: priority)
                    )
                }

                if let risk = rumor.riskLevel, !risk.isEmpty {
                    StatusBadge(
                        String(localized: "rumors.risk") + ": " + risk.capitalized,
                        color: RumorPriorityHelper.color(for: risk),
                        icon: "shield.fill"
                    )
                }

                if let source = rumor.source, !source.isEmpty {
                    StatusBadge(source.capitalized, color: AppColors.info, icon: "antenna.radiowaves.left.and.right")
                }
            }

            // Dates
            HStack(spacing: AppDimensions.spacingM) {
                if let dateStr = rumor.createdAt {
                    Label(
                        RumorDateHelper.formattedString(from: dateStr),
                        systemImage: "calendar"
                    )
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textTertiary)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }

    // MARK: - Informations

    private func infoSection(rumor: RumorDetail) -> some View {
        let hasContent = rumor.description != nil || rumor.category != nil
            || rumor.species != nil || rumor.symptoms != nil
            || rumor.affectedCount != nil

        return Group {
            if hasContent {
                VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
                    SectionHeader(
                        title: String(localized: "rumors.detail.info"),
                        icon: "info.circle.fill"
                    )

                    // Description
                    if let desc = rumor.description, !desc.isEmpty {
                        Text(desc)
                            .font(AppFonts.body)
                            .foregroundStyle(AppColors.textPrimary)
                            .fixedSize(horizontal: false, vertical: true)
                    }

                    // Details en grille
                    VStack(spacing: AppDimensions.spacingS) {
                        if let cat = rumor.category, !cat.isEmpty {
                            DetailRow(
                                label: String(localized: "rumors.detail.category"),
                                value: cat.capitalized,
                                icon: "tag.fill"
                            )
                        }

                        if let species = rumor.species, !species.isEmpty {
                            DetailRow(
                                label: String(localized: "rumors.detail.species"),
                                value: species,
                                icon: "pawprint.fill"
                            )
                        }

                        if let symptoms = rumor.symptoms, !symptoms.isEmpty {
                            DetailRow(
                                label: String(localized: "rumors.detail.symptoms"),
                                value: symptoms,
                                icon: "stethoscope"
                            )
                        }

                        if let count = rumor.affectedCount {
                            DetailRow(
                                label: String(localized: "rumors.detail.affected"),
                                value: "\(count)",
                                icon: "person.3.fill"
                            )
                        }

                        if let deaths = rumor.deathsCount, deaths > 0 {
                            DetailRow(
                                label: String(localized: "rumors.detail.deaths"),
                                value: "\(deaths)",
                                icon: "exclamationmark.triangle.fill"
                            )
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(AppDimensions.cardPadding)
                .cardStyle()
            }
        }
    }

    // MARK: - Localisation

    private func locationSection(rumor: RumorDetail) -> some View {
        let hasLocation = rumor.region != nil || rumor.department != nil
            || rumor.location != nil || rumor.latitude != nil

        return Group {
            if hasLocation {
                VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
                    SectionHeader(
                        title: String(localized: "rumors.detail.location"),
                        icon: "mappin.circle.fill"
                    )

                    VStack(spacing: AppDimensions.spacingS) {
                        if let region = rumor.region, !region.isEmpty {
                            DetailRow(
                                label: String(localized: "rumors.detail.region"),
                                value: region,
                                icon: "map.fill"
                            )
                        }

                        if let dept = rumor.department, !dept.isEmpty {
                            DetailRow(
                                label: String(localized: "rumors.detail.department"),
                                value: dept,
                                icon: "building.2.fill"
                            )
                        }

                        if let loc = rumor.location, !loc.isEmpty {
                            DetailRow(
                                label: String(localized: "rumors.detail.location_name"),
                                value: loc,
                                icon: "mappin"
                            )
                        }

                        if let lat = rumor.latitude, let lng = rumor.longitude {
                            DetailRow(
                                label: String(localized: "rumors.detail.coordinates"),
                                value: String(format: "%.6f, %.6f", lat, lng),
                                icon: "location.fill"
                            )
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(AppDimensions.cardPadding)
                .cardStyle()
            }
        }
    }

    // MARK: - Risk Assessment

    private func riskAssessmentSection(rumor: RumorDetail) -> some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            SectionHeader(
                title: String(localized: "rumors.detail.risk_assessment"),
                icon: "shield.checkered"
            )

            // Current risk level display
            if let risk = rumor.riskLevel, !risk.isEmpty {
                HStack(spacing: AppDimensions.spacingM) {
                    RiskLevelBadge(level: risk)
                    Spacer()
                }
            }

            // Current risk description
            if let desc = rumor.riskDescription, !desc.isEmpty {
                Text(desc)
                    .font(AppFonts.callout)
                    .foregroundStyle(AppColors.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Divider()

            // Risk level picker
            VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
                Text(String(localized: "rumors.risk.select_level"))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: AppDimensions.spacingS) {
                        ForEach(RumorDetailViewModel.riskLevels, id: \.value) { level in
                            RiskLevelChip(
                                label: level.label,
                                value: level.value,
                                isSelected: viewModel.selectedRiskLevel == level.value,
                                color: riskColor(for: level.value)
                            ) {
                                HapticHelper.selection()
                                withAnimation(.easeInOut(duration: 0.2)) {
                                    viewModel.selectedRiskLevel = level.value
                                }
                            }
                        }
                    }
                }
            }

            // Description
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                Text(String(localized: "rumors.risk.description"))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)

                TextField(
                    String(localized: "rumors.risk.description_placeholder"),
                    text: $viewModel.riskDescription,
                    axis: .vertical
                )
                .font(AppFonts.body)
                .lineLimit(1...4)
                .textFieldStyle(.plain)
                .padding(AppDimensions.spacingM)
                .background(AppColors.secondaryBackground)
                .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous))
            }

            // Context
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                Text(String(localized: "rumors.risk.context"))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)

                TextField(
                    String(localized: "rumors.risk.context_placeholder"),
                    text: $viewModel.riskContext,
                    axis: .vertical
                )
                .font(AppFonts.body)
                .lineLimit(1...3)
                .textFieldStyle(.plain)
                .padding(AppDimensions.spacingM)
                .background(AppColors.secondaryBackground)
                .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous))
            }

            // Exposure
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                Text(String(localized: "rumors.risk.exposure"))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)

                TextField(
                    String(localized: "rumors.risk.exposure_placeholder"),
                    text: $viewModel.riskExposure,
                    axis: .vertical
                )
                .font(AppFonts.body)
                .lineLimit(1...3)
                .textFieldStyle(.plain)
                .padding(AppDimensions.spacingM)
                .background(AppColors.secondaryBackground)
                .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous))
            }

            // Submit button
            PrimaryButton(
                String(localized: "rumors.risk.submit"),
                icon: "shield.checkered",
                isLoading: viewModel.isAssessingRisk
            ) {
                Task { await viewModel.assessRisk(rumorId: rumorId) }
            }

            // Success message
            if viewModel.riskAssessmentSuccess {
                HStack(spacing: AppDimensions.spacingXS) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(AppColors.success)
                    Text(String(localized: "rumors.risk.success"))
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.success)
                }
                .transition(.opacity)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(AppDimensions.cardPadding)
        .cardStyle()
        .animation(.easeInOut(duration: 0.3), value: viewModel.riskAssessmentSuccess)
    }

    // MARK: - Declarant

    private func reporterSection(rumor: RumorDetail) -> some View {
        let hasReporter = rumor.reporterName != nil || rumor.reporterPhone != nil

        return Group {
            if hasReporter {
                VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
                    SectionHeader(
                        title: String(localized: "rumors.detail.reporter"),
                        icon: "person.circle.fill"
                    )

                    VStack(spacing: AppDimensions.spacingS) {
                        if let name = rumor.reporterName, !name.isEmpty {
                            DetailRow(
                                label: String(localized: "rumors.detail.reporter_name"),
                                value: name,
                                icon: "person.fill"
                            )
                        }

                        if let phone = rumor.reporterPhone, !phone.isEmpty {
                            DetailRow(
                                label: String(localized: "rumors.detail.reporter_phone"),
                                value: phone.formattedCameroonPhone,
                                icon: "phone.fill"
                            )
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(AppDimensions.cardPadding)
                .cardStyle()
            }
        }
    }

    // MARK: - Photos

    private func photosSection(rumor: RumorDetail) -> some View {
        let photos = rumor.photos ?? []

        return Group {
            if !photos.isEmpty {
                VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
                    SectionHeader(
                        title: String(localized: "rumors.detail.photos"),
                        icon: "photo.on.rectangle"
                    )

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: AppDimensions.spacingS) {
                            ForEach(photos) { photo in
                                PhotoThumbnailView(photo: photo)
                            }
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(AppDimensions.cardPadding)
                .cardStyle()
            }
        }
    }

    // MARK: - Validation (existing inline validations)

    private func validationSection(rumor: RumorDetail) -> some View {
        let validations = rumor.validations ?? []

        return Group {
            if !validations.isEmpty {
                VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
                    SectionHeader(
                        title: String(localized: "rumors.detail.validation"),
                        icon: "checkmark.shield.fill"
                    )

                    ValidationTimelineView(validations: validations)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(AppDimensions.cardPadding)
                .cardStyle()
            }
        }
    }

    // MARK: - Validation Workflow (actions)

    private func validationWorkflowSection(rumor: RumorDetail) -> some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            SectionHeader(
                title: String(localized: "rumors.detail.validation_actions"),
                icon: "hand.thumbsup.fill"
            )

            // Validation level stepper
            ValidationLevelStepper(
                validations: viewModel.validationHistory,
                currentLevel: currentValidationLevel
            )

            // Validation history from dedicated endpoint
            if viewModel.isLoadingValidations {
                HStack {
                    Spacer()
                    ProgressView()
                        .padding(AppDimensions.spacingS)
                    Spacer()
                }
            } else if !viewModel.validationHistory.isEmpty {
                VStack(spacing: AppDimensions.spacingS) {
                    ForEach(viewModel.validationHistory) { item in
                        ValidationHistoryRowView(item: item)
                    }
                }
            }

            Divider()

            // Notes de validation
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                Text(String(localized: "rumors.validation.notes"))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)

                TextField(
                    String(localized: "rumors.validation.notes_placeholder"),
                    text: $viewModel.validationNotes,
                    axis: .vertical
                )
                .font(AppFonts.body)
                .lineLimit(1...3)
                .textFieldStyle(.plain)
                .padding(AppDimensions.spacingM)
                .background(AppColors.secondaryBackground)
                .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous))
            }

            // Rejection reason (visible when rejection form is shown)
            if viewModel.showRejectionForm {
                VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                    Text(String(localized: "rumors.validation.rejection_reason"))
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.danger)

                    TextField(
                        String(localized: "rumors.validation.rejection_reason_placeholder"),
                        text: $viewModel.rejectionReason,
                        axis: .vertical
                    )
                    .font(AppFonts.body)
                    .lineLimit(1...4)
                    .textFieldStyle(.plain)
                    .padding(AppDimensions.spacingM)
                    .background(AppColors.danger.opacity(0.05))
                    .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous)
                            .stroke(AppColors.danger.opacity(0.3), lineWidth: 1)
                    )
                }
                .transition(.opacity.combined(with: .move(edge: .top)))
            }

            // Action buttons
            HStack(spacing: AppDimensions.spacingS) {
                // Validate
                ActionButton(
                    title: String(localized: "rumors.validation.validate"),
                    icon: "checkmark.circle.fill",
                    color: AppColors.success,
                    isLoading: viewModel.isValidating && !viewModel.showRejectionForm
                ) {
                    Task { await viewModel.validateRumor(rumorId: rumorId) }
                }

                // Reject
                if viewModel.showRejectionForm {
                    ActionButton(
                        title: String(localized: "rumors.validation.confirm_reject"),
                        icon: "xmark.circle.fill",
                        color: AppColors.danger,
                        isLoading: viewModel.isValidating
                    ) {
                        Task { await viewModel.rejectRumor(rumorId: rumorId) }
                    }
                } else {
                    ActionButton(
                        title: String(localized: "rumors.validation.reject"),
                        icon: "xmark.circle.fill",
                        color: AppColors.danger,
                        isLoading: false
                    ) {
                        withAnimation(.easeInOut(duration: 0.3)) {
                            viewModel.showRejectionForm = true
                        }
                    }
                }

                // Escalate
                ActionButton(
                    title: String(localized: "rumors.validation.escalate"),
                    icon: "arrow.up.circle.fill",
                    color: AppColors.warning,
                    isLoading: false
                ) {
                    Task { await viewModel.escalateRumor(rumorId: rumorId) }
                }
            }

            // Success/error messages
            if viewModel.validationSuccess {
                HStack(spacing: AppDimensions.spacingXS) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(AppColors.success)
                    Text(String(localized: "rumors.validation.success"))
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.success)
                }
                .transition(.opacity)
            }

            if let error = viewModel.errorMessage {
                HStack(spacing: AppDimensions.spacingXS) {
                    Image(systemName: "exclamationmark.circle.fill")
                        .foregroundStyle(AppColors.danger)
                    Text(error)
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.danger)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(AppDimensions.cardPadding)
        .cardStyle()
        .animation(.easeInOut(duration: 0.3), value: viewModel.validationSuccess)
        .animation(.easeInOut(duration: 0.3), value: viewModel.showRejectionForm)
    }

    /// Determine le niveau de validation actuel
    private var currentValidationLevel: Int {
        if let validations = viewModel.rumor?.validations, !validations.isEmpty {
            return validations.compactMap(\.level).max() ?? 0
        }
        if !viewModel.validationHistory.isEmpty {
            return viewModel.validationHistory.compactMap(\.level).max() ?? 0
        }
        return 0
    }

    // MARK: - Feedback

    private var feedbackSection: some View {
        Group {
            if viewModel.isLoadingFeedback {
                ProgressView()
                    .frame(maxWidth: .infinity)
                    .padding(AppDimensions.cardPadding)
                    .cardStyle()
            } else if !viewModel.feedbackItems.isEmpty {
                VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
                    SectionHeader(
                        title: String(localized: "feedback.title") + " (\(viewModel.feedbackItems.count))",
                        icon: "bubble.left.and.bubble.right.fill"
                    )

                    VStack(spacing: AppDimensions.spacingS) {
                        ForEach(viewModel.feedbackItems) { item in
                            FeedbackRowView(item: item)
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(AppDimensions.cardPadding)
                .cardStyle()
            }
        }
    }

    // MARK: - Notes

    private func notesSection(rumor: RumorDetail) -> some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            SectionHeader(
                title: String(localized: "rumors.detail.notes"),
                icon: "note.text"
            )

            // Notes existantes
            let notes = rumor.notes ?? []
            if notes.isEmpty {
                Text(String(localized: "rumors.detail.notes_empty"))
                    .font(AppFonts.callout)
                    .foregroundStyle(AppColors.textTertiary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, AppDimensions.spacingM)
            } else {
                VStack(spacing: AppDimensions.spacingS) {
                    ForEach(notes) { note in
                        NoteRowView(note: note)
                    }
                }
            }

            // Separateur
            Divider()

            // Champ d'ajout de note
            VStack(spacing: AppDimensions.spacingS) {
                HStack(alignment: .top, spacing: AppDimensions.spacingS) {
                    TextField(
                        String(localized: "rumors.detail.note_placeholder"),
                        text: $viewModel.newNoteText,
                        axis: .vertical
                    )
                    .font(AppFonts.body)
                    .lineLimit(1...5)
                    .textFieldStyle(.plain)
                    .padding(AppDimensions.spacingM)
                    .background(AppColors.secondaryBackground)
                    .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous))

                    // Bouton d'envoi
                    Button {
                        Task { await viewModel.sendNote(rumorId: rumorId) }
                    } label: {
                        Group {
                            if viewModel.isSendingNote {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Image(systemName: "paperplane.fill")
                                    .font(.body.weight(.semibold))
                            }
                        }
                        .frame(width: 44, height: 44)
                        .foregroundStyle(.white)
                        .background(
                            viewModel.newNoteText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                                ? AppColors.muted
                                : AppColors.primary
                        )
                        .clipShape(Circle())
                    }
                    .disabled(
                        viewModel.newNoteText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                            || viewModel.isSendingNote
                    )
                }

                // Message de succes
                if viewModel.noteSentSuccess {
                    HStack(spacing: AppDimensions.spacingXS) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(AppColors.success)
                        Text(String(localized: "rumors.detail.note_sent"))
                            .font(AppFonts.caption)
                            .foregroundStyle(AppColors.success)
                    }
                    .transition(.opacity)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(AppDimensions.cardPadding)
        .cardStyle()
        .animation(.easeInOut(duration: 0.3), value: viewModel.noteSentSuccess)
    }

    // MARK: - Erreur

    private func errorView(message: String) -> some View {
        VStack(spacing: AppDimensions.spacingM) {
            Spacer()

            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48, weight: .light))
                .foregroundStyle(AppColors.danger)

            Text(String(localized: "rumors.error.title"))
                .font(AppFonts.headline)
                .foregroundStyle(AppColors.textPrimary)

            Text(message)
                .font(AppFonts.caption)
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, AppDimensions.spacingXL)

            PrimaryButton(
                String(localized: "rumors.error.retry"),
                icon: "arrow.clockwise"
            ) {
                Task { await viewModel.loadDetail(id: rumorId) }
            }
            .padding(.horizontal, AppDimensions.spacingXL)

            Spacer()
        }
    }

    // MARK: - Risk color helper

    private func riskColor(for level: String) -> Color {
        switch level.lowercased() {
        case "low": return AppColors.success
        case "moderate": return AppColors.warning
        case "high": return AppColors.danger
        case "very_high": return Color(hex: 0x8E24AA)
        default: return AppColors.muted
        }
    }
}

// MARK: - Risk Level Badge

/// Badge affichant le niveau de risque avec couleur
private struct RiskLevelBadge: View {
    let level: String

    var body: some View {
        HStack(spacing: AppDimensions.spacingS) {
            Image(systemName: "shield.fill")
                .font(.title3)
                .foregroundStyle(color)

            VStack(alignment: .leading, spacing: 2) {
                Text(String(localized: "rumors.risk.current_level"))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textTertiary)

                Text(displayLabel)
                    .font(AppFonts.headline)
                    .foregroundStyle(color)
            }
        }
        .padding(AppDimensions.spacingM)
        .background(color.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous))
    }

    private var color: Color {
        switch level.lowercased() {
        case "low": return AppColors.success
        case "moderate": return AppColors.warning
        case "high": return AppColors.danger
        case "very_high": return Color(hex: 0x8E24AA)
        default: return AppColors.muted
        }
    }

    private var displayLabel: String {
        switch level.lowercased() {
        case "low": return "Faible"
        case "moderate": return "Modere"
        case "high": return "Eleve"
        case "very_high": return "Tres eleve"
        default: return "Inconnu"
        }
    }
}

// MARK: - Risk Level Chip

/// Chip selecteur de niveau de risque
private struct RiskLevelChip: View {
    let label: String
    let value: String
    let isSelected: Bool
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Circle()
                    .fill(color)
                    .frame(width: 8, height: 8)
                Text(label)
                    .font(AppFonts.badge)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .foregroundStyle(isSelected ? .white : color)
            .background(isSelected ? color : color.opacity(0.1))
            .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Validation Level Stepper

/// Stepper visuel des niveaux de validation (1 a 5)
private struct ValidationLevelStepper: View {
    let validations: [ValidationHistoryItem]
    let currentLevel: Int

    var body: some View {
        HStack(spacing: 0) {
            ForEach(1...5, id: \.self) { level in
                let status = statusFor(level: level)

                HStack(spacing: 0) {
                    // Cercle du niveau
                    VStack(spacing: 4) {
                        ZStack {
                            Circle()
                                .fill(status.color.opacity(0.15))
                                .frame(width: 32, height: 32)

                            Circle()
                                .stroke(status.color, lineWidth: 2)
                                .frame(width: 32, height: 32)

                            if status == .completed {
                                Image(systemName: "checkmark")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundStyle(status.color)
                            } else if status == .rejected {
                                Image(systemName: "xmark")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundStyle(status.color)
                            } else {
                                Text("\(level)")
                                    .font(.system(size: 12, weight: .bold, design: .rounded))
                                    .foregroundStyle(status.color)
                            }
                        }

                        Text("N\(level)")
                            .font(AppFonts.caption2)
                            .foregroundStyle(status.color)
                    }

                    // Ligne de connexion
                    if level < 5 {
                        Rectangle()
                            .fill(level < currentLevel ? AppColors.success : AppColors.muted.opacity(0.3))
                            .frame(height: 2)
                    }
                }
            }
        }
        .padding(.vertical, AppDimensions.spacingS)
    }

    private enum StepStatus {
        case completed, rejected, current, pending

        var color: Color {
            switch self {
            case .completed: return AppColors.success
            case .rejected: return AppColors.danger
            case .current: return AppColors.info
            case .pending: return AppColors.muted
            }
        }
    }

    private func statusFor(level: Int) -> StepStatus {
        if let validation = validations.first(where: { $0.level == level }) {
            if validation.actionType?.lowercased() == "reject" {
                return .rejected
            }
            return .completed
        }
        if level == currentLevel + 1 {
            return .current
        }
        if level <= currentLevel {
            return .completed
        }
        return .pending
    }
}

// MARK: - Validation History Row

/// Ligne d'historique de validation detaillee
private struct ValidationHistoryRowView: View {
    let item: ValidationHistoryItem

    var body: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
            HStack {
                // Niveau
                if let level = item.level {
                    Text("Niveau \(level)")
                        .font(AppFonts.badge)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 3)
                        .background(statusColor)
                        .clipShape(Capsule())
                }

                // Action type
                if let action = item.actionType {
                    StatusBadge(
                        actionLabel(for: action),
                        color: actionColor(for: action),
                        icon: actionIcon(for: action)
                    )
                }

                Spacer()

                // Date
                if let dateStr = item.validatedAt {
                    Text(RumorDateHelper.relativeString(from: dateStr))
                        .font(AppFonts.caption2)
                        .foregroundStyle(AppColors.textTertiary)
                }
            }

            // User
            if let user = item.userName, !user.isEmpty {
                HStack(spacing: AppDimensions.spacingXS) {
                    Image(systemName: "person.fill")
                        .font(.caption2)
                        .foregroundStyle(AppColors.textTertiary)
                    Text(user)
                        .font(AppFonts.footnote)
                        .foregroundStyle(AppColors.textSecondary)
                }
            }

            // Notes
            if let notes = item.notes, !notes.isEmpty {
                Text(notes)
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            // Rejection reason
            if let reason = item.rejectionReason, !reason.isEmpty {
                HStack(spacing: AppDimensions.spacingXS) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.caption2)
                        .foregroundStyle(AppColors.danger)
                    Text(reason)
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.danger)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
        .padding(AppDimensions.spacingM)
        .background(AppColors.secondaryBackground)
        .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous))
    }

    private var statusColor: Color {
        switch item.status?.lowercased() {
        case "validated": return AppColors.success
        case "rejected": return AppColors.danger
        case "escalated": return AppColors.warning
        default: return AppColors.info
        }
    }

    private func actionLabel(for action: String) -> String {
        switch action.lowercased() {
        case "validate": return "Valide"
        case "reject": return "Rejete"
        case "escalate": return "Escalade"
        default: return action.capitalized
        }
    }

    private func actionColor(for action: String) -> Color {
        switch action.lowercased() {
        case "validate": return AppColors.success
        case "reject": return AppColors.danger
        case "escalate": return AppColors.warning
        default: return AppColors.info
        }
    }

    private func actionIcon(for action: String) -> String {
        switch action.lowercased() {
        case "validate": return "checkmark.circle.fill"
        case "reject": return "xmark.circle.fill"
        case "escalate": return "arrow.up.circle.fill"
        default: return "circle.fill"
        }
    }
}

// MARK: - Action Button

/// Bouton d'action compact pour la validation
private struct ActionButton: View {
    let title: String
    let icon: String
    let color: Color
    let isLoading: Bool
    let action: () -> Void

    var body: some View {
        Button {
            HapticHelper.impact(.light)
            action()
        } label: {
            VStack(spacing: 4) {
                if isLoading {
                    ProgressView()
                        .tint(color)
                        .frame(width: 24, height: 24)
                } else {
                    Image(systemName: icon)
                        .font(.system(size: 20))
                        .foregroundStyle(color)
                }
                Text(title)
                    .font(AppFonts.caption2)
                    .foregroundStyle(color)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, AppDimensions.spacingM)
            .background(color.opacity(0.1))
            .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous))
        }
        .disabled(isLoading)
        .buttonStyle(.plain)
    }
}

// MARK: - Ligne de detail cle/valeur

/// Ligne affichant un label, une icone et une valeur
private struct DetailRow: View {
    let label: String
    let value: String
    let icon: String

    var body: some View {
        HStack(alignment: .top, spacing: AppDimensions.spacingM) {
            Image(systemName: icon)
                .font(.footnote)
                .foregroundStyle(AppColors.primary)
                .frame(width: 20, alignment: .center)

            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textTertiary)

                Text(value)
                    .font(AppFonts.callout)
                    .foregroundStyle(AppColors.textPrimary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer()
        }
    }
}

// MARK: - Miniature photo

/// Vue miniature pour une photo de rumeur
private struct PhotoThumbnailView: View {
    let photo: PhotoItem

    var body: some View {
        AsyncImage(url: photoURL) { phase in
            switch phase {
            case .success(let image):
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: 120, height: 120)
                    .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous))

            case .failure:
                placeholderView(icon: "photo.badge.exclamationmark")

            case .empty:
                placeholderView(icon: "photo")
                    .overlay { ProgressView() }

            @unknown default:
                placeholderView(icon: "photo")
            }
        }
    }

    private var photoURL: URL? {
        guard let path = photo.filePath else { return nil }
        if path.hasPrefix("http") { return URL(string: path) }
        let base = UserDefaults.standard.string(forKey: "serverURL") ?? "https://onehealth.cm/api"
        return URL(string: "\(base)/uploads/\(path)")
    }

    private func placeholderView(icon: String) -> some View {
        ZStack {
            RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous)
                .fill(AppColors.secondaryBackground)
                .frame(width: 120, height: 120)

            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundStyle(AppColors.muted)
        }
    }
}

// MARK: - Ligne de note

/// Vue affichant une note individuelle
private struct NoteRowView: View {
    let note: NoteItem

    var body: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
            // Auteur et visibilite
            HStack(spacing: AppDimensions.spacingS) {
                Image(systemName: "person.circle.fill")
                    .font(.subheadline)
                    .foregroundStyle(AppColors.primary)

                Text(note.authorName ?? String(localized: "rumors.detail.anonymous"))
                    .font(AppFonts.subheadline)
                    .foregroundStyle(AppColors.textPrimary)

                if note.isPrivate == true {
                    StatusBadge(
                        String(localized: "rumors.detail.private"),
                        color: AppColors.warning,
                        icon: "lock.fill"
                    )
                }

                Spacer()

                if let dateStr = note.createdAt {
                    Text(RumorDateHelper.relativeString(from: dateStr))
                        .font(AppFonts.caption2)
                        .foregroundStyle(AppColors.textTertiary)
                }
            }

            // Contenu
            if let content = note.content {
                Text(content)
                    .font(AppFonts.callout)
                    .foregroundStyle(AppColors.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(AppDimensions.spacingM)
        .background(AppColors.secondaryBackground)
        .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous))
    }
}

// MARK: - Feedback Row

/// Vue affichant un element de feedback
private struct FeedbackRowView: View {
    let item: FeedbackItem

    var body: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
            HStack(spacing: AppDimensions.spacingS) {
                // Type badge
                if let feedbackType = item.feedbackType, !feedbackType.isEmpty {
                    StatusBadge(
                        feedbackTypeLabel(feedbackType),
                        color: feedbackTypeColor(feedbackType),
                        icon: feedbackTypeIcon(feedbackType)
                    )
                }

                // Channel badge
                if let channel = item.channel, !channel.isEmpty {
                    StatusBadge(
                        channel.capitalized,
                        color: AppColors.info,
                        icon: "antenna.radiowaves.left.and.right"
                    )
                }

                // Status badge
                if let status = item.status, !status.isEmpty {
                    StatusBadge(
                        status.capitalized,
                        color: feedbackStatusColor(status)
                    )
                }

                Spacer()

                // Date
                if let dateStr = item.createdAt {
                    Text(RumorDateHelper.relativeString(from: dateStr))
                        .font(AppFonts.caption2)
                        .foregroundStyle(AppColors.textTertiary)
                }
            }

            // Message
            if let message = item.message, !message.isEmpty {
                Text(message)
                    .font(AppFonts.callout)
                    .foregroundStyle(AppColors.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(AppDimensions.spacingM)
        .background(AppColors.secondaryBackground)
        .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous))
    }

    private func feedbackTypeLabel(_ type: String) -> String {
        switch type.lowercased() {
        case "positive": return String(localized: "feedback.type.positive")
        case "negative": return String(localized: "feedback.type.negative")
        case "suggestion": return String(localized: "feedback.type.suggestion")
        case "question": return String(localized: "feedback.type.question")
        case "followup": return String(localized: "feedback.type.followup")
        default: return type.capitalized
        }
    }

    private func feedbackTypeColor(_ type: String) -> Color {
        switch type.lowercased() {
        case "positive": return AppColors.success
        case "negative": return AppColors.danger
        case "suggestion": return AppColors.info
        case "question": return AppColors.warning
        case "followup": return AppColors.primary
        default: return AppColors.muted
        }
    }

    private func feedbackTypeIcon(_ type: String) -> String {
        switch type.lowercased() {
        case "positive": return "hand.thumbsup.fill"
        case "negative": return "hand.thumbsdown.fill"
        case "suggestion": return "lightbulb.fill"
        case "question": return "questionmark.circle.fill"
        case "followup": return "arrow.turn.down.right"
        default: return "bubble.left.fill"
        }
    }

    private func feedbackStatusColor(_ status: String) -> Color {
        switch status.lowercased() {
        case "read", "lu": return AppColors.success
        case "pending", "en_attente": return AppColors.warning
        case "archived": return AppColors.muted
        default: return AppColors.muted
        }
    }
}

#Preview {
    NavigationStack {
        RumorDetailView(rumorId: 1)
    }
}
