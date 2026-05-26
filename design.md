# EnglishYaari – Design System & UI Documentation

## Technology Stack
- **Frontend**: React (Create React App / SPA)
- **CSS Framework**: Tailwind CSS
- **Typography**: Urbanist, sans-serif (Google Fonts)
- **Icon Set**: Emoji icons in sidebar; custom SVG/PNG icons for gamification

---

## Color Palette

| Role | Color Name | RGB | Hex |
|---|---|---|---|
| Primary / CTA | Purple (Violet-700) | `rgb(109, 40, 217)` | `#6D28D9` |
| Sidebar Background | Dark Navy | `rgb(40, 37, 60)` | `#28253C` |
| Sidebar Active/Hover | Deep Navy | `rgb(28, 25, 40)` | `#1C1928` |
| Page Background | Off-white | `rgb(250, 250, 250)` | `#FAFAFA` |
| Card / Panel Background | White | `rgb(255, 255, 255)` | `#FFFFFF` |
| Light Purple / Lavender | Lavender | `rgb(245, 237, 255)` | `#F5EDFF` |
| Notification Badge BG | Soft Yellow | `rgb(255, 251, 228)` | `#FFFBE4` |
| Points / Progress Yellow | Bright Yellow | `rgb(255, 241, 118)` | `#FFF176` |
| Gold / Amber | Gold | `rgb(250, 200, 71)` | `#FAC847` |
| Light Orange Tint | Warm Orange | `rgb(255, 248, 236)` | `#FFF8EC` |
| Success / Active Green | Green | `rgb(20, 120, 61)` | `#14783D` |
| Feedback Badge / Light Mint | Light Green | `rgb(187, 247, 208)` | `#BBF7D0` |
| Banner Accent / Medium Green | Green-500 | `rgb(34, 197, 94)` | `#22C55E` |
| Border Light Gray | Light Gray | `rgb(238, 238, 238)` | `#EEEEEE` |
| Divider Gray | Divider | `rgb(229, 229, 229)` | `#E5E5E5` |
| Overlay / Modal Backdrop | Semi-transparent Black | `rgba(0, 0, 0, 0.5)` | — |
| Curriculum Card: Lavender | Soft Purple | `rgb(230, 215, 255)` | `#E6D7FF` |
| Curriculum Card: Green | Soft Light Green | `rgb(187, 247, 208)` | `#BBF7D0` |
| Curriculum Card: Yellow | Soft Yellow | `rgb(255, 248, 200)` | `#FFF8C8` |

---

## Typography

| Element | Font | Size | Weight | Color |
|---|---|---|---|---|
| Body / Default | Urbanist, sans-serif | 14–16px | 400 | Dark gray |
| Page Title (h1) | Urbanist | 24–28px | 700 | `#111827` |
| Section Heading (h2) | Urbanist | 18–20px | 600 | `#111827` |
| Card Title | Urbanist | 16px | 600 | Dark |
| Tutor Name | Urbanist | 16px | 600 | Dark |
| Primary Button | Urbanist | 14–16px | 600 | White |
| Badge / Tag | Urbanist | 12px | 500 | Purple or dark |
| Sub-label / Caption | Urbanist | 12px | 400 | Gray |

---

## Layout

### Header / Navigation Bar
- **Background**: White `#FFFFFF`
- **Height**: 64px
- **Position**: Sticky top
- **Logo**: "englishyaari" wordmark with circular "e" icon, left-aligned
- **Hamburger (☰)**: Toggle sidebar collapse/expand, top-left
- **Right actions**: "Notifications" bell button + unread count badge | Wallet (₹) button with balance

### Sidebar
- **Background**: Dark navy `rgb(40, 37, 60)` / `#28253C`
- **Text / Icons**: White
- **Active item**: Deep navy `rgb(28, 25, 40)` background highlight
- **Nav items** (with emoji icons):
  - 🏠 Dashboard
  - 📅 My Sessions
  - 📖 Book Session
  - 👩‍🏫 All Tutors
  - 📚 EY Resource
  - 📋 Curriculum
  - 💳 Choose a Subscription
  - 👤 My Profile
  - 🎁 Refer & Earn
  - 🏆 My Level
  - ❓ FAQs
- **Width**: ~220–260px (collapsible)

### Page Content Area
- **Background**: Off-white `#FAFAFA`
- **Padding**: 24–32px
- **Max width**: Full minus sidebar

---

## Component Styles

### Buttons

| Type | Background | Text Color | Border | Border Radius | Notes |
|---|---|---|---|---|---|
| Primary CTA | `#6D28D9` (purple) | White | None | `9999px` (pill) | "Book", "Join session", "Copy" |
| Secondary / Outline | White | `#6D28D9` | 1px purple | `9999px` (pill) | "View profile", "Read →" |
| Lavender Action | `#F5EDFF` (lavender) | `#6D28D9` | None | `9999px` (pill) | "View profile", resource "Read →" |
| Gold / Amber CTA | `#FAC847` (gold) | Dark brown/black | None | `8px` | Referral "Copy" button |
| Yellow Info | `#FFF176` (bright yellow) | Dark | None | `8px` | "How to earn more points?" |
| Danger / Pause | `#6D28D9` (purple) | White | None | `6px` | "Pause Plan" |
| Disabled | Light gray | Gray | None | `9999px` | Reserved slot, inactive dates |

