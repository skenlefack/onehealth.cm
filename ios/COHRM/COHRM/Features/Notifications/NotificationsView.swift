// NotificationsView.swift
// COHRM Cameroun - Vue de la liste des notifications

import SwiftUI

/// Vue affichant les notifications de l'utilisateur
struct NotificationsView: View {

    @State private var viewModel = NotificationsViewModel()

    var body: some View {
        ZStack {
            AppColors.groupedBackground
                .ignoresSafeArea()

            if viewModel.isLoading && viewModel.notifications.isEmpty {
                loadingView
            } else if let error = viewModel.errorMessage, viewModel.notifications.isEmpty {
                errorView(message: error)
            } else if viewModel.notifications.isEmpty {
                emptyView
            } else {
                notificationsList
            }
        }
        .navigationTitle(String(localized: "notifications.title"))
        .navigationBarTitleDisplayMode(.large)
        .refreshable {
            await viewModel.refresh()
        }
        .task {
            if viewModel.notifications.isEmpty {
                await viewModel.loadNotifications()
            }
        }
    }

    // MARK: - Liste

    private var notificationsList: some View {
        ScrollView {
            LazyVStack(spacing: AppDimensions.spacingS) {
                ForEach(viewModel.notifications) { notification in
                    NotificationRowView(notification: notification)
                        .onAppear {
                            if notification.id == viewModel.notifications.last?.id {
                                Task { await viewModel.loadMore() }
                            }
                        }
                }

                if viewModel.isLoadingMore {
                    HStack {
                        Spacer()
                        ProgressView()
                            .padding(AppDimensions.spacing)
                        Spacer()
                    }
                }
            }
            .padding(.horizontal, AppDimensions.spacing)
            .padding(.bottom, AppDimensions.spacingXXL)
        }
    }

    // MARK: - Etats

    private var loadingView: some View {
        VStack(spacing: AppDimensions.spacingM) {
            Spacer()
            ProgressView()
                .scaleEffect(1.2)
            Text(String(localized: "notifications.loading"))
                .font(AppFonts.callout)
                .foregroundStyle(AppColors.textSecondary)
            Spacer()
        }
    }

    private func errorView(message: String) -> some View {
        VStack(spacing: AppDimensions.spacingM) {
            Spacer()

            Image(systemName: "wifi.exclamationmark")
                .font(.system(size: 48, weight: .light))
                .foregroundStyle(AppColors.danger)

            Text(String(localized: "notifications.error.title"))
                .font(AppFonts.headline)
                .foregroundStyle(AppColors.textPrimary)

            Text(message)
                .font(AppFonts.caption)
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, AppDimensions.spacingXL)

            PrimaryButton(
                String(localized: "notifications.error.retry"),
                icon: "arrow.clockwise"
            ) {
                Task { await viewModel.refresh() }
            }
            .padding(.horizontal, AppDimensions.spacingXL)

            Spacer()
        }
    }

    private var emptyView: some View {
        VStack(spacing: AppDimensions.spacingM) {
            Spacer()

            Image(systemName: "bell.slash")
                .font(.system(size: 48, weight: .light))
                .foregroundStyle(AppColors.muted)

            Text(String(localized: "notifications.empty.title"))
                .font(AppFonts.headline)
                .foregroundStyle(AppColors.textPrimary)

            Text(String(localized: "notifications.empty.message"))
                .font(AppFonts.callout)
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, AppDimensions.spacingXL)

            Spacer()
        }
    }
}

// MARK: - Ligne de notification

/// Vue affichant une notification individuelle
private struct NotificationRowView: View {
    let notification: NotificationDTO

