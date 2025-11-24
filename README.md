<div align="center">

  <h3 align="center">ScanIn</h3>

   <div align="center">
     A Next.js 15 (App Router) app to scan product barcodes, classify packaging with AI, and book waste pick-ups to nearby waste banks. Users can sign up/sign in, track scan history, schedule pickups, and browse Jakarta waste-bank options.
    </div>
</div>

## 📋 <a name="table">Table of Contents</a>

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🤸 [Quick Start](#quick-start)

## <a name="introduction">🤖 Introduction</a>

ScanIn helps households sort waste responsibly. Scan barcodes with the camera or manually, let AI classify the packaging, get recycling tips, and build pickup requests to waste banks around Jakarta. The app uses Next.js App Router (SSR/ISR/PPR), cached AI enrichment, and MockAPI as the data backend for users, scans, enrichments, and pickup orders.

Waste-bank listings are fetched live from the Jakarta open-data endpoint (`https://ws.jakarta.go.id/.../data-lokasi-bank-sampah`) and filtered client-side for active entries.

## <a name="tech-stack">⚙️ Tech Stack</a>

- Next.js 15 (App Router) + React 19
- Tailwind CSS v4 (utility-first styling)
- ShadCN-inspired UI primitives (Radix UI + tailwind-merge + clsx)
- SWR for client data fetching
- AI SDK + OpenAI (packaging classification & tips)
- MockAPI for user, scan, enrichment, and order data
- Zod, React Hook Form, Lucide Icons

## <a name="features">🔋 Features</a>

👉 **Authentication**: Email/password sign-up & sign-in backed by MockAPI, with onboarding guard for protected screens.  
👉 **Home feed**: Responsive dashboard with shortcuts to scan, history, pickups, and achievements.  
👉 **Barcode scanning**: Camera-based scanner plus manual input; automatically deduplicates scans.  
👉 **AI enrichment**: OpenAI summarizes packaging category, recyclability, awareness notes, and action tips (cached to reduce calls).  
👉 **Scan history**: Paginated history of scanned items per user.  
👉 **Waste-bank directory**: Filter by wilayah/kecamatan/kelurahan; remembers last used bank.  
👉 **Pickup builder**: Choose a bank, select waste items and quantities, auto-calculate total, pick date/time slot, add contact/address, and submit order.  
👉 **Orders list**: View submitted pickup requests and statuses.  
👉 **Profile & menu**: Profile summary, quick links, and logout.  
👉 **Responsive UI**: Optimized for mobile-first with desktop variants where needed.

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to run the project locally.

**Prerequisites**

- Node.js 18.18+ (Node 20+ recommended)
- npm

**Cloning the Repository**

```bash
git clone https://github.com/bluehoneygee/scanin.git
cd scanin
```

**Installation**

```bash
npm install
```

**Set Up Environment Variables**

Create `.env.local` in the project root:

```env
# MockAPI base URL (e.g., https://<id>.mockapi.io/api/v1)
MOCK_API_BASE=

# OpenAI (required for AI enrichment)
OPENAI_API_KEY=
```

**Running the Project**

```bash
npm run dev
```

Visit http://localhost:3000 to see the app. If you use MockAPI, make sure the `products`, `scans`, `enrichments`, `users`, and `orders` collections exist or are auto-created on first write.

**Waste-bank data source**

No extra env var is needed. The waste-bank directory calls the public Jakarta dataset at `https://ws.jakarta.go.id/gateway/DataPortalSatuDataJakarta/1.0/satudata?kategori=dataset&tipe=detail&url=data-lokasi-bank-sampah`. Ensure your environment can reach that URL (or proxy it if your network restricts outbound requests).
