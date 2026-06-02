# Speakoo — Project Status & Pending Work

> **Last updated:** 2026-05-28  
> **Branches:** `main` (current)

---

## Quick Summary

| Layer | Status | Coverage |
|---|---|---|
| Backend — Auth | ✅ Complete | JWT register/login/refresh/logout, OTP, password reset |
| Backend — Users | ✅ Complete | getMe, updateProfile, publicProfile |
| Backend — Tutors | ✅ Complete | search (filtered/paginated), profile CRUD, availability slots |
| Backend — Bookings | ✅ Complete | create/list/get/cancel + Stripe refund |
| Backend — Sessions | ✅ Complete | LiveKit token gen, start/end state machine |
| Backend — Payments | ✅ Complete | Stripe PaymentIntent + webhook |
| Backend — Notifications | ⚠️ Partial | Bull queue done; **HTTP controller missing** |
| Backend — Admin | ✅ Complete | approve, suspend/unsuspend, list users |
| Backend — Feedback | ⚠️ Partial | module exists; gamification (points/badges/streaks) not built |
| Backend — AI Assessment | ❌ Stub | hardcoded A1 level |
| Backend — Group Sessions | ❌ Stub | no Prisma model |
| Backend — On-Demand | ❌ Stub | no business logic |
| Flutter — Auth | ✅ Complete | all screens wired to real API via auth_provider |
| Flutter — Booking | ⚠️ Partial | screens exist, **data layer missing** (mock data) |
| Flutter — Profile | ⚠️ Partial | screens exist, **data layer missing** (mock data) |
| Flutter — Tutors | ⚠️ Partial | screens exist, **data layer missing** (mock data) |
| Flutter — Session Room | ⚠️ Partial | UI exists, **LiveKit SDK not wired** |
| Flutter — Notifications | ⚠️ Partial | screen exists, no backend controller |
| Flutter — Admin | ⚠️ Partial | screens exist, **data layer missing** |
| Flutter — Tutor Dashboard | ⚠️ Partial | screens exist, **data layer missing** |
| React Web — Auth | ✅ Complete | login (email/phone), register (email + optional phone) |
| React Web — Deployment | ✅ Complete | production build, deployed to speakoo.duckdns.org |

---

## Done (Completed in Previous Sessions)

### Backend
- [x] M1 — NestJS scaffolding (all modules), Prisma schema, JWT auth, role guards, Docker Compose, GitHub Actions CI
- [x] Auth module — register, login, refresh, logout, OTP verify (email), forgot/reset password
- [x] Users module — getMe, updateProfile (upsert), publicProfile
- [x] Tutors module — upsertProfile, getMyProfile, createSlot (with end>start check), getMySlots, searchTutors (filter by language/price, paginated), publicTutorProfile
- [x] Bookings module — createBooking, getMyBookings, getBookingById, cancelBooking (with Stripe refund)
- [x] Sessions module — generateToken (LiveKit), startSession, endSession (state machine: confirmed→in_session→completed)
- [x] Payments module — createPaymentIntent, handleWebhook (payment_intent.succeeded + charge.refunded)
- [x] Notifications — Bull queue (email + WhatsApp), idempotency via notification_log, 60min/10min reminders, ConfigService for secrets
- [x] Admin module — approveTutor, suspendUser/unsuspendUser, listUsers (paginated)
- [x] Health module — terminus health check endpoint
- [x] Feedback module — create/list feedback
- [x] CI pipeline — correct order (prisma generate → lint → typecheck → migrate → test:cov)
- [x] Docker Compose — Postgres, Redis, MinIO, LiveKit, Prometheus, Grafana (all pinned versions)
- [x] Nginx — HTTPS redirect, WebSocket upgrade, CSP, Permissions-Policy (camera/mic allowed)

### Flutter Mobile
- [x] Project scaffold — Riverpod 2.x, GoRouter 13, Dio + cookie jar, Sentry
- [x] Auth screens — login, register, OTP verify, forgot password, reset password, onboarding, splash
- [x] Auth provider — fully wired to API (login, register, verifyEmailOtp, forgotPassword, resetPassword, setupProfile, logout, socialLogin)
- [x] Shared widgets — primary_button, speakoo_text_field, speakoo_logo, language_chip, tutor_card, session_card, star_rating
- [x] Theme — Material 3 light/dark with AppColors
- [x] Dio client — bearer token injection, 401 refresh loop guard, cookie jar (PersistCookieJar)

---

## Implemented This Session (2026-05-28)

