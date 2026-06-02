# Speakoo Platform – Comprehensive E2E Test Plan

## Application Overview

Speakoo is an online language tutoring marketplace connecting Learners with Tutors. After login, the platform exposes three primary roles: **Learner**, **Tutor**, and **Admin**. Key areas include: tutor discovery & filtering, tutor profile viewing, session booking, practice modes (speaking, reading, grammar, vocabulary, etc.), community forum, credits & wallet, subscription management, referral program, leaderboard, profile/settings, and the Become-a-Tutor multi-step application flow. The base URL is **https://speakoo.duckdns.org**.

---

## Test File Structure

```
PlaywrightTests/tests/
  seed.spec.ts                    ← shared auth setup
  auth/
    login.spec.ts
    logout.spec.ts
  learner/
    dashboard.spec.ts
    discover-tutors.spec.ts
    tutor-profile.spec.ts
    book-session.spec.ts
    my-sessions.spec.ts
    credits.spec.ts
    profile.spec.ts
    referral.spec.ts
    leaderboard.spec.ts
    practice.spec.ts
    community.spec.ts
    faq.spec.ts
    ey-resource.spec.ts
    curriculum.spec.ts
  tutor/
    become-tutor.spec.ts
    tutor-dashboard.spec.ts
  admin/
    admin-dashboard.spec.ts
  navigation/
    header.spec.ts
    footer.spec.ts
```

---

## Test Scenarios

### 1. Authentication

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-AUTH-01: Successful login with valid email and password

**File:** `tests/auth/login.spec.ts`

**Steps:**
  1. Navigate to https://speakoo.duckdns.org/
    - expect: The Speakoo welcome page loads with a 'Get Started' or 'Login' button visible
  2. Navigate to https://speakoo.duckdns.org/login
    - expect: Login page loads with Email and Password input fields visible
    - expect: Social login buttons (Google) are present
  3. Enter valid learner email in the Email field
    - expect: Email is accepted without error
  4. Enter valid password in the Password field
    - expect: Password is masked by default
  5. Click the 'Login' or 'Sign In' button
    - expect: User is redirected to /dashboard
    - expect: Dashboard greeting message (e.g., 'Hello, [Name]!') is visible
    - expect: Navigation sidebar is visible

#### 1.2. TC-AUTH-02: Login with invalid credentials

**File:** `tests/auth/login.spec.ts`

**Steps:**
  1. Navigate to https://speakoo.duckdns.org/login
    - expect: Login page loads
  2. Enter an invalid email 'wronguser@example.com'
  3. Enter an invalid password 'WrongPass123'
  4. Click the login button
    - expect: An error message is displayed (e.g., 'Invalid credentials' or 'User not found')
    - expect: User remains on the /login page

#### 1.3. TC-AUTH-03: Login form validation – empty fields

**File:** `tests/auth/login.spec.ts`

**Steps:**
  1. Navigate to https://speakoo.duckdns.org/login
  2. Click the login button without entering any credentials
    - expect: Validation errors appear on Email and/or Password fields
    - expect: User remains on the login page
  3. Enter only email and click login
    - expect: Validation error appears only on the Password field

#### 1.4. TC-AUTH-04: Google social login button is present

**File:** `tests/auth/login.spec.ts`

**Steps:**
  1. Navigate to https://speakoo.duckdns.org/login
    - expect: 'Continue with Google' button is visible
  2. Click the Google login button
    - expect: Google OAuth popup or redirect is initiated

#### 1.5. TC-AUTH-05: Navigate to login from welcome page

**File:** `tests/auth/login.spec.ts`

**Steps:**
  1. Navigate to https://speakoo.duckdns.org/
    - expect: Welcome page loads with Speakoo branding
    - expect: 'Get Started', 'Login', or navigation buttons are visible
  2. Click the login/sign-in link
    - expect: User is navigated to /login

#### 1.6. TC-AUTH-06: Unauthenticated access redirects to login

**File:** `tests/auth/login.spec.ts`

**Steps:**
  1. Without any session, navigate to https://speakoo.duckdns.org/dashboard
    - expect: User is redirected to /login
  2. Without any session, navigate to https://speakoo.duckdns.org/allTutors
    - expect: User is redirected to /login

#### 1.7. TC-AUTH-07: Email OTP verification flow

**File:** `tests/auth/login.spec.ts`

**Steps:**
  1. Navigate to https://speakoo.duckdns.org/verify-email
    - expect: OTP verification page loads with an input for the OTP code
  2. Enter an invalid/expired OTP code
    - expect: An error message is shown (e.g., 'Invalid OTP' or 'Code expired')
  3. Enter a valid 6-digit OTP
    - expect: User is redirected to the dashboard or a success screen

