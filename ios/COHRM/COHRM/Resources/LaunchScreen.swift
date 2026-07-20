import SwiftUI

/// Launch screen displayed while the app is loading.
/// This view is shown as a splash screen before the main content appears.
///
/// To use this as the actual launch screen in Xcode:
/// 1. Create a LaunchScreen.storyboard in Xcode (File > New > File > Launch Screen)
/// 2. Set the background color to the COHRM green (#16A34A)
/// 3. Add a centered image view with the app logo
/// 4. Add a label with "COHRM" below the logo
/// 5. Add a subtitle label with "Cameroon One Health Rumor Management"
/// 6. In the project target > General > App Icons and Launch Screen, set Launch Screen File to "LaunchScreen"
///
/// Alternatively, use the SwiftUI-based splash screen below as the initial view
/// in the app's entry point, with a brief delay before transitioning to the main content.

struct LaunchScreenView: View {
    @State private var isAnimating = false

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.086, green: 0.639, blue: 0.290), // #16A34A
                    Color(red: 0.059, green: 0.498, blue: 0.224), // #0F7F39
                ]),
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 24) {
                Spacer()

                // App icon placeholder
                ZStack {
                    Circle()
                        .fill(Color.white.opacity(0.2))
                        .frame(width: 120, height: 120)

                    Image(systemName: "heart.text.clipboard")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 60, height: 60)
                        .foregroundColor(.white)
                }
                .scaleEffect(isAnimating ? 1.0 : 0.8)
                .opacity(isAnimating ? 1.0 : 0.0)

                // App name
                VStack(spacing: 8) {
                    Text("COHRM")
                        .font(.system(size: 36, weight: .bold))
                        .foregroundColor(.white)

                    Text("Cameroon One Health\nRumor Management")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.white.opacity(0.9))
                        .multilineTextAlignment(.center)
                }
                .opacity(isAnimating ? 1.0 : 0.0)

                Spacer()

                // Organization
                VStack(spacing: 4) {
                    Text("Programme Zoonoses")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))

                    Text("One Health Cameroun")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                }
                .opacity(isAnimating ? 1.0 : 0.0)
                .padding(.bottom, 40)
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.8)) {
                isAnimating = true
            }
        }
    }
}

#Preview {
    LaunchScreenView()
}
