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

# Validate prerequisites
if [ ! -f "$DOCKER_DIR/.env" ]; then
    echo "Error: .env not found in infra/docker/"
    echo "Please create it from infra/docker/.env.example"
    exit 1
fi

GHCR_OWNER_VAL=$(grep -E "^GHCR_OWNER=" "$DOCKER_DIR/.env" 2>/dev/null | cut -d'=' -f2 | tr -d '"' | xargs)
IMAGE_TAG_VAL=$(grep -E "^IMAGE_TAG=" "$DOCKER_DIR/.env" 2>/dev/null | cut -d'=' -f2 | tr -d '"' | xargs)

if [ -z "$GHCR_OWNER_VAL" ] || [ "$GHCR_OWNER_VAL" = "REPLACE_ME" ]; then
    echo "Error: GHCR_OWNER is not set in infra/docker/.env"
    echo "Add: GHCR_OWNER=<your-github-username-or-org>"
    exit 1
fi

if [ -z "$IMAGE_TAG_VAL" ] || [ "$IMAGE_TAG_VAL" = "REPLACE_ME" ]; then
    echo "Error: IMAGE_TAG is not set in infra/docker/.env"
    echo "Add: IMAGE_TAG=latest"
    exit 1
fi

# Confirm update
echo "This will update the application to the latest version."
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Update cancelled"
    exit 0
fi

# Backup database first
echo "[1/5] Creating database backup..."
if [ -f "$APP_ROOT/infra/scripts/backup-db.sh" ]; then
    bash "$APP_ROOT/infra/scripts/backup-db.sh"
else
    echo "⚠ Backup script not found, skipping backup"
fi

echo ""
echo "[2/5] Stopping services..."
cd "$DOCKER_DIR"
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

echo ""
echo "[3/5] Pulling latest changes..."
cd "$APP_ROOT"
git pull origin main
echo "✓ Code updated"

echo ""
echo "[4/5] Running database migrations..."
cd "$DOCKER_DIR"
# docker compose run starts postgres/redis (via depends_on + healthcheck) then runs migrations
# in the pre-built GHCR image — no local npm/build-tools required
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm api npx prisma migrate deploy
echo "✓ Migrations applied"

echo ""
echo "[5/5] Starting services..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
echo "✓ Services started"

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
