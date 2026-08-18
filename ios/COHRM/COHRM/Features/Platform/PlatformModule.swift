// PlatformModule.swift
// One Health Cameroon Platform — Définition des modules
//
// Enum central des modules de la plateforme avec métadonnées
// (couleurs, icônes, descriptions, routes).

import SwiftUI

// MARK: - Module de la plateforme

/// Les modules disponibles dans la plateforme One Health
enum PlatformModule: String, CaseIterable, Identifiable {
    case cohrm
    case ohwr
    case dussc
    case elearning

    var id: String { rawValue }

    // MARK: - Métadonnées d'affichage

    var titleFr: String {
        switch self {
        case .cohrm:     "Gestion des Rumeurs"
        case .ohwr:      "Cartographie des Ressources"
        case .dussc:     "Défi Une Seule Santé"
        case .elearning: "E-Learning"
        }
    }

    var titleEn: String {
        switch self {
        case .cohrm:     "Rumor Management"
        case .ohwr:      "Resource Mapping"
        case .dussc:     "One Health Challenge"
        case .elearning: "E-Learning"
        }
    }

    var subtitleFr: String {
        switch self {
        case .cohrm:     "COHRM System"
        case .ohwr:      "OHWR Mapping"
        case .dussc:     "DUSS-C"
        case .elearning: "OH E-Learning"
        }
    }

    var subtitleEn: String {
        switch self {
        case .cohrm:     "COHRM System"
        case .ohwr:      "OHWR Mapping"
        case .dussc:     "DUSS-C"
        case .elearning: "OH E-Learning"
        }
    }

    var descriptionFr: String {
        switch self {
        case .cohrm:
            "Détection, vérification et gestion des rumeurs sanitaires à l'interface humain-animal-environnement"
        case .ohwr:
            "Cartographie des experts, organisations, équipements et documents One Health"
        case .dussc:
            "Quiz interactif de sensibilisation et mesure des connaissances en santé intégrée"
        case .elearning:
            "Formation en ligne sur l'approche Une Seule Santé et les zoonoses"
        }
    }

    var descriptionEn: String {
        switch self {
        case .cohrm:
            "Detection, verification and management of health rumors at the human-animal-environment interface"
        case .ohwr:
            "Mapping of One Health experts, organizations, equipment and documents"
        case .dussc:
            "Interactive quiz for awareness and knowledge measurement in integrated health"
        case .elearning:
            "Online training on the One Health approach and zoonoses"
        }
    }

    /// Icône SF Symbols
    var icon: String {
        switch self {
        case .cohrm:     "megaphone.fill"
        case .ohwr:      "map.fill"
        case .dussc:     "brain.fill"
        case .elearning: "graduationcap.fill"
        }
    }

    /// Couleur principale du module
    var color: Color {
        switch self {
        case .cohrm:     Color(hex: 0x1B4F72)  // Bleu profond
        case .ohwr:      Color(hex: 0x3498DB)  // Bleu clair
        case .dussc:     Color(hex: 0x2F5D3A)  // Vert forêt (identité DUSS-C)
        case .elearning: Color(hex: 0x9B59B6)  // Violet
        }
    }

    /// Couleur claire du module (pour les fonds)
    var colorLight: Color {
        switch self {
        case .cohrm:     Color(hex: 0x2980B9)
        case .ohwr:      Color(hex: 0x5DADE2)
        case .dussc:     Color(hex: 0x27AE60)
        case .elearning: Color(hex: 0xBB8FCE)
        }
    }

    /// Gradient du module
    var gradient: LinearGradient {
        LinearGradient(
            colors: [color, colorLight],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    /// Le module est-il actuellement disponible dans l'app ?
    var isAvailable: Bool {
        switch self {
        case .cohrm:     true      // Déjà implémenté
        case .ohwr:      true      // Implémenté
        case .dussc:     true      // Implémenté
        case .elearning: true      // Implémenté
        }
    }

    // MARK: - Helpers

    func title(lang: String) -> String {
        lang == "fr" ? titleFr : titleEn
    }

    func subtitle(lang: String) -> String {
        lang == "fr" ? subtitleFr : subtitleEn
    }

    func description(lang: String) -> String {
        lang == "fr" ? descriptionFr : descriptionEn
    }
}

// MARK: - Statistique d'un module

/// Une valeur statistique affichée sur la carte d'un module
struct ModuleStat: Identifiable {
    let id = UUID()
    let label: String
    let value: Int
    var suffix: String? = nil
}
