#!/bin/bash

# Speakoo Flutter Web Deployment Script
# This script deploys the Flutter web build to the production server
# Run from local machine: bash deploy-flutter-web.sh

set -e

echo "======================================"
echo "Speakoo Flutter Web Deployment"
echo "======================================"
echo ""

# Configuration - UPDATE THESE VALUES
SERVER_USER="ubuntu"
SERVER_HOST="speakoo.duckdns.org"
SERVER_PATH="/var/www/html"
LOCAL_BUILD_PATH="../mobile/build/web"

# Check if we're in the scripts directory
if [ ! -f "../../apps/mobile/pubspec.yaml" ]; then
    echo "Error: Must run from infra/scripts/ directory"
    exit 1
fi

echo "[1/5] Building Flutter web app..."
cd ../../apps/mobile
flutter build web --release --web-renderer canvaskit
echo "✓ Flutter web built successfully"

echo ""
echo "[2/5] Compressing build..."
cd build/web
tar -czf flutter-web-build.tar.gz *
echo "✓ Build compressed"

echo ""
echo "[3/5] Uploading to server..."
scp flutter-web-build.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/
echo "✓ Uploaded to server"

echo ""
echo "[4/5] Deploying on server..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
    # Backup old build
    sudo mkdir -p /var/backups/speakoo/web
    if [ -d "/var/www/html" ]; then
        sudo tar -czf /var/backups/speakoo/web/backup-$(date +%Y%m%d_%H%M%S).tar.gz -C /var/www/html . || true
    fi
    
    # Clear old files
    sudo rm -rf /var/www/html/*
    
    # Extract new build
    sudo tar -xzf /tmp/flutter-web-build.tar.gz -C /var/www/html/
    
    # Set permissions
    sudo chown -R www-data:www-data /var/www/html
    sudo chmod -R 755 /var/www/html
    
    # Cleanup
    rm /tmp/flutter-web-build.tar.gz
    
    echo "✓ Deployment complete"
EOF

echo ""
echo "[5/5] Reloading Nginx..."
ssh ${SERVER_USER}@${SERVER_HOST} "sudo nginx -t && sudo systemctl reload nginx"
echo "✓ Nginx reloaded"

# Cleanup local build archive
cd ../../apps/mobile/build/web
rm flutter-web-build.tar.gz

echo ""
echo "======================================"
echo "✓ Flutter web deployed successfully!"
echo "======================================"
echo ""
echo "Visit: https://speakoo.duckdns.org"
echo ""
echo "To verify the changes:"
echo "1. Hard refresh: Ctrl+Shift+R"
echo "2. Clear cache: Ctrl+Shift+Delete"
echo "3. Try incognito mode"
echo ""
