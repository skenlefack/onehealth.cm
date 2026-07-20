# iOS Xcode Project Setup Guide

This guide explains how to create an Xcode project for the COHRM iOS app from the existing Swift source files.

## Prerequisites

- macOS 14.0 (Sonoma) or later
- Xcode 15.0 or later
- Apple Developer account (for device testing and App Store submission)
- CocoaPods or Swift Package Manager (no external dependencies required - all frameworks are Apple native)

## 1. Create a New Xcode Project

1. Open Xcode
2. File > New > Project
3. Select **iOS > App**
4. Configure the project:
   - **Product Name:** COHRM
   - **Team:** Select your Apple Developer team
   - **Organization Identifier:** cm.onehealth
   - **Bundle Identifier:** `cm.onehealth.cohrm`
   - **Interface:** SwiftUI
   - **Language:** Swift
   - **Storage:** SwiftData
   - **Include Tests:** Yes
5. Save the project in the `ios/COHRM/` directory

## 2. Import Existing Source Files

1. In Xcode, right-click the COHRM group in the navigator
2. Select "Add Files to COHRM..."
3. Navigate to `ios/COHRM/COHRM/` and add the following directories:
   - `App/` - Application entry point and main views
   - `Core/` - Core utilities, extensions, and shared components
   - `Features/` - Feature modules (Dashboard, Rumors, Reports, Scanner, etc.)
   - `Models/` - Data models and SwiftData schemas
   - `Services/` - API services, networking, and data management
   - `Theme/` - Color schemes, typography, and styling
   - `Utils/` - Helper utilities
   - `Localizable/` - Localization files (FR/EN)
   - `Resources/` - Assets catalog (icons, colors)
4. Ensure "Copy items if needed" is unchecked (files are already in place)
5. Ensure "Create groups" is selected

## 3. Project Configuration

### General Settings

| Setting | Value |
|---------|-------|
| Display Name | COHRM Cameroun |
| Bundle Identifier | cm.onehealth.cohrm |
| Version | 1.0.0 |
| Build | 1 |
| Minimum Deployments | iOS 17.0 |
| Device Orientation (iPhone) | Portrait, Portrait Upside Down |
| Device Orientation (iPad) | All |

### Signing & Capabilities

1. Select your team under Signing & Capabilities
2. Enable "Automatically manage signing"
3. Add the following capabilities:
   - **Push Notifications** - For receiving health alerts and rumor updates
   - **Background Modes** - Check "Background fetch" for offline sync
   - **Camera** - Already configured via Info.plist

### Required Frameworks

The following frameworks are used and should be available natively (no package manager needed):

| Framework | Purpose |
|-----------|---------|
| SwiftUI | User interface |
| SwiftData | Local data persistence |
| Charts | Dashboard charts and statistics |
| PhotosUI | Photo picker for report attachments |
| MapKit | Interactive maps for rumor locations |
| CoreLocation | GPS geolocation for reports |
| AVFoundation | Camera capture |
| UserNotifications | Push notification handling |
| BackgroundTasks | Background sync scheduling |

## 4. Info.plist Configuration

The `Info.plist` file is already configured at `ios/COHRM/COHRM/Info.plist` with the required keys:

### Privacy Usage Descriptions (Required by Apple)

| Key | Description |
|-----|-------------|
| `NSLocationWhenInUseUsageDescription` | Location access for geolocating health reports |
| `NSCameraUsageDescription` | Camera access for taking photos of health events |
| `NSPhotoLibraryUsageDescription` | Photo library access for selecting report photos |
| `NSPhotoLibraryAddUsageDescription` | Saving photos to the library |

### App Transport Security

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>localhost</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
            <key>NSIncludesSubdomains</key>
            <true/>
        </dict>
    </dict>
</dict>
```

The production API at `onehealth.cm` uses HTTPS, so no exception is needed. The localhost exception is for development only.

### Background Tasks

```xml
<key>BGTaskSchedulerPermittedIdentifiers</key>
<array>
    <string>cm.onehealth.cohrm.sync</string>
</array>
<key>UIBackgroundModes</key>
<array>
    <string>fetch</string>
</array>
```

## 5. App Icons

The asset catalog is at `ios/COHRM/COHRM/Resources/Assets.xcassets/AppIcon.appiconset/`.

Required icon sizes for App Store submission:
- 1024x1024 px - App Store icon (required)
- 180x180 px - iPhone App icon (@3x)
- 120x120 px - iPhone App icon (@2x)
- 167x167 px - iPad Pro App icon (@2x)
- 152x152 px - iPad App icon (@2x)

Place your icon files in the `AppIcon.appiconset/` directory and update the `Contents.json` accordingly.

## 6. Localization

The app supports French (primary) and English:
- Localization files are in `ios/COHRM/COHRM/Localizable/`
- Development language: French (`fr`)
- Supported languages: French, English

To verify localization in Xcode:
1. Project > Info > Localizations
2. Ensure both "French" and "English" are listed
3. Set "French" as the development language

## 7. Build and Run

### Simulator
1. Select a target device (iPhone 15 recommended)
2. Select the COHRM scheme
3. Press Cmd+R to build and run

### Physical Device
1. Connect your iPhone via USB or set up wireless debugging
2. Trust the developer certificate on the device (Settings > General > VPN & Device Management)
3. Select your device as the target
4. Press Cmd+R

## 8. Archive for App Store

1. Select "Any iOS Device" as the build target
2. Product > Archive
3. Once the archive completes, the Organizer window will open
4. Click "Distribute App"
5. Select "App Store Connect"
6. Follow the wizard to upload to App Store Connect

### Before Archiving

- Ensure the version and build numbers are correct
- Verify all required icons are in the asset catalog
- Test on a physical device
- Review the App Store listing metadata in `ios/store-listing/`
- Review the Apple review notes in `ios/store-listing/review-notes.md`

## 9. TestFlight

After uploading to App Store Connect:
1. Go to App Store Connect > Your App > TestFlight
2. The build will undergo automated processing (10-30 minutes)
3. Add internal testers or create an external testing group
4. Testers will receive an invitation to install the beta via TestFlight

## 10. Environment Configuration

The API base URL is configured in the app's service layer. For production:

```
API Base URL: https://onehealth.cm/api/cohrm/
```

For development, update the base URL to point to your local server:

```
API Base URL: http://localhost:5000/api/cohrm/
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No such module" errors | Clean build folder (Cmd+Shift+K), then rebuild |
| Signing errors | Verify your Apple Developer team is selected and certificates are valid |
| SwiftData migration errors | Delete the app from device/simulator and reinstall |
| Location not working on simulator | Use Features > Location > Custom Location in Simulator menu |
| Push notifications not working | Push notifications only work on physical devices, not simulators |
