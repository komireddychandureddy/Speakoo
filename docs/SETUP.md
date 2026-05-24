# Speakoo — Developer Setup Guide

## Tools You Need to Install

This guide lists every tool required to develop, run, and deploy the Speakoo platform locally and in production. All tools listed are **free and/or open-source**.

---

## 1. Core Development Tools

### Node.js 20 LTS
**Purpose**: Runtime for the NestJS backend API.

```bash
# Windows — download installer from:
https://nodejs.org/en/download

# Or via winget (recommended):
winget install OpenJS.NodeJS.LTS

# Verify:
node --version   # v20.x.x
npm --version    # 10.x.x
```

Install globally after:
```bash
npm install -g @nestjs/cli pnpm
```

---

### Flutter SDK 3.x
**Purpose**: Cross-platform mobile (iOS/Android) and web (admin panel) app.

```bash
# Windows — download from:
https://docs.flutter.dev/get-started/install/windows

# Or via winget:
winget install Google.Flutter

# Verify:
flutter doctor       # shows any missing dependencies
flutter --version
```

Required alongside Flutter:
- **Android Studio** (for Android SDK + emulator): https://developer.android.com/studio
- **Xcode** (for iOS — macOS only): via App Store
- **VS Code Flutter extension**: `ext install Dart-Code.flutter`

#### Running the Flutter app in Chrome (web)

```bash
cd apps/mobile

# 1. Enable web support (one-time setup)
flutter config --enable-web

# 2. Install dependencies and generate code
flutter pub get
dart run build_runner build --delete-conflicting-outputs

# 3. Launch in Chrome
flutter run -d chrome

# 4. Run widget tests on Chrome (headless)
flutter test --platform chrome

# 5. Build a production web bundle
flutter build web --release
# Output: apps/mobile/build/web/  (serve with any static host or nginx)
```

> **Note:** When running locally, the API defaults to `http://localhost:3000/api/v1`.
> Make sure the backend is running (`docker compose up` or `pnpm run start:dev` inside `apps/api`).
> To override: `flutter run -d chrome --dart-define=API_URL=http://your-api-host/api/v1`

---

### Git
**Purpose**: Version control.

```bash
winget install Git.Git

# Configure:
git config --global user.name "Your Name"
git config --global user.email "you@email.com"
```

---

### Docker Desktop
**Purpose**: Run PostgreSQL, Redis, MinIO, and LiveKit locally in containers without installing natively.

```bash
# Download from:
https://www.docker.com/products/docker-desktop/

# Verify after install:
docker --version
docker compose version
```

> Docker Desktop includes Docker Compose v2 automatically.

---

## 2. Database Tools

### PostgreSQL (via Docker — no native install needed)
**Purpose**: Primary relational database for all platform data.

```bash
# Start via docker-compose (included in /infra/docker/docker-compose.yml)
docker compose up -d postgres

# Or standalone:
docker run -d \
  --name speakoo-postgres \
  -e POSTGRES_USER=speakoo \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=speakoo_dev \
  -p 5432:5432 \
  postgres:15-alpine
```

Optional GUI client:
- **TablePlus** (free tier): https://tableplus.com
- **DBeaver** (fully free): https://dbeaver.io

---

### Redis (via Docker)
**Purpose**: Caching, session state, Bull job queues, rate limiting.

```bash
docker run -d \
  --name speakoo-redis \
  -p 6379:6379 \
  redis:7-alpine
```

Optional GUI client:
- **RedisInsight** (free): https://redis.io/redisinsight/

---

### Prisma CLI
**Purpose**: Database migrations, schema management, and type-safe query builder.

```bash
npm install -g prisma

# Inside apps/api:
npx prisma migrate dev    # run migrations
npx prisma studio         # opens visual DB editor at localhost:5555
npx prisma generate       # regenerate client after schema changes
```

---

## 3. Real-Time & Video

### LiveKit Server (via Docker)
**Purpose**: Open-source WebRTC server for video, audio, chat, screen share, and whiteboard data channels.

```bash
# Run LiveKit server locally:
docker run -d \
  --name speakoo-livekit \
  -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882/udp \
  -e LIVEKIT_KEYS="devkey:devsecret" \
  livekit/livekit-server:latest \
  --dev

# Self-host in production: https://docs.livekit.io/home/self-hosting/
```

### LiveKit CLI
**Purpose**: Generate test tokens for local session testing.

```bash
# Windows — download from GitHub releases:
https://github.com/livekit/livekit-cli/releases

# Or via npm:
npm install -g livekit-cli

# Generate a test token:
livekit-cli create-token --api-key devkey --api-secret devsecret \
  --join --room session-test123 --identity learner1
```

---

## 4. Object Storage

### MinIO (via Docker)
**Purpose**: S3-compatible open-source object storage for session recordings, tutor profile photos, and documents.

```bash
docker run -d \
  --name speakoo-minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"

# Open MinIO Console at: http://localhost:9001
```

