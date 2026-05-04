# Nirlipta Yoga Studio — Setup & Deployment Guide

---

## Quick Start (Local Development)

```bash
cp .env.example .env.local   # then fill in real values
npm install
npm run dev
# open http://localhost:3000
```

Admin panel: `http://localhost:3000/admin`

---

## Step 1 — Set Up Supabase (Free)

1. Go to [supabase.com](https://supabase.com) → Sign up → New Project
2. Name it `nirlipta`, pick a strong DB password, region: **Southeast Asia (Singapore)**
3. SQL Editor → paste the entire contents of `supabase/schema.sql` → Run
4. Settings → API → copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2 — Set Up Razorpay (Free, ~2% per transaction)

1. [razorpay.com](https://razorpay.com) → Sign up → Dashboard → Settings → API Keys
2. Generate Test Key — copy Key ID and Secret
3. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in your env
4. Switch to Live keys when ready for real payments
5. Alternatively, set keys via **Admin → Settings** in the dashboard (no redeploy needed)

---

## Option A — Deploy to Vercel (Easiest, Free)

1. Push this repo to GitHub
2. [vercel.com](https://vercel.com) → Import project → select your repo
3. Add environment variables from `.env.example` (all with real values)
4. Deploy → done. Vercel auto-deploys on every `git push`

**Env vars to set in Vercel:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_EMAIL
ADMIN_PASSWORD
NEXT_PUBLIC_APP_URL        (e.g. https://nirlipta.vercel.app)
NEXT_PUBLIC_WHATSAPP_NUMBER
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

---

## Option B — Deploy to Oracle Cloud Free Tier

Oracle Cloud's **Always Free** tier includes:
- 2× Ampere A1 ARM VMs (4 OCPUs + 24 GB RAM total — very generous)
- 200 GB block storage
- Free outbound bandwidth (up to 10 TB/month)

### B1 — Create a VM

1. Sign up at [cloud.oracle.com](https://cloud.oracle.com) (requires a credit card for identity but won't be charged on Always Free)
2. **Compute → Instances → Create Instance**
3. Image: **Ubuntu 22.04**
4. Shape: **VM.Standard.A1.Flex** (Ampere ARM) — select 2 OCPUs, 12 GB RAM
5. Add your SSH public key
6. Create instance — note the public IP

### B2 — Configure Firewall

In OCI Console: **Networking → Virtual Cloud Networks → your VCN → Security Lists → Ingress Rules**

Add:
| Protocol | Source CIDR | Port | Description |
|----------|-------------|------|-------------|
| TCP | 0.0.0.0/0 | 22 | SSH |
| TCP | 0.0.0.0/0 | 80 | HTTP |
| TCP | 0.0.0.0/0 | 443 | HTTPS |

Also on the VM itself:
```bash
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

### B3 — Install Dependencies

```bash
ssh ubuntu@<YOUR_VM_IP>

# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
newgrp docker

# Docker Compose plugin
sudo apt-get install -y docker-compose-plugin

# Verify
docker --version
docker compose version
```

### B4 — Deploy the App

```bash
# On your local machine — push the image to GitHub Container Registry
# (or build directly on the VM if you prefer)

# Option: build on the VM
git clone https://github.com/YOUR_USERNAME/yoga-app.git
cd yoga-app

# Create your env file
cp .env.example .env
nano .env   # fill in all values; set NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

Create a `docker-compose.prod.yml` (or edit the existing one):
```yaml
services:
  app:
    build:
      context: .
      args:
        NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}
        NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL}
        NEXT_PUBLIC_WHATSAPP_NUMBER: ${NEXT_PUBLIC_WHATSAPP_NUMBER}
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file: .env
    environment:
      NODE_ENV: production

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - app
```

### B5 — Set Up HTTPS (Free with Let's Encrypt)

```bash
sudo apt-get install -y certbot

# Point your domain's A record to the VM IP first, then:
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certbot auto-renew
sudo systemctl enable certbot.timer
```

Create `nginx.prod.conf`:
```nginx
events { worker_connections 1024; }

http {
  server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
  }

  server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
      proxy_pass http://app:3000;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_cache_bypass $http_upgrade;
    }
  }
}
```

### B6 — Launch

```bash
# Build and start (first time takes ~5 minutes)
docker compose -f docker-compose.prod.yml up -d --build

# Check status
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs app

# Your app is live at https://yourdomain.com
```

### B7 — Auto-Restart on Reboot

```bash
# Enable Docker to start on boot
sudo systemctl enable docker

# The `restart: unless-stopped` in compose handles app restart automatically
```

### B8 — Updates

```bash
cd yoga-app
git pull
docker compose -f docker-compose.prod.yml up -d --build
# Zero-downtime: old container keeps serving while new one builds
```

---

## Database Notes

- This app uses **Supabase cloud** (free tier: 500 MB storage, 2 GB bandwidth/month)
- The included `docker-compose.yml` (not the prod one) bundles a local PostgreSQL for development — don't use it in production
- Schema is in `supabase/schema.sql` — run once in Supabase SQL Editor

---

## Admin Panel

| Task | Location |
|------|----------|
| Add/edit classes | Admin → Classes |
| View bookings & revenue | Admin → Bookings |
| Upload gallery photos | Admin → Gallery |
| Write blog posts | Admin → Blog |
| Manage testimonials | Admin → Testimonials |
| View contact messages | Admin → Messages |
| Update studio info, Razorpay keys | Admin → Settings |

---

## Ongoing Maintenance (Every 6 Months)

```bash
npm install          # update dependencies
npm audit fix        # fix security issues
npm run build        # verify it builds
git push             # triggers deploy
```
