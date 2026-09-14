# WAOW Admin — ຄູ່ມືໂຄງສ້າງ Backend

**ສຳລັບນຳສະເໜີ / ສອບພາດ**  
Repository: https://github.com/souksanDev1/waow-admin-task  
ອະທິບາຍໂຟລເດີ ແລະ ການເຮັດວຽກຂອງໂຄດ Backend ເປັນພາສາລາວ

---

## 1. Backend ແມ່ນຫຍັງ

Backend ນີ້ແມ່ນ **REST Admin API** ທີ່ສ້າງດ້ວຍ:

- **Node.js + Express** — ເຊີບເວີ HTTP
- **PostgreSQL + Sequelize** — ຖານຂໍ້ມູນ ແລະ ORM
- **JWT** — ຢືນຢັນຕົວຕົນ admin
- **RBAC** — ຄວບຄຸມສິດຕາມ role (permissions ແບບ JSON ແບບເຄື່ອນໄຫວ)
- **pnpm** — package manager

ພາທ Base ຂອງ API: `/api/v1`  
ພອດເລີ່ມຕົ້ນ: `3002`  
ຖານຂໍ້ມູນຮ່ວມກັບ User API: Postgres ທີ່ `localhost:5434`, ຊື່ DB `waow_backend`

### ຟັງຊັນຫຼັກ

1. Admin login (username + password → JWT)
2. ຈັດການ Role (permissions ແບບ dynamic)
3. Admin CRUD ພ້ອມ **soft delete**
4. Reset password (ສະເພາະ SUPER_ADMIN)
5. ລາຍການ users ຈາກຕາຕະລາງ `users` ທີ່ແຊร์ (ອ່ານຢ່າງດຽວ)

---

## 2. ການໄຫຼຂອງ Request (ສຳຄັນທີ່ສຸດ ຄວນຈື່)

ທຸກ request ທີ່ຕ້ອງ auth ຈະໄຫຼແບບນີ້:

```text
Client (Frontend / Postman)
    → routes          (URL + HTTP method)
    → middlewares     (validate, JWT, RBAC)
    → controllers     (ຊັ້ນ HTTP ບາງໆ)
    → services        (ທຸລະກິດ / business logic)
    → models          (Sequelize ↔ PostgreSQL)
    → response JSON   { error, code, message, data }
```

ຖ້າຜິດພາດ, `errorHandler` ຈະແປງເປັນ error envelope ມາດຕະຖານ

**ເຄັດສອບພາດ:** ບອກວ່າ controller ບາງ; **service** ຄຸ້ມກົດທຸລະກິດ ແລະ transaction

---

## 3. ໂຟລເດີລະດັບ `backend/`

| ເສັ້ນທາງ | ຈຸດປະສົງ |
| --- | --- |
| `package.json` | ສະຄຣິບ (`dev`, `db:migrate`, `db:seed`, `lint`) ແລະ dependencies |
| `.env` / `.env.example` | ພອດ, JWT secret, ການເຊື່ອມຕໍ່ DB (ບໍ່ commit ໄຟລ `.env`) |
| `.sequelizerc` | ບອກ sequelize-cli ວ່າ config / models / migrations / seeders ຢູ່ໃສ |
| `eslint.config.js` | ກົດ lint |
| `src/` | ໂຄດທັງໝົດຂອງແອັບ |

---

## 4. ຈຸດເລີ່ມຕົ້ນຂອງແອັບ

### `src/server.js`

- ໂຫຼດ Express app
- ເຊື່ອມຕໍ່ DB ດ້ວຍ `sequelize.authenticate()`
- ເປີດ listen ທີ່ `PORT` (3002)

ນີ້ແມ່ນສິ່ງທີ່ `pnpm dev` / `nodemon` ຣັນ

### `src/app.js`

- ສ້າງ Express application
- ເປີດ `cors`, ອ່ານ JSON body
- mount route ທັງໝົດພາຍໃຕ້ `/api/v1`
- ຈັດການ route ທີ່ບໍ່ພົບ (404)
- ຕິດ `errorHandler` ທົ່ວໂລກ

---

## 5. `src/config/` — ການຕັ້ງຄ່າ

