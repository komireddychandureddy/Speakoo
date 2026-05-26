# EnglishYaari – Test Scenarios

## 1. Authentication

### 1.1 Login (https://user.englishyaari.com/)
- **TC-AUTH-01**: Successful login with valid country code (+91), mobile number, and password → redirected to Dashboard
- **TC-AUTH-02**: Login with invalid mobile number → error message displayed
- **TC-AUTH-03**: Login with incorrect password → error message displayed
- **TC-AUTH-04**: Login with empty fields → validation errors shown for all required fields
- **TC-AUTH-05**: Login with invalid country code → error or no matching country shown
- **TC-AUTH-06**: "Forgot Password" link is visible and navigates to password reset flow
- **TC-AUTH-07**: "Sign Up" link navigates to the registration page
- **TC-AUTH-08**: Session persists on page refresh after login (token stored correctly)
- **TC-AUTH-09**: Logout clears session and redirects to login page

---

## 2. Dashboard (https://user.englishyaari.com/dashboard)

- **TC-DASH-01**: Dashboard loads with personalised welcome message ("Hey [Name], welcome to EnglishYaari 🖐🏻")
- **TC-DASH-02**: Upcoming session count / next session details are displayed correctly
- **TC-DASH-03**: Quick action tiles (Book Session, My Sessions, All Tutors, etc.) are visible and clickable
- **TC-DASH-04**: Sidebar navigation is visible with all menu items
- **TC-DASH-05**: Notifications bell icon shows unread badge count
- **TC-DASH-06**: Wallet shows current balance (₹)
- **TC-DASH-07**: Hamburger menu (☰) collapses and expands sidebar on click

---

## 3. My Sessions (https://user.englishyaari.com/mySession)

- **TC-SES-01**: Page loads with tab bar: Upcoming | Completed | Cancelled | Missed | Pending
- **TC-SES-02**: "Upcoming" tab is active by default and shows upcoming session cards
- **TC-SES-03**: Session card displays: session number, tutor name, date, time, duration, "Join session" button
- **TC-SES-04**: "Join session" button is enabled only within the session window (e.g., 5 mins before start)
- **TC-SES-05**: "Completed" tab shows past sessions with notes/recap link
- **TC-SES-06**: "Cancelled" tab shows cancelled session history
- **TC-SES-07**: "Missed" tab shows missed sessions
- **TC-SES-08**: "Pending" tab shows sessions pending confirmation
- **TC-SES-09**: Clicking tutor name or session link navigates to tutor profile or session detail
- **TC-SES-10**: "Mind's Symphony" (session theme/topic) link is visible and navigates to session topic detail
- **TC-SES-11**: Empty state message is displayed when no sessions exist in a tab
- **TC-SES-12**: "Completed" tab shows session cards with tutor photo, tutor name, session number (e.g., "Session No : 135"), time slot, date, and "View Recording" ▶ link
- **TC-SES-13**: Completed session card with pending feedback shows "Submit your feedback →" button (purple/violet)
- **TC-SES-14**: Completed session card with already-submitted feedback shows "Feedback Submitted ✓" badge (light green)
- **TC-SES-15**: Clicking "View Recording" on a completed session card opens the session recording
- **TC-SES-16**: Clicking the "Session Report" circular icon on a completed session opens a modal titled "Regular session feedback"
- **TC-SES-17**: Session Report modal displays a score banner: "Your score in this class: X points (Max. 24 points)" (e.g., 19/24)
- **TC-SES-18**: Session Report modal "Details Analysis of your performance" section lists all 8 performance categories — 1 Pace Of Speech, 2 Length Of Answers, 3 Vocabulary Spectrum, 4 Communicative Grammar, 5 Presentation Skills, 6 Non Verbal Skills, 7 Enthusiasm Level, 8 Pronunciation — each with a green checkbox and descriptive feedback text
- **TC-SES-19**: User closes Session Report modal via the ✕ button — modal dismisses and returns to Completed sessions view
- **TC-SES-20**: Clicking the "Session Notes" circular icon on a completed session navigates to /ClassPdfView, which displays the session notes as an embedded PDF
- **TC-SES-21**: Clicking the "Session Chat" circular icon on a completed session opens a modal titled "Session Chat" showing the in-session chat transcript with the tutor
- **TC-SES-22**: Session Chat modal shows session date/time header and displays "No chat messages available" when no messages were exchanged
- **TC-SES-23**: Session Chat modal has a ✕ close button that dismisses the modal
- **TC-SES-24**: My Sessions tab bar includes five tabs: Upcoming, Completed, Cancelled, Missed, Pending
- **TC-SES-25**: Completed sessions page displays "Rules and Regulations for Session Refund" section with 3 policies: (1) Cancelling 2+ hours before session start → session refunded to subscription; (2) Cancelling within 2 hours of session → session NOT refunded; (3) Cancelling more than 5 sessions in a month → session NOT refunded

