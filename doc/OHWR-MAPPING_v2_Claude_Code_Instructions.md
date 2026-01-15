# 🗺️ OHWR-MAPPING v2 - Instructions Claude Code

## Cartographie des Ressources One Health
### Humaines • Matérielles • Organisationnelles • Documentaires

---

## 📋 Vue d'Ensemble - Les 4 Piliers

| Pilier | Icône | Couleur | Contenu |
|--------|-------|---------|---------|
| **Humaines** | 👤 | 🟢 `#27AE60` | Experts, professionnels, chercheurs |
| **Matérielles** | 🔬 | 🔵 `#3498DB` | Laboratoires, équipements, infrastructures |
| **Organisationnelles** | 🏛️ | 🟠 `#E67E22` | Institutions, ONG, réseaux |
| **Documentaires** | 📚 | 🟣 `#9B59B6` | Guides, articles, thèses, formations |

**Branding OHWR-MAPPING**: Vert olive `#8B9A2D`

---

## 🔷 PHASE 1: Base de Données (4 Piliers)

```
Crée les tables MySQL pour OHWR-MAPPING avec les 4 piliers de ressources One Health.

=== PILIER 1: RESSOURCES HUMAINES ===
CREATE TABLE human_resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  title VARCHAR(200),
  category ENUM('health_human', 'health_animal', 'environment', 'laboratory', 'coordination') NOT NULL,
  organization_id INT,
  email VARCHAR(200),
  phone VARCHAR(50),
  photo VARCHAR(500),
  biography LONGTEXT,
  expertise_domains JSON,
  qualifications JSON,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  region VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
  INDEX idx_category (category),
  INDEX idx_region (region),
  INDEX idx_coords (latitude, longitude),
  FULLTEXT idx_search (first_name, last_name, title, biography)
);

=== PILIER 2: RESSOURCES MATÉRIELLES ===
CREATE TABLE material_resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('laboratory', 'equipment', 'infrastructure', 'vehicle', 'storage') NOT NULL,
  description TEXT,
  specifications JSON,
  capacity VARCHAR(100),
  organization_id INT,
  manager_id INT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  region VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  status ENUM('available', 'maintenance', 'unavailable') DEFAULT 'available',
  certifications JSON,
  photos JSON,
  contact_email VARCHAR(200),
  contact_phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
  FOREIGN KEY (manager_id) REFERENCES human_resources(id) ON DELETE SET NULL,
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_region (region)
);

=== PILIER 3: RESSOURCES ORGANISATIONNELLES ===
CREATE TABLE organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  acronym VARCHAR(20),
  type ENUM('government', 'academic', 'international', 'ngo', 'network', 'private') NOT NULL,
  description TEXT,
  mission TEXT,
  logo VARCHAR(500),
  website VARCHAR(255),
  parent_organization_id INT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  region VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  contact_email VARCHAR(200),
  contact_phone VARCHAR(50),
  social_links JSON,
  domains JSON,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
  INDEX idx_type (type),
  INDEX idx_region (region)
);

=== PILIER 4: RESSOURCES DOCUMENTAIRES (NOUVEAU) ===
CREATE TABLE document_resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  type ENUM('guide', 'protocol', 'article', 'thesis', 'awareness', 'training', 'report', 'other') NOT NULL,
  description TEXT,
  content LONGTEXT,
  file_path VARCHAR(500),
  file_type VARCHAR(100),
  file_size BIGINT,
  thumbnail VARCHAR(500),
  authors JSON,
  organization_id INT,
  publication_date DATE,
  language VARCHAR(10) DEFAULT 'fr',
  themes JSON,
  doi VARCHAR(100),
  isbn VARCHAR(20),
  pages_count INT,
  video_url VARCHAR(500),
  video_duration INT,
  access_level ENUM('public', 'member', 'editor', 'admin') DEFAULT 'public',
  is_featured BOOLEAN DEFAULT false,
  view_count INT DEFAULT 0,
  download_count INT DEFAULT 0,
  version VARCHAR(20) DEFAULT '1.0',
  parent_document_id INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
  FOREIGN KEY (parent_document_id) REFERENCES document_resources(id) ON DELETE SET NULL,
  INDEX idx_type (type),
  INDEX idx_language (language),
  INDEX idx_access (access_level),
  INDEX idx_featured (is_featured),
  FULLTEXT idx_search (title, description, content)
);

=== TABLES DE RÉFÉRENCE ===
CREATE TABLE document_themes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  parent_theme_id INT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  FOREIGN KEY (parent_theme_id) REFERENCES document_themes(id) ON DELETE SET NULL
);

CREATE TABLE expertise_domains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  category ENUM('health', 'animal', 'environment', 'laboratory', 'management') NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE regions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL,
  coordinates JSON,
  center_lat DECIMAL(10,8),
  center_lng DECIMAL(11,8)
);

=== TABLES DE LIAISON ===
CREATE TABLE expert_organization (
  expert_id INT NOT NULL,
  organization_id INT NOT NULL,
  role VARCHAR(200),
  start_date DATE,
  is_primary BOOLEAN DEFAULT false,
  PRIMARY KEY (expert_id, organization_id),
  FOREIGN KEY (expert_id) REFERENCES human_resources(id) ON DELETE CASCADE,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE expert_expertise (
  expert_id INT NOT NULL,
  expertise_domain_id INT NOT NULL,
  level ENUM('junior', 'intermediate', 'senior', 'expert') DEFAULT 'intermediate',
  PRIMARY KEY (expert_id, expertise_domain_id),
  FOREIGN KEY (expert_id) REFERENCES human_resources(id) ON DELETE CASCADE,
  FOREIGN KEY (expertise_domain_id) REFERENCES expertise_domains(id) ON DELETE CASCADE
);

CREATE TABLE document_author (
  document_id INT NOT NULL,
  expert_id INT,
  author_name VARCHAR(200) NOT NULL,
  author_order INT DEFAULT 1,
  FOREIGN KEY (document_id) REFERENCES document_resources(id) ON DELETE CASCADE,
  FOREIGN KEY (expert_id) REFERENCES human_resources(id) ON DELETE SET NULL
);

=== DONNÉES INITIALES ===
-- Insérer les 10 régions du Cameroun
INSERT INTO regions (name, code, center_lat, center_lng) VALUES
('Adamaoua', 'AD', 7.3167, 13.5833),
('Centre', 'CE', 3.8667, 11.5167),
('Est', 'ES', 4.0333, 14.1500),
('Extrême-Nord', 'EN', 10.5833, 14.0833),
('Littoral', 'LT', 4.0500, 9.7000),
('Nord', 'NO', 9.3000, 13.3833),
('Nord-Ouest', 'NW', 6.0667, 10.1500),
('Ouest', 'OU', 5.4667, 10.4167),
('Sud', 'SU', 2.8333, 10.9167),
('Sud-Ouest', 'SW', 4.9500, 9.2333);

-- Types de documents
-- guide, protocol, article, thesis, awareness, training, report, other
```

