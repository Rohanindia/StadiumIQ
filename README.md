# 🏟️ StadiumIQ — FIFA World Cup 2026 Smart Stadium Platform

> An AI-powered, real-time stadium operations and fan experience platform built for FIFA World Cup 2026.

![StadiumIQ Banner](https://img.shields.io/badge/FIFA%20WC%202026-StadiumIQ-00c896?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01IDEuNDEtMS40MUwxMCAxNC4xN2w3LjU5LTcuNTlMMTkgOGwtOSA5eiIvPjwvc3ZnPg==)
![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-10.x-FFCA28?style=flat-square&logo=firebase)
![Groq AI](https://img.shields.io/badge/Groq-LLaMA%203.3%2070B-F55036?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite)

---

## 🚀 Live Demo

> 🔗 **[https://stadiumiq-4e4a1.web.app](https://stadiumiq-4e4a1.web.app)**  
> Firebase Hosting — Project: `stadiumiq-4e4a1`

---

## 🎯 Problem Statement Coverage

| Domain | Feature | Route | AI-Powered |
|--------|---------|-------|-----------|
| 🏟️ Fan Experience | Seat locator, food stall queue times, gate routing | `/fan` | ✅ |
| 🤖 AI Assistant | Real-time Q&A for FIFA WC 2026, multilingual | `/ai-assist` | ✅ Groq LLaMA 3.3 |
| 👥 Crowd Management | Heatmap density, choke-point alerts, zone predictions | `/crowd` | ✅ Groq |
| ♿ Accessibility | Wheelchair routes, elevator status, assistance requests | `/accessibility` | ✅ |
| 🚌 Transport & Mobility | Shuttle tracker, parking occupancy, rideshare links | `/transport` | ❌ (real-time data) |
| 🌱 Sustainability | Carbon calculator, eco-tips, waste leaderboard | `/sustainability` | ✅ Groq |
| 🌐 Multilingual | Auto-detect language, RTL support (Arabic), voice input | `/multilingual` | ✅ Groq |
| 🔒 Ops Command | Staff dashboard, incident reports, resource allocation | `/ops` | ✅ (Auth-protected) |

---

## ✨ Features

- **AI Chat (Groq / LLaMA 3.3-70B)** — Real-time stadium Q&A across all 16 FIFA 2026 venues
- **Firebase Auth** — Email/password login with role-based access (fan vs staff)
- **Firestore** — Real-time crowd density, queue times, incident reports
- **RTL Language Support** — Full right-to-left layout for Arabic
- **i18n** — English, Spanish, French, Arabic via react-i18next
- **Offline Support** — Service worker caching, graceful offline fallbacks
- **PWA Ready** — `manifest.json` with icons, installable on mobile
- **Accessibility** — WCAG 2.1 AA compliant, aria-live regions, skip-to-content
- **Rate Limiting** — Token bucket algorithm (10 calls/min) for AI API
- **OpsCommand Dashboard** — Protected route (`/ops`) with incident & resource management

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 5 |
| Routing | React Router v6 |
| AI | Groq API (LLaMA 3.3-70B Versatile) |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Hosting | Firebase Hosting |
| i18n | i18next + react-i18next |
| Testing | Vitest + Testing Library |
| Styling | Vanilla CSS (glassmorphism, cyberpunk theme) |

---

## 📦 Setup & Installation

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- Firebase CLI (`npm install -g firebase-tools`)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/stadiumiq.git
cd stadiumiq
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

```env
# Groq AI — https://console.groq.com/keys
VITE_GROQ_API_KEY=your_groq_api_key_here

# Firebase — console.firebase.google.com → Project Settings → Your Apps
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=stadiumiq-4e4a1.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=stadiumiq-4e4a1
VITE_FIREBASE_STORAGE_BUCKET=stadiumiq-4e4a1.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=943391922638
VITE_FIREBASE_APP_ID=1:943391922638:web:43406e605c2f826458339f
VITE_FIREBASE_MEASUREMENT_ID=G-XWM5S2S319

# Google Maps (optional)
VITE_MAPS_KEY=your_google_maps_api_key

VITE_IS_DEV=true
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔥 Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create project → Enable **Firestore**, **Authentication** (Email/Password), **Hosting**
3. `firebase login` → `firebase init` → `firebase deploy`

---

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server at localhost:5173 |
| `npm run build` | Production build |
| `npm run type-check` | TypeScript check (0 errors required) |
| `npm run lint` | ESLint check |
| `npm test` | Run all Vitest tests |
| `npm run test:coverage` | Coverage report |
| `firebase deploy` | Deploy to Firebase Hosting |

---

## 🧪 Tests

```
npm test
```

Tests are located in `src/test/` and `src/pages/*.test.tsx`.  
All tests use **Vitest** + **@testing-library/react**.

---

## 🗺️ Route Map

| Route | Page | Auth Required |
|-------|------|--------------|
| `/` | Home — Live OpsCommand Dashboard | No |
| `/fan` | Fan Hub — Seat locator, food stalls | No |
| `/ai-assist` | GameDay AI — Groq-powered chat | No |
| `/crowd` | CrowdIQ — Density heatmap, alerts | No |
| `/accessibility` | AccessPath — Wheelchair routes | No |
| `/transport` | MoveIQ — Shuttles, parking | No |
| `/sustainability` | EcoScore — Carbon footprint | No |
| `/multilingual` | LinguaAssist — Multilingual AI chat | No |
| `/ops` | OpsCommand — Staff dashboard | ✅ Staff only |

---

## 📸 Screenshots

> Dashboard and route previews coming soon.

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push and open a Pull Request

---

## 📄 License

MIT © 2026 StadiumIQ Team

---

> Built for the **FIFA World Cup 2026 Hackathon** — Powering the world's biggest sporting event with AI.
