# Preply Platform – Comprehensive E2E Test Plan

## Application Overview

Preply is an online language tutoring marketplace connecting learners (students) with tutors. After login, the platform exposes two primary roles: Learner and Tutor. Key areas include: tutor discovery & filtering, tutor profile viewing, trial lesson booking with schedule selection, messaging, account settings (profile, password, payment, notifications, calendar), subscriptions, saved/favorite tutors, language level tests, online group classes, referral program, and the Become-a-Tutor onboarding flow. The base URL is https://preply.com.

## Test Scenarios

### 1. Authentication

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-AUTH-01: Successful login with valid email and password

**File:** `tests/auth/login.spec.ts`

**Steps:**
  1. Navigate to https://preply.com/
    - expect: The Preply homepage loads with 'Log In' button visible in the header
  2. Click the 'Log In' button in the header
    - expect: The login page appears at /en/login with Email and Password fields visible
    - expect: Options for Continue with Google, Facebook, Apple and SSO are present
  3. Enter valid email 'komireddychandureddy@gmail.com' in the Email field
    - expect: Email is entered without error
  4. Enter valid password 'Komireddy@7' in the Password field
    - expect: Password is masked by default
    - expect: A 'Reveal password' eye icon is available
  5. Click the 'Log in' button
    - expect: User is redirected to the tutor listing or home page
    - expect: User avatar/profile icon appears in the top-right header
    - expect: The 'Log In' button is no longer visible

#### 1.2. TC-AUTH-02: Login with invalid credentials

**File:** `tests/auth/login.spec.ts`

**Steps:**
  1. Navigate to https://preply.com/en/login
    - expect: Login page loads with Email and Password fields
  2. Enter invalid email 'wronguser@example.com' in the Email field
    - expect: Email is accepted without immediate error
  3. Enter invalid password 'WrongPass123' in the Password field
    - expect: Password field accepts input
  4. Click the 'Log in' button
    - expect: An error message is displayed (e.g., 'Invalid email or password')
    - expect: User remains on the login page
    - expect: No redirect occurs

#### 1.3. TC-AUTH-03: Login form validation – empty fields

**File:** `tests/auth/login.spec.ts`

**Steps:**
  1. Navigate to https://preply.com/en/login
    - expect: Login page loads
  2. Click the 'Log in' button without entering any credentials
    - expect: Validation errors appear on both the Email and Password fields
    - expect: 'This field is required.' messages are shown
    - expect: User remains on the login page
  3. Enter only the email address and click 'Log in'
    - expect: Validation error appears only on the Password field

#### 1.4. TC-AUTH-04: Toggle password visibility on login page

**File:** `tests/auth/login.spec.ts`

**Steps:**
  1. Navigate to https://preply.com/en/login and enter a password in the Password field
    - expect: Password is masked (dots/asterisks)
  2. Click the 'Reveal password' eye icon button
    - expect: Password is displayed as plain text
  3. Click the eye icon again
    - expect: Password is masked again

#### 1.5. TC-AUTH-05: Social login options are present

**File:** `tests/auth/login.spec.ts`

**Steps:**
  1. Navigate to https://preply.com/en/login
    - expect: Login page loads
  2. Verify the presence of social login buttons
    - expect: 'Continue with Google' button is visible
    - expect: 'Continue with Facebook' button is visible
    - expect: 'Continue with Apple' button is visible
    - expect: 'Continue with corporate login (SSO)' button is visible
  3. Click 'Continue with Google'
    - expect: A Google OAuth popup or redirect is initiated

#### 1.6. TC-AUTH-06: Navigate to student signup from login page

**File:** `tests/auth/login.spec.ts`

**Steps:**
  1. Navigate to https://preply.com/en/login
    - expect: Login page loads with signup links visible
  2. Click 'Sign up as a student' link
    - expect: User is redirected to the student signup page at /en/signup

#### 1.7. TC-AUTH-07: Navigate to tutor signup from login page

**File:** `tests/auth/login.spec.ts`

**Steps:**
  1. Navigate to https://preply.com/en/login
    - expect: Login page loads
  2. Click 'Sign up as a tutor' link
    - expect: User is redirected to the tutor registration/teach page at /en/teach

#### 1.8. TC-AUTH-08: Successful logout

**File:** `tests/auth/logout.spec.ts`

**Steps:**
  1. Login with valid credentials using the seed file
    - expect: User is logged in and the avatar is visible in the header
  2. Click the user avatar icon in the top-right corner of the header
    - expect: A dropdown menu appears with options: My lessons, Saved tutors, Refer a friend, Settings, Help, Log out
  3. Click 'Log out' from the dropdown menu
    - expect: User is logged out and redirected to the home or login page
    - expect: The avatar is replaced by the 'Log In' button
    - expect: Navigating to /en/lessons redirects to the login page

