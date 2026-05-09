# LibraryMS

A full-stack Library Management System where admins manage books and users, and members can browse the catalog and borrow/return books.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied to `/api`)
- `pnpm --filter @workspace/library-app run dev` — run the React frontend (proxied to `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing key

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite, TailwindCSS, shadcn/ui, React Query, Wouter (routing)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: JWT (Bearer token), bcryptjs, stored in localStorage
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec`)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — DB schema (users, books, borrows tables + enums)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/` — Generated React Query hooks + Zod schemas (from codegen)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, books, borrows, users, dashboard)
- `artifacts/api-server/src/middlewares/auth.ts` — JWT auth middleware
- `artifacts/library-app/src/pages/` — All page components
- `artifacts/library-app/src/contexts/` — AuthContext, ThemeContext
- `artifacts/library-app/src/components/` — Sidebar, ProtectedRoute

## Architecture decisions

- Contract-first API: OpenAPI spec in `lib/api-spec` drives both server validation (Zod) and client hooks (Orval codegen).
- JWT stored in `localStorage` under key `library_token`; injected into all API requests via `setAuthTokenGetter` in `AuthContext`.
- Role-based access: `admin` and `user` roles enforced both in the API middleware and frontend `ProtectedRoute`.
- Drizzle ORM with `drizzle-zod` for schema inference — DB schema is single source of truth for types.
- Wouter for lightweight client-side routing; base path derived from `import.meta.env.BASE_URL`.

## Product

- **Login / Register** — JWT auth with demo credentials shown on login page
- **Dashboard** — Stats cards (total books, available, borrowed, users), quick-action links
- **Books catalog** — Browse, search, and filter books by category/availability; borrow with one click
- **My Borrows** — View active and returned borrows; return books
- **Admin: All Borrows** — View all system borrows, filter by status, approve returns
- **Admin: Books** — Add, edit, delete books
- **Admin: Users** — View all registered users

## Demo Credentials

- Admin: `admin@library.com` / `admin123`
- User: `user@library.com` / `user1234`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after editing `openapi.yaml` before touching frontend code.
- Run `pnpm --filter @workspace/db run push` after editing `lib/db/src/schema/` to apply migrations.
- API server must be restarted after route changes (it compiles to a bundle via esbuild).
- Do not nest `<Link>` inside `<a>` or `<Button>` that renders an `<a>` — Wouter's `Link` already renders an `<a>`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
