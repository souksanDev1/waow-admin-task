# Waow Admin Mini System — Design Spec

**Date:** 2026-09-14  
**Status:** Approved (conversational design); awaiting user review of this written spec  
**Source:** Offline Test — Admin Mini Backend (PDF) + shared DB schema from [waow-backend-task](https://github.com/souksanDev1/waow-backend-task)

## Goal

Build a standalone Admin Management mini system (backend + frontend) that:

- Implements JWT auth, dynamic roles/permissions (RBAC), admin CRUD with soft delete, and read-only user listing
- Uses the same `users` table shape as the User API project (standalone migrations; no dependency on that repo at runtime)
- Ships a full Admin panel covering all required APIs

## Non-goals

- OTP / phone User authentication APIs from the Online assessment
- Create / update / delete users
- Complex refresh-token rotation
- Heavy automated test suite (optional smoke only if time allows)

## Decisions (locked)

| Topic | Choice |
| --- | --- |
| Project relation to User API | Fresh standalone repo with copied `users` schema |
| Frontend scope | Full admin panel for all PDF APIs |
| Backend language | JavaScript + Express + Sequelize |
| Package manager | pnpm for both `backend/` and `frontend/` |
| Approach | Admin app + shared users schema (Approach 1) |

## Architecture

```
WaowTest/
├── backend/                 # Express + Sequelize (JS), pnpm
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/     # auth, RBAC, validate, error
│       ├── migrations/
│       ├── models/
│       ├── routes/
│       ├── seeders/
│       ├── services/
│       ├── validations/
│       ├── utils/
│       ├── app.js
│       └── server.js
├── frontend/                # Next.js App Router + TypeScript, pnpm
│   └── src/
│       ├── app/
│       ├── components/
│       ├── features/        # roles, admins, users, auth
│       ├── lib/             # axios client, query client, auth storage
│       └── types/
├── docker-compose.yml       # PostgreSQL 16
├── docs/superpowers/specs/
└── README.md
```

**Data flow:** Frontend (Axios + TanStack Query) → `REST /api/v1/*` → routes → validation → JWT + RBAC middleware → controller → service (transactions when needed) → Sequelize → PostgreSQL.

**Ports:** Backend `3000`, Frontend `3001`, Postgres `5434` (aligned with User API local setup).

**Layers:** Controllers stay thin; business rules and transactions live in services; models only define schema/associations; validations reject unknown fields.

## Data model

### `users` (from User API — read-only in this app)

| Column | Type | Notes |
| --- | --- | --- |
| id | INTEGER PK | autoIncrement |
| phone_number | STRING(20) | unique, not null |
| name | STRING(100) | not null |
| profile_image | STRING(255) | nullable |
| created_at / updated_at | DATE | underscored |

No OTP tables in this project.

### `roles`

| Column | Type | Notes |
| --- | --- | --- |
| id | INTEGER PK | |
| name | STRING | unique |
| permissions | JSONB | module flags below |
| created_at / updated_at | DATE | |

Permissions shape:

```json
{
  "admin_module": {
    "can_create": false,
    "can_delete": true,
    "can_update": true,
    "can_view": true
  },
  "user_module": {
    "can_create": true,
    "can_delete": false,
    "can_update": true,
    "can_view": true
  }
}
```

### `admins`

| Column | Type | Notes |
| --- | --- | --- |
| id | INTEGER PK | |
| username | STRING | unique |
| password | STRING | bcrypt hash |
| role_id | INTEGER FK → roles | |
| is_deleted | BOOLEAN | default false |
| deleted_at | DATE | nullable |
| created_at / updated_at | DATE | |

Soft delete sets `is_deleted = true` and `deleted_at = now()`. Login and list exclude soft-deleted rows.

### Default roles & seeder

- **SUPER_ADMIN:** all `can_*` flags `true` for `admin_module` and `user_module`; middleware treats `roleName === 'SUPER_ADMIN'` as full access. Role management APIs are **SUPER_ADMIN only**.
- **NORMAL:** both modules `can_view: true`; `can_create`, `can_update`, `can_delete` all `false` (matches PDF: cannot update/delete).
- Seeder creates roles above plus admin `superadmin` / `123456` (hashed) assigned to SUPER_ADMIN.

## API design

**Base URL:** `http://localhost:3000/api/v1`  
**Auth header:** `Authorization: Bearer <JWT>`  
**JWT claims:** `adminId`, `roleId`, `roleName`; access lifetime ~7d.

### Response envelope

Success:

```json
{ "error": false, "code": 0, "message": "Success", "data": {} }
```

Failure:

```json
{ "error": true, "code": "ADMIN_ERR_001", "message": "Error message here", "data": {} }
```

Validation unknown field → `VALIDATION_ERR_UNKNOWN_FIELD` (message includes field name). Other codes: `AUTH_ERR_*`, `ADMIN_ERR_*`, `ROLE_ERR_*`, `FORBIDDEN`.

### Endpoints

| Method | Path | Access |
| --- | --- | --- |
| POST | `/auth/login` | Public — username + password → JWT |
| GET | `/roles` | SUPER_ADMIN |
| POST | `/roles` | SUPER_ADMIN |
| PUT | `/roles/:id` | SUPER_ADMIN |
| DELETE | `/roles/:id` | SUPER_ADMIN |
| GET | `/admins` | JWT + `admin_module.can_view` |
| POST | `/admins` | JWT + `admin_module.can_create` |
| PUT | `/admins/:id` | JWT + `admin_module.can_update` |
| DELETE | `/admins/:id` | JWT + `admin_module.can_delete` (soft) |
| POST | `/admins/:id/reset-password` | SUPER_ADMIN only |
| GET | `/users` | JWT + `user_module.can_view` |

**Validation:** Joi in `validations/` (equivalent to express-validation). Reject unknown keys; validate types/length/required for JSON bodies.

**Transactions:** Use Sequelize transactions for create/update admin (and similar multi-step writes) when partial failure is possible.

## Frontend design

**Stack:** Next.js App Router + TypeScript, Tailwind CSS + shadcn/ui + Lucide, TanStack Query, single configured Axios client, React Hook Form + Zod, ESLint + Prettier, strict TypeScript, pnpm.

### Routes

| Path | Purpose |
| --- | --- |
| `/login` | Username/password login |
| `/` | Redirect to dashboard or login |
| `/dashboard` | Short overview + module links |
| `/roles` | List + create/edit/delete roles |
| `/admins` | List + create/edit/soft-delete; reset password (SUPER_ADMIN) |
| `/users` | Read-only user list |

### UX / structure

- Post-login layout with sidebar: Dashboard, Roles, Admins, Users, Logout
- JWT stored client-side (`localStorage`); Axios request interceptor attaches Bearer; 401 → `/login`
- Feature folders under `src/features/{auth,roles,admins,users}` with forms/tables/hooks separated
- Permission-aware UI: hide actions the role cannot perform
- Toasts (e.g. sonner) for API `message`; field errors from Zod

**Env:** `NEXT_PUBLIC_API_URL=http://localhost:3000`

## Error handling

- Backend: centralized error middleware maps thrown/domain errors to the envelope; no stack traces in production responses
- Frontend: unwrap success `data`; surface API `message` on failure; RHF field errors for client validation

## Run plan (post-implementation)

```bash
docker compose up -d
cd backend && pnpm install && pnpm db:migrate && pnpm db:seed && pnpm dev
cd frontend && pnpm install && pnpm dev
```

- API: http://localhost:3000  
- App: http://localhost:3001  
- Login: `superadmin` / `123456`

## Success criteria

1. Migrations create `users`, `roles`, `admins`; seeder creates SUPER_ADMIN + NORMAL + superadmin account
2. All listed `/api/v1` endpoints behave with JWT + RBAC + soft delete + response envelope
3. Frontend covers login and full CRUD/list flows for roles, admins, users
4. `pnpm` used in both apps; ESLint + Prettier + strict TS on frontend
5. Project runs locally via the run plan above

## Implementation next step

After written-spec approval → `writing-plans` skill → detailed implementation plan → build and run.
