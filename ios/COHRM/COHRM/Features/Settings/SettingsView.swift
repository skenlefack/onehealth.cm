// SettingsView.swift
// COHRM Cameroun - Vue des paramètres de l'application
//
// Formulaire Apple-style avec sections pour la langue, le serveur,
// les notifications, le stockage, les informations et les données.

import SwiftUI
import SwiftData

/// Vue des paramètres de l'application
struct SettingsView: View {

    // MARK: - Préférences persistées

    /// Langue de l'application (fr ou en)
    @AppStorage("appLanguage") private var appLanguage = "fr"

    /// URL du serveur API
    @AppStorage("serverURL") private var serverURL = "https://onehealth.cm/api"

    /// Activation des notifications push
    @AppStorage("pushNotificationsEnabled") private var pushNotificationsEnabled = true

    // MARK: - Contexte SwiftData

    @Environment(\.modelContext) private var modelContext

    // MARK: - État local

    /// Taille du cache photos affichée
    @State private var cacheSizeText = "..."

    /// Indique si le vidage du cache est en cours
    @State private var isClearingCache = false

    /// Affiche la confirmation de vidage du cache
    @State private var showClearCacheConfirmation = false

    /// Affiche la confirmation de réinitialisation des données
    @State private var showResetDataConfirmation = false

    /// Affiche la confirmation d'export des données
    @State private var showExportSheet = false

    /// Message d'alerte générique
    @State private var alertMessage = ""

    /// Affiche l'alerte
    @State private var showAlert = false

    /// URL du fichier exporté (pour le partage)
    @State private var exportedFileURL: URL?

    // MARK: - Langues supportées

    /// Langues disponibles dans l'application
    private enum AppLanguage: String, CaseIterable, Identifiable {
        case fr
        case en

        var id: String { rawValue }

        var label: String {
            switch self {
            case .fr: "Francais"
            case .en: "English"
            }
        }

        var flag: String {
            switch self {
            case .fr: "🇫🇷"
            case .en: "🇬🇧"
            }
        }
    }

    // MARK: - Corps

    var body: some View {
        Form {
            // Section 1 : Langue
            languageSection

            // Section 2 : Serveur
            serverSection

            // Section 3 : Notifications
            notificationsSection

            // Section 4 : Stockage
            storageSection

            // Section 5 : A propos
            aboutSection

            // Section 6 : Donnees
            dataSection
        }
        .navigationTitle(String(localized: "settings.title"))
        .navigationBarTitleDisplayMode(.large)
        .onAppear {
            loadCacheSize()
        }
        .alert(alertMessage, isPresented: $showAlert) {
            Button(String(localized: "settings.alert.ok")) {}
        }
        .confirmationDialog(
            String(localized: "settings.cache.confirm.title"),
            isPresented: $showClearCacheConfirmation,
            titleVisibility: .visible
        ) {
            Button(String(localized: "settings.cache.confirm.clear"), role: .destructive) {
                clearCache()
            }
            Button(String(localized: "settings.cache.confirm.cancel"), role: .cancel) {}
        } message: {
            Text(String(localized: "settings.cache.confirm.message"))
        }
        .confirmationDialog(
            String(localized: "settings.data.reset.confirm.title"),
            isPresented: $showResetDataConfirmation,
            titleVisibility: .visible
        ) {
            Button(String(localized: "settings.data.reset.confirm.action"), role: .destructive) {
                resetLocalData()
            }
            Button(String(localized: "settings.data.reset.confirm.cancel"), role: .cancel) {}
        } message: {
            Text(String(localized: "settings.data.reset.confirm.message"))
        }
        .sheet(isPresented: $showExportSheet) {
            if let url = exportedFileURL {
                ShareSheet(items: [url])
            }
        }
    }

    // MARK: - Section Langue

    private var languageSection: some View {
        Section {
            Picker(
                String(localized: "settings.language.picker"),
                selection: $appLanguage
            ) {
                ForEach(AppLanguage.allCases) { language in
                    Text("\(language.flag) \(language.label)")
                        .tag(language.rawValue)
                }
            }
            .pickerStyle(.menu)
        } header: {
            Label(
                String(localized: "settings.language.header"),
                systemImage: "globe"
            )
        } footer: {
            Text(String(localized: "settings.language.footer"))
                .font(AppFonts.caption)
        }
    }

    // MARK: - Section Serveur