#### 1.9. TC-AUTH-09: Email confirmation banner visibility after login

**File:** `tests/auth/login.spec.ts`

**Steps:**
  1. Login with a newly registered account whose email is not yet confirmed
    - expect: A banner at the top reads 'Please confirm your email by clicking the link we sent to [email]'
    - expect: 'Resend confirmation email' and 'Close' buttons are visible
  2. Click 'Resend confirmation email'
    - expect: A success notification or confirmation message is shown
  3. Click the 'Close' (X) button on the banner
    - expect: The banner dismisses and is no longer visible

### 2. Learner – Tutor Discovery & Filtering

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-DISC-01: Browse English tutors listing page

**File:** `tests/learner/discover-tutors.spec.ts`

**Steps:**
  1. Login and navigate to https://preply.com/en/online/english-tutors
    - expect: The tutor listing page loads with the heading 'Online English tutors & teachers for private classes'
    - expect: Tutor cards are displayed with name, rating, lesson count, price and a 'Book trial' or 'See profile' option
    - expect: Filter bar is visible with: I want to learn, Price per lesson, Country of birth, I'm available dropdowns
    - expect: A 'Show X,XXX tutors' count button is visible
    - expect: Specialties, Also speaks, Native speaker, Tutor categories and Sort by filters are visible

#### 2.2. TC-DISC-02: Filter tutors by price range

**File:** `tests/learner/discover-tutors.spec.ts`

**Steps:**
  1. Navigate to https://preply.com/en/online/english-tutors
    - expect: Tutor listing page loads
  2. Click the 'Price per lesson' filter dropdown (showing €2 – €34+)
    - expect: A price range slider or input panel opens
  3. Set price range to €5 – €15 per lesson
    - expect: The filter is applied and the tutor list updates
    - expect: The price range shown in the filter reflects the selected values
    - expect: Only tutors within the selected price range are displayed
  4. Clear the price filter
    - expect: The tutor list reverts to showing all tutors

#### 2.3. TC-DISC-03: Filter tutors by country of birth

**File:** `tests/learner/discover-tutors.spec.ts`

**Steps:**
  1. Navigate to https://preply.com/en/online/english-tutors
    - expect: Tutor listing page loads
  2. Click the 'Country of birth' filter dropdown
    - expect: A dropdown list of countries appears
  3. Select 'United Kingdom' from the country dropdown
    - expect: Tutor list filters to show tutors born in the UK
    - expect: The filter badge shows 'United Kingdom'

#### 2.4. TC-DISC-04: Filter tutors by availability

**File:** `tests/learner/discover-tutors.spec.ts`

**Steps:**
  1. Navigate to https://preply.com/en/online/english-tutors
    - expect: Tutor listing page loads
  2. Click the 'I'm available' filter dropdown (showing 'Any time')
    - expect: A time picker or calendar panel opens to select availability
  3. Select a specific day and time (e.g., Monday at 10:00)
    - expect: The tutor list updates to show tutors available at that time
    - expect: The availability filter badge reflects the selection

#### 2.5. TC-DISC-05: Filter tutors by language (change subject)

**File:** `tests/learner/discover-tutors.spec.ts`

**Steps:**
  1. Navigate to https://preply.com/en/online/english-tutors
    - expect: Tutor listing page loads with English selected
  2. Click the 'I want to learn' dropdown and select 'Spanish'
    - expect: Page reloads or updates to show Spanish tutors
    - expect: URL changes to /en/online/spanish-tutors or equivalent
    - expect: Page heading updates to reflect Spanish tutors

#### 2.6. TC-DISC-06: Filter tutors by native speaker

**File:** `tests/learner/discover-tutors.spec.ts`

**Steps:**
  1. Navigate to https://preply.com/en/online/english-tutors
    - expect: Tutor listing page loads
  2. Click the 'Native speaker' filter button
    - expect: The filter toggles on and filters tutor list to native English speakers only
    - expect: Native speaker filter is visually highlighted/active

#### 2.7. TC-DISC-07: Sort tutors

**File:** `tests/learner/discover-tutors.spec.ts`

**Steps:**
  1. Navigate to https://preply.com/en/online/english-tutors
    - expect: Tutor listing page loads with 'Our top picks' sort selected by default
  2. Click the 'Sort tutors by Our top picks' dropdown
    - expect: Sort options appear (e.g., Our top picks, Price: Low to High, Price: High to Low, Rating, Most reviewed)
  3. Select 'Price: Low to High'
    - expect: Tutor list re-orders with lowest-priced tutors appearing first

#### 2.8. TC-DISC-08: Search tutors by name or keyword

