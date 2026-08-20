// ELearningContentViews.swift
// One Health Cameroon - Vues de contenu pour les lecons E-Learning

import SwiftUI
import WebKit
import PDFKit
import AVKit

// MARK: - Video Content View

/// Renders video content: YouTube/Vimeo via WKWebView embed, uploaded via AVPlayer
struct VideoContentView: View {

    let lesson: ELLesson

    var body: some View {
        Group {
            if let provider = lesson.videoProvider, isEmbedProvider(provider) {
                if let embedURL = embedURL(for: lesson.videoUrl, provider: provider) {
                    WebViewRepresentable(url: embedURL)
                } else {
                    ContentUnavailableView(
                        String(localized: "elearning.video_unavailable"),
                        systemImage: "play.slash"
                    )
                }
            } else if let videoUrl = lesson.videoUrl, let url = serverImageURL(videoUrl) {
                NativeVideoPlayer(url: url)
            } else {
                ContentUnavailableView(
                    String(localized: "elearning.video_unavailable"),
                    systemImage: "play.slash"
                )
            }
        }
    }

    private func isEmbedProvider(_ provider: String) -> Bool {
        ["youtube", "vimeo"].contains(provider.lowercased())
    }

    private func embedURL(for urlString: String?, provider: String) -> URL? {
        guard let urlString, !urlString.isEmpty else { return nil }

        switch provider.lowercased() {
        case "youtube":
            return youtubeEmbedURL(urlString)
        case "vimeo":
            return vimeoEmbedURL(urlString)
        default:
            return URL(string: urlString)
        }
    }

    private func youtubeEmbedURL(_ urlString: String) -> URL? {
        // Extract video ID from various YouTube URL formats
        var videoId: String?

        if urlString.contains("youtu.be/") {
            videoId = urlString.components(separatedBy: "youtu.be/").last?.components(separatedBy: "?").first
        } else if urlString.contains("v=") {
            videoId = urlString.components(separatedBy: "v=").last?.components(separatedBy: "&").first
        } else if urlString.contains("embed/") {
            videoId = urlString.components(separatedBy: "embed/").last?.components(separatedBy: "?").first
        }

        guard let id = videoId, !id.isEmpty else {
            return URL(string: "https://www.youtube.com/embed/\(urlString)")
        }
        return URL(string: "https://www.youtube.com/embed/\(id)?playsinline=1&rel=0")
    }

    private func vimeoEmbedURL(_ urlString: String) -> URL? {
        // Extract Vimeo video ID
        let components = urlString.components(separatedBy: "/")
        guard let videoId = components.last(where: { Int($0) != nil }) else {
            return URL(string: urlString)
        }
        return URL(string: "https://player.vimeo.com/video/\(videoId)?playsinline=1")
    }
}

// MARK: - Native Video Player

/// AVPlayerViewController wrapper for uploaded/direct video files
struct NativeVideoPlayer: UIViewControllerRepresentable {

    let url: URL

    func makeUIViewController(context: Context) -> AVPlayerViewController {
        let controller = AVPlayerViewController()
        let player = AVPlayer(url: url)
        controller.player = player
        controller.allowsPictureInPicturePlayback = true
        return controller
    }

    func updateUIViewController(_ uiViewController: AVPlayerViewController, context: Context) {}
}

// MARK: - PDF Content View

/// Renders a PDF document using PDFKit
struct PDFContentView: View {

    let urlString: String?
    @State private var pdfDocument: PDFDocument?
    @State private var isLoading = true
    @State private var hasError = false

    var body: some View {
        ZStack {
            if isLoading {
                VStack(spacing: 12) {
                    ProgressView()
                        .controlSize(.large)
                    Text(String(localized: "elearning.loading_pdf"))
                        .font(.caption)
                        .foregroundStyle(AppColors.textSecondary)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let doc = pdfDocument {
                PDFViewRepresentable(document: doc)
            } else {
                ContentUnavailableView(
                    String(localized: "elearning.pdf_unavailable"),
                    systemImage: "doc.fill",
                    description: Text(String(localized: "elearning.pdf_load_error"))
                )
            }
        }
        .task { await loadPDF() }
    }

    private func loadPDF() async {
        isLoading = true
        defer { isLoading = false }

        guard let url = serverImageURL(urlString) else {
            hasError = true
            return
        }

        // Load PDF data asynchronously
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let doc = PDFDocument(data: data) {
                pdfDocument = doc
            } else {
                hasError = true
            }
        } catch {
            hasError = true
        }
    }
}

/// UIViewRepresentable wrapper for PDFKit PDFView
struct PDFViewRepresentable: UIViewRepresentable {