    var body: some View {
        HStack(alignment: .top, spacing: AppDimensions.spacingM) {
            // Icone de type
            ZStack {
                Circle()
                    .fill(typeColor.opacity(0.12))
                    .frame(width: 44, height: 44)

                Image(systemName: typeIcon)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(typeColor)
            }

            // Contenu
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                // Type badge
                if let type = notification.notificationType {
                    StatusBadge(
                        typeLabel(for: type),
                        color: typeColor,
                        icon: typeIcon
                    )
                }

                // Sujet
                if let subject = notification.subject, !subject.isEmpty {
                    Text(subject)
                        .font(AppFonts.subheadline)
                        .foregroundStyle(AppColors.textPrimary)
                        .lineLimit(2)
                        .fixedSize(horizontal: false, vertical: true)
                }

                // Code rumeur
                if let code = notification.rumorCode, !code.isEmpty {
                    HStack(spacing: AppDimensions.spacingXS) {
                        Image(systemName: "megaphone.fill")
                            .font(.caption2)
                            .foregroundStyle(AppColors.primary)
                        Text(code)
                            .font(.system(size: 12, weight: .medium, design: .monospaced))
                            .foregroundStyle(AppColors.primary)

                        if let title = notification.rumorTitle, !title.isEmpty {
                            Text("- \(title)")
                                .font(AppFonts.caption)
                                .foregroundStyle(AppColors.textTertiary)
                                .lineLimit(1)
                        }
                    }
                }

                // Canal + Date + Statut
                HStack(spacing: AppDimensions.spacingM) {
                    if let channel = notification.channel, !channel.isEmpty {
                        Label(
                            channelLabel(for: channel),
                            systemImage: channelIcon(for: channel)
                        )
                        .font(AppFonts.caption2)
                        .foregroundStyle(AppColors.textTertiary)
                    }

                    if let status = notification.status {
                        StatusBadge(
                            deliveryLabel(for: status),
                            color: deliveryColor(for: status)
                        )
                    }

                    Spacer()

                    if let dateStr = notification.createdAt {
                        Text(RumorDateHelper.relativeString(from: dateStr))
                            .font(AppFonts.caption2)
                            .foregroundStyle(AppColors.textTertiary)
                    }
                }
            }
        }
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }

    // MARK: - Type helpers

    private var typeIcon: String {
        switch notification.notificationType?.lowercased() ?? "" {
        case "new_rumor": return "plus.circle.fill"
        case "status_change": return "arrow.triangle.2.circlepath.circle.fill"
        case "validation": return "checkmark.shield.fill"
        case "escalation": return "arrow.up.circle.fill"
        case "assignment": return "person.badge.plus"
        case "reminder": return "bell.fill"
        case "alert": return "exclamationmark.triangle.fill"
        default: return "bell.fill"
        }
    }

    private var typeColor: Color {
        switch notification.notificationType?.lowercased() ?? "" {
        case "new_rumor": return AppColors.info
        case "status_change": return AppColors.primary
        case "validation": return AppColors.success
        case "escalation": return AppColors.warning
        case "assignment": return AppColors.accent
        case "reminder": return AppColors.muted
        case "alert": return AppColors.danger
        default: return AppColors.muted
        }
    }

    private func typeLabel(for type: String) -> String {
        switch type.lowercased() {
        case "new_rumor": return String(localized: "notifications.type.new_rumor")
        case "status_change": return String(localized: "notifications.type.status_change")
        case "validation": return String(localized: "notifications.type.validation")
        case "escalation": return String(localized: "notifications.type.escalation")
        case "assignment": return String(localized: "notifications.type.assignment")
        case "reminder": return String(localized: "notifications.type.reminder")
        case "alert": return String(localized: "notifications.type.alert")
        default: return type.capitalized
        }
    }

    private func channelIcon(for channel: String) -> String {
        switch channel.lowercased() {
        case "email": return "envelope.fill"
        case "sms": return "message.fill"
        case "push": return "bell.badge.fill"
        case "in_app": return "app.badge.fill"
        default: return "paperplane.fill"
        }
    }

    private func channelLabel(for channel: String) -> String {
        switch channel.lowercased() {
        case "email": return String(localized: "notifications.channel.email")
        case "sms": return String(localized: "notifications.channel.sms")
        case "push": return String(localized: "notifications.channel.push")
        case "in_app": return String(localized: "notifications.channel.in_app")
        default: return channel.capitalized
        }
    }

    private func deliveryLabel(for status: String) -> String {
        switch status.lowercased() {
        case "sent", "delivered": return String(localized: "notifications.delivery.sent")
        case "pending": return String(localized: "notifications.delivery.pending")
        case "failed": return String(localized: "notifications.delivery.failed")
        case "read": return String(localized: "notifications.delivery.read")
        default: return status.capitalized
        }
    }

    private func deliveryColor(for status: String) -> Color {
        switch status.lowercased() {
        case "sent", "delivered": return AppColors.success
        case "pending": return AppColors.warning
        case "failed": return AppColors.danger
        case "read": return AppColors.info
        default: return AppColors.muted
        }
    }
}

#Preview {
    NavigationStack {
        NotificationsView()
    }
}