**File:** `tests/learner/discover-tutors.spec.ts`

**Steps:**
  1. Navigate to https://preply.com/en/online/english-tutors
    - expect: Tutor listing page loads
  2. Click the 'Search by name or keyword' input field and type 'Mark'
    - expect: The tutor list filters to show tutors matching 'Mark'
    - expect: If no match, an appropriate empty state message is shown
  3. Clear the search input
    - expect: The full tutor list is restored

#### 2.9. TC-DISC-09: Use 'Find your tutor' wizard

**File:** `tests/learner/discover-tutors.spec.ts`

**Steps:**
  1. Navigate to https://preply.com/en/online/english-tutors
    - expect: The hero section shows a language selector dropdown and 'Find your tutor' button
  2. Select 'French' from the language dropdown in the hero section
    - expect: 'French' is shown in the dropdown
  3. Click 'Find your tutor →'
    - expect: A wizard or questionnaire launches asking personalized questions (goals, level, schedule)
    - expect: OR redirects to French tutors listing

### 3. Learner – Tutor Profile

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-PROF-01: View tutor profile page

**File:** `tests/learner/tutor-profile.spec.ts`

**Steps:**
  1. Login and navigate to https://preply.com/en/online/english-tutors
    - expect: Tutor listing page loads with tutor cards
  2. Click 'See [Tutor Name]'s profile' on the first tutor card
    - expect: Tutor profile page opens (e.g., /en/tutor/211422)
    - expect: Tutor intro video auto-plays (muted)
    - expect: Tutor name, country flag, and title are displayed
    - expect: Stats are shown: rating, total lessons, total hours, reviews count
    - expect: 'Book trial lesson' CTA button with price (e.g., €22 50-min lesson) is visible
    - expect: Message tutor, Save (heart), and Share buttons are visible
    - expect: 'Not a match? You still have X free tutor trials.' message is visible
  3. Scroll down the tutor profile
    - expect: 'About me' section is visible with tutor biography
    - expect: 'Lesson rating' breakdown (Explained well, Knowledgeable, Engaging, Patient) is shown
    - expect: 'What my students say' section with star reviews is displayed
    - expect: 'Schedule' section shows a weekly calendar with available time slots
    - expect: 'Resume' / certifications section is visible
    - expect: 'My specialties' accordion section is visible with expandable specialties
    - expect: 'You might also like' carousel shows similar tutor recommendations

#### 3.2. TC-PROF-02: Mute/unmute tutor intro video

**File:** `tests/learner/tutor-profile.spec.ts`

**Steps:**
  1. Navigate to a tutor profile page (e.g., /en/tutor/211422)
    - expect: Tutor intro video plays automatically in muted state
    - expect: 'Unmute' button is visible on the video
  2. Click the 'Unmute' button on the video
    - expect: Video audio plays
    - expect: Button changes to 'Mute'
  3. Click 'Mute'
    - expect: Video returns to muted state

#### 3.3. TC-PROF-03: Save a tutor to favorites

**File:** `tests/learner/tutor-profile.spec.ts`

**Steps:**
  1. Login and navigate to a tutor profile page
    - expect: The heart (save) icon is displayed in the unfilled/empty state
  2. Click the heart (♡) icon on the tutor profile
    - expect: The heart icon fills/turns pink indicating the tutor is saved
    - expect: A success notification may appear
  3. Navigate to the favorites page https://preply.com/en/favorite-tutors
    - expect: The saved tutor appears in the favorites list
  4. Return to the tutor profile and click the filled heart icon to unsave
    - expect: The tutor is removed from favorites
    - expect: The heart icon returns to the unfilled state

#### 3.4. TC-PROF-04: View tutor schedule and select a time slot

**File:** `tests/learner/tutor-profile.spec.ts`

**Steps:**
  1. Navigate to a tutor profile page and scroll to the 'Schedule' section
    - expect: A weekly calendar with available time slots is visible
    - expect: The current week date range is shown (e.g., May 29 – Jun 4, 2026)
    - expect: Navigation arrows (< >) allow moving to the next/previous week
    - expect: Timezone selector dropdown is visible (e.g., Europe/London GMT+1:00)
  2. Click a time slot (e.g., Saturday 09:00)
    - expect: The time slot is highlighted/selected
    - expect: A confirmation or 'Book trial lesson' prompt appears
  3. Click the next week arrow (>)
    - expect: Calendar advances to the next week showing the new date range and available slots

#### 3.5. TC-PROF-05: Initiate booking a trial lesson

**File:** `tests/learner/tutor-profile.spec.ts`

