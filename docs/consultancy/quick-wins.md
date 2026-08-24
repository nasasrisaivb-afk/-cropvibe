# CropVibe Consultancy — Quick Wins & Mockups

**Focus:** High-impact changes · Week 1 **implemented**  
**Route:** `/dashboard/consultancy`

---

## Quick wins summary

| # | Change | Impact | Status |
|---|--------|--------|--------|
| 1 | Book now on cards | Critical | Done |
| 2 | Role-aware page title | High | Done |
| 3 | Remove confusing tabs | Medium | Done |
| 4 | Simplify card info | Medium | Done |
| 5 | Toast notifications | Medium | Done |
| 6 | Details sheet | High | Done |
| 7 | 3-step booking sheet | High | Done |

---

## Before → after (service card)

**Before:** ID on card, vague metadata, Appointments/Calendar tabs, no book path.

**After (buyer):** Title, provider, price, duration, rating, Book now + View details.

**After (provider):** Same card body, Manage bookings + View details.

---

## Week 1 checklist

- [x] Role-aware page title + eyebrow + subtitle
- [x] Simplified cards (no ID on face)
- [x] Book now + View details buttons
- [x] Remove Appointments/Calendar from cards
- [x] Details sheet
- [x] Booking sheet (3 steps + confirm)
- [x] Toast on confirm / unavailable
- [x] Pointsale panel for filter bar
- [ ] Manual test iOS + Android
- [ ] Backend booking API

---

## Week 2 checklist (next)

- [ ] Details as full page with shareable URL
- [ ] 30-day calendar widget
- [ ] Price + location filters
- [ ] Review list section
- [ ] Skeleton loading states

---

## Code references

| Component | Path |
|-----------|------|
| Catalog page | `src/components/services/ServiceCatalogPage.tsx` |
| Sample data | `src/components/services/serviceCatalogData.ts` |
| Booking sheet | `src/components/services/ServiceBookingSheet.tsx` |
| Details sheet | `src/components/services/ServiceDetailsSheet.tsx` |
| Toasts | `src/components/common/Toast.tsx` |

Use `var(--cv-primary)` and `.cv-dashboard-panel` — not hard-coded legacy hex values.
