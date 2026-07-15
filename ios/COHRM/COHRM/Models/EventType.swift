// EventType.swift
// COHRM Cameroun - Types d'événements sanitaires

import SwiftUI

/// Catégories d'événements sanitaires signalables
enum EventCategory: String, Codable, CaseIterable, Identifiable {
    case humanHealth = "human_health"
    case animalHealth = "animal_health"
    case environmental = "environmental"
    case safety = "safety"
    case disaster = "disaster"
    case other = "other"

    var id: String { rawValue }

    /// Libellé en français
    var label: String {
        switch self {
        case .humanHealth: String(localized: "event.human_health")
        case .animalHealth: String(localized: "event.animal_health")
        case .environmental: String(localized: "event.environmental")
        case .safety: String(localized: "event.safety")
        case .disaster: String(localized: "event.disaster")
        case .other: String(localized: "event.other")
        }
    }

    /// Icône SF Symbols
    var icon: String {
        switch self {
        case .humanHealth: "heart.fill"
        case .animalHealth: "pawprint.fill"
        case .environmental: "leaf.fill"
        case .safety: "exclamationmark.shield.fill"
        case .disaster: "cloud.bolt.rain.fill"
        case .other: "questionmark.circle.fill"
        }
    }

    /// Couleur associée
    var color: Color {
        switch self {
        case .humanHealth: AppColors.humanHealth
        case .animalHealth: AppColors.animalHealth
        case .environmental: AppColors.environmental
        case .safety: AppColors.safety
        case .disaster: AppColors.disaster
        case .other: AppColors.muted
        }
    }
}

/// Codes SMS pour les symptômes
enum SymptomCode: String, CaseIterable, Identifiable {
    case FI, VO, DI, TO, ER, HE, PA, MO, AB, RE, NE, OE

    var id: String { rawValue }

    var label: String {
        switch self {
        case .FI: String(localized: "symptom.fever")
        case .VO: String(localized: "symptom.vomiting")
        case .DI: String(localized: "symptom.diarrhea")
        case .TO: String(localized: "symptom.cough")
        case .ER: String(localized: "symptom.rash")
        case .HE: String(localized: "symptom.hemorrhage")
        case .PA: String(localized: "symptom.paralysis")
        case .MO: String(localized: "symptom.mortality")
        case .AB: String(localized: "symptom.abortion")
        case .RE: String(localized: "symptom.respiratory")
        case .NE: String(localized: "symptom.neurological")
        case .OE: String(localized: "symptom.edema")
        }
    }
}

/// Codes SMS pour les espèces
enum SpeciesCode: String, CaseIterable, Identifiable {
    case HUM, BOV, OVI, VOL, POR, SAU, CHI, AUT

    var id: String { rawValue }

    var label: String {
        switch self {
        case .HUM: String(localized: "species.human")
        case .BOV: String(localized: "species.bovine")
        case .OVI: String(localized: "species.sheep_goat")
        case .VOL: String(localized: "species.poultry")
        case .POR: String(localized: "species.swine")
        case .SAU: String(localized: "species.wildlife")
        case .CHI: String(localized: "species.dog_cat")
        case .AUT: String(localized: "species.other")
        }
    }

    var icon: String {
        switch self {
        case .HUM: "person.fill"
        case .BOV: "tortoise.fill"
        case .OVI: "hare.fill"
        case .VOL: "bird.fill"
        case .POR: "pawprint.fill"
        case .SAU: "leaf.fill"
        case .CHI: "dog.fill"
        case .AUT: "questionmark.circle"
        }
    }
}

/// Niveaux de priorité
enum PriorityLevel: String, Codable, CaseIterable {
    case low
    case medium
    case high
    case critical

    var label: String {
        switch self {
        case .low: String(localized: "priority.low")
        case .medium: String(localized: "priority.medium")
        case .high: String(localized: "priority.high")
        case .critical: String(localized: "priority.critical")
        }
    }

    var color: Color {
        switch self {
        case .low: AppColors.success
        case .medium: AppColors.warning
        case .high: Color(hex: 0xE67E22)
        case .critical: AppColors.danger
        }
    }
}
