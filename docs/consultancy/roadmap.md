# CropVibe Consultancy — Design Improvement Roadmap

**Status:** Phase 1 Week 1 implemented · Phases 2–4 planned  
**Scope:** UX/UI, interaction design, accessibility  
**Timeline:** 8–12 weeks  
**Codebase:** Marketplace SPA (`src/components/services/`)

---

## Implementation status legend

- Done in repo
- Partial / mock data
- Not started

---

## PHASE 0: Discovery & planning (Week 1)

### Step 1.1: User personas & scenarios — Not started

**Deliverable:** 1–2 page persona doc + 3–5 scenario workflows

- [ ] Persona: Farmer / buyer (e.g. Suresh — soil health consultation)
- [ ] Persona: Service provider (e.g. Rakesh — manage bookings)
- [ ] Persona: Admin / moderator (if applicable)
- [ ] Scenarios: find & book · provider adds service · reschedule booking

### Step 1.2: Audit current product flows — Partial

**Deliverable:** Flow map + component audit

- [x] Mapped consultancy route: `/dashboard/consultancy` → `ServiceCatalogPage`
- [x] Documented broken items: no book CTA, ambiguous tabs (fixed in Week 1)
- [ ] Screenshot all states (loading, error, empty) for QA baseline
- [ ] Document integrations: orders (`/dashboard/orders`), calendar, create flow

### Step 1.3: Design system baseline — Done

**Deliverable:** Tokens aligned with CropVibe Pointsale system

Use existing tokens in `src/index.css`:

```
Panels:     .cv-dashboard-panel
Primary:    var(--cv-primary), var(--cv-btn-bg)
Text:       var(--cv-text), var(--cv-muted)
Surfaces:   var(--cv-surface), var(--cv-bg)
Borders:    var(--cv-border)
Spacing:    8px grid (Tailwind: 2, 4, 6, 8…)
Radius:     12–24px on panels (match rentals/reports)
Touch:      min 44px height, .cv-touch
```

- [x] Component inventory: Button, Card, Badge, Sheet, Toast, PageHeader
- [ ] Storybook or Figma spec (optional)
- [ ] WCAG 2.1 AA checklist attached to QA

### Step 1.4: Success metrics — Not started

| Metric | Target |
|--------|--------|
| Booking completion rate | 70–80% |
| Time to book | 2–3 min |
| Service creation rate (providers) | 80–90% |
| Error rate | <5% |
| WCAG AA | 100% |
| Lighthouse performance | 90+ |

---

## PHASE 1: Critical fixes (Weeks 2–3)

### Step 2.1: Book now CTA — Done (mock booking)

- [x] Primary **Book now** on buyer-facing cards
- [x] **Manage bookings** on provider-facing cards
- [x] 44px touch targets, primary button styling
- [x] `ServiceBookingSheet` — date → time → review → confirm
- [x] Disabled state when status ≠ open
- [ ] Connect to real API / Convex mutation
- [ ] Payment step if required

### Step 2.2: Clear page purpose — Done

- [x] Role-aware eyebrow, title, subtitle (buyer vs provider)
- [ ] Dynamic nav breadcrumbs in `DashboardLayout` (optional)
- [ ] Role badge in header avatar area

### Step 2.3: Consolidate appointments & calendar tabs — Done

- [x] Removed **Appointments** / **Calendar** from service cards
- [x] Provider: **Manage bookings** → `/dashboard/orders`
- [x] Inline “Next available” dates on open services

### Step 2.4: Service details — Partial

- [x] `ServiceDetailsSheet` — provider, description, includes, pricing
- [x] Reviews summary line (rating + count)
- [ ] Full reviews list with verified badge
- [ ] Dedicated route `/dashboard/consultancy/:id`
- [ ] Provider credentials block

### Step 2.5: Information hierarchy — Done

- [x] Card priority: title → provider → price → CTA
- [x] Service ID hidden from card face
- [x] Status badge top-right

---

## PHASE 2: Important enhancements (Weeks 4–6)

### Step 3.1: Search & filter — Partial

- [x] Search by title, subtitle, provider, location
- [x] Status filter
- [ ] Price range, location multi-select, sort options
- [ ] Search suggestions, active filter chips

### Step 3.2: Booking flow — Partial

- [x] 3-step sheet + confirmation
- [x] Optional notes field
- [ ] Login gate, slot conflict handling, calendar export

### Step 3.3: Feedback mechanisms — Done (basic)

- [x] Toast component
- [x] Success / warning toasts
- [ ] Skeleton loaders, button spinners, network retry

### Step 3.4: Trust signals — Not started

- [ ] Provider credentials, review cards, verification badges

### Step 3.5: Mobile optimization — Partial

- [x] Responsive grid, full-width CTAs, bottom sheet
- [ ] Sticky bottom CTA on details page

---

## PHASE 3: Polish & accessibility (Weeks 7–8)

### Step 4.1: WCAG 2.1 AA audit — Not started

### Step 4.2: Design system documentation — Partial

### Step 4.3: Empty & error states — Partial

### Step 4.4: Performance — Not started

### Step 4.5: Testing & QA — Not started

---

## PHASE 4: Launch & iterate (Weeks 9–12)

### Steps 5.1–5.4 — Not started

Pre-launch checklist · beta · monitoring · continuous improvement

---

## Timeline

| Week | Phase | Key deliverables | Status |
|------|-------|------------------|--------|
| 1 | Discovery + P0 | Week 1 UI fixes | UI done |
| 2–3 | P0 | Details page route, live booking API | Planned |
| 4–6 | P1 | Search/filter v2, trust signals | Planned |
| 7–8 | Polish | a11y, errors, performance | Planned |
| 9–12 | Launch | Beta, metrics | Planned |

---

## Related routes

| Path | Purpose |
|------|---------|
| `/dashboard/consultancy` | Service catalog |
| `/dashboard/create` | Add service slot |
| `/dashboard/orders` | Bookings list |
| `/dashboard/calendar` | Calendar view |