---

## 🔷 PHASE 2: Backend API (4 Piliers)

```
Développe l'API REST complète pour OHWR-MAPPING avec les 4 piliers.

=== STRUCTURE DES FICHIERS ===

backend/
├── models/
│   ├── HumanResource.js
│   ├── MaterialResource.js
│   ├── Organization.js
│   ├── DocumentResource.js      // NOUVEAU
│   ├── DocumentTheme.js         // NOUVEAU
│   ├── ExpertiseDomain.js
│   └── Region.js
├── controllers/
│   ├── humanResourceController.js
│   ├── materialResourceController.js
│   ├── organizationController.js
│   ├── documentResourceController.js  // NOUVEAU
│   ├── documentThemeController.js     // NOUVEAU
│   ├── mapController.js
│   └── statsController.js
├── routes/
│   └── mapping.js
└── middleware/
    └── accessControl.js

=== NOUVEAU: documentResourceController.js ===

Créer le controller avec les méthodes:

1) getAll(req, res):
   - Pagination: page, limit
   - Filtres: type, theme, language, year, organization_id, access_level
   - Tri: publication_date, title, view_count, download_count
   - Retourne: documents avec auteurs et organisation

2) getById(req, res):
   - Récupère par ID ou slug
   - Incrémente view_count
   - Inclut: auteurs (avec profils experts si liés), organisation, documents similaires

3) getByType(req, res):
   - Filtre par type de document
   - Types: guide, protocol, article, thesis, awareness, training, report, other

4) getFeatured(req, res):
   - Documents avec is_featured = true
   - Limite configurable

5) getRecent(req, res):
   - Derniers documents ajoutés
   - Limite configurable

6) search(req, res):
   - Recherche full-text sur title, description, content
   - Filtres additionnels
   - Highlighting des résultats

7) create(req, res):
   - Validation des champs requis
   - Génération du slug automatique
   - Gestion des auteurs (JSON)
   - Niveau d'accès: editor+

8) update(req, res):
   - Mise à jour partielle
   - Gestion des versions si modification majeure

9) delete(req, res):
   - Soft delete (is_active = false) ou hard delete
   - Niveau d'accès: admin

10) download(req, res):
    - Vérifie le niveau d'accès
    - Incrémente download_count
    - Retourne le fichier ou URL signée

11) uploadFile(req, res):
    - Upload avec Multer
    - Types acceptés: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, images, vidéos
    - Génération thumbnail pour PDF (première page)
    - Limite: 50MB documents, 500MB vidéos

=== ROUTES: /routes/mapping.js ===

Ajouter les endpoints pour les documents:

// Documents
router.get('/documents', documentResourceController.getAll);
router.get('/documents/search', documentResourceController.search);
router.get('/documents/featured', documentResourceController.getFeatured);
router.get('/documents/recent', documentResourceController.getRecent);
router.get('/documents/type/:type', documentResourceController.getByType);
router.get('/documents/:slug', documentResourceController.getById);
router.get('/documents/:id/download', documentResourceController.download);
router.post('/documents', authMiddleware, editorMiddleware, documentResourceController.create);
router.post('/documents/upload', authMiddleware, editorMiddleware, upload.single('file'), documentResourceController.uploadFile);
router.put('/documents/:id', authMiddleware, editorMiddleware, documentResourceController.update);
router.delete('/documents/:id', authMiddleware, adminMiddleware, documentResourceController.delete);

// Thèmes documentaires
router.get('/documents/themes', documentThemeController.getAll);
router.get('/documents/themes/tree', documentThemeController.getTree);
router.post('/documents/themes', authMiddleware, adminMiddleware, documentThemeController.create);

=== MISE À JOUR: mapController.js ===

Ajouter les stats documentaires dans getStats():

{
  human_resources: { total: X, by_category: {...}, by_region: {...} },
  material_resources: { total: X, by_type: {...}, by_status: {...} },
  organizations: { total: X, by_type: {...} },
  documents: {  // NOUVEAU
    total: X,
    by_type: {
      guide: X,
      protocol: X,
      article: X,
      thesis: X,
      awareness: X,
      training: X,
      report: X,
      other: X
    },
    by_language: { fr: X, en: X },
    total_downloads: X,
    total_views: X
  }
}

=== MIDDLEWARE: accessControl.js ===

Vérifier l'accès aux documents selon access_level:
- public: tous
- member: utilisateurs connectés
- editor: rôle éditeur ou admin
- admin: admin uniquement
```

