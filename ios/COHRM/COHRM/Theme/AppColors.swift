// AppColors.swift
// COHRM Cameroun - Palette de couleurs

import SwiftUI

/// Couleurs de l'application COHRM
/// Respecte le Dark Mode via les assets adaptatifs
enum AppColors {

    // MARK: - Couleurs principales

    /// Bleu principal (#1B4F72)
    static let primary = Color("PrimaryColor", bundle: .main)

    /// Bleu principal clair (#2980B9)
    static let primaryLight = Color(hex: 0x2980B9)

    /// Bleu principal foncé (#154360)
    static let primaryDark = Color(hex: 0x154360)

    /// Vert accent (#27AE60)
    static let accent = Color(hex: 0x27AE60)

    /// Vert accent clair (#2ECC71)
    static let accentLight = Color(hex: 0x2ECC71)

    /// Orange alerte (#FF5722)
    static let alert = Color(hex: 0xFF5722)

    // MARK: - Couleurs sémantiques

    /// Succès (#27AE60)
    static let success = Color(hex: 0x27AE60)

    /// Avertissement (#F39C12)
    static let warning = Color(hex: 0xF39C12)

    /// Danger (#E74C3C)
    static let danger = Color(hex: 0xE74C3C)

    /// Info (#3498DB)
    static let info = Color(hex: 0x3498DB)

    /// Texte secondaire
    static let muted = Color(hex: 0x95A5A6)

    // MARK: - Couleurs de fond

    /// Fond principal adaptatif
    static let background = Color(uiColor: .systemBackground)

    /// Fond secondaire adaptatif
    static let secondaryBackground = Color(uiColor: .secondarySystemBackground)

    /// Fond groupé adaptatif
    static let groupedBackground = Color(uiColor: .systemGroupedBackground)

    /// Fond de carte
    static let cardBackground = Color(uiColor: .secondarySystemGroupedBackground)

    // MARK: - Couleurs de texte

    /// Texte principal
    static let textPrimary = Color(uiColor: .label)

    /// Texte secondaire
    static let textSecondary = Color(uiColor: .secondaryLabel)

    /// Texte tertiaire
    static let textTertiary = Color(uiColor: .tertiaryLabel)

    // MARK: - Couleurs de catégorie (événements)

    /// Santé humaine
    static let humanHealth = Color(hex: 0xE74C3C)

    /// Santé animale
    static let animalHealth = Color(hex: 0x9B59B6)

    /// Environnement
    static let environmental = Color(hex: 0x27AE60)

    /// Sécurité
    static let safety = Color(hex: 0xE67E22)

    /// Catastrophe
    static let disaster = Color(hex: 0x3498DB)

    // MARK: - Gradients

    /// Gradient principal
    static let primaryGradient = LinearGradient(
        colors: [Color(hex: 0x1B4F72), Color(hex: 0x2980B9)],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    /// Gradient accent
    static let accentGradient = LinearGradient(
        colors: [Color(hex: 0x27AE60), Color(hex: 0x2ECC71)],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}

// MARK: - Extension Color pour hex

extension Color {
    /// Initialise une couleur depuis un code hexadécimal
    init(hex: UInt, alpha: Double = 1.0) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255.0,
            green: Double((hex >> 8) & 0xFF) / 255.0,
            blue: Double(hex & 0xFF) / 255.0,
            opacity: alpha
        )
    }
}
