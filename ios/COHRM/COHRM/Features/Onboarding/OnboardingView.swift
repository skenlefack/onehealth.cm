// OnboardingView.swift
// COHRM Cameroun - Écran d'accueil (première ouverture)
//
// Présente les fonctionnalités principales de l'application
// en 3 pages avec animations fluides et bouton d'action.

import SwiftUI

// MARK: - Modèle de page d'onboarding

/// Données d'une page d'introduction
private struct OnboardingPage: Identifiable {
    let id: Int
    let icon: String
    let title: String
    let subtitle: String
}

// MARK: - Vue principale d'onboarding

/// Écran d'onboarding affiché au premier lancement de l'application.
/// Utilise un `TabView` avec style pagination pour naviguer entre 3 pages
/// présentant les fonctionnalités clés : surveillance, signalement rapide
/// et mode hors-ligne.
struct OnboardingView: View {

    // MARK: - Callback

    /// Appelé lorsque l'utilisateur termine l'onboarding
    let onComplete: () -> Void

    // MARK: - État local

    /// Index de la page actuellement affichée
    @State private var currentPage = 0

    /// Contrôle l'animation d'apparition initiale
    @State private var isAnimating = false

    // MARK: - Données des pages

    /// Les 3 pages d'introduction
    private let pages: [OnboardingPage] = [
        OnboardingPage(
            id: 0,
            icon: "shield.checkered",
            title: String(localized: "onboarding.page1.title"),
            subtitle: String(localized: "onboarding.page1.subtitle")
        ),
        OnboardingPage(
            id: 1,
            icon: "megaphone.fill",
            title: String(localized: "onboarding.page2.title"),
            subtitle: String(localized: "onboarding.page2.subtitle")
        ),
        OnboardingPage(
            id: 2,
            icon: "wifi.slash",
            title: String(localized: "onboarding.page3.title"),
            subtitle: String(localized: "onboarding.page3.subtitle")
        ),
    ]

    // MARK: - Corps

    var body: some View {
        ZStack {
            // Fond avec dégradé subtil
            backgroundLayer

            VStack(spacing: 0) {
                // Contenu paginé
                pageContent

                Spacer(minLength: AppDimensions.spacingL)

                // Indicateurs de page
                pageIndicators
                    .padding(.bottom, AppDimensions.spacingL)

                // Bouton d'action
                actionButton
                    .padding(.horizontal, AppDimensions.spacingL)
                    .padding(.bottom, AppDimensions.spacingXL)
            }
        }
        .onAppear {
            // Déclencher l'animation d'apparition
            withAnimation(.easeOut(duration: 0.8)) {
                isAnimating = true
            }
        }
    }

    // MARK: - Sous-vues

    /// Fond avec dégradé très léger
    private var backgroundLayer: some View {
        AppColors.background
            .ignoresSafeArea()
            .overlay(
                LinearGradient(
                    colors: [
                        AppColors.primary.opacity(0.05),
                        Color.clear,
                    ],
                    startPoint: .top,
                    endPoint: .center
                )
                .ignoresSafeArea()
            )
    }

    /// Contenu paginé avec `TabView`
    private var pageContent: some View {
        TabView(selection: $currentPage) {
            ForEach(pages) { page in
                OnboardingPageView(
                    page: page,
                    isAnimating: isAnimating
                )
                .tag(page.id)
            }
        }
        .tabViewStyle(.page(indexDisplayMode: .never))
        .animation(.easeInOut(duration: 0.3), value: currentPage)
    }

    /// Indicateurs de page personnalisés (points)
    private var pageIndicators: some View {
        HStack(spacing: AppDimensions.spacingS) {
            ForEach(pages) { page in
                Capsule()
                    .fill(page.id == currentPage ? AppColors.primary : AppColors.muted.opacity(0.4))
                    .frame(
                        width: page.id == currentPage ? 24 : 8,
                        height: 8
                    )
                    .animation(.spring(response: 0.3, dampingFraction: 0.7), value: currentPage)
            }
        }
    }

    /// Bouton principal : "Suivant" ou "Commencer" selon la page
    private var actionButton: some View {
        Group {
            if currentPage < pages.count - 1 {
                // Bouton "Suivant" pour les pages intermédiaires
                VStack(spacing: AppDimensions.spacingM) {
                    PrimaryButton(
                        String(localized: "onboarding.next"),
                        icon: "arrow.right"
                    ) {
                        withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                            currentPage += 1
                        }
                    }

                    // Lien pour sauter l'onboarding
                    Button {
                        HapticHelper.selection()
                        completeOnboarding()
                    } label: {
                        Text(String(localized: "onboarding.skip"))
                            .font(AppFonts.callout)
                            .foregroundStyle(AppColors.textSecondary)
                    }
                }
            } else {
                // Bouton "Commencer" sur la dernière page
                PrimaryButton(
                    String(localized: "onboarding.start"),
                    icon: "checkmark.circle"
                ) {
                    completeOnboarding()
                }
                .transition(.opacity.combined(with: .move(edge: .bottom)))
            }
        }
    }

    // MARK: - Actions

    /// Termine l'onboarding avec un retour haptique
    private func completeOnboarding() {
        HapticHelper.notification(.success)
        withAnimation(.easeInOut(duration: 0.3)) {
            onComplete()
        }
    }
}

// MARK: - Vue d'une page individuelle

/// Affiche le contenu d'une page d'onboarding :
/// icône SF Symbol animée, titre et description.
private struct OnboardingPageView: View {

    let page: OnboardingPage
    let isAnimating: Bool

    var body: some View {
        VStack(spacing: AppDimensions.spacingL) {
            Spacer()

            // Icône SF Symbol dans un cercle avec dégradé
            iconView
                .scaleEffect(isAnimating ? 1.0 : 0.5)
                .opacity(isAnimating ? 1.0 : 0.0)

            // Titre de la page
            Text(page.title)
                .font(AppFonts.largeTitle)
                .foregroundStyle(AppColors.textPrimary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, AppDimensions.spacingL)
                .offset(y: isAnimating ? 0 : 20)
                .opacity(isAnimating ? 1.0 : 0.0)

            // Description de la page
            Text(page.subtitle)
                .font(AppFonts.body)
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)
                .lineSpacing(4)
                .padding(.horizontal, AppDimensions.spacingXL)
                .offset(y: isAnimating ? 0 : 30)
                .opacity(isAnimating ? 1.0 : 0.0)

            Spacer()
            Spacer()
        }
    }

    /// Icône principale avec cercle de fond en dégradé
    private var iconView: some View {
        ZStack {
            // Cercle de fond avec dégradé principal
            Circle()
                .fill(AppColors.primaryGradient)
                .frame(width: 140, height: 140)
                .shadow(color: AppColors.primary.opacity(0.3), radius: 20, x: 0, y: 10)

            // Cercle de halo subtil
            Circle()
                .stroke(AppColors.primary.opacity(0.15), lineWidth: 2)
                .frame(width: 170, height: 170)

            // Icône SF Symbol
            Image(systemName: page.icon)
                .font(.system(size: 56, weight: .medium))
                .foregroundStyle(.white)
                .symbolRenderingMode(.hierarchical)
        }
    }
}

// MARK: - Aperçu

#Preview("Onboarding") {
    OnboardingView {
        print("Onboarding terminé")
    }
}

#Preview("Onboarding - Dark") {
    OnboardingView {
        print("Onboarding terminé")
    }
    .preferredColorScheme(.dark)
}
