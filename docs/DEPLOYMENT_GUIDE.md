# Speakoo — Linux Server Deployment Guide

Complete step-by-step guide for deploying Speakoo to a Linux server.

---

## Prerequisites

### On Your Local Machine
- Git installed
- Access to the Linux server (SSH)
- Server IP address or domain name

### On Linux Server
- Ubuntu 20.04 LTS or newer (or similar Debian-based distro)
- Minimum 2GB RAM, 2 CPU cores
- 20GB+ disk space
- Root or sudo access
- Public IP address or domain name

---

## Part 1: Pre-Deployment Cleanup (Local Machine)

### Step 1: Clean Build Artifacts

```bash
# Navigate to project root
cd d:\Speakoo

# Clean API build artifacts
cd apps\api
Remove-Item -Recurse -Force dist, node_modules -ErrorAction SilentlyContinue
cd ..\..

# Clean mobile build artifacts
cd apps\mobile
Remove-Item -Recurse -Force build, .dart_tool -ErrorAction SilentlyContinue
cd ..\..

# Clean web build artifacts
cd apps\web
Remove-Item -Recurse -Force dist, node_modules -ErrorAction SilentlyContinue
cd ..\..

# Clean Playwright tests
cd PlaywrightTests
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
cd ..
```

### Step 2: Verify .gitignore

Ensure these patterns are in your `.gitignore`:

```
# Node
node_modules/
dist/
*.js (in src folders)
*.js.map

# Environment
.env
.env.local
.env.*.local

# Flutter
build/
.dart_tool/
*.g.dart

# IDE
.vscode/
.idea/
*.swp

# Logs
*.log
logs/
```

### Step 3: Commit and Push Changes

```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "feat: add email/phone unified auth support"

# Push to main branch
git push origin main
```

---

## Part 2: Server Setup

### Step 1: Connect to Server

```bash
# SSH into your server (replace with your details)
ssh username@your-server-ip
# Or if using a key:
ssh -i path/to/key.pem username@your-server-ip
```

### Step 2: Install Docker & Docker Compose

```bash
# Update package index
sudo apt update
sudo apt upgrade -y

# Install prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group (avoid sudo for docker commands)
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker compose version

# Log out and back in for group changes to take effect
exit
# SSH back in
ssh username@your-server-ip
```

### Step 3: Install Node.js & npm (for building)

```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # Should be v20.x.x
npm --version
```

### Step 4: Install Git

```bash
sudo apt install -y git
git --version
```

---

## Part 3: Clone and Configure

### Step 1: Clone Repository

```bash
# Create app directory
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www

# Clone repository
git clone https://github.com/komireddychandureddy/Speakoo.git
cd Speakoo

# Verify
ls -la
```

### Step 2: Create Environment Files

Create production environment files based on the examples:

```bash
# Navigate to API directory
cd /var/www/Speakoo/apps/api

# Create .env.production from template
cp .env.production.example .env.production

# Edit with nano or vim
nano .env.production
```

**`.env.production` Configuration:**