    let document: PDFDocument

    func makeUIView(context: Context) -> PDFView {
        let pdfView = PDFView()
        pdfView.autoScales = true
        pdfView.displayMode = .singlePageContinuous
        pdfView.displayDirection = .vertical
        pdfView.document = document
        pdfView.backgroundColor = UIColor.systemBackground
        return pdfView
    }

    func updateUIView(_ uiView: PDFView, context: Context) {
        if uiView.document !== document {
            uiView.document = document
        }
    }
}

// MARK: - Document Web View

/// Renders Office documents (PPTX, DOCX, XLSX) using Microsoft Office Online viewer
struct DocumentWebView: View {

    let url: URL?
    @State private var isLoading = true
    @State private var hasError = false
    @State private var useFallback = false

    var body: some View {
        ZStack {
            if let viewerURL = currentViewerURL {
                WebViewRepresentable(
                    url: viewerURL,
                    onLoadingChange: { loading in isLoading = loading },
                    onError: { _ in
                        if !useFallback {
                            useFallback = true
                        } else {
                            hasError = true
                        }
                    }
                )
            } else {
                ContentUnavailableView(
                    String(localized: "elearning.document_unavailable"),
                    systemImage: "doc.questionmark",
                    description: Text(String(localized: "elearning.document_load_error"))
                )
            }

            if isLoading && !hasError {
                VStack(spacing: 12) {
                    ProgressView()
                        .controlSize(.large)
                    Text(String(localized: "elearning.loading_document"))
                        .font(.caption)
                        .foregroundStyle(AppColors.textSecondary)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(AppColors.background.opacity(0.8))
            }
        }
    }

    private var currentViewerURL: URL? {
        guard let fileURL = url else { return nil }

        if useFallback {
            // Fallback to Google Docs viewer
            let src = fileURL.absoluteString
            guard let encoded = src.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) else { return nil }
            return URL(string: "https://docs.google.com/gview?url=\(encoded)&embedded=true")
        }

        return fileURL
    }
}

// MARK: - HTML Content View

/// Renders HTML content in a styled WKWebView with dark mode support
struct HTMLContentView: View {

    let html: String

    var body: some View {
        HTMLWebViewRepresentable(html: styledHTML)
    }

    private var styledHTML: String {
        """
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0">
            <style>
                :root {
                    color-scheme: light dark;
                }
                * {
                    box-sizing: border-box;
                    -webkit-text-size-adjust: 100%;
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 16px;
                    line-height: 1.6;
                    padding: 16px;
                    margin: 0;
                    color: #333;
                    background: transparent;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                @media (prefers-color-scheme: dark) {
                    body { color: #E0E0E0; }
                    a { color: #9B59B6; }
                    blockquote { border-color: #9B59B6; background: rgba(155, 89, 182, 0.1); }
                    code { background: rgba(255,255,255,0.1); }
                    pre { background: rgba(255,255,255,0.05); }
                    table, th, td { border-color: #444; }
                    th { background: rgba(255,255,255,0.05); }
                }
                h1, h2, h3, h4, h5, h6 {
                    margin-top: 1.2em;
                    margin-bottom: 0.5em;
                    font-weight: 600;
                }
                h1 { font-size: 1.5em; }
                h2 { font-size: 1.3em; }
                h3 { font-size: 1.15em; }
                img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                }
                a { color: #9B59B6; text-decoration: none; }
                a:hover { text-decoration: underline; }
                blockquote {
                    margin: 1em 0;
                    padding: 12px 16px;
                    border-left: 4px solid #9B59B6;
                    background: rgba(155, 89, 182, 0.05);
                    border-radius: 0 8px 8px 0;
                }
                code {
                    font-family: 'SF Mono', Menlo, monospace;
                    font-size: 0.9em;
                    padding: 2px 6px;
                    background: rgba(0,0,0,0.06);
                    border-radius: 4px;
                }
                pre {
                    padding: 12px;
                    background: rgba(0,0,0,0.04);
                    border-radius: 8px;
                    overflow-x: auto;
                }
                pre code { background: none; padding: 0; }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1em 0;
                    font-size: 0.9em;
                }
                th, td {
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    text-align: left;
                }
                th {
                    background: rgba(0,0,0,0.04);
                    font-weight: 600;
                }
                ul, ol { padding-left: 1.5em; }
                li { margin-bottom: 0.4em; }
                hr {
                    border: none;
                    border-top: 1px solid rgba(128,128,128,0.3);
                    margin: 1.5em 0;
                }
                video, iframe {
                    max-width: 100%;
                    border-radius: 8px;
                }
            </style>
        </head>
        <body>
            \(html)
        </body>
        </html>
        """
    }
}

/// UIViewRepresentable for HTML string content
struct HTMLWebViewRepresentable: UIViewRepresentable {

