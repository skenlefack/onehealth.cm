// SMSReportView.swift
// COHRM Cameroun - Signalement par SMS structuré
//
// Permet de créer un message SMS au format COHRM et de l'envoyer
// via le composeur SMS natif (MFMessageComposeViewController).
// Format SMS : OH#CAT#ESP#SYM1,SYM2#REGION#DESC

import SwiftUI
import MessageUI

/// Vue de création d'un signalement par SMS structuré
struct SMSReportView: View {

    // MARK: - État du formulaire

    /// Catégorie d'événement sélectionnée
    @State private var selectedCategory: EventCategory = .humanHealth

    /// Espèce sélectionnée
    @State private var selectedSpecies: SpeciesCode = .HUM

    /// Symptômes sélectionnés (multi-sélection par chips)
    @State private var selectedSymptoms: Set<SymptomCode> = []

    /// Région sélectionnée
    @State private var selectedRegion: CameroonRegion?

    /// Description libre du signalement (max 100 caractères dans le SMS)
    @State private var descriptionText = ""

    // MARK: - État de l'interface

    /// Affiche le composeur SMS
    @State private var showSMSComposer = false

    /// Résultat de l'envoi SMS
    @State private var smsResult: MessageComposeResult?

    /// Affiche l'alerte de résultat
    @State private var showResultAlert = false

    /// Affiche l'alerte « SMS non disponible »
    @State private var showUnavailableAlert = false

    // MARK: - Corps

    var body: some View {
        ScrollView {
            VStack(spacing: AppDimensions.spacingL) {

                // En-tête explicatif
                headerSection

                // Sélection de catégorie
                categorySection

                // Sélection d'espèce
                speciesSection

                // Sélection de symptômes (chips)
                symptomsSection

                // Sélection de région
                regionSection

                // Description libre
                descriptionSection

                // Aperçu du SMS généré
                smsPreviewSection

                // Bouton d'envoi
                sendButton

                Spacer(minLength: AppDimensions.spacingXL)
            }
            .padding(.horizontal, AppDimensions.spacing)
            .padding(.top, AppDimensions.spacingM)
        }
        .background(AppColors.groupedBackground)
        .navigationTitle(String(localized: "sms.title"))
        .navigationBarTitleDisplayMode(.large)
        .sheet(isPresented: $showSMSComposer) {
            SMSComposerRepresentable(
                recipients: [SMSHelper.smsRecipient],
                body: generatedSMS,
                result: $smsResult
            )
            .ignoresSafeArea()
        }
        .onChange(of: smsResult) { _, newValue in
            if newValue != nil {
                showResultAlert = true
            }
        }
        .alert(smsResultTitle, isPresented: $showResultAlert) {
            Button(String(localized: "sms.result.ok")) {
                // Réinitialiser le formulaire si l'envoi a réussi
                if smsResult == .sent {
                    resetForm()
                }
                smsResult = nil
            }
        } message: {
            Text(smsResultMessage)
        }
        .alert(
            String(localized: "sms.unavailable.title"),
            isPresented: $showUnavailableAlert
        ) {
            Button(String(localized: "sms.unavailable.ok")) {}
        } message: {
            Text(String(localized: "sms.unavailable.message"))
        }
    }

    // MARK: - Sections du formulaire

    /// En-tête avec explication du format SMS
    private var headerSection: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
            HStack(spacing: AppDimensions.spacingS) {
                Image(systemName: "message.fill")
                    .font(.title2)
                    .foregroundStyle(AppColors.primary)
                Text(String(localized: "sms.header.title"))
                    .font(AppFonts.title)
                    .foregroundStyle(AppColors.textPrimary)
            }
            Text(String(localized: "sms.header.description"))
                .font(AppFonts.callout)
                .foregroundStyle(AppColors.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }

    /// Section de sélection de catégorie d'événement
    private var categorySection: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
            SectionHeader(
                title: String(localized: "sms.category.label"),
                icon: "tag.fill"
            )

