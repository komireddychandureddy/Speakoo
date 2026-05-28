#!/bin/bash

# Speakoo Server Setup Script
# This script automates the initial server setup for Ubuntu 20.04+
# Run with: sudo bash setup-server.sh

set -e  # Exit on error

echo "======================================"
echo "Speakoo Server Setup Script"
echo "======================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Get the actual user (not root)
ACTUAL_USER="${SUDO_USER:-$USER}"
echo "Setting up for user: $ACTUAL_USER"
echo ""

# Update system
echo "[1/8] Updating system packages..."
apt update
apt upgrade -y

# Install Docker
echo "[2/8] Installing Docker..."
if ! command -v docker &> /dev/null; then
    apt install -y ca-certificates curl gnupg lsb-release
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    usermod -aG docker $ACTUAL_USER
    echo "✓ Docker installed"
else
    echo "✓ Docker already installed"
fi

# Install Node.js 20 (upgrade if existing version is older)
echo "[3/8] Installing Node.js 20..."
NODE_MAJOR=0
if command -v node &> /dev/null; then
    NODE_MAJOR=$(node -e "process.stdout.write(process.versions.node.split('.')[0])")
fi
if [ "$NODE_MAJOR" -lt 20 ] 2>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    echo "✓ Node.js installed: $(node --version)"
else
    echo "✓ Node.js already installed and up to date: $(node --version)"
fi

# Install Git
echo "[4/8] Installing Git..."
if ! command -v git &> /dev/null; then
    apt install -y git
    echo "✓ Git installed"
else
    echo "✓ Git already installed"
fi

# Install Nginx
echo "[5/8] Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl enable nginx
    echo "✓ Nginx installed"
else
    echo "✓ Nginx already installed"
fi

# Install Certbot
echo "[6/8] Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
    echo "✓ Certbot installed"
else
    echo "✓ Certbot already installed"
fi

# Install Fail2Ban
echo "[7/8] Installing Fail2Ban..."
if ! command -v fail2ban-client &> /dev/null; then
    apt install -y fail2ban
    cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
    systemctl enable fail2ban
    systemctl start fail2ban
    echo "✓ Fail2Ban installed"
else
    echo "✓ Fail2Ban already installed"
fi

# Configure UFW Firewall
echo "[8/8] Configuring UFW firewall..."
if command -v ufw &> /dev/null; then
    # Allow SSH (important!)
    ufw allow OpenSSH
    # Allow HTTP and HTTPS
    ufw allow 'Nginx Full'
    # Enable firewall
    echo "y" | ufw enable
    echo "✓ UFW configured"
else
    apt install -y ufw
    ufw allow OpenSSH
    ufw allow 'Nginx Full'
    echo "y" | ufw enable
    echo "✓ UFW installed and configured"
fi

# Create application directory
echo ""
echo "Creating application directory..."
mkdir -p /var/www
chown -R $ACTUAL_USER:$ACTUAL_USER /var/www
echo "✓ /var/www created and owned by $ACTUAL_USER"

# Create backup directory
echo "Creating backup directory..."
mkdir -p /var/backups/speakoo
chown -R $ACTUAL_USER:$ACTUAL_USER /var/backups/speakoo
echo "✓ /var/backups/speakoo created"

echo ""
echo "======================================"
echo "✓ Server setup complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Log out and log back in (for Docker group to take effect)"
echo "2. Clone the repository:"
echo "   cd /var/www"
echo "   git clone https://github.com/komireddychandureddy/Speakoo.git"
echo "3. Follow the DEPLOYMENT_GUIDE.md for remaining steps"
echo ""
echo "Installed versions:"
echo "- Docker: $(docker --version)"
echo "- Node.js: $(node --version)"
echo "- Git: $(git --version)"
echo "- Nginx: $(nginx -v 2>&1)"
echo ""
