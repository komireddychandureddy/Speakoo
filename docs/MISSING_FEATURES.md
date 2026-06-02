# Speakoo — Missing Features (Preply Gap Analysis)

Derived from comparing `docs/preply-e2e-test-plan.md` test cases against the current
Speakoo web app (`apps/web/src/`). Each item includes the Preply test reference,
current Speakoo status, and implementation priority.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Already implemented |
| 🔨 | Implemented this sprint |
| ❌ | Missing — not yet built |

---

## Authentication (TC-AUTH)

| Feature | Preply TC | Speakoo Status |
|---------|-----------|----------------|
| Login form (email + password) | TC-AUTH-01 | ✅ `LoginPage.tsx` |
| Password visibility toggle | TC-AUTH-04 | ✅ `LoginPage.tsx` has `showPw` + Eye icons |
| Social login (Google, Facebook, Apple) | TC-AUTH-05 | ✅ `LoginPage.tsx` |
| Logout clears session | TC-AUTH-08 | ✅ `Sidebar.tsx` logout |
| OTP verification page | TC-AUTH-07 | ✅ `OtpVerifyPage.tsx` |
| Email verification confirmation banner | TC-AUTH-09 | ❌ Not implemented |

---

## Tutor Discovery (TC-DISC)

| Feature | Preply TC | Speakoo Status |
|---------|-----------|----------------|
| Search tutors by name / specialty | TC-DISC-01 | ✅ `AllTutorsPage.tsx` |
| Filter by price range | TC-DISC-02 | ✅ `AllTutorsPage.tsx` |
| Filter by country | TC-DISC-03 | ✅ `AllTutorsPage.tsx` |
| Filter by availability | TC-DISC-04 | ✅ `AllTutorsPage.tsx` |
| Filter by language taught | TC-DISC-05 | ✅ `AllTutorsPage.tsx` |
| Sort (price, rating, popular, newest) | TC-DISC-06 | ✅ `AllTutorsPage.tsx` |
| Save / Favourite tutor from card | TC-DISC-07 | 🔨 Added heart icon to cards |
| Native speaker filter | TC-DISC-08 | ❌ No native-speaker flag in data |
| Language Level Test wizard onboarding | TC-DISC-09 | 🔨 `/language-test` page created |

---

## Tutor Profile (TC-PROF)

| Feature | Preply TC | Speakoo Status |
|---------|-----------|----------------|
| Tutor profile page | TC-PROF-01 | ✅ `TutorDetailsPage.tsx` |
| Tutor intro video | TC-PROF-02 | 🔨 Video section added to `TutorDetailsPage` |
| Save / Favourite button | TC-PROF-03 | 🔨 Heart button added to `TutorDetailsPage` |
| Booking calendar (weekly slots) | TC-PROF-04 | 🔨 Availability schedule added |
| Book trial session CTA | TC-PROF-05 | ✅ "Book Session" button |
| Message tutor button | TC-PROF-06 | 🔨 "Message" button links to `/messages` |
| Share tutor profile button | TC-PROF-07 | 🔨 Share button copies URL to clipboard |
| Specialties as expandable accordion | TC-PROF-08 | 🔨 Accordion added |

---

## My Lessons / Sessions (TC-LESS)

| Feature | Preply TC | Speakoo Status |
|---------|-----------|----------------|
| Upcoming sessions list | TC-LESS-01 | ✅ `MySessionsPage.tsx` |
| Past sessions with feedback | TC-LESS-02 | ✅ `MySessionsPage.tsx` |
| Empty state message | TC-LESS-03 | ✅ Empty state in `MySessionsPage` |

---

## Messages / Chat (TC-MSG)

| Feature | Preply TC | Speakoo Status |
|---------|-----------|----------------|
| Messages inbox (conversation list) | TC-MSG-01 | 🔨 `/messages` page created |
| Open a conversation & send a message | TC-MSG-02 | 🔨 Basic chat UI implemented |
| Unread message count badge | TC-MSG-03 | 🔨 Unread badge on sidebar nav |

---

## Account Settings (TC-SET)

| Feature | Preply TC | Speakoo Status |
|---------|-----------|----------------|
| Profile photo upload | TC-SET-01 | ✅ `ProfilePage.tsx` camera button |
| Display name / bio / location | TC-SET-02 | ✅ `ProfilePage.tsx` |
| Change password | TC-SET-03 | 🔨 Added to `/settings` page |
| Change email address | TC-SET-04 | 🔨 Added to `/settings` page |
| Payment methods management | TC-SET-05 | ❌ Not implemented (requires Stripe integration) |
| Payment history | TC-SET-06 | ❌ Not implemented |
| Session auto-confirmation toggle | TC-SET-07 | 🔨 Toggle in `/settings` notifications tab |
| Calendar sync (Google / Outlook) | TC-SET-08 | ❌ Not implemented (requires OAuth scopes) |
| Notification preferences | TC-SET-09 | 🔨 Notifications tab in `/settings` |
| Delete account | TC-SET-10 | 🔨 Danger zone in `/settings` |
| Language preference | TC-SET-11 | ✅ `LanguageSwitcher` in `Header.tsx` |

