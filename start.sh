#!/usr/bin/env bash
set -e

echo "================================================="
echo "  AHOUZI PLATFORM - Démarrage"
echo "================================================="

# 1. Vérifier que Docker est disponible
if ! command -v docker &> /dev/null; then
  echo "❌ Docker n'est pas installé. Installez Docker Desktop et réessayez."
  exit 1
fi

# 2. Démarrer PostgreSQL et Redis
echo ""
echo "▶ Démarrage de PostgreSQL et Redis..."
docker compose up postgres redis -d --wait

# 3. Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
  echo ""
  echo "▶ Installation des dépendances..."
  npm install --legacy-peer-deps
fi

# 4. Générer le client Prisma
echo ""
echo "▶ Génération du client Prisma..."
npm run db:generate

# 5. Appliquer les migrations
echo ""
echo "▶ Application des migrations de base de données..."
npm run db:push

# 6. Insérer les données de démo
echo ""
echo "▶ Insertion des données de démo (seed)..."
npm run db:seed || echo "  (seed déjà effectué ou erreur ignorée)"

# 7. Démarrer l'API et le Frontend
echo ""
echo "▶ Démarrage de l'API NestJS et du frontend Next.js..."
echo ""
echo "  API   → http://localhost:3001/api/v1"
echo "  Docs  → http://localhost:3001/api/docs"
echo "  Web   → http://localhost:3000"
echo ""
echo "  Comptes de démonstration:"
echo "    admin@ahouzi.ci    / Admin@2024"
echo "    manager@ahouzi.ci  / Manager@2024"
echo "    reception@ahouzi.ci/ Reception@2024"
echo ""
echo "  Ctrl+C pour arrêter"
echo "================================================="

npm run dev
