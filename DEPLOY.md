# Deploying Jyotish Journey on AWS EC2 Free Tier

## What you get FREE for 12 months

| Resource | Specs |
|----------|-------|
| EC2 t2.micro | 1 vCPU, 1 GB RAM, 750 hrs/month |
| EBS Storage | 30 GB SSD |
| Data Transfer | 15 GB/month outbound |

**Total cost: $0/month** (for 12 months)

We use a 2 GB swap file + memory-tuned Docker containers to fit everything in 1 GB RAM.

---

## Architecture

```
AWS EC2 t2.micro (1 GB RAM + 2 GB swap)
├── Docker Compose
│   ├── frontend (nginx:80) ---- serves Angular + proxies /api
│   ├── api-gateway (:8080) ---- JWT auth, rate limiting, routing
│   ├── discovery-server (:8761) ---- Eureka service registry
│   ├── user-service (:8081) ---- user auth, Google OAuth
│   ├── blog-service (:8082) ---- blogs, comments, likes, notifications
│   ├── postgres (:5432) -------- user_db + blog_db
│   └── redis (:6379) ----------- caching + rate limiting
```

---

## Step 1: Create AWS Account

1. Go to [aws.amazon.com](https://aws.amazon.com) and click **Create an AWS Account**
2. Fill in email, password, account name
3. Add payment method (Indian Visa/MC/Rupay debit/credit card accepted)
4. Choose **Basic Support** (free)
5. Wait for account activation

---

## Step 2: Launch EC2 Instance

1. Go to **AWS Console** > **EC2** > **Launch Instance**
2. Configure:
   - **Name**: `jyotish-journey`
   - **AMI**: Amazon Linux 2023 (free tier eligible)
   - **Instance type**: `t2.micro` (free tier eligible)
   - **Key pair**: Click **Create new key pair**
     - Name: `jj-key`
     - Type: RSA
     - Format: `.pem`
     - Download and save the file
   - **Network settings**: Click **Edit**
     - Auto-assign public IP: **Enable**
     - Create security group: **Yes**
     - Security group name: `jj-security-group`
     - Add rules:
       - Type: SSH, Port: 22, Source: My IP
       - Type: HTTP, Port: 80, Source: 0.0.0.0/0
       - Type: HTTPS, Port: 443, Source: 0.0.0.0/0
   - **Storage**: 30 GB gp3 (max free tier)
3. Click **Launch Instance**
4. Wait until **Instance State** shows **Running**
5. Note the **Public IPv4 address**

---

## Step 3: SSH into your instance

```bash
# Linux/Mac
chmod 400 ~/Downloads/jj-key.pem
ssh -i ~/Downloads/jj-key.pem ec2-user@YOUR_PUBLIC_IP

# Windows (PowerShell)
ssh -i C:\Users\YourName\Downloads\jj-key.pem ec2-user@YOUR_PUBLIC_IP
```

---

## Step 4: Create Swap File (IMPORTANT)

This gives your 1 GB machine an extra 2 GB of virtual memory:

```bash
sudo dd if=/dev/zero of=/swapfile bs=128M count=16
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make it permanent (survives reboot)
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab

# Verify: should show ~2 GB swap
free -h
```

---

## Step 5: Install Docker

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo yum install -y git

# Log out and back in for docker group to take effect
exit
```

SSH back in, then verify:

```bash
docker --version
docker-compose --version
```

---

## Step 6: Clone your project

```bash
git clone https://github.com/Advait1610/JyotishJourney.git
cd JyotishJourney
```

---

## Step 7: Configure Environment Variables

```bash
cp .env.example .env
nano .env
```

Fill in your real values:

```
DB_USER=postgres
DB_PASSWORD=a_strong_password_here
JWT_SECRET=JyotishJourneySecretKeyForJWTTokenGeneration2024MustBe256BitsLong!
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://YOUR_PUBLIC_IP/api/users/oauth2/callback
APP_FRONTEND_URL=http://YOUR_PUBLIC_IP
CORS_ALLOWED_ORIGINS=http://YOUR_PUBLIC_IP
```

Replace `YOUR_PUBLIC_IP` with your EC2 instance's public IP.

Save: `Ctrl+O`, Enter, `Ctrl+X`

---

## Step 8: Update Google OAuth Settings

Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials):

1. Edit your OAuth 2.0 Client ID
2. Add to **Authorized JavaScript origins**:
   - `http://YOUR_PUBLIC_IP`
3. Add to **Authorized redirect URIs**:
   - `http://YOUR_PUBLIC_IP/api/users/oauth2/callback`
4. Save

---

## Step 9: Build and Start

```bash
cd ~/JyotishJourney

# Make init script executable
chmod +x init-db.sh

# Build and start (first time takes 15-20 minutes on t2.micro)
docker-compose up -d --build

# Watch logs
docker-compose logs -f
```

Wait until you see all services registered with Eureka. This takes a few minutes since services start sequentially.

Check status:

```bash
# All containers should be running
docker-compose ps

# Check memory usage
free -h
docker stats --no-stream
```

---

## Step 10: Visit Your App

Open your browser:

```
http://YOUR_PUBLIC_IP
```

Your app is live!

---

## Useful Commands

```bash
# Stop all services
docker-compose down

# Restart everything
docker-compose restart

# Restart a specific service
docker-compose restart blog-service

# View logs (last 100 lines)
docker-compose logs --tail=100 blog-service

# Rebuild after code changes
cd ~/JyotishJourney
git pull origin main
docker-compose up -d --build

# Check memory usage
free -h
docker stats --no-stream

# Clear everything and start fresh (WARNING: deletes all data)
docker-compose down -v
docker system prune -af
docker-compose up -d --build
```

---

## Troubleshooting

### Out of memory / services crashing?

```bash
# Check swap is active
free -h

# Check which container uses most memory
docker stats --no-stream

# If a service keeps restarting, check its logs
docker-compose logs user-service
```

### Can't connect to the app?

1. Check EC2 Security Group allows port 80 inbound
2. Check all containers are running: `docker-compose ps`
3. Check the frontend can reach the gateway: `docker-compose logs frontend`

### Build is too slow?

t2.micro has limited CPU. First build takes 15-20 min. Subsequent builds are faster due to Docker layer caching.

### Want to use a custom domain?

1. Buy a domain (or use free subdomain from DuckDNS)
2. Point the A record to your EC2 public IP
3. Update `.env` with your domain in `GOOGLE_REDIRECT_URI`, `APP_FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`
4. Restart: `docker-compose restart`

---

## Stopping the Instance (to save free tier hours)

You get 750 hours/month free. That's exactly 31 days, so one instance running 24/7 fits perfectly. But if you want to stop it:

```bash
# From AWS Console: EC2 > Instances > Select > Instance State > Stop
# Your data persists. Start it again anytime.
# Note: Public IP changes when you restart (use Elastic IP to keep it fixed -- 1 free if attached to running instance)
```

---

## Memory Budget

| Service | Memory Limit |
|---------|-------------|
| PostgreSQL | 128 MB |
| Redis | 48 MB |
| Discovery Server | 200 MB |
| User Service | 220 MB |
| Blog Service | 220 MB |
| API Gateway | 200 MB |
| Frontend (Nginx) | 32 MB |
| **Total** | **~1048 MB** |
| OS + Docker overhead | ~200 MB |
| **Swap handles overflow** | **2048 MB available** |
