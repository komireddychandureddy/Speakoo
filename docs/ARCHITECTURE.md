# Speakoo — System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Flutter Mobile  │  │   Flutter Web    │  │  Admin Web Panel │  │
│  │  (iOS/Android)   │  │  (Landing page)  │  │  (Flutter Web)   │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
└───────────┼─────────────────────┼─────────────────────┼────────────┘
            │                     │                     │
            └─────────────────────┼─────────────────────┘
                                  │ HTTPS / WSS
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API LAYER (NestJS)                          │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  REST API   │  │  WebSocket   │  │  Stripe Webhook Handler  │   │
│  │  /api/v1/*  │  │  Gateway     │  │  /api/v1/webhooks/stripe │   │
│  └──────┬──────┘  └──────┬───────┘  └──────────────────────────┘   │
│         │                │                                          │
│  ┌──────▼────────────────▼────────────────────────────────────────┐ │
│  │               NestJS Modules                                   │ │
│  │  auth | users | tutors | learners | bookings | sessions        │ │
│  │  payments | wallet | notifications | feedback | gamification   │ │
│  │  admin | languages | forum | ai-assessment                     │ │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
            │                     │                     │
   ┌────────▼──────┐    ┌─────────▼──────┐    ┌────────▼──────────┐
   │  PostgreSQL   │    │     Redis       │    │    LiveKit Server  │
   │  (primary DB) │    │  (cache/queues) │    │  (video/WebRTC)   │
   └───────────────┘    └────────────────┘    └───────────────────┘
            │                     │
   ┌────────▼──────┐    ┌─────────▼──────┐
   │  Prisma ORM   │    │  Bull Queues    │
   │  (migrations) │    │  (reminders)   │
   └───────────────┘    └────────────────┘

External Services:
  Stripe Connect ─── Payments + Tutor Payouts
  Resend ─────────── Transactional Emails
  Twilio ─────────── WhatsApp Notifications
  MinIO/R2 ────────── File Storage (recordings, avatars, docs)
  Sentry ──────────── Error Tracking
  Prometheus/Grafana ─ Metrics Dashboards
```

---

## Core Data Models

### User / Profile
```
users
  id            UUID PK
  email         TEXT UNIQUE NOT NULL
  password_hash TEXT NOT NULL
  role          ENUM('learner','tutor','admin')
  is_verified   BOOLEAN DEFAULT false
  created_at    TIMESTAMPTZ DEFAULT NOW()

user_profiles
  id              UUID PK
  user_id         UUID FK → users.id
  display_name    TEXT
  avatar_url      TEXT
  timezone        TEXT   (IANA timezone string, e.g. 'America/New_York')
  native_language TEXT
  bio             TEXT
  country_code    TEXT
```

### Tutor-Specific
```
tutor_profiles
  id               UUID PK
  user_id          UUID FK → users.id
  languages_taught TEXT[]  (array of language codes)
  hourly_rate_cents INT    (stored in cents)
  cefr_specialties TEXT[]
  intro_video_url  TEXT
  is_approved      BOOLEAN DEFAULT false
  stripe_account_id TEXT   (Stripe Connect Express account ID)

availability_slots
  id           UUID PK
  tutor_id     UUID FK → tutor_profiles.id
  start_time   TIMESTAMPTZ
  end_time     TIMESTAMPTZ
  status       ENUM('available','booked','blocked')
```

### Booking & Sessions
```
bookings
  id               UUID PK
  learner_id       UUID FK → users.id
  tutor_id         UUID FK → users.id
  slot_id          UUID FK → availability_slots.id
  language         TEXT
  status           ENUM('pending','confirmed','in_session','completed','cancelled')
  price_cents      INT
  platform_fee_cents INT
  livekit_room     TEXT   ('session-{id}')
  created_at       TIMESTAMPTZ

sessions
  id               UUID PK
  booking_id       UUID FK → bookings.id UNIQUE
  started_at       TIMESTAMPTZ
  ended_at         TIMESTAMPTZ
  duration_minutes INT
  recording_url    TEXT   (null if not recorded)
```

### Payments & Wallet
```
payments
  id                 UUID PK
  booking_id         UUID FK → bookings.id
  stripe_payment_intent TEXT
  amount_cents       INT
  currency           TEXT DEFAULT 'usd'
  status             ENUM('pending','succeeded','failed','refunded')
  created_at         TIMESTAMPTZ

wallet_transactions
  id            UUID PK
  user_id       UUID FK → users.id
  type          ENUM('credit','debit','refund','payout')
  amount_cents  INT
  balance_after INT
  reference_id  TEXT   (booking/payout ID)
  created_at    TIMESTAMPTZ

credit_bundles
  id            UUID PK
  name          TEXT   (e.g. "Starter Pack – 5 hrs")
  credits       INT
  price_cents   INT
  is_active     BOOLEAN
```

### Notifications
```
notification_log
  id            UUID PK
  user_id       UUID FK → users.id
  booking_id    UUID FK → bookings.id
  type          ENUM('booking_confirmed','reminder_60min','reminder_10min','session_summary','payout')
  channel       ENUM('email','whatsapp','push')
  sent_at       TIMESTAMPTZ
  idempotency_key TEXT UNIQUE   (prevents duplicate sends)
```

### Feedback & Gamification
```
session_feedback
  id              UUID PK
  session_id      UUID FK → sessions.id
  reviewer_id     UUID FK → users.id
  reviewee_id     UUID FK → users.id
  rating          INT (1–5)
  comment         TEXT
  cefr_assessment TEXT  (tutor → learner only)
  created_at      TIMESTAMPTZ

learner_points
  id            UUID PK
  learner_id    UUID FK → users.id
  points        INT DEFAULT 0
  streak_days   INT DEFAULT 0
  last_session  TIMESTAMPTZ

badges
  id        UUID PK
  slug      TEXT UNIQUE (e.g. 'first_session', 'ten_sessions', '30_day_streak')
  name      TEXT
  icon_url  TEXT

learner_badges
  learner_id  UUID FK → users.id
  badge_id    UUID FK → badges.id
  earned_at   TIMESTAMPTZ
  PRIMARY KEY (learner_id, badge_id)
```

---

## Session Room Architecture

```
Learner App          LiveKit Server          Tutor App
     │                     │                     │
     │── join room ────────►│◄──── join room ─────│
     │                     │                     │
     │◄── video track ──────│──── video track ───►│
     │◄── audio track ──────│──── audio track ───►│
     │                     │                     │
     │── data channel ─────►│──── data channel ──►│
     │  (whiteboard ops)    │   (whiteboard ops)   │
     │                     │                     │
     │── chat message ─────►│──── chat message ──►│
     │                     │                     │
     │── screen share ─────►│──── screen share ──►│
```

**LiveKit Room Features Used:**
- Video/Audio tracks — HD video call
- Data channels — real-time whiteboard operations (JSON patches)
- Chat messages — built-in LiveKit chat
- Screen share — native LiveKit screen share track

---

## Notification Queue Flow

```
Booking Created
      │
      ▼
Bull Queue: notifications
      │
      ├── job: send_booking_email    → runs immediately → Resend API
      ├── job: send_booking_whatsapp → runs immediately → Twilio API
      ├── job: reminder_60min        → delayed until (startTime - 60min)
      └── job: reminder_10min        → delayed until (startTime - 10min)

On cancellation:
      └── remove pending reminder jobs by booking ID
```

---

## Payment Split Flow

```
Learner pays $20
      │
      ▼
Stripe PaymentIntent (platform as merchant)
      │
      ▼
Payment succeeds → webhook fires → API receives event
      │
      ├── Record in payments table
      ├── Record in wallet_transactions (learner debit)
      └── Transfer $19 (95%) to tutor Stripe Connect account
          └── $1 (5%) stays on platform account
```

---

## Authentication Flow

```
1. POST /auth/register → hash password (bcrypt) → create user
2. POST /auth/login → verify password → issue JWT access (15min) + refresh (30d)
3. Access token sent in Authorization: Bearer header
4. Refresh token stored in HttpOnly cookie
5. POST /auth/refresh → verify refresh token → issue new access token
6. POST /auth/logout → invalidate refresh token (Redis blocklist)
```

---

## Infrastructure Topology (Production)

```
Internet
    │
    ▼
Cloudflare (DNS + DDoS protection + SSL termination)
    │
    ▼
Hetzner VPS / DigitalOcean Droplet
    │
    ├── Nginx (reverse proxy + HTTPS via Let's Encrypt)
    │     ├── /api/*       → NestJS API (port 3000)
    │     ├── /            → Flutter Web (static files)
    │     └── /livekit/*   → LiveKit Server (port 7880)
    │
    ├── PostgreSQL (managed or self-hosted)
    ├── Redis (self-hosted)
    ├── MinIO (self-hosted) or Cloudflare R2
    └── Prometheus + Grafana (monitoring)
```

**Estimated Monthly Cost (Hetzner):**
| Resource | Spec | Cost |
|---|---|---|
| App server | CX21 (2 vCPU, 4 GB RAM) | ~$6/mo |
| DB server | CX21 | ~$6/mo |
| Volume storage | 40 GB | ~$2/mo |
| LiveKit server | CX21 (or use LiveKit Cloud free tier) | ~$6/mo |
| **Total** | | **~$20/mo** |

---

## Scalability Path

| Phase | Users | Strategy |
|---|---|---|
| MVP | 0–500 | Single VPS, Docker Compose |
| Growth | 500–5k | Separate DB server, Redis cluster, horizontal API |
| Scale | 5k–50k | Kubernetes (k3s), managed PostgreSQL, CDN |
| Enterprise | 50k+ | Multi-region, Kafka for events, LiveKit Cloud |