#### 1.8. TC-AUTH-08: Successful logout

**File:** `tests/auth/logout.spec.ts`

**Steps:**
  1. Login with valid credentials using the seed file
    - expect: User is on the /dashboard page
  2. Locate the logout button (in navigation sidebar or header avatar)
  3. Click 'Logout'
    - expect: User is redirected to /login or /
    - expect: Navigating to /dashboard now redirects to /login
    - expect: `speakoo_access_token` and `speakoo_user` are cleared from localStorage

---

### 2. Learner – Dashboard

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-DASH-01: Dashboard page loads correctly

**File:** `tests/learner/dashboard.spec.ts`

**Steps:**
  1. Login and navigate to https://speakoo.duckdns.org/dashboard
    - expect: Personalized greeting is shown (e.g., 'Good morning, [Name]!')
    - expect: Stats bar shows: Sessions Done, Current League, Wallet Balance
    - expect: 'Upcoming Sessions' section is visible
    - expect: Quick-action tiles are present: My Sessions, Book Session, All Tutors, EY Resource, Curriculum, My Level

#### 2.2. TC-DASH-02: Dashboard quick tiles navigate correctly

**File:** `tests/learner/dashboard.spec.ts`

**Steps:**
  1. On /dashboard, click 'My Sessions' tile
    - expect: User is navigated to /mySession
  2. Return to /dashboard and click 'Book Session' tile
    - expect: User is navigated to /myClass
  3. Return to /dashboard and click 'All Tutors' tile
    - expect: User is navigated to /allTutors
  4. Return to /dashboard and click 'My Level' tile
    - expect: User is navigated to /Leaderboard

#### 2.3. TC-DASH-03: Upcoming sessions section – empty state

**File:** `tests/learner/dashboard.spec.ts`

**Steps:**
  1. Login with an account that has no upcoming sessions and navigate to /dashboard
    - expect: 'No upcoming sessions' empty state is shown
    - expect: 'Book one now' link is visible and navigates to /myClass

#### 2.4. TC-DASH-04: Upcoming sessions section – with sessions

**File:** `tests/learner/dashboard.spec.ts`

**Steps:**
  1. Login with an account that has upcoming sessions and navigate to /dashboard
    - expect: Session cards are shown with tutor name, date, and time slot
    - expect: 'View all →' link navigates to /mySession

---

### 3. Learner – Tutor Discovery & Filtering

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-DISC-01: Browse all tutors listing page

**File:** `tests/learner/discover-tutors.spec.ts`

**Steps:**
  1. Login and navigate to https://speakoo.duckdns.org/allTutors
    - expect: Tutors listing page loads with a search bar
    - expect: Tutor cards are displayed with name, language, rating, experience, price, and availability status
    - expect: Filter bar/panel is accessible
    - expect: Sort dropdown shows 'Recommended' by default

#### 3.2. TC-DISC-02: Search tutors by name

**File:** `tests/learner/discover-tutors.spec.ts`

**Steps:**
  1. Navigate to /allTutors
  2. Type a tutor name (or partial name) into the search input
    - expect: Tutor list filters to show matching results
  3. Clear the search input
    - expect: Full tutor list is restored

#### 3.3. TC-DISC-03: Filter tutors by language specialty

**File:** `tests/learner/discover-tutors.spec.ts`

**Steps:**
  1. Navigate to /allTutors
  2. Click a language filter chip (e.g., 'English', 'French')
    - expect: Only tutors specialising in that language are shown
    - expect: The active chip is visually highlighted

#### 3.4. TC-DISC-04: Filter tutors by availability

**File:** `tests/learner/discover-tutors.spec.ts`

**Steps:**
  1. Navigate to /allTutors
  2. Open filters and enable 'Available Only' toggle
    - expect: Only tutors marked as available are shown
    - expect: Active filter count badge updates

#### 3.5. TC-DISC-05: Filter tutors by price range

**File:** `tests/learner/discover-tutors.spec.ts`

**Steps:**
  1. Navigate to /allTutors and open the filter panel
  2. Select 'Budget (≤ ₹399)' price range
    - expect: Only tutors priced ≤ ₹399 per session are shown
  3. Select 'Premium (≥ ₹500)' price range
    - expect: Only premium-priced tutors are shown

#### 3.6. TC-DISC-06: Filter tutors by country

**File:** `tests/learner/discover-tutors.spec.ts`

**Steps:**
  1. Navigate to /allTutors and open the filter panel
  2. Select a specific country (e.g., 'India')
    - expect: Only tutors from India are shown with the appropriate flag icon (🇮🇳)

#### 3.7. TC-DISC-07: Sort tutors

**File:** `tests/learner/discover-tutors.spec.ts`

