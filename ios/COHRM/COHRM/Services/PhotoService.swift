// PhotoService.swift
// COHRM Cameroun - Service de gestion des photos

import Foundation
import UIKit

/// Gère la compression, le stockage local et l'upload des photos
actor PhotoService {

    static let shared = PhotoService()
    private init() {}

    /// Répertoire de stockage des photos
    private var photosDirectory: URL {
        let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        let photosURL = documentsURL.appendingPathComponent("cohrm_photos", isDirectory: true)

        if !FileManager.default.fileExists(atPath: photosURL.path) {
            try? FileManager.default.createDirectory(at: photosURL, withIntermediateDirectories: true)
        }

        return photosURL
    }

    // MARK: - Compression et sauvegarde

    /// Compresse et sauvegarde une image localement
    /// - Parameter image: Image originale
    /// - Returns: Nom du fichier sauvegardé et taille en octets
    func savePhoto(_ image: UIImage) throws -> (fileName: String, fileSize: Int) {
        guard let data = image.compressed(maxDimension: 1024, quality: 0.8) else {
            throw PhotoError.compressionFailed
        }

        let fileName = "photo_\(UUID().uuidString).jpg"
        let fileURL = photosDirectory.appendingPathComponent(fileName)

        try data.write(to: fileURL)

        return (fileName: "cohrm_photos/\(fileName)", fileSize: data.count)
    }

    /// Charge une photo depuis le stockage local
    func loadPhoto(path: String) -> UIImage? {
        let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        let fileURL = documentsURL.appendingPathComponent(path)
        guard let data = try? Data(contentsOf: fileURL) else { return nil }
        return UIImage(data: data)
    }

    /// Supprime une photo du stockage local
    func deletePhoto(path: String) throws {
        let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        let fileURL = documentsURL.appendingPathComponent(path)
        try FileManager.default.removeItem(at: fileURL)
    }

    // MARK: - Nettoyage

    /// Calcule la taille totale du cache photos
    func cacheSize() -> Int64 {
        let enumerator = FileManager.default.enumerator(at: photosDirectory, includingPropertiesForKeys: [.fileSizeKey])
        var total: Int64 = 0

        while let url = enumerator?.nextObject() as? URL {
            let values = try? url.resourceValues(forKeys: [.fileSizeKey])
            total += Int64(values?.fileSize ?? 0)
        }

        return total
    }

    /// Formate la taille du cache pour l'affichage
    func formattedCacheSize() -> String {
        let size = cacheSize()
        let formatter = ByteCountFormatter()
        formatter.countStyle = .file
        return formatter.string(fromByteCount: size)
    }

    /// Supprime toutes les photos en cache
    func clearCache() throws {
        let contents = try FileManager.default.contentsOfDirectory(at: photosDirectory, includingPropertiesForKeys: nil)
        for url in contents {
            try FileManager.default.removeItem(at: url)
        }
    }
}

// MARK: - Erreurs

enum PhotoError: LocalizedError {
    case compressionFailed
    case saveFailed
    case notFound

    var errorDescription: String? {
        switch self {
        case .compressionFailed: "Impossible de compresser la photo"
        case .saveFailed: "Impossible de sauvegarder la photo"
        case .notFound: "Photo introuvable"
        }
    }
}
