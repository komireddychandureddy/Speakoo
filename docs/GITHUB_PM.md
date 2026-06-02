# Speakoo — GitHub Project Management Guide

## Overview

This guide sets up GitHub Projects (v2) as the primary project management tool for Speakoo. Everything lives inside GitHub — no Jira, no Trello, no separate PM tool required.

---

## 1. Repository Setup

### Create the Repository
1. Go to https://github.com/new
2. Repository name: `speakoo`
3. Visibility: Private (initially)
4. Initialize with a README: ✅
5. Add `.gitignore`: Node
6. License: MIT

### Branch Protection Rules (Settings → Branches)
| Branch | Rules |
|---|---|
| `main` | Require PR, 1 reviewer, pass CI checks, no direct push |
| `develop` | Require PR, pass CI checks |

### Branch Strategy
```
main          ← production releases only (tagged)
  └─ develop  ← integration branch
       ├─ feature/SPK-001-auth-module
       ├─ feature/SPK-045-livekit-whiteboard
       ├─ fix/SPK-078-booking-timezone-bug
       └─ chore/SPK-022-update-prisma
```

**Branch naming**: `{type}/SPK-{issue-number}-{short-description}`

Types: `feature`, `fix`, `chore`, `docs`, `test`, `hotfix`

---

## 2. GitHub Labels

Create these labels (Settings → Labels → New label):

### Area Labels
| Label | Color | Description |
|---|---|---|
| `area: backend` | `#0075ca` | NestJS API |
| `area: mobile` | `#e4e669` | Flutter iOS/Android |
| `area: web` | `#cfd3d7` | Flutter Web / Admin panel |
| `area: infra` | `#f9d0c4` | Docker, Terraform, CI/CD |
| `area: database` | `#c5def5` | Prisma schema, migrations |
| `area: livekit` | `#bfd4f2` | Video/session room |
| `area: payments` | `#d4c5f9` | Stripe integration |

### Type Labels
| Label | Color | Description |
|---|---|---|
| `type: feature` | `#84b6eb` | New feature or request |
| `type: bug` | `#d73a4a` | Something isn't working |
| `type: chore` | `#e4e669` | Maintenance, dependency updates |
| `type: docs` | `#0075ca` | Documentation only |
| `type: test` | `#0e8a16` | Test coverage additions |
| `type: security` | `#b60205` | Security vulnerability |

### Priority Labels
| Label | Color | Description |
|---|---|---|
| `priority: critical` | `#b60205` | Blocker — must fix now |
| `priority: high` | `#e11d48` | Important, next sprint |
| `priority: medium` | `#f97316` | Normal priority |
| `priority: low` | `#22c55e` | Nice to have |

### Role Labels
| Label | Color | Description |
|---|---|---|
| `role: learner` | `#7c3aed` | Learner-facing feature |
| `role: tutor` | `#2563eb` | Tutor-facing feature |
| `role: admin` | `#dc2626` | Admin panel feature |

### Status Labels
| Label | Color | Description |
|---|---|---|
| `status: blocked` | `#e11d48` | Cannot proceed, dependency |
| `status: needs-design` | `#fbbf24` | Waiting on Figma design |
| `status: needs-review` | `#0075ca` | Ready for code review |

---

## 3. Milestones (Development Roadmap)

Create these milestones in GitHub (Issues → Milestones → New milestone):

### M1 — Foundation (Weeks 1–2)
**Goal**: Auth system, user profiles, DB schema, basic API skeleton

Issues to include:
- [ ] Set up NestJS project structure with all modules scaffolded
- [ ] Prisma schema — users, profiles, bookings, sessions tables
- [ ] JWT auth (register, login, refresh, logout)
- [ ] Role-based guards (Learner, Tutor, Admin)
- [ ] Flutter project setup with Riverpod + GoRouter
- [ ] Docker Compose for local dev (Postgres + Redis + MinIO)
- [ ] GitHub Actions CI pipeline

---

### M2 — Tutor & Learner Profiles (Week 3)
**Goal**: Profile creation, language selection, tutor discovery

Issues:
- [ ] Learner profile CRUD API + Flutter screens
- [ ] Tutor profile CRUD API + Flutter screens
- [ ] Tutor availability calendar (weekly recurring slots)
- [ ] Language selection (all 20+ supported languages)
- [ ] Tutor search/filter API (by language, price, rating)
- [ ] Tutor profile public page

---

### M3 — Booking System (Weeks 4–5)
**Goal**: Slot reservation, booking flow, timezone handling

Issues:
- [ ] Slot reservation with optimistic locking (prevent double booking)
- [ ] Booking state machine (AVAILABLE → BOOKED → IN_SESSION → COMPLETED)
- [ ] Learner booking flow (Flutter UI)
- [ ] Tutor booking management UI
- [ ] Timezone conversion at API response layer
- [ ] Booking cancellation with refund logic