---

## 4. Book a Session (https://user.englishyaari.com/myClass)

- **TC-BOOK-01**: Page loads with a date picker row showing dates from current week (Mon–Sun)
- **TC-BOOK-02**: Selecting a date updates the time slot grid for that day
- **TC-BOOK-03**: Time dropdown allows selecting a preferred time range (e.g., 7:00 AM – 8:00 AM)
- **TC-BOOK-04**: Filter chips (All Tutors, Grammar, Vocabulary, IELTS Speaking, Interview Skills, Public Speaking, Business English…) filter the tutor list
- **TC-BOOK-05**: Tutor cards show: name, rating, session count, specialty tags, available time slots, "View Schedule" link
- **TC-BOOK-06**: "View Schedule" opens tutor's availability calendar/modal
- **TC-BOOK-07**: "Reserved" slot is shown as disabled/unclickable
- **TC-BOOK-08**: Booking a slot deducts from available session count
- **TC-BOOK-09**: Confirmation message/modal appears after booking
- **TC-BOOK-10**: Cannot book a slot when 0 sessions remain in the plan
- **TC-BOOK-11**: Selecting a past date is not allowed
- **TC-BOOK-12**: "View Schedule" button on a tutor card opens a modal displaying the tutor's name, YouTube ▶ intro video icon, star rating, session count, and a 7-day date row (Mon–Sun)
- **TC-BOOK-13**: Selecting a different date in the "View Schedule" modal updates the displayed time slots; the selected date is highlighted in purple
- **TC-BOOK-14**: Available time slots in the "View Schedule" modal are selectable (purple buttons); "Reserved" slots appear greyed-out and unclickable
- **TC-BOOK-15**: "View Schedule" modal closes via the ✕ button, returning the user to the Book a Session page

---

## 5. All Tutors (https://user.englishyaari.com/allTutors)

- **TC-TUT-01**: Page loads with search bar ("Search across 100+ tutors…") and filter chips
- **TC-TUT-02**: Searching by tutor name returns matching results
- **TC-TUT-03**: Searching with no match shows empty state
- **TC-TUT-04**: Filter chips (Grammar, Vocabulary, IELTS Speaking, Interview Skills, Public Speaking, Business English…) filter tutor list
- **TC-TUT-05**: "Favourites" toggle filters to only favourite tutors
- **TC-TUT-06**: Heart/favourite icon on tutor card toggles favourite status
- **TC-TUT-07**: Tutor card shows: avatar, name, rating star, session count, expertise tags, "View profile" button
- **TC-TUT-08**: "View profile" navigates to the tutor's detail page
- **TC-TUT-09**: Tutor detail page shows: bio, specialties, schedule/availability, rating, reviews
- **TC-TUT-10**: Pagination (1–10 pages) works correctly; navigating pages loads new tutors
- **TC-TUT-11**: "Previous" and "Next" pagination buttons are disabled on the first/last pages respectively
- **TC-TUT-12**: Clicking "View profile" on a tutor card on /allTutors navigates to the tutor's detail page (/TutorDetailsView)
- **TC-TUT-13**: Tutor detail page "About" tab shows biography text, specialty chip tags (e.g., Public Speaking, Business English, Interview skills, Grammar, Vocabulary), and an embedded YouTube intro video
- **TC-TUT-14**: Tutor detail page light green gradient banner shows stat boxes: "Tutor since [year]" and "Session taken [count]"
- **TC-TUT-15**: Clicking the "Book a Session" tab on the tutor detail page reveals a date picker (Mon–Sun) and a "Choose your timing" label for direct session booking with that tutor
- **TC-TUT-16**: Tutor detail page shows a heart/favourite icon that toggles the tutor's favourite status

---

## 6. EY Resource (https://user.englishyaari.com/ey-resource)

