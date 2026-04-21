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
                        reporterSection(rumor: rumor)
                        photosSection(rumor: rumor)
                        validationSection(rumor: rumor)
                        notesSection(rumor: rumor)
                    }
                    .padding(.horizontal, AppDimensions.spacing)
                    .padding(.top, AppDimensions.spacingS)
                    .padding(.bottom, AppDimensions.spacingXXL)
                }
                .refreshable {
                    await viewModel.loadDetail(id: rumorId)
                }
            }
        }
        .navigationTitle(viewModel.rumor?.code ?? String(localized: "rumors.detail.title"))
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadDetail(id: rumorId)
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

    // MARK: - Validation

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

#Preview {
    NavigationStack {
        RumorDetailView(rumorId: 1)
    }
}
