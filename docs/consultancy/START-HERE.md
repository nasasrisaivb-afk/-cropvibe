# CropVibe Consultancy — Start Here

**Status:** Full consultancy module implemented (UI + mock booking persistence)  
**Route:** `/dashboard/consultancy` · Details: `/dashboard/consultancy/:serviceId`

---

## What's implemented

| Feature | Status |
|---------|--------|
| Book now + View details on cards | Done |
| Role-aware page copy (buyer vs provider) | Done |
| Full details page with shareable URL | Done |
| 30-day availability calendar | Done |
| 3-step booking flow + confirmation | Done |
| Search with suggestions | Done |
| Filters: status, location, price, sort | Done |
| Active filter chips + clear all | Done |
| Provider credentials + verification badges | Done |
| Reviews with verified booking badge | Done |
| Toast notifications | Done |
| Skeleton loading states | Done |
| Empty / not-found states | Done |
| Sticky mobile Book now CTA | Done |
| Bookings persist (localStorage) → Orders page | Done |
| Lazy-loaded booking sheet (code split) | Done |
| Dynamic breadcrumbs on detail pages | Done |

**Not yet wired:** Real Convex/backend API, payments, email/calendar export, automated tests.

---

## Key files

```
src/components/services/
  ServiceCatalogPage.tsx      — Catalog + filters
  ServiceDetailsPage.tsx      — Full detail page
  ServiceBookingSheet.tsx     — Booking modal
  ServiceCard.tsx             — Card component
  ServiceFilters.tsx          — Search + filters
  ServiceAvailabilityCalendar.tsx
  ServiceProviderSection.tsx
  ServiceReviewsSection.tsx
  ServiceCatalogSkeleton.tsx
  serviceCatalogData.ts         — Sample data
  serviceCatalogUtils.ts        — Filter/sort/calendar
  serviceCatalogTypes.ts        — Types

src/store/serviceBookingStore.ts — Persisted bookings
src/components/common/Toast.tsx
```

---

## Try it

```bash
npm run dev
```

1. Open `/dashboard/consultancy`
2. Switch to **Buyer** role → Book now → complete flow
3. Open `/dashboard/orders` → see confirmation code
4. Switch to **Service Provider** → Manage bookings view
5. Click **View details** → full page with calendar, reviews, credentials

---

## Design system

Use CropVibe Pointsale tokens: `.cv-dashboard-panel`, `--cv-primary`, `--cv-btn-bg`, `cv-touch`, `Sheet`.

See [roadmap.md](./roadmap.md) for phase checklist and [quick-wins.md](./quick-wins.md) for component patterns.