```bash
# === Node Environment ===
NODE_ENV=production

# === Database ===
DATABASE_URL="postgresql://speakoo_user:STRONG_PASSWORD_HERE@postgres:5432/speakoo_prod?schema=public"

# === Redis ===
REDIS_URL="redis://redis:6379"

# === JWT Secrets ===
JWT_SECRET="GENERATE_STRONG_SECRET_HERE_64_CHARS"
JWT_REFRESH_SECRET="GENERATE_ANOTHER_STRONG_SECRET_HERE_64_CHARS"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="30d"

# === Password Security ===
BCRYPT_ROUNDS=12

# === OTP ===
OTP_TTL_MS=600000

# === Email (Resend) ===
RESEND_API_KEY="re_XXXXXXXXXXXXXXXXXXXXXXXXXXXX"
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# === SMS/WhatsApp (Twilio) ===
TWILIO_ACCOUNT_SID="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_WHATSAPP_FROM="+14155238886"

# === LiveKit ===
LIVEKIT_API_KEY="APIxxxxxxxxxxxxxx"
LIVEKIT_API_SECRET="your_secret_here"
LIVEKIT_WS_URL="wss://your-livekit-instance.livekit.cloud"

# === Stripe ===
STRIPE_SECRET_KEY="sk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXX"
STRIPE_WEBHOOK_SECRET="whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXX"
PLATFORM_FEE_PERCENT=5

# === MinIO / S3 ===
MINIO_ENDPOINT="minio:9000"
MINIO_ACCESS_KEY="GENERATE_ACCESS_KEY_HERE"
MINIO_SECRET_KEY="GENERATE_SECRET_KEY_HERE"
MINIO_USE_SSL=false
MINIO_BUCKET_NAME="speakoo-uploads"

# === Captcha (hCaptcha) ===
HCAPTCHA_ENABLED=true
HCAPTCHA_SECRET="0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

# === CORS ===
CORS_ORIGIN="https://yourdomain.com,https://www.yourdomain.com"

# === App URL ===
APP_URL="https://yourdomain.com"
API_URL="https://api.yourdomain.com"

# === Sentry (Optional) ===
SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
```

**Generate Secrets:**

```bash
# Generate JWT secrets (run these commands)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate MinIO credentials
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save and exit (Ctrl+X, then Y, then Enter in nano).

### Step 3: Create Docker Compose Override for Production

```bash
cd /var/www/Speakoo/infra/docker

# Create production override
nano docker-compose.prod.yml
```

**Verify `docker-compose.prod.yml` content:**

```yaml
version: '3.9'

services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data

  redis:
    volumes:
      - redis_data_prod:/data

  minio:
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes:
      - minio_data_prod:/data

  api:
    build:
      context: ../../apps/api
      dockerfile: Dockerfile
    env_file:
      - ../../apps/api/.env.production
    restart: always

volumes:
  postgres_data_prod:
  redis_data_prod:
  minio_data_prod:
```

### Step 4: Create Docker Environment File

```bash
# Create .env for Docker Compose
cd /var/www/Speakoo/infra/docker
nano .env
```

**`.env` for Docker Compose:**

```bash
# Postgres
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE_MATCH_DATABASE_URL

# MinIO
MINIO_ACCESS_KEY=MATCH_API_ENV_ACCESS_KEY
MINIO_SECRET_KEY=MATCH_API_ENV_SECRET_KEY

# LiveKit
LIVEKIT_DEV_KEY=APIxxxxxxxxxxxxxx
LIVEKIT_DEV_SECRET=your_secret_here
```

---

## Part 4: Build and Deploy Backend

### Step 1: Install API Dependencies

```bash
cd /var/www/Speakoo/apps/api
npm ci --production=false
```

### Step 2: Generate Prisma Client

```bash
npx prisma generate
```

### Step 3: Build API

```bash
npm run build
```

### Step 4: Run Database Migration

```bash
# This will create tables in production database
npx prisma migrate deploy
```

### Step 5: Start Services with Docker Compose

```bash
cd /var/www/Speakoo/infra/docker

# Start all services in detached mode
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check status
docker compose ps

# View logs
docker compose logs -f api
```

### Step 6: Verify API is Running

```bash
# Test health endpoint
curl http://localhost:3000/api/v1/health

# Should return: {"status":"ok","timestamp":"..."}
```

---

## Part 5: Configure Nginx Reverse Proxy

### Step 1: Install Nginx

```bash
sudo apt update
sudo apt install -y nginx
```

### Step 2: Configure Nginx Site

```bash
# Copy the Nginx config from repo
sudo cp /var/www/Speakoo/infra/nginx/nginx.conf /etc/nginx/sites-available/speakoo

# Edit for your domain
sudo nano /etc/nginx/sites-available/speakoo
```

**Update these values:**
- Replace `speakoo.duckdns.org` with your domain
- Update SSL certificate paths (we'll set up SSL next)

### Step 3: Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/speakoo /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# If OK, reload
sudo systemctl reload nginx
```

