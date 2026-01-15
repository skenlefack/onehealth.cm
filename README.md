# 🌐 One Health CMS - Système de Gestion de Contenu Moderne

Un CMS complet et moderne avec backend Node.js/Express, base de données MySQL, et frontend React avec design futuriste.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![MySQL](https://img.shields.io/badge/mysql-%3E%3D8.0-orange)

## 🚀 Fonctionnalités

### Backend API
- ✅ **Authentification JWT** - Login sécurisé avec tokens
- ✅ **Gestion des utilisateurs** - Rôles (admin, editor, author, subscriber)
- ✅ **CRUD Posts** - Articles, pages, news, events, ressources
- ✅ **Catégories & Tags** - Organisation du contenu
- ✅ **Médiathèque** - Upload et gestion de fichiers
- ✅ **Commentaires** - Avec modération
- ✅ **Paramètres du site** - Configuration flexible
- ✅ **Menus dynamiques** - Création de menus
- ✅ **Dashboard** - Statistiques et analytics
- ✅ **Log d'activité** - Suivi des actions

### Admin Panel
- ✅ **Interface moderne** - Design professionnel dark/light mode
- ✅ **Éditeur WYSIWYG** - TinyMCE intégré
- ✅ **Dashboard interactif** - Statistiques en temps réel
- ✅ **Gestion des médias** - Upload drag & drop
- ✅ **SEO intégré** - Meta tags, descriptions
- ✅ **Responsive** - Compatible mobile

### Frontend Public
- ✅ **Design futuriste** - Effets glassmorphism, animations
- ✅ **Performance optimisée** - Chargement rapide
- ✅ **Blog complet** - Liste, filtres, pagination
- ✅ **Articles détaillés** - Partage social, articles liés
- ✅ **Recherche** - Recherche full-text
- ✅ **Newsletter** - Inscription email
- ✅ **Responsive** - Mobile-first

## 📁 Structure du Projet

```
onehealth-cms/
├── backend/                 # API Node.js/Express
│   ├── config/
│   │   ├── db.js           # Configuration MySQL
│   │   └── database.sql    # Schéma BDD
│   ├── middleware/
│   │   └── auth.js         # JWT Authentication
│   ├── routes/
│   │   ├── auth.js         # Routes authentification
│   │   ├── posts.js        # CRUD articles
│   │   ├── categories.js   # CRUD catégories
│   │   ├── tags.js         # CRUD tags
│   │   ├── media.js        # Upload fichiers
│   │   ├── users.js        # Gestion utilisateurs
│   │   ├── comments.js     # Commentaires
│   │   ├── settings.js     # Paramètres
│   │   ├── menus.js        # Menus
│   │   └── dashboard.js    # Stats dashboard
│   ├── uploads/            # Fichiers uploadés
│   ├── server.js           # Point d'entrée
│   ├── package.json
│   └── .env.example
│
├── admin/                   # Panel Admin React
│   ├── src/
│   │   └── AdminApp.jsx    # Application complète
│   └── package.json
│
└── frontend/               # Site Public React
    ├── src/
    │   └── FrontendApp.jsx # Application complète
    └── package.json
```

## ⚙️ Installation

### Prérequis
- Node.js >= 18.0
- MySQL >= 8.0
- npm ou yarn

### 1. Base de données MySQL

```bash
# Créer la base de données
mysql -u root -p < backend/config/database.sql
```

Ou via phpMyAdmin / MySQL Workbench, importez le fichier `backend/config/database.sql`.

### 2. Configuration Backend

```bash
cd backend

# Installer les dépendances
npm install

# Copier et configurer .env
cp .env.example .env

# Éditer .env avec vos paramètres
nano .env
```

**Configuration .env :**
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=onehealth_cms
JWT_SECRET=your-super-secret-key-change-this
FRONTEND_URL=http://localhost:3000
```

```bash
# Démarrer le serveur
npm run dev
```

Le backend sera accessible sur `http://localhost:5000`

### 3. Admin Panel

```bash
cd admin
npm install

# Créer index.js pour React
cat > src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminApp from './AdminApp';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><AdminApp /></React.StrictMode>);
EOF

npm start
```

L'admin sera accessible sur `http://localhost:3001`

### 4. Frontend Public

```bash
cd frontend
npm install

# Créer index.js pour React
cat > src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import FrontendApp from './FrontendApp';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><FrontendApp /></React.StrictMode>);
EOF

npm start
```

Le frontend sera accessible sur `http://localhost:3000`

## 🔐 Connexion Admin

**Compte par défaut :**
- Email: `admin@onehealth.cm`
- Password: `admin123`

⚠️ **Important:** Changez ce mot de passe immédiatement après la première connexion!

## 📡 API Endpoints

### Authentification
```
POST   /api/auth/register     # Inscription
POST   /api/auth/login        # Connexion
GET    /api/auth/me           # Utilisateur actuel
PUT    /api/auth/profile      # Modifier profil
PUT    /api/auth/password     # Changer mot de passe
```

### Posts
```
GET    /api/posts             # Liste (filtres: status, type, category, search)
GET    /api/posts/:slug       # Détail d'un article
POST   /api/posts             # Créer (auth required)
PUT    /api/posts/:id         # Modifier (auth required)
DELETE /api/posts/:id         # Supprimer (admin/editor)
```

### Catégories
```
GET    /api/categories        # Liste
GET    /api/categories/:slug  # Détail
POST   /api/categories        # Créer (admin/editor)
PUT    /api/categories/:id    # Modifier (admin/editor)
DELETE /api/categories/:id    # Supprimer (admin)
```

### Médias
```
GET    /api/media             # Liste
POST   /api/media/upload      # Upload (multipart/form-data)
PUT    /api/media/:id         # Modifier métadonnées
DELETE /api/media/:id         # Supprimer
```

### Dashboard
```
GET    /api/dashboard/stats        # Statistiques
GET    /api/dashboard/recent-posts # Posts récents
GET    /api/dashboard/activity     # Log d'activité
```

## 🎨 Personnalisation

### Couleurs (Frontend)
Modifier dans `frontend/src/FrontendApp.jsx`:
```javascript
const colors = {
  primary: '#00d4ff',
  secondary: '#7c3aed',
  accent: '#f59e0b',
  // ...
};
```

### TinyMCE API Key
Pour l'éditeur WYSIWYG, obtenez une clé gratuite sur [tiny.cloud](https://www.tiny.cloud/) et ajoutez-la dans `AdminApp.jsx`:
```javascript
<Editor apiKey="YOUR_API_KEY" ... />
```

## 🔧 Scripts Disponibles

### Backend
```bash
npm start     # Production
npm run dev   # Développement (nodemon)
```

### Frontend/Admin
```bash
npm start     # Développement
npm run build # Production
```

## 📦 Technologies Utilisées

### Backend
- **Express.js** - Framework web
- **MySQL2** - Connecteur MySQL
- **JWT** - Authentification
- **Multer** - Upload de fichiers
- **bcryptjs** - Hash des mots de passe
- **Helmet** - Sécurité HTTP

### Frontend
- **React 18** - Framework UI
- **TinyMCE** - Éditeur WYSIWYG
- **Lucide React** - Icônes
- **Recharts** - Graphiques (admin)

## 🛡️ Sécurité

- Authentification JWT avec expiration
- Hash bcrypt pour les mots de passe
- Validation des entrées
- Protection CORS
- Headers de sécurité (Helmet)
- Limite de taille des uploads

## 📄 Licence

MIT License - Libre d'utilisation et de modification.

## 🤝 Support

Pour toute question ou problème, créez une issue sur le repository.

---

**Développé avec ❤️ pour One Health Cameroon**
