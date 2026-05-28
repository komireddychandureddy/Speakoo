---
applyTo: '**'
---

# Speakoo — Coding Standards & Review Prevention Guide

Derived from PR review feedback. Every rule below prevented a Copilot review comment.
Follow these patterns to achieve zero review comments.

---

## CRITICAL: hCaptcha & Validation Issues

### Rule 54: Optional DTO Fields With Validation Must Reject Empty Strings

**Rule:** When a DTO field is `@IsOptional()` with string validation (e.g., `@IsString()`, `@MinLength()`), class-validator will NOT skip validation for empty strings `""`. The field must either be `undefined`/omitted, or pass all validators. Add `@MinLength(1)` to reject empty strings when the field is present.

```typescript
// ✅ CORRECT — rejects empty strings when captchaToken is present
export class RegisterDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'captchaToken must not be empty' })
  captchaToken?: string;
}

// ❌ WRONG — empty string passes @IsString() but fails hCaptcha verification
export class RegisterDto {
  @IsOptional()
  @IsString()
  captchaToken?: string;  // "" passes class-validator but breaks backend logic
}
```

Frontend must send `undefined` (omit the field) when no value exists:
```typescript
// ✅ CORRECT
const payload = {
  email: email.trim(),
  password: password,
  captchaToken: captchaToken?.trim() || undefined,  // undefined if empty
};

// ❌ WRONG — sends empty string
const payload = {
  email: email.trim(),
  password: password,
  captchaToken: captchaToken,  // "" if user hasn't filled it
};
```

This issue caused "property captchaToken should not exist" errors when `forbidNonWhitelisted: true` was set in ValidationPipe.

---

## Rule 55: Phone Number Inputs Must Use Country Code Dropdowns with Timezone Detection

**Rule:** Never use plain text inputs for phone numbers. Implement a country code selector with:
1. Flag + dial code dropdown (searchable)
2. Auto-detection via browser timezone (privacy-friendly, no geolocation)
3. E.164 format validation
4. User manual selection takes precedence over auto-detection

```tsx
// ✅ CORRECT — PhoneInput component with country selector
<PhoneInput
  value={signupPhone}
  onChange={setSignupPhone}
  placeholder="Phone Number (optional)"
  autoComplete="tel"
/>

// Component features:
// - Detects country from Intl.DateTimeFormat().resolvedOptions().timeZone
// - NO geolocation API (privacy risk - see Rule 57)
// - Constructs E.164 format: selectedCountry.dial + phoneNumber
// - Validates digits only in number field
// - Displays: 🇺🇸 +1 | 2025550100
// - Tracks userSelectedCountry flag to prevent async overwrites (Rule 56)

// ❌ WRONG — plain text with format hint
<input
  type="tel"
  placeholder="Phone Number (e.g., +1234567890)"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
/>
<p className="text-xs text-gray-500">Use E.164 format (e.g., +1234567890)</p>
```

Users should never manually type the `+` or country code — the dropdown handles it.

---

## Rule 56: Async Auto-Detection Must Not Overwrite User Input

**Rule:** When implementing auto-detection features (country, timezone, currency, etc.) that run asynchronously, always track whether the user has manually selected a value. Never apply auto-detected values if the user has already made a choice, even if the detection finishes later.

```tsx
// ✅ CORRECT — tracks user selection to prevent async overwrites
const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
const [userSelectedCountry, setUserSelectedCountry] = useState(false);

useEffect(() => {
  const detectCountry = () => {
    if (userSelectedCountry) return;  // ← prevent overwriting user choice
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const country = detectFromTimezone(timezone);
    if (country) setSelectedCountry(country);
  };
  detectCountry();
}, [userSelectedCountry]);

const handleCountrySelect = (country: Country) => {
  setSelectedCountry(country);
  setUserSelectedCountry(true);  // ← mark as user-selected
};

// ❌ WRONG — async detection overwrites user's manual selection
useEffect(() => {
  navigator.geolocation.getCurrentPosition(async (position) => {
    const country = await detectFromCoords(position);
    setSelectedCountry(country);  // overwrites user choice after delay
  });
}, []);  // no userSelectedCountry guard
```