**Steps:**
  1. Login and navigate to a tutor profile page
    - expect: 'Book trial lesson' button is visible with price shown (e.g., €22)
  2. Click the 'Book trial lesson' button
    - expect: A booking flow opens or page scrolls to the schedule section
    - expect: User is prompted to select a time slot OR a payment/checkout screen is shown
  3. Select a time slot from the schedule
    - expect: The slot is selected and highlighted
  4. Proceed to the next step in the booking flow
    - expect: A payment or confirmation screen is shown
    - expect: Lesson details (tutor name, time, price) are summarized before payment

#### 3.6. TC-PROF-06: Message a tutor from their profile

**File:** `tests/learner/tutor-profile.spec.ts`

**Steps:**
  1. Login and navigate to a tutor profile page
    - expect: A message/chat icon button is visible on the profile action bar
  2. Click the message icon button
    - expect: User is redirected to the Messages page (/en/messages)
    - expect: A new conversation thread with the tutor is initiated or a message compose area appears

#### 3.7. TC-PROF-07: Share a tutor profile

**File:** `tests/learner/tutor-profile.spec.ts`

**Steps:**
  1. Navigate to a tutor profile page
    - expect: A share icon button is visible on the profile action bar
  2. Click the share (↑) button
    - expect: A share menu or native OS share dialog opens
    - expect: OR a 'Link copied to clipboard' notification appears

#### 3.8. TC-PROF-08: Expand tutor specialties accordion

**File:** `tests/learner/tutor-profile.spec.ts`

**Steps:**
  1. Navigate to a tutor profile page and scroll to 'My specialties' section
    - expect: Multiple specialty items are shown in a collapsed accordion (e.g., Conversational English, Business English, Kids, etc.)
  2. Click on a specialty item (e.g., 'Conversational English')
    - expect: The accordion expands to show a detailed description of that specialty
  3. Click 'Show more specialties' button if present
    - expect: Additional specialties are revealed

### 4. Learner – My Lessons

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-LESS-01: My Lessons page displays correctly with no booked lessons

**File:** `tests/learner/my-lessons.spec.ts`

**Steps:**
  1. Login and navigate to https://preply.com/en/lessons
    - expect: My Lessons page loads with title 'My lessons'
    - expect: The message 'No lessons yet' is displayed
    - expect: Sub-text reads 'As soon as you find a suitable tutor and book your first lesson, you'll see it here'
    - expect: A 'Find a private tutor' CTA button is visible
    - expect: Top navigation shows: Discover tutors | Home | Messages | ... | For business
  2. Click 'Find a private tutor' button
    - expect: User is redirected to the tutor listing page (/en/online/english-tutors)

#### 4.2. TC-LESS-02: Navigate to My Lessons via user account dropdown

**File:** `tests/learner/my-lessons.spec.ts`

**Steps:**
  1. Login and click the user avatar in the top-right header
    - expect: Dropdown menu opens with: My lessons, Saved tutors, Refer a friend, Settings, Help, Log out
  2. Click 'My lessons' in the dropdown
    - expect: User is navigated to /en/lessons
    - expect: My Lessons page loads correctly

### 5. Learner – Messages

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-MSG-01: Messages page layout with no conversations

**File:** `tests/learner/messages.spec.ts`

**Steps:**
  1. Login and navigate to https://preply.com/en/messages
    - expect: Messages page loads with 'Messages' tab highlighted in the navigation
    - expect: Left panel shows 3 tabs: All, Unread, Archived
    - expect: 'Ready to start learning? Find a tutor and book a lesson to start improving your skills.' is displayed with a 'Find your tutor' button
    - expect: Right panel shows 'Select a tutor to start a conversation'

#### 5.2. TC-MSG-02: Switch between message tabs

**File:** `tests/learner/messages.spec.ts`

**Steps:**
  1. Navigate to /en/messages
    - expect: Messages page loads with 'All' tab active
  2. Click the 'Unread' tab
    - expect: Unread tab is highlighted
    - expect: Only unread conversations are shown (or empty state if none)
  3. Click the 'Archived' tab
    - expect: Archived tab is highlighted
    - expect: Only archived conversations are shown (or empty state if none)

#### 5.3. TC-MSG-03: Access messages via the chat icon in the header

**File:** `tests/learner/messages.spec.ts`

**Steps:**
  1. Login and locate the chat icon in the header (Open chat button)
    - expect: Chat icon is visible in the header icon area
  2. Click the chat icon
    - expect: User is navigated to the Messages page /en/messages OR a chat panel slides open

### 6. Learner – Account Settings

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-SET-01: Account Settings page loads with all sections

**File:** `tests/learner/settings.spec.ts`