**Steps:**
  1. Navigate to /allTutors
  2. Click the sort dropdown and select 'Price: Low to High'
    - expect: Tutor cards reorder with the cheapest tutor first
  3. Select 'Rating: High to Low'
    - expect: Tutor cards reorder with the highest-rated tutor first

#### 3.8. TC-DISC-08: Reset all filters

**File:** `tests/learner/discover-tutors.spec.ts`

**Steps:**
  1. Navigate to /allTutors and apply multiple filters (price, country, availability)
    - expect: Active filter count badge shows the correct count (e.g., 3)
  2. Click the 'Reset' or 'Clear filters' button
    - expect: All filters are reset to defaults
    - expect: Full tutor list is restored

#### 3.9. TC-DISC-09: Filter by experience level

**File:** `tests/learner/discover-tutors.spec.ts`

**Steps:**
  1. Navigate to /allTutors and open the filter panel
  2. Select 'Senior (8+ yrs)' experience level
    - expect: Only tutors with 8+ years of experience are shown

---

### 4. Learner – Tutor Profile

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-PROF-01: View tutor profile page

**File:** `tests/learner/tutor-profile.spec.ts`

**Steps:**
  1. Login and navigate to /allTutors
    - expect: Tutor cards are displayed
  2. Click 'View Profile' or the tutor card to open the first tutor's profile
    - expect: Tutor profile page opens at /TutorDetailsView/:id
    - expect: Tutor avatar/initials are displayed
    - expect: Tutor name, language specialty, and experience are shown
    - expect: Star rating and session count are visible
    - expect: Availability badge (Available/Unavailable) is displayed
    - expect: Session price per session is shown (e.g., ₹450 / session)
    - expect: 'Book Session' CTA button is visible (disabled if unavailable)

#### 4.2. TC-PROF-02: Tutor bio and specialties

**File:** `tests/learner/tutor-profile.spec.ts`

**Steps:**
  1. Navigate to a tutor's profile page
    - expect: 'About' / bio section with a description is visible
    - expect: Specialty tags are shown as pills (e.g., 'Business English', 'Conversation', 'IELTS')

#### 4.3. TC-PROF-03: View student reviews

**File:** `tests/learner/tutor-profile.spec.ts`

**Steps:**
  1. Navigate to a tutor's profile page and scroll to the reviews section
    - expect: Student reviews are displayed with reviewer name, rating, text, and date
    - expect: At least 3 sample reviews are shown

#### 4.4. TC-PROF-04: Book session from tutor profile

**File:** `tests/learner/tutor-profile.spec.ts`

**Steps:**
  1. Navigate to an available tutor's profile page
    - expect: 'Book Session' button is enabled
  2. Click 'Book Session'
    - expect: User is navigated to /myClass (BookSessionPage)

#### 4.5. TC-PROF-05: Unavailable tutor – book button disabled

**File:** `tests/learner/tutor-profile.spec.ts`

**Steps:**
  1. Navigate to a tutor profile where `isAvailable = false`
    - expect: Button shows 'Unavailable' and is disabled (cannot be clicked)

#### 4.6. TC-PROF-06: Back navigation from tutor profile

**File:** `tests/learner/tutor-profile.spec.ts`

**Steps:**
  1. Navigate to a tutor profile from /allTutors
  2. Click the '← Back' button
    - expect: User is navigated back to /allTutors

---

### 5. Learner – Session Booking

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-BOOK-01: Book session page loads

**File:** `tests/learner/book-session.spec.ts`

**Steps:**
  1. Login and navigate to https://speakoo.duckdns.org/myClass
    - expect: Book Session page loads with a list of available tutors or a booking form
    - expect: Tutor selection, date, and time slot options are visible
    - expect: Session fee / credit cost is displayed

#### 5.2. TC-BOOK-02: Select a tutor and time slot

**File:** `tests/learner/book-session.spec.ts`

**Steps:**
  1. Navigate to /myClass
  2. Select a tutor from the available list
    - expect: Tutor is highlighted/selected
  3. Select a date from the calendar
    - expect: Date is marked as selected
  4. Select an available time slot
    - expect: Time slot is highlighted
    - expect: Booking summary shows the chosen tutor, date, time, and cost

#### 5.3. TC-BOOK-03: Confirm booking

**File:** `tests/learner/book-session.spec.ts`

**Steps:**
  1. Complete the tutor and time slot selection on /myClass
  2. Click 'Confirm' or 'Book Now'
    - expect: Booking confirmation message or success notification is shown
    - expect: User is redirected to /mySession or a confirmation screen
    - expect: The new session appears in the 'Upcoming' tab of /mySession

---

### 6. Learner – My Sessions

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-SESS-01: My Sessions page loads with correct tabs

**File:** `tests/learner/my-sessions.spec.ts`