    let html: String

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.backgroundColor = .clear
        webView.loadHTMLString(html, baseURL: nil)
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}

// MARK: - Generic Web View

/// UIViewRepresentable for loading URLs in WKWebView
struct WebViewRepresentable: UIViewRepresentable {

    let url: URL
    var onLoadingChange: ((Bool) -> Void)?
    var onError: ((Error) -> Void)?

    func makeCoordinator() -> Coordinator {
        Coordinator(onLoadingChange: onLoadingChange, onError: onError)
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.backgroundColor = .clear
        webView.load(URLRequest(url: url))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    class Coordinator: NSObject, WKNavigationDelegate {
        let onLoadingChange: ((Bool) -> Void)?
        let onError: ((Error) -> Void)?

        init(onLoadingChange: ((Bool) -> Void)?, onError: ((Error) -> Void)?) {
            self.onLoadingChange = onLoadingChange
            self.onError = onError
        }

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            onLoadingChange?(true)
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            onLoadingChange?(false)
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            onLoadingChange?(false)
            onError?(error)
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            onLoadingChange?(false)
            onError?(error)
        }
    }
}

// MARK: - Interactive Content View

/// Renders interactive content blocks parsed from JSON
struct InteractiveContentView: View {

    let json: String
    @State private var blocks: [InteractiveBlock] = []
    @State private var parseError = false

    var body: some View {
        ScrollView {
            if parseError || blocks.isEmpty {
                ContentUnavailableView(
                    String(localized: "elearning.interactive_unavailable"),
                    systemImage: "hand.tap",
                    description: Text(String(localized: "elearning.interactive_parse_error"))
                )
            } else {
                LazyVStack(spacing: 16) {
                    ForEach(Array(blocks.enumerated()), id: \.offset) { _, block in
                        interactiveBlockView(block)
                    }
                }
                .padding(16)
            }
        }
        .onAppear { parseBlocks() }
    }

    private func parseBlocks() {
        guard let data = json.data(using: .utf8) else { parseError = true; return }
        do {
            blocks = try JSONDecoder().decode([InteractiveBlock].self, from: data)
        } catch {
            // Try wrapping in array if it's a single object
            do {
                let single = try JSONDecoder().decode(InteractiveBlock.self, from: data)
                blocks = [single]
            } catch {
                parseError = true
            }
        }
    }

