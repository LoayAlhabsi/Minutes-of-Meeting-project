# Minutes of Meeting

```
trainee project/
  frontend/   → React + Vite + TypeScript
  backend/    → Spring Boot + Firebase Firestore + JWT auth
```

## Roles

| Role | Code | Access |
|------|------|--------|
| User | `U` | Create/edit/delete **own** minutes |
| Admin | `A` | Dashboard: all minutes (with who created them), users, stats, promote/demote, disable accounts |

**Create account** always creates role `U` and opens the user page. Admins are seeded manually, then can promote other users.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at http://localhost:5173

Folders:

- `src/auth` — login, register, JWT session
- `src/pages/user` — user pages, form, list
- `src/pages/admin` — admin sidebar + pages (dashboard, users, meetings, document format)
- `src/api` — HTTP clients

## Backend

1. Add Firebase service account as:
   `backend/src/main/resources/serviceAccountKey.json`
2. Run:

```bash
cd backend
.\mvnw.cmd spring-boot:run
```

API at http://localhost:8080/api

### Seed the first admin (manual)

1. Generate a password hash:

```bash
cd backend
.\mvnw.cmd -q exec:java "-Dexec.mainClass=om.gov.moh.minutes.util.PasswordHashGenerator" "-Dexec.args=Admin@123"
```

2. In Firebase Console → Firestore → collection `users` → Add document (auto ID) with fields:

| Field | Value |
|-------|--------|
| `name` | `Admin` |
| `email` | `admin@moh.gov.om` (lowercase) |
| `passwordHash` | *(paste BCrypt hash from step 1)* |
| `role` | `A` |
| `enabled` | `true` (boolean) |
| `createdAt` | `2026-08-09T00:00:00Z` (string) |

Example hash for password `Admin@123`:

```
$2a$10$6q5.ygOaw4SnDAhp5uqUOeA6ZNmDDrdL/Wt.tE2k9nhijJytdlBvG
```

3. Login on the frontend with that email/password → admin dashboard.

### Auth API

- `POST /api/auth/register` — create user (`U`)
- `POST /api/auth/login` — returns JWT + user
- `GET/POST/PUT/DELETE /api/minutes` — authenticated; users scoped to own records
- `GET /api/admin/users` — list users
- `POST /api/admin/users` — create user `{ name, email, password, role }`
- `PUT /api/admin/users/{id}/role` — `{ "role": "A" | "U" }`
- `PUT /api/admin/users/{id}/enabled` — `{ "enabled": true|false }`
- `GET /api/admin/stats`
- `GET /api/admin/minutes?title=&user=&dateFrom=&dateTo=`

Admin UI routes: `/admin`, `/admin/users`, `/admin/users/create`, `/admin/meetings`, `/admin/document-format`