---

## 🔷 PHASE 3: Admin - Ressources Humaines

```
Crée le module admin pour les experts One Health.
Couleur thématique: Vert #27AE60

Composants:
1) ExpertsManager.jsx - Liste avec filtres (catégorie, région, organisation, domaine)
2) ExpertForm.jsx - Formulaire complet avec:
   - Infos personnelles
   - Photo avec crop
   - Biographie (TinyMCE)
   - Domaines d'expertise (multi-select)
   - Qualifications (liste dynamique)
   - Localisation (carte avec marqueur draggable)
3) ExpertPreview.jsx - Aperçu du profil

Voir documentation détaillée Phase 3 dans le document Word.
```

---

## 🔷 PHASE 4: Admin - Ressources Matérielles

```
Crée le module admin pour les équipements et infrastructures.
Couleur thématique: Bleu #3498DB

Composants:
1) MaterialsManager.jsx - Vue grille/tableau avec filtres (type, statut, région)
2) MaterialForm.jsx - Formulaire avec:
   - Infos générales
   - Spécifications dynamiques selon le type (laboratoire, équipement, etc.)
   - Organisation et responsable
   - Galerie photos
   - Certifications
   - Localisation carte
   - Statut de disponibilité
3) MaterialDetail.jsx - Vue détaillée

Voir documentation détaillée Phase 4 dans le document Word.
```

---

## 🔷 PHASE 5: Admin - Organisations

