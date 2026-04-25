# Deploying Jyotish Journey on Render (Free Tier)

## What you get for FREE

| Resource | Limit | Notes |
|----------|-------|-------|
| Web Services | 750 hrs/month (per service) | Services sleep after 15 min inactivity, auto-wake on request |
| Static Sites | Unlimited | Always on, no sleeping |
| PostgreSQL | 256 MB per database | Free for 90 days, then need to recreate |
| Redis | 25 MB | Free tier |

**Total cost: $0/month**

> Services go to sleep after 15 min of inactivity. First request after sleep takes ~30-50 seconds (cold start), then everything is fast. You can prevent sleeping with a free monitoring tool like [UptimeRobot](https://uptimerobot.com/).

---

## Architecture on Render

```
Render Cloud (Free Tier)
├── Static Site: jj-frontend (Angular, always on)
├── Web Service: jj-discovery (Eureka, Docker)
├── Web Service: jj-gateway (API Gateway, Docker)
├── Web Service: jj-user-service (User Service, Docker)
├── Web Service: jj-blog-service (Blog Service, Docker)
├── PostgreSQL: jj-user-db (256 MB)
├── PostgreSQL: jj-blog-db (256 MB)
└── Redis: jj-redis (25 MB)
```

---

## Prerequisites

1. A [GitHub](https://github.com) account
2. Push this project to a GitHub repository

---

## Step 1: Push to GitHub

```bash
cd d:\projects\jyotish-journey

git init
git add .
git commit -m "Initial commit - ready for Render deployment"
git remote add origin https://github.com/YOUR_USERNAME/jyotish-journey.git
git branch -M main
git push -u origin main
```

---

## Step 2: Create Render Account

1. Go to [render.com](https://render.com) and click **Get Started for Free**
2. Sign up with your **GitHub account** (easiest)
3. No credit card required

---

## Step 3: Create Databases

### PostgreSQL - User DB

1. Go to **Dashboard > New > PostgreSQL**
2. Configure:
   - **Name**: `jj-user-db`
   - **Database**: `user_db`
   - **User**: `postgres`
   - **Region**: Oregon (or closest to you)
   - **Plan**: Free
3. Click **Create Database**
4. Once created, copy the **Internal Database URL** (looks like `postgres://postgres:xxxxx@dpg-xxxxx/user_db`)

### PostgreSQL - Blog DB

Repeat the same steps:
- **Name**: `jj-blog-db`
- **Database**: `blog_db`
- **User**: `postgres`
- Copy the **Internal Database URL**

### Redis

1. Go to **Dashboard > New > Redis**
2. Configure:
   - **Name**: `jj-redis`
   - **Region**: Same as databases
   - **Plan**: Free
3. Copy the **Internal Redis URL** (looks like `redis://red-xxxxx:6379`)

---

## Step 4: Deploy Services (in order)

### 4.1 Discovery Server (deploy first)

1. Go to **Dashboard > New > Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `jj-discovery`
   - **Region**: Same as DBs
   - **Runtime**: Docker
   - **Dockerfile Path**: `./discovery-server/Dockerfile`
   - **Docker Context**: `./discovery-server`
   - **Plan**: Free
4. Add environment variable:
   - `EUREKA_HOSTNAME` = `jj-discovery`
5. Click **Create Web Service**
6. Wait for it to deploy. Note the URL (e.g., `https://jj-discovery.onrender.com`)

### 4.2 User Service

1. **New > Web Service** > connect same repo
2. Configure:
   - **Name**: `jj-user-service`
   - **Runtime**: Docker
   - **Dockerfile Path**: `./user-service/Dockerfile`
   - **Docker Context**: `./user-service`
   - **Plan**: Free
3. Add environment variables:

   | Key | Value |
   |-----|-------|
   | `SPRING_DATASOURCE_URL` | Your jj-user-db **Internal Database URL** |
   | `SPRING_DATASOURCE_USERNAME` | `postgres` |
   | `SPRING_DATASOURCE_PASSWORD` | (password from the DB URL) |
   | `SPRING_REDIS_HOST` | (hostname from Redis Internal URL, e.g., `red-xxxxx`) |
   | `SPRING_REDIS_PORT` | `6379` |
   | `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` | `https://jj-discovery.onrender.com/eureka/` |
   | `JWT_SECRET` | `JyotishJourneySecretKeyForJWTTokenGeneration2024MustBe256BitsLong!` |
   | `GOOGLE_CLIENT_ID` | Your Google OAuth client ID |
   | `GOOGLE_CLIENT_SECRET` | Your Google OAuth client secret |
   | `GOOGLE_REDIRECT_URI` | `https://jj-gateway.onrender.com/api/users/oauth2/callback` |
   | `APP_FRONTEND_URL` | `https://jj-frontend.onrender.com` (will set after creating frontend) |

4. Click **Create Web Service**

### 4.3 Blog Service

1. **New > Web Service** > connect same repo
2. Configure:
   - **Name**: `jj-blog-service`
   - **Runtime**: Docker
   - **Dockerfile Path**: `./blog-service/Dockerfile`
   - **Docker Context**: `./blog-service`
   - **Plan**: Free
3. Add environment variables:

   | Key | Value |
   |-----|-------|
   | `SPRING_DATASOURCE_URL` | Your jj-blog-db **Internal Database URL** |
   | `SPRING_DATASOURCE_USERNAME` | `postgres` |
   | `SPRING_DATASOURCE_PASSWORD` | (password from the DB URL) |
   | `SPRING_REDIS_HOST` | (same Redis hostname as above) |
   | `SPRING_REDIS_PORT` | `6379` |
   | `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` | `https://jj-discovery.onrender.com/eureka/` |

4. Click **Create Web Service**

### 4.4 API Gateway

1. **New > Web Service** > connect same repo
2. Configure:
   - **Name**: `jj-gateway`
   - **Runtime**: Docker
   - **Dockerfile Path**: `./api-gateway/Dockerfile`
   - **Docker Context**: `./api-gateway`
   - **Plan**: Free
3. Add environment variables:

   | Key | Value |
   |-----|-------|
   | `SPRING_REDIS_HOST` | (same Redis hostname) |
   | `SPRING_REDIS_PORT` | `6379` |
   | `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` | `https://jj-discovery.onrender.com/eureka/` |
   | `JWT_SECRET` | `JyotishJourneySecretKeyForJWTTokenGeneration2024MustBe256BitsLong!` |
   | `CORS_ALLOWED_ORIGINS` | `https://jj-frontend.onrender.com` |

4. Click **Create Web Service**

### 4.5 Frontend (Static Site)

1. **New > Static Site**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `jj-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `chmod +x render-build.sh && ./render-build.sh`
   - **Publish Directory**: `dist/jyotish-journey/browser`
4. Add environment variables:

   | Key | Value |
   |-----|-------|
   | `RENDER_API_URL` | `https://jj-gateway.onrender.com/api` |
   | `RENDER_GATEWAY_URL` | `https://jj-gateway.onrender.com` |

5. Click **Create Static Site**

---

## Step 5: Update Google OAuth Settings

Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials):

1. Edit your OAuth 2.0 Client ID
2. Add to **Authorized JavaScript origins**:
   - `https://jj-frontend.onrender.com`
   - `https://jj-gateway.onrender.com`
3. Add to **Authorized redirect URIs**:
   - `https://jj-gateway.onrender.com/api/users/oauth2/callback`
4. Save

---

## Step 6: Verify

1. Open `https://jj-frontend.onrender.com` in your browser
2. The first load may take 30-50 seconds (services waking up)
3. After that, everything should be fast

---

## Keeping Services Awake (Optional)

If you want to avoid cold starts, use [UptimeRobot](https://uptimerobot.com/) (free):

1. Create an account at uptimerobot.com
2. Add 4 HTTP monitors:

   | URL | Interval |
   |-----|----------|
   | `https://jj-discovery.onrender.com` | 14 minutes |
   | `https://jj-gateway.onrender.com` | 14 minutes |
   | `https://jj-user-service.onrender.com` | 14 minutes |
   | `https://jj-blog-service.onrender.com` | 14 minutes |

This pings each service before it sleeps (at 15 min), keeping them alive 24/7.

---

## Updating Your App

After making code changes locally:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render will **automatically redeploy** all services connected to the repo.

---

## Troubleshooting

### Service won't start?

1. Go to the service on Render Dashboard
2. Click **Logs** tab
3. Look for error messages

### Database connection error?

- Double check `SPRING_DATASOURCE_URL` -- it should be the **Internal Database URL**, not the External one
- Make sure the database and the service are in the **same region**

### CORS errors in browser?

- Verify `CORS_ALLOWED_ORIGINS` on jj-gateway matches your frontend URL exactly (including `https://`)

### Google OAuth not working?

- Make sure `GOOGLE_REDIRECT_URI` is `https://jj-gateway.onrender.com/api/users/oauth2/callback`
- Make sure `APP_FRONTEND_URL` is `https://jj-frontend.onrender.com`
- Both URLs must be registered in Google Cloud Console

### Free Postgres expiring after 90 days?

Render's free PostgreSQL databases expire after 90 days. When this happens:
1. Create a new free database
2. Update the `SPRING_DATASOURCE_URL` environment variable on the affected service
3. The service will auto-redeploy with the new database
4. Note: **data will be lost** -- export before expiry if needed

---

## Cost Summary

| Item | Cost |
|------|------|
| 4 Web Services (free plan) | $0 |
| 1 Static Site | $0 |
| 2 PostgreSQL (free plan) | $0 |
| 1 Redis (free plan) | $0 |
| UptimeRobot (optional) | $0 |
| **Total** | **$0/month** |
