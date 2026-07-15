// LocationManager.swift
// COHRM Cameroun - Gestionnaire de localisation

import Foundation
import CoreLocation
import MapKit

/// Gère l'accès à la localisation GPS et le geocoding inverse
@MainActor
final class LocationManager: NSObject, ObservableObject {

    // MARK: - État publié

    /// Coordonnées actuelles
    @Published var location: CLLocationCoordinate2D?

    /// Adresse déterminée par geocoding inverse
    @Published var placemark: CLPlacemark?

    /// Statut d'autorisation
    @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined

    /// Erreur éventuelle
    @Published var error: String?

    /// Indique si la localisation est en cours
    @Published var isLocating = false

    // MARK: - Privé

    private let manager = CLLocationManager()
    private let geocoder = CLGeocoder()

    // MARK: - Initialisation

    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyBest
        authorizationStatus = manager.authorizationStatus
    }

    // MARK: - API publique

    /// Demande l'autorisation de localisation
    func requestPermission() {
        manager.requestWhenInUseAuthorization()
    }

    /// Récupère la position actuelle
    func getCurrentLocation() {
        error = nil
        isLocating = true

        switch authorizationStatus {
        case .notDetermined:
            requestPermission()
        case .authorizedWhenInUse, .authorizedAlways:
            manager.requestLocation()
        case .denied, .restricted:
            error = String(localized: "location.permission_denied")
            isLocating = false
        @unknown default:
            break
        }
    }

    /// Effectue le geocoding inverse pour une coordonnée
    func reverseGeocode(_ coordinate: CLLocationCoordinate2D) async {
        let clLocation = CLLocation(latitude: coordinate.latitude, longitude: coordinate.longitude)
        do {
            let placemarks = try await geocoder.reverseGeocodeLocation(clLocation)
            self.placemark = placemarks.first
        } catch {
            print("Erreur geocoding : \(error.localizedDescription)")
        }
    }

    /// Extrait la région depuis le placemark
    var regionName: String {
        placemark?.administrativeArea ?? ""
    }

    /// Extrait le département/sous-localité
    var departmentName: String {
        placemark?.subAdministrativeArea ?? ""
    }

    /// Extrait la localité
    var localityName: String {
        placemark?.locality ?? placemark?.name ?? ""
    }

    /// Adresse formatée complète
    var formattedAddress: String {
        guard let placemark else { return "" }
        let parts = [
            placemark.name,
            placemark.locality,
            placemark.subAdministrativeArea,
            placemark.administrativeArea,
        ].compactMap { $0 }
        return parts.joined(separator: ", ")
    }

    // MARK: - Coordonnées par défaut (Yaoundé)

    static let defaultCoordinate = CLLocationCoordinate2D(
        latitude: 3.8480,
        longitude: 11.5021
    )

    static let cameroonRegion = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 5.9631, longitude: 10.1591),
        span: MKCoordinateSpan(latitudeDelta: 10, longitudeDelta: 10)
    )
}

// MARK: - CLLocationManagerDelegate

extension LocationManager: CLLocationManagerDelegate {

    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        Task { @MainActor in
            guard let clLocation = locations.last else { return }
            let coordinate = clLocation.coordinate
            self.location = coordinate
            self.isLocating = false

            // Geocoding inverse automatique
            await self.reverseGeocode(coordinate)
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        Task { @MainActor in
            self.error = error.localizedDescription
            self.isLocating = false
        }
    }

    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        Task { @MainActor in
            self.authorizationStatus = manager.authorizationStatus
            // Relancer la localisation si autorisé
            if manager.authorizationStatus == .authorizedWhenInUse ||
               manager.authorizationStatus == .authorizedAlways {
                if self.isLocating {
                    manager.requestLocation()
                }
            }
        }
    }
}