---

### M4 — Payments (Weeks 6–7)
**Goal**: Stripe Connect, wallet, credits, tutor payouts

Issues:
- [ ] Stripe Connect Express account onboarding for tutors
- [ ] PaymentIntent creation on booking
- [ ] 5% platform fee calculation and transfer
- [ ] Wallet balance + credit bundle purchase
- [ ] Wallet-based payment at checkout
- [ ] Stripe webhook handler (payment.succeeded, charge.refunded)
- [ ] Tutor payout request (min $50 threshold)
- [ ] Earnings dashboard for tutors

---

### M5 — Session Room (Weeks 8–10)
**Goal**: Full live session with video, whiteboard, chat, screen share

Issues:
- [ ] LiveKit server setup (Docker, room management API)
- [ ] LiveKit token generation service in NestJS
- [ ] Flutter LiveKit SDK integration (join room, video/audio)
- [ ] In-session chat (LiveKit data messages)
- [ ] Interactive whiteboard (canvas with LiveKit data channel)
- [ ] Screen share (LiveKit screen share track)
- [ ] Session start/end lifecycle (state machine)
- [ ] Optional session recording (LiveKit room recording API)
- [ ] Reconnect handling (poor network conditions)

---

### M6 — Notifications (Week 11)
**Goal**: Email, WhatsApp, push notifications for all events

Issues:
- [ ] Resend integration + React Email templates (booking confirmed, reminder, summary)
- [ ] Twilio WhatsApp integration (booking confirmed, 60min reminder)
- [ ] Bull queue: delayed 60-minute reminder job
- [ ] Bull queue: delayed 10-minute reminder job
- [ ] Cancel jobs on booking cancellation
- [ ] Idempotent notification log (prevent duplicates)
- [ ] Push notification (FCM) for mobile

---

### M7 — Feedback & Gamification (Week 12)
**Goal**: Post-session feedback, points, badges, streaks

Issues:
- [ ] Post-session feedback form (star rating + comment) in Flutter
- [ ] CEFR level assessment (tutor → learner feedback)
- [ ] Tutor star rating aggregation on profile
- [ ] Points system (earn points per completed session)
- [ ] Streak tracking (consecutive sessions)
- [ ] Badge system (first session, 10 sessions, 30-day streak, etc.)
- [ ] Learner progress dashboard (CEFR level history)

---

### M8 — Admin Panel (Weeks 13–14)
**Goal**: Admin dashboard for support and platform management

Issues:
- [ ] Admin login + audit trail
- [ ] Session/booking lookup by ID
- [ ] Support ticket management (link to email/WhatsApp)
- [ ] Tutor approval workflow
- [ ] User suspension/ban tools
- [ ] Platform revenue dashboard
- [ ] Notification log viewer
- [ ] Content moderation queue

---

### M9 — Security & Testing (Week 15)
**Goal**: Security audit, test coverage, performance baseline

Issues:
- [ ] Backend 80%+ test coverage (Jest unit + integration)
- [ ] Flutter widget tests + Patrol E2E tests
- [ ] OWASP ZAP API security scan
- [ ] Trivy Docker image vulnerability scan
- [ ] Penetration test checklist (OWASP Top 10)
- [ ] Load test with k6 (simulate 100 concurrent sessions)
- [ ] Sentry + Prometheus/Grafana production setup

---

### M10 — Beta Launch (Week 16)
**Goal**: Deploy to production, onboard beta tutors and learners

Issues:
- [ ] Hetzner VPS setup with Nginx + Let's Encrypt
- [ ] GitHub Actions deploy workflow (develop → staging, main → production)
- [ ] App Store submission (TestFlight for iOS, internal track Android)
- [ ] Domain + DNS setup with Cloudflare
- [ ] Beta tutor onboarding (5–10 hand-picked tutors)
- [ ] Soft launch announcement

---

### M11 — Phase 2 Features (Post-Launch)
- [ ] AI conversational level test on signup (CEFR placement)
- [ ] On-Demand tutoring ("Available Now" mode)
- [ ] Group sessions (2–6 learners, one tutor)
- [ ] Community forum (writing practice + corrections)
- [ ] Language exchange (peer-to-peer, no payment)
- [ ] Trial sessions (15-min intro at reduced price)
- [ ] Mobile push notifications (FCM)

### M12 — Trust, Growth, and Retention (Current)

#### M12.1 Trust & Safety (Week 1-3)
- [x] Incident reporting backend (create + my reports)
- [x] Admin incident triage backend (list/filter/get/triage)
- [x] Admin incident queue UI
- [x] Tutor KYC workflow (document upload + manual review)
- [x] Fraud signals for wallet topups and payout anomalies

#### M12.2 Discovery & Matching 2.0 (Week 4-6)
- [x] Tutor ranking service (initial heuristic: rating + social proof + affordability + language match)
- [x] Recommendation endpoint for learners
- [x] Learner intent/preferences profile
- [x] Web recommendation cards in discovery/dashboard

