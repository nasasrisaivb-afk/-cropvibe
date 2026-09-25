# CropVibe Admin Console

Operational console for the CropVibe agri marketplace — Next.js 14 (App Router), built on the
**CropVibe Admin Figma** visual language (lime `#CCFF00` accent on `#1A1A1A` / `#242424`, 60/30/10).

```bash
cd admin
npm install
npm run dev        # http://localhost:3000
```

| Demo login | Password | Sees |
|---|---|---|
| `admin@cropvibe.com` | `Admin@123` | Everything (Super Admin) |
| `maya@cropvibe.com` | `Admin@123` | Ops Admin |
| `finance@cropvibe.com` | `Admin@123` | Finance only (+ read-only users/marketplace/settings) |
| `arjun@cropvibe.com` | `Admin@123` | Support Agent |
| `auditor@cropvibe.com` | `Admin@123` | Read-only everywhere |

## Information architecture

Defined once in [`src/config/navigation.ts`](src/config/navigation.ts) — drives the sidebar,
breadcrumbs, page titles, ⌘K palette and RBAC.

- **Dashboard** — Overview · Platform activity · Revenue · Transactions · Alerts · Pending actions
- **Users & Roles** — All users · Buyers · Sellers · Rental owners · Drivers · Labor · Warehouse owners · Experts · Admins · Role management · KYC verification
- **Marketplace** — Products · Categories · Listings · Listing approvals · Orders · Sellers · Marketplace reports
- **Services** — Machinery · Machinery rental · Labor · Drivers · Logistics · Warehouses · Experts · Soil testing
- **Bookings & Ops** — Bookings · Appointments · Deliveries · Tracking · Agreements · Reports
- **Finance** — Revenue · Transactions · Payments · Refunds · Settlements · Payouts · Invoices · Subscriptions · Financial disputes
- **Trust & Safety** — Disputes & issues · Content moderation · Audit log
- **Support & Comms** — Support requests · Notifications · Content (CMS)
- **Reports & Insights** — Reports · Analytics · Platform performance
- **Settings** — Platform settings · Integrations

## How it's built

- **Resource framework** (`src/lib/resources/*`, `src/components/resource/*`): each operational list is
  a typed config (columns, status tabs, filters, KPIs, drawer sections, actions). `<ResourcePage>` renders
  the same flow everywhere: tabs → filters/search → table → pagination → detail drawer → confirmed action.
- **Error prevention**: state changes go through a confirm dialog; destructive ones require a reason;
  suspensions support *Indefinite / Until date*.
- **Audit trail**: every mutation writes to the record timeline and the global **Audit log**.
- **RBAC**: modules hidden per role, deep links blocked, actions hidden for view-only roles.
- **Mock API** (`src/lib/api/*`) — typed async functions over seeded in-memory data, shaped like the
  planned REST endpoints so the NestJS backend can replace it without UI changes. Changes persist in
  `sessionStorage` for the tab; **Reset demo data** in the header restores the seed.
- **Charts** (`src/components/charts/ChartKit.tsx`): emphasis form — the series that matters in lime,
  comparison in gray; hover tooltips and a table view on every chart.
- Accessibility: WCAG-AA text contrast, keyboard-reachable rows/menus/⌘K, skip link, reduced motion.

## Static preview (GitHub Pages)

Live: **https://nasasrisaivb-afk.github.io/-cropvibe/admin/** — deployed on every push to `main`.

`BASE_PATH=/-cropvibe/admin npm run build:static` exports a server-less build to `out/`: login uses a
browser-side mock session instead of NextAuth, routes are guarded on the client, and detail pages
are pre-rendered for the seeded records.

Scripts: `npm run dev` · `npm run build` · `npm run build:static` · `npm run start` · `npm run lint`
