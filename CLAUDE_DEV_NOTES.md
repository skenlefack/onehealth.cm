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
│   └── certificates/page.tsx   # Mes certificats
└── learn/                      # TODO: Player de cours
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

### TODO - Prochaines étapes

1. **Player de cours** (`/learn/[courseSlug]/[lessonId]`)
   - Lecteur vidéo avec tracking
   - Affichage contenu texte/PDF
   - Navigation entre leçons
   - Barre de progression

2. **Interface Quiz apprenant**
   - Page de quiz (`/quiz/[quizId]`)
   - Timer
   - Renderers par type de question
   - Page résultats

3. **Génération PDF certificats**
   - Template PDF avec PDFKit
   - QR code de vérification
   - Téléchargement

4. **Page "Mon apprentissage"**
   - Cours en cours
   - Progression détaillée
   - Reprendre où on s'est arrêté

### Bugs corrigés (session du 15/01/2026)

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

### Fichiers clés à connaître

- `backend/routes/elearning.js` - Toutes les routes API
- `backend/migrations/005_create_elearning_tables.sql` - Schéma DB
- `admin/src/AdminApp.jsx` - Interface admin complète
- `frontend-next/lib/api.ts` - Fonctions API frontend
- `frontend-next/lib/types.ts` - Types TypeScript
- `frontend-next/lib/translations.ts` - Traductions FR/EN
