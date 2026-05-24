---
applyTo: '**'
---

# Speakoo — Coding Standards & Review Prevention Guide

Derived from PR review feedback. Every rule below prevented a Copilot review comment.
Follow these patterns to achieve zero review comments.

---

## 1. NestJS Controller Route Ordering

**Rule:** Always declare static routes _before_ dynamic parameterised routes.

```typescript
// ✅ CORRECT — static routes first, :id last
@Get('profile')
getProfile() {}

@Get('slots')
getSlots() {}

@Get(':id')  // ← must be LAST
getOne(@Param('id', ParseUUIDPipe) id: string) {}

// ❌ WRONG — :id first will hijack /profile and /slots requests
@Get(':id')
getOne() {}

@Get('profile')
getProfile() {}
```

---

## 2. Prisma FK Relationships — Never Confuse `User.id` with `TutorProfile.id`

**Rule:** When a Prisma relation uses a profile ID (not user ID) as FK, resolve the profile first.

```typescript
// ✅ CORRECT
const tutorProfile = await this.prisma.tutorProfile.findUnique({ where: { userId } });
await this.prisma.availabilitySlot.create({ data: { tutorId: tutorProfile.id } });

// ❌ WRONG — tutorId references TutorProfile.id, NOT User.id
await this.prisma.availabilitySlot.create({ data: { tutorId: userId } });
```

Also validate that slot.tutorId matches the provided tutorId to prevent cross-tutor booking attacks.

---

## 3. JWT Verification Must Catch Errors → 401, Not 500

**Rule:** `jwt.verify()` throws on invalid/expired tokens. Always wrap in try/catch and throw `UnauthorizedException`.

```typescript
// ✅ CORRECT
try {
  const payload = this.jwtService.verify(token, { secret: this.config.refreshSecret });
  // use payload
} catch {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth', httpOnly: true, secure: true, sameSite: 'strict' });
  throw new UnauthorizedException('Invalid refresh token');
}

// ❌ WRONG — unhandled throw becomes 500
const payload = this.jwtService.verify(token); // can throw!
```

---

## 4. `clearCookie` Must Use the Same Options as `setCookie`

**Rule:** `res.clearCookie(name)` without matching `path`/`sameSite`/`secure` options does NOT remove the cookie in the browser.

```typescript
// ✅ CORRECT
res.clearCookie(REFRESH_COOKIE, {
  path: '/api/v1/auth',
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
});

// ❌ WRONG — browser ignores clearCookie without matching options
res.clearCookie(REFRESH_COOKIE);
```

---

## 5. No Unused Imports or Class Members

**Rule:** `@typescript-eslint/no-unused-vars` is set to `error`. Any unused import, variable, or class member will fail CI lint.

```typescript
// ✅ CORRECT — only import what you use
import { Injectable, Logger } from '@nestjs/common';

// ❌ WRONG — Reflector imported but not used
import { Reflector } from '@nestjs/core'; // fails lint
```

Also applies to injected constructor parameters. If you inject a service, use it.

---

## 6. No `as any` / `as unknown as any` in Tests or Production Code

**Rule:** `@typescript-eslint/no-explicit-any` is `error`. Use proper types or `as unknown as TargetType`.

```typescript
// ✅ CORRECT — use proper DTO types
import { CreateFeedbackDto } from '../dto/create-feedback.dto';
const dto: CreateFeedbackDto = { reviewerId: 'u1', revieweeId: 'u2', rating: 5, comment: 'Great' };

// ✅ CORRECT — cast via unknown when crossing incompatible types
const mockJob = { data } as unknown as Pick<Job<NotificationJobData>, 'data'>;

// ❌ WRONG — fails lint
const dto = { rating: 5 } as any;
const mockJob = { data } as any;
```

---

## 7. Docker Healthcheck Must Point to a Real Endpoint

**Rule:** Before adding a healthcheck, ensure the endpoint exists.

```dockerfile
# ✅ CORRECT — endpoint backed by actual controller
HEALTHCHECK CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1
```

Use `@nestjs/terminus` for production-grade health checks. Register `HealthModule` in `AppModule`.

---

## 8. Generated Files — Run `prisma generate` Before TypeScript Compilation

