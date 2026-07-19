# 🏟️ StadiumIQ — FIFA World Cup 2026 Smart Stadium Platform

> An AI-powered, real-time stadium operations and fan experience platform built for FIFA World Cup 2026.

![StadiumIQ Banner](https://img.shields.io/badge/FIFA%20WC%202026-StadiumIQ-00c896?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01IDEuNDEtMS40MUwxMCAxNC4xN2w3LjU5LTcuNTlMMTkgOGwtOSA5eiIvPjwvc3ZnPg==)
![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-12.x-FFCA28?style=flat-square&logo=firebase)
![Groq AI](https://img.shields.io/badge/Groq-LLaMA%203.3%2070B-F55036?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel)

---

## 🚀 Live Demo

> 🔗 **[https://stadium-iq.sigma.vercel.app](https://stadium-iq.sigma.vercel.app)** ← **Primary (Vercel — AI fully active)**  
> Vercel Hosting with Serverless Groq API Proxy

> 🔗 **[https://stadiumiq-4e4a1.web.app](https://stadiumiq-4e4a1.web.app)**  
> Firebase Hosting — Project: `stadiumiq-4e4a1`

---

## 🎯 Problem Statement Alignment

The brief asks to *"improve navigation, crowd management, accessibility, transportation, sustainability, multilingual assistance, operational intelligence, or real-time decision support."*

Every brief domain is addressed — including the two highest-value areas: **operational intelligence** and **real-time decision support** — each backed by a live Groq API call:

| Brief Domain | Feature | Route | AI Engine | Proof Point |
|---|---|---|---|---|
| **Navigation** | Seat locator with step-by-step gate routing & AR wayfinding | `/fan` | — | Fan enters section → gets gate + numbered directions instantly |
| **Crowd Management** | Live density heatmap, choke-point analysis, AI rerouting recommendation | `/crowd` | ✅ Groq LLaMA | "Recommend rerouting Gate A traffic — density at 91%" (live Groq call) |
| **Accessibility** | Wheelchair routes, elevator status, one-tap assistance request, sensory zones | `/accessibility` | — | 4 routes with step-by-step instructions + elevator status board |
| **Transportation** | Real-time shuttle ETAs, parking occupancy, rideshare links, departure waves | `/transport` | — | 4 shuttle routes + 4 parking lots with live occupancy bars |
| **Sustainability** | Per-fan carbon calculator, AI eco-tips, energy widget, waste leaderboard | `/sustainability` | ✅ Groq LLaMA | User inputs travel/food → Groq returns 3 personalised eco-tips |
| **Multilingual Assistance** | Real-time AI translation in 8 languages, voice input, FIFA phrase guide | `/multilingual` | ✅ Groq LLaMA | Type any text → Groq translates to Spanish, French, Arabic, Chinese, Hindi, Japanese, Portuguese |
| **Operational Intelligence** | Staff incident logger, resource allocation heatmap, **AI decision recommendation** | `/ops` | ✅ Groq LLaMA | Groq analyses open incidents + understaffed zones → outputs single prioritised action |
| **Real-time Decision Support** | AI crowd rerouting card (**CrowdIQ**) + AI ops recommendation card (**OpsCommand**) | `/crowd` `/ops` | ✅ Groq LLaMA | Both cards call Groq with live data and surface a numbered, zone-specific action |
| **AI Assistant** | Full-session Q&A chat for FIFA WC 2026 — venues, schedule, wayfinding | `/ai-assist` | ✅ Groq LLaMA | Persistent chat session with stadium context, offline fallback |

---

## ✨ Features

- **AI Chat (Groq / LLaMA 3.3-70B)** — Real-time stadium Q&A across all 16 FIFA 2026 venues
- **AI Crowd Rerouting** — Live Groq recommendation card on `/crowd` with zone-specific action
- **AI Operational Intelligence** — Live Groq recommendation card on `/ops` based on open incidents
- **Firebase Auth** — Email/password login with role-based access (fan vs staff)
- **Firestore** — Real-time crowd density, queue times, incident reports
- **RTL Language Support** — Full right-to-left layout for Arabic
- **i18n** — English, Spanish, French, Arabic, Portuguese, Chinese, Hindi, Japanese via react-i18next
- **Offline Support** — Service worker caching, graceful offline fallbacks
- **PWA Ready** — `manifest.json` with icons, installable on mobile
- **Accessibility** — WCAG 2.1 AA compliant, aria-live regions, skip-to-content
- **Rate Limiting** — Token bucket algorithm (10 calls/min) for AI API
- **OpsCommand Dashboard** — Protected route (`/ops`) with incident & resource management
- **React Router v7 Ready** — Enabled future flags for a warnings-free console
- **Vercel Serverless Proxy** — `api/groqProxy.js` routes Groq API calls server-side, keeping the API key secure

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 5 |
| Routing | React Router v6 (with v7 Future Flags) |
| AI | Groq API (LLaMA 3.3-70B Versatile) via Vercel Serverless Proxy |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Hosting | Vercel (primary) + Firebase Hosting |
| Serverless | Vercel Functions (`api/groqProxy.js`) |
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

```bash
npm test
```

Tests are located in `src/test/` and `src/pages/*.test.tsx`.  
All unit and integration tests compile cleanly with TypeScript (`tsc --noEmit`) and run completely green with 0 console warnings or errors. All tests use **Vitest** + **@testing-library/react**.

---

## 🗺️ Route Map

| Route | Page | Auth Required |
|-------|------|--------------|
| `/` | Home — Live OpsCommand Dashboard | No |
| `/fan` | Fan Hub — Seat locator, food stalls | No |
| `/ai-assist` | GameDay AI — Groq-powered chat | No |
| `/crowd` | CrowdIQ — Density heatmap, AI rerouting | No |
| `/accessibility` | AccessPath — Wheelchair routes | No |
| `/transport` | MoveIQ — Shuttles, parking | No |
| `/sustainability` | EcoScore — Carbon footprint | No |
| `/multilingual` | LinguaAssist — Multilingual AI chat | No |
| `/ops` | OpsCommand — Staff dashboard + AI decision support | ✅ Staff only |

---

## 🔒 Security

- **No catch-all Firestore rules** — all collections use explicit `isAuthenticated()` / `isStaff()` guards; the final rule is `allow read, write: if false`
- **Groq API key never exposed client-side in production** — all calls are proxied through the Vercel serverless function (`api/groqProxy.js`); the key lives only in Vercel environment variables
- **Input sanitization** — all user inputs run through DOMPurify + prompt-injection filter before reaching Groq or Firestore

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
