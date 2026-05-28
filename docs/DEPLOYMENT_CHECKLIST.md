# Quick Deployment Checklist

Use this checklist when deploying Speakoo to a Linux server.

---

## Pre-Deployment (Local Machine)

- [ ] Clean all build artifacts (`dist/`, `node_modules/`, `build/`)
- [ ] Verify `.gitignore` excludes sensitive files
- [ ] Commit all changes: `git add . && git commit -m "..."`
- [ ] Push to repository: `git push origin main`
- [ ] Test locally one more time

---

## Server Setup

- [ ] SSH into server: `ssh username@server-ip`
- [ ] Install Docker & Docker Compose
- [ ] Install Node.js 20 LTS
- [ ] Install Git
- [ ] Install Nginx
- [ ] Configure UFW firewall (SSH, HTTP, HTTPS)

---

## Application Deployment

- [ ] Clone repo to `/var/www/Speakoo`
- [ ] Create `.env.production` in `apps/api/` with:
  - DATABASE_URL (PostgreSQL)
  - JWT secrets (generate with `crypto.randomBytes(64).toString('hex')`)
  - REDIS_URL
  - STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
  - LIVEKIT credentials
  - RESEND_API_KEY, TWILIO credentials
  - MINIO credentials
  - HCAPTCHA_SECRET
  - CORS_ORIGIN (your domain)
- [ ] Create `.env` in `infra/docker/` with:
  - POSTGRES_PASSWORD
  - MINIO_ACCESS_KEY, MINIO_SECRET_KEY
  - LIVEKIT_DEV_KEY, LIVEKIT_DEV_SECRET
- [ ] Install API dependencies: `cd apps/api && npm ci`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Build API: `npm run build`
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Start Docker services: `cd infra/docker && docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
- [ ] Verify API health: `curl http://localhost:3000/api/v1/health`

---

## Nginx & SSL

- [ ] Copy Nginx config: `sudo cp infra/nginx/nginx.conf /etc/nginx/sites-available/speakoo`
- [ ] Update domain name in config
- [ ] Enable site: `sudo ln -s /etc/nginx/sites-available/speakoo /etc/nginx/sites-enabled/`
- [ ] Test config: `sudo nginx -t`
- [ ] Install Certbot: `sudo apt install certbot python3-certbot-nginx`
- [ ] Obtain SSL cert: `sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com`
- [ ] Update SSL paths in Nginx config
- [ ] Reload Nginx: `sudo systemctl reload nginx`

---

## React Web App

- [ ] Build web app on local machine: `cd apps/web && npm ci && npm run build`
- [ ] Verify dist files: `dir dist\index.html` (Windows) or `ls -la dist/index.html` (Linux)
- [ ] Compress build (if uploading): `Compress-Archive -Path dist\* -DestinationPath speakoo-web.zip -Force`
- [ ] Upload to server: `scp speakoo-web.zip root@server:/tmp/`
- [ ] Deploy on server: Extract to `/var/www/html/`, set permissions
- [ ] Verify files: `ls -la /var/www/html/index.html`
- [ ] Nginx already configured to serve from `/var/www/html`
- [ ] Clear browser cache and test: `Ctrl + F5` or `Ctrl + Shift + Delete`
- [ ] Test login with email
- [ ] Test login with phone (E.164 format: `+1234567890`)
- [ ] Test registration with optional phone

---

## Security

- [ ] Change SSH port (optional)
- [ ] Disable root login in SSH config
- [ ] Install & configure Fail2Ban
- [ ] Verify firewall rules: `sudo ufw status`
- [ ] Ensure only necessary ports exposed in Docker

---

## Testing

- [ ] Test API health: `curl https://api.yourdomain.com/api/v1/health`
- [ ] Test register endpoint
- [ ] Test login endpoint  
- [ ] Test web app in browser: `https://yourdomain.com`
- [ ] Test email/phone registration
- [ ] Test email/phone login
- [ ] Test OTP flow
- [ ] Check Docker logs: `docker compose logs -f api`
- [ ] Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

---

## Post-Deployment

- [ ] Configure DNS A records to point to server IP
- [ ] Set up database backup cron job
- [ ] Configure monitoring alerts in Grafana
- [ ] Set up Sentry for error tracking
- [ ] Load test with Artillery/k6
- [ ] Document deployment date and details

---

## Monitoring Access (via SSH tunnel)

```bash
# From local machine
ssh -L 9090:localhost:9090 -L 3001:localhost:3001 username@server-ip
```

Then access:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

---

## Quick Commands Reference

```bash
# View API logs
cd /var/www/Speakoo/infra/docker
docker compose logs -f api

# Restart API
docker compose restart api

# View all services status
docker compose ps

# Restart Nginx
sudo systemctl restart nginx

# Test Nginx config
sudo nginx -t

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Renew SSL certificate
sudo certbot renew

# Update application
cd /var/www/Speakoo
git pull origin main
cd apps/api
npm ci
npx prisma generate
npm run build
npx prisma migrate deploy
cd ../../infra/docker
docker compose restart api
```

---

## Rollback Procedure

If deployment fails:

```bash
# 1. Check previous commit
git log --oneline -5

# 2. Rollback to previous version
git checkout <previous-commit-hash>

# 3. Rebuild
cd apps/api
npm run build

# 4. Restart services
cd ../../infra/docker
docker compose restart api

# 5. Return to main branch after fixing
git checkout main
```

---

**Last Updated:** May 28, 2026  
**Deployment Guide:** See `DEPLOYMENT_GUIDE.md` for detailed instructions