| ໄຟລ | ໜ້າທີ່ |
| --- | --- |
| `env.js` | ອ່ານ env (port, JWT, DB) ໃຫ້ສ່ວນອື່ນໃຊ້ |
| `database.js` | ການຕັ້ງຄ່າເຊື່ອມຕໍ່ Sequelize / sequelize-cli |

ເກັບຄ່າສະພາບແວດລ້ອມໄວ້ບ່ອນດຽວ ບໍ່ປະປົນໃນ business code

---

## 6. `src/routes/` — ແຜນທີ່ URL

Routes ຕອບຄຳຖາມ: **URL ໃດໄປໃສ ແລະ ໃຊ້ middleware ໃດ**

| ໄຟລ | ໜ້າທີ່ |
| --- | --- |
| `index.js` | ລວມ router ທັງໝົດ + `GET /health` |
| `auth.routes.js` | `POST /auth/login` (ສາທາລະນະ) |
| `role.routes.js` | `/roles` — ຕ້ອງ JWT + **SUPER_ADMIN** |
| `admin.routes.js` | `/admins` — ຕ້ອງ JWT + ສິດ `admin_module` |
| `user.routes.js` | `GET /users` — ຕ້ອງ JWT + `user_module.can_view` |

### Endpoint ສຳຄັນ

| Method | Path | ສິດເຂົ້າເຖິງ |
| --- | --- | --- |
| POST | `/api/v1/auth/login` | ສາທາລະນະ |
| CRUD | `/api/v1/roles` | SUPER_ADMIN |
| CRUD | `/api/v1/admins` | ຕາມ permission |
| POST | `/api/v1/admins/:id/reset-password` | SUPER_ADMIN |
| GET | `/api/v1/users` | `user_module.can_view` |
| GET | `/api/v1/health` | ສາທາລະນະ |

---

## 7. `src/middlewares/` — ປະຕູຄວາມປອດໄພ ແລະ ກວດຂໍ້ມູນ

| ໄຟລ | ເຮັດຫຍັງ |
| --- | --- |
| `validate.js` | ກວດ body ດ້ວຍ Joi; ປະຕິເສດຟິວທີ່ບໍ່ຮູ້ຈັກ (`VALIDATION_ERR_UNKNOWN_FIELD`) |
| `authenticate.js` | ອ່ານ `Authorization: Bearer <token>`, ຢືນຢັນ JWT, ໂຫຼດ admin + role ໃສ່ `req.auth` |
| `authorize.js` | `requireSuperAdmin` ແລະ `requirePermission(module, action)` ສຳລັບ RBAC |
| `errorHandler.js` | ແປງ error ເປັນ `{ error: true, code, message, data }` |

**ເຄັດສອບພາດ:**  
Authentication = “ເຈົ້າແມ່ນໃຜ?”  
Authorization = “ເຈົ້າເຮັດຫຍັງໄດ້ບໍ?”

---

## 8. `src/validations/` — ກົດຂໍ້ມູນເຂົ້າ

### `schemas.js`

Schema Joi ສຳລັບ:

- Login (`username`, `password`)
- ສ້າງ / ແກ້ role (`name`, ຮູບແບບ `permissions`)
- ສ້າງ / ແກ້ admin
- Reset password

ທຸກ schema ໃຊ້ `.unknown(false)` ເພື່ອປະຕິເສດຟິວເກີນ (ຕາມເອກະສານວຽກ)

---

## 9. `src/controllers/` — ຊັ້ນ HTTP

Controller ເຮັດພຽງ:

1. ອ່ານ `req.body` / `req.params` / `req.auth`
2. ເອີ້ນ **service** ທີ່ກົງກັນ
3. ສົ່ງຄືນ `success(res, data, message)`

ບໍ່ໃສ່ logic ທຸລະກິດໜັກ

| ໄຟລ | ຈັດການ |
| --- | --- |
| `auth.controller.js` | Login |
| `role.controller.js` | ລາຍການ / ສ້າງ / ແກ້ / ລຶບ role |
| `admin.controller.js` | CRUD admin + soft delete + reset password |
| `user.controller.js` | ລາຍການ users |

---

## 10. `src/services/` — Business logic (ຫຼັກຂອງລະບົບ)

ໂຟລເດີນີ້ສຳຄັນທີ່ສຸດເມື່ອອະທິບາຍໂປຣເຈັກ