**Rule:** In CI, `npx prisma generate` MUST run before `npm run lint` or `npm run build`. Prisma types don't exist until generation.

```yaml
# ✅ CORRECT ci.yml order
- name: Install dependencies
  run: npm ci

- name: Generate Prisma client      # ← MUST be before lint/typecheck
  run: npx prisma generate
  env:
    DATABASE_URL: ${{ env.DATABASE_URL }}

- name: Lint
  run: npm run lint

- name: Type check
  run: npm run typecheck
```

---

## 9. Flutter Code Generation — Run `build_runner` Before Analyze

**Rule:** Files with `part '*.g.dart'` (GoRouter, Riverpod annotation, Retrofit) fail `flutter analyze` until build_runner runs.

```yaml
# ✅ CORRECT ci.yml order
- name: Generate code
  run: dart run build_runner build --delete-conflicting-outputs

- name: Flutter analyze
  run: flutter analyze

- name: Flutter test
  run: flutter test
```

Never commit `.g.dart` files — generate them at CI time.

---

## 10. Pin GitHub Actions to Tagged Releases

**Rule:** Never use `@master` — it is a moving target and breaks supply-chain security.

```yaml
# ✅ CORRECT
- uses: aquasecurity/trivy-action@v0.20.0

# ❌ WRONG — non-reproducible
- uses: aquasecurity/trivy-action@master
```

---

## 11. YAML Files Must Not Have UTF-8 BOM

**Rule:** Save all YAML files as UTF-8 **without BOM**. Many YAML parsers (Prometheus, Docker Compose) treat the BOM as an invalid character.

- In VS Code: click the encoding indicator in the status bar → "Save with Encoding" → `UTF-8`
- In editors: disable "Write BOM" option

---

## 12. Docker Compose — No Hardcoded Secrets, No Weak Defaults

**Rule:** Never embed secrets or weak default values in Compose files committed to git.

```yaml
# ✅ CORRECT — no defaults, forces explicit env values
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  MINIO_ROOT_USER: ${MINIO_ROOT_USER}
  MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}

# ❌ WRONG — weak defaults leak into screenshots, logs, and shared setups
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-devpassword}
  MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin}
```

Document required variables in `.env.example` only (gitignored `.env` holds real values).

---

## 13. Docker Compose — Pin Image Versions

**Rule:** Always pin to explicit versions. `:latest` makes environments non-reproducible.

```yaml
# ✅ CORRECT
image: minio/minio:RELEASE.2024-01-16
image: prom/prometheus:v2.49.0
image: grafana/grafana:10.3.1

# ❌ WRONG
image: minio/minio:latest
image: prom/prometheus:latest
```

---

## 14. LiveKit `LIVEKIT_KEYS` Format — No Spaces

**Rule:** LiveKit parses `LIVEKIT_KEYS` as `key:secret`. A space after the colon breaks parsing.

```yaml
# ✅ CORRECT
LIVEKIT_KEYS: "${LIVEKIT_DEV_KEY}:${LIVEKIT_DEV_SECRET}"

# ❌ WRONG — LiveKit fails to parse
LIVEKIT_KEYS: "${LIVEKIT_DEV_KEY}: ${LIVEKIT_DEV_SECRET}"
```

---

## 15. Nginx WebSocket — Use `map` for `Connection` Header

**Rule:** Unconditionally setting `Connection: upgrade` breaks HTTP keep-alive. Use a map.

```nginx
# ✅ CORRECT
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

location / {
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
}
```

---

## 16. Never Commit Build Artifacts into `src/`

**Rule:** `.js` files in `src/` are build artifacts, not source. Commit only `.ts` files.

```
# .gitignore — must include these patterns
apps/api/src/**/*.js
apps/api/src/**/*.js.map
apps/api/dist/
```

If `.js` files are already tracked, remove them: `git rm --cached apps/api/src/**/*.js`

---

## 17. Jest Coverage — Collect Only TypeScript Files

**Rule:** `collectCoverageFrom: ["**/*.(t|j)s"]` double-counts any `.js` artifacts in `src/`. Use `.ts` only.