### Step 4: Set Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate (replace with your domain and email)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)

# Verify auto-renewal
sudo certbot renew --dry-run
```

### Step 5: Update Nginx Config with SSL

```bash
sudo nano /etc/nginx/sites-available/speakoo
```

**Update SSL paths:**

```nginx
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

```bash
# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## Part 6: Build and Deploy React Web App

### Step 1: Build React Web App (On Local Machine or Server)

**Option A: Build on Local Machine (Windows PowerShell):**

```powershell
# Navigate to web app directory
cd d:\Speakoo\apps\web

# Install dependencies
npm ci

# Build for production
npm run build

# Verify build succeeded
dir dist\index.html

# Compress build
Compress-Archive -Path dist\* -DestinationPath speakoo-web.zip -Force
```

**Option B: Build on Server (Linux):**

```bash
cd /var/www/Speakoo/apps/web

# Install dependencies
npm ci

# Build for production
npm run build

# Files will be in dist/
ls -la dist/
```

### Step 2: Deploy to Server

**If built on local machine, upload to server:**

```powershell
# Upload zip file
scp speakoo-web.zip root@speakoo.duckdns.org:/tmp/
```

**SSH to server and deploy:**

```bash
ssh root@speakoo.duckdns.org

# Navigate to web root
cd /var/www/html

# Backup current version (optional but recommended)
sudo tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz *

# If uploaded from local machine:
sudo rm -rf *
sudo unzip /tmp/speakoo-web.zip -d .
sudo chown -R www-data:www-data .
sudo chmod -R 755 .
rm /tmp/speakoo-web.zip

