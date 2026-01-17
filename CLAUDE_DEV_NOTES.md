# Notes de Développement - One Health CMS

## Module E-Learning - État actuel

### Phases complétées

- **Phase 1**: MVP - Cours, Modules, Leçons (FAIT)
- **Phase 2**: Quiz & Évaluations (FAIT)
- **Phase 3**: Parcours diplômants & Certificats (FAIT)

### Structure du projet

```
onehealth-cms/
├── backend/           # Express.js + MySQL (port 5000)
├── frontend-next/     # Next.js 14 App Router (port 3002)
├── admin/             # React Admin Panel (port 3001)
└── frontend/          # Ancien frontend (non utilisé)
```

### Base de données E-Learning

Tables créées dans `backend/migrations/005_create_elearning_tables.sql`:
- `elearning_categories` - Catégories (8 seedées)
- `courses` - Cours
- `course_modules` - Modules
- `lessons` - Leçons
- `questions` - Banque de questions
- `quizzes` - Quiz
- `quiz_questions` - Liaison quiz-questions
- `learning_paths` - Parcours diplômants
- `learning_path_courses` - Liaison parcours-cours
- `enrollments` - Inscriptions
- `lesson_progress` - Progression leçons
- `quiz_attempts` - Tentatives quiz
- `certificates` - Certificats

### Routes API Backend

Fichier: `backend/routes/elearning.js` (~3500 lignes)

**Principales routes**:
- `GET/POST /api/elearning/courses` - CRUD cours
- `GET/POST /api/elearning/modules` - CRUD modules
- `GET/POST /api/elearning/lessons` - CRUD leçons
- `GET/POST /api/elearning/questions` - Banque de questions
- `GET/POST /api/elearning/quizzes` - CRUD quiz
- `POST /api/elearning/quizzes/:id/start` - Démarrer quiz
- `POST /api/elearning/attempts/:id/submit` - Soumettre réponses
- `GET/POST /api/elearning/paths` - Parcours diplômants
- `POST /api/elearning/enroll` - Inscription
- `GET /api/elearning/certificates/verify/:code` - Vérification publique

### Pages Frontend

```
frontend-next/app/[lang]/oh-elearning/
├── page.tsx                    # Accueil E-Learning
├── courses/
│   ├── page.tsx                # Liste des cours
│   └── [slug]/page.tsx         # Détail cours
├── paths/
│   ├── page.tsx                # Liste des parcours
│   └── [slug]/page.tsx         # Détail parcours
├── certificate/
│   └── verify/
│       ├── page.tsx            # Formulaire vérification
│       └── [code]/page.tsx     # Résultat vérification
├── my-learning/
│   ├── page.tsx                # Tableau de bord apprentissage
│   └── certificates/page.tsx   # Mes certificats
├── learn/
│   └── [courseSlug]/
│       └── [lessonId]/page.tsx # Player de cours
└── quiz/
    └── [quizId]/
        ├── page.tsx            # Introduction quiz
        ├── take/page.tsx       # Passer le quiz
        └── results/
            └── [attemptId]/page.tsx  # Resultats
```

### Interface Admin

Fichier unique: `admin/src/AdminApp.jsx`

**Onglets E-Learning**:
- Dashboard (stats)
- Cours (CRUD)
- Modules & Leçons
- Questions
- Quiz
- Parcours
- Inscriptions
- Certificats
- Catégories

### Données de test créées

**Cours**: "Introduction à One Health"
- Slug: `introduction-a-one-health`
- 1 module, 2 leçons
- Quiz avec 3 questions

### Identifiants

**Admin**:
- Email: `admin@onehealth.cm`
- Password: `admin123`

### Améliorations Player de cours (session du 16/01/2026)

