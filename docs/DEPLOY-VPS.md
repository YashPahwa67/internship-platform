# Deploy IMP on a VPS (Ubuntu 22/24)

Stack on the server: **Nginx** (HTTPS + static frontend) → **Node API** (PM2) → **Redis** (local) → **MongoDB Atlas** + **Cloudinary** (cloud).

---

## 1. What you need

| Item | Example |
|------|---------|
| VPS | DigitalOcean, Hetzner, AWS Lightsail, Hostinger VPS |
| OS | Ubuntu 22.04 LTS |
| Domain | `imp.yourdomain.com` (optional but recommended) |
| MongoDB | Keep **Atlas** (do not run Mongo on a small VPS) |
| Cloudinary | Same as local |
| Redis | Run on VPS (`docker` or `apt`) |

Minimum VPS: **1 GB RAM** (2 GB safer with Redis + Node).

---

## 2. One-time server setup

SSH into the VPS:

```bash
ssh root@YOUR_SERVER_IP
```

### Create a deploy user

```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

### Install Node 20, Nginx, Redis, Git

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt update
sudo apt install -y nginx redis-server git certbot python3-certbot-nginx
sudo systemctl enable redis-server nginx
```

### Install PM2

```bash
sudo npm install -g pm2
```

### Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 3. MongoDB Atlas (before deploy)

1. Atlas → **Network Access** → add your VPS **public IP** (or `0.0.0.0/0` only for testing).
2. Copy connection string; URL-encode special characters in the password (`@` → `%40`).
3. Use database name: `internship_platform`.

---

## 4. Deploy the app

On the VPS as `deploy`:

```bash
cd ~
git clone https://github.com/YOUR_USER/Internship_platform.git
cd Internship_platform
```

### Backend `.env`

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Production example:

```env
NODE_ENV=production
PORT=5001

MONGODB_URI=mongodb+srv://user:ENCODED_PASS@cluster.mongodb.net/internship_platform?retryWrites=true&w=majority
REDIS_URL=redis://127.0.0.1:6379

JWT_ACCESS_SECRET=<64-char-random>
JWT_REFRESH_SECRET=<64-char-random>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

CLIENT_URL=https://imp.yourdomain.com
ALLOWED_ORIGINS=https://imp.yourdomain.com

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=imp

LOG_LEVEL=info
```

Generate secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Install & build

```bash
cd backend && npm ci --omit=dev
cd ../frontend && npm ci && npm run build
```

Frontend build output: `frontend/dist/`

---

## 5. Run API with PM2

From project root:

```bash
cp deploy/ecosystem.config.cjs ~/ecosystem.config.cjs
# Edit paths in the file if your clone path differs
pm2 start ~/ecosystem.config.cjs
pm2 save
pm2 startup   # run the command it prints (sudo)
```

Optional email worker:

```bash
pm2 start backend/src/jobs/emailWorker.js --name imp-email-worker
pm2 save
```

Check:

```bash
pm2 status
curl http://127.0.0.1:5001/health
```

---

## 6. Nginx (frontend + API proxy)

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/imp
sudo nano /etc/nginx/sites-available/imp
# Replace YOUR_DOMAIN and root path
sudo ln -s /etc/nginx/sites-available/imp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### HTTPS (Let's Encrypt)

```bash
sudo certbot --nginx -d imp.yourdomain.com
```

Point your domain **A record** to the VPS IP first.

---

## 7. Verify

- `https://imp.yourdomain.com` → React app
- `https://imp.yourdomain.com/api/v1/health` → `{ db, redis }`
- Login / register with demo or real users

---

## 8. Updates (redeploy)

```bash
cd ~/Internship_platform
git pull
cd backend && npm ci --omit=dev
cd ../frontend && npm ci && npm run build
pm2 restart imp-api
sudo systemctl reload nginx
```

---

## Architecture

```
Browser
   │
   ▼
Nginx :443
   ├── /          → frontend/dist (static)
   └── /api       → proxy → Node :5001
                              ├── MongoDB Atlas
                              ├── Redis :6379
                              └── Cloudinary
```

---

## Common issues

| Problem | Fix |
|---------|-----|
| `ECONNREFUSED 6379` | `sudo systemctl start redis-server` |
| Atlas connection failed | Whitelist VPS IP in Atlas |
| CORS errors | `ALLOWED_ORIGINS` and `CLIENT_URL` must match exact site URL (https) |
| Cookies / refresh fail | Use HTTPS in production; same domain for site + `/api` |
| 502 Bad Gateway | `pm2 logs imp-api` — API not running or wrong port |

---

## Security checklist

- [ ] Strong JWT secrets (32+ chars)
- [ ] `NODE_ENV=production`
- [ ] HTTPS only
- [ ] Atlas IP allowlist (not open `0.0.0.0/0` in production)
- [ ] Do not commit `.env`
- [ ] `ufw` enabled
- [ ] Keep system updated: `sudo apt update && sudo apt upgrade`