**Steps:**
  1. Login and navigate to https://preply.com/en/settings
    - expect: Settings page loads with title 'Account Settings'
    - expect: Left sidebar shows: Account, Password, Email, Payment methods, Payment history, Autoconfirmation, Calendar, Notifications, Delete account
    - expect: Main content shows: Profile image with 'Upload photo' button, First name field (pre-filled), Last name field

#### 6.2. TC-SET-02: Update profile information

**File:** `tests/learner/settings.spec.ts`

**Steps:**
  1. Navigate to /en/settings (Account tab)
    - expect: Account Settings page loads with current first and last name pre-filled
  2. Clear and update the First name field with a new name
    - expect: Field accepts the new input
  3. Click the Save button
    - expect: A success notification appears confirming profile update
    - expect: The page reflects the new name

#### 6.3. TC-SET-03: Upload a profile photo

**File:** `tests/learner/settings.spec.ts`

**Steps:**
  1. Navigate to /en/settings
    - expect: Current profile image is displayed with 'Upload photo' and 'Edit' buttons
  2. Click 'Upload photo' button
    - expect: File chooser dialog opens accepting JPG or PNG formats
  3. Select a valid JPG image under 2MB
    - expect: Image is uploaded and preview updates
    - expect: Success message appears

#### 6.4. TC-SET-04: Navigate to Password settings

**File:** `tests/learner/settings.spec.ts`

**Steps:**
  1. Navigate to /en/settings and click 'Password' in the left sidebar
    - expect: Password settings section loads
    - expect: Fields for Current password, New password, and Confirm new password are present
    - expect: A Save/Change password button is visible
  2. Enter incorrect current password and click Save
    - expect: An error message is shown indicating the current password is incorrect

#### 6.5. TC-SET-05: Navigate to Email settings

**File:** `tests/learner/settings.spec.ts`

**Steps:**
  1. Navigate to /en/settings and click 'Email' in the left sidebar
    - expect: Email settings section loads
    - expect: Current email address is shown
    - expect: A field to enter new email and password confirmation is present

#### 6.6. TC-SET-06: Navigate to Payment methods

**File:** `tests/learner/settings.spec.ts`

**Steps:**
  1. Navigate to /en/settings and click 'Payment methods' in the left sidebar
    - expect: Payment methods section loads
    - expect: Option to add a new payment method (credit card) is visible
    - expect: Existing payment methods, if any, are listed

#### 6.7. TC-SET-07: Navigate to Payment history

**File:** `tests/learner/settings.spec.ts`

**Steps:**
  1. Navigate to /en/settings and click 'Payment history' in the left sidebar
    - expect: Payment history section loads
    - expect: Transaction history table or empty state is shown
    - expect: Columns include date, tutor/service, amount

#### 6.8. TC-SET-08: Configure Autoconfirmation setting

**File:** `tests/learner/settings.spec.ts`

**Steps:**
  1. Navigate to /en/settings and click 'Autoconfirmation' in the sidebar
    - expect: Autoconfirmation settings section loads
    - expect: A toggle or option to enable/disable automatic lesson confirmation is visible
  2. Toggle the autoconfirmation setting
    - expect: Setting changes state and is saved
    - expect: A success notification appears

#### 6.9. TC-SET-09: Configure Calendar integration

**File:** `tests/learner/settings.spec.ts`

**Steps:**
  1. Navigate to /en/settings and click 'Calendar' in the sidebar
    - expect: Calendar settings section loads
    - expect: Options to sync with Google Calendar or other calendar providers are visible

#### 6.10. TC-SET-10: Configure Notifications settings

**File:** `tests/learner/settings.spec.ts`

**Steps:**
  1. Navigate to /en/settings and click 'Notifications' in the sidebar
    - expect: Notifications settings section loads
    - expect: Toggles for email notifications, push notifications, and lesson reminders are visible
  2. Toggle any notification setting off
    - expect: Setting is saved
    - expect: Success feedback is shown

#### 6.11. TC-SET-11: Delete account – initiation and warning

**File:** `tests/learner/settings.spec.ts`

**Steps:**
  1. Navigate to /en/settings and click 'Delete account' in the sidebar
    - expect: Delete account section loads with a warning about the irreversibility
    - expect: A confirmation step or button is presented
  2. Do NOT confirm deletion – navigate away or cancel
    - expect: Account is not deleted
    - expect: User remains logged in with their account intact

### 7. Learner – Subscription & Pricing

**Seed:** `tests/seed.spec.ts`

#### 7.1. TC-SUB-01: View subscription page

**File:** `tests/learner/subscription.spec.ts`

