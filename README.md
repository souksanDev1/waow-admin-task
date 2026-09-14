# Waow Admin

Admin mini system (JWT + RBAC) with a Next.js admin console. Shares the same `users` table shape as the User API assessment project.

```
backend/    Express + Sequelize + PostgreSQL (pnpm)
frontend/   Next.js App Router admin panel (pnpm)
```

## Prerequisites

- Node.js 20+
- pnpm
- Docker (Postgres)

## Quick start

```bash
# 1) Database
docker compose up -d

# 2) Backend
cd backend
cp .env.example .env
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

API: http://localhost:3002  
Health: http://localhost:3002/api/v1/health

```bash
# 3) Frontend
cd frontend
cp .env.example .env.local
pnpm install
pnpm dev
```

App: http://localhost:3001

### Default credentials

- username: `superadmin`
- password: `123456`

## Ports

| Service | Port |
| --- | --- |
| Admin API | 3002 |
| Admin UI | 3001 |
| Postgres (shared with User API) | 5434 |

This admin app connects to the **same** Postgres as [`waow-backend-task`](https://github.com/souksanDev1/waow-backend-task) (`waow_backend` on `5434`). It reuses the existing `users` table and adds `roles` / `admins`.

`docker compose` in this repo (port `5436`) is only a fallback if you need a private DB; default `.env` points at `5434`.

## API base

`/api/v1`

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/auth/login` | Public |
| GET/POST/PUT/DELETE | `/roles` | SUPER_ADMIN |
| GET/POST/PUT/DELETE | `/admins` | RBAC `admin_module` |
| POST | `/admins/:id/reset-password` | SUPER_ADMIN |
| GET | `/users` | RBAC `user_module.can_view` |

Response envelope:

```json
{ "error": false, "code": 0, "message": "Success", "data": {} }
```

## Docs

- User guide: [`USER-GUIDE.md`](./USER-GUIDE.md)
- Design: `docs/superpowers/specs/2026-09-14-waow-admin-design.md`
- Plan: `docs/superpowers/plans/2026-09-14-waow-admin-implementation.md`