#### M12.3 Subscriptions + Learning Outcomes (Week 7-9)
- [x] Subscription plans and monthly credit grants

### Latest Execution Update (Requested: Items 1, 2, 3)

- [x] Item 1 — Learning outcomes backend delivered
  - Added Prisma models + migration for learning paths, path steps, learner enrollments, session notes, and homework assignments.
  - Added new NestJS Learning module with endpoints:
    - `POST /learning/paths` (admin)
    - `POST /learning/paths/:pathId/steps` (admin)
    - `GET /learning/paths/me` (learner)
    - `POST /learning/paths/:pathId/enroll` (learner)
    - `POST /learning/session-notes` (tutor/admin)
    - `GET /learning/session-notes/me` (learner)
    - `POST /learning/homework` (tutor/admin)
    - `GET /learning/homework/me` (learner)
    - `PATCH /learning/homework/:homeworkId/submit` (learner)
    - `PATCH /learning/homework/:homeworkId/review` (tutor/admin)
- [x] Item 2 — Web progress and milestone UI wired to real APIs
  - Replaced mock leaderboard page with API-backed learner progress dashboard using:
    - `GET /users/me/progress`
    - `GET /users/me/badges`
  - Added timeline cards, CEFR history summary metrics, and milestone badge rendering.
- [x] Item 3 — Mobile recommendations + subscription/preferences wiring
  - Learner home now loads recommendations from `GET /tutors/recommendations/me`.
  - Added mobile subscription data layer + screen for plans/current/cancel/subscribe flows.
  - Added mobile learning preferences screen wired to `GET /users/me` + `PATCH /users/me/profile`.
- [x] Subscription webhook handling and proration
- [ ] Learning path/session notes/homework APIs
- [x] Learner progress timeline API

---

## 4. GitHub Projects Board Setup

### Create the Board
1. Go to your GitHub profile or org → **Projects** → **New project**
2. Choose **Board** (Kanban view)
3. Name: `Speakoo Development`

### Columns
| Column | Purpose |
|---|---|
| **Backlog** | All issues not yet started |
| **Ready** | Prioritized, spec complete, ready to pick up |
| **In Progress** | Actively being worked on (limit: 2 per dev) |
| **In Review** | PR open, awaiting code review |
| **Done** | Merged and closed |

### Custom Fields (add in Project settings)
| Field | Type | Values |
|---|---|---|
| Milestone | Iteration | M1–M11 |
| Story Points | Number | 1, 2, 3, 5, 8, 13 |
| Area | Single select | backend, mobile, web, infra |
| Priority | Single select | critical, high, medium, low |

### Automation Rules (built-in GitHub automation)
- Issue opened → auto-add to Backlog
- PR opened → move linked issue to "In Review"
- PR merged → move linked issue to "Done"

---

## 5. Issue Templates

Stored in `.github/ISSUE_TEMPLATE/` — see the template files in this repo.

### Linking Issues to PRs
In your PR description, add:
```
Closes #42
```
This auto-closes the issue and moves it to **Done** when the PR is merged.

---

## 6. Recommended GitHub Actions Workflows

Stored in `.github/workflows/`:

| File | Trigger | Purpose |
|---|---|---|
| `ci.yml` | Push to any branch | Lint, test, build check |
| `deploy-staging.yml` | Push to `develop` | Deploy to staging server |
| `deploy-prod.yml` | Push to `main` | Deploy to production |
| `security-scan.yml` | Weekly schedule | Trivy + npm audit |

---

## 7. Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(bookings): add cancellation with refund logic (#78)
fix(notifications): prevent duplicate 60min reminder sends (#91)
chore(deps): update prisma to v6.1.0
docs(architecture): add LiveKit session flow diagram
test(payments): add Stripe webhook handler unit tests
```

Format: `{type}({scope}): {description} (#{issue-number})`

---

## 8. Sprint Cadence

| Ceremony | Frequency | Duration |
|---|---|---|
| Sprint Planning | Every 2 weeks | 1 hour |
| Daily Standup | Daily | 15 minutes (async via GitHub comments) |
| Sprint Review | End of sprint | 30 minutes |
| Retrospective | End of sprint | 30 minutes |

**Async Standup Format** (comment on a pinned issue daily):
```
**Yesterday**: Completed LiveKit token generation service
**Today**: Starting Flutter LiveKit SDK integration
**Blockers**: Need LiveKit server endpoint confirmed
```

---

## 9. Definition of Done

An issue is **Done** when:
- [ ] Feature is implemented and matches acceptance criteria
- [ ] Unit tests written and passing
- [ ] No new ESLint / `flutter analyze` warnings
- [ ] PR reviewed and approved by ≥1 teammate
- [ ] Merged to `develop` branch
- [ ] Deployed to staging and manually verified
