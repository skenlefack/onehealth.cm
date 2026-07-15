# COHRM Cameroun - Application iOS

Application iOS de signalement sanitaire pour le système **Cameroon One Health Rumor Management (COHRM)**.

## Configuration requise

- **Xcode** 15.0 ou supérieur
- **macOS** Sonoma 14.0 ou supérieur
- **iOS** 17.0+ (cible de déploiement)
- **Swift** 5.9+

## Installation

### 1. Ouvrir le projet

```bash
cd ios/COHRM
open COHRM.xcodeproj
```

> **Note :** Si le `.xcodeproj` n'existe pas encore, créez un nouveau projet Xcode :
> 1. Ouvrir Xcode → File → New → Project
> 2. Choisir **App** (iOS)
> 3. Product Name: `COHRM`
> 4. Bundle Identifier: `cm.onehealth.cohrm`
> 5. Interface: **SwiftUI**
> 6. Storage: **SwiftData**
> 7. Supprimer les fichiers générés et importer les fichiers depuis `COHRM/`

### 2. Configurer le Bundle ID

Dans les **Signing & Capabilities** du projet :
- Bundle Identifier : `cm.onehealth.cohrm`
- Sélectionner votre Team de développement
- Activer **Background Modes** → Background fetch
- Ajouter **Background Tasks** capability

### 3. Ajouter les fichiers source

Glisser le dossier `COHRM/` dans le navigateur Xcode en s'assurant que :
- "Copy items if needed" est coché
- "Create groups" est sélectionné
- La target `COHRM` est cochée

### 4. Configurer les Assets

- Placer l'icône de l'app (1024x1024px) dans `Assets.xcassets/AppIcon.appiconset/`
- Les couleurs `PrimaryColor` et `AccentColor` sont déjà configurées

### 5. Build & Run

```
⌘ + R  pour lancer sur simulateur ou appareil
```

## Architecture

```
COHRM/
├── App/                    # Point d'entrée (@main), ContentView, TabView
├── Core/
│   ├── Network/            # APIClient (URLSession), Endpoints, NetworkMonitor
│   ├── Storage/            # SwiftData @Model (ReportModel, PhotoAttachment)
│   ├── Location/           # CLLocationManager wrapper
│   └── Camera/             # PHPickerViewController bridge
├── Features/
│   ├── Onboarding/         # 3 pages d'introduction
│   ├── Home/               # Écran d'accueil avec stats et actions rapides
│   ├── Report/             # Wizard 5 étapes (type, lieu, détails, infos, confirmation)
│   ├── History/            # Liste des signalements locaux
│   ├── SMSReport/          # Signalement par SMS structuré
│   └── Settings/           # Paramètres de l'app
├── Models/                 # EventType, Report (DTO), SyncStatus, CameroonRegion
├── Services/               # APIService, SyncService, PhotoService
├── Theme/                  # AppColors, AppFonts, AppDimensions
├── Localizable/            # Strings FR/EN (150+ clés chacune)
├── Utils/                  # Extensions, Helpers, composants réutilisables
└── Resources/              # Assets.xcassets (couleurs, icône)
```

### Patterns

| Pattern | Technologie |
|---------|-------------|
| Architecture | MVVM avec @Observable |
| UI | SwiftUI déclaratif |
| Concurrence | Swift Concurrency (async/await, actors) |
| Persistance | SwiftData (@Model, @Query) |
| Réseau | URLSession natif |
| Cartographie | MapKit natif |
| Photos | PhotosUI (PHPicker) |
| Sync arrière-plan | BGTaskScheduler |
| Localisation GPS | CoreLocation |
| Internationalisation | Localizable.strings (FR/EN) |

## Fonctionnalités

### Mode hors-ligne
Les signalements sont sauvegardés localement via SwiftData et synchronisés automatiquement quand le réseau revient (détection via `NWPathMonitor`).

### Signalement en 5 étapes
1. **Type d'événement** : 6 catégories sanitaires + sélection d'espèce
2. **Localisation** : carte MapKit avec annotation draggable + GPS
3. **Détails** : description, symptômes, photos (jusqu'à 3)
4. **Informations** : anonyme ou identifié
5. **Confirmation** : récapitulatif complet avant envoi

### Signalement SMS
Pour les zones sans internet, génération d'un SMS structuré au format `OH#CAT#ESP#SYM#REG#DESC` envoyé via `MFMessageComposeViewController`.

### Internationalisation
Français et anglais complets. Changement de langue en temps réel dans les paramètres.

## API Backend

L'application communique avec le backend One Health CMS via :

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/cohrm/mobile/report` | POST | Soumettre un signalement |
| `/api/cohrm/mobile/sms` | POST | Soumettre via SMS |
| `/api/cohrm/mobile/sync` | GET | Synchroniser les données de référence |
| `/api/cohrm/decode-sms` | POST | Décoder un SMS structuré |

## Permissions requises

| Permission | Raison |
|-----------|--------|
| Localisation (en utilisation) | Géolocalisation du signalement |
| Appareil photo | Photos d'événements sanitaires |
| Bibliothèque photos | Joindre des photos existantes |
| Tâches d'arrière-plan | Synchronisation automatique |

## Configuration serveur

Par défaut, l'app pointe vers `https://onehealth.cm/api`. Modifiable dans **Paramètres > Serveur**.

Pour le développement local :
1. Lancer le backend sur `http://localhost:5000`
2. Modifier l'URL dans les paramètres de l'app
3. L'exception ATS pour `localhost` est déjà configurée dans Info.plist

## Contribution

Ce projet fait partie de la plateforme **One Health Cameroon** pour la surveillance sanitaire intégrée (santé humaine, animale et environnementale).
