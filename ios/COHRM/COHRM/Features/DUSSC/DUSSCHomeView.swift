// DUSSCHomeView.swift
// One Health Cameroon - Accueil du module DUSS-C

import SwiftUI

/// Accueil du Défi Une Seule Santé — sélection persona et lancement quiz
struct DUSSCHomeView: View {

    @State private var modules: [DUSSCModule] = []
    @State private var personas: [DUSSCPersona] = []
    @State private var selectedPersona: DUSSCPersona?
    @State private var isLoading = true
    @State private var showQuiz = false

    @AppStorage("appLanguage") private var appLanguage = "fr"

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                headerSection
                contentSection
            }
        }
        .background(AppColors.background)
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .task { await loadData() }
        .fullScreenCover(isPresented: $showQuiz) {
            NavigationStack {
                DUSSCQuizView(personaCode: selectedPersona?.code)
            }
        }
    }

    // MARK: - Header

    private var headerSection: some View {
        ZStack(alignment: .bottomLeading) {
            LinearGradient(
                colors: [Color(hex: 0x2F5D3A), Color(hex: 0x27AE60), Color(hex: 0x2ECC71)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .frame(height: 220)
            .clipShape(UnevenRoundedRectangle(bottomLeadingRadius: 28, bottomTrailingRadius: 28))

            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 8) {
                    Image(systemName: "brain.fill")
                        .font(.title2)
                    Text(appLanguage == "fr" ? "Défi Une Seule Santé" : "One Health Challenge")
                        .font(.title2).fontWeight(.bold)
                }

                Text(appLanguage == "fr"
                     ? "Testez vos connaissances en santé intégrée"
                     : "Test your integrated health knowledge")
                    .font(.subheadline)
                    .opacity(0.85)

                HStack(spacing: 16) {
                    Label("15 questions", systemImage: "questionmark.circle")
                    Label("~7 min", systemImage: "clock")
                }
                .font(.caption)
                .opacity(0.7)
            }
            .foregroundStyle(.white)
            .padding(20)
        }
    }

    // MARK: - Content

    private var contentSection: some View {
        VStack(spacing: 24) {
            if isLoading {
                ProgressView().controlSize(.large).padding(.top, 60)
            } else {
                // Modules covered
                if !modules.isEmpty {
                    modulesSection
                }

                // Persona selection
                if !personas.isEmpty {
                    personaSection
                }

                // Start button
                startSection
            }
        }
        .padding(.top, 20)
        .padding(.bottom, 32)
    }

    // MARK: - Modules

    private var modulesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(appLanguage == "fr" ? "Thèmes couverts" : "Topics covered")
                .font(.headline).fontWeight(.semibold)
                .padding(.horizontal, 16)

            ScrollView(.horizontal, showsIndicators: false) {
                LazyHStack(spacing: 10) {
                    ForEach(modules) { module in
                        VStack(spacing: 8) {
                            Circle()
                                .fill(Color(hex: UInt(module.color?.dropFirst().flatMap { UInt($0, radix: 16) } ?? 0x27AE60)))
                                .frame(width: 44, height: 44)
                                .overlay {
                                    Image(systemName: moduleIcon(module.icon))
                                        .foregroundStyle(.white)
                                }

                            Text(module.name)
                                .font(.caption2)
                                .foregroundStyle(AppColors.textPrimary)
                                .multilineTextAlignment(.center)
                                .lineLimit(2)
                                .frame(width: 80)
                        }
                    }
                }
                .padding(.horizontal, 16)
            }
        }
    }

    // MARK: - Persona

    private var personaSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(appLanguage == "fr" ? "Votre profil" : "Your profile")
                .font(.headline).fontWeight(.semibold)
                .padding(.horizontal, 16)

            Text(appLanguage == "fr"
                 ? "Sélectionnez votre profil pour des questions adaptées"
                 : "Select your profile for tailored questions")
                .font(.caption)
                .foregroundStyle(AppColors.textSecondary)
                .padding(.horizontal, 16)

            // Group by family
            let families = Dictionary(grouping: personas, by: { $0.family })

            ForEach(["A", "B", "C", "D"], id: \.self) { family in
                if let group = families[family], !group.isEmpty {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(familyLabel(family))
                            .font(.caption2).fontWeight(.bold)
                            .foregroundStyle(AppColors.textTertiary)
                            .padding(.horizontal, 16)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(group) { persona in
                                    Button {
                                        withAnimation(.easeInOut(duration: 0.2)) {
                                            selectedPersona = selectedPersona?.code == persona.code ? nil : persona
                                        }
                                    } label: {
                                        Text(persona.name)
                                            .font(.caption).fontWeight(.medium)
                                            .padding(.horizontal, 14).padding(.vertical, 8)
                                            .background(selectedPersona?.code == persona.code
                                                        ? Color(hex: 0x2F5D3A)
                                                        : AppColors.secondaryBackground)
                                            .foregroundStyle(selectedPersona?.code == persona.code
                                                            ? .white
                                                            : AppColors.textPrimary)
                                            .clipShape(Capsule())
                                    }
                                }
                            }
                            .padding(.horizontal, 16)
                        }
                    }
                }
            }
        }
    }

    // MARK: - Start

    private var startSection: some View {
        VStack(spacing: 16) {
            // Selected persona info
            if let persona = selectedPersona {
                HStack(spacing: 10) {
                    Image(systemName: "person.fill.checkmark")
                        .foregroundStyle(Color(hex: 0x27AE60))
                    VStack(alignment: .leading, spacing: 2) {
                        Text(persona.name)
                            .font(.subheadline).fontWeight(.medium)
                        if let desc = persona.description {
                            Text(desc)
                                .font(.caption2).foregroundStyle(AppColors.textSecondary)
                                .lineLimit(2)
                        }
                    }
                    Spacer()
                    Button { selectedPersona = nil } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(AppColors.muted)
                    }
                }
                .padding(12)
                .background(Color(hex: 0x27AE60).opacity(0.08))
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .padding(.horizontal, 16)
            }

            // Launch button
            Button {
                showQuiz = true
            } label: {
                HStack(spacing: 10) {
                    Image(systemName: "play.fill")
                    Text(appLanguage == "fr" ? "Lancer le défi" : "Start the challenge")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(
                    LinearGradient(colors: [Color(hex: 0x2F5D3A), Color(hex: 0x27AE60)], startPoint: .leading, endPoint: .trailing)
                )
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 14))
            }
            .padding(.horizontal, 16)

            // Note
            Text(appLanguage == "fr"
                 ? "Quiz anonyme • Aucune donnée personnelle collectée"
                 : "Anonymous quiz • No personal data collected")
                .font(.caption2)
                .foregroundStyle(AppColors.textTertiary)
        }
    }

    // MARK: - Helpers

    private func loadData() async {
        isLoading = true
        async let m = loadModules()
        async let p = loadPersonas()
        _ = await (m, p)
        isLoading = false
    }

    private func loadModules() async {
        do {
            let response = try await DUSSCService.shared.getModules()
            modules = response.data ?? []
        } catch { print("[OneHealth] Error: \(error.localizedDescription)") }
    }

    private func loadPersonas() async {
        do {
            let response = try await DUSSCService.shared.getPersonas()
            personas = response.data ?? []
        } catch { print("[OneHealth] Error: \(error.localizedDescription)") }
    }

    private func moduleIcon(_ icon: String?) -> String {
        switch icon {
        case "droplets": "drop.fill"
        case "paw": "pawprint.fill"
        case "bug": "ant.fill"
        case "heart": "heart.fill"
        case "leaf": "leaf.fill"
        case "shield": "shield.fill"
        default: "brain.fill"
        }
    }

    private func familyLabel(_ family: String) -> String {
        switch family {
        case "A": appLanguage == "fr" ? "Famille A — Grand public" : "Family A — General public"
        case "B": appLanguage == "fr" ? "Famille B — Professionnels" : "Family B — Professionals"
        case "C": appLanguage == "fr" ? "Famille C — Décideurs" : "Family C — Decision makers"
        case "D": appLanguage == "fr" ? "Famille D — Étudiants" : "Family D — Students"
        default: family
        }
    }
}