```
Crée le module admin pour les institutions et réseaux.
Couleur thématique: Orange #E67E22

Composants:
1) OrganizationsManager.jsx - Vue liste + arborescence
2) OrganizationForm.jsx - Formulaire avec:
   - Logo et identité
   - Description et mission (TinyMCE)
   - Hiérarchie (organisation parente)
   - Contacts et réseaux sociaux
   - Localisation carte
3) OrganizationHierarchy.jsx - Vue arborescente interactive
4) OrganizationAffiliations.jsx - Gestion des affiliations experts

Voir documentation détaillée Phase 5 dans le document Word.
```

---

## 🔷 PHASE 6: Admin - Ressources Documentaires (NOUVEAU)

```
Crée le module admin pour gérer la bibliothèque documentaire OHWR-MAPPING.
Couleur thématique: Violet #9B59B6

=== COMPOSANTS À CRÉER ===

1) DocumentsManager.jsx:
   - Header "📚 Bibliothèque Documentaire" + bouton "+ Nouveau Document"
   - Toggle vue: Grille / Tableau / Liste compacte
   - Barre de recherche full-text
   - Filtres avancés:
     * Type de document (dropdown avec icônes):
       - 📋 Guide / Protocole
       - 📄 Article Scientifique
       - 🎓 Thèse / Mémoire
       - 📢 Matériel de Sensibilisation
       - 🎬 Document de Formation
       - 📊 Rapport
       - 📁 Autre
     * Thème (multi-select hiérarchique)
     * Langue (FR / EN / Bilingue)
     * Année de publication (range picker)
     * Organisation éditrice
     * Niveau d'accès
     * Statut (actif / archivé)
   - Vue Grille:
     * Carte avec thumbnail/icône type
     * Titre (tronqué)
     * Badge type coloré
     * Date de publication
     * Compteurs: 👁️ vues, ⬇️ téléchargements
   - Vue Tableau:
     * Colonnes: Thumbnail, Titre, Type, Auteurs, Date, Vues, Téléchargements, Actions
     * Tri sur chaque colonne
   - Actions par document: Voir, Éditer, Télécharger, Dupliquer, Archiver/Supprimer
   - Sélection multiple pour actions groupées
   - Pagination

2) DocumentForm.jsx (création et édition):
   
   ONGLET "Informations de base":
   - Titre (required, max 500 chars)
   - Slug (auto-généré, éditable)
   - Type de document (required, dropdown avec icônes)
   - Description courte (textarea, 500 chars max)
   - Contenu / Résumé (TinyMCE - pour résumé détaillé ou contenu complet)
   
   ONGLET "Fichier":
   - Zone upload drag & drop:
     * Types acceptés: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, images (PNG, JPG), vidéos (MP4, WebM)
     * Limite: 50MB pour documents, 10MB images, 500MB vidéos
     * Affichage: nom fichier, taille, type MIME
     * Bouton supprimer/remplacer
   - OU Lien vidéo externe:
     * Input URL (YouTube, Vimeo, autre)
     * Détection automatique du provider
     * Aperçu intégré
   - Thumbnail / Image de couverture:
     * Auto-généré pour PDF (première page)
     * Upload manuel possible
     * Crop et redimensionnement
   
   ONGLET "Métadonnées":
   - Auteurs (liste dynamique):
     * Champ nom auteur (texte libre)
     * Recherche expert existant (autocomplete)
     * Si expert trouvé: liaison avec profil
     * Ordre des auteurs (drag & drop)
     * Bouton + ajouter auteur
   - Organisation éditrice (autocomplete vers organizations)
   - Date de publication (date picker)
   - Langue (FR / EN / Bilingue / Autre)
   - Thèmes (multi-select avec tags, hiérarchique)
   - Nombre de pages (pour documents)
   
   - Champs conditionnels selon le type:
     * SI type = 'article':
       - DOI (avec validation format)
       - Nom du journal
       - Volume, Numéro, Pages
       - Lien vers publication originale
     * SI type = 'thesis':
       - Université / Institution
       - Directeur de thèse
       - Niveau (Doctorat / Master / Licence)
       - Année de soutenance
     * SI type = 'training' ET vidéo:
       - Durée de la vidéo (auto-détecté ou manuel)
       - Chapitres (liste dynamique avec timestamps)
   
   ONGLET "Accès et Publication":
   - Niveau d'accès (radio buttons):
     * 🌍 Public - Visible et téléchargeable par tous
     * 👤 Membre - Réservé aux utilisateurs connectés
     * ✏️ Éditeur - Réservé aux éditeurs et admins
     * 🔒 Admin - Réservé aux administrateurs
   - Toggle "En vedette" (affiché en priorité)
   - Toggle "Actif" (visible sur le site)
   - Date de publication programmée (optionnel)
   
   ONGLET "Versions" (si édition d'un document existant):
   - Liste des versions précédentes
   - Upload nouvelle version:
     * Nouveau fichier
     * Notes de version
     * Incrémentation auto (1.0 → 1.1 ou 2.0)
   - Télécharger version précédente
   
   BARRE D'ACTIONS:
   - Bouton "Enregistrer brouillon"
   - Bouton "Publier" (principal)
   - Bouton "Aperçu"
   - Bouton "Annuler"

3) DocumentPreview.jsx:
   - Aperçu du document tel qu'il apparaîtra sur le site public
   - Prévisualisation PDF intégrée (react-pdf) avec navigation pages
   - Lecteur vidéo pour formations
   - Galerie pour images de sensibilisation
   - Mode plein écran

4) DocumentThemesManager.jsx:
   - Gestion CRUD des thèmes documentaires
   - Vue arborescente (thèmes parents/enfants)
   - Drag & drop pour réorganiser
   - Pour chaque thème:
     * Nom
     * Slug (auto)
     * Description
     * Icône (picker)
     * Couleur
     * Thème parent (optionnel)
   - Compteur de documents par thème

5) DocumentStats.jsx (widget dashboard):
   - Total documents par type (bar chart)
   - Top 10 documents les plus consultés
   - Top 10 documents les plus téléchargés
   - Évolution des ajouts (line chart, 12 derniers mois)
   - Répartition par langue (pie chart)
   - Répartition par niveau d'accès

=== STYLE ET UX ===
- Glassmorphism cohérent avec le reste de l'admin
- Couleur dominante: Violet #9B59B6 pour les accents
- Support dark/light mode
- Animations Framer Motion:
  * Transition entre vues (grille/tableau)
  * Animation des cartes au survol
  * Feedback visuel lors de l'upload
- Responsive (tablette minimum pour l'admin)
- Drag & drop natif avec react-beautiful-dnd ou dnd-kit
```

