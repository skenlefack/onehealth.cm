// Step4PersonalInfoView.swift
// COHRM Cameroun - Étape 4 : Informations personnelles du déclarant
// Toggle anonyme, champs nom/téléphone/email

import SwiftUI

/// Étape 4 de l'assistant : saisie des informations personnelles du déclarant
struct Step4PersonalInfoView: View {

    // MARK: - Propriétés

    /// ViewModel partagé de l'assistant
    @Bindable var viewModel: ReportViewModel

    // MARK: - Corps

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppDimensions.spacingL) {

                // Titre de la section
                SectionHeader(
                    title: String(localized: "report.step4.title"),
                    icon: "person.fill"
                )

                Text(String(localized: "report.step4.description"))
                    .font(AppFonts.callout)
                    .foregroundStyle(AppColors.textSecondary)

                // Toggle anonyme
                anonymousToggle

                // Formulaire d'identité (visible si non anonyme)
                if !viewModel.reportData.isAnonymous {
                    personalInfoForm
                        .transition(.move(edge: .top).combined(with: .opacity))
                }

                // Notice de confidentialité
                privacyNotice

                Spacer(minLength: AppDimensions.spacingXL)
            }
            .padding(AppDimensions.spacing)
        }
        .animation(.easeInOut(duration: 0.3), value: viewModel.reportData.isAnonymous)
    }

    // MARK: - Toggle anonyme

    /// Toggle pour choisir le signalement anonyme
    private var anonymousToggle: some View {
        VStack(spacing: AppDimensions.spacingM) {
            HStack {
                VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                    Text(String(localized: "report.step4.anonymous"))
                        .font(AppFonts.headline)
                        .foregroundStyle(AppColors.textPrimary)

                    Text(String(localized: "report.step4.anonymous_hint"))
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textSecondary)
                }

                Spacer()

                Toggle("", isOn: $viewModel.reportData.isAnonymous)
                    .labelsHidden()
                    .tint(AppColors.primary)
            }
            .padding(AppDimensions.cardPadding)
            .background(AppColors.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusL, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusL, style: .continuous)
                    .stroke(Color(uiColor: .separator), lineWidth: 0.5)
            )

            // Badge d'information anonyme
            if viewModel.reportData.isAnonymous {
                HStack(spacing: AppDimensions.spacingS) {
                    Image(systemName: "eye.slash.fill")
                        .font(.subheadline)
                        .foregroundStyle(AppColors.info)

                    Text(String(localized: "report.step4.anonymous_info"))
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textSecondary)
                }
                .padding(AppDimensions.spacingM)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(AppColors.info.opacity(0.08))
                .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous))
            }
        }
    }

    // MARK: - Formulaire d'informations personnelles

    /// Champs nom, téléphone et email
    private var personalInfoForm: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {

            // Champ nom
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                HStack(spacing: AppDimensions.spacingXS) {
                    Text(String(localized: "report.step4.name"))
                        .font(AppFonts.subheadline)
                        .foregroundStyle(AppColors.textSecondary)
                    Text("*")
                        .foregroundStyle(AppColors.danger)
                }

                TextField(
                    String(localized: "report.step4.name_placeholder"),
                    text: $viewModel.reportData.reporterName
                )
                .textFieldStyle(.plain)
                .textContentType(.name)
                .autocorrectionDisabled()
                .padding(.horizontal, AppDimensions.spacingM)
                .frame(height: AppDimensions.textFieldHeight)
                .background(AppColors.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous)
                        .stroke(Color(uiColor: .separator), lineWidth: 0.5)
                )
            }

            // Champ téléphone
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                HStack(spacing: AppDimensions.spacingXS) {
                    Text(String(localized: "report.step4.phone"))
                        .font(AppFonts.subheadline)
                        .foregroundStyle(AppColors.textSecondary)
                    Text("*")
                        .foregroundStyle(AppColors.danger)
                }

                HStack(spacing: 0) {
                    // Préfixe pays
                    Text("+237")
                        .font(AppFonts.body)
                        .foregroundStyle(AppColors.textSecondary)
                        .padding(.horizontal, AppDimensions.spacingM)
                        .frame(height: AppDimensions.textFieldHeight)
                        .background(AppColors.groupedBackground)

                    // Séparateur vertical
                    Rectangle()
                        .fill(Color(uiColor: .separator))
                        .frame(width: 1)

                    // Champ de numéro
                    TextField(
                        "6XX XXX XXX",
                        text: $viewModel.reportData.reporterPhone
                    )
                    .textFieldStyle(.plain)
                    .keyboardType(.phonePad)
                    .textContentType(.telephoneNumber)
                    .padding(.horizontal, AppDimensions.spacingM)
                    .frame(height: AppDimensions.textFieldHeight)
                }
                .background(AppColors.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous)
                        .stroke(phoneFieldBorderColor, lineWidth: 0.5)
                )

                // Indication de validation du numéro
                if !viewModel.reportData.reporterPhone.isEmpty {
                    HStack(spacing: AppDimensions.spacingXS) {
                        if viewModel.reportData.reporterPhone.isValidCameroonPhone {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.caption)
                                .foregroundStyle(AppColors.success)
                            Text(String(localized: "report.step4.phone_valid"))
                                .font(AppFonts.caption)
                                .foregroundStyle(AppColors.success)
                        } else {
                            Image(systemName: "exclamationmark.circle")
                                .font(.caption)
                                .foregroundStyle(AppColors.warning)
                            Text(String(localized: "report.step4.phone_hint"))
                                .font(AppFonts.caption)
                                .foregroundStyle(AppColors.warning)
                        }
                    }
                }
            }

            // Champ email (optionnel)
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                HStack(spacing: AppDimensions.spacingXS) {
                    Text(String(localized: "report.step4.email"))
                        .font(AppFonts.subheadline)
                        .foregroundStyle(AppColors.textSecondary)

                    Text(String(localized: "report.step4.optional"))
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textTertiary)
                }

                TextField(
                    String(localized: "report.step4.email_placeholder"),
                    text: $viewModel.reportData.reporterEmail
                )
                .textFieldStyle(.plain)
                .keyboardType(.emailAddress)
                .textContentType(.emailAddress)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .padding(.horizontal, AppDimensions.spacingM)
                .frame(height: AppDimensions.textFieldHeight)
                .background(AppColors.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous)
                        .stroke(emailFieldBorderColor, lineWidth: 0.5)
                )

                // Validation email
                if !viewModel.reportData.reporterEmail.isEmpty,
                   !viewModel.reportData.reporterEmail.isValidEmail {
                    HStack(spacing: AppDimensions.spacingXS) {
                        Image(systemName: "exclamationmark.circle")
                            .font(.caption)
                            .foregroundStyle(AppColors.warning)
                        Text(String(localized: "report.step4.email_invalid"))
                            .font(AppFonts.caption)
                            .foregroundStyle(AppColors.warning)
                    }
                }
            }
        }
    }

    // MARK: - Notice de confidentialité

    /// Texte informatif sur la protection des données
    private var privacyNotice: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
            HStack(spacing: AppDimensions.spacingS) {
                Image(systemName: "lock.shield.fill")
                    .font(.subheadline)
                    .foregroundStyle(AppColors.primary)
                Text(String(localized: "report.step4.privacy_title"))
                    .font(AppFonts.subheadline)
                    .foregroundStyle(AppColors.textPrimary)
            }

            Text(String(localized: "report.step4.privacy_text"))
                .font(AppFonts.caption)
                .foregroundStyle(AppColors.textTertiary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(AppDimensions.cardPadding)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(AppColors.primary.opacity(0.04))
        .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous)
                .stroke(AppColors.primary.opacity(0.15), lineWidth: 1)
        )
    }

    // MARK: - Couleurs de bordure conditionnelles

    /// Couleur de bordure du champ téléphone selon la validation
    private var phoneFieldBorderColor: Color {
        if viewModel.reportData.reporterPhone.isEmpty {
            return Color(uiColor: .separator)
        }
        return viewModel.reportData.reporterPhone.isValidCameroonPhone
            ? AppColors.success.opacity(0.5)
            : Color(uiColor: .separator)
    }

    /// Couleur de bordure du champ email selon la validation
    private var emailFieldBorderColor: Color {
        if viewModel.reportData.reporterEmail.isEmpty {
            return Color(uiColor: .separator)
        }
        return viewModel.reportData.reporterEmail.isValidEmail
            ? AppColors.success.opacity(0.5)
            : Color(uiColor: .separator)
    }
}

// MARK: - Aperçu

#Preview {
    Step4PersonalInfoView(viewModel: ReportViewModel())
}
