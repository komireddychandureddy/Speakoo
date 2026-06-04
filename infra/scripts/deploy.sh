#!/bin/bash

# Speakoo Deployment Script
# This script deploys the Speakoo application using pre-built GHCR images
# Run as regular user (not root): bash deploy.sh

set -e  # Exit on error

echo "======================================"
echo "Speakoo Deployment Script"
echo "======================================"
echo ""

# Check we're in the right directory
if [ ! -d "apps/api" ] || [ ! -d "infra/docker" ]; then
    echo "Error: Must run from repository root (apps/api and infra/docker must exist)"
    exit 1
fi

APP_ROOT=$(pwd)
API_DIR="$APP_ROOT/apps/api"
WEB_DIR="$APP_ROOT/apps/web"
DOCKER_DIR="$APP_ROOT/infra/docker"

fix_web_permissions() {
    local current_uid
    current_uid=$(id -u)

    if [ -d "$WEB_DIR/node_modules" ]; then
        local owner_uid
        owner_uid=$(stat -c '%u' "$WEB_DIR/node_modules" 2>/dev/null || echo "$current_uid")
        if [ "$owner_uid" != "$current_uid" ]; then
            echo "⚠ Detected root-owned web node_modules. Attempting permission repair..."
            if command -v sudo >/dev/null 2>&1; then
                sudo chown -R "$(id -u):$(id -g)" "$WEB_DIR/node_modules" || true
            fi
        fi
    fi

    if [ -d "$HOME/.npm" ] && [ ! -w "$HOME/.npm" ]; then
        echo "⚠ ~/.npm is not writable. Attempting permission repair..."
        if command -v sudo >/dev/null 2>&1; then
            sudo chown -R "$(id -u):$(id -g)" "$HOME/.npm" || true
        fi
    fi
}

# Check required files exist
if [ ! -f "$API_DIR/.env.production" ]; then
    echo "Error: .env.production not found in apps/api/"
    echo "Please create it from .env.production.example"
    exit 1
fi

cp "$API_DIR/.env.production" "$API_DIR/.env"
echo "✓ Synced apps/api/.env from .env.production"

if [ ! -f "$DOCKER_DIR/.env" ]; then
    echo "Error: .env not found in infra/docker/"
    echo "Please create it from infra/docker/.env.example"
    exit 1
fi

if [ ! -d "$WEB_DIR" ] || [ ! -f "$WEB_DIR/package.json" ]; then
    echo "Error: apps/web not found or missing package.json"
    exit 1
fi

# Validate required production variables
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

echo "[1/5] Building web app..."
cd "$WEB_DIR"
fix_web_permissions
mkdir -p "$WEB_DIR/.npm-cache"
npm ci --cache "$WEB_DIR/.npm-cache" --no-audit --no-fund
npm run build
echo "✓ Web app built to apps/web/dist"

echo ""
echo "[2/5] Pulling latest Docker image..."
cd "$DOCKER_DIR"
GHCR_TOKEN_VAL=$(grep -E "^GHCR_TOKEN=" "$DOCKER_DIR/.env" 2>/dev/null | cut -d'=' -f2 | tr -d '"' | xargs)
if [ -z "$GHCR_TOKEN_VAL" ] || [ "$GHCR_TOKEN_VAL" = "REPLACE_ME" ]; then
    echo "Error: GHCR_TOKEN is not set in infra/docker/.env"
    echo "Create a GitHub Personal Access Token with read:packages scope at:"
    echo "  https://github.com/settings/tokens"
    echo "Then add it to infra/docker/.env: GHCR_TOKEN=<your-token>"
    exit 1
fi
echo "$GHCR_TOKEN_VAL" | docker login ghcr.io -u "$GHCR_OWNER_VAL" --password-stdin
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull api
echo "✓ Image updated"

echo ""
echo "[3/5] Running database migrations..."
# docker compose run starts postgres/redis (via depends_on + healthcheck) then runs migrations
# in the pre-built GHCR image — no local npm/build-tools required
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm api npx prisma migrate deploy
echo "✓ Migrations applied"

echo ""
echo "[4/5] Starting all services..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
if docker compose -f docker-compose.yml -f docker-compose.prod.yml ps nginx >/dev/null 2>&1; then
    docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T nginx nginx -s reload || true
fi
echo "✓ Services started"

echo ""
echo "[5/5] Testing API health..."
API_HEALTH_OK=0
for i in {1..12}; do
    if curl -fsS http://localhost:3000/api/v1/health >/dev/null 2>&1; then
        API_HEALTH_OK=1
        break
    fi
    sleep 5
done

if [ "$API_HEALTH_OK" -eq 1 ]; then
    echo "✓ API is healthy!"
else
    echo "✗ API health check failed after 60s"
    echo "Recent API logs:"
    docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=80 api || true
    exit 1
fi

echo ""
echo "======================================"
echo "✓ Deployment complete!"
echo "======================================"
echo ""
echo "Services running:"
docker compose ps
echo ""
echo "View logs:"
echo "  docker compose logs -f api"
echo "  docker compose logs -f postgres"
echo ""
echo "Next steps:"
echo "1. Configure Nginx (see DEPLOYMENT_GUIDE.md)"
echo "2. Set up SSL with Certbot"
echo "3. Test endpoints"
echo ""
