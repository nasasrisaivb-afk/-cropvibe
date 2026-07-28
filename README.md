# CropVibe

Multi-sided agricultural marketplace — **Phase 1 web dashboard** + **NestJS API**.

## Design system (60 / 30 / 10)

- **60%** Base `#F7F8F5`
- **30%** Brand green `#2E7D32`
- **10%** Accent amber `#F59E0B`

## Apps

| App | Path | Command |
|-----|------|---------|
| Web dashboard | repo root (Vite) | `npm run dev` |
| API | `backend/` | see `backend/README.md` |

## Web (frontend)

```bash
npm install
npm run dev
```

Demo: `/login` → OTP (any 6 digits) → pick role.

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
