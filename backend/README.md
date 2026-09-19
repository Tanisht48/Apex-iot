# Apex IoT - Backend

REST API for an IoT security-monitoring platform, written in **Go** with **Gin**. It manages multi-tenant organisations, users with role-based access, IoT shutter-sensor devices and their telemetry.

This is a self-contained demo: data lives **in memory** and is seeded on start-up, and login uses a **fixed demo OTP**. There are no databases, cloud accounts or third-party services to set up.

## Features

- **Telemetry**: per-device readings (battery, RSSI signal, vibration, shutter state, alert priority) with time-range, range and cursor filters.
- **Multi-tenant organisations**: generated short organisation IDs, users and devices scoped to an organisation.
- **Authentication**: phone + OTP login that issues a signed JWT (HS256, 24h).
- **RBAC**: `Authenticate` + `Autherize` middleware. Reading needs a valid token; writes are checked against the user's role (`UserActions` / `DeviceActions`), and organisation management is reserved for the platform-wide `god` role.
- **Notifications**: high-priority readings raise device notifications that can be marked read or deleted.

## Stack

Go 1.22, Gin, `golang-jwt/jwt`, `go-playground/validator`, an in-memory generic `Table[T]` store.

## Run

```bash
go run .
```

The API is served at `http://localhost:8080/api/v0`. Optional configuration lives in environment variables or a `.env` file (see `.env.example`).

```bash
docker compose up --build   # or run it in a container
```

## Demo login

Seeded users (all fictional):

| Name | Phone | Role | Organisation |
| :--- | :--- | :--- | :--- |
| Demo Admin | `+15550100001` | `god` (full access) | Sunrise Mart |
| Riya Sharma | `+15550100002` | Admin | Sunrise Mart |
| Arjun Mehta | `+15550100003` | User (read-only) | Sunrise Mart |
| Neha Kapoor | `+15550100004` | Admin | Metro Retail Group |
| Sam Carter | `+15550100005` | User (read-only) | Metro Retail Group |

The OTP for every user is `1234` (override with `DEMO_OTP`). It is also printed in the server log when requested.

## Endpoints

All routes are under `/api/v0` and need an `Authorization: <jwt>` header (or `jwt_token` cookie) except the OTP routes and `/health`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check (outside `/api/v0`) |
| `GET` | `/user/otp?phone=+1555...` | Start login, returns a verification token |
| `POST` | `/user/otp/verify` | Body `{verification_code, otp, phone}`; JWT returned in the `Authorization` response header |
| `GET/POST/PUT/DELETE` | `/user`, `/user/:id` | Users |
| `GET` | `/user/organization/:orgId` | Users of an organisation |
| `GET/POST/PUT/DELETE` | `/organization`, `/organization/:id` | Organisations (writes: `god` only) |
| `GET/POST/PUT/DELETE` | `/device`, `/device/:id` | Devices |
| `GET` | `/device/organization/:orgId` | Devices with their latest reading |
| `GET` | `/deviceRecord/:deviceId` | Telemetry, newest first. Query: `limit`, `startKey`, `isDocked`, `alertPriorityStartRange/EndRange`, `vibrationIntensityStartRange/EndRange`, `createdAtStart/End` (RFC 3339) |
| `GET/POST/PUT/DELETE` | `/role`, `/group` | Access roles and groups |
| `GET/PUT/DELETE` | `/notification/device[/:deviceId]`, `/notification/:id?isRead=` | Device notifications |

## Project layout

```
main.go          server wiring and CORS
config/          optional .env loading
routers/         route -> middleware -> controller mapping
controllers/     HTTP handlers
services/        business logic, JWT and OTP
repository/      generic in-memory tables
seed/            demo data
middlewares/     authentication, authorisation, error handling
Models/ Dtos/ Errors/
```

## Notes

Because storage is in memory, all changes are lost when the server restarts. Swapping in a real database only means reimplementing `repository`.
