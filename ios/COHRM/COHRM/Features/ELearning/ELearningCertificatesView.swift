// ELearningCertificatesView.swift
// One Health Cameroon - Mes certificats

import SwiftUI

/// Liste des certificats obtenus par l'apprenant
struct ELearningCertificatesView: View {

    @State private var certificates: [ELCertificate] = []
    @State private var isLoading = true

    var body: some View {
        Group {
            if isLoading {
                ProgressView().controlSize(.large).frame(maxWidth: .infinity, minHeight: 300)
            } else if certificates.isEmpty {
                ContentUnavailableView(
                    String(localized: "elearning.no_certificates"),
                    systemImage: "rosette",
                    description: Text(String(localized: "elearning.no_certificates.desc"))
                )
            } else {
                ScrollView {
                    LazyVStack(spacing: 14) {
                        ForEach(certificates) { cert in
                            certificateCard(cert)
                        }
                    }
                    .padding(16)
                }
            }
        }
        .background(AppColors.background)
        .navigationTitle(String(localized: "elearning.my_certificates"))
        .task { await loadCertificates() }
    }

    private func certificateCard(_ cert: ELCertificate) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                Image(systemName: "rosette")
                    .font(.title2)
                    .foregroundStyle(cert.status == "active" ? Color(hex: 0xFFD700) : AppColors.muted)

                VStack(alignment: .leading, spacing: 4) {
                    let lang = UserDefaults.standard.string(forKey: "appLanguage") ?? "fr"
                    Text((lang == "en" ? cert.courseTitleEn : nil) ?? cert.courseTitleFr ?? cert.titleFr ?? "")
                        .font(.subheadline).fontWeight(.semibold)
                        .foregroundStyle(AppColors.textPrimary)
                        .lineLimit(2)

                    if let number = cert.certificateNumber {
                        Text(number)
                            .font(.caption).monospaced()
                            .foregroundStyle(AppColors.textSecondary)
                    }
                }

                Spacer()

                statusBadge(cert.status)
            }

            Divider()

            HStack {
                if let date = cert.issueDate {
                    Label(String(date.prefix(10)), systemImage: "calendar")
                        .font(.caption2).foregroundStyle(AppColors.textSecondary)
                }

                Spacer()

                if let score = cert.finalScore {
                    Label("\(Int(score))%", systemImage: "star.fill")
                        .font(.caption2).foregroundStyle(Color(hex: 0xFFD700))
                }

                if let code = cert.verificationCode {
                    Label(code.prefix(8) + "...", systemImage: "qrcode")
                        .font(.caption2).foregroundStyle(Color(hex: 0x9B59B6))
                }
            }
        }
        .padding(16)
        .background(AppColors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(cert.status == "active" ? Color(hex: 0xFFD700).opacity(0.3) : Color.clear, lineWidth: 1)
        )
    }

    private func statusBadge(_ status: String?) -> some View {
        let (label, color): (String, Color) = switch status {
        case "active": (String(localized: "elearning.cert.active"), AppColors.success)
        case "expired": (String(localized: "elearning.cert.expired"), AppColors.warning)
        case "revoked": (String(localized: "elearning.cert.revoked"), AppColors.danger)
        default: (status ?? "", AppColors.muted)
        }
        return Text(label)
            .font(.caption2).fontWeight(.medium)
            .padding(.horizontal, 8).padding(.vertical, 3)
            .background(color.opacity(0.15))
            .foregroundStyle(color)
            .clipShape(Capsule())
    }

    private func loadCertificates() async {
        isLoading = true
        do {
            let response = try await ELearningService.shared.getMyCertificates()
            certificates = response.data ?? []
        } catch {}
        isLoading = false
    }
}