**Nouveau composant VideoPlayer** (`components/elearning/VideoPlayer.tsx`):
- Support vidéos locales (upload), YouTube et Vimeo
- Tracking de progression (secondes uniques regardées)
- Sauvegarde automatique de la progression (toutes les 10s)
- Reprise de lecture là où l'utilisateur s'était arrêté
- Contrôles complets : play/pause, volume, vitesse de lecture (0.5x-2x), plein écran
- Détection automatique de complétion (80% regardé par défaut)
- Interface responsive avec contrôles qui se masquent automatiquement

**Contexte d'authentification** (`lib/AuthContext.tsx`):
- Gestion du token JWT et de l'utilisateur connecté
- Persistance dans localStorage
- Vérification automatique du token au démarrage

**Page de leçon améliorée** (`app/[lang]/oh-elearning/learn/[courseSlug]/[lessonId]/page.tsx`):
- Intégration du nouveau VideoPlayer
- Sauvegarde automatique de la progression vidéo pour les utilisateurs connectés
- Affichage du pourcentage de vidéo regardé
- Modal de connexion pour les utilisateurs non authentifiés
- Affichage du nom d'utilisateur dans la barre supérieure

### TODO - Prochaines étapes

1. ~~**Player de cours**~~ ✅ FAIT
   - ~~Lecteur vidéo avec tracking~~
   - ~~Affichage contenu texte/PDF~~
   - ~~Navigation entre leçons~~
   - ~~Barre de progression~~

2. ~~**Interface Quiz apprenant**~~ ✅ FAIT
   - ~~Page de quiz (`/quiz/[quizId]`)~~
   - ~~Timer~~
   - ~~Renderers par type de question~~
   - ~~Page resultats~~

3. ~~**Generation PDF certificats**~~ ✅ FAIT
   - ~~Template PDF avec PDFKit~~
   - ~~QR code de verification~~
   - ~~Telechargement~~

4. ~~**Page "Mon apprentissage"**~~ ✅ FAIT
   - ~~Cours en cours~~
   - ~~Progression detaillee~~
   - ~~Reprendre ou on s'est arrete~~

### Generation PDF Certificats (session du 17/01/2026)

**Service de generation** (`backend/services/certificateService.js`):
- Generation PDF avec PDFKit (format A4 paysage)
- Design professionnel avec bordures decoratives et coins
- QR code integre pour verification (via qrcode library)
- Support bilingue (FR/EN)
- Affichage: titre, nom recipient, cours/parcours, score, date, signataire
- Numero de certificat et code de verification en pied de page

**Route de telechargement** (`GET /api/elearning/certificates/:id/download`):
- Generation PDF a la volee (pas de stockage)
- Parameter `?lang=fr|en` pour la langue
- Headers Content-Disposition pour le telechargement
- Verification des droits d'acces (proprietaire ou admin)

**Frontend** (`frontend-next/lib/api.ts`):
- Fonction `downloadCertificatePDF(certificateId, token, lang)`
- Gestion du blob et telechargement via link temporaire

**Page Mes Certificats** (`app/[lang]/oh-elearning/my-learning/certificates/page.tsx`):
- Bouton "Telecharger" avec spinner de chargement
- Telechargement direct du PDF

### Interface Quiz apprenant (session du 17/01/2026)

**Page d'introduction quiz** (`app/[lang]/oh-elearning/quiz/[quizId]/page.tsx`):
- Affichage des details du quiz (titre, description, parametres)
- Statistiques: nombre de questions, temps limite, score requis, tentatives max
- Affichage des parametres (questions melangees, afficher reponses, etc.)
- Meilleur score de l'utilisateur
- Historique des tentatives avec liens vers les resultats
- Bouton "Commencer" ou "Reprendre" selon l'etat

**Page de quiz** (`app/[lang]/oh-elearning/quiz/[quizId]/take/page.tsx`):
- Tous les types de questions supportes:
  - MCQ (choix unique)
  - Multiple select (choix multiples)
  - True/False (vrai/faux)
  - Short answer (reponse courte)
  - Fill in the blank (remplir le blanc)
  - Matching (association)