This issue causes frustrating UX: user selects their country, continues filling the form, then their selection is silently replaced a few seconds later.

---

## Rule 57: Never Send Precise Geolocation to Third-Party APIs for Non-Essential Features

**Rule:** Avoid using `navigator.geolocation` to send precise latitude/longitude to third-party services unless absolutely necessary for core functionality (e.g., rideshare apps). For features like country detection, currency selection, or timezone inference, use privacy-friendly alternatives:
1. Browser timezone: `Intl.DateTimeFormat().resolvedOptions().timeZone`
2. Server-side IP geolocation (coarse, e.g., country-level only)
3. User-agent locale: `navigator.language`

Never expose exact user coordinates from login/signup forms or marketing pages.

```tsx
// ✅ CORRECT — privacy-friendly timezone detection
const detectCountry = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneMap: Record<string, string> = {
    'America/New_York': 'US',
    'Europe/London': 'GB',
    'Asia/Kolkata': 'IN',
    // ...
  };
  const countryCode = timezoneMap[timezone];
  return COUNTRIES.find(c => c.code === countryCode);
};

// ❌ WRONG — sends precise lat/long to third-party BigDataCloud API
navigator.geolocation.getCurrentPosition(async (position) => {
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`
  );
  const data = await response.json();
  // User's exact location now tracked by third party
});
```

This violates GDPR/privacy principles by exposing precise location data for non-essential features without explicit consent for that purpose.

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

---

## 26. Node.js Built-in Modules — Always Use Named Imports

**Rule:** Import only the specific functions you need from Node.js built-ins. `import * as crypto` pollutes the namespace; named imports are explicit and tree-shakeable.

```typescript
// ✅ CORRECT
import { randomUUID } from 'crypto';
const id = randomUUID();

// ❌ WRONG — namespace import for a single function
import * as crypto from 'crypto';
const id = crypto.randomUUID();
```

---

## 27. Prisma Query Fields Must Exactly Match the Schema

**Rule:** Never guess field names in `orderBy`, `where`, or `select`. Always verify against `prisma/schema.prisma`. TypeScript only catches missing fields if `strict` mode is on; runtime Prisma errors still occur.

```typescript
// ✅ CORRECT — field name taken from schema
await this.prisma.notificationLog.findMany({ orderBy: { sentAt: 'desc' } });

// ❌ WRONG — NotificationLog has no createdAt; fails at runtime
await this.prisma.notificationLog.findMany({ orderBy: { createdAt: 'desc' } });
```

---

## 28. Env Example Files — Naming Convention and Correct `NODE_ENV`

**Rule:** `ConfigModule` loads `.env.${NODE_ENV}` at runtime. Example/template files must be named `.env.${ENV}.example` (e.g. `.env.development.example`, `.env.production.example`) so they are never accidentally loaded. Each example file must have the correct `NODE_ENV` for its environment.

```
# ✅ CORRECT
.env.development.example  ← NODE_ENV=development
.env.production.example   ← NODE_ENV=production

# ❌ WRONG — .env.dev/.env.prod are never loaded by ConfigModule; name is misleading
.env.dev   (NODE_ENV=development)
.env.prod  (NODE_ENV=development)  ← wrong NODE_ENV makes prod behave as dev
```

---

## 29. All Env Vars Consumed by Guards/Services Must Appear in `.env.example`

**Rule:** Any environment variable read by a NestJS guard, service, or strategy must be present in **every** relevant `.env.example` / `.env.*.example` file. Silent fallbacks in guards (e.g. captcha disabled when `HCAPTCHA_SECRET` is absent) are especially dangerous because the missing var quietly disables security.

```
# ✅ CORRECT — all three example files document HCAPTCHA vars
apps/api/.env.example:
  HCAPTCHA_ENABLED=false
  HCAPTCHA_SECRET=REPLACE_ME

.env.development.example:
  HCAPTCHA_ENABLED=false
  HCAPTCHA_SECRET=REPLACE_ME