### Authentication Enhancements (Flutter Mobile)
- [x] **Backend: Enhanced Login DTO** — supports email OR phone login with E.164 validation
- [x] **Backend: Updated Register DTO** — added optional `phoneNumber` field for email registration
- [x] **Backend: Auth Service** — login finds users by email OR phone; register stores phone + sends dual OTPs
- [x] **Flutter: Auth Provider** — login accepts email/phone params; register includes phoneNumber
- [x] **Flutter: Login Screen** — unified "Email or Phone Number" field with smart auto-detection
- [x] **Flutter: Register Screen** — email tab now includes optional phone field with country code dropdown

### Authentication Enhancements (React Web)
- [x] **React: authApi.ts** — `apiLogin` accepts email OR phone (auto-detects via `+` prefix); `apiRegister` includes optional phone
- [x] **React: LoginPage.tsx** — login form uses unified "Email or Phone Number" input with E.164 validation
- [x] **React: LoginPage.tsx** — registration form includes optional "Phone Number" field with E.164 validation
- [x] **Production Build** — `apps/web` built successfully (494.48 kB bundle, no errors)
- [x] **Production Deployment** — deployed to `https://speakoo.duckdns.org` via manual upload to `/var/www/html/`
- [x] **Testing** — verified email login, phone login, and optional phone registration on production

### Documentation Updates
- [x] **AUTH_IMPROVEMENTS.md** — added comprehensive React web implementation section with code examples
- [x] **DEPLOYMENT_GUIDE.md** — updated Part 6 with React web deployment steps (removed Flutter web)
- [x] **DEPLOYMENT_CHECKLIST.md** — updated web deployment section for React (removed Flutter)
- [x] **Docs Cleanup** — removed 4 outdated files (design.md, scenario.md, FLUTTER_WEB_DEPLOYMENT.md, DEPLOY_WEB_NOW.md)

### Previous Session (2026-05-27)
- [x] Fixed `app_router.dart` — broken OTP screen import + added tutor-home/admin routes
- [x] Created `booking_repository.dart` + `booking_provider.dart` — all booking screens wired to real API
- [x] Created `profile_repository.dart` + `profile_provider.dart` — profile screen wired to real API
- [x] Created `tutors_repository.dart` + `tutors_provider.dart` — tutor search wired to real API
- [x] Added `notifications.controller.ts` — GET /notifications/me endpoint
- [x] Added slot overlap check to `tutors.repository.ts` — prevents double-booking
- [x] Removed `.js` build artifacts from git tracking

---

## Pending Requirements (Next Session)

### High Priority

#### Backend
- [ ] **Stripe Connect Express tutor onboarding** — `POST /payments/connect/onboard` — creates Express account, returns onboarding URL
- [ ] **Wallet / credit system** — ledger model complete but no service; need `GET /wallet/balance`, `POST /wallet/topup` (Stripe PaymentIntent for credits), `GET /wallet/transactions`
- [ ] **Payout service** — transfer platform portion to tutor on session completion
- [ ] **FCM push notifications** — integrate Firebase Admin SDK, store device tokens in User model, send on booking/reminder events
- [ ] **Notifications HTTP controller** — GET /notifications/me (added this session ✅)
- [ ] **Group Sessions module** — add Prisma model `GroupSession`, implement CRUD + booking

#### Flutter
- [ ] **LiveKit SDK wiring in session_room_screen.dart** — `livekit_client` package, connect to room, publish/subscribe video/audio tracks
- [ ] **In-session chat** — LiveKit data channel for real-time text messages
- [ ] **Whiteboard widget** — Syncfusion or Perfect Freehand canvas overlay
- [ ] **Tutor dashboard wiring** — `availability_screen.dart` → POST /tutors/slots; `earnings_screen.dart` → GET /wallet/transactions
- [ ] **Admin dashboard wiring** — `admin_dashboard_screen.dart`, `tutor_approval_screen.dart`, `user_management_screen.dart` → wire to admin API
- [ ] **Wallet screen** — `wallet_screen.dart` → GET /wallet/balance, POST /wallet/topup
- [ ] **Stripe Connect onboarding flow** — tutor taps "Set up payouts" → opens WebView with onboarding URL

### Medium Priority
- [ ] **Gamification** — LearnerPoints, Badge, LearnerBadge Prisma models exist; service not implemented
  - POST /feedback triggers point award
  - GET /users/me/points, GET /users/me/badges
- [ ] **CEFR progress dashboard** — track level progression on learner home
- [ ] **AI assessment** — replace stub; integrate OpenAI API for onboarding level test
- [ ] **Session recording** — opt-in toggle in session room, store signed URL in Session.recordingUrl
- [ ] **Timezone conversion** — convert UTC slot times to user's `profile.timezone` in API responses
- [ ] **Rate limiting UI** — show proper error when 429 returned