# If built on server:
sudo rm -rf /var/www/html/*
sudo cp -r /var/www/Speakoo/apps/web/dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

### Step 3: Verify Deployment

```bash
# Verify files are in place
ls -la /var/www/html/index.html

# Test with curl
curl http://localhost/

# Should return HTML content
```

### Step 4: Clear Browser Cache and Test

From your local machine:
1. Open browser and navigate to `https://speakoo.duckdns.org`
2. Hard refresh: `Ctrl + F5` or `Ctrl + Shift + R`
3. Or clear cache: `Ctrl + Shift + Delete`
4. Test login with email
5. Test login with phone (E.164 format: `+1234567890`)
6. Test registration with optional phone

---

## Part 7: Configure Firewall

### Step 1: Set Up UFW

```bash
# Install UFW if not present
sudo apt install -y ufw

# Allow SSH (IMPORTANT: do this first!)
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Part 8: Set Up System Services (Optional but Recommended)

### Step 1: Create Systemd Service for Docker Compose

```bash
sudo nano /etc/systemd/system/speakoo.service
```

**Service file content:**

```ini
[Unit]
Description=Speakoo Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/var/www/Speakoo/infra/docker
ExecStart=/usr/bin/docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.yml -f docker-compose.prod.yml down
User=yourusername

[Install]
WantedBy=multi-user.target
```

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable speakoo

# Start service
sudo systemctl start speakoo

# Check status
sudo systemctl status speakoo
```

---

## Part 9: Monitoring and Logs

### View Docker Logs

```bash
cd /var/www/Speakoo/infra/docker

# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f postgres
docker compose logs -f redis

# Last 100 lines
docker compose logs --tail=100 api
```

### View Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Access Monitoring Dashboards

- **Prometheus:** `http://your-server-ip:9090`
- **Grafana:** `http://your-server-ip:3001` (default login: admin/admin)

**Note:** These should NOT be exposed publicly. Use SSH tunneling:

```bash
# From your local machine
ssh -L 9090:localhost:9090 -L 3001:localhost:3001 username@your-server-ip

# Then access:
# http://localhost:9090 (Prometheus)
# http://localhost:3001 (Grafana)
```

---

## Part 10: Testing Deployment

### Test API Endpoints

```bash
# Health check
curl https://api.yourdomain.com/api/v1/health

# Register a test user
curl -X POST https://api.yourdomain.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "displayName": "Test User"
  }'

# Login
curl -X POST https://api.yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

### Test Web App

Open browser: `https://yourdomain.com`

- Verify signup works
- Verify login works
- Test phone number input
- Test OTP flow

---

## Part 11: Maintenance & Updates

### Update Application

```bash
# SSH to server
ssh username@your-server-ip

# Navigate to app
cd /var/www/Speakoo

# Pull latest changes
git pull origin main

# Rebuild API
cd apps/api
npm ci
npx prisma generate
npm run build
npx prisma migrate deploy

# Restart services
cd /var/www/Speakoo/infra/docker
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart api

# Check logs
docker compose logs -f api
```

### Backup Database

```bash
# Create backup script
nano ~/backup-db.sh
```

**Backup script:**

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/speakoo"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

docker exec speakoo-postgres pg_dump -U speakoo_user speakoo_prod > $BACKUP_DIR/speakoo_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "speakoo_*.sql" -mtime +7 -delete

echo "Backup completed: speakoo_$DATE.sql"
```

```bash
# Make executable
chmod +x ~/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add line:
0 2 * * * /home/yourusername/backup-db.sh
```

---

## Part 12: Security Hardening

### 1. Change SSH Port (Optional)

```bash
sudo nano /etc/ssh/sshd_config

# Change line:
Port 2222  # Use non-standard port

sudo systemctl restart sshd

# Update UFW
sudo ufw allow 2222/tcp
sudo ufw delete allow OpenSSH
```

### 2. Disable Root Login

```bash
sudo nano /etc/ssh/sshd_config

# Ensure these lines:
PermitRootLogin no
PasswordAuthentication no  # If using SSH keys

sudo systemctl restart sshd
```

### 3. Set Up Fail2Ban

```bash
sudo apt install -y fail2ban

# Create local config
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Enable SSH jail:
[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

# Start service
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. Configure Docker Security

```bash
cd /var/www/Speakoo/infra/docker

# Ensure services don't expose unnecessary ports
# Only expose what Nginx proxies
docker compose -f docker-compose.yml -f docker-compose.prod.yml config
```

---

## Troubleshooting

### API Not Responding

```bash
# Check if container is running
docker compose ps

# Check logs
docker compose logs api

# Restart API
docker compose restart api
```

### Database Connection Issues

```bash
# Check Postgres container
docker compose logs postgres

# Verify DATABASE_URL in .env.production
cat apps/api/.env.production | grep DATABASE_URL

# Test connection from API container
docker compose exec api npx prisma db push --accept-data-loss
```

### Nginx Issues

```bash
# Test config
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues

```bash
# Renew manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

---

## Summary Checklist

- [ ] Server updated and Docker installed
- [ ] Repository cloned to `/var/www/Speakoo`
- [ ] Environment files created and configured
- [ ] API built and database migrated
- [ ] Docker services running
- [ ] Nginx configured with SSL
- [ ] Firewall configured
- [ ] Web app built and served
- [ ] API endpoints tested
- [ ] Web app tested in browser
- [ ] Monitoring dashboards accessible
- [ ] Backup script configured
- [ ] Security hardening applied

---

## Next Steps

After deployment:

1. **Configure DNS** — Point your domain A records to server IP
2. **Test thoroughly** — All auth flows, booking, payments
3. **Set up monitoring alerts** — Grafana alerting for downtime
4. **Configure email templates** — Customize Resend email templates
5. **Enable production analytics** — Sentry, Google Analytics
6. **Load testing** — Use Artillery or k6 to test under load
7. **CDN setup** — Cloudflare or AWS CloudFront for static assets

---

## Support Contacts

- **API Issues:** Check logs in `docker compose logs api`
- **Database Issues:** Check Prisma migrations and connection string
- **Nginx Issues:** Check `/var/log/nginx/error.log`
- **SSL Issues:** Certbot documentation: https://certbot.eff.org/

---

**Deployment Date:** [Fill in when deployed]  
**Deployed By:** [Your name]  
**Server:** [Server IP/hostname]  
**Domain:** [Your domain]