.env.production.example:
  HCAPTCHA_ENABLED=true
  HCAPTCHA_SECRET=REPLACE_ME
```

---

## 30. Lazy-Initialize Third-Party Clients With Production-Only Credentials

**Rule:** Never call `config.getOrThrow(...)` for production-only credentials (Twilio, Stripe webhooks, etc.) inside the class constructor. The constructor runs at module bootstrap in **all** environments, causing dev/CI/test startup to fail when credentials are absent. Instantiate the client lazily inside the method that needs it, guarded by the production check.

```typescript
// ✅ CORRECT — only instantiated when the method actually runs in prod
async sendSmsOtp(phone: string, otp: string): Promise<void> {
  if (this.config.get('NODE_ENV') !== 'production') return;
  const twilio = new Twilio(
    this.config.getOrThrow('TWILIO_ACCOUNT_SID'),
    this.config.getOrThrow('TWILIO_AUTH_TOKEN'),
  );
  await twilio.messages.create({ ... });
}

// ❌ WRONG — getOrThrow in constructor crashes dev/CI startup
constructor(private readonly config: ConfigService) {
  this.twilio = new Twilio(
    config.getOrThrow('TWILIO_ACCOUNT_SID'), // throws if not set
    config.getOrThrow('TWILIO_AUTH_TOKEN'),
  );
}
```

---

## 31. Always Use a DTO Class for `@Body()` — Never Inline Types

**Rule:** An inline type (`@Body() body: { token: string }`) bypasses `class-validator` entirely — clients can omit the field or pass any value. Every request body must use a DTO class decorated with `class-validator` decorators.

```typescript
// ✅ CORRECT — class-validator runs automatically via ValidationPipe
export class SocialLoginDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

@Post('social')
socialLogin(@Body() dto: SocialLoginDto) { ... }

// ❌ WRONG — no validation, token can be undefined or any type
@Post('social')
socialLogin(@Body() body: { token: string }) { ... }
```

---

## 32. Don't Add `@UseGuards(JwtAuthGuard)` When `GlobalJwtAuthGuard` Is Registered

**Rule:** `GlobalJwtAuthGuard` is registered as a global guard in `AppModule`. Adding `@UseGuards(JwtAuthGuard)` on individual controllers or methods is redundant and misleading. Use `@Public()` to opt out; everything else is already protected.

```typescript
// ✅ CORRECT — global guard already protects this; use @Public() to opt out
@Controller('notifications')
export class NotificationsController { ... }

// ❌ WRONG — redundant, implies the controller would be unprotected without it
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController { ... }
```

---

## 33. Flutter — Await Async Provider Calls; Never Fire-and-Forget

**Rule:** Calling an `async` provider method without `await` means the call runs in the background. Any error it throws is silently lost, and state read immediately after will reflect the pre-call value. Always `await` the call, then check `mounted` before using `BuildContext`.

```dart
// ✅ CORRECT
Future<void> _socialLogin() async {
  await ref.read(authProvider.notifier).socialLogin(token);
  if (!mounted) return;
  final state = ref.read(authProvider);
  if (state.hasError) {
    ScaffoldMessenger.of(context).showSnackBar(...);
  }
}

// ❌ WRONG — fire-and-forget: errors are lost, state check is premature
void _socialLogin() {
  ref.read(authProvider.notifier).socialLogin(token); // no await
  final state = ref.read(authProvider); // reads stale state
}
```

---

## 34. GitHub Actions Workflows Must Live in `.github/workflows/` at Repo Root

**Rule:** GitHub only discovers workflow files under the **repository root** `.github/workflows/` directory. A workflow file nested anywhere else (e.g. `PlaywrightTests/.github/workflows/playwright.yml`) is silently ignored and never runs.

```
# ✅ CORRECT
.github/workflows/playwright.yml   ← discovered and runs

# ❌ WRONG — never discovered by GitHub Actions
PlaywrightTests/.github/workflows/playwright.yml
```

When the test project is in a subdirectory, set `working-directory` on the run steps:
```yaml
- run: npm ci
  working-directory: PlaywrightTests