| ໄຟລ | ໜ້າທີ່ |
| --- | --- |
| `auth.service.js` | ຫາ admin ທີ່ບໍ່ຖືກ soft-delete, ທຽບລະຫັດ, ອອກ JWT, ສົ່ງ profile + permissions |
| `role.service.js` | CRUD role; ປົກປ້ອງ role ລະບົບ `SUPER_ADMIN` / `NORMAL`; ຫ້າມລຶບຖ້າຍັງມີ admin ໃຊ້ຢູ່ |
| `admin.service.js` | CRUD admin (ໃຊ້ transaction ເມື່ອຈຳເປັນ); soft delete; reset password |
| `user.service.js` | ອ່ານຕາຕະລາງ `users` ຢ່າງດຽວ (ແຊร์ກັບ User API) |

### Soft delete (admins)

ເມື່ອລຶບ admin:

- ຕັ້ງ `is_deleted = true`
- ຕັ້ງ `deleted_at = now`
- **ບໍ່** ລຶບແຖວອອກຈາກຖານຂໍ້ມູນຖາວອນ
- admin ທີ່ soft-delete ແລ້ວ login ບໍ່ໄດ້ ແລະ ບໍ່ຂຶ້ນໃນລາຍການປົກກະຕິ

### Transaction

ການສ້າງ/ແກ້ admin ໃຊ້ Sequelize transaction ເພື່ອກັນຂໍ້ມູນຄ້າງຄຶງເຄິ່ງໆ

---

## 11. `src/models/` — ແຜນທີ່ຕາຕະລາງ

| ໄຟລ | ຕາຕະລາງ / ຄວາມໝາຍ |
| --- | --- |
| `index.js` | ໂຫຼດ model, ຜູກ associate, export `sequelize` |
| `user.js` | `users` (ແຊร์ກັບ User API; ອ່ານຢ່າງດຽວໃນວຽກນີ້) |
| `role.js` | `roles` ພ້ອມ JSONB `permissions` |
| `admin.js` | `admins` ພ້ອມຟິວ soft-delete + `toSafeJSON()` (ບໍ່ສົ່ງ password hash) |

### ຄວາມສຳພັນ

- `Admin.belongsTo(Role)`
- `Role.hasMany(Admin)`

### ຕົວຢ່າງ Permissions JSON

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

---

## 12. `src/migrations/` — ສ້າງ/ປັບໂຄງຕາຕະລາງ

ຣັນດ້ວຍ: `pnpm db:migrate`

| Migration | ຜົນ |
| --- | --- |
| `...create-users.js` | ສ້າງ `users` **ເມື່ອຍັງບໍ່ມີ** (ຂ້າມຖ້າ User API ສ້າງໄວ້ແລ້ວ) |
| `...create-roles.js` | ສ້າງ `roles` |
| `...create-admins.js` | ສ້າງ `admins` ພ້ອມ FK ໄປ `roles` |

ອະນຸຍາດໃຫ້ຕອບເງື່ອນໄຂ: **ໃຊ້ຖານຂໍ້ມູນດຽວກັນກັບໂປຣເຈັກ User API**

---

## 13. `src/seeders/` — ຂໍ້ມູນເລີ່ມຕົ້ນ

### `default-roles-and-superadmin.js`

ຣັນດ້ວຍ: `pnpm db:seed`

ສ້າງ (ຖ້າຍັງບໍ່ມີ):

1. Role `SUPER_ADMIN` — ສິດເຕັມ
2. Role `NORMAL` — ເບິ່ງເທົ່ານັ້ນ (ບໍ່ສ້າງ/ແກ້/ລຶບ)
3. Admin `superadmin` / `123456` (hash ດ້ວຍ bcrypt) ຜູກ SUPER_ADMIN

---

## 14. `src/utils/` — ເຄື່ອງມືຮ່ວມ

| ໄຟລ | ໜ້າທີ່ |
| --- | --- |
| `response.js` | ຮູບແບບ JSON success / fail ມາດຕະຖານ |
| `errors.js` | `AppError` ພ້ອມ status + error code |
| `jwt.js` | ເຊັນ ແລະ ກວດ JWT |
| `password.js` | hash / ທຽບລະຫັດດ້ວຍ bcrypt |

### ຮູບແບບ Response (ຕາມເອກະສານວຽກ)

