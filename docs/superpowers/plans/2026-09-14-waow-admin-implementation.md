# Waow Admin Mini System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a standalone Admin mini system (Express + Sequelize backend, Next.js Admin panel) with JWT/RBAC, soft-delete admins, roles, and read-only users list under `/api/v1`.

**Architecture:** Monorepo with `backend/` and `frontend/`. Controllers stay thin; services own business logic and transactions; Joi validates requests; JWT + RBAC middlewares protect routes. Frontend uses a single Axios client, TanStack Query, RHF+Zod, and feature folders.

**Tech Stack:** Node.js, Express, Sequelize, PostgreSQL 16, Joi, JWT, bcrypt, pnpm; Next.js App Router, TypeScript, Tailwind, shadcn/ui, Lucide, TanStack Query, Axios, React Hook Form, Zod, ESLint, Prettier.

**Spec:** `docs/superpowers/specs/2026-09-14-waow-admin-design.md`

## Global Constraints

- Package manager: `pnpm` for both apps
- API base: `/api/v1`
- Response envelope: `{ error, code, message, data }`
- Ports: backend `3000`, frontend `3001`, Postgres `5434`
- Soft delete admins via `is_deleted` + `deleted_at`
- Role APIs and password reset: SUPER_ADMIN only
- Reject unknown validation fields
- Default login: `superadmin` / `123456`
- No OTP User APIs; `users` table is read-only

## File Structure (target)

```
WaowTest/
├── docker-compose.yml
├── README.md
├── .gitignore
├── .prettierrc
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── .sequelizerc
│   ├── eslint.config.js
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/database.js
│       ├── config/env.js
│       ├── models/index.js
│       ├── models/user.js
│       ├── models/role.js
│       ├── models/admin.js
│       ├── migrations/20260914000001-create-users.js
│       ├── migrations/20260914000002-create-roles.js
│       ├── migrations/20260914000003-create-admins.js
│       ├── seeders/20260914000001-default-roles-and-superadmin.js
│       ├── utils/response.js
│       ├── utils/errors.js
│       ├── utils/password.js
│       ├── utils/jwt.js
│       ├── middlewares/errorHandler.js
│       ├── middlewares/authenticate.js
│       ├── middlewares/authorize.js
│       ├── middlewares/validate.js
│       ├── validations/auth.validation.js
│       ├── validations/role.validation.js
│       ├── validations/admin.validation.js
│       ├── services/auth.service.js
│       ├── services/role.service.js
│       ├── services/admin.service.js
│       ├── services/user.service.js
│       ├── controllers/auth.controller.js
│       ├── controllers/role.controller.js
│       ├── controllers/admin.controller.js
│       ├── controllers/user.controller.js
│       └── routes/index.js
│       └── routes/auth.routes.js
│       └── routes/role.routes.js
│       └── routes/admin.routes.js
│       └── routes/user.routes.js
└── frontend/
    ├── package.json
    ├── .env.example
    ├── .env.local
    ├── prettier.config.mjs
    └── src/
        ├── app/(auth)/login/page.tsx
        ├── app/(dashboard)/layout.tsx
        ├── app/(dashboard)/page.tsx
        ├── app/(dashboard)/roles/page.tsx
        ├── app/(dashboard)/admins/page.tsx
        ├── app/(dashboard)/users/page.tsx
        ├── components/layout/app-sidebar.tsx
        ├── features/auth/*
        ├── features/roles/*
        ├── features/admins/*
        ├── features/users/*
        ├── lib/api/client.ts
        ├── lib/api/auth.ts
        ├── lib/auth/token.ts
        ├── lib/query/client.ts
        ├── providers/app-providers.tsx
        └── types/api.ts
```

---

### Task 1: Repo scaffolding + Postgres

**Files:**
- Create: `docker-compose.yml`, `.gitignore`, `README.md`, `.prettierrc`
- Create: `backend/package.json`, `backend/.env.example`, `backend/.env`, `backend/.sequelizerc`, `backend/eslint.config.js`
- Create: `backend/src/config/env.js`, `backend/src/config/database.js`, `backend/src/server.js`, `backend/src/app.js` (minimal)

**Interfaces:**
- Produces: `getEnv()` returning `{ port, nodeEnv, jwtSecret, jwtExpiresIn, db }`
- Produces: Sequelize instance via `src/config/database.js` / models index later
- Produces: Docker Postgres on `localhost:5434`, DB `waow_backend`

- [ ] **Step 1: Create root docker-compose and gitignore**

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: waow_backend
    ports:
      - "5434:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