- run: npx playwright test
  working-directory: PlaywrightTests
```

---

## 35. E2E / Playwright Tests Must Not Target Auth-Protected Routes

**Rule:** E2E tests that navigate to a protected route without valid session cookies will silently redirect to `/login` and assert against the wrong page (e.g. the login title instead of the dashboard title). Always target a **public** route, or set up an authenticated session fixture before navigating to a private route.

```typescript
// ✅ CORRECT — public marketing/welcome page
await page.goto('https://speakoo.duckdns.org/');
await expect(page).toHaveTitle(/Speakoo/);

// ❌ WRONG — /dashboard redirects unauthenticated users to /login
await page.goto('https://speakoo.duckdns.org/dashboard');
await expect(page).toHaveTitle(/Dashboard/); // asserts against login page title
```

---

## 36. Never Ship Placeholder or Hardcoded IDs in Production Code

**Rule:** Hard-coded placeholder values (e.g. `'placeholder-slot-id'`) must never reach a production code path. They bypass validation and cause guaranteed runtime failures. Add a guard that prevents the action and shows a user-facing message instead.

```dart
// ✅ CORRECT — guard prevents calling API with placeholder
if (slotId == 'placeholder-slot-id') {
  ScaffoldMessenger.of(context).showSnackBar(
    const SnackBar(content: Text('Please select a time slot first.')),
  );
  return;
}

// ❌ WRONG — placeholder reaches the API, always fails validation
await bookingRepo.createBooking(slotId: 'placeholder-slot-id', ...);
```

---

## 37. Client Payloads and API Routes Must Exactly Match the Backend Contract

**Rule:** Client code (Flutter/web) must send exactly what the backend DTO requires — no extra fields, no missing required fields, and the correct HTTP method + path (including all path segments). Verify against the backend DTO and controller source before writing client code.

```dart
// ✅ CORRECT — matches CreateBookingDto exactly (slotId, tutorId, language)
await _dio.post('/bookings', data: {
  'slotId': slotId,
  'tutorId': tutorId,
  'language': language,
});

// ✅ CORRECT — matches DELETE /bookings/:id/cancel
await _dio.delete('/bookings/$bookingId/cancel');

// ❌ WRONG — priceCents not in DTO; tutorId missing; API rejects request
await _dio.post('/bookings', data: { 'slotId': slotId, 'priceCents': 5000 });

// ❌ WRONG — missing /cancel suffix; matches wrong route or returns 404
await _dio.delete('/bookings/$bookingId');
```

Also verify the response shape: if the backend returns `{ items, total, page, limit }`, read `data['items']`, not `data['tutors']`.

---

## 38. Client-Side Persisted Auth State Must Only Include Backend-Returned Fields

**Rule:** When persisting user data to `localStorage` / `SharedPreferences`, only include fields that the backend actually returns. Reading a field that was never persisted (e.g. `storedUser.mobile` when `/auth/login` never returns `mobile`) always yields `null` or `undefined` silently.

```typescript
// ✅ CORRECT — only persist what /auth/login returns
const user = { id, name, email, role }; // no 'mobile' — backend doesn't return it
localStorage.setItem('speakoo_user', JSON.stringify(user));

// ❌ WRONG — reading a field that was never stored
const storedUser = JSON.parse(localStorage.getItem('speakoo_user'));
const [mobile] = useState(storedUser.mobile ?? ''); // always ''
```

---

## 39. Speakoo Verification Flags — Never Conflate Email and Phone Verification

**Rule:** `isVerified` tracks **email** verification. `isPhoneVerified` tracks **phone** verification. Setting `isVerified: true` during phone OTP verification causes `resendEmailOtp` to silently no-op for phone-registered users who later add an email.

```typescript
// ✅ CORRECT — only flip the relevant flag
await this.prisma.user.update({
  where: { id: userId },
  data: { isPhoneVerified: true },
});