### Low Priority / Phase 2
- [ ] On-demand tutoring ("Tutor Available Now" toggle)
- [ ] Community feed/forum (CommunityThread, CommunityReply models exist)
- [ ] Practice sessions (PracticeSession model exists)
- [ ] App Store / Play Store submission
- [ ] k6 load testing
- [ ] Backend test coverage audit (target 80%+)
- [ ] Flutter widget + integration tests

---

## Known Bugs (Open)

| # | File | Bug | Fix |
|---|---|---|---|
| 1 | `apps/api/src/` | `.js` build artifacts committed to git | `git rm --cached apps/api/src/**/*.js` (done this session) |
| 2 | `booking_confirm_screen.dart` | Hardcoded tutor name/price from tutorId switch | Wire to GET /tutors/:id API (done this session) |
| 3 | `docker-compose.yml` | `prometheus_data`/`grafana_data` volumes may be missing from top-level volumes block | Verify `volumes:` section at bottom |

---

## Architecture Notes

### Booking State Machine
```
AVAILABLE → BOOKED → IN_SESSION → COMPLETED
                   ↘ CANCELLED
```

### LiveKit Room Naming
```
session-{bookingId}   (deterministic, unique)
```

### Refund Policy (enforced in bookings.service.ts)
- > 24h before: 100% refund
- 2–24h before: 50% refund
- < 2h before: no refund

### Platform Fee
- 5% of session price (`PLATFORM_FEE_PERCENT` env var)
- Deducted at payout (not at charge time)

### JWT Tokens
- Access token: 15 min (Bearer in Authorization header)
- Refresh token: 30 days (HttpOnly cookie, path=/api/v1/auth)

---

## Git Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code |
| `develop` | Integration branch (merge feature branches here) |
| `feat/m1-m8-implementation` | Flutter UI screens (needs PR to develop) |
| `bugfix/users-integration` | Tutor-only signup + profile fixes (needs PR to develop) |

**Next steps**: PR both `feat/m1-m8-implementation` and `bugfix/users-integration` into `develop`, then merge `develop` → `main`.

---

## Environment Variables (never commit values)

```
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
LIVEKIT_WS_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
PLATFORM_FEE_PERCENT=5
```

---

## Phase 2 Roadmap (2026-06 to 2026-08)

### Objective
Ship growth + trust + retention features in 3 waves while preserving production stability.

### Wave A (Weeks 1-3) — Trust & Safety

| Item | Status | Owner | ETA |
|---|---|---|---|
| Incident reporting API (learner/tutor submit) | ✅ Implemented | Backend | Done |
| Admin incident triage API (list/filter/resolve) | ✅ Implemented | Backend | Done |
| Incident DB schema + migration | ✅ Implemented | Backend | Done |
| Admin UI for incident queue | ⏳ Planned | Web | Week 2 |
| Tutor KYC document workflow | ⏳ Planned | Backend/Web | Week 3 |

### Wave B (Weeks 4-6) — Discovery & Matching 2.0

| Item | Status | Owner | ETA |
|---|---|---|---|
| Tutor ranking score service (quality + reliability + price) | ⏳ Planned | Backend | Week 4 |
| Personalized recommendation endpoint | ⏳ Planned | Backend | Week 5 |
| Learner preference profile (goals, budget, timezone) | ⏳ Planned | Backend/Mobile/Web | Week 5 |
| Search UX update with recommendation cards | ⏳ Planned | Mobile/Web | Week 6 |

### Wave C (Weeks 7-9) — Subscriptions & Outcome Tracking

| Item | Status | Owner | ETA |
|---|---|---|---|
| Monthly subscription plans + credit grants | ⏳ Planned | Backend/Payments | Week 7 |
| Subscription management APIs/webhooks | ⏳ Planned | Backend | Week 8 |
| Learning path + session notes + homework model | ⏳ Planned | Backend | Week 8 |
| Learner progress timeline UI | ⏳ Planned | Mobile/Web | Week 9 |

### Newly Implemented in This Phase Kickoff

- Added `IncidentReport` model with category, status, priority, evidence, and admin triage fields.
- Added migration `20260602120000_add_incident_reports`.
- Added Safety module routes:
  - `POST /api/v1/safety/incidents`
  - `GET /api/v1/safety/incidents/me`
  - `GET /api/v1/safety/incidents` (admin)
  - `GET /api/v1/safety/incidents/:id` (admin)
  - `PATCH /api/v1/safety/incidents/:id/triage` (admin)

