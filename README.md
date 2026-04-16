# Finwy Web

**Next.js (App Router) frontend only** — no database, Prisma, or server-side business logic in this package. UI calls your **REST API** using `NEXT_PUBLIC_API_URL`.

## Setup

```bash
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL to your backend API prefix, including /api/v1 (e.g. http://localhost:3005/api/v1)
npm run dev
```

## API contract (align your backend)

The app expects JSON and (after login) sends:

`Authorization: Bearer <accessToken>`

Login response should include **`accessToken`** (or **`token`**) plus **`user`** (`id`, `email`, `name`, `role`).

| UI area | Method | Path (appended to `NEXT_PUBLIC_API_URL`) |
|--------|--------|------------------------------------------|
| Login | POST | `/auth/login` |
| Register | POST | `/auth/register` |
| Verify OTP | POST | `/auth/verify-otp` |
| Forgot password | POST | `/auth/forgot-password` |
| Reset password | POST | `/auth/reset-password` |
| Logout | POST | `/auth/logout` |
| Current user | GET | `/auth/me` |
| Contact | POST | `/contact` |
| Dashboard summary | GET | `/dashboard/summary` |
| Wallet deposit | POST | `/wallet/deposit` |
| Wallet transfer | POST | `/wallet/transfer` |
| Transactions | GET | `/wallet/transactions` |
| Notifications | GET, PATCH | `/notifications` |
| Profile | PATCH | `/profile` |
| Admin analytics | GET | `/admin/analytics` |
| Admin users | GET | `/admin/users` |
| Admin user block | PATCH | `/admin/users/:id` |
| Admin transactions | GET | `/admin/transactions` |

Paths are suggestions — adjust your backend to match, or refactor `src/lib/api-client.ts` and page `apiFetch(...)` calls.

## Token storage

Access tokens are stored in **`localStorage`** under `finwy_access_token` (see `src/lib/config.ts`). For production, consider httpOnly cookies set by your API domain and CORS configuration.

## Docker

Optional production image: see `Dockerfile` (standalone Next build). No database container is required for this app.

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