**Steps:**
  1. Login and navigate to https://speakoo.duckdns.org/mySession
    - expect: My Sessions page loads
    - expect: Five tabs are visible: Upcoming, Completed, Cancelled, Missed, Pending
    - expect: 'Upcoming' tab is active by default

#### 6.2. TC-SESS-02: Switch between session tabs

**File:** `tests/learner/my-sessions.spec.ts`

**Steps:**
  1. Navigate to /mySession
  2. Click the 'Completed' tab
    - expect: Completed sessions are shown (or empty state: 'No completed sessions')
  3. Click 'Cancelled' tab
    - expect: Cancelled sessions are shown (or empty state)
  4. Click 'Missed' tab
    - expect: Missed sessions are shown (or empty state)

#### 6.3. TC-SESS-03: Upcoming session card actions

**File:** `tests/learner/my-sessions.spec.ts`

**Steps:**
  1. Navigate to /mySession (Upcoming tab) with at least one upcoming session
    - expect: Session card shows session number, tutor name, date, time slot, and status badge
    - expect: 'Join Session' or action buttons are visible
  2. Click 'Join Session' if the session is due soon
    - expect: User is navigated to /session-room/:id

#### 6.4. TC-SESS-04: Download session notes

**File:** `tests/learner/my-sessions.spec.ts`

**Steps:**
  1. Navigate to /mySession and click the 'Completed' tab
  2. Click 'Download Notes' on a completed session
    - expect: A .txt file is downloaded with session details and notes

#### 6.5. TC-SESS-05: Report a session

**File:** `tests/learner/my-sessions.spec.ts`

**Steps:**
  1. Navigate to /mySession with a session that has a 'Report' option
  2. Click 'Report' on a session card
    - expect: A report modal opens with input fields for the reason/description
  3. Submit the report form
    - expect: A success message appears and the modal closes

#### 6.6. TC-SESS-06: Empty state for sessions

**File:** `tests/learner/my-sessions.spec.ts`

**Steps:**
  1. Navigate to /mySession and click the 'Pending' tab
    - expect: If no pending sessions exist, an empty state is shown (e.g., 'No pending sessions' with an emoji)

---

### 7. Learner – Credits & Wallet

**Seed:** `tests/seed.spec.ts`

#### 7.1. TC-CRED-01: Credits page loads

**File:** `tests/learner/credits.spec.ts`

**Steps:**
  1. Login and navigate to https://speakoo.duckdns.org/my-credits
    - expect: Credits/Wallet page loads with current credit balance prominently displayed
    - expect: Credit purchase options or packages are visible
    - expect: Transaction history or credit usage log is accessible

#### 7.2. TC-CRED-02: Redirect from /chooseSubscription

**File:** `tests/learner/credits.spec.ts`

**Steps:**
  1. Navigate to https://speakoo.duckdns.org/chooseSubscription
    - expect: User is automatically redirected to /my-credits (per the `<Navigate>` route config)

---

### 8. Learner – Profile Settings

**Seed:** `tests/seed.spec.ts`

#### 8.1. TC-PROF-SET-01: Profile settings page loads

**File:** `tests/learner/profile.spec.ts`

**Steps:**
  1. Login and navigate to https://speakoo.duckdns.org/myProfile
    - expect: Profile settings page loads
    - expect: User's name and email are pre-filled
    - expect: Profile photo / avatar upload option is visible
    - expect: Language preference and timezone fields are present

#### 8.2. TC-PROF-SET-02: Update display name

**File:** `tests/learner/profile.spec.ts`

**Steps:**
  1. Navigate to /myProfile
  2. Clear and update the name field with a new value
  3. Click 'Save' or 'Update Profile'
    - expect: A success notification appears
    - expect: The new name is reflected on the dashboard greeting

#### 8.3. TC-PROF-SET-03: Phone number input uses country code selector

**File:** `tests/learner/profile.spec.ts`

**Steps:**
  1. Navigate to /myProfile
    - expect: Phone number field has a country code dropdown (flag + dial code)
  2. Click the country dropdown
    - expect: A searchable list of countries with flags and dial codes is shown
  3. Select a country (e.g., 🇺🇸 +1) and enter a phone number
    - expect: The combined E.164 format is constructed (e.g., +12025550100)

---

### 9. Learner – Referral Program

**Seed:** `tests/seed.spec.ts`

#### 9.1. TC-REF-01: View referral page

**File:** `tests/learner/referral.spec.ts`

**Steps:**
  1. Login and navigate to https://speakoo.duckdns.org/reffer_earn
    - expect: Referral page loads with a heading about referring friends
    - expect: Referral link or code is displayed (or a prompt to complete a lesson first)
    - expect: Reward/credit details for successful referrals are shown

