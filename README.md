# Communication Module

Multi-channel communication dispatch system. A backend job pulls communications from each customer's API, dispatches them through the correct channel (email, SMS, WhatsApp, push notification, in-app user), then reports the result back.

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth
- **Frontend:** React, Vite, Redux Toolkit, PrimeReact, TailwindCSS, PrimeIcons, react-icons
- **Channels:** Nodemailer (email), Twilio (SMS / WhatsApp), Firebase Admin (push)

## Layout

```
.
├── backend/    Express API + scheduled dispatch job
├── frontend/   React admin UI
└── package.json (root scripts)
```

## Quick start

```bash
npm run install:all
cp backend/.env.example backend/.env   # fill in MONGO_URI, JWT_SECRET, etc.
cp frontend/.env.example frontend/.env
npm run dev
```

- Backend: http://localhost:4000 (API under `/api`)
- Frontend dev: http://localhost:5173 (Vite, proxies `/api` to backend)

## Production

```bash
npm run build   # builds the React app into backend/client/
npm start       # serves API + SPA on a single port
```

In production, the backend serves `backend/client/index.html` for any non-`/api` route.

## Resources

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET|POST|PUT|DELETE /api/customers`
- `GET|POST /api/communications`

See `backend/src/resources/*/`.
