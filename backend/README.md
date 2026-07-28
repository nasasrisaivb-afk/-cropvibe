# CropVibe API

NestJS + Prisma backend for the CropVibe agricultural marketplace.

## Quick start

```bash
# 1) Start Postgres + Redis
docker compose up -d

# 2) Install & configure
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed

# 3) Run API
npm run start:dev
```

- API: `http://localhost:3001/api/v1`
- Health: `http://localhost:3001/api/v1/health`
- Swagger: `http://localhost:3001/docs`

## Auth flow

```http
POST /api/v1/auth/otp/request
{ "phone": "9876543210" }

POST /api/v1/auth/otp/verify
{ "phone": "9876543210", "code": "123456" }
```

Use `Authorization: Bearer <accessToken>` on protected routes.

## Modules

| Module | Endpoints |
|--------|-----------|
| Auth | OTP request/verify, register, switch-role, logout-all |
| Users | me, profile update, KYC submit |
| Listings | search, mine, create, status |
| Orders | list, checkout, status transitions (escrow) |
| Wallet | balance, ledger, payout request |

## Business rules encoded

- OTP required before account activation
- KYC required before publishing listings / payouts
- Bank account required before first payout
- 15% platform fee + escrow hold on checkout
- Unpaid orders expire in 30 minutes
- Order status machine for product & rental flows
- Audit logs on login, role switch, KYC, orders, payouts

## Seeded demo phones

- Seller: `9876500001` (KYC approved)
- Buyer: `9876500002`