// ❌ WRONG — isVerified=true on phone OTP blocks subsequent email verification flows
await this.prisma.user.update({
  where: { id: userId },
  data: { isPhoneVerified: true, isVerified: true },
});
```

---

## 40. Remove Function Parameters That Have No Effect on the Backend

**Rule:** If a parameter is accepted by a client-side function but is never forwarded to the API (because the backend ignores or rejects it), remove the parameter from the function signature. Keeping it implies to callers that it has an effect, causing silent bugs.

```dart
// ✅ CORRECT — role is not sent; backend always assigns 'learner' at email register
Future<void> register({
  required String email,
  required String password,
  required String fullName,
}) async {
  await _api.post('/auth/register', data: {
    'email': email,
    'password': password,
    'displayName': fullName,
  });
}

// ❌ WRONG — role parameter accepted but never sent; callers believe tutor role works
Future<void> register({
  required String email,
  required String password,
  required String fullName,
  required String role, // silently ignored — backend always creates 'learner'
}) async { ... }
```

---

## 41. Use Correct Unicode Characters in String Literals

**Rule:** Copy-pasted or auto-corrected text may contain replacement characters (`\uFFFD` / `?`) instead of the intended Unicode codepoint. Always use the proper character — e.g. `…` (U+2026 HORIZONTAL ELLIPSIS) not `\uFFFD`.

```dart
// ✅ CORRECT
hint: 'Search tutors, languages…',

// ❌ WRONG — corrupted replacement character renders as a glyph box in the UI
hint: 'Search tutors, languages\uFFFD',
```

---

## 42. Monorepo Package Placement — Frontend Packages Go in Frontend App

**Rule:** In a monorepo with separate `apps/api` (backend) and `apps/web` (frontend) directories, OAuth client packages must be installed in the **frontend** app where they will be used. Never add React/browser packages to the backend.

```bash
# ✅ CORRECT — OAuth packages in apps/web
cd apps/web
npm install @react-oauth/google react-facebook-login react-apple-login --legacy-peer-deps

# ❌ WRONG — React packages in backend
cd apps/api
npm install @react-oauth/google react-facebook-login
```

Also check `package.json` carefully during code review — browser packages (React, DOM APIs) in backend signal misplaced dependencies.

---

## 43. Google OAuth — Use ID Token Flow, Not Authorization Code Exchange

**Rule:** For Google OAuth in a web client, use the **ID token credential flow** (`@react-oauth/google` with `GoogleLogin` component). The authorization code flow requires a `client_secret`, which must never be exposed to the browser.

```tsx
// ✅ CORRECT — ID token credential flow (no client_secret needed)
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

<GoogleLogin
  onSuccess={(credentialResponse: CredentialResponse) => {
    axios.post('/auth/social/google', { token: credentialResponse.credential });
  }}
  onError={() => console.error('Login failed')}
/>

// ❌ WRONG — auth code flow requires client_secret (unsafe in browser)
const authCode = await googleOAuth.getAuthCode();
axios.post('/auth/social/google', { code: authCode }); // backend needs client_secret to exchange
```

Backend verifies the ID token with `google-auth-library.OAuth2Client.verifyIdToken()`.

---

## 44. Auth localStorage Keys — Always Match the Expected Key Name

**Rule:** Use the exact `localStorage` key names expected by the auth context/guards. For Speakoo: `speakoo_access_token` and `speakoo_user`. Never shorten or invent new key names.

```typescript
// ✅ CORRECT — matches auth context and guards
localStorage.setItem('speakoo_access_token', accessToken);
localStorage.setItem('speakoo_user', JSON.stringify(user));

// ❌ WRONG — 'speakoo_token' is not recognized; auth guards will fail
localStorage.setItem('speakoo_token', accessToken);
```

Also fetch and persist user data immediately after receiving the token so the UI can display user info.

---

## 45. Database Migrations Must Run After Database Starts

**Rule:** In deployment/update scripts, `npx prisma migrate deploy` must run **after** `docker compose up` (which starts the database), never before or after `docker compose down` (which stops the database).

```bash
# ✅ CORRECT — migrate after DB starts
docker compose up -d
sleep 10  # wait for DB to be ready
npx prisma migrate deploy

