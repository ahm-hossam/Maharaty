# Maharaty — Test Deployment Guide

Free-tier stack: **Neon** (DB) → **Render** (API) → **Vercel** (Dashboard) → **EAS Build** (Mobile)

---

## Overview

```
┌─────────────────────────────────────────────┐
│  Mobile (Expo)                              │
│  Android APK  ──────────────────┐           │
│  iOS (Expo Go)                  │           │
└─────────────────────────────────┼───────────┘
                                  │ HTTPS
┌─────────────────────────────────▼───────────┐
│  Render — maharaty-api                      │
│  NestJS · port 10000                        │
│  start:prod = prisma migrate + node dist    │
└─────────────────────────────────┬───────────┘
                                  │
┌─────────────────────────────────▼───────────┐
│  Neon — PostgreSQL               (free)     │
│  Serverless Postgres · SSL required         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Vercel — maharaty-dashboard                │
│  Next.js · NEXT_PUBLIC_API_URL → Render     │
└─────────────────────────────────────────────┘
```

---

## Step 1 — Neon (PostgreSQL)

1. Go to **https://neon.tech** → create a free account
2. Create a new project: name it `maharaty`
3. Copy the **Connection string** — it looks like:
   ```
   postgresql://neondb_owner:xxxx@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this — you'll paste it into Render as `DATABASE_URL`

> The free tier gives you 0.5 GB storage, unlimited connections, and a serverless Postgres that scales to zero.

---

## Step 2 — Render (NestJS Backend)

### 2a. Connect your repo

1. Go to **https://render.com** → New → **Web Service**
2. Connect your GitHub repo
3. Set **Root Directory** → `apps/backend`
4. Render will detect the `render.yaml` at the project root automatically if you use **Blueprint** deployment, or fill in manually:

   | Field | Value |
   |---|---|
   | Build Command | `npm install && npx prisma generate && npm run build` |
   | Start Command | `npm run start:prod` |
   | Node Version | 20 |

### 2b. Environment variables

Add these in the Render dashboard under **Environment**:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DATABASE_URL` | *(paste from Neon — must end with `?sslmode=require`)* |
| `JWT_SECRET` | *(run `openssl rand -hex 32` locally and paste)* |
| `JWT_REFRESH_SECRET` | *(run `openssl rand -hex 32` locally and paste)* |
| `JWT_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `CORS_ORIGINS` | *(fill in after Vercel deploy — see Step 3)* |

### 2c. Deploy

Click **Deploy**. Render will:
1. Install dependencies
2. Run `prisma generate` (generates the Prisma client)
3. Compile TypeScript (`nest build`)
4. On start: run `prisma migrate deploy` (applies all migrations to Neon DB), then start the server

Your API will be live at:
```
https://maharaty-api.onrender.com
```

> **Free tier note**: The service sleeps after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to cold-start. This is fine for testing.

### 2d. Seed an admin user

After deploy, create the first admin via the API directly:

```bash
curl -X POST https://maharaty-api.onrender.com/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "مهاراتي أدمن",
    "email": "admin@maharaty.com",
    "password": "Admin@2026!"
  }'
```

Then use Neon's SQL editor or Prisma to promote them to `SUPER_ADMIN`:

```sql
UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'admin@maharaty.com';
```

---

## Step 3 — Vercel (Next.js Dashboard)

### 3a. Import project

1. Go to **https://vercel.com** → Add New → **Project**
2. Import your GitHub repo
3. Set **Root Directory** → `apps/web`
4. Framework: Next.js (auto-detected)

### 3b. Environment variables

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://maharaty-api.onrender.com/v1` |

### 3c. Deploy

Click **Deploy**. Your dashboard will be at:
```
https://maharaty-dashboard.vercel.app
```

### 3d. Update CORS on Render

Go back to **Render → Environment** and set:
```
CORS_ORIGINS=https://maharaty-dashboard.vercel.app,https://maharaty-api.onrender.com
```

Then trigger a **Manual Deploy** on Render to apply the change.

---

## Step 4 — Mobile App (EAS Build)

### Free options summary

| Method | Android | iOS | Cost | Notes |
|---|---|---|---|---|
| **Expo Go** | ✅ | ✅ | Free | Scan QR, works right now — limited to Expo SDK packages |
| **EAS Build (APK)** | ✅ | ❌ | Free | Real native APK, shareable download link, no Play Store needed |
| **EAS Build (IPA)** | — | ✅ | $99/yr | Requires Apple Developer account for TestFlight |
| **iOS Simulator** | — | ✅ | Free | EAS can build a simulator `.app` but only runs in Xcode Simulator |

**Recommended for test deployment**: Android APK (anyone installs directly) + Expo Go for iOS testers.

---

### 4a. Install EAS CLI

```bash
npm install -g eas-cli
eas login   # log in with your Expo account (free at expo.dev)
```

### 4b. Link the project to your Expo account

```bash
cd apps/mobile
eas init    # creates / links the EAS project, adds "projectId" to app.json
```

This adds an `extra.eas.projectId` to your `app.json` automatically.

### 4c. Update the API URL in eas.json

The `preview` profile in `apps/mobile/eas.json` already has:
```json
"EXPO_PUBLIC_API_URL": "https://maharaty-api.onrender.com/v1"
```

Update `maharaty-api` to your actual Render service name if it differs.

### 4d. Build the Android APK

```bash
cd apps/mobile
eas build --platform android --profile preview
```

EAS builds in the cloud (no local Android SDK needed). When done (~10 min) it gives you:
- A **QR code** to scan on any Android phone → direct APK install
- A **download link** you can share with anyone

> Free tier: 30 builds per month. More than enough for testing.

### 4e. iOS testing (free — Expo Go)

For iOS testers **without paying for Apple Developer**:

1. Ask testers to install **Expo Go** from the App Store (free)
2. Point them to your running dev server QR, OR publish an Expo update:

```bash
cd apps/mobile
eas update --branch preview --message "test deployment"
```

Testers open Expo Go → scan QR or enter URL → your app loads instantly. No build required.

**If you have an Apple Developer account**, build for TestFlight:
```bash
eas build --platform ios --profile preview
eas submit --platform ios
```

---

## Environment Variable Reference

### Backend (Render)
| Variable | Example | Required |
|---|---|---|
| `NODE_ENV` | `production` | ✅ |
| `PORT` | `10000` | ✅ |
| `DATABASE_URL` | `postgresql://...neon.tech/...?sslmode=require` | ✅ |
| `JWT_SECRET` | *(256-bit hex)* | ✅ |
| `JWT_REFRESH_SECRET` | *(256-bit hex)* | ✅ |
| `JWT_EXPIRES_IN` | `15m` | ✅ |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | ✅ |
| `CORS_ORIGINS` | `https://maharaty-dashboard.vercel.app` | ✅ |

### Dashboard (Vercel)
| Variable | Example |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://maharaty-api.onrender.com/v1` |

### Mobile (eas.json `preview` env)
| Variable | Example |
|---|---|
| `EXPO_PUBLIC_API_URL` | `https://maharaty-api.onrender.com/v1` |

---

## Redeployment

| Change | Action |
|---|---|
| Backend code | Push to GitHub → Render auto-deploys |
| Web dashboard | Push to GitHub → Vercel auto-deploys |
| Mobile JS only | `eas update --branch preview` (instant, no rebuild) |
| Mobile native code | `eas build --platform android --profile preview` (new APK) |
| DB schema change | Push migration file → `start:prod` runs `prisma migrate deploy` automatically on next Render deploy |