- Timer avec code couleur (vert > jaune > rouge)
- Barre laterale de navigation entre questions
- Indicateur de progression
- Reprise automatique des tentatives en cours
- Banniere "Reprise" quand on reprend une tentative
- Soumission automatique a l'expiration du temps
- Modal de confirmation avant soumission

**Page de resultats** (`app/[lang]/oh-elearning/quiz/[quizId]/results/[attemptId]/page.tsx`):
- Score en cercle avec animation
- Indicateur reussi/echoue
- Grille de statistiques (bonnes reponses, mauvaises, score requis, temps)
- Revue des questions avec reponses
- Affichage des explications (si active)
- Bouton "Reprendre le quiz" (si autorise)
- Conseils pour reussir (si echoue)

### Page Mon Apprentissage (session du 17/01/2026)

**Page principale** (`app/[lang]/oh-elearning/my-learning/page.tsx`):
- Integration AuthContext pour authentification
- Redirection automatique vers login si non connecte
- Chargement des inscriptions et statistiques via API

**Section statistiques**:
- 4 cartes: Cours inscrits, En cours, Termines, Temps total
- Icones et couleurs distinctes par metrique
- Type `UserLearningStats` dans types.ts

**Section "Continuer l'apprentissage"**:
- Top 3 cours accedes recemment (status in_progress)
- Barre de progression visuelle
- Formatage date relative (Aujourd'hui, Hier, Il y a X jours)
- Lien direct vers le player de cours

**Liste des inscriptions**:
- Onglets filtrage: Tous / En cours / Termines
- Cartes avec thumbnail, titre, progression, derniere activite
- Badge de status colore (enrolled, in_progress, completed)
- Bouton "Continuer" ou "Revoir" selon status

**API Frontend** (`lib/api.ts`):
- Fonction `getUserLearningStats(token)` pour les statistiques

### Bugs corriges (session du 15/01/2026)

1. Route POST questions: colonnes manquantes corrigées
2. Route POST quizzes: colonnes inexistantes supprimées
3. Route POST quiz/questions: update total_points supprimé
4. Fonction `enrollInPath` dupliquée supprimée dans api.ts
5. Page vérification certificat: structure API corrigée

### Commandes utiles

```bash
# Démarrer tout
cd backend && npm run dev
cd frontend-next && npm run dev
cd admin && npm start

# Migrations
cd backend && node migrations/run.js

# Créer admin
cd backend && node create-admin.js
```

### Fichiers cles a connaitre

- `backend/routes/elearning.js` - Toutes les routes API
- `backend/migrations/005_create_elearning_tables.sql` - Schema DB
- `admin/src/AdminApp.jsx` - Interface admin complete
- `frontend-next/lib/api.ts` - Fonctions API frontend
- `frontend-next/lib/types.ts` - Types TypeScript
- `frontend-next/lib/translations.ts` - Traductions FR/EN
- `frontend-next/lib/AuthContext.tsx` - Contexte d'authentification
- `frontend-next/components/elearning/VideoPlayer.tsx` - Player video avec tracking
- `frontend-next/app/[lang]/oh-elearning/learn/[courseSlug]/[lessonId]/page.tsx` - Page player de cours
- `frontend-next/app/[lang]/oh-elearning/quiz/[quizId]/page.tsx` - Page intro quiz
- `frontend-next/app/[lang]/oh-elearning/quiz/[quizId]/take/page.tsx` - Page de quiz (passer le quiz)
- `frontend-next/app/[lang]/oh-elearning/quiz/[quizId]/results/[attemptId]/page.tsx` - Page resultats quiz
- `backend/services/certificateService.js` - Generation PDF certificats avec QR code
- `frontend-next/app/[lang]/oh-elearning/my-learning/certificates/page.tsx` - Page mes certificats
- `frontend-next/app/[lang]/oh-elearning/my-learning/page.tsx` - Tableau de bord apprentissage
