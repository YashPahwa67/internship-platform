# Deploy on Vercel + Render (your setup)

| What | URL |
|------|-----|
| **Frontend (Vercel)** | https://internship-platform-eight.vercel.app |
| **Backend (Render)** | https://imp-api-vfem.onrender.com |

---

## One thing you must do on Render (Redis / Upstash)

Your API shows `"redis":"unhealthy"` because **`REDIS_URL` is not set on Render** — it defaults to `localhost:6379`, which does not exist on Render.

### A. Create Upstash Redis (free)

1. Go to **[console.upstash.com](https://console.upstash.com)** → sign in
2. **Create Database**
   - Name: `imp-redis` (any name)
   - Type: **Regional**
   - Region: pick one close to Render (e.g. **US East**)
3. Click your new database
4. On the database page, find **Connect** / connection details
5. Copy the **Redis URL** (TCP) — it must look like:
   ```text
   rediss://default:AbCdEf123...@us1-xxxxx.upstash.io:6379
   ```
   Important: starts with **`rediss://`** (with double s = TLS), NOT `redis://`

### B. Paste into Render

1. **[Render Dashboard](https://dashboard.render.com)** → **imp-api**
2. Left sidebar → **Environment**
3. Click **Add Environment Variable** and set:

   | Key | Value |
   |-----|--------|
   | `REDIS_URL` | paste full Upstash URL |
   | `NODE_ENV` | `production` |
   | `CLIENT_URL` | `https://internship-platform-eight.vercel.app` |
   | `ALLOWED_ORIGINS` | `https://internship-platform-eight.vercel.app` |

4. **Do not** wrap the URL in quotes
5. **Do not** add spaces before/after
6. Click **Save Changes** — wait for redeploy (~1–2 min)

### C. Verify

Open: **https://imp-api-vfem.onrender.com/health**

Success looks like:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "db": "healthy",
    "redis": "healthy"
  }
}
```

Render logs should show: **`Redis connected`** with your Upstash hostname (not `ECONNREFUSED on port 6379`).

### Common mistakes

| Mistake | Fix |
|--------|-----|
| Using `redis://` instead of `rediss://` | Copy the TLS URL from Upstash |
| Using REST URL (`https://...upstash.io`) | Use the **Redis TCP URL**, not REST |
| Variable name wrong | Must be exactly `REDIS_URL` |
| Forgot to Save on Render | Save triggers redeploy |
| Deploy still failing | Check Logs tab for the exact Redis error message |

---

## Already done in the repo

- `frontend/vercel.json` proxies `/api` → Render
- Vercel root directory: `frontend`

---

## Seed demo users (once, after health is OK)

Render → **imp-api** → **Shell**:

```bash
npm run ensure-admin
npm run seed
```

Demo logins:

- Admin: `admin@imp.com` / `Admin123!`
- HR: `hr@acme.com` / `Company123!`
- Student: `student@university.edu` / `Student123!`

---

## Full Render env checklist

```env
NODE_ENV=production
REDIS_URL=rediss://default:...@....upstash.io:6379
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=long-random-string-min-32-chars
JWT_REFRESH_SECRET=another-long-random-string
CLIENT_URL=https://internship-platform-eight.vercel.app
ALLOWED_ORIGINS=https://internship-platform-eight.vercel.app
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=imp
```
