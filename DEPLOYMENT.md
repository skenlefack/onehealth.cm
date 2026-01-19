# One Health CMS - Guide de Deploiement Production

## Serveur de Production

**Hebergeur:** Infomaniak VPS Lite
**IP:** 84.234.19.107
**IPv6:** 2001:1600:13:101::12fb
**OS:** Ubuntu 24.04 LTS
**Ressources:** 4 CPU, 4GB RAM, 80GB SSD

### Connexion SSH

```bash
ssh -i "server/OneHealthCmServerKey" ubuntu@84.234.19.107
```

Depuis le repertoire du projet:
```bash
ssh -i "C:\dev\onehealth-cms\server\OneHealthCmServerKey" ubuntu@84.234.19.107
```

---

## URLs Production

| Service | URL |
|---------|-----|
| Site principal | https://onehealth.cm |
| Site (www) | https://www.onehealth.cm |
| Admin CMS | https://admin.onehealth.cm |
| API | https://onehealth.cm/api |
| Portainer (Docker UI) | https://portainer.onehealth.cm |

---

## Architecture Docker

```
/var/www/onehealth-cms/
├── docker-compose.prod.yml
├── .env (credentials production)
├── backend/
├── frontend-next/
├── admin/
└── docker/
    ├── nginx/conf.d/default.conf
    └── certbot/
```

### Containers

| Container | Image | Port |
|-----------|-------|------|
| onehealth-db | mysql:8.0 | 3306 |
| onehealth-backend | onehealth-cms-backend | 5000 |
| onehealth-frontend | onehealth-cms-frontend | 3002 |
| onehealth-admin | onehealth-cms-admin | 80 |
| onehealth-nginx | nginx:alpine | 80, 443 |
| onehealth-certbot | certbot/certbot | - |
| portainer | portainer/portainer-ce | 9000, 9443 |

---

## Commandes de Deploiement

### 1. Se connecter au serveur
```bash
ssh -i "server/OneHealthCmServerKey" ubuntu@84.234.19.107
cd /var/www/onehealth-cms
```

### 2. Mettre a jour le code
```bash
# Option A: Via Git (si configure)
git pull origin main

# Option B: Via SCP (depuis local)
# Voir section "Transfert de fichiers"
```

### 3. Reconstruire et redemarrer les services

**Frontend uniquement:**
```bash
sudo docker compose -f docker-compose.prod.yml build frontend --no-cache
sudo docker compose -f docker-compose.prod.yml up -d frontend
```

**Backend uniquement:**
```bash
sudo docker compose -f docker-compose.prod.yml build backend --no-cache
sudo docker compose -f docker-compose.prod.yml up -d backend
```

**Admin uniquement:**
```bash
sudo docker compose -f docker-compose.prod.yml build admin --no-cache
sudo docker compose -f docker-compose.prod.yml up -d admin
```

**Tous les services:**
```bash
sudo docker compose -f docker-compose.prod.yml build --no-cache
sudo docker compose -f docker-compose.prod.yml up -d
```

### 4. Verifier le statut
```bash
sudo docker compose -f docker-compose.prod.yml ps
sudo docker compose -f docker-compose.prod.yml logs -f [service]
```

---

## Transfert de Fichiers (depuis Windows local)

### Fichier unique
```bash
scp -i "server/OneHealthCmServerKey" fichier.js ubuntu@84.234.19.107:/tmp/
ssh -i "server/OneHealthCmServerKey" ubuntu@84.234.19.107 "sudo cp /tmp/fichier.js /var/www/onehealth-cms/chemin/"
```

### Dossier complet
```bash
# Creer archive
tar -cvf update.tar dossier/

# Transferer
scp -i "server/OneHealthCmServerKey" update.tar ubuntu@84.234.19.107:/tmp/

# Extraire sur serveur
ssh -i "server/OneHealthCmServerKey" ubuntu@84.234.19.107 "cd /tmp && tar -xvf update.tar && sudo cp -r dossier/* /var/www/onehealth-cms/chemin/"
```

---

## Base de Donnees

### Credentials Production
- **Host:** db (interne Docker)
- **Database:** onehealth_cms
- **User:** onehealth_user
- **Root Password:** 2XyUxS9BZZ3r2XW//IpAMCdyVYomSTdo

### Exporter la base locale
```bash
docker exec onehealth-db mysqldump -u root -prootpassword onehealth_cms > db_export.sql
```

### Importer en production
```bash
# Transferer
scp -i "server/OneHealthCmServerKey" db_export.sql ubuntu@84.234.19.107:/tmp/

# Importer
ssh -i "server/OneHealthCmServerKey" ubuntu@84.234.19.107 "sudo docker exec -i onehealth-db mysql -u root -p'2XyUxS9BZZ3r2XW//IpAMCdyVYomSTdo' onehealth_cms < /tmp/db_export.sql"
```

