---
applyTo: '**'
---

# Speakoo — Copilot Coding Instructions

## Platform Overview
Speakoo is a global, multi-language tutoring marketplace. Learners book live sessions with Tutors across all major world languages. Sessions feature WebRTC video, chat, interactive whiteboard, and screen sharing. Key roles: **Learner**, **Tutor**, **Admin**.

---

## Languages & Frameworks

### Backend — NestJS (Node.js 20 LTS / TypeScript 5+)
- NestJS modular architecture with feature modules
- `async/await` throughout — no callbacks
- Class-validator + class-transformer for all DTOs
- Dependency Injection via NestJS providers
- CQRS pattern via `@nestjs/cqrs` for complex domain logic
- Repository pattern wrapping Prisma ORM
- Guard + Decorator pattern for role-based access (`@Roles('learner')`, `@Roles('tutor')`, `@Roles('admin')`)
- All database times stored in **UTC**, converted to user timezone at the API response level
- Bull queues (Redis-backed) for scheduled notification jobs (60 min / 10 min reminders)
- Stripe Connect for split payments; never store raw card data
- LiveKit server SDK for generating session tokens

### Mobile/Web — Flutter (Dart 3+ / Flutter 3.x)
- Feature-first folder structure under `lib/features/`
- Riverpod 2.x for state management (prefer `AsyncNotifierProvider`, `StreamProvider`)
- GoRouter for navigation
- Dio + Retrofit for API calls with interceptors for auth token refresh
- LiveKit Flutter SDK for video session room
- Syncfusion or Perfect Freehand for whiteboard canvas widget
- SharedPreferences / Flutter Secure Storage for tokens
- `intl` package for all date/time locale formatting
- BLoC only for complex form flows; Riverpod preferred elsewhere

### Database
- PostgreSQL 15+ via **Prisma ORM** (schema-first, migrations tracked in git)
- Redis 7+ for caching, session state, Bull job queues, rate limiting
- All monetary values stored as **integers in smallest currency unit** (cents/paise/etc.)
- Never store PII unencrypted

---

## Project Structure Conventions

```
apps/api/src/modules/{feature}/
  ├── {feature}.module.ts
  ├── {feature}.controller.ts
  ├── {feature}.service.ts
  ├── {feature}.repository.ts
  ├── dto/
  │   ├── create-{feature}.dto.ts
  │   └── update-{feature}.dto.ts
  ├── entities/
  │   └── {feature}.entity.ts
  └── {feature}.spec.ts

apps/mobile/lib/features/{feature}/
  ├── presentation/
  │   ├── screens/
  │   └── widgets/
  ├── data/
  │   ├── repositories/
  │   └── models/
  └── application/
      └── providers/
```

---

## Naming Conventions

| Context | Convention | Example |
|---|---|---|
| NestJS files | kebab-case | `booking.service.ts` |
| NestJS classes | PascalCase | `BookingService` |
| Flutter files | snake_case | `session_room_screen.dart` |
| Flutter classes | PascalCase | `SessionRoomScreen` |
| DB tables | snake_case plural | `booking_slots`, `user_profiles` |
| DB columns | snake_case | `created_at`, `tutor_id` |
| Env vars | SCREAMING_SNAKE_CASE | `LIVEKIT_API_SECRET` |
| API routes | kebab-case | `/api/v1/booking-slots` |
| Events (Bull) | dot-notation past tense | `session.booked`, `payment.completed` |

---

## Security Requirements (Critical)
- **Never** commit secrets — use `.env.example` with placeholder values only
- All secrets loaded from environment variables; in production, from a secrets manager (Doppler / HashiCorp Vault / AWS Secrets Manager)
- Auth via **JWT** (access token: 15 min, refresh token: 30 days, stored in HttpOnly cookie)
- All endpoints require authentication unless decorated `@Public()`
- Input validation on every DTO with `class-validator`
- SQL injection impossible via Prisma parameterized queries — never use raw query string interpolation
- Rate limiting on auth routes: 5 attempts per 15 minutes via `@nestjs/throttler`
- File uploads: validate MIME type server-side, store in object storage (MinIO / Cloudflare R2), never in the filesystem
- Payment amounts always verified server-side against the booking record — never trust client-sent amounts
- HTTPS enforced everywhere; HSTS headers set
- CORS configured to allowlist known domains only
- Content Security Policy headers on web app

---

## Payment Rules
- Platform fee: **5%** of session price (deducted at payout, not at charge time)
- Wallet balance stored as integer cents in `wallet_transactions` ledger table
- Credit bundles: store as credit units, not fiat; redemption rate configurable by admin
- Use Stripe Connect (Express accounts) for tutor payouts
- Minimum payout threshold: $50 USD equivalent
- Refund policy: full refund if cancelled > 24 hrs before; 50% if cancelled 2–24 hrs before; no refund if < 2 hrs

---

## Session & Booking Logic
- All time slots stored in UTC in PostgreSQL
- A slot is `AVAILABLE → BOOKED → IN_SESSION → COMPLETED` or `CANCELLED`
- LiveKit room name: `session-{bookingId}` — deterministic and unique
- Tutor and learner both receive JWT tokens scoped to the room via LiveKit server SDK
- Session recording: opt-in only; stored in object storage with signed URLs
- A booking can only transition forward through states (no rollback to AVAILABLE after BOOKED)

---

## Notification Rules
- Booking confirmed → send email immediately
- Session reminder → Bull job scheduled at: `(sessionStartTime - 60 min)` and `(sessionStartTime - 10 min)`
- WhatsApp notifications for: booking confirmation + 60 min reminder only
- Use Resend SDK for transactional email with React Email templates
- All notification sends are idempotent (check `notification_log` table before sending)

---

## Testing Standards
- Backend: Jest unit tests + supertest integration tests; **80%+ coverage required**
- Mobile: Flutter unit + widget tests; Patrol for E2E
- Run `npx prisma migrate reset --force` in CI before integration tests
- Mock Stripe, LiveKit, and Resend in unit tests
- Testcontainers for PostgreSQL and Redis in integration tests

---

## Code Style
- TypeScript: ESLint + Prettier, `strict: true`, no `any`
- Max function length: 40 lines; max file: 200 lines
- Dart: `flutter analyze` must pass with zero warnings
- Prefer `const` constructors in Flutter everywhere possible
- No business logic in controllers/screens — delegate to services/providers
- All public API methods must have JSDoc / Dart doc comments

---

## Environment Variables (required, never commit values)
```
# API
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
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
PLATFORM_FEE_PERCENT=5
```

---

## Prohibited Patterns
- ❌ `any` type in TypeScript
- ❌ Raw SQL string interpolation
- ❌ Storing secrets in code or git
- ❌ Business logic in NestJS controllers
- ❌ `setState` for global app state in Flutter
- ❌ Trusting client-provided payment amounts
- ❌ Skipping DTO validation decorators
- ❌ `console.log` in production code (use NestJS Logger)
- ❌ Blocking the main thread in Flutter (use `compute()` for heavy work)
