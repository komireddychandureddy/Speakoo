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
DOCKER_DIR="$APP_ROOT/infra/docker"

# Check required files exist
if [ ! -f "$API_DIR/.env.production" ]; then
    echo "Error: .env.production not found in apps/api/"
    echo "Please create it from .env.production.example"
    exit 1
fi

if [ ! -f "$DOCKER_DIR/.env" ]; then
    echo "Error: .env not found in infra/docker/"
    echo "Please create it with Docker environment variables"
    exit 1
fi

echo "[1/3] Running database migrations..."
cd "$DOCKER_DIR"
# docker compose run starts postgres/redis (via depends_on + healthcheck) then runs migrations
# in the pre-built GHCR image — no local npm/build-tools required
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm api npx prisma migrate deploy
echo "✓ Migrations applied"

echo ""
echo "[2/3] Starting all services..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
echo "✓ Services started"

echo ""
echo "[3/3] Testing API health..."
sleep 15
HEALTH_CHECK=$(curl -s http://localhost:3000/api/v1/health || echo "failed")
if [[ $HEALTH_CHECK == *"ok"* ]]; then
    echo "✓ API is healthy!"
else
    echo "⚠ Warning: Health check failed. Check logs with: docker compose logs api"
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