# ❌ WRONG — migrate runs when DB is stopped
docker compose down
npx prisma migrate deploy  # will fail — DB not running
docker compose up -d
```

---

## 46. Monorepo Root Directory Checks — Validate Structure, Not package.json

**Rule:** When validating the working directory in a monorepo script, check for the existence of **subdirectories** (`apps/api`, `apps/web`, `infra/docker`), not `package.json` in the repo root. Monorepos often have no root `package.json`.

```bash
# ✅ CORRECT — check for monorepo structure
if [ ! -d "apps/api" ] || [ ! -d "infra/docker" ]; then
    echo "Error: Must run from repository root (apps/api and infra/docker must exist)"
    exit 1
fi

# ❌ WRONG — monorepos may not have root package.json
if [ ! -f "package.json" ]; then
    echo "Error: Must run from repository root (where package.json exists)"
    exit 1
fi
```

---

## 47. Deployment Scripts — Don't Build Locally When Using Pre-Built Remote Images

**Rule:** If `docker-compose.prod.yml` uses a pre-built image from a container registry (`ghcr.io/...`), the deployment script must **not** run local build steps (`npm run build`, `docker build`). Local builds are dead work when the container already has the built code.

```bash
# ✅ CORRECT — no local build when using GHCR image
npm ci                       # for Prisma CLI only
npx prisma generate          # for migration tooling
docker compose up -d         # pulls ghcr.io/owner/speakoo-api:tag
npx prisma migrate deploy    # after DB starts

# ❌ WRONG — local build is never used
npm ci
npm run build                # builds locally but container uses GHCR image
docker compose up -d         # ignores local build, pulls remote image
```

Keep `npm ci` + `npx prisma generate` only if migrations must run from the host. Otherwise, run migrations inside the container.

---

## 48. Social Login Endpoints Must Use CaptchaGuard and Throttling

**Rule:** All social OAuth endpoints (`/auth/social/:provider`) must be decorated with `@Public()` (to bypass JWT auth), `@UseGuards(CaptchaGuard)` (to prevent bots), and `@Throttle({ auth: { ttl: 15 * 60_000, limit: 5 } })` (stricter than default rate limit).

```typescript
// ✅ CORRECT — captcha + throttling + public
import { Throttle } from '@nestjs/throttler';

@Post('social/:provider')
@Public()
@UseGuards(CaptchaGuard)
@Throttle({ auth: { ttl: 15 * 60_000, limit: 5 } })
async socialLogin(
  @Param('provider') provider: string,
  @Body() dto: SocialLoginDto,
) { ... }

// ❌ WRONG — no captcha, no throttling
@Post('social/:provider')
@Public()
async socialLogin(@Param('provider') provider: string, @Body() dto: SocialLoginDto) { ... }
```

The `SocialLoginDto` must include `captchaToken?: string` for hCaptcha verification.

---

## 49. OAuth Email Verification — Check `email_verified` Claim and Handle Apple Private Relay

**Rule:** When creating a user from an OAuth provider:
1. Check the `email_verified` claim from Google/Apple ID tokens (reject if `false`)
2. For Apple Private Relay emails (`@privaterelay.appleid.com`), set `isVerified: false` (prevents user from changing to a real email later)

```typescript
// ✅ CORRECT — checks email_verified, handles Apple Private Relay
const payload = await verifyGoogleIdToken(idToken);
if (payload.email_verified === false) {
  throw new BadRequestException('Email not verified');
}
const isPrivateRelay = payload.email.endsWith('privaterelay.appleid.com');
await prisma.user.create({
  data: {
    email: payload.email,
    isVerified: payload.email_verified && !isPrivateRelay,
    ...
  },
});