- **TC-RES-01**: Page loads with tab bar: Business English | Communicative Grammar | IELTS Speaking Module | Interview Prep Modules
- **TC-RES-02**: Correct resource cards are displayed for each active tab
- **TC-RES-03**: Resource card shows: thumbnail image, title, "Read →" button
- **TC-RES-04**: "Read →" button opens the resource content (article/document)
- **TC-RES-05**: Switching tabs loads the relevant resources without page reload
- **TC-RES-06**: Empty state is shown if a category has no resources

---

## 7. Curriculum (https://user.englishyaari.com/Curriculum)

- **TC-CUR-01**: Page loads with three feature highlight cards: "New Topic, Every Day" | "Learn by Living it" | "Customised Learning"
- **TC-CUR-02**: Feature cards display correct icons, titles, and description text
- **TC-CUR-03**: "Your Notes" section displays session notes (Session Note 136, 137, 138…)
- **TC-CUR-04**: Session notes are paginated (16 total pages visible)
- **TC-CUR-05**: Pagination arrows ( < > ) navigate to previous/next notes
- **TC-CUR-06**: Clicking a session note opens the note detail/content

---

## 8. Choose a Subscription (https://user.englishyaari.com/chooseSubscription)

- **TC-SUB-01**: Page loads with header "Choose a plan that suits your budget & schedule"
- **TC-SUB-02**: Feature highlights shown: "25 Minutes Live 1-on-1 sessions", "Access to 100+ expert tutors", "Flexible Session Timings"
- **TC-SUB-03**: Month selector shows: 1 Month | 2 Month | 3 Month | 6 Month | 12 Month options
- **TC-SUB-04**: "Save 30%" badge is visible on the 6 Month option
- **TC-SUB-05**: Selecting a month duration updates session count and pricing
- **TC-SUB-06**: Session count options shown: 72, 96, 120 sessions (with "Recommended" badge on 120)
- **TC-SUB-07**: Selecting a session count highlights the radio button for that option
- **TC-SUB-08**: Plan features listed: 1-on-1 sessions, flexibility to choose tutor, 6AM–12AM scheduling
- **TC-SUB-09**: Proceeding to payment initiates checkout flow
- **TC-SUB-10**: Price is updated correctly based on month + session count combination

---

## 9. My Profile (https://user.englishyaari.com/myProfile)

- **TC-PROF-01**: Profile banner shows: avatar, "Sessions taken" count (118)
- **TC-PROF-02**: "Profile Information" section shows: Full Name, Phone Number, Email, Profession, My Goal fields
- **TC-PROF-03**: Pencil/edit icon allows inline editing of profile fields
- **TC-PROF-04**: Saving edited profile name persists the change
- **TC-PROF-05**: "Active Subscription" card shows: plan name (12 Month | 240 Sessions), expiry date, available sessions count, remaining days, progress bar
- **TC-PROF-06**: "Pause Plan" button is visible and triggers pause confirmation
- **TC-PROF-07**: "Living abroad" tag is visible and reflects user preference
- **TC-PROF-08**: Avatar upload/change functionality (if available)

---

## 10. Refer & Earn (https://user.englishyaari.com/reffer_earn)

