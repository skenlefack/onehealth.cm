# DUSS-C — Conception technique du module

## Vue d'ensemble

Le module DUSS-C (Défi Une Seule Santé Cameroun) s'intègre à la plateforme OneHealth CMS existante comme un module de première classe, au même niveau que COHRM, E-Learning et OHWR-Mapping.

**Objectif** : Construire directement la **phase 2** (PWA) décrite dans la note conceptuelle, en s'appuyant sur l'infrastructure existante (Express.js + MySQL + React admin + Next.js public).

---

## 1. Architecture technique

```
┌──────────────────────────────────────────────────────────────────┐
│                        ADMIN (React 18)                          │
│  admin/src/modules/dussc/                                        │
│  ┌──────────────┬──────────────┬──────────────┬────────────────┐ │
│  │ Banque de    │ Templates    │ Dashboard    │ Alertes        │ │
│  │ questions    │ de quiz      │ analytique   │ Module M12     │ │
│  │ CRUD + CSV   │ Composition  │ 4 vues       │ Activation     │ │
│  │ Versioning   │ Blocs/profils│ Cartographie │ Monitoring     │ │
│  └──────────────┴──────────────┴──────────────┴────────────────┘ │
└────────────────────────────┬─────────────────────────────────────┘
                             │ /api/dussc/*
┌────────────────────────────┴─────────────────────────────────────┐
│                     BACKEND (Express.js)                          │
│  backend/routes/dussc.js                                         │
│  ┌──────────────┬──────────────┬──────────────┬────────────────┐ │
│  │ Questions    │ Quiz Engine  │ Analytics    │ Import/Export  │ │
│  │ CRUD + ver-  │ Session mgmt │ Stats hebdo  │ CSV import     │ │
│  │ sioning      │ Score calc   │ Psychométrie │ CSV/JSON export│ │
│  │ Lifecycle    │ Validation   │ Agrégation   │ COHRM bridge   │ │
│  └──────────────┴──────────────┴──────────────┴────────────────┘ │
│  backend/services/dusscAnalyticsService.js                       │
│  backend/services/dusscQuizEngine.js                             │
└────────────────────────────┬─────────────────────────────────────┘
                             │ MySQL (mysql2/promise)
┌────────────────────────────┴─────────────────────────────────────┐
│                     BASE DE DONNÉES                               │
│  14 tables préfixe dussc_  (migration 018)                       │
│  Voir section 3 ci-dessous                                       │
└──────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┴─────────────────────────────────────┐
│                  PUBLIC (Next.js 14 — PWA)                        │
│  frontend-next/app/defi/                                         │
│  ┌──────────────┬──────────────┬──────────────┬────────────────┐ │
│  │ /defi        │ /defi/quiz   │ /defi/result │ Service Worker │ │
│  │ Accueil      │ Parcours     │ Score, gain  │ Offline-first  │ │
│  │ Langue       │ adaptatif    │ Certificat   │ IndexedDB      │ │
│  │ Profil       │ Feedback     │ Partage      │ Background     │ │
│  │ Consentement │ immédiat     │ → E-Learning │ sync           │ │
│  └──────────────┴──────────────┴──────────────┴────────────────┘ │
│  Contraintes : < 300 Ko charge initiale, < 1 Mo parcours total   │
│  Mobile-first, écran 5", main unique                             │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Modèle de données — 14 tables

### 2.1. Diagramme ER simplifié

```
dussc_modules ──────< dussc_module_personas >── dussc_personas
      │
      │ 1:N
      │
dussc_questions ───< dussc_quiz_template_questions >── dussc_quiz_templates
      │                                                       │
      │ 1:N                                                   │
      │                                                       │
      ├──< dussc_question_history                              │
      │                                                       │
      ├──< dussc_question_stats                                │
      │                                                       │
      └──< dussc_responses >── dussc_sessions ────────────────-┘
                                    │
                                    ├──< dussc_journey_events
                                    │
                                    └──< dussc_responses

dussc_alerts ──── dussc_quiz_templates (FK)