#### 9.2. TC-REF-02: Copy referral link

**File:** `tests/learner/referral.spec.ts`

**Steps:**
  1. Navigate to /reffer_earn
  2. Click 'Copy Link' or 'Copy Code' button
    - expect: A success notification appears (e.g., 'Copied to clipboard!')

---

### 10. Learner – Leaderboard

**Seed:** `tests/seed.spec.ts`

#### 10.1. TC-LEAD-01: Leaderboard page loads

**File:** `tests/learner/leaderboard.spec.ts`

**Steps:**
  1. Login and navigate to https://speakoo.duckdns.org/Leaderboard
    - expect: Leaderboard page loads with a list of ranked learners
    - expect: Each entry shows rank position, name, and score/session count
    - expect: Current user's position is highlighted

#### 10.2. TC-LEAD-02: League levels are shown

**File:** `tests/learner/leaderboard.spec.ts`

**Steps:**
  1. Navigate to /Leaderboard
    - expect: League tiers (Bronze, Silver, Gold, etc.) are visible
    - expect: Current user's league badge (e.g., 'Bronze') matches the dashboard display

---

### 11. Learner – Practice Modes

**Seed:** `tests/seed.spec.ts`

#### 11.1. TC-PRAC-01: Practice page loads with all modes

**File:** `tests/learner/practice.spec.ts`

**Steps:**
  1. Login and navigate to https://speakoo.duckdns.org/practice
    - expect: Practice page loads with a hero banner: 'Free Speaking Practice'
    - expect: Credits available badge (e.g., '120 credits available') is shown
    - expect: Demo completion status badge is visible
    - expect: 9 practice mode cards are displayed: Speaking, Reading, Listening, Phonetics, Word Puzzles, Sentence Build, Vocabulary, Grammar Drills, Dictation

#### 11.2. TC-PRAC-02: Group session credit display

**File:** `tests/learner/practice.spec.ts`

**Steps:**
  1. Navigate to /practice
    - expect: Group session fee section shows '5 credits per session · up to 8 learners'

#### 11.3. TC-PRAC-03: Navigate to a practice exercise

**File:** `tests/learner/practice.spec.ts`

**Steps:**
  1. Navigate to /practice
  2. Click the 'Speaking' mode card
    - expect: User is navigated to /practice/exercise?mode=speaking
    - expect: Exercise page loads with speaking-specific content
  3. Return and click 'Grammar Drills'
    - expect: User is navigated to /practice/exercise?mode=grammar

#### 11.4. TC-PRAC-04: Practice exercise page loads per mode

**File:** `tests/learner/practice.spec.ts`

**Steps:**
  1. Navigate to /practice/exercise?mode=vocabulary
    - expect: Vocabulary exercise content is shown (e.g., flashcard-style interface)
  2. Navigate to /practice/exercise?mode=dictation
    - expect: Dictation exercise content is shown (listen & type interface)

#### 11.5. TC-PRAC-05: Live group session cards display in practice page

**File:** `tests/learner/practice.spec.ts`

**Steps:**
  1. Navigate to /practice
    - expect: Live group session listings are displayed with language, CEFR level badge (A1–C2), time, speaker count, and a 'Join' or 'Book' button
    - expect: CEFR level badges use appropriate colour coding (A1: green, B2: indigo, C1: purple)

---

### 12. Learner – Community Forum

**Seed:** `tests/seed.spec.ts`

#### 12.1. TC-COMM-01: Community page loads

**File:** `tests/learner/community.spec.ts`

**Steps:**
  1. Login and navigate to https://speakoo.duckdns.org/community
    - expect: Community forum page loads with a list of discussion threads
    - expect: Each thread shows title, author, category/tag, reply count, and timestamp

#### 12.2. TC-COMM-02: Open a community thread

**File:** `tests/learner/community.spec.ts`

**Steps:**
  1. Navigate to /community
  2. Click on a discussion thread
    - expect: Thread detail page opens at /community/:id
    - expect: Original post content is shown
    - expect: Reply/comment list is displayed below
    - expect: A text input or reply box is available for posting a reply

#### 12.3. TC-COMM-03: Back navigation from thread

**File:** `tests/learner/community.spec.ts`

**Steps:**
  1. Navigate to /community/:id
  2. Click the back button or browser back
    - expect: User returns to /community

---

### 13. Learner – FAQ

**Seed:** `tests/seed.spec.ts`

#### 13.1. TC-FAQ-01: FAQ page loads

**File:** `tests/learner/faq.spec.ts`

**Steps:**
  1. Login and navigate to https://speakoo.duckdns.org/faq
    - expect: FAQ page loads with a list of questions
    - expect: Questions are in an accordion or expandable format

#### 13.2. TC-FAQ-02: Expand and collapse FAQ items

