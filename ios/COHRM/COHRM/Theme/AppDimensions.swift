// AppDimensions.swift
// COHRM Cameroun - Dimensions et espacements

import SwiftUI

/// Constantes de dimensions pour un design cohérent
enum AppDimensions {

    // MARK: - Espacements

    /// Espacement minimal (4pt)
    static let spacingXS: CGFloat = 4

    /// Petit espacement (8pt)
    static let spacingS: CGFloat = 8

    /// Espacement moyen (12pt)
    static let spacingM: CGFloat = 12

    /// Espacement standard (16pt)
    static let spacing: CGFloat = 16

    /// Grand espacement (24pt)
    static let spacingL: CGFloat = 24

    /// Très grand espacement (32pt)
    static let spacingXL: CGFloat = 32

    /// Espacement énorme (48pt)
    static let spacingXXL: CGFloat = 48

    // MARK: - Rayons de coins

    /// Petit rayon (8pt)
    static let cornerRadiusS: CGFloat = 8

    /// Rayon moyen (12pt)
    static let cornerRadiusM: CGFloat = 12

    /// Grand rayon (16pt)
    static let cornerRadiusL: CGFloat = 16

    /// Rayon très grand (20pt)
    static let cornerRadiusXL: CGFloat = 20

    /// Rayon circulaire (999pt)
    static let cornerRadiusFull: CGFloat = 999

    // MARK: - Tailles de composants

    /// Hauteur de bouton principal (50pt)
    static let buttonHeight: CGFloat = 50

    /// Hauteur de champ texte (44pt)
    static let textFieldHeight: CGFloat = 44

    /// Taille de carte événement (100pt)
    static let eventCardSize: CGFloat = 100

    /// Taille d'icône d'événement (40pt)
    static let eventIconSize: CGFloat = 40

    /// Taille d'avatar (48pt)
    static let avatarSize: CGFloat = 48

    /// Taille de miniature photo (80pt)
    static let thumbnailSize: CGFloat = 80

    /// Hauteur de la barre de progression (4pt)
    static let progressBarHeight: CGFloat = 4

    // MARK: - Tailles de carte

    /// Padding interne de carte
    static let cardPadding: CGFloat = 16

    /// Padding interne de section
    static let sectionPadding: CGFloat = 20
}
