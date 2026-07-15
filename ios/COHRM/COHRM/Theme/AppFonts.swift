// AppFonts.swift
// COHRM Cameroun - Typographie

import SwiftUI

/// Typographie de l'application
/// Utilise les polices système avec Dynamic Type pour l'accessibilité
enum AppFonts {

    // MARK: - Titres

    /// Titre principal (28pt, bold)
    static let largeTitle = Font.largeTitle.weight(.bold)

    /// Titre de section (22pt, bold)
    static let title = Font.title2.weight(.bold)

    /// Titre de carte (17pt, semibold)
    static let headline = Font.headline

    /// Sous-titre (15pt, medium)
    static let subheadline = Font.subheadline.weight(.medium)

    // MARK: - Corps

    /// Corps de texte (17pt, regular)
    static let body = Font.body

    /// Corps secondaire (15pt, regular)
    static let callout = Font.callout

    /// Texte petit (13pt, regular)
    static let footnote = Font.footnote

    /// Texte très petit (11pt, regular)
    static let caption = Font.caption

    /// Texte très petit secondaire (11pt, regular)
    static let caption2 = Font.caption2

    // MARK: - Styles spéciaux

    /// Nombre KPI (34pt, bold, monospaced digits)
    static let kpiNumber = Font.system(size: 34, weight: .bold, design: .rounded)

    /// Nombre stat (24pt, semibold, rounded)
    static let statNumber = Font.system(size: 24, weight: .semibold, design: .rounded)

    /// Badge (12pt, semibold)
    static let badge = Font.system(size: 12, weight: .semibold)

    /// Bouton (17pt, semibold)
    static let button = Font.body.weight(.semibold)
}