**File:** `tests/learner/faq.spec.ts`

**Steps:**
  1. Navigate to /faq
  2. Click on a FAQ question
    - expect: The answer expands and is visible
  3. Click on the same question again
    - expect: The answer collapses (accordion behaviour)

---

### 14. Learner – EY Resources & Curriculum

**Seed:** `tests/seed.spec.ts`

#### 14.1. TC-RES-01: EY Resource page loads

**File:** `tests/learner/ey-resource.spec.ts`

**Steps:**
  1. Login and navigate to https://speakoo.duckdns.org/ey-resource
    - expect: EY Resource page loads with learning materials
    - expect: Resources are categorised or listed with titles and descriptions

#### 14.2. TC-CURR-01: Curriculum page loads

**File:** `tests/learner/curriculum.spec.ts`

**Steps:**
  1. Login and navigate to https://speakoo.duckdns.org/Curriculum
    - expect: Curriculum page loads with a structured course/lesson plan
    - expect: Levels or modules are displayed (e.g., A1–C2 structure)

---

### 15. Tutor – Become a Tutor Flow

**Seed:** `tests/seed.spec.ts`

#### 15.1. TC-BT-01: View Become a Tutor landing page

**File:** `tests/tutor/become-tutor.spec.ts`

**Steps:**
  1. Navigate to https://speakoo.duckdns.org/become-a-tutor (no login required)
    - expect: Page loads with a heading about becoming a tutor on Speakoo
    - expect: Key benefits or earning potential information is displayed
    - expect: 'Apply Now' or 'Start Application' CTA button is visible

#### 15.2. TC-BT-02: Access the tutor application form

**File:** `tests/tutor/become-tutor.spec.ts`

**Steps:**
  1. Navigate to /become-a-tutor
  2. Click the 'Apply Now' CTA button
    - expect: User is navigated to /tutor-apply
    - expect: Step 1 of the multi-step application form loads

#### 15.3. TC-BT-03: Tutor application – Step 1: Personal Info

**File:** `tests/tutor/become-tutor.spec.ts`

**Steps:**
  1. Navigate to https://speakoo.duckdns.org/tutor-apply
    - expect: Step 1 'Personal Info' is active (highlighted in progress bar)
    - expect: Fields for First Name, Last Name, Email, Phone, Country, and City are shown
  2. Attempt to proceed without filling required fields
    - expect: 'Next' button remains disabled or shows validation errors
  3. Fill in all required fields (First Name, Last Name, Email, Country)
    - expect: 'Next' button becomes enabled
  4. Click 'Next'
    - expect: Step 2 'Language & Skills' becomes active

#### 15.4. TC-BT-04: Tutor application – Step 2: Language & Skills

**File:** `tests/tutor/become-tutor.spec.ts`

**Steps:**
  1. Complete Step 1 and advance to Step 2
    - expect: Multi-language checkboxes are shown (English, French, Spanish, Mandarin, etc.)
    - expect: Proficiency level selector is present
    - expect: Certifications (CELTA, TEFL, TESOL, etc.) checkboxes are shown
    - expect: Years of experience dropdown is present
  2. Select at least one language and fill required fields
  3. Click 'Next'
    - expect: Step 3 'Teaching Style' becomes active

#### 15.5. TC-BT-05: Tutor application – Step 3: Teaching Style

**File:** `tests/tutor/become-tutor.spec.ts`

**Steps:**
  1. Advance to Step 3
    - expect: Bio / 'About Me' text area is shown
    - expect: Teaching style input is present
    - expect: Max sessions per week field is shown
    - expect: Availability day checkboxes (Monday–Sunday) are shown
  2. Fill bio and select at least one availability day
  3. Click 'Next'
    - expect: Step 4 'Review & Submit' becomes active

#### 15.6. TC-BT-06: Tutor application – Step 4: Review & Submit

**File:** `tests/tutor/become-tutor.spec.ts`

**Steps:**
  1. Advance to Step 4
    - expect: A summary of all entered information from Steps 1–3 is displayed
    - expect: Terms & Conditions checkbox is present with label 'I agree...'
  2. Check the agreement checkbox
    - expect: 'Submit Application' button becomes enabled
  3. Click 'Submit Application'
    - expect: A success screen or confirmation message appears with a reference number (e.g., TUT-XXXXX)
    - expect: Instructions about the review process are shown

#### 15.7. TC-BT-07: Tutor application – navigate backwards

**File:** `tests/tutor/become-tutor.spec.ts`

**Steps:**
  1. Navigate to /tutor-apply and advance to Step 3
  2. Click the '← Back' button
    - expect: User returns to Step 2 with previously entered data preserved
  3. Click '← Back' again
    - expect: User returns to Step 1 with previously entered data preserved

