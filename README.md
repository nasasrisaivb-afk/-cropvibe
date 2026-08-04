# CropVibe

Multi-sided agricultural marketplace — **Phase 1 web dashboard** + **NestJS API**.

## Share links

| What | Link |
|------|------|
| **Live design demo** | https://nasasrisaivb-afk.github.io/-cropvibe/ |
| **Source code** | https://github.com/nasasrisaivb-afk/-cropvibe |

Demo path: Login → OTP (any 6 digits) → role switcher in the header.

> **One-time enable (repo owner):** GitHub → **Settings → Pages** → Source **Deploy from a branch** → Branch **`gh-pages`** / **`/` (root)** → Save.  
> After that, every push to `main` refreshes the live demo automatically.

## Design system (60 / 30 / 10)

- **60%** Canvas `#1A1A1A` dark / `#FAFAF8` light
- **30%** Surfaces `#242424` / `#FFFFFF`
- **10%** Signature lime `#CCFF00` (near-black text on lime)

## Apps

| App | Path | Command |
|-----|------|---------|
| Web dashboard (marketplace) | repo root (Vite) | `npm run dev` |
| **Admin console** | `admin/` (Next.js 14) | `cd admin && npm run dev` |
| API | `backend/` | see `backend/README.md` |

### Admin console

```bash
cd admin
npm install
npm run dev
```

Open http://localhost:3000 — login `admin@cropvibe.com` / `Admin@123`. See [`admin/README.md`](admin/README.md).

## Web (frontend)

```bash
npm install
npm run dev
```

Local demo: `/login` → OTP (any 6 digits) → pick role.

## API (backend)

```bash
cd backend
docker compose up -d
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

Swagger: http://localhost:3001/docs

## Stack

- Web: Vite · React 19 · TypeScript · Tailwind · Zustand
- API: NestJS · Prisma · PostgreSQL · Redis · JWT OTP auth