ສຳເລັດ:

```json
{
  "error": false,
  "code": 0,
  "message": "Success",
  "data": {}
}
```

ລົ້ມເຫຼວ:

```json
{
  "error": true,
  "code": "ADMIN_ERR_001",
  "message": "Error message here",
  "data": {}
}
```

---

## 15. ສະຄຣິບອະທິບາຍ 60 ວິນາທີ

> “Backend ໃຊ້ Express ແບບ clean architecture.  
> Routes ກຳນົດ URL. Middlewares ຈັດການ validation, JWT authentication ແລະ RBAC authorization.  
> Controllers ບາງ. Services ມີ logic ທຸລະກິດ ເຊັ່ນ soft delete ແລະ transaction.  
> Models ແຜນທີ່ໄປຕາຕະລາງ PostgreSQL `users`, `roles`, ແລະ `admins`.  
> ພວກເຮົາໃຊ້ຖານຂໍ້ມູນດຽວກັບ User API: ໃຊ້ `users` ຊ້ຳ ແລະ ເພີ່ມຕາຕະລາງ admin/role.  
> ມີ seeder ສ້າງ superadmin ສຳລັບ login ແລະທຸກ response ໃຊ້ JSON envelope ມາດຕະຖານ.”

---

## 16. ຄຳຖາມທີ່ມັກພົບໃນການສອບພາດ ແລະ ຄຳຕອບສັ້ນ

**ຖາມ: ເປັນຫຍັງແຍກ controller ກັບ service?**  
ຕອບ: Controller ຈັດການແຕ່ HTTP; Service ເກັບກົດທຸລະກິດໃຫ້ນຳໃຊ້ຊ້ຳ ແລະ ທົດສອບງ່າຍ

**ຖາມ: RBAC ເຮັດວຽກແນວໃດ?**  
ຕອບ: ແຕ່ລະ role ເກັບ permissions ເປັນ JSON. Middleware ກວດທຸງ `admin_module` / `user_module`. SUPER_ADMIN ຜ່ານທຸກສິດ

**ຖາມ: Soft delete ແມ່ນຫຍັງ?**  
ຕອບ: ແຖວ admin ຖືກໝາຍລຶບດ້ວຍ `is_deleted` ແລະ `deleted_at` ບໍ່ໄດ້ລຶບອອກຈາກ DB ຖາວອນ

**ຖາມ: ເປັນຫຍັງຕ້ອງແຊร์ DB ກັບ User API?**  
ຕອບ: ເອກະສານກຳນົດໃຫ້ໃຊ້ຖານຂໍ້ມູນດຽວກັນ ເພື່ອໃຫ້ admin ເບິ່ງ users ຈິງຈາກຕາຕະລາງ `users`

**ຖາມ: ລະຫັດຜ່ານເກັບແນວໃດ?**  
ຕອບ: ເກັບແຕ່ bcrypt hash; ບໍ່ສົ່ງຄືນໃນ API response

**ຖາມ: ຖ້າສົ່ງຟິວທີ່ບໍ່ຮູ້ຈັກຈະເກີດຫຍັງ?**  
ຕອບ: Joi ປະຕິເສດດ້ວຍ `VALIDATION_ERR_UNKNOWN_FIELD`

---

## 17. ແຜນທີ່ໂປຣເຈັກ (ສະເພາະ Backend)

```text
backend/
|-- package.json
|-- .env.example
|-- .sequelizerc
`-- src/
    |-- server.js              ເລີ່ມໂປຣເຊດ
    |-- app.js                 ປະກອບ Express
    |-- config/                Env + DB config
    |-- routes/                ແຜນທີ່ URL
    |-- middlewares/           Auth, RBAC, validate, errors
    |-- validations/           Joi schemas
    |-- controllers/           ຊັ້ນ HTTP
    |-- services/              Business logic
    |-- models/                Sequelize models
    |-- migrations/            ປ່ຽນໂຄງຕາຕະລາງ
    |-- seeders/               Role ເລີ່ມຕົ້ນ + superadmin
    `-- utils/                 Response, JWT, password, AppError
```

---

**Repository:** https://github.com/souksanDev1/waow-admin-task

ຈົບຄູ່ມືໂຄງສ້າງ Backend (ພາສາລາວ)
