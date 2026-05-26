# Speakoo 🌍
### Global Multi-Language Tutoring Platform

> Connect learners with expert tutors worldwide for live, interactive language sessions — powered by open-source technology.

---

## 🎯 Platform Overview

Speakoo is a scalable, real-time language tutoring marketplace that supports all major world languages. It connects **Learners** with **Tutors** for live video sessions featuring integrated chat, whiteboard, and screen-share — like Google Meet built into a learning platform.

---

## 👥 User Roles

### 🧑‍💼 Admin
- Manage support tickets by session ID / appointment ID
- Contact users via email or WhatsApp
- View platform analytics, revenue, and disputes
- Manage tutor approvals, content moderation
- Configure platform-wide settings (fee %, supported languages, etc.)

### 🎓 Learner
- Create profile (native language, target language, CEFR level)
- Browse tutors filtered by language, rating, price, availability
- Book time slots from a tutor's calendar
- Pay via wallet credits, saved card, or direct payment
- Join live session (video + whiteboard + chat + screen share)
- Receive session confirmation & reminders (60 min + 10 min)
- Leave feedback & star rating after each session
- Earn points / badges via gamification system

### 🧑‍🏫 Tutor
- Create profile with languages taught, certifications, bio, intro video
- Set weekly availability calendar with time slots
- Set per-session price (platform deducts 5% fee on payout)
- Join live sessions with learner
- Provide structured feedback & CEFR level assessment to learner
- View earnings dashboard, request payouts

---

## 🌐 Supported Languages (Initial Set)
English · Spanish · French · Mandarin Chinese · Arabic · Portuguese · Russian · Japanese · German · Korean · Italian · Hindi · Turkish · Dutch · Polish · Swedish · Vietnamese · Thai · Indonesian · Filipino

---

## ✨ Feature Set

### Core Features
| Feature | Description |
|---|---|
| Live Video Session | WebRTC-based HD video call |
| Interactive Whiteboard | Real-time collaborative drawing + text |
| In-Session Chat | Text chat during and after sessions |
| Screen Share | Tutor/learner screen sharing |
| Slot Booking | Calendar-based time slot reservation |
| Dual Payments | Learner pays → 5% platform fee → 95% to tutor |
| Wallet & Credits | Pre-loaded wallet balance + credit bundles |
| Session Reminders | Email at booking, 60 min before, 10 min before |
| WhatsApp Alerts | Critical notifications via WhatsApp |
| Feedback System | Star rating + structured feedback post-session |
| Points & Badges | Gamified milestone rewards for learners |

### Extended Features
| Feature | Description |
|---|---|
| AI Level Test | Conversational AI test on signup → CEFR placement |
| Daily Streaks | Consecutive session streaks with rewards |
| On-Demand Tutoring | "Available Now" instant session mode |
| Community Forum | Learners practice writing; tutors provide corrections |
| Group Sessions | Up to 6 learners in one session (lower cost) |
| Trial Sessions | 15-min free/discounted first trial per tutor |
| Language Exchange | Peer-to-peer exchange (no payment) |
| Progress Tracker | Visual CEFR progress over time |
| Session Recordings | Optional cloud recordings (with consent) |

### Trust & Safety
- Tutor identity verification (document upload)
- Session reporting & user blocking
- Content moderation for forum posts
- Minimum payout threshold ($50) to reduce transfer fees
- GDPR-compliant data handling

---

## 🗂️ Repository Structure

```
speakoo/
├── .github/
│   ├── copilot-instructions.md       # Copilot AI coding guidelines
│   ├── workflows/
│   │   ├── ci.yml                    # CI: lint, test, build
│   │   └── deploy.yml                # CD: deploy to production
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       ├── feature_request.md
│       └── session_issue.md
│
├── apps/
│   ├── api/                          # NestJS REST + WebSocket backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── tutors/
│   │   │   │   ├── learners/
│   │   │   │   ├── sessions/
│   │   │   │   ├── bookings/
│   │   │   │   ├── payments/
│   │   │   │   ├── wallet/
│   │   │   │   ├── notifications/
│   │   │   │   ├── feedback/
│   │   │   │   ├── gamification/
│   │   │   │   ├── admin/
│   │   │   │   └── languages/
│   │   │   ├── common/
│   │   │   └── main.ts
│   │   └── test/
│   │
│   ├── mobile/                       # Flutter app (iOS + Android)
│   │   ├── lib/
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── home/
│   │   │   │   ├── tutor_discovery/
│   │   │   │   ├── booking/
│   │   │   │   ├── session_room/
│   │   │   │   ├── wallet/
│   │   │   │   ├── profile/
│   │   │   │   └── feedback/
│   │   │   ├── shared/
│   │   │   │   ├── widgets/
│   │   │   │   ├── services/
│   │   │   │   └── utils/
│   │   │   └── main.dart
│   │   └── test/
│   │
│   └── web/                          # Flutter Web (Admin panel + landing page)
│       └── lib/
│
├── packages/
│   ├── shared-types/                 # Shared TS interfaces & DTOs
│   └── livekit-config/               # LiveKit room configuration
│
├── infra/
│   ├── docker/
│   │   ├── docker-compose.yml        # Full local dev stack
│   │   └── docker-compose.prod.yml
│   ├── nginx/
│   │   └── nginx.conf
│   ├── terraform/                    # Infrastructure as Code
│   │   ├── modules/
│   │   └── environments/
│   └── k8s/                          # Kubernetes manifests / Helm charts
│       └── charts/
│
└── docs/
    ├── ARCHITECTURE.md
    ├── SETUP.md
    ├── API.md
    └── GITHUB_PM.md
```

---

## 🔗 Quick Links

- [Setup Guide](docs/SETUP.md) — Install all required tools
- [Architecture](docs/ARCHITECTURE.md) — System design & data flow
- [GitHub PM Guide](docs/GITHUB_PM.md) — Project management with GitHub Projects
- [Copilot Instructions](.github/copilot-instructions.md) — AI coding conventions

---

## 📄 License
MIT — see [LICENSE](LICENSE)