### Cards

- **Background**: White `#FFFFFF`
- **Border**: `1px solid #EEEEEE`
- **Border Radius**: `12px` (standard) / `16px` (large cards)
- **Box Shadow**: `0 1px 4px rgba(0,0,0,0.06)`
- **Padding**: 16–24px

#### Tutor Card
- Circular avatar (60–72px)
- Name (bold), rating (⭐ star), session count
- Expertise tags: pill badges, lavender background, purple text
- "View profile" button (lavender/outline pill)
- Heart icon (top-right for favouriting)

#### Session Card (My Sessions)
- Session number and topic link
- Tutor name
- Date and time
- "Join session" button (purple pill, full-width on mobile)

#### Resource Card (EY Resource)
- Thumbnail image (top, full-width of card)
- Title text
- "Read →" pill button (lavender)

#### Curriculum Feature Cards
- Large coloured background (lavender / cyan / yellow)
- Title (large, colored text matching card theme)
- Description text
- 3D illustration icon (right side)

#### Subscription Plan Card
- Radio button selector
- Session count (large, bold)
- Price (right-aligned, large)
- "Recommended" badge (purple pill, top-center)
- Selected state: purple border + checkmark

### Filter Chips / Tags

- **Inactive**: White background, dark gray border, dark text
- **Active**: Purple `#6D28D9` background, white text
- Shape: Pill (`border-radius: 9999px`)
- Size: 12–14px text, 28–32px height

### Date Picker (Book Session)

- Row of 7 date pills (Mon–Sun)
- **Inactive date**: Light lavender background or outline
- **Active / selected date**: Purple `#6D28D9` background, white text, pill shape
- Disabled past dates: Gray, not clickable

### Tab Bar (My Sessions)

- Horizontal row: Upcoming | Completed | Cancelled | Missed | Pending
- **Active tab**: Purple pill outline/underline, purple text
- **Inactive tab**: Gray text, no decoration
- Font: 14px, medium weight

### Notification Bell Button

- **Background**: `#FFFBE4` (soft yellow)
- **Border**: 1px light border
- **Badge**: Red or purple circle with count (e.g., "29"), top-right corner
- **Icon**: 🔔 bell emoji

### Wallet Button

- **Background**: White or light
- **Icon**: 💳 wallet emoji (purple gradient emoji)
- **Text**: `₹{balance}` (e.g., ₹0)

### Progress Bar (Leaderboard / Subscription)

- **Fill color**: Yellow `#FFF176` or Purple `#6D28D9`
- **Background**: Light gray or peach/pink
- **Height**: 8–12px
- **Border radius**: `9999px`
- **Lightning bolt ⚡** icon at the end of filled section

### Level Badge (Leaderboard)

- Bronze hexagon/nut shape (copper/brown gradient)
- White level number (1, 2, 3…) centered
- League label: "Bronze League" centered above the level list

### Point Bubbles (Leaderboard)

- Circular, bright yellow `#FFF176` background
- Number centered, dark text
- Small size (~36–40px diameter)

### Social Share Buttons (Refer & Earn)

| Platform | Color |
|---|---|
| Facebook | `#1877F2` blue |
| LinkedIn | `#0A66C2` blue |
| WhatsApp | `#25D366` green |
| YouTube | `#FF0000` red |
| X (Twitter) | `#000000` black |

Shape: Square with rounded corners (~8px), white icon on colored background

---

## Page-Specific Design Notes

### Login Page
- Clean centered card on a white/light background
- Country code selector + phone number input (single row)
- Password input with show/hide toggle
- Primary CTA button (purple pill, full-width)

### Dashboard
- Full-width welcome banner with personalized greeting
- Quick action grid tiles
- Upcoming session preview widget

### Profile Page
- Gradient blue/purple header banner
- Circular avatar (overlapping the banner bottom edge)
- Stats card (white, floating right): "118 Sessions taken"
- "Living abroad" tag with flag emoji
- Two-column layout: Profile form (left) | Subscription card (right)
- Input fields: outlined, label floats on focus

### Refer & Earn
- Full-width hero banner: purple gradient background, white text, gold "Copy" CTA
- Illustration (two people with coins) on the right of the banner
- Referral link input: white outlined box + purple "Copy" button
- Step flow: 3 circular icon badges (share / user-add / gift), dashed connecting line

### FAQ Page
- YouTube video carousel with < > navigation and dot pagination
- Accordion FAQ list (expand/collapse on click)
- Video thumbnails at ~330px wide with purple overlay and YouTube play button

### Curriculum Page
- Three large feature cards in a row (lavender, cyan, yellow backgrounds)
- "Your Notes" section below with 3-column grid of session note cards
- Session note cards: book illustration, session number label

---

## Responsive Behavior

- Sidebar collapses to hamburger menu on smaller viewports
- Cards reflow from multi-column to single column on mobile
- Date picker row scrolls horizontally on mobile
- Tutor card grid: 3-col (desktop) → 2-col (tablet) → 1-col (mobile)

---

## Accessibility Notes

- Interactive elements have cursor-pointer
- Colour contrast: White text on purple `#6D28D9` passes WCAG AA
- Focus styles: default browser focus ring (custom styling not confirmed)
- Images have alt text (to be verified in tests)
