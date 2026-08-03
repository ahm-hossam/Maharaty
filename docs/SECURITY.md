# Maharaty — Security Architecture

> How we protect code and APIs across the entire Maharaty platform.
> Covers: NestJS backend · Next.js admin dashboard · React Native mobile app · Data layer

---

## Table of Contents

1. [Security Philosophy](#1-security-philosophy)
2. [Authentication System](#2-authentication-system)
3. [API Endpoint Protection Map](#3-api-endpoint-protection-map)
4. [Backend Protections](#4-backend-protections)
5. [Admin Dashboard Protections](#5-admin-dashboard-protections)
6. [Mobile App Protections](#6-mobile-app-protections)
7. [Data Layer Protections](#7-data-layer-protections)
8. [Deployment Security Checklist](#8-deployment-security-checklist)
9. [Known Remaining Gaps](#9-known-remaining-gaps)

---

## 1. Security Philosophy

Protection is applied in **defense-in-depth layers** — if one layer is bypassed, the next one catches it:

```
Request
  │
  ▼
[1] Rate Limiter (ThrottlerGuard)        — stops brute-force before any logic runs
  │
  ▼
[2] CORS (explicit allowlist)            — blocks unauthorized cross-origin callers
  │
  ▼
[3] JwtAuthGuard (passport-jwt)          — verifies the Bearer token cryptographically
  │
  ▼
[4] AdminGuard (role check)              — enforces ADMIN / SUPER_ADMIN for write ops
  │
  ▼
[5] ValidationPipe (class-validator)     — strips & rejects unexpected / invalid fields
  │
  ▼
[6] Service-level access control         — isPublished filter, media stripping, owner check
  │
  ▼
[7] Prisma ORM (parameterized queries)   — prevents SQL injection at the data layer
```

No single mechanism is treated as sufficient on its own. Every layer assumes the one above it could fail.

---

## 2. Authentication System

### 2.1 Token Pair

The platform uses a two-token system. Every authenticated session holds a short-lived **access token** and a longer-lived **refresh token**.

| | Access Token | Refresh Token |
|---|---|---|
| Algorithm | HS256 (JWT) | HS256 (JWT) |
| Lifetime | **15 minutes** | 7 days |
| Payload | `{ sub, email, role }` | `{ sub, email, role }` |
| Verified by | `JwtStrategy` on every request | DB lookup + expiry check |
| Storage — web | sessionStorage (Zustand, not persisted across tabs) | sessionStorage |
| Storage — mobile | Memory only (Zustand) | `expo-secure-store` (encrypted OS keychain) |
| Revocation | Stateless — expires after 15 min | DB row deleted on logout or rotation |

**Why 15 minutes?** A stolen access token is valid only until it expires. With no revocation mechanism for stateless JWTs, short expiry is the primary safety net.

### 2.2 Token Rotation

Every time a refresh token is used, it is **rotated**:

```
Client sends refreshToken
    → backend verifies it exists in DB and hasn't expired
    → DELETE the old refreshToken row
    → issue a new access + refresh pair
    → return both to client
```

This means a stolen refresh token can only be used **once**. If an attacker uses it before the legitimate client does, the client's next refresh will fail — a detectable anomaly.

### 2.3 JWT Secrets

Secrets are 256-bit cryptographically random hex strings. They must be generated fresh for each environment with:

```bash
openssl rand -hex 32
```

They live only in environment variables — **never in source code or version control**. Two separate secrets are used so that a compromise of one does not compromise both token types:

```
JWT_SECRET=<256-bit hex>           # signs access tokens
JWT_REFRESH_SECRET=<256-bit hex>   # signs refresh tokens
```

### 2.4 Password Hashing

Passwords are hashed with **bcrypt** at cost factor 10 before storage. Plain-text passwords are never stored or logged. The `validateUser()` method compares the submitted password to the stored hash using `bcrypt.compare()`.

### 2.5 User Liveness Check

Every JWT-authenticated request does a **live DB lookup** in `JwtStrategy.validate()`:

```ts
const user = await this.prisma.user.findUnique({
  where: { id: payload.sub },
  select: { id, email, name, role, isActive, avatar },
})
if (!user || !user.isActive) throw new UnauthorizedException(...)
```

This means a deactivated account is rejected immediately on the next request even if its token hasn't expired yet — it doesn't have to wait 15 minutes.

---

## 3. API Endpoint Protection Map

All endpoints are versioned under `/v1`. The table below shows the complete guard coverage.

### Auth  (`/v1/auth`)

| Method | Path | Guard | Rate Limit | Notes |
|---|---|---|---|---|
| POST | `/auth/register` | None | **5 / 60s** | Intentionally public; strict throttle prevents mass registration |
| POST | `/auth/login` | None | **5 / 60s** | Returns `401` on bad credentials (not 200) |
| POST | `/auth/refresh` | None | **10 / 60s** | DB-verified; token rotated on use |
| POST | `/auth/logout` | None | **10 / 60s** | Deletes refresh token from DB |
| GET  | `/auth/me` | JWT | 100 / 60s | Returns authenticated user profile |
| POST | `/auth/push-token` | JWT | 100 / 60s | Registers Expo push token for notifications |

### Content  (`/v1/content`)

| Method | Path | Guard | Notes |
|---|---|---|---|
| GET | `/content` | JWT | `isPublished: true` — drafts never returned to users |
| GET | `/content/categories` | JWT | Returns distinct published category list |
| GET | `/content/admin/all` | JWT + **Admin** | Returns all content including unpublished drafts |
| GET | `/content/:id` | JWT | `isPublished: true` for users; admins see drafts |
| POST | `/content` | JWT + **Admin** | Creates new content |
| PATCH | `/content/:id` | JWT + **Admin** | Updates content |
| DELETE | `/content/:id` | JWT + **Admin** | Deletes content |
| POST | `/content/:id/progress` | JWT | Updates user's progress on a content item |

### LMS  (`/v1/lms`) — controller-level JWT on all routes

| Method | Path | Guard | Notes |
|---|---|---|---|
| GET | `/lms/:contentId/curriculum` | JWT | Published-only for users; media (videoUrl, youtubeId, content, attachments) stripped from non-free lectures |
| GET | `/lms/:contentId/my-progress` | JWT | Returns only the requesting user's own progress |
| POST | `/lms/:contentId/sections` | JWT + **Admin** | |
| PATCH | `/lms/sections/:sectionId` | JWT + **Admin** | |
| DELETE | `/lms/sections/:sectionId` | JWT + **Admin** | |
| PATCH | `/lms/:contentId/sections/reorder` | JWT + **Admin** | |
| POST | `/lms/sections/:sectionId/lectures` | JWT + **Admin** | |
| PATCH | `/lms/lectures/:lectureId` | JWT + **Admin** | |
| DELETE | `/lms/lectures/:lectureId` | JWT + **Admin** | |
| PATCH | `/lms/sections/:sectionId/lectures/reorder` | JWT + **Admin** | |
| POST | `/lms/lectures/:lectureId/progress` | JWT | Records watch time and completion |

### Users  (`/v1/users`) — controller-level JWT + Admin on all routes

| Method | Path | Guard | Notes |
|---|---|---|---|
| GET | `/users` | JWT + **Admin** | Paginated user list |
| GET | `/users/:id` | JWT + **Admin** | Full user profile |
| POST | `/users` | JWT + **Admin** | Create user directly |
| PATCH | `/users/:id` | JWT + **Admin** | Update user |
| DELETE | `/users/:id` | JWT + **Admin** | Delete user |

### Admin  (`/v1/admin`) — controller-level JWT + Admin on all routes

| Method | Path | Guard |
|---|---|---|
| GET | `/admin/analytics` | JWT + **Admin** |
| POST | `/admin/seed-demo` | JWT + **Admin** |

### Activities  (`/v1/activities`) — controller-level JWT

| Method | Path | Guard | Notes |
|---|---|---|---|
| POST | `/activities` | JWT | User tracks own activity |
| GET | `/activities` | JWT + **Admin** | List all activities (admin) |
| GET | `/activities/my` | JWT | Returns requesting user's own activity log |

### Community  (`/v1/community`) — controller-level JWT

| Method | Path | Guard | Notes |
|---|---|---|---|
| GET | `/community/posts` | JWT | |
| POST | `/community/posts` | JWT | Author is set from JWT, never from body |
| DELETE | `/community/posts/:id` | JWT | Owner or admin check in service |
| GET | `/community/posts/:id/comments` | JWT | |
| POST | `/community/posts/:id/comments` | JWT | |
| DELETE | `/community/posts/:postId/comments/:commentId` | JWT | Owner or admin |
| POST | `/community/posts/:id/reactions` | JWT | Toggles like; userId from JWT |
| GET | `/community/stats` | JWT | |

### Notifications  (`/v1/notifications`) — controller-level JWT

| Method | Path | Guard | Notes |
|---|---|---|---|
| GET | `/notifications` | JWT | User's own notifications only |
| POST | `/notifications/send` | JWT + **Admin** | Send push to user(s) |
| PATCH | `/notifications/read-all` | JWT | Marks requesting user's notifications read |
| PATCH | `/notifications/:id/read` | JWT | |

### Self-Assessment  (`/v1/self-assessment`)

| Method | Path | Guard | Notes |
|---|---|---|---|
| GET | `/self-assessment/questions` | **None** | Active questions — intentionally public for pre-auth access |
| GET | `/self-assessment/questions/admin` | JWT + **Admin** | All questions including inactive |
| POST | `/self-assessment/questions` | JWT + **Admin** | |
| PATCH | `/self-assessment/questions/reorder` | JWT + **Admin** | |
| PATCH | `/self-assessment/questions/:id` | JWT + **Admin** | |
| DELETE | `/self-assessment/questions/:id` | JWT + **Admin** | |
| POST | `/self-assessment/seed` | JWT + **Admin** | Seeds default RIASEC questions |
| POST | `/self-assessment/results` | JWT | User submits assessment |
| GET | `/self-assessment/results/me` | JWT | User's own history only |
| GET | `/self-assessment/stats` | JWT + **Admin** | |

### Banner  (`/v1/banner`)

| Method | Path | Guard | Notes |
|---|---|---|---|
| GET | `/banner` | **None** | Public — needed by mobile before login |
| PUT | `/banner` | JWT + **Admin** | Updates banner config |

### Upload  (`/v1/upload`)

| Method | Path | Guard | Notes |
|---|---|---|---|
| POST | `/upload/image` | JWT + **Admin** | MIME allowlist; random hex filename |
| POST | `/upload/file` | JWT + **Admin** | Images + PDF; MIME allowlist; random hex filename |

---

## 4. Backend Protections

### 4.1 Guards

**`JwtAuthGuard`** (`modules/auth/guards/jwt.guard.ts`)
Extends `AuthGuard('jwt')` from `@nestjs/passport`. Extracts the Bearer token from the `Authorization` header, verifies the HS256 signature using `JWT_SECRET`, checks expiry, then calls `JwtStrategy.validate()` which performs a live DB lookup and rejects deactivated users.

**`AdminGuard`** (`modules/auth/guards/admin.guard.ts`)
Always runs after `JwtAuthGuard` — it reads `req.user` which JwtAuthGuard already populated. Throws `403 Forbidden` if the user's role is not `ADMIN` or `SUPER_ADMIN`.

**`ThrottlerGuard`** (global via `APP_GUARD` in `app.module.ts`)
Applied globally to every route as an `APP_GUARD` provider. Default: 100 requests per IP per 60 seconds. Auth endpoints override with stricter limits using `@Throttle({ default: { limit: N, ttl: 60000 } })`.

### 4.2 Rate Limiting

Configured in `app.module.ts`:
```ts
ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }])
// + APP_GUARD: ThrottlerGuard applied globally
```

Auth endpoint overrides (per IP):
- Login / Register: **5 per minute** — prevents password brute-force and mass account creation
- Refresh / Logout: **10 per minute** — prevents token enumeration

### 4.3 CORS

Only origins listed in `CORS_ORIGINS` are allowed to make credentialed cross-origin requests. If the env var is absent or set to `*`, the backend defaults to an **empty allowlist** (`origin: []`), effectively denying all cross-origin requests and logging a warning.

```ts
const origins = rawOrigins && rawOrigins !== '*'
  ? rawOrigins.split(',').map(o => o.trim())
  : []  // deny all if not explicitly configured
```

### 4.4 Input Validation

A global `ValidationPipe` is registered in `main.ts` with:

```ts
new ValidationPipe({
  whitelist: true,           // strips any field not in the DTO class
  forbidNonWhitelisted: true, // throws 400 if unexpected fields are sent
  transform: true,           // auto-converts query params to declared types
})
```

Every DTO is a class decorated with `class-validator` decorators (`@IsEmail`, `@IsString`, `@MinLength`, `@IsNotEmpty`, `@IsOptional`, etc.). The global pipe only operates on class instances with metadata — plain interfaces bypass it.

### 4.5 HTTP Security Headers

`@fastify/helmet` is registered at startup (if installed), which automatically sets:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 0`
- `Strict-Transport-Security` (on HTTPS)
- `Content-Security-Policy` (default-src 'self')

### 4.6 File Upload

Both upload endpoints (`POST /upload/image`, `POST /upload/file`) enforce:

1. **Admin-only** — `JwtAuthGuard + AdminGuard` — regular users cannot upload
2. **MIME allowlist** — only `image/jpeg`, `image/png`, `image/webp`, `image/gif`, and `application/pdf` are accepted
3. **Random filename** — stored filename is `crypto.randomBytes(16).toString('hex') + ext` — the client-supplied name is never used as the stored name, preventing path traversal
4. **10 MB size limit** — enforced by `@fastify/multipart` limits at registration

### 4.7 Swagger / API Docs

The Swagger UI at `/docs` is disabled in production:

```ts
if (process.env.NODE_ENV !== 'production') {
  // SwaggerModule.setup(...)
}
```

In development it remains available to speed up API exploration, but it is never reachable in a live deployment.

### 4.8 Content Visibility Control

The service layer enforces two rules independently of the guard layer:

- **Published filter** — `findOne` and `findPublished` add `isPublished: true` to the Prisma `where` clause for non-admin callers. Admins receive draft content; users do not.
- **Media stripping** — `getCurriculum` returns the full lecture object for free (`isFree: true`) lectures. For locked lectures, the fields `videoUrl`, `youtubeId`, `content`, and `attachments` are destructured out before the response is returned. The lecture title, duration, and order are still included so the UI can render the curriculum structure.

---

## 5. Admin Dashboard Protections

### 5.1 Server-Side Route Guard (Edge Middleware)

`apps/web/src/middleware.ts` runs at the **Next.js edge layer** — before any page is server-rendered, before any JS is loaded, before any React component mounts.

```
Incoming request
   │
   ├── Is it /login?
   │      └── Has session cookie? → redirect to /overview
   │          No session cookie?  → serve /login normally
   │
   └── Any other path?
          └── Has session cookie? → allow through
              No session cookie?  → redirect to /login?from=<original-path>
```

The cookie checked is `maharaty-session=1`. It carries no sensitive data — it is purely a session indicator. The middleware cannot read tokens from sessionStorage (which is client-only), so this cookie is the bridge between client-side auth state and server-side route protection.

### 5.2 Session Cookie

Set by `useAuthStore.setAuth()` on successful login:

```
maharaty-session=1; path=/; SameSite=Strict[; Secure when HTTPS]
```

Cleared by `useAuthStore.clearAuth()` on logout:

```
maharaty-session=; path=/; max-age=0; SameSite=Strict
```

`SameSite=Strict` means the cookie is never sent on cross-site navigations — it cannot be attached to requests initiated from a third-party page, which prevents CSRF attacks against the dashboard.

### 5.3 Client-Side Auth Layer (Dashboard Layout)

`apps/web/src/app/(dashboard)/layout.tsx` is a secondary defense that runs **after** the middleware. It handles the 15-minute access token expiry gracefully without forcing a full re-login:

```
On mount:
  1. accessToken present?          → allow render
  2. accessToken null, refreshToken present? → silently call POST /auth/refresh
       → success: update store with new tokens, allow render
       → failure: call clearAuth(), redirect to /login
  3. Both null?                    → redirect to /login
```

This two-layer approach means:
- The middleware blocks unauthenticated requests **before rendering** (no HTML leak)
- The layout handles **token refresh** and final cleanup after hydration

### 5.4 Token Storage

| Data | Storage | Why |
|---|---|---|
| `accessToken` | sessionStorage | Cleared when browser tab closes; not shared between tabs; not accessible cross-origin |
| `refreshToken` | sessionStorage | Same isolation as above; used for silent re-auth on page reload |
| `user` (name, email, role) | sessionStorage | Non-sensitive display data |

**Why sessionStorage over localStorage?**
`localStorage` is shared across all tabs and persists after the browser closes, making stolen tokens reusable from any origin that can inject script. `sessionStorage` is scoped to the tab and process lifetime, limiting the window for exploitation.

### 5.5 API Client (Axios Interceptors)

`apps/web/src/lib/axios.ts` attaches the Bearer token to every API request and handles token expiry transparently:

```
Request interceptor:  adds Authorization: Bearer <accessToken>

Response interceptor (on 401):
  → call POST /auth/refresh with refreshToken
  → on success: update store, retry original request
  → on failure: call clearAuth(), redirect to /login
```

The dashboard never makes unauthenticated API calls — the interceptor ensures the token is present or the user is redirected.

### 5.6 Role Enforcement

The login page explicitly checks the user's role before allowing entry:

```ts
if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
  setError('ليس لديك صلاحيات الوصول إلى لوحة التحكم')
  return
}
```

Even if a regular user somehow obtains a valid JWT, they are blocked from the dashboard UI. This is in addition to `AdminGuard` on every write endpoint in the API.

---

## 6. Mobile App Protections

### 6.1 Secure Token Storage

All tokens are stored using `expo-secure-store`, which delegates to the platform OS keychain:

| Platform | Backed by |
|---|---|
| iOS | Keychain Services — hardware-backed, AES-256 encrypted |
| Android | Android Keystore System — TEE or StrongBox hardware if available |

`AsyncStorage` is never used for tokens. All token reads and writes go through SecureStore:

```ts
await SecureStore.setItemAsync('access_token', accessToken)
await SecureStore.setItemAsync('refresh_token', refreshToken)
```

### 6.2 Route Protection — Dual Guard

Protected routes are defended at two levels:

**Level 1 — Root index** (`apps/mobile/src/app/index.tsx`):
On app startup, checks `isAuthenticated` in the auth store and redirects to `/(auth)/register` if false. Covers cold launches.

**Level 2 — Main layout** (`apps/mobile/src/app/(main)/_layout.tsx`):
Inside the Tabs navigator layout, checks `isAuthenticated` and renders `<Redirect href="/(auth)/login" />` if false. Covers deep links and programmatic navigation that bypass the root index.

Both levels are required because Expo Router's deep link handling can enter the app at any route, bypassing the root.

### 6.3 API Interceptor

`apps/mobile/src/services/api.ts` uses Axios interceptors:

```
Request interceptor:
  → reads access_token from SecureStore
  → adds Authorization: Bearer <token>

Response interceptor (on 401):
  → reads refresh_token from SecureStore
  → calls POST /auth/refresh
  → on success: stores new tokens in SecureStore, retries request
  → on failure:
      1. SecureStore.deleteItemAsync('access_token')
      2. SecureStore.deleteItemAsync('refresh_token')
      3. useAuthStore.getState().logout()   ← clears Zustand state
      4. router.replace('/(auth)/login')    ← forces navigation
```

This ensures that an expired or revoked session is fully torn down — both the persisted tokens and the in-memory state are cleared — and the user is taken to login.

### 6.4 No Sensitive Data in AsyncStorage

A deliberate decision: no token, user credential, or session identifier is ever passed to `AsyncStorage`. Only non-sensitive display preferences (theme, language) would be appropriate for AsyncStorage.

---

## 7. Data Layer Protections

### 7.1 ORM — No Raw SQL

All database operations go through **Prisma ORM**. Prisma uses parameterized queries internally — user-supplied values are always bound as parameters, never interpolated into query strings. This makes SQL injection structurally impossible in the normal data access path.

```ts
// Safe — prisma parameterizes `email` automatically
await this.prisma.user.findUnique({ where: { email: dto.email } })
```

### 7.2 Type Safety at Compile Time

The TypeScript compiler enforces DTO types from controller through service to DB call. A field that doesn't exist in the Prisma schema can't be passed to a Prisma call without a compile-time error. The global `ValidationPipe` enforces the same constraints at runtime.

### 7.3 Select Clause — No Accidental Data Leaks

Service methods use explicit `select` clauses rather than returning full Prisma records. This prevents new columns added to the schema (e.g. `internalNotes`, `billingId`) from silently appearing in API responses before access control is considered.

```ts
// Explicit select prevents accidental field exposure
select: {
  id: true, email: true, name: true, role: true, isActive: true, avatar: true,
}
// `password`, `pushTokens`, `refreshTokens` are never in the select
```

Password hashes are excluded from every user `select` in the codebase. The `login()` method does an explicit destructure to strip the password before returning:

```ts
const { password: _pw, ...safeUser } = user
return { ...tokens, user: safeUser }
```

### 7.4 Enum Validation

User roles and content types are defined as TypeScript enums (`Role`, `ContentType`, `ActivityType`) in `src/common/enums.ts` and mirrored in the Prisma schema. The `AdminGuard` and service-level checks reference these enums — arbitrary string values passed as role or type fields are rejected by the ValidationPipe before they reach service logic.

---

## 8. Deployment Security Checklist

Before deploying to production, verify every item:

**Secrets**
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are freshly generated with `openssl rand -hex 32`
- [ ] Neither secret appears in git history (`git log -S "your_secret"`)
- [ ] Secrets are injected via CI/CD environment variables — not `.env` files in the container

**Environment**
- [ ] `NODE_ENV=production` is set — disables Swagger UI
- [ ] `CORS_ORIGINS` is set to the exact production domain(s) only — no wildcards
- [ ] `JWT_EXPIRES_IN=15m` — do not increase this in production
- [ ] Database credentials are different from the development defaults (`postgres/postgres`)

**Network**
- [ ] Backend is behind a reverse proxy (nginx / Cloudflare) that terminates HTTPS
- [ ] HTTP → HTTPS redirect is enforced at the proxy level
- [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains` header is set
- [ ] Backend port (3004) is not publicly reachable — only the proxy is exposed
- [ ] Database port (5432) is not publicly reachable from outside the private network

**Application**
- [ ] `@fastify/helmet` is installed — adds security response headers automatically
- [ ] Upload directory (`public/uploads/`) is write-only for the app process — no execute permission
- [ ] Uploaded files are served with `Content-Disposition: attachment` to prevent in-browser execution
- [ ] All admin accounts use strong passwords (not `Admin@2026!`)

---

## 9. Known Remaining Gaps

Tracked here so they are not forgotten. Each has a clear owner and fix path.

| Gap | Severity | Fix |
|---|---|---|
| No enrollment / purchase gate | High | The curriculum strips media from non-free lectures but there is no DB-level enrollment model. Implement when billing is added: create an `Enrollment` table and check it in `getCurriculum` and `findOne`. |
| Refresh token not cryptographically verified | Medium | `auth.service.refresh()` validates by DB lookup only; it never calls `jwtService.verify()`. Add: `this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET })` before the DB lookup. |
| DB refresh expiry hardcoded as +7 days | Medium | `generateTokens()` uses `new Date() + 7 days` regardless of `JWT_REFRESH_EXPIRES_IN`. Parse the config value with `ms()` and use it for both the JWT expiry and the DB `expiresAt`. |
| No password reset flow | Medium | `forgot password` button in mobile login has no handler. Requires: a `POST /auth/reset-request` endpoint that emails a time-limited signed token, and a `POST /auth/reset-password` endpoint that consumes it. |
| Banner DTO is a plain interface | Medium | `PUT /v1/banner` accepts a plain `Partial<BannerConfig>` interface, which bypasses `ValidationPipe`. Convert to a class DTO with `@IsString()`, `@IsUrl()`, `@IsOptional()` decorators. |
| Unbounded pagination `limit` | Medium | Community, activities, users, and content list endpoints accept any `limit` value. Add `@Max(100)` to the limit field in each pagination DTO and cap it in the service: `Math.min(limit ?? 20, 100)`. |
| Weak password policy | Low | `RegisterDto.password` only requires `@MinLength(6)`. Upgrade to `@IsStrongPassword()` from class-validator and add `@MaxLength(128)` to prevent bcrypt long-input DoS. |
| No `isActive` check on refresh | Low | `auth.service.refresh()` checks `stored.user.isActive` but this re-read happens after the DB refresh token lookup, not before. Move the `isActive` check before the token rotation to avoid unnecessary DB writes for disabled accounts. |