```json
"collectCoverageFrom": [
  "**/*.ts",
  "!**/*.spec.ts",
  "!**/*.d.ts",
  "!**/node_modules/**",
  "!**/dist/**",
  "!src/main.ts"
]
```

---

## 18. Read Configuration from Environment — Never Hard-Code

**Rule:** Any value in `.env.example` must be read from config/env at runtime, not hard-coded.

```typescript
// ✅ CORRECT
constructor(private readonly configService: ConfigService) {}

async sendEmail() {
  const from = this.configService.get<string>('RESEND_FROM_EMAIL') ?? 'noreply@speakoo.com';
  await resend.emails.send({ from, ... });
}

// ❌ WRONG — breaks environment overrides and domain verification
await resend.emails.send({ from: 'Speakoo <noreply@speakoo.com>', ... });
```

---

## 19. Notification Logs — Only Log After Actual Delivery

**Rule:** Only create a `notificationLog` entry after a confirmed send. A skipped notification (no phone number) must not be logged as "sent".

```typescript
// ✅ CORRECT
if (!user.phoneNumber) {
  this.logger.warn(`No phone number for user ${userId}, skipping WhatsApp`);
  return; // ← return without logging
}
await this.twilio.send(...);
await this.prisma.notificationLog.create({ ... }); // log only after success
```

---

## 20. Flutter — Declare All Assets in `pubspec.yaml`

**Rule:** If `pubspec.yaml` lists asset directories, those directories must exist (even with a placeholder). Otherwise Flutter builds fail.

```yaml
# Only declare assets that physically exist in the repo
flutter:
  assets:
    - assets/images/   # ← create this directory with a .gitkeep file
    - assets/icons/    # ← create this directory with a .gitkeep file
```

---

## 21. Flutter — Declare Fonts Before Using Them

**Rule:** If you set `fontFamily: 'Inter'` in `ThemeData`, the font files must be present and declared in `pubspec.yaml`.

```yaml
# ✅ CORRECT — font declared
flutter:
  fonts:
    - family: Inter
      fonts:
        - asset: assets/fonts/Inter-Regular.ttf
        - asset: assets/fonts/Inter-Bold.ttf
          weight: 700
```

Or remove `fontFamily` from `ThemeData` until the font files are bundled.

---

## 22. Flutter Dio Refresh — Implement Cookie Handling

**Rule:** If the API refresh endpoint uses HttpOnly cookies, the Dio client must handle cookies via `dio_cookie_manager` + `CookieJar`. Without it, the refresh request won't include the cookie and will always fail.

```dart
// ✅ CORRECT — cookie jar persists HttpOnly cookies across requests
final cookieJar = PersistCookieJar(...);
dio.interceptors.add(CookieManager(cookieJar));
```

---

## 23. Sentry DSN — Guard Against Empty String

**Rule:** `String.fromEnvironment('KEY')` returns `''` (not null) when unset. Always guard.

```dart
// ✅ CORRECT
final dsn = const String.fromEnvironment('SENTRY_DSN');
await SentryFlutter.init((options) {
  if (dsn.isNotEmpty) options.dsn = dsn; // ← only set when provided
});

// ❌ WRONG — initializes Sentry with empty DSN
options.dsn = const String.fromEnvironment('SENTRY_DSN');
```

---

## 24. Flutter 401 Retry — Prevent Infinite Loops

**Rule:** Always guard the retry interceptor with a flag to prevent infinite loops if the retried request also returns 401.

```dart
// ✅ CORRECT
if (error.response?.statusCode == 401) {
  final extra = error.requestOptions.extra;
  if (extra['retryAttempted'] == true) throw error; // ← stop infinite loop

  extra['retryAttempted'] = true;
  // perform refresh ...
  // retry original request
}
```

---

## 25. Prometheus Scrape Target Must Match Docker Compose Service Name

**Rule:** Use the Docker Compose service name as the scrape target, not `host.docker.internal`.

```yaml
# ✅ CORRECT — works on Linux, macOS, Windows
scrape_configs:
  - job_name: 'api'
    static_configs:
      - targets: ['api:3000']

# ❌ WRONG — host.docker.internal not available on Linux without extra config
targets: ['host.docker.internal:3000']
```

Also ensure the `api` service is defined in the same Compose network as Prometheus.
