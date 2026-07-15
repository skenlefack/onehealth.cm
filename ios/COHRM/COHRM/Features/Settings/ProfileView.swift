// ProfileView.swift
// COHRM Cameroun - Vue de gestion du profil et mot de passe

import SwiftUI

/// Vue d'edition du profil utilisateur et changement de mot de passe
struct ProfileView: View {

    @State private var viewModel = ProfileViewModel()

    var body: some View {
        Form {
            // Section Informations personnelles
            profileSection

            // Section Changement de mot de passe
            passwordSection
        }
        .navigationTitle(String(localized: "profile.title"))
        .navigationBarTitleDisplayMode(.large)
        .alert(viewModel.alertMessage, isPresented: $viewModel.showAlert) {
            Button(String(localized: "settings.alert.ok")) {}
        }
    }

    // MARK: - Section Profil

    private var profileSection: some View {
        Section {
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                Text(String(localized: "profile.first_name"))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)

                TextField(
                    String(localized: "profile.first_name.placeholder"),
                    text: $viewModel.firstName
                )
                .textFieldStyle(.roundedBorder)
                .textContentType(.givenName)
                .autocorrectionDisabled()
            }

            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                Text(String(localized: "profile.last_name"))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)

                TextField(
                    String(localized: "profile.last_name.placeholder"),
                    text: $viewModel.lastName
                )
                .textFieldStyle(.roundedBorder)
                .textContentType(.familyName)
                .autocorrectionDisabled()
            }

            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                Text(String(localized: "profile.phone"))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)

                TextField(
                    String(localized: "profile.phone.placeholder"),
                    text: $viewModel.phone
                )
                .textFieldStyle(.roundedBorder)
                .textContentType(.telephoneNumber)
                .keyboardType(.phonePad)
            }

            // Bouton sauvegarder
            Button {
                Task { await viewModel.saveProfile() }
            } label: {
                HStack {
                    if viewModel.isSavingProfile {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Image(systemName: "checkmark.circle.fill")
                    }
                    Text(String(localized: "profile.save"))
                        .font(AppFonts.button)
                }
                .frame(maxWidth: .infinity)
                .frame(height: AppDimensions.buttonHeight)
                .foregroundStyle(.white)
                .background(AppColors.primaryGradient)
                .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous))
            }
            .disabled(viewModel.isSavingProfile)
            .listRowInsets(EdgeInsets(top: AppDimensions.spacingS, leading: 0, bottom: AppDimensions.spacingS, trailing: 0))
        } header: {
            Label(
                String(localized: "profile.info.header"),
                systemImage: "person.circle.fill"
            )
        } footer: {
            Text(String(localized: "profile.info.footer"))
                .font(AppFonts.caption)
        }
    }

    // MARK: - Section Mot de passe

    private var passwordSection: some View {
        Section {
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                Text(String(localized: "profile.current_password"))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)

                SecureField(
                    String(localized: "profile.current_password.placeholder"),
                    text: $viewModel.currentPassword
                )
                .textFieldStyle(.roundedBorder)
                .textContentType(.password)
            }

            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                Text(String(localized: "profile.new_password"))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)

                SecureField(
                    String(localized: "profile.new_password.placeholder"),
                    text: $viewModel.newPassword
                )
                .textFieldStyle(.roundedBorder)
                .textContentType(.newPassword)
            }

            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                Text(String(localized: "profile.confirm_password"))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)

                SecureField(
                    String(localized: "profile.confirm_password.placeholder"),
                    text: $viewModel.confirmPassword
                )
                .textFieldStyle(.roundedBorder)
                .textContentType(.newPassword)

                // Validation message
                if !viewModel.confirmPassword.isEmpty && viewModel.newPassword != viewModel.confirmPassword {
                    Text(String(localized: "profile.password_mismatch"))
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.danger)
                }
            }

            // Bouton changer mot de passe
            Button {
                Task { await viewModel.changePassword() }
            } label: {
                HStack {
                    if viewModel.isChangingPassword {
                        ProgressView()
                            .tint(AppColors.primary)
                    } else {
                        Image(systemName: "lock.rotation")
                    }
                    Text(String(localized: "profile.change_password"))
                        .font(AppFonts.button)
                }
                .frame(maxWidth: .infinity)
                .frame(height: AppDimensions.buttonHeight)
                .foregroundStyle(AppColors.primary)
                .background(AppColors.primary.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM, style: .continuous))
            }
            .disabled(viewModel.isChangingPassword || !viewModel.canChangePassword)
            .listRowInsets(EdgeInsets(top: AppDimensions.spacingS, leading: 0, bottom: AppDimensions.spacingS, trailing: 0))
        } header: {
            Label(
                String(localized: "profile.password.header"),
                systemImage: "lock.fill"
            )
        } footer: {
            Text(String(localized: "profile.password.footer"))
                .font(AppFonts.caption)
        }
    }
}

// MARK: - ViewModel

@MainActor
@Observable
final class ProfileViewModel {

    // MARK: - Profil

    var firstName: String = ""
    var lastName: String = ""
    var phone: String = ""
    var isSavingProfile = false

    // MARK: - Mot de passe

    var currentPassword: String = ""
    var newPassword: String = ""
    var confirmPassword: String = ""
    var isChangingPassword = false

    // MARK: - Alertes

    var alertMessage: String = ""
    var showAlert = false

    /// Verifie que le changement de mot de passe est possible
    var canChangePassword: Bool {
        !currentPassword.isEmpty
            && newPassword.count >= 6
            && newPassword == confirmPassword
    }

    // MARK: - Actions

    /// Sauvegarde les modifications du profil
    func saveProfile() async {
        isSavingProfile = true

        do {
            let request = ProfileUpdateRequest(
                firstName: firstName.isEmpty ? nil : firstName,
                lastName: lastName.isEmpty ? nil : lastName,
                phone: phone.isEmpty ? nil : phone
            )
            let response = try await APIService.shared.updateProfile(request: request)
            if response.success {
                HapticHelper.notification(.success)
                alertMessage = String(localized: "profile.save.success")
            } else {
                alertMessage = response.message ?? String(localized: "profile.save.error")
                HapticHelper.notification(.error)
            }
        } catch {
            alertMessage = error.localizedDescription
            HapticHelper.notification(.error)
        }

        showAlert = true
        isSavingProfile = false
    }

    /// Change le mot de passe
    func changePassword() async {
        guard canChangePassword else { return }

        isChangingPassword = true

        do {
            let request = ChangePasswordRequest(
                currentPassword: currentPassword,
                newPassword: newPassword
            )
            let response = try await APIService.shared.changePassword(request: request)
            if response.success {
                HapticHelper.notification(.success)
                alertMessage = String(localized: "profile.password.success")
                // Vider les champs
                currentPassword = ""
                newPassword = ""
                confirmPassword = ""
            } else {
                alertMessage = response.message ?? String(localized: "profile.password.error")
                HapticHelper.notification(.error)
            }
        } catch {
            alertMessage = error.localizedDescription
            HapticHelper.notification(.error)
        }

        showAlert = true
        isChangingPassword = false
    }
}

// MARK: - Apercu

#Preview {
    NavigationStack {
        ProfileView()
    }
}
