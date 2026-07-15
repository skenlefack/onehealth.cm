// NetworkMonitor.swift
// COHRM Cameroun - Surveillance de la connectivité réseau

import Foundation
import Network
import Combine

/// Surveille l'état de la connexion réseau en temps réel
/// Utilise NWPathMonitor (framework Network)
@MainActor
final class NetworkMonitor: ObservableObject {

    // MARK: - Singleton

    static let shared = NetworkMonitor()

    // MARK: - État publié

    /// Indique si l'appareil est connecté à Internet
    @Published private(set) var isConnected = true

    /// Type de connexion actuel
    @Published private(set) var connectionType: ConnectionType = .unknown

    /// Indique si la connexion est "coûteuse" (données mobiles)
    @Published private(set) var isExpensive = false

    // MARK: - Privé

    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "cm.onehealth.cohrm.networkmonitor")

    // MARK: - Types

    enum ConnectionType {
        case wifi
        case cellular
        case ethernet
        case unknown
    }

    // MARK: - Initialisation

    private init() {
        startMonitoring()
    }

    deinit {
        monitor.cancel()
    }

    // MARK: - Monitoring

    private func startMonitoring() {
        monitor.pathUpdateHandler = { [weak self] path in
            Task { @MainActor [weak self] in
                guard let self else { return }

                self.isConnected = path.status == .satisfied
                self.isExpensive = path.isExpensive

                if path.usesInterfaceType(.wifi) {
                    self.connectionType = .wifi
                } else if path.usesInterfaceType(.cellular) {
                    self.connectionType = .cellular
                } else if path.usesInterfaceType(.wiredEthernet) {
                    self.connectionType = .ethernet
                } else {
                    self.connectionType = .unknown
                }

                // Notifier le service de sync quand le réseau revient
                if path.status == .satisfied {
                    NotificationCenter.default.post(
                        name: .networkDidBecomeAvailable,
                        object: nil
                    )
                }
            }
        }

        monitor.start(queue: queue)
    }
}

// MARK: - Notifications

extension Notification.Name {
    /// Envoyée quand le réseau redevient disponible
    static let networkDidBecomeAvailable = Notification.Name("networkDidBecomeAvailable")
}
