# Apex IoT

A full-stack IoT security-monitoring platform. Shop owners and administrators track shutter-sensor devices across organisations: live battery, signal strength, vibration and shutter state, with alerts for suspicious activity.

- **[`backend/`](backend)**: REST API in **Go** (Gin). JWT auth with a phone-OTP flow, role-based access control, multi-tenant organisations, device telemetry and notifications.
- **[`frontend/`](frontend)**: dashboard in **Next.js 14** (React, TypeScript, Tailwind, React Query, Recharts).

The project is fully self-contained: the backend keeps data in memory and seeds demo data on start-up, so there is no database, cloud account or SMS provider to configure.

## Quick start

Run the backend, then the frontend, in two terminals.

```bash
# 1. Backend  ->  http://localhost:8080
cd backend
go run .

# 2. Frontend ->  http://localhost:3000
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Sign in at <http://localhost:3000> with phone **+1 555 010 0001** and OTP **1234**. The demo data contains two organisations, five users with different roles and six devices with a week of readings.

## How it fits together

```
Browser ── Next.js (server actions + React Query) ── REST /api/v0 ── Go / Gin
                                                                      ├─ Authenticate (JWT)
                                                                      ├─ Autherize (RBAC: role actions per resource)
                                                                      └─ services ── in-memory repository (seeded)
```

Highlights:

- Generic thread-safe `Table[T]` store in Go, so swapping in a real database only touches one package.
- Telemetry queries support time ranges, value ranges and cursor pagination, newest first.
- Zod schemas on the frontend validate every API response.
- Login OTPs are single-use, expire after five minutes and are limited to five attempts.

See each folder's README for details and the API reference.
