// PhotoPickerView.swift
// COHRM Cameroun - Sélection de photos avec PHPicker

import SwiftUI
import PhotosUI

/// Sélecteur de photos utilisant PHPickerViewController
struct PhotoPickerView: UIViewControllerRepresentable {

    /// Nombre maximum de photos sélectionnables
    let maxSelectionCount: Int

    /// Callback avec les images sélectionnées
    let onCompletion: ([UIImage]) -> Void

    init(maxSelectionCount: Int = 3, onCompletion: @escaping ([UIImage]) -> Void) {
        self.maxSelectionCount = maxSelectionCount
        self.onCompletion = onCompletion
    }

    func makeUIViewController(context: Context) -> PHPickerViewController {
        var config = PHPickerConfiguration()
        config.selectionLimit = maxSelectionCount
        config.filter = .images
        config.preferredAssetRepresentationMode = .current

        let picker = PHPickerViewController(configuration: config)
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: PHPickerViewController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(onCompletion: onCompletion)
    }

    // MARK: - Coordinator

    class Coordinator: NSObject, PHPickerViewControllerDelegate {
        let onCompletion: ([UIImage]) -> Void

        init(onCompletion: @escaping ([UIImage]) -> Void) {
            self.onCompletion = onCompletion
        }

        func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
            picker.dismiss(animated: true)

            guard !results.isEmpty else {
                onCompletion([])
                return
            }

            var images: [UIImage] = []
            let group = DispatchGroup()

            for result in results {
                group.enter()
                result.itemProvider.loadObject(ofClass: UIImage.self) { object, _ in
                    if let image = object as? UIImage {
                        images.append(image)
                    }
                    group.leave()
                }
            }

            group.notify(queue: .main) { [weak self] in
                self?.onCompletion(images)
            }
        }
    }
}

/// Miniature de photo avec bouton de suppression
struct PhotoThumbnail: View {
    let image: UIImage
    let onDelete: () -> Void

    var body: some View {
        ZStack(alignment: .topTrailing) {
            Image(uiImage: image)
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: AppDimensions.thumbnailSize, height: AppDimensions.thumbnailSize)
                .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS, style: .continuous))

            Button(action: onDelete) {
                Image(systemName: "xmark.circle.fill")
                    .font(.title3)
                    .foregroundStyle(.white)
                    .shadow(radius: 2)
            }
            .offset(x: 6, y: -6)
        }
    }
}
