// Extensions.swift
// COHRM Cameroun - Extensions utilitaires

import SwiftUI
import UIKit

// MARK: - View Extensions

extension View {
    /// Applique un style de carte avec ombre et coins arrondis
    func cardStyle(cornerRadius: CGFloat = AppDimensions.cornerRadiusL) -> some View {
        self
            .background(AppColors.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 2)
    }

    /// Applique un fond avec bordure légère
    func borderedCard(cornerRadius: CGFloat = AppDimensions.cornerRadiusL) -> some View {
        self
            .background(AppColors.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .stroke(Color(uiColor: .separator), lineWidth: 0.5)
            )
    }

    /// Masque conditionnel
    @ViewBuilder
    func `if`<Content: View>(_ condition: Bool, transform: (Self) -> Content) -> some View {
        if condition {
            transform(self)
        } else {
            self
        }
    }

    /// Appliquer un callback sur apparition si une condition est vraie
    func onAppearOnce(_ action: @escaping () -> Void) -> some View {
        self.onAppear(perform: action)
    }
}

// MARK: - Date Extensions

extension Date {
    /// Formate en date locale française courte (ex: "12 mars 2025")
    var shortLocalizedString: String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: self)
    }

    /// Formate en date et heure (ex: "12 mars 2025 à 14:30")
    var dateTimeString: String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: self)
    }

    /// Durée relative (ex: "Il y a 2 heures")
    var relativeString: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.unitsStyle = .full
        return formatter.localizedString(for: self, relativeTo: .now)
    }

    /// Format ISO 8601 pour l'API
    var iso8601String: String {
        ISO8601DateFormatter().string(from: self)
    }
}

// MARK: - String Extensions

extension String {
    /// Tronque à N caractères avec ellipsis
    func truncated(to maxLength: Int) -> String {
        if count <= maxLength { return self }
        return String(prefix(maxLength)) + "..."
    }

    /// Valide un email
    var isValidEmail: Bool {
        let regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/
            .ignoresCase()
        return self.wholeMatch(of: regex) != nil
    }

    /// Valide un numéro de téléphone camerounais
    var isValidCameroonPhone: Bool {
        let cleaned = replacingOccurrences(of: " ", with: "")
            .replacingOccurrences(of: "+237", with: "")
        return cleaned.count == 9 && cleaned.allSatisfy(\.isNumber)
    }

    /// Formate un numéro de téléphone camerounais
    var formattedCameroonPhone: String {
        let cleaned = replacingOccurrences(of: " ", with: "")
            .replacingOccurrences(of: "+237", with: "")
        guard cleaned.count == 9 else { return self }
        let idx1 = cleaned.index(cleaned.startIndex, offsetBy: 3)
        let idx2 = cleaned.index(cleaned.startIndex, offsetBy: 6)
        return "+237 \(cleaned[..<idx1]) \(cleaned[idx1..<idx2]) \(cleaned[idx2...])"
    }
}

// MARK: - UIImage Extensions

extension UIImage {
    /// Compresse l'image en JPEG avec une taille maximale
    func compressed(maxDimension: CGFloat = 1024, quality: CGFloat = 0.8) -> Data? {
        let ratio = max(size.width, size.height) / maxDimension
        let newSize: CGSize
        if ratio > 1 {
            newSize = CGSize(
                width: size.width / ratio,
                height: size.height / ratio
            )
        } else {
            newSize = size
        }

        UIGraphicsBeginImageContextWithOptions(newSize, false, 1.0)
        draw(in: CGRect(origin: .zero, size: newSize))
        let resized = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()

        return resized?.jpegData(compressionQuality: quality)
    }
}

// MARK: - Bundle Extensions

extension Bundle {
    /// Version de l'app (ex: "1.0.0")
    var appVersion: String {
        infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    }

    /// Numéro de build (ex: "1")
    var buildNumber: String {
        infoDictionary?["CFBundleVersion"] as? String ?? "1"
    }
}