---

## Subscription & Credits (TC-SUB)

| Feature | Preply TC | Speakoo Status |
|---------|-----------|----------------|
| View subscription / credits | TC-SUB-01 | ✅ `CreditsPage.tsx` |
| Upgrade / buy plan | TC-SUB-02 | ✅ `SubscriptionPage.tsx` |

---

## Saved / Favourite Tutors (TC-FAV)

| Feature | Preply TC | Speakoo Status |
|---------|-----------|----------------|
| Add tutor to favourites | TC-FAV-01 | 🔨 Heart icon on cards and detail page |
| View saved tutors list | TC-FAV-02 | 🔨 `/favorites` page created |

---

## Language Level Test (TC-TEST)

| Feature | Preply TC | Speakoo Status |
|---------|-----------|----------------|
| Take a placement / level test | TC-TEST-01 | 🔨 `/language-test` page with 10-question quiz |

---

## Online / Group Classes (TC-CLASS)

| Feature | Preply TC | Speakoo Status |
|---------|-----------|----------------|
| Browse group / online classes | TC-CLASS-01 | ❌ No frontend page (backend module exists) |

---

## Referral Program (TC-REF)

| Feature | Preply TC | Speakoo Status |
|---------|-----------|----------------|
| Referral link generation | TC-REF-01 | ✅ `ReferralPage.tsx` |
| Referral reward tracking | TC-REF-02 | ✅ `ReferralPage.tsx` |

---

## Become a Tutor (TC-TUTOR)

| Feature | Preply TC | Speakoo Status |
|---------|-----------|----------------|
| Become-a-tutor marketing page | TC-TUTOR-01 | ✅ `BecomeTutorPage.tsx` |
| Tutor application form | TC-TUTOR-02 | ✅ `TutorApplyPage.tsx` |
| Tutor dashboard | TC-TUTOR-03 | ✅ `TutorDashboardPage.tsx` |
| Tutor availability scheduling | TC-TUTOR-04 | ✅ `TutorSchedulePage.tsx` |

---

## Navigation & Footer (TC-NAV)

| Feature | Preply TC | Speakoo Status |
|---------|-----------|----------------|
| Header navigation | TC-NAV-01 | ✅ `Header.tsx` + `Sidebar.tsx` |
| Notifications bell panel | TC-NAV-02 | ✅ `NotificationsPanel.tsx` |
| Language / locale switcher | TC-NAV-03 | ✅ `LanguageSwitcher` in `Header.tsx` |
| Footer with navigation sections | TC-NAV-04 | ✅ `PublicFooter.tsx` (public pages only) — ❌ No footer in app layout |
| 404 error page | TC-NAV-05 | 🔨 `NotFoundPage.tsx` created + `*` catch-all route |

---

## Accessibility (TC-A11Y)

| Feature | Preply TC | Speakoo Status |
|---------|-----------|----------------|
| Keyboard tab navigation | TC-A11Y-01 | ✅ Native HTML focus |
| Notifications bell panel | TC-A11Y-02 | ✅ `NotificationsPanel.tsx` |
| Help center / FAQ link | TC-A11Y-03 | ✅ `/faq` route in sidebar |
| Scroll to top button on long pages | TC-A11Y-04 | 🔨 `ScrollToTopButton` component added |

---

## Backlog — Not Prioritised This Sprint

These items require deeper backend changes or third-party integrations:

- **Payment methods** (TC-SET-05): Requires Stripe Connect saved-cards flow
- **Payment history** (TC-SET-06): Requires backend `/payments/history` endpoint + pagination
- **Calendar sync** (TC-SET-08): Requires Google Calendar / Outlook OAuth scope
- **Native speaker filter** (TC-DISC-08): Requires `isNativeSpeaker` flag in tutor schema
- **Group / Online Classes page** (TC-CLASS-01): Requires wiring `group-sessions` backend module to a frontend page
- **Email confirmation banner** (TC-AUTH-09): Requires detecting `isVerified: false` at login and showing a persistent banner
- **App-layout footer**: Public footer exists; an app-layout footer with links needs design decision on whether it fits the sidebar layout
