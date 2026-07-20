# Apple Review Notes

## App Purpose

COHRM (Cameroon One Health Rumor Management) is a government/NGO health surveillance application used in Cameroon for the "One Health" approach - a collaborative, multisectoral strategy that recognizes the interconnection between human health, animal health, and the environment.

The application enables citizens, community health workers, veterinarians, and public health officials to report and track health-related rumors and events (disease outbreaks, animal deaths, environmental hazards) across Cameroon's 10 regions.

## Target Users

1. **General Public:** Citizens who can submit health event reports without creating an account (public reporting feature, requires phone number only)
2. **Community Health Workers:** Field agents with accounts who submit detailed reports with GPS coordinates and photos
3. **Health Authorities:** Government officials who validate, assess risk, and manage the reported events through a multi-level validation workflow

## Demo Account

For review purposes, please use the following test credentials:

- **URL:** The app connects to https://onehealth.cm/api/cohrm/
- **Login:** reviewer@onehealth.cm
- **Password:** ReviewCOHRM2026!

Alternatively, the "Public Report" feature can be tested without any login by tapping "Signaler sans compte" / "Report without account" on the login screen.

## Features Requiring Permissions

- **Camera (NSCameraUsageDescription):** Used to take photos of health events to attach to reports. Photos help health authorities assess the situation remotely.
- **Location When In Use (NSLocationWhenInUseUsageDescription):** Used to automatically geolocate where a health event occurred, enabling rapid response by the appropriate regional health team.
- **Photo Library (NSPhotoLibraryUsageDescription):** Used to select existing photos from the gallery to attach to health reports.

## Background Modes

- **Background Fetch:** Used for periodic synchronization of draft reports when the device regains connectivity. Reports created offline are queued and synced automatically.

## Data Usage

This is a health surveillance tool operating under the authority of the Cameroon Ministry of Public Health. All data is used exclusively for public health surveillance purposes. No data is sold or shared for commercial purposes. See our privacy policy at https://onehealth.cm/fr/privacy-policy

## Content

The app does not contain user-generated content visible to other users beyond authorized health officials. Reports are submitted to a centralized system managed by health authorities and are not publicly visible.

## Availability

The app is intended for use in Cameroon but can function globally. The primary languages are French and English, reflecting Cameroon's bilingual status.

## Contact

- **Organization:** Programme Zoonoses / One Health Cameroon
- **Email:** contact@onehealth.cm
- **Website:** https://onehealth.cm
