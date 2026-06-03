# Internship Management Platform (IMP)

A full-stack MERN application connecting **Students**, **Companies**, **Mentors**, and **Administrators**.

## Quick Start

### Prerequisites
- Node.js 20+
- **Redis** (required for refresh tokens, caching, rate limits, email queue)
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (connection string in `.env`)
- [Cloudinary](https://cloudinary.com) account (for profile pictures & resumes)

### 1. Configure environment
```bash
cd backend
cp .env.example .env
# Edit .env: MONGODB_URI (Atlas), JWT secrets, Cloudinary credentials
```

### 2. Redis
```bash
# From project root — pick one:
docker compose up -d redis
# OR on macOS with Homebrew:
brew install redis && brew services start redis
```

Default URL: `redis://127.0.0.1:6379` (set `REDIS_URL` in `backend/.env` if different).

### 3. Backend
```bash
cd backend
npm install
npm run seed           # demo data
npm run dev            # http://localhost:5001
```

If you see **`EADDRINUSE` port 5001**, another API process is still running:
```bash
cd backend && npm run kill-port && npm run dev
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@imp.com | Admin123! |

If admin login fails (user missing), run: `cd backend && npm run ensure-admin` (or `npm run seed` to reset all demo data).
| Company HR | hr@acme.com | Company123! |
| Student | student@university.edu | Student123! |

## Features (MVP)

- Public landing, browse internships, about/contact
- JWT auth (register/login)
- Student: dashboard, apply, track applications, submit tasks, profile
- Company HR: post internships, manage candidates, assign tasks, pipeline status
- Admin: analytics, user management, company approval, internship moderation
- In-app notifications
- Dark mode

## Project Structure

```
├── backend/     # Express API + MongoDB
├── frontend/    # React + Vite + MUI + RTK Query
├── docs/        # Architecture & design docs
└── docker-compose.yml
```

## Storage architecture

- **MongoDB Atlas** — users, students, companies, internships, applications, tasks, notifications, auth
- **Cloudinary** — profile pictures & resume files (MongoDB stores URLs + metadata only)

See [docs/STORAGE.md](./docs/STORAGE.md) for details.

## Deploy on VPS

See **[docs/DEPLOY-VPS.md](./docs/DEPLOY-VPS.md)** for Ubuntu + Nginx + PM2 + Redis + HTTPS.

## API

Base URL: `http://localhost:5001/api/v1`

See [docs/05-API.md](./docs/05-API.md) for full API reference.

## Design Documentation

| Doc | Description |
|-----|-------------|
| [PRD](./docs/01-PRD.md) | Product requirements |
| [System Design](./docs/03-SYSTEM-DESIGN.md) | Architecture diagrams |
| [Database](./docs/04-DATABASE.md) | MongoDB schemas |