#### 15.8. TC-BT-08: Phone number field uses country code selector

**File:** `tests/tutor/become-tutor.spec.ts`

**Steps:**
  1. Navigate to /tutor-apply (Step 1)
    - expect: Phone field has a country code dropdown (flag + dial code, not a plain text field)
  2. Click the dropdown
    - expect: A searchable country list appears
  3. Select a country and enter digits
    - expect: The dial code prefix is prepended automatically

---

### 16. Tutor – Tutor Dashboard

**Seed:** `tests/seed.spec.ts` (login as tutor role)

#### 16.1. TC-TD-01: Tutor dashboard loads (tutor role)

**File:** `tests/tutor/tutor-dashboard.spec.ts`

**Steps:**
  1. Login with a tutor account and navigate to https://speakoo.duckdns.org/tutor-dashboard
    - expect: Tutor Dashboard page loads
    - expect: Tutor-specific stats are visible (e.g., upcoming sessions, earnings, ratings)
    - expect: Navigation links to Earnings, Schedule, Pricing, Payout are accessible

#### 16.2. TC-TD-02: Tutor earnings page

**File:** `tests/tutor/tutor-dashboard.spec.ts`

**Steps:**
  1. Navigate to https://speakoo.duckdns.org/tutor-earnings
    - expect: Tutor earnings page loads with earnings summary
    - expect: Total earnings, pending payouts, and session count are shown

#### 16.3. TC-TD-03: Tutor schedule management

**File:** `tests/tutor/tutor-dashboard.spec.ts`

**Steps:**
  1. Navigate to https://speakoo.duckdns.org/tutor-schedule
    - expect: Tutor schedule page loads with a calendar or weekly view
    - expect: Available and booked time slots are colour-coded
    - expect: Option to add/remove availability is present

#### 16.4. TC-TD-04: Tutor pricing page

**File:** `tests/tutor/tutor-dashboard.spec.ts`

**Steps:**
  1. Navigate to https://speakoo.duckdns.org/tutor-pricing
    - expect: Tutor pricing page loads showing current session rate (₹ / session)
    - expect: An editable price input and 'Save' button are visible

#### 16.5. TC-TD-05: Tutor payout page

**File:** `tests/tutor/tutor-dashboard.spec.ts`

**Steps:**
  1. Navigate to https://speakoo.duckdns.org/tutor-payout
    - expect: Payout page loads with payment method details
    - expect: Bank/UPI account fields are shown
    - expect: Minimum payout threshold information is displayed

#### 16.6. TC-TD-06: Non-tutor redirect from tutor pages

**File:** `tests/tutor/tutor-dashboard.spec.ts`

**Steps:**
  1. Login as a learner (role: learner) and navigate to /tutor-dashboard
    - expect: User is redirected to /dashboard (learner dashboard)
  2. Navigate to /tutor-schedule
    - expect: User is redirected to /dashboard

---

### 17. Admin – Dashboard

**Seed:** `tests/seed.spec.ts` (login as admin role)

#### 17.1. TC-ADMIN-01: Admin dashboard loads

**File:** `tests/admin/admin-dashboard.spec.ts`

**Steps:**
  1. Login with an admin account and navigate to https://speakoo.duckdns.org/admin
    - expect: Admin Dashboard loads with title 'Admin Dashboard'
    - expect: 5 stat cards are shown: Total Tutors, Total Learners, Sessions This Month, Monthly Revenue, Pending Applications
    - expect: Quick-info row shows: Available Tutors, Active Learners, Pending Sessions
    - expect: 'Recent Sessions' table shows the last 5 sessions with tutor, learner, date, status columns

#### 17.2. TC-ADMIN-02: Non-admin redirect from admin pages

**File:** `tests/admin/admin-dashboard.spec.ts`

**Steps:**
  1. Login as a learner and navigate to https://speakoo.duckdns.org/admin
    - expect: User is redirected to /dashboard
  2. Without login, navigate to /admin
    - expect: User is redirected to /login

#### 17.3. TC-ADMIN-03: Admin tutors management page

**File:** `tests/admin/admin-dashboard.spec.ts`

**Steps:**
  1. Login as admin and navigate to https://speakoo.duckdns.org/admin/tutors
    - expect: Admin Tutors page loads with a list of all registered tutors
    - expect: Each row shows tutor name, language, rating, sessions count, status (active/suspended)
    - expect: Actions to suspend/activate a tutor are available

#### 17.4. TC-ADMIN-04: Admin learners management page

**File:** `tests/admin/admin-dashboard.spec.ts`

**Steps:**
  1. Login as admin and navigate to https://speakoo.duckdns.org/admin/learners
    - expect: Admin Learners page loads with a list of all learners
    - expect: Each row shows learner name, email, join date, sessions count, and status

