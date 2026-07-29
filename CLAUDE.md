# Communication Module

Multi-channel communication dispatch system. Node.js + Express + MongoDB backend, React + PrimeReact + Redux Toolkit + Tailwind frontend. Single process serves API and SPA in production.

## Run

```bash
npm run install:all
npm run dev                 # backend + frontend concurrently
npm run build && npm start  # production (serves SPA from backend/client/)
```

Backend can be started from any cwd: `node backend/src/server.js` (dotenv path is pinned to `backend/.env` via `__dirname`).

## Architecture

### Backend layout
- `backend/src/app.js` — Express app. Helmet has `upgrade-insecure-requests` disabled and HSTS off (HTTP-deployment safe). All API routes under `/api`. SPA served when `backend/client/index.html` exists; opt out with `SERVE_CLIENT=false`. SPA fallback regex: `/^(?!\/api(\/|$)).*/`.
- `backend/src/config/index.js` — central config, loads `.env` relative to `__dirname`.
- `backend/src/resources/<name>/` — resource-per-folder: `*.model.js`, `*.service.js`, `*.controller.js`, `*.routes.js`, `*.validation.js`.
- `backend/src/modules/<channel>/<Channel>Module.js` — one per channel, extends `BaseModule`, implements `async send(communication, customer) → { success, error?, dryRun? }`.
- `backend/src/modules/BaseModule.js` — `ok(meta)` / `fail(err)` helpers.
- `backend/src/services/DispatcherService.js` — `{ type → moduleInstance }` map.
- `backend/src/jobs/CommunicationJob.js` — per-tick: fetch from customer API → `upsertMany` by `(customerId, comID)` → dispatch pending → POST result to customer update API.
- `backend/src/jobs/scheduler.js` — per-customer `setInterval` keyed by `customer.id`; refreshes every 30s to pick up config changes without restart.
- `backend/src/utils/ids.js` — `prefixedId(prefix, length=10)` → e.g. `cus_a1b2c3d4e5`.
- `backend/src/utils/ensureIds.js` — startup migration: backfills `id` and migrates `communication.customerId` from ObjectId → `customer.id` string.

### Frontend layout
- `frontend/src/modules/<name>/` — `slice/`, `api/`, `ui/` (pages + components).
- `frontend/src/shared/` — utils, layout, routing.
- PrimeReact theme: `lara-light-indigo`. Tailwind with `preflight: false` to avoid clashing with PrimeReact resets.

## Conventions

### IDs
- Every resource has a readable `id` (`usr_`, `cus_`, `com_` + 10 alnum chars). `_id` is never exposed.
- JWT `sub` = readable user id.
- Foreign keys (e.g. `communication.customerId`) store the readable id, not ObjectId.

### Channels
- `email` (nodemailer), `sms` (Twilio), `whatsapp` (Twilio), `notification` (Firebase Admin), `inapp` (no-op).
- Dry-run: when transport credentials are absent, module returns `{ success: true, dryRun: true }`. Persisted on the communication and shown as a UI badge.
- Mail sends HTML body (`html: communication.html || communication.message`), not plain text.
- `SMTP_REJECT_UNAUTHORIZED=false` allows self-signed/mismatched TLS certs.
- Firebase: NotificationModule fingerprints credentials JSON with SHA-256 and re-initializes the admin App on change (no restart needed for key rotation).
- `withoutNotificationBody`: per-communication value wins if not null, else falls back to `customer.withoutNotificationBody`. When true, sends data-only push: `{ token, data: { data: JSON.stringify(rawPayload) }, android: { priority: 'high' }, apns: { ...content-available: 1 } }`.

### Communication ingestion
- `communication.service.js#normalizeIncoming()` maps client field aliases before save:
  - `fcmtoken` / `token` → `fcmToken`
  - `phone` / `phonenumber` → `phoneNumber`
  - `without_notification_body` → `withoutNotificationBody`
- `upsertMany` sets `rawPayload = item` (preserves original fetched object for data-only push).
- Uniqueness: compound index `{ customerId: 1, comID: 1 }`.

### Customer API contracts
- **Fetch endpoint** (per customer, configurable): accepts array, `{ data: [] }`, or `{ items: [] }`.
- **Update endpoint** POST body per communication:
  ```json
  { "id": "92646", "isSent": 1, "error": "" }
  ```
  `isSent` is `1` on success, `0` on failure; `error` is the message string (empty on success).

### Routing gotchas
- `POST /customers/bulk-delete` must be declared before `/:id` routes.
- Same for `POST /communications/bulk-delete`.

## Env vars

```
PORT=3000
MONGODB_URI=...
JWT_SECRET=...
SERVE_CLIENT=true|false        # opt out of SPA serving even if client/ exists
SMTP_HOST=...
SMTP_PORT=...
SMTP_SECURE=true|false
SMTP_USER=...
SMTP_PASS=...
SMTP_REJECT_UNAUTHORIZED=true|false
```

Firebase credentials are stored per-customer (`customer.firebaseKey`, hidden in `toJSON`, surfaced as `hasFirebaseKey`). Twilio credentials likewise per-customer.

## Known patterns / past fixes

- Don't gate SPA serving on `NODE_ENV`; use presence of `backend/client/index.html`.
- Don't load dotenv from cwd; pin path to source location.
- Don't ship helmet's HTTPS-forcing CSP on HTTP deployments.
- Customer scheduling refreshes config every 30s — no restart needed for `jobIntervalMs` or API URL changes.
- Firebase App is cached by credential fingerprint — rotated keys take effect on next dispatch tick.

## Testing changes

Frontend/UX changes: start dev server, exercise the feature in a browser. Type checks alone don't verify feature correctness.