Production alternative (free tier):
- **Cloudflare R2** — 10 GB free storage, zero egress fees: https://cloudflare.com/r2

---

## 5. Payments

### Stripe CLI
**Purpose**: Test Stripe webhooks locally without deploying.

```bash
# Windows — download from:
https://stripe.com/docs/stripe-cli

# Or via Scoop:
scoop install stripe

# Login and forward webhooks:
stripe login
stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe
```

> Sign up for a free Stripe account at https://stripe.com — test mode is completely free.

---

## 6. Email & Messaging

### Resend Account (free tier)
**Purpose**: Transactional emails (booking confirmation, reminders).

- Sign up at https://resend.com — **3,000 emails/month free**
- Get API key from dashboard → set as `RESEND_API_KEY`

### Twilio Account (for WhatsApp)
**Purpose**: WhatsApp notifications for booking confirmation + reminders.

- Sign up at https://twilio.com — free trial includes WhatsApp sandbox
- Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`

---

## 7. Monitoring & Observability

### Sentry (free tier)
**Purpose**: Real-time error tracking and crash reporting.

- Sign up at https://sentry.io — **5,000 errors/month free**
- Create two projects: `speakoo-api` and `speakoo-mobile`
- Add `SENTRY_DSN` to environment variables

### Prometheus + Grafana (via Docker)
**Purpose**: Server metrics dashboards (CPU, memory, request latency, active sessions).

```bash
# Included in /infra/docker/docker-compose.yml
docker compose up -d prometheus grafana

# Grafana dashboard: http://localhost:3001
# Default login: admin / admin
```

---

## 8. Security Tools

### OWASP ZAP (free)
**Purpose**: Automated security scanning for the REST API.

```bash
# Download from:
https://www.zaproxy.org/download/
```

### Trivy (container vulnerability scanner)
**Purpose**: Scan Docker images for known CVEs before deploying.

```bash
# Windows via Scoop:
scoop install trivy

# Scan an image:
trivy image speakoo-api:latest
```

---

## 9. Infrastructure (for deployment)

### Terraform CLI
**Purpose**: Infrastructure as Code for provisioning cloud resources.

```bash
winget install Hashicorp.Terraform

terraform --version
```

### kubectl + Helm
**Purpose**: Deploy to Kubernetes clusters (optional; use Docker Compose for small scale).

```bash
# kubectl:
winget install Kubernetes.kubectl

# Helm:
winget install Helm.Helm
```

---

## 10. IDE & Extensions

### VS Code Extensions (Recommended)
Install via Extensions panel or:

```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension Dart-Code.flutter
code --install-extension Dart-Code.dart-code
code --install-extension Prisma.prisma
code --install-extension ms-azuretools.vscode-docker
code --install-extension humao.rest-client
code --install-extension bradlc.vscode-tailwindcss
code --install-extension github.copilot
code --install-extension github.copilot-chat
```

---

## 11. Quick Start (All-in-One)

After cloning the repo:

```bash
# 1. Start all infrastructure services
cd infra/docker
docker compose up -d

# 2. Install backend dependencies
cd ../../apps/api
pnpm install

# 3. Copy env file and fill in values
cp .env.example .env

# 4. Run DB migrations
npx prisma migrate dev

# 5. Start the API
pnpm run start:dev

# 6. Install Flutter dependencies
cd ../mobile
flutter pub get

# 7. Run the mobile app (with a connected device or emulator)
flutter run

# OR run in Chrome (web browser)
flutter config --enable-web   # only needed once
flutter run -d chrome
```

---

## Summary Table

| Category | Tool | Free | Open Source |
|---|---|---|---|
| Backend runtime | Node.js 20 LTS | ✅ | ✅ |
| Backend framework | NestJS | ✅ | ✅ |
| Mobile/Web | Flutter | ✅ | ✅ |
| Database | PostgreSQL 15 | ✅ | ✅ |
| Cache / Queues | Redis 7 | ✅ | ✅ |
| ORM | Prisma | ✅ | ✅ |
| Video / WebRTC | LiveKit | ✅ | ✅ |
| Object Storage | MinIO | ✅ | ✅ |
| Object Storage (cloud) | Cloudflare R2 | ✅ (10 GB) | ❌ |
| Payments | Stripe | Free to use | ❌ |
| Email | Resend | ✅ (3k/mo) | ❌ |
| WhatsApp | Twilio | Trial credit | ❌ |
| Error tracking | Sentry | ✅ (5k errors) | ✅ |
| Metrics | Prometheus + Grafana | ✅ | ✅ |
| Auth | JWT (custom) | ✅ | ✅ |
| Containers | Docker | ✅ | ✅ |
| CI/CD | GitHub Actions | ✅ (2000 min/mo) | ✅ |
| IaC | Terraform | ✅ | ✅ |
| Security scan | Trivy | ✅ | ✅ |
| Security scan | OWASP ZAP | ✅ | ✅ |
| Package manager | pnpm | ✅ | ✅ |
