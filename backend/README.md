# Library Management System — Backend

Standalone **Node.js + Express + PostgreSQL** API for the library app.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [PostgreSQL](https://www.postgresql.org/download/) 14+ running on `localhost:5432`

Create a database:

```sql
CREATE DATABASE library_db;
```

## Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set `DATABASE_URL`, `SESSION_SECRET`, and optionally `FRONTEND_URL` (used for `/health` frontend checks).

Install and run:

```bash
npm install
npm run dev
```

Server listens on **http://localhost:8080** by default.

## Database

Tables (`users`, `books`, `borrows`) are created automatically on startup if missing. A default **admin** user is seeded when the `users` table is empty:

- Email: `admin@library.local`
- Password: `admin123`

Change this password immediately in any shared environment.

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start API with file watch |
| `npm start` | Start API (production style) |
| `npm run db:verify` | Print connection + table row counts |

## API highlights

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Backend + DB + frontend reachability |
| GET | `/db-status` | Same summary as `/health` |
| GET | `/db-tables` | Table names + row counts |
| GET | `/db-data-status` | Row counts + `hasData` flags |
| GET | `/api/healthz` | Lightweight `{ status: "ok" }` for clients |
| GET | `/api/recommendations` | Compact `{ recommended: [{ title, reason }] }` |
| … | `/api/*` | Auth, books, borrows, dashboard (see source routes) |

## Migrations

There is no separate migration CLI: schema is applied in `src/services/databaseInit.js`. For production, consider extracting that SQL into versioned migration files.