- **TC-REF-01**: Page loads with hero banner: "Earn ₹500 for each Referral"
- **TC-REF-02**: Banner shows terms: referrer earns ₹500, friend gets ₹300 credit upon subscription
- **TC-REF-03**: Referral code input field is visible (empty or pre-filled with user's code)
- **TC-REF-04**: "Copy" button (gold/amber) copies the referral code to clipboard
- **TC-REF-05**: Full referral link is displayed: `https://englishyaari.page.link/H3Ed?referralCode=...`
- **TC-REF-06**: "Copy" button next to the link copies the full URL
- **TC-REF-07**: Social share buttons present: Facebook, LinkedIn, WhatsApp, YouTube, X (Twitter)
- **TC-REF-08**: Each social share button opens the correct share dialog/app
- **TC-REF-09**: "How it works?" section shows 3-step flow (Step 1: Share, Step 2: Friend registers, Step 3: Friend subscribes)
- **TC-REF-10**: Referred friends list / history (if available on scroll)

---

## 11. My Level / Leaderboard (https://user.englishyaari.com/Leaderboard)

- **TC-LVL-01**: Page loads showing current league (Bronze League)
- **TC-LVL-02**: Level progression is shown: Level 1: Rookie (40/40 pts), Level 2: Seekers (100/100 pts), etc.
- **TC-LVL-03**: Progress bar for each level shows correct filled percentage (yellow bar with lightning bolt ⚡)
- **TC-LVL-04**: Completed levels show full progress bar; current level shows partial
- **TC-LVL-05**: "Continue practicing" CTA banner is visible with tutor avatar
- **TC-LVL-06**: "What are points?" info card is visible with ⚡ icon
- **TC-LVL-07**: "Recent earned points" section shows point bubbles (e.g., 19, 17, 16, 15, 19)
- **TC-LVL-08**: "How to earn more points?" button is visible and navigates to explanation page
- **TC-LVL-09**: League progression (Bronze → Silver → Gold) is shown or described

---

## 12. FAQs (https://user.englishyaari.com/faq)

- **TC-FAQ-01**: Page loads with title "FAQs" and subtitle "Clear your doubts"
- **TC-FAQ-02**: "Helpfull Video" (sic) section shows video carousel with YouTube thumbnails
- **TC-FAQ-03**: Video titles shown: "How to use EnglishYaari App?", "How to Book a Trial Session?", "How to Subscribe?"
- **TC-FAQ-04**: Carousel pagination dots and < > arrows navigate between video groups
- **TC-FAQ-05**: Clicking a video thumbnail opens/embeds the YouTube video
- **TC-FAQ-06**: FAQ accordion items are listed below the video section
- **TC-FAQ-07**: Clicking an FAQ question expands/collapses the answer
- **TC-FAQ-08**: Only one FAQ item is expanded at a time (accordion behaviour)

---

## 13. Notifications Panel

- **TC-NOTIF-01**: Clicking the "Notifications" bell button opens the notification panel
- **TC-NOTIF-02**: Unread count badge (29) is visible on the bell icon
- **TC-NOTIF-03**: Notification list shows session reminders, booking confirmations, etc.
- **TC-NOTIF-04**: Marking a notification as read decrements the badge count
- **TC-NOTIF-05**: "Mark all as read" option clears the badge count
- **TC-NOTIF-06**: Panel closes on clicking outside or pressing Escape
- **TC-NOTIF-07**: Notifications panel header shows "Notifications" title, unread count badge (e.g., 29), and a "Mark All as Read" button
- **TC-NOTIF-08**: "Your Session Recap is Here! 🎬" notification shows tutor name, body text about the session recording and progress report, timestamp, and a "Mark as read" button
- **TC-NOTIF-09**: "You're All Set! 🎉" booking confirmation notification is visible in the panel with its timestamp and "Mark as read" button
- **TC-NOTIF-10**: "Heads Up! Session in 10 mins 🚀" pre-session 10-minute reminder notification is visible with a "Mark as read" button
- **TC-NOTIF-11**: "Session in 1 hour" 60-minute pre-session reminder notification is visible in the panel
- **TC-NOTIF-12**: Clicking "Mark as read" on an individual notification marks it as read and decrements the unread badge count
- **TC-NOTIF-13**: Clicking "Mark All as Read" marks all notifications as read and clears the unread badge

---

## 14. Wallet (https://user.englishyaari.com/ — Wallet button ₹0)

- **TC-WAL-01**: Clicking the Wallet (₹0) button opens wallet/credits page
- **TC-WAL-02**: Current wallet balance is displayed (₹0 for new/no-credits users)
- **TC-WAL-03**: Transaction history lists credit additions (referral rewards, etc.)
- **TC-WAL-04**: Wallet credits are applied during checkout
- **TC-WAL-05**: Clicking the ₹0 wallet button in the top header navigates the user to /reffer_earn (Refer & Earn page)
- **TC-WAL-06**: Refer & Earn page displays the current wallet credit balance (₹0 when no referral credits have been earned)

---

## 15. Public Site – englishyaari.com

- **TC-PUB-01**: Home page loads with top banner and hero section
- **TC-PUB-02**: Navigation links (Our Tutors, About Us, Become a Tutor, Organizations) are visible
- **TC-PUB-03**: "Login" and "Sign Up" CTAs navigate to the correct auth pages
- **TC-PUB-04**: "Our Tutors" page lists tutors with filtering
- **TC-PUB-05**: "About Us" page loads with company description
- **TC-PUB-06**: "Become a Tutor" link navigates to tutor.englishyaari.com or a tutor application form
- **TC-PUB-07**: "Organizations" link navigates to organizations.englishyaari.com
- **TC-PUB-08**: Page is responsive on mobile and tablet viewports
- **TC-PUB-09**: Social media links in footer are functional