    @ViewBuilder
    private func interactiveBlockView(_ block: InteractiveBlock) -> some View {
        switch block.type {
        case "flashcard":
            FlashcardBlockView(block: block)
        case "mcq":
            MCQBlockView(block: block)
        case "matching":
            MatchingBlockView(block: block)
        case "ordering":
            OrderingBlockView(block: block)
        case "fill_gaps", "fill-gaps":
            FillGapsBlockView(block: block)
        default:
            // Fallback: show title and description
            VStack(alignment: .leading, spacing: 8) {
                if let title = block.title {
                    Text(title)
                        .font(.headline)
                        .foregroundStyle(AppColors.textPrimary)
                }
                if let desc = block.description {
                    Text(desc)
                        .font(.subheadline)
                        .foregroundStyle(AppColors.textSecondary)
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(AppColors.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
    }
}

// MARK: - Interactive Block Model

struct InteractiveBlock: Codable {
    let type: String
    let title: String?
    let description: String?
    let question: String?
    let options: [InteractiveOption]?
    let correctAnswer: String?
    let correctIndex: Int?
    let front: String?
    let back: String?
    let pairs: [InteractivePair]?
    let items: [String]?
    let text: String?
    let gaps: [InteractiveGap]?

    enum CodingKeys: String, CodingKey {
        case type, title, description, question, options, front, back, pairs, items, text, gaps
        case correctAnswer = "correct_answer"
        case correctIndex = "correct_index"
    }
}

struct InteractiveOption: Codable, Identifiable {
    var id: String { text }
    let text: String
    let isCorrect: Bool?

    enum CodingKeys: String, CodingKey {
        case text
        case isCorrect = "is_correct"
    }
}

struct InteractivePair: Codable, Identifiable {
    var id: String { left + right }
    let left: String
    let right: String
}

struct InteractiveGap: Codable {
    let index: Int?
    let answer: String
    let options: [String]?
}

// MARK: - Flashcard Block

struct FlashcardBlockView: View {

    let block: InteractiveBlock
    @State private var isFlipped = false

    var body: some View {
        Button {
            withAnimation(.easeInOut(duration: 0.4)) {
                isFlipped.toggle()
            }
        } label: {
            VStack(spacing: 12) {
                Image(systemName: "rectangle.on.rectangle.angled")
                    .font(.title2)
                    .foregroundStyle(Color(hex: 0x9B59B6))

                Text(isFlipped ? (block.back ?? "") : (block.front ?? block.question ?? ""))
                    .font(.body)
                    .foregroundStyle(AppColors.textPrimary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 8)

                Text(isFlipped
                     ? String(localized: "elearning.tap_to_flip_front")
                     : String(localized: "elearning.tap_to_flip"))
                    .font(.caption2)
                    .foregroundStyle(AppColors.textTertiary)
            }
            .frame(maxWidth: .infinity)
            .frame(minHeight: 180)
            .padding(20)
            .background(AppColors.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .shadow(color: .black.opacity(0.05), radius: 4, y: 2)
            .rotation3DEffect(.degrees(isFlipped ? 180 : 0), axis: (x: 0, y: 1, z: 0))
        }
        .buttonStyle(.plain)
    }
}

// MARK: - MCQ Block

struct MCQBlockView: View {

    let block: InteractiveBlock
    @State private var selectedIndex: Int?
    @State private var showResult = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if let question = block.question ?? block.title {
                Text(question)
                    .font(.subheadline).fontWeight(.medium)
                    .foregroundStyle(AppColors.textPrimary)
            }

            if let options = block.options {
                ForEach(Array(options.enumerated()), id: \.offset) { index, option in
                    Button {
                        selectedIndex = index
                        showResult = true
                    } label: {
                        HStack(spacing: 10) {
                            Image(systemName: optionIcon(index: index, option: option))
                                .foregroundStyle(optionColor(index: index, option: option))

                            Text(option.text)
                                .font(.subheadline)
                                .foregroundStyle(AppColors.textPrimary)
                                .multilineTextAlignment(.leading)

                            Spacer()
                        }
                        .padding(12)
                        .background(optionBackground(index: index, option: option))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                    }
                    .buttonStyle(.plain)
                    .disabled(showResult)
                }
            }

            if showResult {
                Button {
                    selectedIndex = nil
                    showResult = false
                } label: {
                    Text(String(localized: "elearning.try_again"))
                        .font(.caption).fontWeight(.medium)
                        .foregroundStyle(Color(hex: 0x9B59B6))
                }
            }
        }
        .padding(16)
        .background(AppColors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private func optionIcon(index: Int, option: InteractiveOption) -> String {
        guard showResult else {
            return selectedIndex == index ? "circle.inset.filled" : "circle"
        }
        if option.isCorrect == true { return "checkmark.circle.fill" }
        if selectedIndex == index { return "xmark.circle.fill" }
        return "circle"
    }

    private func optionColor(index: Int, option: InteractiveOption) -> Color {
        guard showResult else { return Color(hex: 0x9B59B6) }
        if option.isCorrect == true { return AppColors.success }
        if selectedIndex == index { return AppColors.danger }
        return AppColors.muted
    }

    private func optionBackground(index: Int, option: InteractiveOption) -> Color {
        guard showResult else {
            return selectedIndex == index
                ? Color(hex: 0x9B59B6).opacity(0.1)
                : Color.clear
        }
        if option.isCorrect == true { return AppColors.success.opacity(0.1) }
        if selectedIndex == index { return AppColors.danger.opacity(0.1) }
        return Color.clear
    }
}

// MARK: - Matching Block

struct MatchingBlockView: View {

    let block: InteractiveBlock
    @State private var selectedLeft: String?
    @State private var matched: Set<String> = []

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if let title = block.title ?? block.question {
                Text(title)
                    .font(.subheadline).fontWeight(.medium)
                    .foregroundStyle(AppColors.textPrimary)
            }

            if let pairs = block.pairs {
                let shuffledRight = pairs.map(\.right).shuffled()

                HStack(alignment: .top, spacing: 12) {
                    // Left column
                    VStack(spacing: 8) {
                        ForEach(pairs) { pair in
                            Text(pair.left)
                                .font(.caption)
                                .padding(10)
                                .frame(maxWidth: .infinity)
                                .background(
                                    matched.contains(pair.left)
                                        ? AppColors.success.opacity(0.15)
                                        : selectedLeft == pair.left
                                            ? Color(hex: 0x9B59B6).opacity(0.15)
                                            : AppColors.secondaryBackground
                                )
                                .foregroundStyle(AppColors.textPrimary)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                                .onTapGesture {
                                    if !matched.contains(pair.left) {
                                        selectedLeft = pair.left
                                    }
                                }
                        }
                    }

                    // Right column
                    VStack(spacing: 8) {
                        ForEach(shuffledRight, id: \.self) { right in
                            Text(right)
                                .font(.caption)
                                .padding(10)
                                .frame(maxWidth: .infinity)
                                .background(
                                    matchedRight(right)
                                        ? AppColors.success.opacity(0.15)
                                        : AppColors.secondaryBackground
                                )
                                .foregroundStyle(AppColors.textPrimary)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                                .onTapGesture {
                                    checkMatch(right: right)
                                }
                        }
                    }
                }
            }

            if let pairs = block.pairs, matched.count == pairs.count {
                Label(String(localized: "elearning.all_matched"), systemImage: "checkmark.circle.fill")
                    .font(.caption).foregroundStyle(AppColors.success)
            }
        }
        .padding(16)
        .background(AppColors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private func matchedRight(_ right: String) -> Bool {
        guard let pairs = block.pairs else { return false }
        return pairs.first(where: { $0.right == right && matched.contains($0.left) }) != nil
    }

    private func checkMatch(right: String) {
        guard let left = selectedLeft, let pairs = block.pairs else { return }
        if let pair = pairs.first(where: { $0.left == left && $0.right == right }) {
            withAnimation { matched.insert(pair.left) }
        }
        selectedLeft = nil
    }
}

// MARK: - Ordering Block

struct OrderingBlockView: View {

    let block: InteractiveBlock
    @State private var items: [String] = []
    @State private var showResult = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if let title = block.title ?? block.question {
                Text(title)
                    .font(.subheadline).fontWeight(.medium)
                    .foregroundStyle(AppColors.textPrimary)
            }

            Text(String(localized: "elearning.drag_to_reorder"))
                .font(.caption2)
                .foregroundStyle(AppColors.textTertiary)

            ForEach(Array(items.enumerated()), id: \.element) { index, item in
                HStack(spacing: 10) {
                    Text("\(index + 1)")
                        .font(.caption).fontWeight(.bold)
                        .frame(width: 24, height: 24)
                        .background(Color(hex: 0x9B59B6).opacity(0.15))
                        .foregroundStyle(Color(hex: 0x9B59B6))
                        .clipShape(Circle())

                    Text(item)
                        .font(.subheadline)
                        .foregroundStyle(AppColors.textPrimary)

                    Spacer()

                    // Move up/down buttons
                    if index > 0 {
                        Button {
                            withAnimation { items.swapAt(index, index - 1) }
                        } label: {
                            Image(systemName: "chevron.up")
                                .font(.caption)
                                .foregroundStyle(Color(hex: 0x9B59B6))
                        }
                    }
                    if index < items.count - 1 {
                        Button {
                            withAnimation { items.swapAt(index, index + 1) }
                        } label: {
                            Image(systemName: "chevron.down")
                                .font(.caption)
                                .foregroundStyle(Color(hex: 0x9B59B6))
                        }
                    }
                }
                .padding(10)
                .background(AppColors.secondaryBackground)
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }

            Button {
                showResult = true
            } label: {
                Text(String(localized: "elearning.check_order"))
                    .font(.subheadline).fontWeight(.medium)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(Color(hex: 0x9B59B6))
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }

            if showResult {
                let correct = items == block.items
                Label(
                    correct
                        ? String(localized: "elearning.correct_order")
                        : String(localized: "elearning.incorrect_order"),
                    systemImage: correct ? "checkmark.circle.fill" : "xmark.circle.fill"
                )
                .font(.caption)
                .foregroundStyle(correct ? AppColors.success : AppColors.danger)
            }
        }
        .padding(16)
        .background(AppColors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .onAppear {
            if items.isEmpty, let original = block.items {
                items = original.shuffled()
            }
        }
    }
}

// MARK: - Fill Gaps Block

struct FillGapsBlockView: View {

    let block: InteractiveBlock
    @State private var answers: [Int: String] = [:]
    @State private var showResult = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if let title = block.title ?? block.question {
                Text(title)
                    .font(.subheadline).fontWeight(.medium)
                    .foregroundStyle(AppColors.textPrimary)
            }

            if let text = block.text {
                Text(text)
                    .font(.subheadline)
                    .foregroundStyle(AppColors.textSecondary)
            }

            if let gaps = block.gaps {
                ForEach(Array(gaps.enumerated()), id: \.offset) { index, gap in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(String(localized: "elearning.gap") + " \(index + 1)")
                            .font(.caption2)
                            .foregroundStyle(AppColors.textTertiary)

                        if let options = gap.options, !options.isEmpty {
                            // Dropdown-style selection
                            Menu {
                                ForEach(options, id: \.self) { option in
                                    Button(option) {
                                        answers[gap.index ?? index] = option
                                    }
                                }
                            } label: {
                                HStack {
                                    Text(answers[gap.index ?? index] ?? String(localized: "elearning.select_answer"))
                                        .font(.subheadline)
                                        .foregroundStyle(
                                            answers[gap.index ?? index] != nil
                                                ? AppColors.textPrimary
                                                : AppColors.textTertiary
                                        )
                                    Spacer()
                                    Image(systemName: "chevron.up.chevron.down")
                                        .font(.caption)
                                        .foregroundStyle(AppColors.textTertiary)
                                }
                                .padding(10)
                                .background(AppColors.secondaryBackground)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                            }
                        } else {
                            // Text field
                            TextField(String(localized: "elearning.type_answer"), text: Binding(
                                get: { answers[gap.index ?? index] ?? "" },
                                set: { answers[gap.index ?? index] = $0 }
                            ))
                            .font(.subheadline)
                            .textFieldStyle(.roundedBorder)
                        }

                        if showResult {
                            let userAnswer = answers[gap.index ?? index]?.lowercased().trimmingCharacters(in: .whitespaces) ?? ""
                            let correct = userAnswer == gap.answer.lowercased().trimmingCharacters(in: .whitespaces)
                            Label(
                                correct ? String(localized: "elearning.correct") : gap.answer,
                                systemImage: correct ? "checkmark.circle.fill" : "xmark.circle.fill"
                            )
                            .font(.caption)
                            .foregroundStyle(correct ? AppColors.success : AppColors.danger)
                        }
                    }
                }
            }

            Button {
                showResult = true
            } label: {
                Text(String(localized: "elearning.check_answers"))
                    .font(.subheadline).fontWeight(.medium)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(Color(hex: 0x9B59B6))
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
        .padding(16)
        .background(AppColors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}
