# Library Management System — Frontend

Standalone **React + Vite** client for the library. Styling and layout match the original library application; only wiring, tooling, and a small dev-only debug strip were added.

## Prerequisites

- Node.js 18+
- Backend API running (see `/backend/README.md`), default `http://localhost:8080`

## Setup

```bash
cd frontend
cp .env.example .env
```

`VITE_API_URL` must point at the backend origin (no trailing slash required).

Install and run:

```bash
npm install
npm run dev
```

The dev server listens on **http://localhost:5173** by default.

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production bundle |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript check |

## API client

The generated REST hooks live under `src/lib/api-client-react/`. `src/main.tsx` calls `setBaseUrl(import.meta.env.VITE_API_URL)` so all `/api/...` requests go to the backend.

## Developer debug panel

In **development only**, a minimal strip in the corner shows backend/DB status and the last `fetch` URL. It is not rendered in production builds.
