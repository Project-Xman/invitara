# Invitara — Golden Wedding Invitation SaaS

A **complete**, production-grade wedding invitation SaaS built on the **TanStack Start** full-stack framework with **Drizzle ORM + PostgreSQL**, user authentication, AI design generation, credits system, ad monetization, analytics, and a golden wedding theme with Poppins font.

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | TanStack Start (Vinxi SSR) |
| **Router** | TanStack Router (file-based, type-safe) |
| **Server State** | TanStack Query (React Query v5) |
| **Tables** | TanStack Table v8 (sort, filter, paginate) |
| **Forms** | TanStack Form (auto-save on blur) |
| **Virtualization** | TanStack Virtual (template grid) |
| **Database** | PostgreSQL 16 + Drizzle ORM |
| **Auth** | JWT sessions (jose) + bcrypt passwords |
| **AI** | Google Gemini Nano (client) + Server fallback |
| **Payments** | Stripe / Razorpay ready |
| **Charts** | Recharts (analytics) |
| **Styling** | Tailwind CSS 3 + Poppins font |
| **Validation** | Zod schemas |
| **Deploy** | Docker + docker-compose |

---

## 📁 Project Structure

```
├── app.config.ts                # TanStack Start config
├── docker-compose.yml           # PostgreSQL + App containers
├── Dockerfile                   # Production build
├── drizzle.config.ts            # Drizzle Kit config
├── tailwind.config.js           # Golden wedding theme
├── .env.example                 # Environment variables
│
├── app/
│   ├── client.tsx               # Client hydration
│   ├── ssr.tsx                  # SSR handler
│   ├── router.tsx               # Router factory + QueryClient
│   ├── routeTree.gen.ts         # Generated route tree
│   │
│   ├── lib/
│   │   ├── schema.ts            # Drizzle PostgreSQL schema (15 tables)
│   │   ├── drizzle.ts           # DB connection
│   │   ├── auth.ts              # JWT auth, register, login, sessions
│   │   ├── credits.ts           # Credit system, packages, transactions
│   │   ├── ai-generate.ts       # Gemini Nano + server fallback AI
│   │   ├── analytics.ts         # Event tracking, daily views
│   │   ├── ads.ts               # Ad serving, impressions, free/paid logic
│   │   ├── purchases.ts         # Template purchase, plan upgrade
│   │   ├── server-fns.ts        # 20+ TanStack Start server functions
│   │   ├── queries.ts           # React Query hooks for all data
│   │   └── seed.ts              # Database seeder
│   │
│   ├── components/
│   │   ├── InvitationPreview.tsx # Live phone preview (hero, events, countdown)
│   │   ├── RsvpTable.tsx         # TanStack Table (sort/filter/paginate)
│   │   ├── EditorForm.tsx        # TanStack Form (Couple/Events/Details)
│   │   ├── VirtualTemplateGrid.tsx # TanStack Virtual template browser
│   │   ├── AIDesignGenerator.tsx # AI design with Gemini Nano + credits
│   │   ├── AnalyticsChart.tsx    # Recharts area chart + stat cards
│   │   ├── CreditStore.tsx       # Buy credits + transaction history
│   │   ├── AdBanner.tsx          # Ad banners + inline ads (free users)
│   │   └── ShareModal.tsx        # Share via WhatsApp/Email/SMS
│   │
│   ├── routes/
│   │   ├── __root.tsx            # Root layout + auth-aware nav
│   │   ├── index.tsx             # Landing (hero, templates, features, pricing, FAQ)
│   │   ├── templates.tsx         # Browse templates (virtual scroll)
│   │   ├── editor.tsx            # 5-tab editor + live phone preview + AI
│   │   ├── dashboard.tsx         # Stats + analytics + RSVP table
│   │   ├── preview.tsx           # Full-width invite preview
│   │   ├── pricing.tsx           # 4 plans + comparison table
│   │   ├── account.tsx           # Profile + credits + history
│   │   └── auth/
│   │       ├── login.tsx         # Email/password login
│   │       └── register.tsx      # Signup with 3 free credits
│   │
│   └── styles/
│       └── globals.css           # Tailwind + Poppins + golden theme
```

---

## 🚀 Quick Start

### 1. Start PostgreSQL