```

```gitignore
node_modules/
.env
.env.local
dist/
.next/
uploads/
coverage/
*.log
.DS_Store
```

- [ ] **Step 2: Scaffold backend package.json and env**

`backend/package.json` scripts: `dev` (nodemon), `start`, `lint`, `db:migrate`, `db:migrate:undo`, `db:seed`  
Dependencies: `express`, `cors`, `dotenv`, `sequelize`, `pg`, `pg-hstore`, `joi`, `jsonwebtoken`, `bcryptjs`  
Dev: `nodemon`, `sequelize-cli`, `eslint`, `prettier`

`.env` / `.env.example`:

```
PORT=3000
NODE_ENV=development
JWT_SECRET=waow-admin-dev-secret-change-me
JWT_EXPIRES_IN=7d
DB_HOST=127.0.0.1
DB_PORT=5434
DB_NAME=waow_backend
DB_USER=postgres
DB_PASSWORD=postgres
```

- [ ] **Step 3: pnpm install + start Postgres**

```bash
cd backend && pnpm install
cd .. && docker compose up -d
docker compose ps
```

Expected: Postgres healthy/up on `5434`.

- [ ] **Step 4: Commit**

```bash
git add docker-compose.yml .gitignore .prettierrc README.md backend
git commit -m "chore: scaffold backend and Postgres compose"
```

---

### Task 2: Models, migrations, seeders

**Files:**
- Create: all files under `backend/src/models/`, `backend/src/migrations/`, `backend/src/seeders/`
- Create: `backend/src/utils/password.js`

**Interfaces:**
- Produces: models `User`, `Role`, `Admin` with associations `Admin.belongsTo(Role)`, `Role.hasMany(Admin)`
- Produces: `hashPassword(plain: string): Promise<string>`, `comparePassword(plain, hash): Promise<boolean>`
- Produces: seeded roles `SUPER_ADMIN`, `NORMAL` and admin `superadmin`

- [ ] **Step 1: Implement password helpers**

```js
// backend/src/utils/password.js
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;
async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}
async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
module.exports = { hashPassword, comparePassword };
```

- [ ] **Step 2: Write migrations matching spec columns**

Order: users → roles → admins (`role_id` FK, `is_deleted` default false, `deleted_at` null).

- [ ] **Step 3: Write models + `models/index.js` wiring Sequelize**

Use `underscored: true`, `tableName` explicit. Default scope on Admin: `where: { is_deleted: false }` OR filter in services (prefer explicit filter in services so soft-deleted rows stay queryable for audits if needed — **use service filters**, no default scope).

- [ ] **Step 4: Seeder**

Create roles with permissions JSON from spec. Hash `123456` for `superadmin`. Idempotent: skip if username exists.

- [ ] **Step 5: Migrate + seed**

```bash
cd backend && pnpm db:migrate && pnpm db:seed
```

Expected: success, no errors.

- [ ] **Step 6: Commit**

```bash
git commit -am "feat(backend): add users/roles/admins schema and superadmin seeder"
```

---

### Task 3: Response helpers, errors, middlewares

**Files:**
- Create: `backend/src/utils/response.js`, `backend/src/utils/errors.js`, `backend/src/utils/jwt.js`
- Create: `backend/src/middlewares/errorHandler.js`, `authenticate.js`, `authorize.js`, `validate.js`

**Interfaces:**
- Produces: `success(res, data, message?)`, `fail(res, status, code, message, data?)`
- Produces: `AppError` with `{ status, code, message, data }`
- Produces: `signToken({ adminId, roleId, roleName })`, `verifyToken(token)`
- Produces: `authenticate` sets `req.admin`
- Produces: `requireSuperAdmin`, `requirePermission(module, action)` where action is `can_view|can_create|can_update|can_delete`
- Produces: `validate(schema)` — Joi object with `.unknown(false)`

- [ ] **Step 1: Implement response + AppError + jwt + middlewares** (full implementations in those files)

- [ ] **Step 2: Wire minimal `app.js` with health route and error handler**

```js
app.get('/api/v1/health', (req, res) => success(res, { ok: true }));
```

- [ ] **Step 3: Smoke health**

```bash
curl -s http://localhost:3000/api/v1/health
```

Expected: `{"error":false,"code":0,"message":"Success","data":{"ok":true}}`

- [ ] **Step 4: Commit**

```bash
git commit -am "feat(backend): add response envelope, auth middlewares, and validation"
```

---

### Task 4: Auth + Role + Admin + User APIs

**Files:**
- Create: all `validations/*`, `services/*`, `controllers/*`, `routes/*`
- Modify: `backend/src/app.js` to mount `routes` at `/api/v1`

**Interfaces:**
- `authService.login({ username, password })` → `{ token, admin }`
- `roleService.list|create|update|remove`
- `adminService.list|create|update|softDelete|resetPassword`
- `userService.list`
- Routes as in spec table

- [ ] **Step 1: Auth login**

POST `/api/v1/auth/login` body `{ username, password }` → JWT. Reject soft-deleted / bad password with `AUTH_ERR_*`.

- [ ] **Step 2: Role CRUD (SUPER_ADMIN)**

Validate `name` + `permissions` shape with Joi (both modules, four booleans each).

- [ ] **Step 3: Admin CRUD + soft delete + reset password**

Create/update use transaction when writing admin row. Never return password hash. Reset password: SUPER_ADMIN only.

- [ ] **Step 4: Users list**

GET `/api/v1/users` with `user_module.can_view`.

- [ ] **Step 5: Manual API smoke with curl**

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"superadmin","password":"123456"}' | jq -r '.data.token')
curl -s http://localhost:3000/api/v1/admins -H "Authorization: Bearer $TOKEN"
curl -s http://localhost:3000/api/v1/roles -H "Authorization: Bearer $TOKEN"
curl -s http://localhost:3000/api/v1/users -H "Authorization: Bearer $TOKEN"
```

Expected: login succeeds; lists return envelope with `error: false`.

- [ ] **Step 6: Commit**

```bash
git commit -am "feat(backend): implement /api/v1 auth, roles, admins, users"
```

---

### Task 5: Frontend scaffold + shared lib

**Files:**
- Create: Next.js app in `frontend/` via `pnpm create next-app` (App Router, TS, Tailwind, ESLint, no src-less — use `src/`)
- Add: axios, @tanstack/react-query, react-hook-form, zod, @hookform/resolvers, lucide-react, prettier
- Init shadcn; add button, input, label, card, table, dialog, form, select, sonner, dropdown-menu, separator, sheet
- Create: `src/lib/api/client.ts`, `src/lib/auth/token.ts`, `src/lib/query/client.ts`, `src/types/api.ts`, `src/providers/app-providers.tsx`

**Interfaces:**
- `apiClient`: Axios instance, baseURL `process.env.NEXT_PUBLIC_API_URL + '/api/v1'`, Bearer from `getToken()`, unwraps envelope or throws with `code/message`
- `ApiResponse<T> = { error: boolean; code: number | string; message: string; data: T }`
- `setToken` / `getToken` / `clearToken` via `localStorage` key `waow_admin_token`

- [ ] **Step 1: Scaffold Next app + deps + shadcn**

```bash
pnpm create next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --turbopack
cd frontend && pnpm add axios @tanstack/react-query react-hook-form zod @hookform/resolvers lucide-react sonner next-themes class-variance-authority clsx tailwind-merge
# init shadcn and add components listed above
```

- [ ] **Step 2: Implement Axios client + providers + types**

- [ ] **Step 3: Commit**

```bash
git add frontend && git commit -m "chore(frontend): scaffold Next.js admin app with shared API client"
```

---

### Task 6: Auth UI + dashboard shell

**Files:**
- Create: login page, dashboard layout/sidebar, auth guard, logout
- Create: `features/auth/login-form.tsx`, `features/auth/use-login.ts`, `lib/api/auth.ts`

**Interfaces:**
- `login(username, password)` → stores token + optional admin profile in localStorage
- Protected layout redirects to `/login` if no token

- [ ] **Step 1: Build login form (RHF+Zod) and dashboard layout with sidebar links**

- [ ] **Step 2: Verify in browser/curl that login stores token and dashboard loads**

- [ ] **Step 3: Commit**

```bash
git commit -am "feat(frontend): add login and dashboard shell"
```

---

### Task 7: Roles, Admins, Users pages

**Files:**
- Create: `features/roles/*`, `features/admins/*`, `features/users/*`
- Create: pages under `(dashboard)/roles`, `admins`, `users`

**Interfaces:**
- Query keys: `['roles']`, `['admins']`, `['users']`
- Mutations invalidate respective keys
- Hide role management / reset password unless `roleName === 'SUPER_ADMIN'`
- Hide admin mutations based on permission flags from `/auth/login` response (include `permissions` + `roleName` in login `data`)

**Note:** Extend login `data` to return `{ token, admin: { id, username, roleName, permissions } }` so UI can gate buttons.

- [ ] **Step 1: Roles page — table + create/edit/delete dialogs**

- [ ] **Step 2: Admins page — CRUD soft-delete + reset password dialog**

- [ ] **Step 3: Users page — read-only table**

- [ ] **Step 4: Manual UI smoke** — login as superadmin, exercise each page

- [ ] **Step 5: Commit**

```bash
git commit -am "feat(frontend): add roles, admins, and users admin pages"
```

---

### Task 8: README polish + full run verification

**Files:**
- Modify: root `README.md`, `backend/README.md` (optional short), `frontend/.env.example`

- [ ] **Step 1: Document install/migrate/seed/dev for both apps**

- [ ] **Step 2: Full run**

```bash
docker compose up -d
cd backend && pnpm install && pnpm db:migrate && pnpm db:seed && pnpm dev
cd frontend && pnpm install && pnpm dev
```

Expected: API health OK; UI at `:3001` login works with `superadmin` / `123456`.

- [ ] **Step 3: Final commit**

```bash
git commit -am "docs: add run instructions for Waow Admin"
```

---

## Spec coverage checklist

| Spec item | Task |
| --- | --- |
| users/roles/admins schema + soft delete | 2 |
| SUPER_ADMIN / NORMAL seeder | 2 |
| JWT login | 4 |
| Role CRUD SUPER_ADMIN | 4 |
| Admin CRUD + reset password | 4 |
| Users list read-only | 4 |
| Envelope + validation unknown fields | 3–4 |
| Frontend full panel | 5–7 |
| pnpm both apps | 1, 5 |
| Run locally | 8 |

## Self-review notes

- No OTP scope creep
- Login response must include `permissions` + `roleName` for UI gating (added in Task 7 note; implement in Task 4 login payload)
- Role delete optional in PDF — included