    private var serverSection: some View {
        Section {
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                Text(String(localized: "settings.server.url.label"))
                    .font(AppFonts.caption)
                    .foregroundStyle(AppColors.textSecondary)

                TextField(
                    String(localized: "settings.server.url.placeholder"),
                    text: $serverURL
                )
                .textFieldStyle(.roundedBorder)
                .keyboardType(.URL)
                .autocorrectionDisabled()
                .textInputAutocapitalization(.never)
            }

            // Indicateur de connexion
            HStack(spacing: AppDimensions.spacingS) {
                Circle()
                    .fill(
                        NetworkMonitor.shared.isConnected
                            ? AppColors.success
                            : AppColors.danger
                    )
                    .frame(width: 8, height: 8)

                Text(
                    NetworkMonitor.shared.isConnected
                        ? String(localized: "settings.server.status.connected")
                        : String(localized: "settings.server.status.disconnected")
                )
                .font(AppFonts.footnote)
                .foregroundStyle(AppColors.textSecondary)

                Spacer()

                // Type de connexion
                if NetworkMonitor.shared.isConnected {
                    Text(connectionTypeLabel)
                        .font(AppFonts.caption)
                        .foregroundStyle(AppColors.textTertiary)
                }
            }
        } header: {
            Label(
                String(localized: "settings.server.header"),
                systemImage: "server.rack"
            )
        }
    }

    // MARK: - Section Notifications

    private var notificationsSection: some View {
        Section {
            Toggle(isOn: $pushNotificationsEnabled) {
                HStack(spacing: AppDimensions.spacingM) {
                    Image(systemName: "bell.badge.fill")
                        .foregroundStyle(AppColors.warning)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(String(localized: "settings.notifications.toggle"))
                            .font(AppFonts.body)
                        Text(String(localized: "settings.notifications.description"))
                            .font(AppFonts.caption)
                            .foregroundStyle(AppColors.textTertiary)
                    }
                }
            }
            .tint(AppColors.primary)
            .onChange(of: pushNotificationsEnabled) { _, enabled in
                handleNotificationToggle(enabled: enabled)
            }
        } header: {
            Label(
                String(localized: "settings.notifications.header"),
                systemImage: "bell.fill"
            )
        }
    }

    // MARK: - Section Stockage

    private var storageSection: some View {
        Section {
            // Affichage de la taille du cache
            HStack {
                Label(
                    String(localized: "settings.storage.cache.label"),
                    systemImage: "photo.on.rectangle"
                )
                Spacer()
                Text(cacheSizeText)
                    .font(AppFonts.callout)
                    .foregroundStyle(AppColors.textSecondary)
            }

            // Bouton vider le cache
            Button(role: .destructive) {
                showClearCacheConfirmation = true
            } label: {
                HStack {
                    Label(
                        String(localized: "settings.storage.clear.button"),
                        systemImage: "trash"
                    )
                    Spacer()
                    if isClearingCache {
                        ProgressView()
                    }
                }
            }
            .disabled(isClearingCache)
        } header: {
            Label(
                String(localized: "settings.storage.header"),
                systemImage: "internaldrive.fill"
            )
        } footer: {
            Text(String(localized: "settings.storage.footer"))
                .font(AppFonts.caption)
        }
    }

    // MARK: - Section A propos

    private var aboutSection: some View {
        Section {
            // Version de l'application
            HStack {
                Text(String(localized: "settings.about.version"))
                Spacer()
                Text(Bundle.main.appVersion)
                    .foregroundStyle(AppColors.textSecondary)
            }

            // Numero de build
            HStack {
                Text(String(localized: "settings.about.build"))
                Spacer()
                Text(Bundle.main.buildNumber)
                    .foregroundStyle(AppColors.textSecondary)
            }

            // Description du projet
            VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
                Text("One Health Cameroon")
                    .font(AppFonts.headline)
                    .foregroundStyle(AppColors.textPrimary)
                Text(String(localized: "settings.about.description"))
                    .font(AppFonts.footnote)
                    .foregroundStyle(AppColors.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(.vertical, AppDimensions.spacingXS)

            // Identifiant de l'appareil
            HStack {
                Text(String(localized: "settings.about.device_id"))
                Spacer()
                Text(DeviceHelper.deviceId.prefix(8) + "...")
                    .font(.system(.caption, design: .monospaced))
                    .foregroundStyle(AppColors.textTertiary)
            }
        } header: {
            Label(
                String(localized: "settings.about.header"),
                systemImage: "info.circle.fill"
            )
        }
    }

    // MARK: - Section Donnees

    private var dataSection: some View {
        Section {
            // Bouton exporter les donnees
            Button {
                exportLocalData()
            } label: {
                Label(
                    String(localized: "settings.data.export.button"),
                    systemImage: "square.and.arrow.up"
                )
            }

            // Bouton reinitialiser les donnees
            Button(role: .destructive) {
                showResetDataConfirmation = true
            } label: {
                Label(
                    String(localized: "settings.data.reset.button"),
                    systemImage: "arrow.counterclockwise"
                )
            }
        } header: {
            Label(
                String(localized: "settings.data.header"),
                systemImage: "cylinder.split.1x2.fill"
            )
        } footer: {
            Text(String(localized: "settings.data.footer"))
                .font(AppFonts.caption)
        }
    }

    // MARK: - Actions

    /// Charge la taille du cache photos depuis PhotoService
    private func loadCacheSize() {
        Task {
            let size = await PhotoService.shared.formattedCacheSize()
            await MainActor.run {
                cacheSizeText = size
            }
        }
    }

    /// Vide le cache photos
    private func clearCache() {
        isClearingCache = true
        Task {
            do {
                try await PhotoService.shared.clearCache()
                await MainActor.run {
                    isClearingCache = false
                    loadCacheSize()
                    HapticHelper.notification(.success)
                    alertMessage = String(localized: "settings.cache.cleared")
                    showAlert = true
                }
            } catch {
                await MainActor.run {
                    isClearingCache = false
                    alertMessage = String(
                        localized: "settings.cache.error \(error.localizedDescription)"
                    )
                    showAlert = true
                    HapticHelper.notification(.error)
                }
            }
        }
    }

    /// Gere le toggle des notifications push
    private func handleNotificationToggle(enabled: Bool) {
        if enabled {
            // Demander l'autorisation de notifications
            UNUserNotificationCenter.current().requestAuthorization(
                options: [.alert, .badge, .sound]
            ) { granted, error in
                if !granted {
                    Task { @MainActor in
                        pushNotificationsEnabled = false
                        alertMessage = String(localized: "settings.notifications.denied")
                        showAlert = true
                    }
                }
            }
        }
    }

    /// Exporte les donnees locales en JSON et ouvre la feuille de partage
    private func exportLocalData() {
        do {
            let descriptor = FetchDescriptor<ReportModel>(
                sortBy: [SortDescriptor(\.createdAt, order: .reverse)]
            )
            let reports = try modelContext.fetch(descriptor)

            // Convertir en tableaux de dictionnaires pour l'export
            var exportData: [[String: Any]] = []
            for report in reports {
                let payload = report.toReportData().toAPIPayload()
                var entry = payload
                entry["local_id"] = report.id.uuidString
                entry["sync_status"] = report.syncStatusRaw
                entry["created_at"] = report.createdAt.iso8601String
                entry["updated_at"] = report.updatedAt.iso8601String
                exportData.append(entry)
            }

            // Serialiser en JSON
            let jsonData = try JSONSerialization.data(
                withJSONObject: exportData,
                options: [.prettyPrinted, .sortedKeys]
            )

            // Ecrire dans un fichier temporaire
            let tempDir = FileManager.default.temporaryDirectory
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "yyyyMMdd_HHmmss"
            let timestamp = dateFormatter.string(from: Date())
            let fileName = "cohrm_export_\(timestamp).json"
            let fileURL = tempDir.appendingPathComponent(fileName)

            try jsonData.write(to: fileURL)

            exportedFileURL = fileURL
            showExportSheet = true
            HapticHelper.notification(.success)

        } catch {
            alertMessage = String(
                localized: "settings.data.export.error \(error.localizedDescription)"
            )
            showAlert = true
            HapticHelper.notification(.error)
        }
    }

    /// Reinitialise toutes les donnees locales (SwiftData + cache photos)
    private func resetLocalData() {
        do {
            // Supprimer tous les signalements
            try modelContext.delete(model: ReportModel.self)
            try modelContext.delete(model: PhotoAttachment.self)
            try modelContext.delete(model: ReferenceData.self)
            try modelContext.save()

            // Vider le cache photos
            Task {
                try? await PhotoService.shared.clearCache()
                await MainActor.run {
                    loadCacheSize()
                }
            }

            HapticHelper.notification(.success)
            alertMessage = String(localized: "settings.data.reset.success")
            showAlert = true

        } catch {
            alertMessage = String(
                localized: "settings.data.reset.error \(error.localizedDescription)"
            )
            showAlert = true
            HapticHelper.notification(.error)
        }
    }

    // MARK: - Utilitaires

    /// Libelle du type de connexion reseau
    private var connectionTypeLabel: String {
        switch NetworkMonitor.shared.connectionType {
        case .wifi:     "Wi-Fi"
        case .cellular: String(localized: "settings.server.connection.cellular")
        case .ethernet: "Ethernet"
        case .unknown:  String(localized: "settings.server.connection.unknown")
        }
    }
}

// MARK: - ShareSheet (UIActivityViewController bridge)

/// Representable SwiftUI pour UIActivityViewController
/// Permet le partage de fichiers depuis SwiftUI.
struct ShareSheet: UIViewControllerRepresentable {

    /// Elements a partager
    let items: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }

    func updateUIViewController(
        _ uiViewController: UIActivityViewController,
        context: Context
    ) {
        // Pas de mise a jour necessaire
    }
}

// MARK: - Previsualisation

#Preview {
    NavigationStack {
        SettingsView()
            .modelContainer(for: ReportModel.self, inMemory: true)
    }
}