dussc_weekly_stats (autonome, pré-calculée)
dussc_settings (autonome, configuration)
```

### 2.2. Tables et leurs rôles

| # | Table | Rôle | Lignes estimées |
|---|---|---|---|
| 1 | `dussc_modules` | 13 modules thématiques (M00-M12) | 13 (statique) |
| 2 | `dussc_personas` | 12 profils de publics cibles (A1-D3) | 13 (statique) |
| 3 | `dussc_module_personas` | Matrice priorité module×persona | ~156 |
| 4 | `dussc_questions` | Banque de questions versionnée | 144+ |
| 5 | `dussc_sessions` | Participations anonymes | 15 000+ (pilote) |
| 6 | `dussc_responses` | Réponses individuelles | ~180 000 (pilote) |
| 7 | `dussc_journey_events` | Événements de parcours | ~300 000 (pilote) |
| 8 | `dussc_quiz_templates` | Templates de parcours | ~5 |
| 9 | `dussc_quiz_template_questions` | Questions dans chaque template | ~200 |
| 10 | `dussc_alerts` | Scénarios d'alerte activables | ~5 |
| 11 | `dussc_weekly_stats` | Agrégats hebdomadaires | ~16 (pilote) |
| 12 | `dussc_question_stats` | Psychométrie par question | ~144/période |
| 13 | `dussc_question_history` | Audit trail des questions | ~500 |
| 14 | `dussc_settings` | Configuration du module | ~15 |

### 2.3. Décisions clés du modèle

**Versioning des questions** : `dussc_questions` contient toutes les versions. Le champ `is_current_version` marque la version active. Les réponses pointent vers la version exacte via `question_id` (FK), garantissant que les données historiques restent interprétables.

**Anonymat strict** : `dussc_sessions` ne contient AUCUNE donnée identifiante. L'UUID est généré côté client (navigateur), sans lien avec l'appareil. Le certificat nominatif est généré localement dans le navigateur du participant.

**Minimisation** : 7 champs démographiques maximum (region, milieu, tranche_age, sexe [facultatif], langue, profil, canal), conformément à la loi n° 2024/017.

**Marquage vs suppression** : Aucune session n'est supprimée. Les sessions suspectes sont marquées (`is_suspicious`) et exclues des analyses d'apprentissage, mais conservées pour la traçabilité.

**Stats pré-calculées** : `dussc_weekly_stats` évite de recalculer les agrégats à chaque consultation du dashboard. Calculée chaque dimanche, conservée sans limite de durée.

---

## 3. API Routes — `/api/dussc/*`

### 3.1. Routes admin (authentifiées)

```
── Questions ───────────────────────────────────────────────
GET    /api/dussc/questions              Liste paginée, filtrable
GET    /api/dussc/questions/:id          Détail d'une question
POST   /api/dussc/questions              Créer une question
PUT    /api/dussc/questions/:id          Modifier (crée nouvelle version)
PATCH  /api/dussc/questions/:id/status   Changer le statut (lifecycle)
DELETE /api/dussc/questions/:id          Retirer (soft delete → statut 'retire')
POST   /api/dussc/questions/import       Import CSV de la banque
GET    /api/dussc/questions/export        Export CSV/JSON

── Modules ─────────────────────────────────────────────────
GET    /api/dussc/modules                Liste des modules
PUT    /api/dussc/modules/:id            Modifier un module
GET    /api/dussc/modules/:id/questions  Questions d'un module

── Personas ────────────────────────────────────────────────
GET    /api/dussc/personas               Liste des personas
GET    /api/dussc/personas/matrix        Matrice modules×personas

── Templates ───────────────────────────────────────────────
GET    /api/dussc/templates              Liste des templates
POST   /api/dussc/templates              Créer un template
PUT    /api/dussc/templates/:id          Modifier
POST   /api/dussc/templates/:id/publish  Publier
POST   /api/dussc/templates/:id/questions  Assigner des questions

── Alertes ─────────────────────────────────────────────────
GET    /api/dussc/alerts                 Liste des alertes
POST   /api/dussc/alerts                 Créer une alerte
PATCH  /api/dussc/alerts/:id/activate    Activer
PATCH  /api/dussc/alerts/:id/deactivate  Désactiver

── Analytics (admin) ───────────────────────────────────────
GET    /api/dussc/analytics/overview     Vue pilotage (Vue 1)
GET    /api/dussc/analytics/learning     Vue apprentissage (Vue 2)
GET    /api/dussc/analytics/map          Vue cartographie (Vue 3)
GET    /api/dussc/analytics/advocacy     Vue plaidoyer (Vue 4)
GET    /api/dussc/analytics/weekly       Stats hebdomadaires
GET    /api/dussc/analytics/psychometrics  Indices par question
GET    /api/dussc/analytics/abandons     Courbe d'abandon
POST   /api/dussc/analytics/compute      Déclencher le calcul hebdo
GET    /api/dussc/analytics/export       Export données agrégées
```

### 3.2. Routes publiques (sans authentification)

```
── Quiz public ─────────────────────────────────────────────
GET    /api/dussc/public/quiz            Quiz actif (template + questions)
                                         Params: ?lang=fr&profil=A1
POST   /api/dussc/public/sessions        Créer une session (consentement)
POST   /api/dussc/public/sessions/:uuid/responses   Soumettre une réponse
POST   /api/dussc/public/sessions/:uuid/complete     Terminer le parcours
GET    /api/dussc/public/sessions/:uuid/result       Résultat + score
POST   /api/dussc/public/sessions/:uuid/events       Enregistrer un événement
POST   /api/dussc/public/sessions/sync   Synchronisation offline (batch)

── Informations publiques ──────────────────────────────────
GET    /api/dussc/public/modules         Modules actifs (nom + description)
GET    /api/dussc/public/consent         Texte de consentement
GET    /api/dussc/public/personas        Liste des profils disponibles
```

### 3.3. Middleware et sécurité

| Route | Auth | Rate limit | Notes |
|---|---|---|---|
| `/api/dussc/questions/*` | `auth` + `requirePermission('manage_dussc')` | Standard | CRUD admin |
| `/api/dussc/analytics/*` | `auth` + `requirePermission('view_dussc_analytics')` | Standard | Dashboard |
| `/api/dussc/alerts/*` | `auth` + `requirePermission('manage_dussc_alerts')` | Standard | Alertes |
| `/api/dussc/public/quiz` | Aucune | 30/min/IP | Anti-scraping |
| `/api/dussc/public/sessions` | Aucune | 10/min/IP | Anti-spam |
| `/api/dussc/public/sessions/sync` | Aucune | 5/min/IP | Batch offline |

---

## 4. Services backend

### 4.1. `dusscQuizEngine.js`

Moteur de composition et d'évaluation des quiz.

```
Responsabilités :
├── buildQuiz(lang, profil)
│   ├── Charger le template actif
│   ├── Sélectionner les questions pré-test (ancres, sans feedback)
│   ├── Sélectionner les questions tronc commun
│   ├── Filtrer les questions profilées selon le persona
│   ├── Sélectionner les questions post-test (ancres reformulées)
│   ├── Randomiser l'ordre des options si activé
│   └── Retourner le parcours structuré
│
├── evaluateResponse(sessionId, questionId, answer)
│   ├── Vérifier la réponse vs reponse_correcte
│   ├── Enregistrer dans dussc_responses
│   ├── Retourner le feedback (explication + action) sauf pré-test
│   └── Enregistrer la durée
│
├── computeSessionScore(sessionId)
│   ├── Calculer score_pre, score_post, gain
│   ├── Calculer pct_pre, pct_post
│   ├── Détecter sessions suspectes
│   └── Mettre à jour dussc_sessions
│
└── detectSuspicious(session)
    ├── Durée totale < 45 secondes → suspect
    ├── Toutes réponses identiques en position → suspect
    └── Marquer sans supprimer
```

### 4.2. `dusscAnalyticsService.js`

Calcul des statistiques et des indices psychométriques.

```
Responsabilités :
├── computeWeeklyStats(weekStart)
│   ├── Agréger par canal, région, profil, langue, sexe
│   ├── Calculer taux d'achèvement, moyennes de gain
│   ├── Identifier top questions échouées
│   ├── Construire courbe d'abandon
│   └── Insérer dans dussc_weekly_stats
│
├── computeQuestionPsychometrics(questionId)
│   ├── Indice de difficulté (prop. bonnes réponses)
│   ├── Indice de discrimination (corrélation item-score)
│   ├── Distribution des réponses (A/B/C/D)
│   ├── Distracteur dominant
│   ├── Temps moyen/médian de réponse
│   └── Insérer dans dussc_question_stats
│
├── getOverviewDashboard(filters)     → Vue 1 Pilotage
├── getLearningDashboard(filters)     → Vue 2 Apprentissage
├── getMapDashboard(filters)          → Vue 3 Cartographie
├── getAdvocacyDashboard()            → Vue 4 Plaidoyer
│
├── extractMisconceptions()
│   ├── Identifier les distracteurs les plus choisis
│   ├── Croiser avec idee_fausse_ciblee
│   └── Transmettre au COHRM si pertinent
│
└── autoSuspendExpiredQuestions()
    ├── Trouver questions dont date_revision_prevue < NOW()
    └── Passer en statut 'suspendu'
```

### 4.3. `dusscImportService.js`

Import de la banque CSV existante (144 questions).

```
Responsabilités :
├── importCSV(filePath)
│   ├── Parser le CSV (39 colonnes)
│   ├── Mapper les colonnes vers le schéma DB
│   │   ├── options_fr (JSON string) → JSON
│   │   ├── public_cible (";"-separated) → JSON array
│   │   ├── secteur_validateur (";"-separated) → JSON array
│   │   └── Mapper statut CSV → ENUM DB
│   ├── Résoudre module_id depuis le code module
│   ├── Valider chaque ligne (champs requis, format)
│   ├── Insérer en batch
│   └── Retourner rapport (importées, erreurs, doublons)
│
└── exportCSV(filters)
    └── Exporter au format identique au CSV source
```

---

## 5. Structure des fichiers

### 5.1. Backend

```
backend/
├── migrations/
│   └── 018_create_dussc_tables.sql          ✅ Créé
├── routes/
│   └── dussc.js                             Routes API (~800 lignes)
├── services/
│   ├── dusscQuizEngine.js                   Moteur de quiz (~300 lignes)
│   ├── dusscAnalyticsService.js             Analytics + psychométrie (~500 lignes)
│   └── dusscImportService.js                Import/export CSV (~200 lignes)
└── server.js                                + app.use('/api/dussc', dusscRoutes)
```

### 5.2. Admin (React)

```
admin/src/modules/dussc/
├── index.js                                 Point d'entrée du module
├── i18n.js                                  Configuration i18next
├── locales/
│   ├── fr/dussc.json                        Traductions FR
│   └── en/dussc.json                        Traductions EN
├── stores/
│   ├── useQuestionStore.js                  Zustand — questions
│   ├── useTemplateStore.js                  Zustand — templates
│   ├── useAnalyticsStore.js                 Zustand — dashboard
│   └── useAlertStore.js                     Zustand — alertes
├── services/
│   └── dusscApi.js                          Appels API (axios)
├── hooks/
│   ├── useQuestions.js                      CRUD questions
│   ├── useQuizTemplates.js                  CRUD templates
│   └── useDusscAnalytics.js                 Données dashboard
├── components/
│   ├── QuestionForm.jsx                     Formulaire création/édition
│   ├── QuestionList.jsx                     Liste filtrable
│   ├── QuestionPreview.jsx                  Prévisualisation quiz
│   ├── QuestionImport.jsx                   Import CSV
│   ├── TemplateBuilder.jsx                  Compositeur de parcours
│   ├── TemplateQuestionSelector.jsx         Sélection questions par bloc
│   ├── ModuleCard.jsx                       Carte module
│   ├── PersonaMatrix.jsx                    Matrice modules×personas
│   ├── AlertManager.jsx                     Gestion alertes M12
│   ├── DashboardOverview.jsx                Vue 1 — Pilotage
│   ├── DashboardLearning.jsx                Vue 2 — Apprentissage
│   ├── DashboardMap.jsx                     Vue 3 — Cartographie
│   ├── DashboardAdvocacy.jsx                Vue 4 — Plaidoyer
│   ├── PsychometricsTable.jsx               Indices par question
│   ├── AbandonCurve.jsx                     Graphe d'abandon
│   └── StatusBadge.jsx                      Badge de statut lifecycle
├── pages/
│   ├── DusscDashboard.jsx                   Page dashboard
│   ├── DusscQuestions.jsx                   Page banque de questions
│   ├── DusscTemplates.jsx                   Page templates
│   ├── DusscAlerts.jsx                      Page alertes
│   └── DusscSettings.jsx                    Page paramètres
└── utils/
    ├── constants.js                          Enums, régions, couleurs modules
    ├── scoring.js                           Calculs de score côté admin
    └── csvParser.js                         Parsing CSV
```

### 5.3. Frontend public (Next.js PWA)

```
frontend-next/app/defi/
├── page.tsx                                 Accueil : langue, profil, consentement
├── quiz/
│   └── page.tsx                             Parcours quiz adaptatif
├── result/
│   └── page.tsx                             Score, gain, certificat, partage
├── components/
│   ├── QuizCard.tsx                         Question + options (design prototype)
│   ├── FeedbackCard.tsx                     Retour pédagogique (correct/incorrect)
│   ├── ProgressRail.tsx                     Barre 4 domaines (identité visuelle)
│   ├── ConsentScreen.tsx                    Écran de consentement
│   ├── ProfileSelector.tsx                  Choix du persona
│   ├── LanguageSwitcher.tsx                 FR / EN
│   ├── ResultScreen.tsx                     Score + orientation
│   ├── CertificateGenerator.tsx             PDF côté client (jsPDF)
│   └── ShareButton.tsx                      Partage réseaux sociaux
├── hooks/
│   ├── useQuiz.ts                           État du quiz, navigation
│   ├── useOfflineSync.ts                    IndexedDB + sync différée
│   └── useTimer.ts                          Chrono par écran
├── lib/
│   ├── api.ts                               Client API
│   ├── offlineStore.ts                      IndexedDB wrapper
│   └── scoring.ts                           Calcul score côté client
├── manifest.json                            PWA manifest
└── sw.ts                                    Service worker (offline)
```

---

## 6. Parcours utilisateur — flux détaillé

```
PARTICIPANT                           SERVEUR
    │
    ├── Ouvre onehealth.cm/defi
    │   GET /api/dussc/public/personas
    │   GET /api/dussc/public/consent
    │
    ├── Choisit langue (FR/EN)
    ├── Choisit profil (ex: A2)
    ├── Lit et accepte le consentement
    │   POST /api/dussc/public/sessions
    │   { uuid, lang, profil, consent: true }
    │   ← { session_uuid, quiz: {...} }
    │
    ├── BLOC PRÉ-TEST (3 questions, SANS feedback)
    │   Pour chaque question :
    │   POST /api/dussc/public/sessions/:uuid/responses
    │   { question_id, answer, duration_ms, bloc: "pre_test" }
    │   ← { recorded: true }  (pas de correction)
    │
    ├── BLOC TRONC COMMUN (4 questions, AVEC feedback)
    │   Pour chaque question :
    │   POST .../responses
    │   { question_id, answer, duration_ms, bloc: "tronc_commun" }
    │   ← { is_correct, explication, action, correct_answer }
    │
    ├── BLOC PROFILÉ (4-6 questions, AVEC feedback)
    │   Questions filtrées par persona A2
    │   POST .../responses
    │   ← { is_correct, explication, action, correct_answer }
    │
    ├── BLOC POST-TEST (3 questions reformulées, SANS feedback)
    │   POST .../responses
    │   { question_id, answer, duration_ms, bloc: "post_test" }
    │   ← { recorded: true }
    │
    ├── Données démographiques minimales
    │   PATCH /api/dussc/public/sessions/:uuid
    │   { region, milieu, tranche_age, sexe? }
    │
    ├── Complétion
    │   POST /api/dussc/public/sessions/:uuid/complete
    │   ← { score_pre, score_post, gain, pct_post,
    │        total_correct, total_questions,
    │        certificate_data }
    │
    └── Écran de résultat
        ├── Score + progression visualisée
        ├── Fiche récapitulative (messages clés)
        ├── Certificat PDF (généré localement, nom jamais envoyé)
        ├── Bouton partage (WhatsApp, copie lien)
        └── Lien vers OH E-Learning
```

### 6.1. Mode offline (PWA)

```
PARTICIPANT (hors ligne)              INDEXEDDB LOCAL
    │
    ├── Ouvre l'app (service worker sert le cache)
    ├── Quiz chargé depuis IndexedDB (pré-chargé)
    ├── Répond aux questions (stocké localement)
    ├── Voit les feedbacks (pré-calculés côté client)
    ├── Obtient son score (calculé localement)
    │
    └── Retour en ligne :
        POST /api/dussc/public/sessions/sync
        { session, responses[], events[] }
        ← { synced: true, server_score: {...} }
```

---

## 7. Interopérabilité avec les modules existants

### 7.1. COHRM (Rumeurs)

```
Flux hebdomadaire automatique :
dussc_responses
  → Identifier les distracteurs les plus choisis
  → Croiser avec idee_fausse_ciblee
  → Si taux de sélection > 40% = idée fausse persistante
  → Créer une entrée dans cohrm_rumors
    { source: 'dussc', title: 'Idée fausse persistante: ...',
      priority: 'medium', status: 'pending' }
```

### 7.2. E-Learning

```
Écran de résultat :
  → Si score_post < 60% sur un module :
    "Approfondir vos connaissances → cours E-Learning"
    Lien vers le cours correspondant au module
```

---

## 8. Contraintes de performance (non négociables)

| Contrainte | Valeur | Justification |
|---|---|---|
| Charge initiale page | < 300 Ko | Budget data, 3G dégradé |
| Parcours complet | < 1 Mo | Coût forfait mobile |
| Temps d'affichage | < 3 secondes (3G) | Taux d'abandon |
| Zone tactile minimum | 44px | Accessibilité mobile |
| Police | system-ui (pas de download) | Poids zéro |
| Images | WebP compressé, max 50 Ko | Budget data |
| JS framework public | Vanilla ou Preact (3 Ko) | Budget poids |

---

## 9. Sécurité et conformité

### 9.1. Protection des données (loi 2024/017)

- Consentement explicite avant toute question
- 7 champs démographiques max, chacun justifié
- UUID session sans lien appareil
- Certificat généré côté client (nom jamais transmis)
- Données brutes : 24 mois puis anonymisation irréversible
- Seuil de publication : ≥ 30 observations par croisement
- Pas de GPS, pas de nom, pas de téléphone, pas d'email obligatoire

### 9.2. Sécurité applicative

- Rate limiting sur routes publiques (anti-bot)
- Validation express-validator sur toutes les entrées
- Parameterized queries (mysql2, pas de SQL injection)
- Aucune donnée sensible dans les logs
- HTTPS obligatoire (déjà en place)

---

## 10. Plan d'implémentation — Ordre recommandé

### Phase A : Fondations (Backend)
1. Migration SQL (tables + données initiales) ✅
2. Routes CRUD questions + import CSV
3. Service d'import CSV (charger les 144 questions)
4. Routes CRUD modules, personas, templates
5. Quiz engine (composition + évaluation)
6. Routes publiques (quiz, sessions, responses)
7. Service analytics (stats hebdo + psychométrie)
8. Montage dans server.js

### Phase B : Admin (React)
1. Structure module (stores, services, i18n)
2. Page banque de questions (CRUD + filtres)
3. Import CSV
4. Preview question (rendu quiz)
5. Template builder (composition parcours)
6. Dashboard analytique (4 vues)
7. Gestion alertes M12
8. Intégration dans AdminApp

### Phase C : Public (Next.js PWA)
1. Pages /defi (accueil, quiz, résultat)
2. Composants quiz (design du prototype HTML)
3. Logique de parcours (blocs, feedback, score)
4. Certificat PDF côté client
5. PWA manifest + service worker
6. Mode offline (IndexedDB + sync)
7. Optimisation performance (< 300 Ko)
