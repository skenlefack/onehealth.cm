# Programme Complet de Finalisation - Applications Mobiles OneHealth COHRM

**Date**: 22 avril 2026
**Objectif**: Atteindre la parite fonctionnelle iOS/Android et preparer les deux apps pour le deploiement en production (Play Store / App Store).

---

## ETAT ACTUEL

| Plateforme | Tech Stack | LOC | Pages | Statut |
|-----------|------------|-----|-------|--------|
| Android | Kotlin + Jetpack Compose + Hilt | ~10 947 | 13 screens | 95% complet |
| iOS | Swift 5.9 + SwiftUI + SwiftData | ~7 082 | 5 screens | 65% complet |

### Backend Mobile API - 5 endpoints dedies (100% operationnels)
- `POST /api/cohrm/mobile/login` - Authentification JWT
- `POST /api/cohrm/mobile/report` - Soumission signalement (etendu)
- `POST /api/cohrm/mobile/sms` - Webhook SMS
- `GET /api/cohrm/mobile/dashboard` - Stats + tendances + regroupements
- `GET /api/cohrm/mobile/sync` - Synchronisation donnees de reference

### Endpoints supplementaires consommables par le mobile
- `GET /api/cohrm/rumors` - Liste avec filtres et pagination
- `GET /api/cohrm/rumors/:id` - Detail rumeur + historique + notes
- `POST /api/cohrm/rumors/:id/notes` - Ajouter une note
- `POST /api/cohrm/rumors/:id/validate` - Valider une rumeur
- `POST /api/cohrm/scan/run` - Lancer un scan
- `GET /api/cohrm/scan-history` - Historique des scans
- `GET /api/cohrm/notifications/my` - Mes notifications

---

## PHASE 1 - PARITE iOS (Priorite CRITIQUE - 10 jours)

### 1.1 Dashboard Analytics iOS (3 jours)

**Fichiers a creer:**
```
ios/COHRM/Features/Dashboard/
  DashboardView.swift          - Vue principale avec onglets
  DashboardViewModel.swift     - Logique metier + appels API
  Components/
    KPICardView.swift          - Carte stat (Total, En attente, etc.)
    TrendChartView.swift       - Graphique tendance 7/30 jours (Swift Charts)
    BarChartView.swift         - Barres horizontales (par region, statut, source)
    DonutChartView.swift       - Repartition par categorie
    QuickStatsRow.swift        - Mini cartes (Aujourd'hui, Semaine, Mois)
    RecentRumorsSection.swift  - 10 dernieres rumeurs
```

**Specifications:**
- Consommer `GET /api/cohrm/mobile/dashboard`
- 6 cartes KPI: Total, En attente, Investigation, Confirmees, Alertes, Fermees
- 3 mini stats: Aujourd'hui, Cette semaine, Ce mois
- Graphique tendance (Swift Charts framework, iOS 16+)
- Barres horizontales: par statut, region, source, priorite
- Donut: repartition par categorie sanitaire
- Liste des 10 dernieres rumeurs avec badges status/priorite
- Pull-to-refresh
- Support dark mode

**Modeles de donnees a ajouter:**
```swift
struct DashboardStats: Codable {
    let total, pending, investigating, confirmed, falseAlarm, closed: Int
    let highPriority, critical: Int
    let todayCount, weekCount, monthCount: Int
    let byRegion, byCategory, byStatus, bySource, byPriority: [GroupCount]
    let trends: [DayTrend]
    let recentRumors: [RumorSummary]
}

struct GroupCount: Codable {
    let name: String
    let count: Int
}

struct DayTrend: Codable {
    let date: String
    let count: Int
}

struct RumorSummary: Codable {
    let id: Int
    let code, title, category, status, priority: String
    let region: String?
    let riskLevel: String?
    let createdAt: String
}
```

**Navigation:** Ajouter un 4eme onglet "Dashboard" avec icone `chart.bar.fill` dans MainTabView.

---

### 1.2 Gestion des Rumeurs iOS (3-4 jours)