**Steps:**
  1. Login and navigate to https://preply.com/en/subscription
    - expect: Subscription page loads with headline 'Preply subscription for steady, lasting progress.'
    - expect: Sub-heading explains subscription benefits
    - expect: 'Find your tutor' CTA button is visible
    - expect: A stat such as '1 in 3 students who took more than 24 lessons on Preply jumped a full CEFR level' is shown
  2. Scroll down the subscription page
    - expect: Subscription plan options are shown (e.g., 1 lesson/week, 2 lessons/week, 3 lessons/week)
    - expect: Pricing for each plan is displayed
    - expect: 'Flexible Plan' badge is visible
    - expect: FAQs about subscription are accessible

#### 7.2. TC-SUB-02: Select a subscription plan

**File:** `tests/learner/subscription.spec.ts`

**Steps:**
  1. Navigate to /en/subscription and scroll to the plan selection
    - expect: Plan options are displayed
  2. Click on the '3 lessons per week' plan option
    - expect: Plan is highlighted as selected
    - expect: Pricing for 3 lessons/week (12 lessons per 4 weeks) is shown
  3. Click the 'Find your tutor' or 'Get started' button
    - expect: User is guided to find a tutor or proceed to checkout for the subscription

### 8. Learner – Saved/Favorite Tutors

**Seed:** `tests/seed.spec.ts`

#### 8.1. TC-FAV-01: View empty favorites page

**File:** `tests/learner/favorites.spec.ts`

**Steps:**
  1. Login and navigate to https://preply.com/en/favorite-tutors
    - expect: Redirected to /en/online/english-tutors?favTutors=true
    - expect: 'Save tutors using the ♡ icon' message is shown
    - expect: Sub-text: 'Browse and save tutors on the Find tutors page. View your saved tutors here anytime.'
    - expect: 'Browse tutors' button is visible
  2. Click 'Browse tutors' button
    - expect: User is redirected to the main tutor listing page

#### 8.2. TC-FAV-02: Save and unsave a tutor from the listing page

**File:** `tests/learner/favorites.spec.ts`

**Steps:**
  1. Login and navigate to https://preply.com/en/online/english-tutors
    - expect: Tutor cards are visible each with a heart icon
  2. Click the heart (♡) icon on any tutor card
    - expect: Heart icon fills (♥) to indicate saved status
    - expect: A success or confirmation toast may appear
  3. Navigate to https://preply.com/en/favorite-tutors
    - expect: The saved tutor appears in the favorites view
  4. Click the filled heart (♥) icon on the saved tutor card to unsave
    - expect: Tutor is removed from the favorites list
    - expect: Empty state message returns if no more saved tutors

### 9. Learner – Language Level Test

**Seed:** `tests/seed.spec.ts`

#### 9.1. TC-TEST-01: Start the English level test

**File:** `tests/learner/language-test.spec.ts`

**Steps:**
  1. Navigate to https://preply.com/en/language-tests/english
    - expect: Page loads with heading 'English level test: Test your English online'
    - expect: Description: 'Find out your level of grammar with this easy 20-minute English placement test'
    - expect: 'Start the test' pink CTA button is visible
    - expect: Navigation bar shows: Learn English online, Skills, Online English courses, Business English course, Practice English, Language Tests, About Preply
  2. Click 'Start the test' button
    - expect: The test begins with the first question displayed
    - expect: A progress indicator shows the question number out of total
    - expect: Multiple choice answers are presented
  3. Answer the first 2-3 questions
    - expect: Each answer can be selected and confirmed
    - expect: Navigation to the next question is possible

### 10. Learner – Online Classes

**Seed:** `tests/seed.spec.ts`

#### 10.1. TC-CLASS-01: Browse online English classes page

**File:** `tests/learner/online-classes.spec.ts`

**Steps:**
  1. Navigate to https://preply.com/en/classes/english
    - expect: Page loads with heading 'Customized online English courses'
    - expect: Description: 'Flexible, 1:1 English courses designed to help you speak English fluently with confidence'
    - expect: Available course categories or topics are displayed
    - expect: A CTA to start or explore a course is visible
  2. Scroll down the page
    - expect: Course descriptions, included topics, and learning outcomes are visible
    - expect: A 'Find a tutor' or 'Get started' button links to tutor search

### 11. Learner – Referral Program

**Seed:** `tests/seed.spec.ts`

#### 11.1. TC-REF-01: View the Refer a Friend page

**File:** `tests/learner/referral.spec.ts`

