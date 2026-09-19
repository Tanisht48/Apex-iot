# Apex IoT - Web Dashboard

A responsive dashboard for monitoring IoT shutter-sensor devices across multiple organisations, built with **Next.js 14**, **React 18**, **TypeScript** and **Tailwind CSS**. It talks to the [Apex IoT backend](../backend).

## Features

- **Phone + OTP login** with a JWT stored in a cookie and route guarding in the root layout.
- **Organisations**: table of organisations with user and device counts; create, edit and delete.
- **Device dashboard**: devices with their latest battery, signal strength, vibration, shutter state and alert priority.
- **Device detail**: readings table with filtering plus Recharts line and bar charts for the selected time range.
- **Settings**: manage an organisation's users (with role assignment) and devices (shop open/close times).
- Light/dark theme.

## Stack

Next.js 14 (App Router, server actions), React Query v5, TanStack Table, Recharts, Tailwind + shadcn/ui (Radix), react-hook-form + Zod.

## Run

Start the backend first (see `../backend/README.md`), then:

```bash
npm install
cp .env.example .env.local     # points at http://localhost:8080/api/v0
npm run dev
```

Open <http://localhost:3000> and sign in with the demo account **+1 555 010 0001** and OTP **1234**.

Requires Node.js 18.17 or newer.

## Structure

```
app/               routes (login, organisations, device and settings pages)
components/        UI: tables, charts, forms, shadcn/ui primitives
server-actions/    server-side calls to the backend API, validated with Zod
lib/               API client, auth helpers, shared types
```