```bash
docker-compose up postgres -d
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 4. Push Schema & Seed

```bash
npm run db:push      # Create tables
npm run db:seed      # Seed templates + credit packages
```

### 5. Start Dev Server

```bash
npm run dev
# → http://localhost:3000
```

### Optional: Drizzle Studio

```bash
npm run db:studio
# → https://local.drizzle.studio
```

---

## 🗄 Database Schema (15 Tables)

| Table | Purpose |
|---|---|
| `users` | Auth, plan, credits, showAds flag |
| `sessions` | JWT session storage |
| `templates` | 11+ wedding templates with colors/gradients |
| `template_purchases` | Individual template purchases per user |
| `invitations` | User's created invitations with all details |
| `events` | Wedding events (Mehendi, Haldi, Shaadi, etc.) |
| `rsvps` | Guest RSVP responses with status |
| `payments` | Stripe/Razorpay payment records |
| `credit_transactions` | Credit debit/topup ledger |
| `ai_generations` | AI design generation history |
| `analytics_events` | Page views, shares, clicks, QR scans |
| `ad_impressions` | Ad view/click tracking |
| `credit_packages` | Purchasable credit bundles |

---

## 💰 Monetization Model

### Free Tier
- 2 free templates (Beach Bliss, City Royale, Save the Date)
- **Ads shown** (hero banner, editor sidebar, dashboard top, preview footer, between events)
- 3 AI generation credits on signup
- Up to 2 events, basic RSVP

### Paid Plans (one-time, no recurring)
| Plan | Price | Ads | AI Credits | Templates |
|---|---|---|---|---|
| Starter | ₹2,999 | ✗ No Ads | +5 bonus | Purchase individually |
| Premium | ₹3,999 | ✗ No Ads | +15 bonus | ALL templates |
| Royal | ₹6,999 | ✗ No Ads | +50 bonus | ALL + custom tweaks |

### Template Purchase (Starter plan)
- Buy individual templates at ₹3,999-4,999 each

### Credit Packs (any plan)
| Pack | Credits | Price | Per Credit |
|---|---|---|---|
| Starter | 5 | ₹99 | ₹19.80 |
| Creator | 15 | ₹249 | ₹16.60 |
| Pro | 50 | ₹699 | ₹13.98 |
| Studio | 150 | ₹1,499 | ₹9.99 |

---

## 🤖 AI Design Generation

### Gemini Nano (Client-Side, FREE)
- Runs directly in Chrome 127+ via `window.ai.languageModel`
- Zero server cost, zero credits used
- Generates color palettes, gradients, design suggestions

### Server Fallback (1 Credit)
- Algorithmic color generation seeded from user prompt
- 6 style presets: Traditional, Modern, Minimalist, Ornate, Rustic, Royal
- Returns gradient, 6-color palette, 3 suggestions, layout hints

### How It Works
1. User describes dream design + selects style
2. Client checks `window.ai` availability
3. If Nano available → generates locally (free)
4. If not → server generates (1 credit deducted)
5. Result shows gradient preview + palette + suggestions
6. User can "Apply" result to their invitation

---

## 📊 Analytics Tracked

| Event | Description |
|---|---|
| `page_view` | Landing page visits |
| `template_view` | Template card views |
| `invite_view` | Invitation page loads |
| `invite_share` | Share button clicks |
| `rsvp_submit` | RSVP form submissions |
| `link_click` | Venue/Instagram/WhatsApp clicks |
| `qr_scan` | QR code scans |
| `ad_impression` | Ad banner views |
| `ad_click` | Ad click-throughs |

---

## 📢 Ad System

### Ad Slots
| Slot | Location | Shown To |
|---|---|---|
| `hero_banner` | Below hero on homepage | Free users |
| `editor_bottom` | Editor sidebar bottom | Free users |
| `dashboard_top` | Dashboard top | Free users |
| `preview_footer` | Preview page bottom | Free users |
| `between_events` | Between event cards | Free users |
| `template_sidebar` | Template browse | Free users |

### How Ads Work
- Free users see **internal promotional ads** (upgrade, credit sales, new templates)
- All ad impressions/clicks tracked in `ad_impressions` table
- Paid users (Starter/Premium/Royal) → `showAds: false` → zero ads
- Ready for external ad network integration (Google AdSense, etc.)

---

## 🎨 Design Theme

- **Font:** Poppins (primary), Playfair Display (headings), Great Vibes (script), Cormorant Garamond (body)
- **Colors:** Gold palette (#D4A853 → #A67C2E), cream backgrounds (#FDF8F0)
- **Effects:** Glass morphism nav, gold shadows, shimmer animations, floating orbs
- **12 Templates** across 6 categories with unique gradients

---

## 🐳 Production Deploy

```bash
# Full stack with Docker
docker-compose up --build -d

# Or build manually
npm run build
npm start
```

---

## 📜 License

MIT