### Newly Implemented (Current Session)

- Item 1 completed: learning outcomes backend
  - Added Prisma enum/model set for `LearningPath`, `LearningPathStep`, `LearnerPathEnrollment`, `SessionNote`, and `HomeworkAssignment`.
  - Added migration `20260602173000_add_learning_outcomes`.
  - Added new module `apps/api/src/modules/learning` and registered it in `AppModule`.
  - Implemented role-safe APIs for path setup/enrollment, session notes, and homework assignment/submission/review.

- Item 2 completed: web progress and milestone UI
  - Updated `apps/web/src/core/network/usersApi.ts` with progress/badge interfaces and API calls.
  - Replaced mock `apps/web/src/pages/Leaderboard/LeaderboardPage.tsx` with live `users/me/progress` + `users/me/badges` rendering.

- Item 3 completed: mobile recommendations, subscription, and preferences wiring
  - Added recommendation provider integration in `apps/mobile/lib/features/tutors/application/tutors_provider.dart` and wired `LearnerHomeScreen` to backend recommendations.
  - Added mobile subscription data/provider/screen:
    - `apps/mobile/lib/features/profile/data/subscription_repository.dart`
    - `apps/mobile/lib/features/profile/application/subscription_provider.dart`
    - `apps/mobile/lib/features/profile/presentation/screens/subscription_screen.dart`
  - Added preferences screen and routing:
    - `apps/mobile/lib/features/profile/presentation/screens/preferences_screen.dart`
    - router updates in `apps/mobile/lib/core/router/app_router.dart`
  - Extended profile model/provider/repository to support `targetLanguage`, `learningGoals`, `maxBudgetCents`.
- Added `TutorKycSubmission` model and migration `20260602133000_add_tutor_kyc_submissions`.
- Added tutor/admin KYC endpoints:
  - `POST /api/v1/tutors/kyc/submissions`
  - `GET /api/v1/tutors/kyc/submissions/me`
  - `GET /api/v1/tutors/kyc/submissions` (admin)
  - `POST /api/v1/tutors/kyc/submissions/:id/review` (admin)
- Added learner recommendation endpoint:
  - `GET /api/v1/tutors/recommendations/me`
  - Ranking combines language match, rating, review volume, and affordability.
- Added transaction risk analytics endpoint and admin UI:
  - `GET /api/v1/payments/risks/transactions?days=7` (admin)
  - Detects high-value transfers, rapid transaction bursts, duplicate payout references, and payout-booking mismatches.
  - Web admin view available under `/admin/risks`.
- Replaced web subscription page mock flow with real backend integration:
  - `GET /api/v1/payments/subscriptions/plans`
  - `POST /api/v1/payments/subscriptions/subscribe`
  - `GET /api/v1/payments/subscriptions/me`
  - `POST /api/v1/payments/subscriptions/cancel`
  - Stripe webhook handling for `customer.subscription.updated`, `customer.subscription.deleted`, and `invoice.paid`
    to sync subscription status and grant renewal credits.
- Replaced web credits page mock history with wallet APIs:
  - `GET /api/v1/payments/wallet`
  - `GET /api/v1/payments/wallet/transactions`
- Added learner preference wiring on web settings page backed by:
  - `PATCH /api/v1/users/me/profile` with `targetLanguage`, `learningGoals`, `maxBudgetCents`, and `timezone`.
- Added learner progress timeline endpoint:
  - `GET /api/v1/users/me/progress`
  - Returns summary (sessions, points, badges, latest CEFR), CEFR history, and session-by-session timeline.
- Added subscriptions + recurring credits backend:
  - Models: `SubscriptionPlan`, `UserSubscription`
  - Endpoints:
    - `GET /api/v1/payments/subscriptions/plans`
    - `POST /api/v1/payments/subscriptions/plans` (admin)
    - `POST /api/v1/payments/subscriptions/subscribe`
    - `GET /api/v1/payments/subscriptions/me`
    - `POST /api/v1/payments/subscriptions/cancel`
    - `POST /api/v1/payments/subscriptions/grants/run` (admin)
  - Initial cycle credit grant logic writes to wallet ledger with idempotent reference keys.
- Added web learner dashboard recommendation cards consuming `tutors/recommendations/me`.

### Tracking Rules

- Every Phase 2 task must have: issue ID, owner, ETA, and acceptance criteria.
- No item moves to ✅ without API contract + validation + role guard verification.
- Priority order for implementation: Trust & Safety > Matching > Subscription > Outcomes.
