# AHOUZI Platform

**Villas Ahouzi ERP Suite** — Gestion hôtelière d'excellence pour l'Afrique de l'Ouest

## Architecture

```
PROJET-AHOUZI/
├── apps/
│   ├── web/          # Portail d'administration Next.js 15
│   ├── landing/      # Site de réservation public
│   └── mobile/       # Application React Native (Expo)
├── packages/
│   ├── api/          # Backend NestJS
│   ├── database/     # Schéma Prisma (150+ tables)
│   ├── shared/       # Types & utilitaires partagés
│   └── ui/           # Composants UI partagés
└── docker-compose.yml
```

## Stack technologique

| Couche | Technologie |
|--------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, Shadcn UI |
| Mobile | React Native, Expo |
| Backend | NestJS, TypeScript |
| Base de données | PostgreSQL 16, Prisma ORM |
| Cache | Redis |
| Auth | JWT, Refresh Tokens, RBAC |
| Stockage | AWS S3 Compatible |
| Paiements | CinetPay, PayDunya, Wave, Orange Money, MTN Money, Moov Money, Djamo |

## Démarrage rapide

### Prérequis
- Node.js >= 20
- Docker & Docker Compose
- npm >= 10

### Installation

```bash
# Cloner le projet
git clone <repo-url>
cd PROJET-AHOUZI

# Copier les variables d'environnement
cp .env.example .env

# Installer les dépendances
npm install

# Générer le client Prisma
npm run db:generate
```

### Développement avec Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Initialiser la base de données
npm run db:migrate

# Voir les logs
docker-compose logs -f api
```

### Développement local

```bash
# Terminal 1 - Base de données
docker-compose up -d postgres redis

# Terminal 2 - Backend API
cd packages/api && npm run dev

# Terminal 3 - Frontend Web
cd apps/web && npm run dev

# Terminal 4 - Mobile
cd apps/mobile && npx expo start
```

## Modules de la plateforme

| # | Module | Description |
|---|--------|-------------|
| 1 | Propriétés | Gestion des propriétés, bâtiments, étages, chambres |
| 2 | Réservations | Calendrier, disponibilités, check-in/check-out |
| 3 | Clients | Profils, historique, programme de fidélité |
| 4 | Housekeeping | Planning ménage, statuts chambres, inspections |
| 5 | Maintenance | Tickets, assignations, suivi des coûts |
| 6 | Finance | Factures, paiements, caisse, comptabilité |
| 7 | Dépenses | Charges, taxes, certificats, budget |
| 8 | RH | Employés, présences, congés, paie |
| 9 | Inventaire | Stocks, mouvements, commandes fournisseurs |
| 10 | Blanchisserie | Draps, serviettes, suivi des statuts |
| 11 | Restaurant | Menu, commandes, tables, cuisine |
| 12 | Bar | Inventaire boissons, ventes |
| 13 | Boutique | POS, produits, ventes |
| 14 | Rapports | Tableaux de bord, KPIs, exports PDF/Excel |

## API Documentation

La documentation Swagger est disponible sur : `http://localhost:3001/api/docs`

## Accès par défaut

| Service | URL | Identifiants |
|---------|-----|-------------|
| Web Admin | http://localhost:3000 | admin@ahouzi.ci / Admin123! |
| API | http://localhost:3001/api/v1 | — |
| Swagger | http://localhost:3001/api/docs | — |

## Rôles utilisateurs

- **SUPER_ADMIN** — Accès complet au système
- **GENERAL_MANAGER** — Accès à toutes les propriétés
- **PROPERTY_MANAGER** — Accès à la propriété assignée
- **RECEPTIONIST** — Réservations et check-in/out
- **ACCOUNTANT** — Finance et comptabilité
- **HR_MANAGER** — Ressources humaines
- **HOUSEKEEPING_STAFF** — Opérations ménage
- **MAINTENANCE_TECH** — Tickets de maintenance
- **RESTAURANT_MANAGER** — Restaurant
- **STORE_MANAGER** — Inventaire et boutique

## Déploiement

Voir [docs/deployment.md](./docs/deployment.md) pour les instructions de déploiement en production.

---

© 2024 AHOUZI — Villas Ahouzi. Tous droits réservés.
