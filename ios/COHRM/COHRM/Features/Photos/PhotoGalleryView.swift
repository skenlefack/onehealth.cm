// PhotoGalleryView.swift
// COHRM Cameroun - Galerie photo pour les rumeurs

import SwiftUI

/// Galerie de photos en grille pour une rumeur
struct PhotoGalleryView: View {

    let rumorId: Int

    @State private var photos: [RumorPhoto] = []
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var selectedPhotoIndex: Int?

    /// Grille a 3 colonnes
    private let columns = [
        GridItem(.flexible(), spacing: AppDimensions.spacingS),
        GridItem(.flexible(), spacing: AppDimensions.spacingS),
        GridItem(.flexible(), spacing: AppDimensions.spacingS)
    ]

    var body: some View {
        Group {
            if isLoading && photos.isEmpty {
                ProgressView()
                    .frame(maxWidth: .infinity, minHeight: 120)
            } else if let error = errorMessage, photos.isEmpty {
                errorPlaceholder(message: error)
            } else if photos.isEmpty {
                emptyPlaceholder
            } else {
                photosGrid
            }
        }
        .task {
            await loadPhotos()
        }
        .fullScreenCover(item: $selectedPhotoIndex) { index in
            PhotoFullScreenView(
                photos: photos,
                initialIndex: index
            )
        }
    }

    // MARK: - Grille

    private var photosGrid: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            SectionHeader(
                title: String(localized: "rumors.detail.photos") + " (\(photos.count))",
                icon: "photo.on.rectangle"
            )

            LazyVGrid(columns: columns, spacing: AppDimensions.spacingS) {
                ForEach(Array(photos.enumerated()), id: \.element.id) { index, photo in
                    PhotoGridItem(photo: photo) {
                        selectedPhotoIndex = index
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }

    // MARK: - Etats vides/erreur

    private var emptyPlaceholder: some View {
        VStack(spacing: AppDimensions.spacingM) {
            SectionHeader(
                title: String(localized: "rumors.detail.photos"),
                icon: "photo.on.rectangle"
            )

            VStack(spacing: AppDimensions.spacingS) {
                Image(systemName: "photo.stack")
                    .font(.system(size: 32, weight: .light))
                    .foregroundStyle(AppColors.muted)

                Text(String(localized: "photos.empty"))
                    .font(AppFonts.callout)
                    .foregroundStyle(AppColors.textTertiary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, AppDimensions.spacingM)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }

    private func errorPlaceholder(message: String) -> some View {
        VStack(spacing: AppDimensions.spacingS) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 24, weight: .light))
                .foregroundStyle(AppColors.danger)

            Text(message)
                .font(AppFonts.caption)
                .foregroundStyle(AppColors.textSecondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(AppDimensions.cardPadding)
        .cardStyle()
    }

    // MARK: - Chargement

    private func loadPhotos() async {
        isLoading = true
        errorMessage = nil
        do {
            let response = try await APIService.shared.getRumorPhotos(rumorId: rumorId)
            if response.success {
                photos = response.data ?? []
            } else {
                // Pas de photos n'est pas une erreur
                photos = []
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}

// MARK: - Element de grille

/// Miniature photo cliquable dans la grille
private struct PhotoGridItem: View {

    let photo: RumorPhoto
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            AsyncImage(url: photo.resolvedURL) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(minWidth: 0, maxWidth: .infinity)
                        .aspectRatio(1, contentMode: .fit)
                        .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous))

                case .failure:
                    placeholder(icon: "photo.badge.exclamationmark")

                case .empty:
                    placeholder(icon: "photo")
                        .overlay { ProgressView() }

                @unknown default:
                    placeholder(icon: "photo")
                }
            }
        }
        .buttonStyle(.plain)
    }

    private func placeholder(icon: String) -> some View {
        ZStack {
            RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous)
                .fill(AppColors.secondaryBackground)
                .aspectRatio(1, contentMode: .fit)

            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundStyle(AppColors.muted)
        }
    }
}

// MARK: - Plein ecran

/// Vue plein ecran pour visualiser les photos avec navigation par swipe
struct PhotoFullScreenView: View {

    let photos: [RumorPhoto]
    let initialIndex: Int

    @Environment(\.dismiss) private var dismiss
    @State private var currentIndex: Int = 0
    @State private var showCaption = true

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            TabView(selection: $currentIndex) {
                ForEach(Array(photos.enumerated()), id: \.element.id) { index, photo in
                    PhotoPageView(photo: photo)
                        .tag(index)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .automatic))

            // Overlay controles
            VStack {
                // Barre superieure
                HStack {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 28))
                            .foregroundStyle(.white.opacity(0.8))
                            .symbolRenderingMode(.hierarchical)
                    }

                    Spacer()

                    Text("\(currentIndex + 1)/\(photos.count)")
                        .font(AppFonts.subheadline)
                        .foregroundStyle(.white.opacity(0.8))

                    Spacer()

                    // Bouton de partage
                    ShareLink(item: photos[currentIndex].resolvedURL ?? URL(string: "https://onehealth.cm")!) {
                        Image(systemName: "square.and.arrow.up.circle.fill")
                            .font(.system(size: 28))
                            .foregroundStyle(.white.opacity(0.8))
                            .symbolRenderingMode(.hierarchical)
                    }
                }
                .padding(.horizontal, AppDimensions.spacing)
                .padding(.top, AppDimensions.spacingS)

                Spacer()

                // Caption en bas
                if showCaption, let caption = photos[safe: currentIndex]?.caption, !caption.isEmpty {
                    Text(caption)
                        .font(AppFonts.callout)
                        .foregroundStyle(.white)
                        .padding(AppDimensions.cardPadding)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(.black.opacity(0.5))
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                }
            }
        }
        .onAppear {
            currentIndex = initialIndex
        }
        .onTapGesture {
            withAnimation(.easeInOut(duration: 0.2)) {
                showCaption.toggle()
            }
        }
        .statusBarHidden()
    }
}

/// Page individuelle pour une photo
private struct PhotoPageView: View {

    let photo: RumorPhoto

    @State private var scale: CGFloat = 1.0

    var body: some View {
        AsyncImage(url: photo.resolvedURL) { phase in
            switch phase {
            case .success(let image):
                image
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .scaleEffect(scale)
                    .gesture(
                        MagnifyGesture()
                            .onChanged { value in
                                scale = value.magnification
                            }
                            .onEnded { _ in
                                withAnimation(.spring(response: 0.3)) {
                                    scale = max(1.0, min(scale, 3.0))
                                }
                            }
                    )

            case .failure:
                VStack(spacing: AppDimensions.spacingM) {
                    Image(systemName: "photo.badge.exclamationmark")
                        .font(.system(size: 48, weight: .light))
                        .foregroundStyle(.white.opacity(0.5))

                    Text(String(localized: "photos.load_error"))
                        .font(AppFonts.callout)
                        .foregroundStyle(.white.opacity(0.5))
                }

            case .empty:
                ProgressView()
                    .tint(.white)
                    .scaleEffect(1.5)

            @unknown default:
                EmptyView()
            }
        }
    }
}

// MARK: - Int Identifiable conformance pour fullScreenCover

extension Int: @retroactive Identifiable {
    public var id: Int { self }
}

// MARK: - Array safe subscript

extension Array {
    subscript(safe index: Index) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}

#Preview {
    PhotoGalleryView(rumorId: 1)
}