#### 17.5. TC-ADMIN-05: Admin tutor applications list

**File:** `tests/admin/admin-dashboard.spec.ts`

**Steps:**
  1. Login as admin and navigate to https://speakoo.duckdns.org/admin/applications
    - expect: Applications page loads with a list of tutor applications
    - expect: Status filter tabs (All, Pending, Approved, Rejected) are available
    - expect: Each row shows applicant name, reference number, date applied, and status badge

#### 17.6. TC-ADMIN-06: Admin view application detail

**File:** `tests/admin/admin-dashboard.spec.ts`

**Steps:**
  1. Navigate to /admin/applications and click on a pending application
    - expect: Application detail page opens at /admin/applications/:id
    - expect: All submitted information (personal info, languages, bio) is shown
    - expect: 'Approve' and 'Reject' action buttons are visible
  2. Click 'Approve'
    - expect: Application status changes to 'approved'
    - expect: Success notification appears
    - expect: Application is no longer in the 'Pending' filter tab

---

### 18. Navigation & Layout

**Seed:** `tests/seed.spec.ts`

#### 18.1. TC-NAV-01: App layout sidebar navigation (learner)

**File:** `tests/navigation/header.spec.ts`

**Steps:**
  1. Login as a learner and verify the sidebar or top navigation
    - expect: Speakoo logo is visible and links to /dashboard
    - expect: Navigation items include: Dashboard, My Sessions, Book Session, All Tutors, Practice, Community, Referral, Leaderboard, FAQ, Profile, Credits
    - expect: Logout option is present

#### 18.2. TC-NAV-02: Sidebar navigation for tutor role

**File:** `tests/navigation/header.spec.ts`

**Steps:**
  1. Login as a tutor and check the navigation
    - expect: Tutor-specific links appear: Tutor Dashboard, Earnings, Schedule, Pricing, Payout
    - expect: Learner-specific links may also be accessible

#### 18.3. TC-NAV-03: Admin navigation

**File:** `tests/navigation/header.spec.ts`

**Steps:**
  1. Login as an admin
    - expect: Admin navigation shows links to: Admin Dashboard, Tutors, Learners, Applications
    - expect: Admin layout is distinct from the learner/tutor layout

#### 18.4. TC-NAV-04: Session room page

**File:** `tests/navigation/header.spec.ts`

**Steps:**
  1. Navigate to /session-room/test-session-id while logged in
    - expect: Session room page loads with video/audio controls
    - expect: LiveKit-powered video room UI is shown (or a loading state if no active session)

#### 18.5. TC-NAV-05: 404 / unknown routes

**File:** `tests/navigation/header.spec.ts`

**Steps:**
  1. Navigate to a non-existent route (e.g., /this-page-does-not-exist)
    - expect: A 404 page or redirect to /dashboard/login is shown

---

### 19. Accessibility & UX

**Seed:** `tests/seed.spec.ts`

#### 19.1. TC-A11Y-01: Keyboard navigation on login page

**File:** `tests/auth/login.spec.ts`

**Steps:**
  1. Navigate to /login and press Tab
    - expect: Focus moves through Email → Password → Login button in logical order
    - expect: All interactive elements have visible focus rings
  2. Press Enter on the Login button when focused
    - expect: Form is submitted

#### 19.2. TC-A11Y-02: Responsive layout on mobile viewport

**File:** `tests/navigation/header.spec.ts`

**Steps:**
  1. Set viewport to 375×812 (iPhone SE size) and navigate to /dashboard
    - expect: Dashboard renders without horizontal scrollbar
    - expect: Quick tiles wrap into a 2-column grid
  2. Navigate to /allTutors on mobile viewport
    - expect: Tutor cards are legible and not clipped
    - expect: Filter panel collapses behind a toggle button

#### 19.3. TC-A11Y-03: Practice mode cards are accessible

**File:** `tests/learner/practice.spec.ts`

**Steps:**
  1. Navigate to /practice on mobile viewport (375px wide)
    - expect: Practice mode cards display in 2-column grid
    - expect: Cards are tappable without overlap

---

## Seed File

**File:** `tests/seed.spec.ts`

The seed file provides shared authentication state via `storageState` fixtures:

- **Learner account:** `LEARNER_EMAIL` / `LEARNER_PASSWORD` → `storage/learner-auth.json`
- **Tutor account:** `TUTOR_EMAIL` / `TUTOR_PASSWORD` → `storage/tutor-auth.json`
- **Admin account:** `ADMIN_EMAIL` / `ADMIN_PASSWORD` → `storage/admin-auth.json`

All test files for authenticated routes use `storageState` to reuse the saved session, avoiding repeated login UI steps.