---

## 🔷 PHASE 7: Site Public - Interface Complète (4 Piliers)

```
Crée l'interface publique de OHWR-MAPPING avec les 4 piliers.

=== MISE À JOUR: MappingHome.jsx (/mapping) ===

Hero Section:
- Titre "OHWR-MAPPING" avec animation
- Sous-titre "Cartographie des Ressources One Health du Cameroun"
- Barre de recherche globale (recherche sur les 4 piliers)

Section "Explorer par Type" - MAINTENANT 4 CARTES:
- 👤 Ressources Humaines (vert #27AE60)
- 🔬 Ressources Matérielles (bleu #3498DB)
- 🏛️ Organisations (orange #E67E22)
- 📚 Documents (violet #9B59B6) ← NOUVEAU

Statistiques globales:
- X experts
- X équipements
- X organisations
- X documents ← NOUVEAU

=== NOUVELLES PAGES DOCUMENTAIRES ===

1) DocumentsLibrary.jsx (/mapping/documents):
   - Hero: "📚 Bibliothèque One Health" + recherche
   - Section catégories rapides (cartes par type de document)
   - Sidebar filtres:
     * Type de document (checkboxes avec icônes)
     * Thèmes (arborescence avec expand/collapse)
     * Langue
     * Année (slider range)
     * Organisation
   - Grille de documents:
     * Thumbnail ou icône type
     * Titre
     * Badge type (coloré selon type)
     * Auteurs (max 2 affichés + "et al.")
     * Date de publication
     * Compteurs (vues, téléchargements)
     * Bouton télécharger (si accès)
   - Toggle vue grille/liste
   - Tri: récent, populaire, titre A-Z
   - Pagination ou infinite scroll

2) DocumentDetail.jsx (/mapping/documents/:slug):
   
   Layout 2 colonnes:
   
   COLONNE PRINCIPALE:
   - Titre complet
   - Badges: type, langue
   - Date de publication
   - Auteurs (avec liens vers profils si experts)
   - Organisation éditrice (avec lien)
   - Description / Résumé
   - Prévisualisation:
     * PDF: Viewer intégré (premières pages, bouton "Voir tout")
     * Vidéo: Lecteur embed
     * Image: Galerie lightbox
   
   SIDEBAR:
   - Bouton principal "⬇️ Télécharger" (ou "🔒 Connexion requise")
   - Infos fichier: format, taille, pages
   - Thèmes (tags cliquables)
   - DOI (si article, avec bouton copier)
   - Compteurs: X vues, X téléchargements
   - Boutons partage social
   
   SECTIONS ADDITIONNELLES:
   - "Documents similaires" (même thème/type)
   - "Par les mêmes auteurs"
   - "De la même organisation"

3) TrainingCenter.jsx (/mapping/formations):
   - Page dédiée aux documents type 'training'
   - Mise en avant des vidéos
   - Lecteur vidéo avec chapitres
   - Documents PDF de support téléchargeables
   - Filtrage par thème
   - Progression (pour membres connectés)

4) ScientificPublications.jsx (/mapping/publications):
   - Page dédiée aux types 'article' et 'thesis'
   - Filtres académiques:
     * Type (article / thèse)
     * Journal
     * Année
     * Auteur
   - Affichage citation formatée (APA, MLA, etc.)
   - Export BibTeX
   - Lien DOI

5) AwarenessMaterials.jsx (/mapping/sensibilisation):
   - Page dédiée au type 'awareness'
   - Galerie visuelle (affiches, infographies)
   - Vue en grand format
   - Téléchargement HD pour impression
   - Filtres par thème et langue

=== INTÉGRATION AVEC LES AUTRES PILIERS ===

Sur ExpertProfile.jsx:
- Section "Publications de cet expert"
- Liste des documents où l'expert est auteur

Sur OrganizationProfile.jsx:
- Section "Documents publiés par cette organisation"
- Compteur de documents

=== COMPOSANTS RÉUTILISABLES ===

DocumentCard.jsx:
- Utilisé dans toutes les listes
- Props: document, variant ('grid' | 'list'), onDownload

DocumentViewer.jsx:
- Prévisualisation PDF avec react-pdf
- Navigation entre pages
- Zoom
- Plein écran

VideoPlayer.jsx:
- Lecteur vidéo (react-player)
- Support YouTube, Vimeo, MP4
- Chapitres
- Plein écran

=== DESIGN ===
- Couleur principale documents: Violet #9B59B6
- Glassmorphism cohérent
- Responsive mobile-first
- Animations Framer Motion
```