// ❌ WRONG — no email_verified check, all Apple users marked verified
await prisma.user.create({
  data: { email: payload.email, isVerified: true, ... },
});
```

---

## 50. OAuth Account Takeover Prevention — Store and Lookup by Provider User ID

**Rule:** Never look up users solely by email during social login. Store the **provider user ID** (`sub` claim from ID token, or `id` from Facebook Graph API) in a `SocialAccount` linking table with a unique constraint on `(provider, providerId)`. Always query by provider ID first to prevent account takeover via email changes.

**Attack scenario:** Alice uses Google (`alice@example.com`). Alice changes Google email to `alice.new@example.com`. Bob creates Google account with `alice@example.com`. If the backend looks up by email, Bob gets Alice's Speakoo account.

```typescript
// ✅ CORRECT — query by provider + provider user ID first
let socialAccount = await prisma.socialAccount.findUnique({
  where: { provider_providerId: { provider: 'google', providerId: payload.sub } },
  include: { user: true },
});
if (socialAccount) return issueTokens(socialAccount.user);

// If no social account exists, check if email exists to link accounts
let user = await prisma.user.findUnique({ where: { email: payload.email } });
if (user) {
  await prisma.socialAccount.create({
    data: { userId: user.id, provider: 'google', providerId: payload.sub },
  });
} else {
  user = await prisma.user.create({
    data: {
      email: payload.email,
      ...
      socialAccounts: { create: { provider: 'google', providerId: payload.sub } },
    },
  });
}

// ❌ WRONG — email-only lookup allows account takeover
let user = await prisma.user.findUnique({ where: { email: payload.email } });
if (!user) user = await prisma.user.create({ data: { email: payload.email, ... } });
return issueTokens(user);
```

Prisma schema:
```prisma
enum SocialProvider { google facebook apple }

model SocialAccount {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId     String   @map("user_id") @db.Uuid
  provider   SocialProvider
  providerId String   @map("provider_id")  // OAuth sub claim or Graph API id
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerId], map: "social_accounts_provider_provider_id_key")
  @@map("social_accounts")
}
```

---

## 51. OAuth Env Variables Must Exist in All Environment Example Files

**Rule:** Any environment variable consumed by the backend (especially OAuth credentials) must be documented in **all** environment template files: `apps/api/.env.example`, `.env.development.example`, and `.env.production.example`.

```bash
# ✅ CORRECT — all three files have OAuth section
# apps/api/.env.example:
GOOGLE_CLIENT_ID=REPLACE_ME.apps.googleusercontent.com
FACEBOOK_APP_ID=REPLACE_ME
FACEBOOK_APP_SECRET=REPLACE_ME
APPLE_CLIENT_ID=REPLACE_ME

# .env.development.example: (same vars)
# .env.production.example: (same vars)

# ❌ WRONG — vars in apps/api/.env.example but missing from root env files
```

Root env files are used by Docker Compose and CI/CD. Missing vars cause silent failures or misconfigurations.

---

## 52. Social Auth Must Persist User Data After Token Reception

**Rule:** After receiving an access token from the backend, immediately fetch `/users/me` and persist both the token and the user object to `localStorage` so the UI can display user info (name, role, email).

```typescript
// ✅ CORRECT — fetch user and persist both
async function persistSocialAuth(accessToken: string) {
  setAccessToken(accessToken);
  localStorage.setItem('speakoo_access_token', accessToken);
  
  const { data: user } = await api.get('/users/me');
  localStorage.setItem('speakoo_user', JSON.stringify(user));
}

handleGoogleLogin(credentialResponse: CredentialResponse) {
  const { data } = await axios.post('/auth/social/google', { token: credentialResponse.credential });
  await persistSocialAuth(data.accessToken);
}

// ❌ WRONG — only token persisted, no user data
localStorage.setItem('speakoo_access_token', accessToken);
// UI shows "undefined" for user name/email
```

---

## 53. Deployment Script Migration Timing — After Services Start

**Rule:** Deployment scripts must start Docker services **before** running database migrations. Migrations require a running database connection.

```bash
# ✅ CORRECT — services up, wait, then migrate
docker compose up -d
sleep 10  # wait for DB to be healthy
npx prisma migrate deploy

# ❌ WRONG — migrate before services start
npx prisma migrate deploy  # fails — DB not running yet
docker compose up -d
```

This is a variant of rule 45 but applies specifically to deployment (not update) scripts where the database may not exist yet.