**Fichiers a creer:**
```
ios/COHRM/Features/Rumors/
  RumorsListView.swift         - Liste avec recherche/filtres
  RumorsViewModel.swift        - Logique + pagination
  RumorDetailView.swift        - Detail complet
  RumorDetailViewModel.swift   - Chargement detail + actions
  Components/
    RumorRowView.swift         - Ligne dans la liste
    StatusFilterChips.swift    - Chips de filtrage par statut
    RumorTimelineView.swift    - Historique de validation
    RumorNotesSection.swift    - Liste et ajout de notes
    StatusBadgeView.swift      - Badge statut colore
    PriorityBadgeView.swift    - Badge priorite
```

**Specifications - Liste:**
- Consommer `GET /api/cohrm/rumors?page=X&limit=20&status=Y&search=Z`
- Barre de recherche en haut
- Chips de filtrage: En attente, Investigation, Confirmee, Fausse alerte, Fermee
- Infinite scroll (pagination automatique)
- Chaque ligne: code, titre, statut (badge couleur), priorite, region, date
- Pull-to-refresh
- Tri par date (recent d'abord)

**Specifications - Detail:**
- Consommer `GET /api/cohrm/rumors/:id`
- Header: code, titre, badges statut/priorite/risque
- Section info: description, categorie, espece, symptomes, localisation
- Section rapporteur: nom, telephone (si autorise)
- Section geographique: region, departement, coordonnees GPS
- Timeline de validation: liste chronologique des actions
- Notes: liste + bouton ajouter (POST /rumors/:id/notes)
- Actions: changer statut (si permission suffisante)
- Photos attachees en galerie

**Navigation:** Ajouter un 5eme onglet "Rumeurs" avec icone `megaphone.fill`.

---

### 1.3 Scanner Web iOS (2 jours)

**Fichiers a creer:**
```
ios/COHRM/Features/Scanner/
  ScannerView.swift            - Interface principale
  ScannerViewModel.swift       - Logique scan + historique
  ScanDetailView.swift         - Detail d'un scan
  Components/
    ScanLaunchCard.swift       - Formulaire de lancement
    ScanHistoryList.swift      - Liste des scans passes
    ScanResultRow.swift        - Ligne resultat
```

**Specifications:**
- Formulaire: selection source (Google, Twitter/X, Facebook, Tous), mots-cles
- Bouton "Lancer le scan" -> POST /api/cohrm/scan/run
- Indicateur de progression pendant le scan
- Historique des scans (GET /api/cohrm/scan-history)
- Detail scan: liste des resultats trouves, mots-cles matches
- Action: convertir un resultat en rumeur

**Navigation:** Accessible depuis le Dashboard ou via menu contextuel.

---

### 1.4 Finalisation Report Wizard iOS (1 jour)

**Corrections a apporter:**
- `Step4PersonalInfoView.swift` ligne 158: remplacer placeholder "6XX XXX XXX" par format reel
- Connecter la soumission finale a `POST /api/cohrm/mobile/report`
- Gerer l'upload des photos en multipart/form-data
- Ajouter indicateur de progression lors de l'envoi
- Gerer le cas offline: sauvegarder en SwiftData, sync plus tard
- Confirmation visuelle apres envoi reussi avec code de reference

---

### 1.5 Notifications iOS (1 jour)

**Fichiers a creer:**
```
ios/COHRM/Features/Notifications/
  NotificationsView.swift      - Liste des notifications
  NotificationsViewModel.swift - Chargement + actions
```

**Specifications:**
- Consommer `GET /api/cohrm/notifications/my`
- Liste avec badges type (nouvelle rumeur, escalade, validation, etc.)
- Badge compteur sur l'icone de l'onglet
- Push notifications via APNs (configuration ulterieure)

---

## PHASE 2 - AMELIORATIONS ANDROID (5 jours)

### 2.1 Corrections critiques (1 jour)

**runBlocking dans l'intercepteur OkHttp:**
```kotlin
// AVANT (risque ANR):
val token = runBlocking { dataStore.getToken() }

// APRES (safe):
// Utiliser un TokenProvider synchrone avec cache memoire
class TokenProvider(private val dataStore: DataStore) {
    @Volatile private var cachedToken: String? = null

    suspend fun refreshToken() {
        cachedToken = dataStore.getToken()
    }

    fun getToken(): String? = cachedToken
}
```

**Crash log display:** Supprimer l'affichage des crash reports en mode release (garder uniquement en debug).

### 2.2 Centre de notifications Android (2 jours)

**Fichiers a creer:**
```
android/.../ui/screens/notifications/
  NotificationsScreen.kt       - Liste des notifications
  NotificationsViewModel.kt    - ViewModel avec paging
  NotificationItem.kt          - Composable pour chaque notification
```

- Consommer `GET /api/cohrm/notifications/my`
- Badge compteur sur l'icone dans la bottom nav
- Swipe pour marquer comme lu
- Firebase Cloud Messaging pour push notifications

### 2.3 Mode offline ameliore (1 jour)

- Caching des rumeurs consultees (Room)
- Queue de validation offline
- Indicateur visuel de sync en cours
- Gestion conflits (derniere ecriture gagne)

### 2.4 Ameliorations UX (1 jour)

- Animations de transition entre ecrans
- Skeleton loading (shimmer effect)
- Gestion erreurs avec retry automatique
- Deep links pour ouvrir une rumeur depuis notification

---

## PHASE 3 - QUALITE & TESTS (5 jours)

### 3.1 Tests unitaires (2 jours)

**Android (JUnit + Mockk):**
```
test/
  viewmodel/
    DashboardViewModelTest.kt
    RumorsViewModelTest.kt
    ReportViewModelTest.kt
  repository/
    CohrmRepositoryTest.kt
    SyncRepositoryTest.kt
  util/
    FormattersTest.kt
    ValidatorsTest.kt
```

**iOS (XCTest):**
```
Tests/
  ViewModels/
    DashboardViewModelTests.swift
    RumorsViewModelTests.swift
    ReportViewModelTests.swift
  Services/
    APIServiceTests.swift
    SyncServiceTests.swift
  Models/
    ReportModelTests.swift
```

**Couverture cible:** 70% minimum sur les ViewModels et Services.

### 3.2 Tests UI/Integration (1 jour)

**Android (Espresso + Compose Test):**
- Test de navigation complete
- Test formulaire de signalement (5 etapes)
- Test filtres sur liste des rumeurs

**iOS (XCUITest):**
- Test du wizard de rapport
- Test navigation entre onglets
- Test recherche et filtres

### 3.3 Tests de performance (1 jour)

- Mesurer temps de demarrage (< 2s)
- Mesurer temps de chargement dashboard (< 1.5s)
- Verifier consommation memoire (< 150MB)
- Tester avec 1000+ rumeurs en base
- Tester mode offline avec 50+ rapports en queue

### 3.4 Audit securite (1 jour)

- [ ] Token JWT stocke de facon securisee (Keystore Android / Keychain iOS)
- [ ] Certificate pinning sur les requetes API
- [ ] Pas de donnees sensibles dans les logs
- [ ] Obfuscation ProGuard/R8 (Android) configuree
- [ ] App Transport Security (iOS) correctement configure
- [ ] Validation des entrees utilisateur cote client
- [ ] Protection contre screen capture pour donnees sensibles

---

## PHASE 4 - PREPARATION STORE (3 jours)

### 4.1 Assets & Branding (1 jour)

**Android:**
- [ ] Icone adaptive (foreground + background layers)
- [ ] Splash screen avec logo OneHealth
- [ ] Screenshots pour Play Store (phone + tablet, 5-8 captures)
- [ ] Feature graphic (1024x500)
- [ ] Description courte/longue en francais et anglais

**iOS:**
- [ ] App Icon (1024x1024 + toutes tailles)
- [ ] Launch screen (storyboard ou SwiftUI)
- [ ] Screenshots pour App Store (6.7", 6.1", 5.5", iPad)
- [ ] Preview video optionnel
- [ ] Description en francais et anglais

### 4.2 Configuration stores (1 jour)

**Google Play Console:**
- [ ] Creer la fiche Play Store
- [ ] Configurer la politique de confidentialite
- [ ] Data safety form (types de donnees collectees)
- [ ] Categorie: Sante / Outils
- [ ] Classification PEGI
- [ ] Pays cibles: Cameroun (principal), CEMAC
- [ ] Version beta interne d'abord

**Apple App Store Connect:**
- [ ] Creer l'App ID et provisioning profile
- [ ] Configurer les capabilities (Push, Background Fetch, Location)
- [ ] App Review Information (contact, notes)
- [ ] Age Rating (Medical/Health)
- [ ] Pricing: Gratuit
- [ ] TestFlight beta d'abord

### 4.3 CI/CD Mobile (1 jour)

**GitHub Actions - Android:**
```yaml
# .github/workflows/android-build.yml
- Checkout + Setup JDK 17
- Cache Gradle dependencies
- Run unit tests
- Build debug APK
- Build release AAB (signed)
- Upload artifacts
- (optionnel) Deploy to Firebase App Distribution
```

**GitHub Actions - iOS:**
```yaml
# .github/workflows/ios-build.yml
- Checkout + Setup Xcode 15
- Install certificates (match/fastlane)
- Run unit tests
- Build archive
- Export IPA
- Upload to TestFlight
```

---

## PHASE 5 - DEPLOIEMENT & LANCEMENT (2 jours)

### 5.1 Beta testing (1 jour)

- Deployer sur Firebase App Distribution (Android) + TestFlight (iOS)
- Inviter 10-15 beta testeurs (agents communautaires + superviseurs)
- Collecter feedback via formulaire Google Forms
- Corriger bugs critiques

### 5.2 Release production (1 jour)

- [ ] Generer release AAB signe (Android)
- [ ] Generer archive Xcode (iOS)
- [ ] Soumettre au Play Store (review ~24-48h)
- [ ] Soumettre a l'App Store (review ~24-72h)
- [ ] Configurer Firebase Analytics pour le suivi d'utilisation
- [ ] Configurer Crashlytics pour le monitoring des crashes

---

## PLANNING RECAPITULATIF

| Phase | Duree | Contenu |
|-------|-------|---------|
| **Phase 1** - Parite iOS | 10 jours | Dashboard, Rumeurs, Scanner, Report, Notifs |
| **Phase 2** - Android ameli. | 5 jours | Fix intercepteur, Notifs, Offline, UX |
| **Phase 3** - Tests & Qualite | 5 jours | Unit, UI, Perf, Securite |
| **Phase 4** - Stores | 3 jours | Assets, Config stores, CI/CD |
| **Phase 5** - Deploiement | 2 jours | Beta + Release |
| **TOTAL** | **25 jours ouvrables** | ~5 semaines |

---

## PRIORITE DE DEVELOPPEMENT (ordre chronologique)

```
Semaine 1:  iOS Dashboard Analytics + iOS Rumors List
Semaine 2:  iOS Rumor Detail + iOS Scanner + iOS Report fix
Semaine 3:  Android fixes + Android Notifications + iOS Notifications
Semaine 4:  Tests unitaires + Tests UI + Audit securite
Semaine 5:  Assets stores + CI/CD + Beta + Release
```

---

## DEPENDANCES TECHNIQUES

### iOS
- Xcode 15.0+ avec iOS 17 SDK
- Apple Developer Program (99$/an)
- Certificats de distribution + provisioning profiles
- Compte App Store Connect

### Android
- Android Studio Hedgehog+
- JDK 17
- Google Play Developer Account (25$ one-time)
- Keystore de release (`cohrm-release.jks` - deja configure)
- Google Maps API Key (deja configure dans local.properties)

### Backend
- Aucune modification supplementaire requise
- Tous les endpoints sont deja operationnels
- SMTP configure pour les notifications email

---

## METRIQUES DE SUCCES

| Metrique | Cible |
|----------|-------|
| Parite fonctionnelle iOS/Android | 100% |
| Couverture tests ViewModels | > 70% |
| Temps demarrage app | < 2 secondes |
| Temps chargement dashboard | < 1.5 secondes |
| Crash-free rate | > 99.5% |
| Taille APK | < 20 MB |
| Taille IPA | < 30 MB |
| Note store visee | > 4.0/5 |
