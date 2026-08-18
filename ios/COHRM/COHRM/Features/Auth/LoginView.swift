// LoginView.swift
// One Health Cameroon - Écran de connexion

import SwiftUI

/// Écran de connexion à la plateforme One Health Cameroon
struct LoginView: View {

    @State private var email = ""
    @State private var password = ""
    @State private var showPassword = false

    @AppStorage("appLanguage") private var appLanguage = "fr"

    private let authManager = AuthManager.shared

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Header avec branding
                headerSection

                // Formulaire
                formSection
            }
        }
        .background(AppColors.background)
        .ignoresSafeArea(.container, edges: .top)
    }

    // MARK: - Header

    private var headerSection: some View {
        ZStack {
            // Gradient de fond
            AppColors.platformGradient
                .frame(height: 280)
                .clipShape(
                    UnevenRoundedRectangle(
                        bottomLeadingRadius: 32,
                        bottomTrailingRadius: 32
                    )
                )

            VStack(spacing: 16) {
                // Logo
                Image("one-health-logo")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 80, height: 80)
                    .clipShape(Circle())
                    .overlay(Circle().stroke(.white.opacity(0.3), lineWidth: 2))
                    .shadow(color: .black.opacity(0.2), radius: 10)

                // Titre
                Text("One Health Cameroun")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundStyle(.white)

                Text(String(localized: "login.subtitle"))
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.8))
            }
            .padding(.top, 60)
        }
    }

    // MARK: - Formulaire

    private var formSection: some View {
        VStack(spacing: 20) {
            // Titre
            Text(String(localized: "login.title"))
                .font(.title3)
                .fontWeight(.semibold)
                .foregroundStyle(AppColors.textPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)

            // Champ email
            VStack(alignment: .leading, spacing: 6) {
                Text(String(localized: "login.email"))
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundStyle(AppColors.textSecondary)

                HStack {
                    Image(systemName: "envelope.fill")
                        .foregroundStyle(AppColors.muted)
                        .frame(width: 20)

                    TextField(String(localized: "login.email.placeholder"), text: $email)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)
                }
                .padding()
                .background(AppColors.secondaryBackground)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }

            // Champ mot de passe
            VStack(alignment: .leading, spacing: 6) {
                Text(String(localized: "login.password"))
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundStyle(AppColors.textSecondary)

                HStack {
                    Image(systemName: "lock.fill")
                        .foregroundStyle(AppColors.muted)
                        .frame(width: 20)

                    if showPassword {
                        TextField(String(localized: "login.password.placeholder"), text: $password)
                            .textContentType(.password)
                    } else {
                        SecureField(String(localized: "login.password.placeholder"), text: $password)
                            .textContentType(.password)
                    }

                    Button {
                        showPassword.toggle()
                    } label: {
                        Image(systemName: showPassword ? "eye.slash.fill" : "eye.fill")
                            .foregroundStyle(AppColors.muted)
                    }
                }
                .padding()
                .background(AppColors.secondaryBackground)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }

            // Erreur
            if let error = authManager.loginError {
                HStack(spacing: 8) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundStyle(AppColors.danger)
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(AppColors.danger)
                }
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(AppColors.danger.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }

            // Bouton connexion
            Button {
                Task {
                    await authManager.login(email: email, password: password)
                }
            } label: {
                HStack(spacing: 10) {
                    if authManager.isLoading {
                        ProgressView()
                            .tint(.white)
                    }
                    Text(authManager.isLoading
                         ? String(localized: "login.loading")
                         : String(localized: "login.button"))
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(isFormValid ? AppColors.primaryGradient : LinearGradient(colors: [.gray], startPoint: .leading, endPoint: .trailing))
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 14))
            }
            .disabled(!isFormValid || authManager.isLoading)

            // Langue
            HStack {
                Spacer()
                Button {
                    appLanguage = appLanguage == "fr" ? "en" : "fr"
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "globe")
                        Text(appLanguage == "fr" ? "English" : "Français")
                    }
                    .font(.caption)
                    .foregroundStyle(AppColors.primary)
                }
            }
        }
        .padding(24)
        .padding(.top, 8)
    }

    // MARK: - Helpers

    private var isFormValid: Bool {
        !email.trimmingCharacters(in: .whitespaces).isEmpty
        && !password.isEmpty
    }
}

#Preview {
    LoginView()
}
