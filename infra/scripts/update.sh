#!/bin/bash

# Speakoo Update Script
# This script pulls latest changes and updates the application
# Run as regular user: bash update.sh

set -e

echo "======================================"
echo "Speakoo Update Script"
echo "======================================"
echo ""

APP_ROOT=$(pwd)
API_DIR="$APP_ROOT/apps/api"
DOCKER_DIR="$APP_ROOT/infra/docker"

# Confirm update
echo "This will update the application to the latest version."
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Update cancelled"
    exit 0
fi

# Backup database first
echo "[1/8] Creating database backup..."
if [ -f "$APP_ROOT/infra/scripts/backup-db.sh" ]; then
    bash "$APP_ROOT/infra/scripts/backup-db.sh"
else
    echo "⚠ Backup script not found, skipping backup"
fi

echo ""
echo "[2/8] Stopping services..."
cd "$DOCKER_DIR"
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

echo ""
echo "[3/8] Pulling latest changes..."
cd "$APP_ROOT"
git pull origin main
echo "✓ Code updated"

echo ""
echo "[4/8] Installing dependencies..."
cd "$API_DIR"
npm ci
echo "✓ Dependencies updated"

echo ""
echo "[5/8] Generating Prisma client..."
npx prisma generate
echo "✓ Prisma client generated"

echo ""
echo "[6/8] Building API..."
npm run build
echo "✓ API built"

echo ""
echo "[7/8] Running migrations..."
npx prisma migrate deploy
echo "✓ Migrations applied"

echo ""
echo "[8/8] Starting services..."
cd "$DOCKER_DIR"
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
echo "✓ Services started"

echo ""
echo "Waiting for services to be healthy..."
sleep 10

echo ""
echo "======================================"
echo "✓ Update complete!"
echo "======================================"
echo ""
echo "Services status:"
docker compose ps
echo ""
echo "View logs with: docker compose logs -f api"
echo ""
