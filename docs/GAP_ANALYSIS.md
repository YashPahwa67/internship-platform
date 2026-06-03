# Spec vs Implementation — Gap Analysis

**Last updated:** June 2026 (post wiring sprint)

## Legend
| Status | Meaning |
|--------|---------|
| Done | Implemented |
| Partial | Exists but not to spec |
| Missing | Not implemented |
| Deferred | Intentionally later (large refactor) |

---

## Backend

| Requirement | Status | Notes |
|-------------|--------|-------|
| Express + Mongoose | Done | |
| MongoDB Atlas + indexes | Done | Listing, company, skills, text indexes |
| **Redis (ioredis)** | Done | Cache, refresh tokens, rate limits |
| **Bull job queues** | Done | `emailQueue.js`, `emailWorker.js`, `npm run worker:email` |
| **Zod validation** | Partial | Zod `env.js`; Joi still on routes |
| **Winston logging** | Done | |
| **Morgan structured** | Done | JSON request logs |
| Multer + Cloudinary | Done | S3 spec → Cloudinary |
| JWT access + refresh | Done | Refresh in Redis + httpOnly cookie |
| RBAC authorize | Done | |
| Rate limit Redis | Done | Global, login, apply tiers |
| Cache-aside Redis | Done | Internship list + invalidation |
| Cursor pagination | Done | `GET /api/v1/internships` |
| Mongo transactions (apply) | Done | `application.service.js` |
| Security stack | Done | helmet, sanitize, xss, hpp, compression |
| Health + graceful shutdown | Done | `/health`, SIGTERM/SIGINT |
| ApiResponse shape | Partial | Class exists; controllers use `{ success, data }` |
| `modules/` folder layout | Deferred | Flat `controllers/` / `services/` |
| Email verification / password reset | Missing | Phase 2 |
| Nodemailer real SMTP | Partial | Queue + log; set `SMTP_*` in `.env` |
| S3 presigned URLs | N/A | Cloudinary |

## Frontend

| Requirement | Status | Notes |
|-------------|--------|-------|
| React 18 + Vite | Done | |
| **TanStack Query v5** | Missing | RTK Query |
| **Zustand** | Missing | Redux auth slice |
| **Tailwind CSS** | Missing | MUI + design tokens |
| React Hook Form + Zod | Partial | |
| **Axios + refresh interceptor** | Missing | RTK Query; backend supports `POST /auth/refresh-token` |
| Feature folders | Done | |
| Premium UI | Done | |

## Roles

| Role | Status |
|------|--------|
| Student | Done |
| Company | Done (`company_hr`) |
| Admin | Done |
| Mentor | Partial |

## Run locally (new dependencies)

```bash
# Redis required for refresh tokens, cache, rate limits
docker compose up -d redis   # or install Redis locally

cd backend && npm install
npm run dev                  # API
npm run worker:email         # optional email worker
```

Add to `backend/.env` if needed:
`REDIS_URL=redis://127.0.0.1:6379`

## Recommended next sprints

1. Frontend: TanStack Query + Axios refresh interceptor (call `/api/v1/auth/refresh-token`)
2. Auth: email verification + password reset
3. Migrate Joi validators → Zod schemas per module
4. Nodemailer HTML templates + production SMTP
