/**
 * Script de création du cours "Formation Site Web OneHealth.cm"
 * Ce script crée le cours complet avec ses 5 modules, 20 leçons et le quiz de 40 questions
 *
 * Usage: node backend/scripts/create-formation-course.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'onehealth_cms'
};

// Données du cours
const courseData = {
  title_fr: 'Formation Site Web OneHealth.cm',
  title_en: 'OneHealth.cm Website Training',
  description_fr: `Cette formation complète vous permettra de maîtriser l'ensemble des outils et fonctionnalités de l'écosystème OneHealth.cm. Vous apprendrez à gérer le site web principal, la plateforme OHWR-Mapping, le système COHRM de gestion des rumeurs sanitaires, et la plateforme E-Learning.

À l'issue de cette formation, vous serez capable de:
- Configurer et gérer les emails du système
- Optimiser les images pour le web avec Photoshop
- Rédiger du contenu web efficace
- Administrer le site via le panel admin
- Utiliser la cartographie OHWR pour le suivi épidémiologique
- Gérer les rumeurs sanitaires avec COHRM
- Créer et gérer des cours sur la plateforme E-Learning
- Configurer et envoyer des newsletters`,
  description_en: `This comprehensive training will help you master all the tools and features of the OneHealth.cm ecosystem. You will learn to manage the main website, the OHWR-Mapping platform, the COHRM health rumor management system, and the E-Learning platform.

Upon completion of this training, you will be able to:
- Configure and manage system emails
- Optimize images for the web with Photoshop
- Write effective web content
- Administer the site via the admin panel
- Use OHWR mapping for epidemiological monitoring
- Manage health rumors with COHRM
- Create and manage courses on the E-Learning platform
- Configure and send newsletters`,
  short_description_fr: 'Formation complète pour maîtriser l\'écosystème OneHealth.cm: site web, OHWR-Mapping, COHRM et E-Learning.',
  short_description_en: 'Complete training to master the OneHealth.cm ecosystem: website, OHWR-Mapping, COHRM and E-Learning.',
  level: 'beginner',
  duration_hours: 21,
  estimated_weeks: 3,
  min_passing_score: 50,
  max_attempts: 3,
  sequential_modules: true,
  is_free: true,
  status: 'published',
  is_featured: true,
  learning_objectives: JSON.stringify([
    'Configurer les paramètres email du système',
    'Optimiser les images pour le web',
    'Rédiger du contenu web efficace',
    'Maîtriser le panel d\'administration',
    'Utiliser OHWR-Mapping pour le suivi sanitaire',
    'Gérer les rumeurs avec COHRM',
    'Créer des cours E-Learning',
    'Envoyer des newsletters ciblées'
  ]),
  target_audience: JSON.stringify([
    'Administrateurs de sites web',
    'Agents de santé publique',
    'Responsables communication',
    'Formateurs One Health'
  ])
};

// Modules
const modules = [
  {
    title_fr: 'Module 1: Fondamentaux',
    title_en: 'Module 1: Fundamentals',
    description_fr: 'Configuration email, traitement d\'images et rédaction web',
    description_en: 'Email configuration, image processing and web writing',
    lessons: [
      {
        title_fr: 'Leçon 1: Configuration Email/SMTP',
        title_en: 'Lesson 1: Email/SMTP Configuration',
        content_fr: `# Configuration Email/SMTP

## Introduction

La configuration correcte des emails est essentielle pour le bon fonctionnement de la plateforme OneHealth. Les emails sont utilisés pour:
- Les notifications système
- L'envoi des newsletters
- Les confirmations d'inscription
- Les alertes de sécurité

## Protocoles de Messagerie

### SMTP (Simple Mail Transfer Protocol)
Le protocole SMTP est le standard pour l'envoi d'emails. Il fonctionne sur les ports:
- **Port 25**: Non sécurisé (à éviter)
- **Port 587**: Sécurisé avec STARTTLS (recommandé)
- **Port 465**: Sécurisé avec SSL/TLS

### Configuration Type
\`\`\`
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASSWORD=****
SMTP_SECURE=true
\`\`\`

## Fournisseurs Recommandés

1. **SendGrid**: Excellent pour les gros volumes
2. **Mailgun**: Bon rapport qualité/prix
3. **Amazon SES**: Économique pour AWS
4. **OVH Mail**: Option locale pour l'Afrique

## Tests et Validation

Toujours tester la configuration avec:
1. Un email de test
2. Vérification de la délivrabilité
3. Contrôle des dossiers spam

## Exercice Pratique

Configurez une adresse email de test et envoyez un message via le panel admin pour vérifier que tout fonctionne correctement.`,
        duration_minutes: 45
      },
      {
        title_fr: 'Leçon 2: Traitement d\'Images avec Photoshop',
        title_en: 'Lesson 2: Image Processing with Photoshop',
        content_fr: `# Traitement d'Images avec Photoshop

## Formats d'Images Web

### Formats Recommandés
- **WebP**: Meilleur compromis qualité/taille (recommandé)
- **JPEG**: Photos et images complexes
- **PNG**: Images avec transparence
- **SVG**: Logos et icônes vectoriels

### À Éviter
- BMP: Trop volumineux
- TIFF: Non optimisé pour le web
- RAW: Format brut professionnel

## Dimensions Recommandées

| Type d'image | Dimensions | Taille max |
|--------------|------------|------------|
| Bannière | 1200x400px | 200 Ko |
| Thumbnail | 400x300px | 50 Ko |
| Photo article | 800x600px | 150 Ko |
| Logo | 200x80px | 20 Ko |

## Workflow Photoshop

### 1. Recadrage
- Outil Recadrage (C)
- Respecter le ratio cible
- Centrer le sujet principal

### 2. Redimensionnement
- Image > Taille de l'image
- Résolution: 72 dpi pour le web
- Rééchantillonnage: Bicubique plus net

### 3. Optimisation
- Fichier > Exporter > Enregistrer pour le Web
- Format WebP ou JPEG
- Qualité: 60-80% (compromis optimal)

### 4. Nommage
\`\`\`
article-titre-description-800x600.webp
\`\`\`

## Exercice Pratique

Prenez une photo de 5 Mo et optimisez-la pour atteindre moins de 200 Ko tout en maintenant une qualité acceptable.`,
        duration_minutes: 60
      },
      {
        title_fr: 'Leçon 3: Optimisation Web des Médias',
        title_en: 'Lesson 3: Web Media Optimization',
        content_fr: `# Optimisation Web des Médias

## Importance de l'Optimisation

Une image mal optimisée peut:
- Ralentir le chargement de la page
- Augmenter les coûts de bande passante
- Dégrader l'expérience utilisateur
- Impacter négativement le SEO

## Outils d'Optimisation

### Outils en Ligne
1. **TinyPNG/TinyJPG**: Compression sans perte visible
2. **Squoosh.app**: Outil Google gratuit
3. **ImageOptim**: Pour Mac
4. **RIOT**: Pour Windows

### Outils Automatiques
- Sharp (Node.js)
- ImageMagick (CLI)
- Cloudinary (Service cloud)

## Bonnes Pratiques

### Images Responsives
\`\`\`html
<img
  srcset="image-400.webp 400w,
          image-800.webp 800w,
          image-1200.webp 1200w"
  sizes="(max-width: 600px) 400px,
         (max-width: 1000px) 800px,
         1200px"
  src="image-800.webp"
  alt="Description de l'image"
/>
\`\`\`

### Lazy Loading
\`\`\`html
<img src="image.webp" loading="lazy" alt="Description" />
\`\`\`

## Audit de Performance

Utilisez ces outils pour vérifier:
1. **Google PageSpeed Insights**
2. **GTmetrix**
3. **Lighthouse (Chrome DevTools)**

## Exercice Pratique

Analysez une page du site OneHealth avec PageSpeed Insights et identifiez les images à optimiser.`,
        duration_minutes: 45
      },
      {
        title_fr: 'Leçon 4: Rédaction Web et SEO',
        title_en: 'Lesson 4: Web Writing and SEO',
        content_fr: `# Rédaction Web et SEO

## Principes de la Rédaction Web

### La Pyramide Inversée
Contrairement à l'écriture traditionnelle, sur le web:
1. **L'essentiel en premier**: Qui, quoi, où, quand
2. **Développement**: Détails importants
3. **Compléments**: Informations secondaires

### Caractéristiques du Texte Web
- Phrases courtes (15-20 mots max)
- Paragraphes aérés (3-4 phrases)
- Titres et sous-titres explicites
- Listes à puces pour les énumérations
- Mots-clés en gras

## Structure d'un Article

### Titre (H1)
- 8-12 mots maximum
- Contenir le mot-clé principal
- Être accrocheur et informatif

### Chapô (Introduction)
- 2-3 phrases maximum
- Résumer l'article
- Inciter à continuer la lecture

### Corps de l'Article
- Sous-titres (H2, H3)
- Paragraphes courts
- Liens internes pertinents

### Conclusion
- Résumé des points clés
- Appel à l'action si pertinent

## Optimisation SEO

### Méta-données
\`\`\`
Titre: 60 caractères max
Description: 155 caractères max
URL: courte et descriptive
\`\`\`

### Mots-clés
- 1 mot-clé principal
- 2-3 mots-clés secondaires
- Densité: 1-2% du texte

### Balises Alt
Chaque image doit avoir une description:
\`\`\`
alt="Formation One Health au Cameroun - Atelier pratique"
\`\`\`

## Exercice Pratique

Rédigez un article de 300 mots sur un événement One Health en respectant les principes de la pyramide inversée.`,
        duration_minutes: 60
      }
    ]
  },
  {
    title_fr: 'Module 2: Site Web OneHealth',
    title_en: 'Module 2: OneHealth Website',
    description_fr: 'Architecture technique et administration du site',
    description_en: 'Technical architecture and site administration',
    lessons: [
      {
        title_fr: 'Leçon 5: Architecture de la Plateforme',
        title_en: 'Lesson 5: Platform Architecture',
        content_fr: `# Architecture de la Plateforme OneHealth

## Vue d'Ensemble

L'écosystème OneHealth.cm est composé de 4 plateformes interconnectées:

1. **Site Web Principal** (onehealth.cm)
2. **OHWR-Mapping** (mapping.onehealth.cm)
3. **COHRM** (cohrm.onehealth.cm)
4. **E-Learning** (elearning.onehealth.cm)

## Stack Technologique

### Frontend Public
- **Framework**: Next.js 14+
- **Langage**: TypeScript
- **UI**: Tailwind CSS
- **Internationalisation**: i18n (FR/EN)

### Backend API
- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de données**: MySQL/MariaDB
- **ORM**: Requêtes SQL directes

### Admin Panel
- **Framework**: React.js
- **UI**: CSS-in-JS personnalisé
- **Composants**: Lucide React Icons

## Organisation des Fichiers

\`\`\`
onehealth-cms/
├── admin/              # Panel d'administration
│   └── src/
│       └── AdminApp.jsx
├── backend/            # API Node.js
│   ├── routes/
│   ├── services/
│   └── migrations/
├── frontend-next/      # Site public Next.js
│   ├── app/
│   ├── components/
│   └── lib/
└── docker/             # Configuration Docker
\`\`\`

## Communication Inter-Plateformes

Les plateformes communiquent via:
- API REST centralisée
- Base de données partagée
- Authentification JWT commune

## Déploiement

- **Production**: Docker Compose
- **Serveur**: Ubuntu/Debian
- **Reverse Proxy**: Nginx
- **SSL**: Let's Encrypt

## Exercice Pratique

Explorez la structure des dossiers du projet et identifiez les fichiers principaux de chaque composant.`,
        duration_minutes: 45
      },
      {
        title_fr: 'Leçon 6: Navigation dans l\'Admin',
        title_en: 'Lesson 6: Navigating the Admin Panel',
        content_fr: `# Navigation dans l'Admin Panel

## Accès à l'Administration

URL: admin.onehealth.cm (ou localhost:3002 en développement)

### Authentification
1. Entrez votre email
2. Entrez votre mot de passe
3. Cliquez sur "Se connecter"

## Interface Principale

### Barre de Navigation Supérieure

De gauche à droite:
1. **Logo OneHealth**: Retour à l'accueil
2. **Page Builder**: Gestion du contenu du site
3. **OHWR-System**: Rapports épidémiologiques
4. **E-Learning**: Gestion des cours
5. **COHRM-System**: Gestion des rumeurs
6. **Newsletter**: Campagnes email
7. **Paramètres** (engrenage): Configuration générale

### Page Builder

Onglets disponibles:
- **Dashboard**: Vue d'ensemble et statistiques
- **Pages**: Gestion des pages statiques
- **Articles**: Blog et actualités
- **Médias**: Bibliothèque multimédia
- **Menus**: Navigation du site
- **Traductions**: Gestion multilingue

### Raccourcis Clavier

- \`Ctrl + S\`: Sauvegarder
- \`Ctrl + Z\`: Annuler
- \`Ctrl + P\`: Prévisualiser
- \`Esc\`: Fermer le modal

## Navigation Contextuelle

Chaque section a:
- **Fil d'Ariane**: Pour savoir où vous êtes
- **Actions rapides**: Boutons de création
- **Filtres**: Pour trouver rapidement le contenu
- **Pagination**: Pour les listes longues

## Exercice Pratique

Connectez-vous à l'admin et explorez chaque section pendant 2 minutes. Notez les fonctionnalités principales de chaque onglet.`,
        duration_minutes: 30
      },
      {
        title_fr: 'Leçon 7: Gestion des Articles',
        title_en: 'Lesson 7: Managing Articles',
        content_fr: `# Gestion des Articles

## Accéder aux Articles

1. Connectez-vous à l'admin
2. Cliquez sur "Page Builder"
3. Sélectionnez l'onglet "Articles"

## Créer un Nouvel Article

### Étape 1: Informations de Base
- **Titre FR**: Titre en français (requis)
- **Titre EN**: Titre en anglais
- **Slug**: URL automatique (modifiable)
- **Catégorie**: Classement thématique

### Étape 2: Contenu
- Utilisez l'éditeur riche
- Formatez avec les boutons de la barre d'outils
- Insérez des images depuis la médiathèque

### Étape 3: Médias
- **Image à la une**: Miniature de l'article
- **Galerie**: Images supplémentaires
- **Documents**: PDF et fichiers joints

### Étape 4: SEO
- **Méta-titre**: Titre pour Google
- **Méta-description**: Description pour Google
- **Mots-clés**: Tags pour le référencement

### Étape 5: Publication
- **Brouillon**: En cours de rédaction
- **En attente**: À valider
- **Publié**: Visible sur le site
- **Planifié**: Publication future

## Bonnes Pratiques

1. **Toujours prévisualiser** avant de publier
2. **Optimiser les images** avant l'upload
3. **Remplir les métadonnées** SEO
4. **Vérifier l'orthographe** avec un correcteur
5. **Tester les liens** internes et externes

## Gestion des Articles Existants

### Actions Disponibles
- **Modifier**: Éditer le contenu
- **Dupliquer**: Créer une copie
- **Archiver**: Masquer sans supprimer
- **Supprimer**: Suppression définitive

### Filtres Utiles
- Par statut (brouillon, publié)
- Par catégorie
- Par date
- Par auteur

## Exercice Pratique

Créez un article de test sur un sujet One Health, ajoutez une image et publiez-le. Vérifiez qu'il apparaît correctement sur le site public.`,
        duration_minutes: 60
      },
      {
        title_fr: 'Leçon 8: Gestion des Médias',
        title_en: 'Lesson 8: Media Management',
        content_fr: `# Gestion des Médias

## La Médiathèque

La médiathèque centralise tous les fichiers:
- Images (JPEG, PNG, WebP, GIF)
- Documents (PDF, DOC, DOCX)
- Vidéos (MP4, WebM)
- Audio (MP3, WAV)

## Uploader des Fichiers

### Méthode 1: Upload Direct
1. Onglet "Médias"
2. Bouton "Ajouter"
3. Sélectionner les fichiers
4. Attendre le téléversement

### Méthode 2: Glisser-Déposer
1. Ouvrir la médiathèque
2. Glisser les fichiers depuis l'explorateur
3. Déposer dans la zone prévue

### Limites
- Taille max par fichier: 10 Mo
- Formats acceptés: voir liste ci-dessus
- Upload multiple: jusqu'à 20 fichiers

## Organiser les Médias

### Dossiers
Créez des dossiers pour classer:
- /articles
- /events
- /team
- /partners

### Renommage
1. Sélectionner le fichier
2. Cliquer sur "Renommer"
3. Utiliser un nom descriptif
4. Format: description-date.extension

### Métadonnées
Pour chaque image, renseignez:
- **Titre**: Nom affiché
- **Alt text**: Description pour l'accessibilité
- **Légende**: Texte sous l'image
- **Crédits**: Auteur/source

## Optimisation Automatique

Le système optimise automatiquement:
- Redimensionnement selon l'usage
- Compression intelligente
- Génération de miniatures
- Conversion en WebP

## Recherche de Médias

Utilisez les filtres:
- Par type (image, document, vidéo)
- Par date d'upload
- Par nom de fichier
- Par dossier

## Exercice Pratique

1. Créez un dossier "formation"
2. Uploadez 3 images
3. Renseignez les métadonnées de chaque image
4. Utilisez une image dans un article`,
        duration_minutes: 45
      }
    ]
  },
  {
    title_fr: 'Module 3: OHWR-Mapping',
    title_en: 'Module 3: OHWR-Mapping',
    description_fr: 'Rapports hebdomadaires et cartographie épidémiologique',
    description_en: 'Weekly reports and epidemiological mapping',
    lessons: [
      {
        title_fr: 'Leçon 9: Introduction à OHWR',
        title_en: 'Lesson 9: Introduction to OHWR',
        content_fr: `# Introduction à OHWR (One Health Weekly Report)

## Qu'est-ce que OHWR?

OHWR (One Health Weekly Report) est le système de suivi épidémiologique de la plateforme OneHealth. Il permet de:

- Collecter les données sanitaires des 3 secteurs One Health
- Visualiser les événements sur une carte interactive
- Analyser les tendances épidémiologiques
- Générer des rapports hebdomadaires

## Les 3 Secteurs One Health

### 1. Santé Humaine
- Maladies infectieuses
- Épidémies
- Surveillance syndromique

### 2. Santé Animale
- Maladies du bétail
- Zoonoses
- Faune sauvage

### 3. Environnement
- Qualité de l'eau
- Contamination des sols
- Vecteurs de maladies

## Semaine Épidémiologique

Les données sont organisées par semaine épidémiologique (SE):
- Début: Dimanche
- Fin: Samedi
- Numérotation: SE01 à SE52/53

### Exemple
SE03-2024 = 14 au 20 janvier 2024

## Types de Données

### Cas Confirmés
Diagnostic confirmé par laboratoire

### Cas Suspects
Symptômes correspondants mais non confirmés

### Décès
Issues fatales des cas

### Alertes
Situations nécessitant une attention particulière

## Flux de Données

\`\`\`
Terrain → Collecte → Validation → Publication → Analyse
\`\`\`

1. **Terrain**: Agents de santé collectent les données
2. **Collecte**: Saisie dans le système
3. **Validation**: Vérification par superviseur
4. **Publication**: Données accessibles à tous
5. **Analyse**: Exploitation pour la prise de décision

## Exercice Pratique

Accédez à OHWR-System dans l'admin et explorez les différentes sections disponibles.`,
        duration_minutes: 45
      },
      {
        title_fr: 'Leçon 10: Saisie des Rapports',
        title_en: 'Lesson 10: Report Entry',
        content_fr: `# Saisie des Rapports OHWR

## Accéder à la Saisie

1. Admin > OHWR-System
2. Onglet "Nouveau Rapport"
3. Sélectionner la semaine épidémiologique

## Formulaire de Rapport

### Informations Générales
- **Semaine**: Sélectionner SE
- **Année**: Année en cours
- **Région**: Zone géographique
- **District**: Subdivision
- **Formation sanitaire**: Établissement source

### Données Sanitaires

#### Section Santé Humaine
| Champ | Description |
|-------|-------------|
| Maladie | Liste déroulante |
| Cas suspects | Nombre |
| Cas confirmés | Nombre |
| Décès | Nombre |
| Tranche d'âge | 0-5, 6-15, 16-59, 60+ |
| Sexe | M/F |

#### Section Santé Animale
| Champ | Description |
|-------|-------------|
| Espèce | Type d'animal |
| Maladie | Pathologie |
| Cas suspects | Nombre |
| Cas confirmés | Nombre |
| Morts | Nombre |
| Abattus | Nombre |

#### Section Environnement
| Champ | Description |
|-------|-------------|
| Type | Eau, Sol, Air |
| Paramètre | Ce qui est mesuré |
| Valeur | Mesure |
| Norme | Seuil acceptable |
| Conformité | Oui/Non |

## Géolocalisation

Chaque événement doit être géolocalisé:
1. Cliquer sur la carte
2. Ou entrer les coordonnées GPS
3. Ou rechercher un lieu par nom

Format: Latitude, Longitude
Exemple: 3.8480, 11.5021 (Yaoundé)

## Validation et Soumission

### Avant de Soumettre
- [ ] Vérifier les chiffres
- [ ] Confirmer la localisation
- [ ] Ajouter des notes si nécessaire

### Statuts du Rapport
- **Brouillon**: En cours de saisie
- **Soumis**: En attente de validation
- **Validé**: Approuvé et publié
- **Rejeté**: À corriger

## Exercice Pratique

Créez un rapport fictif pour la semaine en cours avec au moins 3 événements sanitaires géolocalisés.`,
        duration_minutes: 60
      },
      {
        title_fr: 'Leçon 11: Utilisation de la Carte',
        title_en: 'Lesson 11: Using the Map',
        content_fr: `# Utilisation de la Carte OHWR

## Interface Cartographique

### Composants Principaux
1. **Carte**: Zone centrale avec fond OpenStreetMap
2. **Contrôles**: Zoom, couches, légende
3. **Filtres**: Panneau latéral
4. **Détails**: Popup au clic

## Navigation sur la Carte

### Contrôles de Zoom
- **+/-**: Boutons de zoom
- **Molette souris**: Zoom fluide
- **Double-clic**: Zoom avant rapide

### Déplacement
- **Glisser**: Cliquer et déplacer
- **Recherche**: Barre de recherche de lieu

## Les Couches (Layers)

### Couches de Base
- OpenStreetMap (par défaut)
- Satellite
- Terrain

### Couches de Données
- Points humains (rouge)
- Points animaux (orange)
- Points environnement (vert)
- Zones d'alerte (hachurées)

### Activer/Désactiver
Utilisez le sélecteur de couches en haut à droite pour afficher ou masquer les données.

## Filtres de Données

### Filtre Temporel
- Par semaine épidémiologique
- Par plage de dates
- Dernière semaine / mois / année

### Filtre Géographique
- Par région
- Par district
- Par rayon (km autour d'un point)

### Filtre Thématique
- Par secteur (humain/animal/environnement)
- Par maladie
- Par gravité (alerte/normal)

## Interprétation des Données

### Code Couleur
| Couleur | Signification |
|---------|---------------|
| Rouge | Alerte haute |
| Orange | Attention |
| Jaune | Surveillance |
| Vert | Normal |

### Taille des Marqueurs
La taille est proportionnelle au nombre de cas.

### Clustering
Les points proches sont regroupés. Cliquez pour zoomer et voir les détails.

## Export des Données

Options disponibles:
- **PNG**: Image de la carte
- **PDF**: Rapport avec carte
- **CSV**: Données brutes
- **GeoJSON**: Format cartographique

## Exercice Pratique

1. Filtrez les données sur les 4 dernières semaines
2. Affichez uniquement les données animales
3. Identifiez les zones à forte concentration
4. Exportez une capture de la carte`,
        duration_minutes: 45
      },
      {
        title_fr: 'Leçon 12: Analyse et Rapports',
        title_en: 'Lesson 12: Analysis and Reports',
        content_fr: `# Analyse et Rapports OHWR

## Tableau de Bord Analytique

### Indicateurs Clés
- Nombre total de cas (semaine en cours)
- Évolution vs semaine précédente
- Répartition par secteur
- Top 5 des maladies

### Graphiques Disponibles

#### Courbe Épidémique
Évolution du nombre de cas dans le temps
- Axe X: Semaines
- Axe Y: Nombre de cas
- Lignes: Par secteur ou maladie

#### Histogramme par Région
Comparaison des régions
- Barres groupées par secteur
- Code couleur par gravité

#### Camembert de Répartition
Distribution des cas par:
- Secteur One Health
- Maladie
- Tranche d'âge

## Génération de Rapports

### Rapport Hebdomadaire Standard

Structure:
1. **Résumé exécutif**: Points saillants
2. **Situation épidémiologique**: Chiffres détaillés
3. **Carte de situation**: Visualisation
4. **Analyse par secteur**: Humain, Animal, Environnement
5. **Tendances**: Comparaison avec périodes précédentes
6. **Recommandations**: Actions suggérées

### Créer un Rapport
1. OHWR-System > Rapports
2. Cliquer "Nouveau Rapport"
3. Sélectionner la période
4. Choisir les sections à inclure
5. Générer et télécharger

## Alertes et Notifications

### Configuration des Alertes
Définir des seuils pour:
- Nombre de cas dépassant X
- Nouvelle maladie signalée
- Augmentation > 50% vs semaine précédente

### Canaux de Notification
- Email automatique
- Notification dans l'app
- SMS (si configuré)

## Partage et Diffusion

### Destinataires Types
- Ministère de la Santé
- Ministère de l'Élevage
- Ministère de l'Environnement
- Partenaires techniques

### Formats d'Export
- PDF: Rapport formaté
- Excel: Données tabulaires
- PowerPoint: Présentation

## Exercice Pratique

Générez un rapport hebdomadaire pour les 4 dernières semaines et analysez les tendances principales.`,
        duration_minutes: 60
      }
    ]
  },
  {
    title_fr: 'Module 4: COHRM - Gestion des Rumeurs',
    title_en: 'Module 4: COHRM - Rumor Management',
    description_fr: 'Collecte, vérification et réponse aux rumeurs sanitaires',
    description_en: 'Collection, verification and response to health rumors',
    lessons: [
      {
        title_fr: 'Leçon 13: Concept et Objectifs COHRM',
        title_en: 'Lesson 13: COHRM Concept and Objectives',
        content_fr: `# Concept et Objectifs COHRM

## Qu'est-ce que COHRM?

COHRM (Cameroon One Health Rumor Management) est un système de gestion des rumeurs sanitaires qui permet de:

- **Collecter** les rumeurs signalées par la population
- **Vérifier** leur véracité sur le terrain
- **Répondre** avec des informations fiables
- **Prévenir** la propagation de fausses informations

## Pourquoi Gérer les Rumeurs?

### Impact des Fausses Informations
- Panique dans la population
- Méfiance envers les autorités sanitaires
- Comportements à risque
- Échec des campagnes de santé publique

### Exemples de Rumeurs Types
- "L'eau du robinet est contaminée"
- "Un cas d'Ebola a été détecté à..."
- "Le vaccin cause des effets secondaires graves"
- "Une épidémie se propage depuis le marché"

## Cycle de Vie d'une Rumeur

\`\`\`
Émergence → Propagation → Collecte → Vérification → Réponse → Suivi
\`\`\`

### 1. Émergence
Origine de la rumeur (réseaux sociaux, bouche à oreille, médias)

### 2. Propagation
Diffusion dans la communauté

### 3. Collecte
Signalement via le système COHRM

### 4. Vérification
Investigation sur le terrain

### 5. Réponse
Communication de la vérité

### 6. Suivi
Monitoring de l'impact

## Acteurs du Système

### Contributeurs
- Population générale (formulaire public)
- Agents de santé communautaires
- Journalistes
- ONG partenaires

### Vérificateurs
- Équipes d'investigation terrain
- Laboratoires (si analyses nécessaires)
- Experts thématiques

### Communicateurs
- Service communication du Ministère
- Médias partenaires
- Influenceurs de santé

## Indicateurs de Performance

| Indicateur | Cible |
|------------|-------|
| Délai de réponse | < 48h |
| Taux de vérification | > 90% |
| Couverture médiatique | > 70% |
| Satisfaction population | > 80% |

## Exercice Pratique

Identifiez 3 rumeurs sanitaires actuelles (réelles ou hypothétiques) et décrivez comment elles pourraient être traitées via COHRM.`,
        duration_minutes: 45
      },
      {
        title_fr: 'Leçon 14: Collecte des Rumeurs',
        title_en: 'Lesson 14: Rumor Collection',
        content_fr: `# Collecte des Rumeurs

## Canaux de Collecte

### 1. Formulaire Public
Accessible sur cohrm.onehealth.cm

Champs du formulaire:
- Description de la rumeur
- Source (où avez-vous entendu cela?)
- Localisation
- Date
- Contact (optionnel)

### 2. Agents de Terrain
Application mobile dédiée avec:
- Géolocalisation automatique
- Prise de photo
- Enregistrement audio
- Synchronisation différée

### 3. Veille Médiatique
Surveillance active de:
- Réseaux sociaux (Facebook, Twitter, WhatsApp)
- Médias locaux
- Forums communautaires

### 4. Ligne Téléphonique
Numéro vert pour signalements vocaux

## Fiche de Rumeur

### Informations Obligatoires

| Champ | Description |
|-------|-------------|
| ID | Identifiant unique |
| Date de réception | Timestamp automatique |
| Source | Origine du signalement |
| Localisation | Où cela se passe |
| Description | Contenu de la rumeur |
| Secteur | Humain/Animal/Environnement |

### Informations Complémentaires

| Champ | Description |
|-------|-------------|
| Preuves | Photos, liens, documents |
| Contacts | Témoins potentiels |
| Gravité estimée | Faible/Moyenne/Élevée |
| Propagation | Locale/Régionale/Nationale |
| Tags | Mots-clés pour classification |

## Géolocalisation

### Méthodes
1. **GPS automatique**: Via téléphone
2. **Sélection carte**: Clic sur le lieu
3. **Adresse textuelle**: Recherche et conversion

### Précision
- Niveau village/quartier minimum
- Coordonnées GPS si possible
- Repères locaux utiles

## Triage Initial

### Critères de Priorité
- **Urgente**: Danger imminent pour la santé
- **Haute**: Propagation rapide, grande inquiétude
- **Moyenne**: Circulation limitée
- **Basse**: Information générale, faible impact

### Actions Automatiques
- Notification des équipes selon priorité
- Affectation zone géographique
- Démarrage du timer de réponse

## Exercice Pratique

Simulez la collecte d'une rumeur via le formulaire public:
1. Inventez une rumeur réaliste
2. Remplissez tous les champs
3. Géolocalisez précisément
4. Attribuez une priorité`,
        duration_minutes: 60
      },
      {
        title_fr: 'Leçon 15: Processus de Vérification',
        title_en: 'Lesson 15: Verification Process',
        content_fr: `# Processus de Vérification

## Workflow de Vérification

\`\`\`
Réception → Analyse préliminaire → Investigation → Conclusion → Validation
\`\`\`

## Étape 1: Analyse Préliminaire

### Questions à se poser
- La rumeur est-elle plausible?
- Avons-nous déjà traité une rumeur similaire?
- Quelles sources peuvent confirmer/infirmer?
- Quel est le niveau d'urgence?

### Actions
1. Rechercher dans la base de données
2. Vérifier les sources officielles
3. Consulter les experts si nécessaire
4. Évaluer la crédibilité de la source

## Étape 2: Investigation Terrain

### Préparation
- Brief de l'équipe
- Documentation de la rumeur
- Matériel (appareil photo, formulaires)
- Contacts locaux

### Sur le Terrain
1. **Observation directe**
   - Vérifier les faits allégués
   - Prendre des photos/vidéos

2. **Entretiens**
   - Témoins directs
   - Autorités locales
   - Personnel de santé

3. **Prélèvements** (si nécessaire)
   - Échantillons d'eau
   - Prélèvements biologiques
   - Envoi au laboratoire

### Documentation
Remplir le rapport d'investigation:
- Date et heure de visite
- Personnes rencontrées
- Observations
- Preuves collectées
- Conclusion préliminaire

## Étape 3: Analyse des Résultats

### Catégorisation

| Statut | Description |
|--------|-------------|
| **Confirmée** | Rumeur vraie, nécessite action |
| **Partiellement vraie** | Éléments vrais mais exagérés |
| **Fausse** | Aucun fondement factuel |
| **Invérifiable** | Impossible à confirmer/infirmer |

### Éléments de Preuve
- Photos terrain
- Résultats de laboratoire
- Témoignages concordants
- Documents officiels

## Étape 4: Validation

### Comité de Validation
- Responsable COHRM
- Expert thématique
- Communicateur

### Décision
- Approuver la conclusion
- Demander investigation complémentaire
- Escalader si nécessaire

## Délais Standards

| Priorité | Délai investigation | Délai réponse |
|----------|---------------------|---------------|
| Urgente | 6h | 12h |
| Haute | 24h | 48h |
| Moyenne | 72h | 1 semaine |
| Basse | 1 semaine | 2 semaines |

## Exercice Pratique

Simulez le processus de vérification d'une rumeur:
1. Analysez la rumeur créée précédemment
2. Planifiez une investigation terrain
3. Rédigez un rapport avec une conclusion fictive`,
        duration_minutes: 60
      },
      {
        title_fr: 'Leçon 16: Communication et Réponse',
        title_en: 'Lesson 16: Communication and Response',
        content_fr: `# Communication et Réponse

## Stratégie de Communication

### Principes Fondamentaux

1. **Rapidité**: Répondre avant que la rumeur ne se propage
2. **Transparence**: Dire ce qu'on sait et ce qu'on ne sait pas
3. **Empathie**: Comprendre les inquiétudes de la population
4. **Simplicité**: Messages clairs et compréhensibles
5. **Cohérence**: Un seul message, plusieurs canaux

### À Éviter
- Nier sans preuves
- Blâmer les porteurs de rumeurs
- Utiliser du jargon technique
- Minimiser les préoccupations légitimes

## Rédaction du Message

### Structure Type

\`\`\`
1. Reconnaissance du problème
2. État des faits vérifiés
3. Actions entreprises
4. Recommandations
5. Sources/contacts pour plus d'infos
\`\`\`

### Exemple

> **Concernant les rumeurs de contamination de l'eau à [lieu]:**
>
> Suite aux signalements, nos équipes ont effectué des prélèvements le [date]. Les analyses du laboratoire confirment que l'eau est conforme aux normes de potabilité.
>
> Nous recommandons néanmoins de [conseils de prévention].
>
> Pour plus d'informations: [contact]

## Canaux de Diffusion

### Canaux Officiels
- Site web (section actualités)
- Réseaux sociaux officiels
- Communiqués de presse
- Conférences de presse

### Canaux Communautaires
- Radios locales
- Crieurs publics
- Leaders communautaires
- Affiches dans les lieux publics

### Canaux Numériques
- SMS de masse
- Groupes WhatsApp
- Messages vocaux

## Suivi de l'Impact

### Indicateurs à Monitorer
- Portée des messages (vues, partages)
- Sentiment des commentaires
- Évolution du nombre de signalements similaires
- Feedback des relais communautaires

### Ajustements
Si la rumeur persiste:
1. Renforcer la communication
2. Identifier les poches de résistance
3. Adapter le message
4. Mobiliser de nouveaux relais

## Documentation

### Fiche de Clôture

| Élément | Description |
|---------|-------------|
| Résumé | Synthèse de la rumeur |
| Conclusion | Vraie/Fausse/Partielle |
| Réponse diffusée | Message officiel |
| Canaux utilisés | Liste des médias |
| Impact mesuré | Statistiques |
| Leçons apprises | Améliorations |

## Exercice Pratique

Rédigez un message de réponse pour la rumeur vérifiée précédemment. Planifiez sa diffusion sur 3 canaux différents.`,
        duration_minutes: 45
      }
    ]
  },
  {
    title_fr: 'Module 5: E-Learning & Newsletter',
    title_en: 'Module 5: E-Learning & Newsletter',
    description_fr: 'Création de cours en ligne et campagnes newsletter',
    description_en: 'Online course creation and newsletter campaigns',
    lessons: [
      {
        title_fr: 'Leçon 17: Plateforme E-Learning',
        title_en: 'Lesson 17: E-Learning Platform',
        content_fr: `# Plateforme E-Learning OneHealth

## Vue d'Ensemble

La plateforme E-Learning permet de:
- Créer et gérer des cours en ligne
- Suivre la progression des apprenants
- Évaluer les connaissances via des quiz
- Délivrer des certificats automatiquement

## Structure Pédagogique

\`\`\`
Catégorie
└── Cours
    └── Module
        └── Leçon
            └── Quiz (optionnel)
\`\`\`

### Catégories
Regroupement thématique des cours:
- Santé humaine
- Santé animale
- Environnement
- One Health général
- Gestion de crises

### Cours
Unité d'apprentissage complète avec:
- Titre et description
- Objectifs pédagogiques
- Prérequis
- Durée estimée
- Niveau (débutant/intermédiaire/avancé)

### Modules
Chapitres du cours:
- Titre et description
- Ordre séquentiel
- Quiz de fin de module (optionnel)

### Leçons
Contenu pédagogique:
- Texte formaté
- Vidéos
- Documents PDF
- Quiz intégré

## Types de Contenu

### Vidéo
- Hébergement externe (YouTube, Vimeo)
- Ou upload direct
- Sous-titres recommandés
- Durée: 5-15 minutes idéalement

### Texte
- Éditeur riche
- Mise en forme avancée
- Intégration d'images
- Liens vers ressources

### Documents
- PDF téléchargeables
- Supports de cours
- Exercices pratiques
- Ressources complémentaires

### Quiz
- Questions à choix multiple
- Vrai/Faux
- Questions ouvertes
- Score minimum pour valider

## Accès à l'Admin E-Learning

1. Connectez-vous à l'admin
2. Cliquez sur "E-Learning" dans le header
3. Naviguez entre les onglets:
   - Dashboard
   - Cours
   - Catégories
   - Utilisateurs
   - Certificats

## Exercice Pratique

Explorez la section E-Learning de l'admin. Identifiez les cours existants et leur structure.`,
        duration_minutes: 45
      },
      {
        title_fr: 'Leçon 18: Création de Cours',
        title_en: 'Lesson 18: Course Creation',
        content_fr: `# Création de Cours

## Étapes de Création

### 1. Planification
Avant de commencer:
- Définir les objectifs pédagogiques
- Identifier le public cible
- Structurer le contenu en modules
- Estimer la durée totale
- Préparer les ressources

### 2. Créer le Cours

Admin > E-Learning > Cours > Nouveau cours

#### Informations de Base
- **Titre FR/EN**: Nom du cours (bilingue)
- **Description**: Présentation détaillée
- **Description courte**: Résumé pour les listes
- **Catégorie**: Classification thématique
- **Niveau**: Débutant/Intermédiaire/Avancé

#### Médias
- **Thumbnail**: Image miniature (400x300)
- **Cover**: Image de couverture (1200x400)
- **Vidéo intro**: Présentation (optionnel)

#### Paramètres
- **Durée estimée**: En heures
- **Score minimum**: Pour réussir le quiz final
- **Modules séquentiels**: Oui/Non
- **Gratuit**: Oui/Non
- **Prix**: Si payant

### 3. Créer les Modules

Pour chaque module:
1. Cliquer "Ajouter un module"
2. Renseigner:
   - Titre FR/EN
   - Description
   - Durée estimée
   - Quiz de fin de module (optionnel)

### 4. Créer les Leçons

Pour chaque leçon:
1. Sélectionner le module parent
2. Cliquer "Ajouter une leçon"
3. Renseigner:
   - Titre FR/EN
   - Type de contenu
   - Contenu (texte, vidéo, PDF)
   - Durée
   - Marqueur de progression

### 5. Créer le Quiz Final

1. Onglet Quiz > Nouveau quiz
2. Configurer:
   - Titre
   - Instructions
   - Temps limite
   - Score minimum
   - Nombre de tentatives
3. Ajouter les questions

## Bonnes Pratiques

### Contenu
- Leçons de 10-20 minutes max
- Variété des médias (texte + vidéo + exercices)
- Résumé à la fin de chaque module
- Quiz réguliers pour l'engagement

### Accessibilité
- Sous-titres pour les vidéos
- Alt text pour les images
- Police lisible
- Contraste suffisant

### Engagement
- Objectifs clairs par module
- Progression visible
- Certificat motivant
- Exercices pratiques

## Publication

### Statuts
- **Brouillon**: En cours de création
- **En révision**: À valider
- **Publié**: Visible aux apprenants
- **Archivé**: Plus accessible

### Checklist avant publication
- [ ] Tous les modules complétés
- [ ] Toutes les leçons avec contenu
- [ ] Quiz configuré et testé
- [ ] Médias de qualité
- [ ] Traductions vérifiées

## Exercice Pratique

Créez un mini-cours de test avec:
- 2 modules
- 2 leçons par module
- 1 quiz de 5 questions`,
        duration_minutes: 75
      },
      {
        title_fr: 'Leçon 19: Gestion Newsletter',
        title_en: 'Lesson 19: Newsletter Management',
        content_fr: `# Gestion Newsletter

## Accès au Module Newsletter

Admin > Newsletter (icône enveloppe dans le header)

## Fonctionnalités Principales

### 1. Tableau de Bord
Vue d'ensemble avec:
- Nombre d'abonnés actifs
- Taux d'ouverture moyen
- Taux de clic moyen
- Dernières campagnes

### 2. Listes de Diffusion

Gérer vos listes d'abonnés:

#### Créer une Liste
1. Onglet "Listes"
2. Bouton "Nouvelle liste"
3. Renseigner:
   - Nom
   - Description
   - Couleur (pour identification)
   - Publique/Privée
   - Double opt-in activé?
   - Email de bienvenue?

#### Listes Suggérées
- Newsletter générale
- Alertes sanitaires
- Actualités E-Learning
- Partenaires techniques

### 3. Gestion des Abonnés

#### Ajouter un Abonné
- Manuellement (formulaire)
- Import CSV
- Inscription publique

#### Champs Abonné
- Email (obligatoire)
- Prénom
- Nom
- Langue préférée
- Liste(s) d'appartenance

#### Import CSV
Format attendu:
\`\`\`csv
email,first_name,last_name,language
john@example.com,John,Doe,en
marie@example.com,Marie,Dupont,fr
\`\`\`

### 4. Templates

#### Templates Prédéfinis
- Simple (texte seul)
- Standard (image + texte)
- Article (mise en avant d'un article)
- Digest (résumé de plusieurs articles)

#### Créer un Template
1. Onglet "Templates"
2. "Nouveau template"
3. Éditeur HTML avec preview
4. Variables disponibles:
   - {{first_name}} - Prénom
   - {{email}} - Email
   - {{unsubscribe_url}} - Lien désabonnement

## Conformité RGPD

### Obligations
- Consentement explicite
- Lien de désabonnement obligatoire
- Possibilité d'export des données
- Droit à l'effacement

### Bonnes Pratiques
- Double opt-in recommandé
- Politique de confidentialité accessible
- Archivage des consentements
- Nettoyage régulier des inactifs

## Exercice Pratique

1. Créez une liste "Test Formation"
2. Ajoutez 3 abonnés manuellement
3. Créez un template simple`,
        duration_minutes: 60
      },
      {
        title_fr: 'Leçon 20: Campagnes Email',
        title_en: 'Lesson 20: Email Campaigns',
        content_fr: `# Campagnes Email Newsletter

## Créer une Campagne

### Méthode 1: Campagne Manuelle

1. Onglet "Campagnes"
2. "Nouvelle campagne"
3. Type: "Manuelle"

#### Étape 1: Configuration
- Nom de la campagne (interne)
- Liste(s) cible(s)
- Langue(s)

#### Étape 2: Contenu
- Sujet de l'email (FR/EN)
- Sélectionner un template
- Personnaliser le contenu
- Ajouter des images

#### Étape 3: Preview
- Vérifier le rendu
- Tester sur différents clients mail
- Envoyer un email de test

### Méthode 2: Depuis un Article

1. "Nouvelle campagne"
2. Type: "Depuis article"
3. Sélectionner l'article publié
4. Le contenu est généré automatiquement
5. Personnaliser si nécessaire

### Méthode 3: Digest

1. "Nouvelle campagne"
2. Type: "Digest"
3. Sélectionner plusieurs articles
4. Ordre d'apparition
5. Texte d'introduction

## Envoi de la Campagne

### Envoi Immédiat
1. Cliquer "Envoyer maintenant"
2. Confirmer le nombre de destinataires
3. Valider l'envoi

### Envoi Programmé
1. Cliquer "Programmer"
2. Sélectionner date et heure
3. Fuseau horaire
4. Confirmer

### Meilleurs Moments
| Jour | Heure | Taux d'ouverture |
|------|-------|------------------|
| Mardi | 10h | Élevé |
| Mercredi | 14h | Élevé |
| Jeudi | 10h | Moyen-élevé |

## Suivi et Statistiques

### Métriques Clés

| Métrique | Description | Bon score |
|----------|-------------|-----------|
| Taux d'envoi | Envoyés / Total | > 98% |
| Taux d'ouverture | Ouverts / Envoyés | > 20% |
| Taux de clic | Clics / Ouverts | > 3% |
| Taux de désabonnement | Désabo / Envoyés | < 0.5% |

### Rapport de Campagne
- Graphique d'ouvertures dans le temps
- Liens les plus cliqués
- Répartition par appareil
- Erreurs d'envoi (bounces)

## Optimisation

### Tests A/B
Tester différentes versions:
- Sujets d'email
- Heures d'envoi
- Templates
- Appels à l'action

### Segmentation
Cibler selon:
- Langue
- Comportement passé
- Intérêts
- Activité

### Personnalisation
- Utiliser le prénom
- Contenu adapté aux intérêts
- Recommandations personnalisées

## Gestion des Erreurs

### Bounces (Rebonds)
- **Soft bounce**: Temporaire (boîte pleine)
- **Hard bounce**: Permanent (adresse invalide)

### Actions
- Soft: Réessayer
- Hard: Marquer comme invalide
- 3+ bounces: Désinscrire automatiquement

## Exercice Final

Créez une campagne complète:
1. Basée sur le template créé précédemment
2. Ciblant la liste "Test Formation"
3. Avec un sujet accrocheur
4. Programmée pour demain 10h
5. Envoyez un email de test à vous-même`,
        duration_minutes: 60
      }
    ]
  }
];

// Questions du quiz
const quizQuestions = [
  { question_fr: "Quel protocole est recommandé pour la configuration d'un serveur SMTP professionnel ?", options: [
    { text_fr: "HTTP", is_correct: false },
    { text_fr: "FTP", is_correct: false },
    { text_fr: "TLS/SSL", is_correct: true },
    { text_fr: "UDP", is_correct: false }
  ], module: "Fondamentaux" },
  { question_fr: "Quelle est la résolution recommandée pour les images de bannière sur le site OneHealth ?", options: [
    { text_fr: "800x400 pixels", is_correct: false },
    { text_fr: "1200x400 pixels", is_correct: true },
    { text_fr: "500x500 pixels", is_correct: false },
    { text_fr: "1920x1080 pixels", is_correct: false }
  ], module: "Fondamentaux" },
  { question_fr: "Quel format d'image offre le meilleur compromis entre qualité et taille pour le web ?", options: [
    { text_fr: "BMP", is_correct: false },
    { text_fr: "TIFF", is_correct: false },
    { text_fr: "WebP", is_correct: true },
    { text_fr: "RAW", is_correct: false }
  ], module: "Fondamentaux" },
  { question_fr: "Quelle est la taille maximale recommandée pour une image optimisée sur le site ?", options: [
    { text_fr: "5 Mo", is_correct: false },
    { text_fr: "500 Ko", is_correct: true },
    { text_fr: "10 Mo", is_correct: false },
    { text_fr: "50 Ko", is_correct: false }
  ], module: "Fondamentaux" },
  { question_fr: "Qu'est-ce que le \"alt text\" d'une image ?", options: [
    { text_fr: "Le nom du fichier", is_correct: false },
    { text_fr: "La taille de l'image", is_correct: false },
    { text_fr: "Une description textuelle pour l'accessibilité", is_correct: true },
    { text_fr: "Le format de l'image", is_correct: false }
  ], module: "Fondamentaux" },
  { question_fr: "Quel style d'écriture est recommandé pour le contenu web ?", options: [
    { text_fr: "Académique et formel", is_correct: false },
    { text_fr: "Pyramide inversée (essentiel en premier)", is_correct: true },
    { text_fr: "Chronologique détaillé", is_correct: false },
    { text_fr: "Narratif littéraire", is_correct: false }
  ], module: "Fondamentaux" },
  { question_fr: "Quelle longueur est idéale pour un titre d'article web ?", options: [
    { text_fr: "5-10 mots", is_correct: false },
    { text_fr: "8-12 mots", is_correct: true },
    { text_fr: "20-30 mots", is_correct: false },
    { text_fr: "Plus de 50 mots", is_correct: false }
  ], module: "Fondamentaux" },
  { question_fr: "Quel port SMTP est généralement utilisé pour les connexions sécurisées ?", options: [
    { text_fr: "25", is_correct: false },
    { text_fr: "80", is_correct: false },
    { text_fr: "587 ou 465", is_correct: true },
    { text_fr: "21", is_correct: false }
  ], module: "Fondamentaux" },
  { question_fr: "Combien de plateformes principales composent l'écosystème OneHealth ?", options: [
    { text_fr: "2", is_correct: false },
    { text_fr: "3", is_correct: false },
    { text_fr: "4", is_correct: true },
    { text_fr: "5", is_correct: false }
  ], module: "Architecture" },
  { question_fr: "Quel framework est utilisé pour le frontend public du site OneHealth ?", options: [
    { text_fr: "React", is_correct: false },
    { text_fr: "Vue.js", is_correct: false },
    { text_fr: "Next.js", is_correct: true },
    { text_fr: "Angular", is_correct: false }
  ], module: "Architecture" },
  { question_fr: "Quelle base de données est utilisée par le backend OneHealth ?", options: [
    { text_fr: "PostgreSQL", is_correct: false },
    { text_fr: "MongoDB", is_correct: false },
    { text_fr: "MySQL/MariaDB", is_correct: true },
    { text_fr: "SQLite", is_correct: false }
  ], module: "Architecture" },
  { question_fr: "Quel langage de programmation est utilisé pour le backend ?", options: [
    { text_fr: "Python", is_correct: false },
    { text_fr: "Node.js/Express", is_correct: true },
    { text_fr: "PHP", is_correct: false },
    { text_fr: "Java", is_correct: false }
  ], module: "Architecture" },
  { question_fr: "Dans l'admin panel, où se trouve le Page Builder ?", options: [
    { text_fr: "Menu latéral gauche", is_correct: false },
    { text_fr: "Barre de navigation supérieure", is_correct: true },
    { text_fr: "Pied de page", is_correct: false },
    { text_fr: "Page d'accueil uniquement", is_correct: false }
  ], module: "Architecture" },
  { question_fr: "Quel type de contenu peut être géré via le Page Builder ?", options: [
    { text_fr: "Uniquement les articles", is_correct: false },
    { text_fr: "Uniquement les pages", is_correct: false },
    { text_fr: "Articles, pages, actualités, et plus", is_correct: true },
    { text_fr: "Uniquement les médias", is_correct: false }
  ], module: "Architecture" },
  { question_fr: "Comment accéder aux paramètres généraux du site dans l'admin ?", options: [
    { text_fr: "Via le Page Builder", is_correct: false },
    { text_fr: "Via l'icône engrenage dans le header", is_correct: true },
    { text_fr: "Via le menu Articles", is_correct: false },
    { text_fr: "Via la page d'accueil", is_correct: false }
  ], module: "Architecture" },
  { question_fr: "Quelle fonctionnalité permet de prévisualiser un article avant publication ?", options: [
    { text_fr: "Mode brouillon", is_correct: false },
    { text_fr: "Bouton Preview", is_correct: true },
    { text_fr: "Publication directe", is_correct: false },
    { text_fr: "Export PDF", is_correct: false }
  ], module: "Architecture" },
  { question_fr: "Que signifie OHWR ?", options: [
    { text_fr: "One Health World Report", is_correct: false },
    { text_fr: "One Health Weekly Report", is_correct: true },
    { text_fr: "One Health Web Registry", is_correct: false },
    { text_fr: "One Health Wildlife Research", is_correct: false }
  ], module: "OHWR" },
  { question_fr: "Combien de secteurs sont couverts par l'approche One Health dans OHWR ?", options: [
    { text_fr: "2", is_correct: false },
    { text_fr: "3", is_correct: true },
    { text_fr: "4", is_correct: false },
    { text_fr: "5", is_correct: false }
  ], module: "OHWR" },
  { question_fr: "Quel est le format standard pour un rapport OHWR ?", options: [
    { text_fr: "Format libre", is_correct: false },
    { text_fr: "Semaine épidémiologique avec données géolocalisées", is_correct: true },
    { text_fr: "Rapport mensuel simple", is_correct: false },
    { text_fr: "Tableau Excel uniquement", is_correct: false }
  ], module: "OHWR" },
  { question_fr: "Quelle technologie est utilisée pour la cartographie dans OHWR ?", options: [
    { text_fr: "Google Maps uniquement", is_correct: false },
    { text_fr: "Leaflet avec OpenStreetMap", is_correct: true },
    { text_fr: "Bing Maps", is_correct: false },
    { text_fr: "MapQuest", is_correct: false }
  ], module: "OHWR" },
  { question_fr: "Quel type de données peut être affiché sur la carte OHWR ?", options: [
    { text_fr: "Uniquement les cas humains", is_correct: false },
    { text_fr: "Uniquement les cas animaux", is_correct: false },
    { text_fr: "Cas humains, animaux et environnementaux", is_correct: true },
    { text_fr: "Uniquement les statistiques nationales", is_correct: false }
  ], module: "OHWR" },
  { question_fr: "Comment filtrer les données sur la carte OHWR ?", options: [
    { text_fr: "Impossible de filtrer", is_correct: false },
    { text_fr: "Par période, secteur et maladie", is_correct: true },
    { text_fr: "Uniquement par date", is_correct: false },
    { text_fr: "Uniquement par région", is_correct: false }
  ], module: "OHWR" },
  { question_fr: "Quel est le rôle des \"layers\" (couches) sur la carte ?", options: [
    { text_fr: "Décoration visuelle", is_correct: false },
    { text_fr: "Superposer différents types de données", is_correct: true },
    { text_fr: "Changer la couleur de la carte", is_correct: false },
    { text_fr: "Ajouter des publicités", is_correct: false }
  ], module: "OHWR" },
  { question_fr: "Que signifie un point rouge sur la carte OHWR ?", options: [
    { text_fr: "Hôpital", is_correct: false },
    { text_fr: "Zone de danger", is_correct: false },
    { text_fr: "Cas ou événement sanitaire signalé", is_correct: true },
    { text_fr: "Bureau administratif", is_correct: false }
  ], module: "OHWR" },
  { question_fr: "Que signifie COHRM ?", options: [
    { text_fr: "Community One Health Report Management", is_correct: false },
    { text_fr: "Cameroon One Health Rumor Management", is_correct: true },
    { text_fr: "Central Office Health Risk Monitor", is_correct: false },
    { text_fr: "Collective One Health Resource Module", is_correct: false }
  ], module: "COHRM" },
  { question_fr: "Quel est l'objectif principal du système COHRM ?", options: [
    { text_fr: "Publier des articles", is_correct: false },
    { text_fr: "Collecter et vérifier les rumeurs sanitaires", is_correct: true },
    { text_fr: "Gérer les ressources humaines", is_correct: false },
    { text_fr: "Vendre des produits", is_correct: false }
  ], module: "COHRM" },
  { question_fr: "Quels sont les statuts possibles d'une rumeur dans COHRM ?", options: [
    { text_fr: "Vrai ou Faux uniquement", is_correct: false },
    { text_fr: "Nouvelle, En cours, Vérifiée, Rejetée", is_correct: true },
    { text_fr: "Publié ou Non publié", is_correct: false },
    { text_fr: "Important ou Non important", is_correct: false }
  ], module: "COHRM" },
  { question_fr: "Qui peut soumettre une rumeur dans le système COHRM ?", options: [
    { text_fr: "Uniquement les administrateurs", is_correct: false },
    { text_fr: "Uniquement les médecins", is_correct: false },
    { text_fr: "Le public via formulaire ou les agents de terrain", is_correct: true },
    { text_fr: "Uniquement les ministères", is_correct: false }
  ], module: "COHRM" },
  { question_fr: "Que doit contenir une fiche de rumeur complète ?", options: [
    { text_fr: "Juste le titre", is_correct: false },
    { text_fr: "Source, localisation, description, date, preuves", is_correct: true },
    { text_fr: "Uniquement la localisation", is_correct: false },
    { text_fr: "Uniquement une photo", is_correct: false }
  ], module: "COHRM" },
  { question_fr: "Comment est géolocalisée une rumeur ?", options: [
    { text_fr: "Manuellement uniquement", is_correct: false },
    { text_fr: "GPS automatique uniquement", is_correct: false },
    { text_fr: "GPS automatique ou sélection manuelle sur carte", is_correct: true },
    { text_fr: "Impossible de géolocaliser", is_correct: false }
  ], module: "COHRM" },
  { question_fr: "Quel est le workflow de vérification d'une rumeur ?", options: [
    { text_fr: "Publication immédiate", is_correct: false },
    { text_fr: "Réception → Analyse → Vérification terrain → Décision", is_correct: true },
    { text_fr: "Archivage direct", is_correct: false },
    { text_fr: "Transfert externe uniquement", is_correct: false }
  ], module: "COHRM" },
  { question_fr: "Comment sont notifiés les acteurs lors d'une nouvelle rumeur ?", options: [
    { text_fr: "Par courrier postal", is_correct: false },
    { text_fr: "Par email et/ou notification dans l'app", is_correct: true },
    { text_fr: "Par téléphone uniquement", is_correct: false },
    { text_fr: "Aucune notification", is_correct: false }
  ], module: "COHRM" },
  { question_fr: "Comment est structuré un cours dans OH E-Learning ?", options: [
    { text_fr: "Cours uniquement", is_correct: false },
    { text_fr: "Cours → Leçons", is_correct: false },
    { text_fr: "Cours → Modules → Leçons", is_correct: true },
    { text_fr: "Catégories uniquement", is_correct: false }
  ], module: "E-Learning" },
  { question_fr: "Quel type de contenu peut contenir une leçon ?", options: [
    { text_fr: "Texte uniquement", is_correct: false },
    { text_fr: "Vidéo uniquement", is_correct: false },
    { text_fr: "Texte, vidéo, documents PDF, quiz", is_correct: true },
    { text_fr: "Audio uniquement", is_correct: false }
  ], module: "E-Learning" },
  { question_fr: "Comment un apprenant obtient-il un certificat ?", options: [
    { text_fr: "Automatiquement à l'inscription", is_correct: false },
    { text_fr: "En complétant le cours et réussissant le quiz final", is_correct: true },
    { text_fr: "En payant des frais", is_correct: false },
    { text_fr: "En demandant par email", is_correct: false }
  ], module: "E-Learning" },
  { question_fr: "Qu'est-ce que le \"double opt-in\" pour une newsletter ?", options: [
    { text_fr: "S'inscrire deux fois", is_correct: false },
    { text_fr: "Confirmation par email après inscription", is_correct: true },
    { text_fr: "Payer deux fois", is_correct: false },
    { text_fr: "Avoir deux comptes", is_correct: false }
  ], module: "E-Learning" },
  { question_fr: "Quelles métriques sont suivies pour une campagne newsletter ?", options: [
    { text_fr: "Aucune métrique", is_correct: false },
    { text_fr: "Nombre d'envois uniquement", is_correct: false },
    { text_fr: "Envois, ouvertures, clics, désabonnements", is_correct: true },
    { text_fr: "Revenus uniquement", is_correct: false }
  ], module: "E-Learning" },
  { question_fr: "Comment programmer l'envoi d'une newsletter ?", options: [
    { text_fr: "Impossible de programmer", is_correct: false },
    { text_fr: "En définissant une date et heure d'envoi", is_correct: true },
    { text_fr: "En appelant le support", is_correct: false },
    { text_fr: "Par courrier postal", is_correct: false }
  ], module: "E-Learning" },
  { question_fr: "Quel élément est obligatoire dans chaque email newsletter ?", options: [
    { text_fr: "Une image", is_correct: false },
    { text_fr: "Un lien de désabonnement", is_correct: true },
    { text_fr: "Un numéro de téléphone", is_correct: false },
    { text_fr: "Une adresse postale", is_correct: false }
  ], module: "E-Learning" },
  { question_fr: "Comment créer une newsletter à partir d'un article existant ?", options: [
    { text_fr: "Impossible", is_correct: false },
    { text_fr: "Via l'option \"Créer depuis article\" dans les campagnes", is_correct: true },
    { text_fr: "En copiant-collant manuellement", is_correct: false },
    { text_fr: "En exportant en PDF", is_correct: false }
  ], module: "E-Learning" }
];

// Fonction pour générer un slug
function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  let connection;

  try {
    console.log('Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connecté à la base de données.');

    // 1. Créer le cours
    console.log('\n1. Création du cours...');
    const courseSlug = generateSlug(courseData.title_fr);

    const [courseResult] = await connection.query(`
      INSERT INTO courses (
        title_fr, title_en, slug,
        description_fr, description_en,
        short_description_fr, short_description_en,
        level, duration_hours, estimated_weeks,
        min_passing_score, max_attempts, sequential_modules,
        is_free, status, is_featured,
        learning_objectives, target_audience,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      courseData.title_fr, courseData.title_en, courseSlug,
      courseData.description_fr, courseData.description_en,
      courseData.short_description_fr, courseData.short_description_en,
      courseData.level, courseData.duration_hours, courseData.estimated_weeks,
      courseData.min_passing_score, courseData.max_attempts, courseData.sequential_modules,
      courseData.is_free, courseData.status, courseData.is_featured,
      courseData.learning_objectives, courseData.target_audience
    ]);

    const courseId = courseResult.insertId;
    console.log(`   Cours créé avec ID: ${courseId}`);

    // 2. Créer le quiz final
    console.log('\n2. Création du quiz final...');
    const [quizResult] = await connection.query(`
      INSERT INTO quizzes (
        title_fr, title_en,
        description_fr, description_en,
        instructions_fr, instructions_en,
        quiz_type, time_limit_minutes,
        passing_score, max_attempts,
        shuffle_questions, shuffle_options,
        show_correct_answers, show_explanation,
        show_score_immediately, allow_review,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      'Évaluation Finale - Formation OneHealth',
      'Final Evaluation - OneHealth Training',
      'Quiz de validation de la formation complète sur l\'écosystème OneHealth.cm',
      'Validation quiz for the complete OneHealth.cm ecosystem training',
      'Vous avez 60 minutes pour répondre à 40 questions. Un score minimum de 50% est requis pour obtenir le certificat.',
      'You have 60 minutes to answer 40 questions. A minimum score of 50% is required to obtain the certificate.',
      'final_exam', 60,
      50, 3,
      true, true,
      true, true,
      true, true,
      'published'
    ]);

    const quizId = quizResult.insertId;
    console.log(`   Quiz créé avec ID: ${quizId}`);

    // 3. Créer les questions du quiz
    console.log('\n3. Création des 40 questions...');
    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i];
      const [qResult] = await connection.query(`
        INSERT INTO questions (
          question_text_fr, question_text_en,
          question_type, options, points,
          difficulty, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        q.question_fr,
        q.question_fr, // Même texte pour EN (à traduire)
        'mcq',
        JSON.stringify(q.options),
        1,
        'medium'
      ]);

      // Lier la question au quiz
      await connection.query(`
        INSERT INTO quiz_questions (quiz_id, question_id, sort_order)
        VALUES (?, ?, ?)
      `, [quizId, qResult.insertId, i + 1]);
    }
    console.log(`   40 questions créées et liées au quiz`);

    // 4. Créer les modules et leçons
    console.log('\n4. Création des modules et leçons...');
    let lessonCount = 0;

    for (let m = 0; m < modules.length; m++) {
      const module = modules[m];
      const moduleSlug = generateSlug(module.title_fr);

      // Créer le module
      const [moduleResult] = await connection.query(`
        INSERT INTO course_modules (
          course_id, title_fr, title_en,
          description_fr, description_en,
          sort_order, sequential_lessons,
          status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        courseId, module.title_fr, module.title_en,
        module.description_fr, module.description_en,
        m + 1, true,
        'published'
      ]);

      const moduleId = moduleResult.insertId;
      console.log(`   Module ${m + 1}: ${module.title_fr} (ID: ${moduleId})`);

      // Créer les leçons du module
      for (let l = 0; l < module.lessons.length; l++) {
        const lesson = module.lessons[l];

        await connection.query(`
          INSERT INTO lessons (
            module_id, title_fr, title_en,
            content_fr, content_en,
            content_type,
            duration_minutes, sort_order,
            is_required, completion_type,
            status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          moduleId, lesson.title_fr, lesson.title_en,
          lesson.content_fr, lesson.content_fr, // Même contenu pour EN (à traduire)
          'text',
          lesson.duration_minutes, l + 1,
          true, 'view',
          'published'
        ]);

        lessonCount++;
      }
    }
    console.log(`   ${lessonCount} leçons créées`);

    // 5. Lier le quiz au cours
    console.log('\n5. Liaison du quiz au cours...');
    await connection.query(`
      UPDATE quizzes SET course_id = ? WHERE id = ?
    `, [courseId, quizId]);
    console.log('   Quiz lié au cours');

    // Résumé
    console.log('\n========================================');
    console.log('CRÉATION TERMINÉE AVEC SUCCÈS !');
    console.log('========================================');
    console.log(`Cours: ${courseData.title_fr}`);
    console.log(`  - ID: ${courseId}`);
    console.log(`  - Slug: ${courseSlug}`);
    console.log(`  - 5 modules`);
    console.log(`  - 20 leçons`);
    console.log(`Quiz: Évaluation Finale`);
    console.log(`  - ID: ${quizId}`);
    console.log(`  - 40 questions`);
    console.log('========================================');

  } catch (error) {
    console.error('Erreur:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('Le cours existe peut-être déjà. Vérifiez la base de données.');
    }
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConnexion fermée.');
    }
  }
}

main().catch(console.error);