---

## 🔷 PHASE 8: Fonctionnalités Avancées

```
Implémente les fonctionnalités avancées pour OHWR-MAPPING complet.

1) RECHERCHE GLOBALE UNIFIÉE:
   - Endpoint: /api/mapping/search?q=terme&types=human,material,organization,document
   - Recherche sur les 4 piliers simultanément
   - Résultats groupés par type avec compteurs
   - Highlighting des termes trouvés
   - Autocomplete avec suggestions mixtes
   - Filtres dynamiques selon les résultats

2) SYSTÈME DE FAVORIS:
   - Table: user_favorites (user_id, resource_type, resource_id, created_at)
   - Favoris sur les 4 types de ressources
   - Page "Mes Favoris" avec filtrage par type
   - Collections personnalisées (membres)

3) EXPORT ET TÉLÉCHARGEMENTS:
   - Export PDF de l'annuaire des experts
   - Export CSV des listes filtrées
   - Génération de bibliographies (documents):
     * Format APA, MLA, Chicago
     * Export BibTeX
   - Export image de la carte

4) NOTIFICATIONS:
   - Nouveaux documents par thème suivi
   - Nouvelles ressources par région
   - Mise à jour de documents suivis

5) IMPORT EN MASSE (Admin):
   - Import CSV pour chaque pilier
   - Import BibTeX pour articles scientifiques
   - Mapping des colonnes interactif
   - Validation avec rapport d'erreurs
   - Géocodage automatique des adresses

6) ANALYTICS DASHBOARD (Admin):
   - Vue d'ensemble des 4 piliers
   - Graphiques par type et par région
   - Top ressources (vues, téléchargements)
   - Évolution temporelle
   - Export des statistiques

7) SEO ET PARTAGE:
   - Meta tags dynamiques (title, description, image)
   - Open Graph pour partage social
   - Schema.org:
     * Organization
     * Person
     * Article / ScholarlyArticle
     * CreativeWork
   - Sitemap XML dynamique (toutes les ressources)

8) PERFORMANCE:
   - Cache des données fréquentes
   - Lazy loading images
   - Pagination côté serveur
   - Compression images à l'upload
   - CDN pour les fichiers statiques
```