            Picker(
                String(localized: "sms.category.label"),
                selection: $selectedCategory
            ) {
                ForEach(EventCategory.allCases) { category in
                    Label(category.label, systemImage: category.icon)
                        .tag(category)
                }
            }
            .pickerStyle(.menu)
            .padding(AppDimensions.spacingM)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(AppColors.cardBackground)
            .clipShape(RoundedRectangle(
                cornerRadius: AppDimensions.cornerRadiusS,
                style: .continuous
            ))
        }
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }

    /// Section de sélection d'espèce
    private var speciesSection: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
            SectionHeader(
                title: String(localized: "sms.species.label"),
                icon: "pawprint.fill"
            )

            Picker(
                String(localized: "sms.species.label"),
                selection: $selectedSpecies
            ) {
                ForEach(SpeciesCode.allCases) { species in
                    Label(species.label, systemImage: species.icon)
                        .tag(species)
                }
            }
            .pickerStyle(.menu)
            .padding(AppDimensions.spacingM)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(AppColors.cardBackground)
            .clipShape(RoundedRectangle(
                cornerRadius: AppDimensions.cornerRadiusS,
                style: .continuous
            ))
        }
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }

    /// Section de sélection multiple de symptômes (chips cliquables)
    private var symptomsSection: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
            SectionHeader(
                title: String(localized: "sms.symptoms.label"),
                icon: "stethoscope"
            )

            Text(String(localized: "sms.symptoms.hint"))
                .font(AppFonts.caption)
                .foregroundStyle(AppColors.textTertiary)

            // Grille de chips de symptômes
            FlowLayout(spacing: AppDimensions.spacingS) {
                ForEach(SymptomCode.allCases) { symptom in
                    symptomChip(symptom)
                }
            }
        }
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }

    /// Chip individuel pour un symptôme (toggle)
    private func symptomChip(_ symptom: SymptomCode) -> some View {
        let isSelected = selectedSymptoms.contains(symptom)

        return Button {
            HapticHelper.selection()
            withAnimation(.easeInOut(duration: 0.2)) {
                if isSelected {
                    selectedSymptoms.remove(symptom)
                } else {
                    selectedSymptoms.insert(symptom)
                }
            }
        } label: {
            HStack(spacing: 4) {
                Text(symptom.rawValue)
                    .font(AppFonts.badge)
                    .fontWeight(.bold)
                Text(symptom.label)
                    .font(AppFonts.caption)
            }
            .padding(.horizontal, AppDimensions.spacingM)
            .padding(.vertical, AppDimensions.spacingS)
            .foregroundStyle(isSelected ? .white : AppColors.textPrimary)
            .background(
                isSelected
                    ? AnyShapeStyle(AppColors.primaryGradient)
                    : AnyShapeStyle(AppColors.secondaryBackground)
            )
            .clipShape(Capsule())
            .overlay(
                Capsule()
                    .stroke(
                        isSelected ? Color.clear : AppColors.muted.opacity(0.3),
                        lineWidth: 1
                    )
            )
        }
        .buttonStyle(.plain)
    }

    /// Section de sélection de région
    private var regionSection: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
            SectionHeader(
                title: String(localized: "sms.region.label"),
                icon: "map.fill"
            )

            Picker(
                String(localized: "sms.region.label"),
                selection: $selectedRegion
            ) {
                Text(String(localized: "sms.region.placeholder"))
                    .tag(nil as CameroonRegion?)
                ForEach(CameroonRegion.all) { region in
                    Text(region.name)
                        .tag(region as CameroonRegion?)
                }
            }
            .pickerStyle(.menu)
            .padding(AppDimensions.spacingM)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(AppColors.cardBackground)
            .clipShape(RoundedRectangle(
                cornerRadius: AppDimensions.cornerRadiusS,
                style: .continuous
            ))
        }
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }

    /// Section de description libre
    private var descriptionSection: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
            SectionHeader(
                title: String(localized: "sms.description.label"),
                icon: "text.alignleft"
            )

            TextField(
                String(localized: "sms.description.placeholder"),
                text: $descriptionText,
                axis: .vertical
            )
            .lineLimit(3...5)
            .textFieldStyle(.roundedBorder)

            // Compteur de caractères
            HStack {
                Spacer()
                Text("\(descriptionText.count)/100")
                    .font(AppFonts.caption2)
                    .foregroundStyle(
                        descriptionText.count > 100
                            ? AppColors.danger
                            : AppColors.textTertiary
                    )
            }
        }
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }

    /// Aperçu du SMS généré, stylisé comme une bulle de message
    private var smsPreviewSection: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
            SectionHeader(
                title: String(localized: "sms.preview.label"),
                icon: "eye.fill"
            )

            // Bulle SMS
            HStack {
                VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                    Text(String(localized: "sms.preview.to \(SMSHelper.smsRecipient)"))
                        .font(AppFonts.caption2)
                        .foregroundStyle(.white.opacity(0.7))

                    Text(generatedSMS)
                        .font(.system(.body, design: .monospaced))
                        .foregroundStyle(.white)
                }
                .padding(AppDimensions.spacingM)
                .background(AppColors.primary)
                .clipShape(
                    RoundedRectangle(
                        cornerRadius: AppDimensions.cornerRadiusL,
                        style: .continuous
                    )
                )

                Spacer(minLength: AppDimensions.spacingXL)
            }

            // Décomposition du format
            VStack(alignment: .leading, spacing: 2) {
                Text(String(localized: "sms.preview.format"))
                    .font(AppFonts.caption2)
                    .foregroundStyle(AppColors.textTertiary)
                Text("OH#CAT#ESP#SYM1,SYM2#REG#DESC")
                    .font(.system(.caption2, design: .monospaced))
                    .foregroundStyle(AppColors.muted)
            }
        }
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }

    /// Bouton d'envoi par SMS
    private var sendButton: some View {
        VStack(spacing: AppDimensions.spacingS) {
            PrimaryButton(
                String(localized: "sms.send.button"),
                icon: "paperplane.fill"
            ) {
                sendSMS()
            }

            Text(String(localized: "sms.send.hint"))
                .font(AppFonts.caption)
                .foregroundStyle(AppColors.textTertiary)
                .multilineTextAlignment(.center)
        }
    }

    // MARK: - Génération du SMS

    /// Message SMS structuré généré à partir des sélections actuelles
    private var generatedSMS: String {
        let symptomCodes = selectedSymptoms
            .sorted { $0.rawValue < $1.rawValue }
            .map(\.rawValue)

        return SMSHelper.generateSMS(
            category: selectedCategory.rawValue,
            species: selectedSpecies.rawValue,
            symptoms: symptomCodes,
            region: selectedRegion?.id ?? "",
            description: descriptionText
        )
    }

    // MARK: - Actions

    /// Ouvre le composeur SMS natif ou affiche une alerte si indisponible
    private func sendSMS() {
        HapticHelper.impact(.medium)

        guard MFMessageComposeViewController.canSendText() else {
            showUnavailableAlert = true
            return
        }

        showSMSComposer = true
    }

    /// Réinitialise le formulaire après un envoi réussi
    private func resetForm() {
        selectedCategory = .humanHealth
        selectedSpecies = .HUM
        selectedSymptoms = []
        selectedRegion = nil
        descriptionText = ""
        HapticHelper.notification(.success)
    }

    // MARK: - Résultat SMS

    /// Titre de l'alerte de résultat
    private var smsResultTitle: String {
        switch smsResult {
        case .sent:     String(localized: "sms.result.sent.title")
        case .failed:   String(localized: "sms.result.failed.title")
        case .cancelled: String(localized: "sms.result.cancelled.title")
        default:        ""
        }
    }

    /// Message de l'alerte de résultat
    private var smsResultMessage: String {
        switch smsResult {
        case .sent:     String(localized: "sms.result.sent.message")
        case .failed:   String(localized: "sms.result.failed.message")
        case .cancelled: String(localized: "sms.result.cancelled.message")
        default:        ""
        }
    }
}