**Steps:**
  1. Login and navigate to https://preply.com/en/referral
    - expect: Referral page loads with heading 'Refer a friend, get a discount'
    - expect: Description: 'To give a friend 70% off their trial lesson...'
    - expect: 'Book my first lesson' button is visible (for users who haven't booked yet)
    - expect: Navigation shows: Home | Messages | My lessons | ... | For business
  2. Click 'Refer a friend' button in the header or account dropdown
    - expect: Same referral page opens at /en/referral

#### 11.2. TC-REF-02: Refer a friend – prerequisite: first lesson must be booked

**File:** `tests/learner/referral.spec.ts`

**Steps:**
  1. Login with an account that has not booked any lessons and navigate to /en/referral
    - expect: Page shows 'Book my first lesson' instead of the referral link/code
    - expect: Explanation states you must book a lesson first to generate a referral link

### 12. Tutor – Become a Tutor Flow

**Seed:** `tests/seed.spec.ts`

#### 12.1. TC-TUTOR-01: View Become a Tutor landing page

**File:** `tests/tutor/become-tutor.spec.ts`

**Steps:**
  1. Navigate to https://preply.com/en/teach
    - expect: Page loads with headline 'Make a living by teaching the largest community of learners worldwide'
    - expect: 3-step process is shown: 1. Sign up to create your tutor profile, 2. Get approved by our team in 5 business days, 3. Start earning by teaching students all over the world!
    - expect: 'Create a tutor profile now' teal CTA button is visible
    - expect: A 'Try out GPT – Preply Success Advisor' banner is visible at the bottom
  2. Scroll down the page
    - expect: Stats about tutor earnings and student base are shown
    - expect: Testimonials from existing tutors are visible
    - expect: Tutor FAQ section is present
    - expect: Become a tutor CTA button appears again

#### 12.2. TC-TUTOR-02: Initiate tutor profile creation

**File:** `tests/tutor/become-tutor.spec.ts`

**Steps:**
  1. Navigate to /en/teach and click 'Create a tutor profile now'
    - expect: User is redirected to the tutor signup/registration form
    - expect: Form fields for teaching subject, experience, qualifications, and bio are presented
    - expect: Or if already logged in, a form to convert/create a tutor profile is shown

#### 12.3. TC-TUTOR-03: Try out GPT Preply Success Advisor banner

**File:** `tests/tutor/become-tutor.spec.ts`

**Steps:**
  1. Navigate to /en/teach
    - expect: 'Create a profile that attracts learners' banner is visible at the bottom with 'Try out GPT' button
  2. Click 'Try out GPT'
    - expect: A GPT-powered advisor chat or redirect is initiated
  3. Click the X button to dismiss the banner
    - expect: Banner is dismissed and no longer visible

#### 12.4. TC-TUTOR-04: Browse online tutoring jobs page

**File:** `tests/tutor/become-tutor.spec.ts`

**Steps:**
  1. Navigate to https://preply.com/en/online/tutoring-jobs
    - expect: Tutoring jobs listing page loads
    - expect: Available tutoring job listings or 'Become a tutor' funnel is shown
    - expect: Subject filter options are available

### 13. Tutor – Profile Management (Post Registration)

**Seed:** `tests/seed.spec.ts`

#### 13.1. TC-TUTOR-05: Tutor profile – view public profile

**File:** `tests/tutor/tutor-profile-management.spec.ts`

**Steps:**
  1. Navigate to a tutor profile URL e.g., https://preply.com/en/tutor/211422
    - expect: Tutor's public profile loads
    - expect: Tutor video, name, country, title, pricing, and 'Book trial lesson' button are all visible
    - expect: About me, Lesson rating, Student reviews, Schedule, Resume, Specialties sections are all present

#### 13.2. TC-TUTOR-06: Tutor schedule navigation

**File:** `tests/tutor/tutor-profile-management.spec.ts`

**Steps:**
  1. Navigate to a tutor profile and scroll to the Schedule section
    - expect: Schedule section shows current week's available slots (date range displayed)
    - expect: Timezone dropdown defaults to the user's/tutor's timezone
  2. Click the '>' (next week) arrow
    - expect: Calendar advances to the next week
    - expect: New set of available time slots are shown
  3. Click the '<' (previous week) arrow
    - expect: Calendar returns to the current week
  4. Change the timezone in the dropdown
    - expect: Time slots update to reflect the selected timezone

#### 13.3. TC-TUTOR-07: View recommended tutors ('You might also like' section)

**File:** `tests/tutor/tutor-profile-management.spec.ts`

**Steps:**
  1. Navigate to a tutor profile and scroll to 'You might also like' section
    - expect: A carousel of recommended tutor cards is visible
    - expect: Each card shows the tutor's photo, name, rating, lesson count, and price
  2. Click on a recommended tutor card
    - expect: User is navigated to that tutor's profile page

### 14. Navigation & Header

**Seed:** `tests/seed.spec.ts`

#### 14.1. TC-NAV-01: Header navigation links (logged in state)

**File:** `tests/navigation/header.spec.ts`

**Steps:**
  1. Login and verify the header navigation
    - expect: Preply logo links to the home page
    - expect: 'Find tutors' link is visible and navigates to /en/online/english-tutors
    - expect: 'Corporate training' link is visible
    - expect: 'Refer a friend' button is in the header
    - expect: Language & currency selector shows current settings (e.g., English, EUR)
    - expect: Chat icon (Open chat) navigates to /en/messages
    - expect: Help icon links to https://help.preply.com/en/
    - expect: Heart (favorites) icon navigates to /en/favorite-tutors
    - expect: Notification bell icon opens notifications panel
    - expect: User avatar opens the account dropdown menu

#### 14.2. TC-NAV-02: Sub-navigation (logged in – student context)

**File:** `tests/navigation/header.spec.ts`

**Steps:**
  1. Login and observe the secondary navigation bar
    - expect: 'Discover tutors' tab is visible and active on tutor pages
    - expect: 'Home' tab navigates to /en/home
    - expect: 'Messages' tab navigates to /en/messages
    - expect: '...' (More) expands to show additional items (e.g., My lessons)
    - expect: 'For business' link navigates to the corporate training page

#### 14.3. TC-NAV-03: Language and currency selector

**File:** `tests/navigation/header.spec.ts`

**Steps:**
  1. Login and click the language/currency selector button (showing 'English, EUR')
    - expect: A dropdown panel opens with language and currency options
  2. Select a different language (e.g., 'Spanish')
    - expect: Page language/interface updates to the selected language
    - expect: The selector button updates to reflect the new language/currency

#### 14.4. TC-NAV-04: Footer navigation links

**File:** `tests/navigation/footer.spec.ts`

**Steps:**
  1. Scroll to the bottom of the tutor listing page
    - expect: Footer is visible with 4 sections: ABOUT US, FOR STUDENTS, FOR TUTORS, FOR COMPANIES
    - expect: About Us links: Who we are, How it works, Preply reviews, Preply app, Proven progress platform, Careers, etc.
    - expect: For Students links: Preply Blog, Questions and Answers, Student discount, Refer a friend, Test your English, Preply Subscription, etc.
    - expect: For Tutors links: Become an online tutor, Teach English online, Teach French online, etc.
    - expect: For Companies links: Corporate language training, Corporate English training, etc.
    - expect: Social media icons (Facebook, Instagram, YouTube, LinkedIn, TikTok) are visible
    - expect: 'Scroll to the top' button is visible and functional
  2. Click 'Become an online tutor' in the footer
    - expect: User is navigated to /en/teach

#### 14.5. TC-NAV-05: 404 page for non-existent routes

**File:** `tests/navigation/error-pages.spec.ts`

**Steps:**
  1. Navigate to a non-existent URL e.g., https://preply.com/en/nonexistent-page-xyz
    - expect: A 404 error page loads with text '404 - page not found'
    - expect: Heading: 'We can't find this page.'
    - expect: 'Explore tutors' and 'Preply home' buttons are visible
  2. Click 'Explore tutors' button
    - expect: User is redirected to the tutor listing page
  3. Click 'Preply home' button
    - expect: User is redirected to the Preply home page

### 15. Accessibility & UX

**Seed:** `tests/seed.spec.ts`

#### 15.1. TC-A11Y-01: Keyboard navigation on login page

**File:** `tests/accessibility/keyboard-nav.spec.ts`

**Steps:**
  1. Navigate to /en/login and press Tab
    - expect: Focus moves to the first interactive element on the page in a logical order
  2. Tab through Email, Password, Reveal password button, and Log in button
    - expect: All interactive elements receive visible focus indicators
    - expect: Enter key on 'Log in' submits the form

#### 15.2. TC-A11Y-02: Notifications bell panel

**File:** `tests/accessibility/notifications.spec.ts`

**Steps:**
  1. Login and click the notification bell icon in the header
    - expect: A notifications panel opens
    - expect: Unread notifications are listed (or an empty state shown)
    - expect: Panel can be dismissed by clicking outside or pressing Escape

#### 15.3. TC-A11Y-03: Help Center access

**File:** `tests/accessibility/help-center.spec.ts`

**Steps:**
  1. Login and click the Help (?) icon in the header
    - expect: User is navigated to or a new tab opens at https://help.preply.com/en/
  2. Click the floating '?' help button in the bottom-right corner of a page
    - expect: A help chat widget or help center overlay opens

#### 15.4. TC-A11Y-04: Scroll to top button on long pages

**File:** `tests/accessibility/scroll-to-top.spec.ts`

**Steps:**
  1. Navigate to a long page (e.g., /en/online/english-tutors) and scroll to the bottom
    - expect: 'Scroll to the top' button appears in the footer area
  2. Click the 'Scroll to the top' button
    - expect: Page scrolls back to the top smoothly