---

## 📁 Structure Finale des Fichiers

```
onehealth-cms/
├── backend/
│   ├── controllers/
│   │   ├── humanResourceController.js
│   │   ├── materialResourceController.js
│   │   ├── organizationController.js
│   │   ├── documentResourceController.js   ← NOUVEAU
│   │   ├── documentThemeController.js      ← NOUVEAU
│   │   ├── mapController.js
│   │   └── statsController.js
│   ├── models/
│   │   ├── HumanResource.js
│   │   ├── MaterialResource.js
│   │   ├── Organization.js
│   │   ├── DocumentResource.js             ← NOUVEAU
│   │   ├── DocumentTheme.js                ← NOUVEAU
│   │   ├── ExpertiseDomain.js
│   │   └── Region.js
│   ├── routes/
│   │   └── mapping.js
│   ├── middleware/
│   │   └── accessControl.js
│   └── uploads/
│       ├── photos/
│       ├── logos/
│       ├── documents/                      ← NOUVEAU
│       ├── thumbnails/                     ← NOUVEAU
│       └── videos/                         ← NOUVEAU
│
├── admin-panel/src/
│   └── components/mapping/
│       ├── ExpertsManager.jsx
│       ├── ExpertForm.jsx
│       ├── MaterialsManager.jsx
│       ├── MaterialForm.jsx
│       ├── OrganizationsManager.jsx
│       ├── OrganizationForm.jsx
│       ├── DocumentsManager.jsx            ← NOUVEAU
│       ├── DocumentForm.jsx                ← NOUVEAU
│       ├── DocumentPreview.jsx             ← NOUVEAU
│       ├── DocumentThemesManager.jsx       ← NOUVEAU
│       ├── MappingDashboard.jsx
│       └── LocationPicker.jsx
│
└── public-site/src/
    └── pages/mapping/
        ├── MappingHome.jsx                  (mise à jour 4 piliers)
        ├── InteractiveMap.jsx
        ├── ExpertsDirectory.jsx
        ├── ExpertProfile.jsx
        ├── MaterialsDirectory.jsx
        ├── MaterialProfile.jsx
        ├── OrganizationsDirectory.jsx
        ├── OrganizationProfile.jsx
        ├── DocumentsLibrary.jsx            ← NOUVEAU
        ├── DocumentDetail.jsx              ← NOUVEAU
        ├── TrainingCenter.jsx              ← NOUVEAU
        ├── ScientificPublications.jsx      ← NOUVEAU
        ├── AwarenessMaterials.jsx          ← NOUVEAU
        └── SearchResults.jsx               (mise à jour)
```

---

## 🎨 Codes Couleurs Complets

| Élément | Couleur | Hex |
|---------|---------|-----|
| Branding OHWR | Vert olive | `#8B9A2D` |
| 👤 Ressources Humaines | Vert | `#27AE60` |
| 🔬 Ressources Matérielles | Bleu | `#3498DB` |
| 🏛️ Organisations | Orange | `#E67E22` |
| 📚 Documents | Violet | `#9B59B6` |
| Disponible | Vert clair | `#2ECC71` |
| Maintenance | Orange | `#F39C12` |
| Indisponible | Rouge | `#E74C3C` |

---

## ⚠️ Notes Importantes

1. **Ordre d'exécution**: Suivre les phases dans l'ordre (DB → Backend → Admin → Public)

2. **Dépendances nouvelles pour les documents**:
   ```bash
   npm install react-pdf react-player multer sharp pdf-lib
   ```

3. **Limites de fichiers**:
   - Documents: 50MB max
   - Images: 10MB max
   - Vidéos: 500MB max (ou lien externe recommandé)

4. **Génération de thumbnails PDF**:
   - Utiliser pdf-lib ou pdf-poppler pour extraire la première page
   - Convertir en image avec sharp

5. **Stockage vidéos**:
   - Privilégier les liens externes (YouTube, Vimeo) pour les grosses vidéos
   - Stockage local pour les petits fichiers uniquement

6. **SEO documents**:
   - Chaque document doit avoir un slug unique
   - Meta description = description du document
   - Image OG = thumbnail du document

---

*Document préparé pour One Health Cameroon - OHWR-MAPPING v2 - Janvier 2026*