// MARK: - Bridge MFMessageComposeViewController -> SwiftUI

/// Représentable SwiftUI pour MFMessageComposeViewController
/// Permet d'ouvrir le composeur SMS natif depuis une vue SwiftUI.
struct SMSComposerRepresentable: UIViewControllerRepresentable {

    /// Numéros de téléphone destinataires
    let recipients: [String]

    /// Corps du message SMS pré-rempli
    let body: String

    /// Résultat de l'envoi retourné au parent
    @Binding var result: MessageComposeResult?

    /// Crée le UIViewController
    func makeUIViewController(context: Context) -> MFMessageComposeViewController {
        let controller = MFMessageComposeViewController()
        controller.recipients = recipients
        controller.body = body
        controller.messageComposeDelegate = context.coordinator
        return controller
    }

    /// Met à jour le UIViewController (non utilisé)
    func updateUIViewController(
        _ uiViewController: MFMessageComposeViewController,
        context: Context
    ) {
        // Pas de mise à jour nécessaire
    }

    /// Crée le coordinateur (delegate)
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    /// Coordinateur qui implémente le delegate MessageUI
    final class Coordinator: NSObject, MFMessageComposeViewControllerDelegate {

        let parent: SMSComposerRepresentable

        init(_ parent: SMSComposerRepresentable) {
            self.parent = parent
        }

        /// Appelé quand le composeur est fermé (envoyé, annulé ou échoué)
        func messageComposeViewController(
            _ controller: MFMessageComposeViewController,
            didFinishWith result: MessageComposeResult
        ) {
            parent.result = result
            controller.dismiss(animated: true)
        }
    }
}

// MARK: - Prévisualisation

#Preview {
    NavigationStack {
        SMSReportView()
    }
}