### Executer une migration
```bash
ssh -i "server/OneHealthCmServerKey" ubuntu@84.234.19.107 "sudo docker exec -i onehealth-db mysql -u root -p'2XyUxS9BZZ3r2XW//IpAMCdyVYomSTdo' onehealth_cms < /tmp/migration.sql"
```

---

## Uploads

### Synchroniser les uploads locaux vers production
```bash
# Creer archive des uploads
tar -cvf uploads.tar backend/uploads/

# Transferer
scp -i "server/OneHealthCmServerKey" uploads.tar ubuntu@84.234.19.107:/tmp/

# Extraire et copier
ssh -i "server/OneHealthCmServerKey" ubuntu@84.234.19.107 "cd /tmp && tar -xvf uploads.tar && sudo cp -r backend/uploads/* /var/www/onehealth-cms/backend/uploads/ && sudo chown -R 1001:1001 /var/www/onehealth-cms/backend/uploads/"

# Copier vers le volume Docker
ssh -i "server/OneHealthCmServerKey" ubuntu@84.234.19.107 "sudo docker run --rm -v onehealth-cms_uploads_data:/uploads -v /var/www/onehealth-cms/backend/uploads:/source alpine sh -c 'cp -r /source/* /uploads/ && chown -R 1001:1001 /uploads'"
```

---

## SSL / Certificats

**Certificat:** Let's Encrypt (auto-renouvellement)
**Expiration:** 18-19 avril 2026
**Domaines couverts:** onehealth.cm, www.onehealth.cm, admin.onehealth.cm, portainer.onehealth.cm

### Renouveler manuellement (si necessaire)
```bash
ssh -i "server/OneHealthCmServerKey" ubuntu@84.234.19.107 "cd /var/www/onehealth-cms && sudo docker compose -f docker-compose.prod.yml run --rm certbot renew"
```

---

## SMTP / Email

**Serveur:** mail.infomaniak.com
**Port:** 587
**User:** contact@onehealth.cm
**Securite:** STARTTLS

---

## Portainer - Interface Web Docker

**URL:** https://portainer.onehealth.cm

### Fonctionnalites

| Fonctionnalite | Description |
|----------------|-------------|
| **Containers** | Voir etat, logs, restart, stop, supprimer |
| **Images** | Gerer les images Docker |
| **Volumes** | Voir les donnees persistantes |
| **Networks** | Voir les reseaux Docker |
| **Stacks** | Deployer des docker-compose |
| **Logs** | Voir les logs en temps reel |
| **Stats** | CPU, RAM, reseau de chaque container |
| **Console** | Acces terminal dans les containers |

### Gestion via Portainer

Au lieu d'utiliser SSH, tu peux :
1. Aller sur https://portainer.onehealth.cm
2. Cliquer sur "local" > "Containers"
3. Voir l'etat de tous les containers
4. Cliquer sur un container pour voir les logs, stats, ou le redemarrer

### Reinstaller Portainer (si necessaire)
```bash
ssh -i "server/OneHealthCmServerKey" ubuntu@84.234.19.107 "sudo docker stop portainer && sudo docker rm portainer && sudo docker run -d -p 9000:9000 -p 9443:9443 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest"
```

---

## Workflow de Developpement

### 1. Developper en local
```bash
# Demarrer l'environnement local
docker compose up -d

# Acceder aux services
# Frontend: http://localhost:3002
# Admin: http://localhost:3001
# API: http://localhost:5000
```

### 2. Tester les modifications

### 3. Commiter dans Git
```bash
git add .
git commit -m "feat: description de la fonctionnalite"
git push origin main
```

### 4. Deployer en production
```bash
# Transferer les fichiers modifies
scp -i "server/OneHealthCmServerKey" chemin/fichier ubuntu@84.234.19.107:/tmp/

# Copier et reconstruire (exemple frontend)
ssh -i "server/OneHealthCmServerKey" ubuntu@84.234.19.107 "sudo cp /tmp/fichier /var/www/onehealth-cms/frontend-next/chemin/ && cd /var/www/onehealth-cms && sudo docker compose -f docker-compose.prod.yml build frontend --no-cache && sudo docker compose -f docker-compose.prod.yml up -d frontend"
```

---

## Problemes Connus et Solutions

### Images des articles ne s'affichent pas
**Cause:** Next.js Image optimization ne peut pas acceder aux uploads internes
**Solution:** Utiliser le custom loader (`frontend-next/lib/imageLoader.js`) qui sert les images directement

### Permission denied sur uploads
**Cause:** Le container backend utilise l'utilisateur expressjs (UID 1001)
**Solution:**
```bash
sudo chown -R 1001:1001 /var/www/onehealth-cms/backend/uploads
```

### Container backend en restart loop
**Cause:** Dossiers uploads manquants
**Solution:**
```bash
sudo mkdir -p backend/uploads/elearning/videos backend/uploads/elearning/thumbnails
sudo chown -R 1001:1001 backend/uploads
```

---

## Contacts

- **Domaine:** Infomaniak
- **Email:** contact@onehealth.cm
- **Support technique:** [A completer]

---

*Derniere mise a jour: 19 janvier 2026*
