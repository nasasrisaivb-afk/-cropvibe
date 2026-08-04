# CropVibe Admin Console

Separate Next.js 14 admin dashboard for CropVibe marketplace operations. Uses a typed mock API layer (`src/lib/api/*`) so swapping to the NestJS backend later requires no UI changes.

## Quick start

```bash
cd admin
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo login

| Field | Value |
|-------|-------|
| Email | `admin@cropvibe.com` |
| Password | `Admin@123` |

Other seeded admins: `maya@cropvibe.com` (ops), `arjun@cropvibe.com` (support), `finance@cropvibe.com`, `auditor@cropvibe.com` — same password.

## Stack

- Next.js 14 App Router + TypeScript strict
- NextAuth.js 5 (credentials)
- TanStack React Query 5 + Zustand
- React Hook Form + Zod
- TanStack Table v8 + Recharts
- Tailwind + shadcn-style primitives (lime dark theme)

## Modules

Dashboard, Users, KYC, Disputes, Listings, Subscriptions, Transactions, Notifications, Analytics, Content, Roles & Permissions, Settings.

## Environment

Optional `.env.local`:

```
AUTH_SECRET=cropvibe-admin-dev-secret-change-me
```

## Scripts

- `npm run dev` — development
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — ESLint
