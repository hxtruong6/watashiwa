# Deployment Guide for WatashiWa (Linux Ubuntu)

This guide outlines the steps to deploy the **WatashiWa** application to a Linux Ubuntu server using **PM2** for process management and **Nginx** as a reverse proxy.

## Prerequisites

- **Ubuntu Server** (20.04 LTS or newer recommended)
- **Node.js** (v18 or newer) & **npm** / **pnpm**
- **PostgreSQL** database
- **Redis** (optional, for distributed caching - falls back to in-memory if not available)
- **Nginx**
- **Domain Name** pointed to your server's IP

---

## Deployment Options

You can deploy this application in two ways:

1. **Manual Deployment**: Manually pull code, build, and restart PM2 on the server.
2. **Automated Remote Deployment**: Use PM2's deploy feature to push updates from your local machine.

---

## Option 1: Manual Deployment Setup (First Time)

### Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js (Active LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

### Install pnpm (Recommended)

```bash
sudo npm install -g pnpm
```

### Install PM2

```bash
sudo npm install -g pm2

# add pm2 to your user's startup
sudo pm2 startup

# save pm2 process list
sudo pm2 save
```

---

## 2. Database Setup (Prisma)

Ensure you have a PostgreSQL database connection string.

1. **Clone the repository** to your server (e.g., `/var/www/watashiwa`).
2. **Create a `.env` file** in the project root:

   ```bash
   cp .env.example .env
   nano .env
   ```

3. **Configure your Database URL** (with connection pool parameters):

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/watashi_jp?schema=public&connection_limit=20&pool_timeout=10&connect_timeout=5"
   ```

   **Note:** Connection pool parameters are automatically added if not present, but it's recommended to include them explicitly for production.

4. **Configure Redis (Optional, but recommended for 10K+ users)**:

   ```env
   # Redis URL (optional - falls back to in-memory cache if not set)
   REDIS_URL="redis://localhost:6379"
   ```

   If Redis is not configured, the application will automatically use in-memory caching (per-instance).

5. **Run Migrations**:

   ```bash
   npx prisma migrate deploy
   ```

   _This applies pending migrations to your production database._

6. **Generate Prisma Client**:

   ```bash
   npx prisma generate
   ```

---

## 3. Redis Setup (Optional, Recommended for Production)

Redis provides distributed caching across all Next.js instances, significantly improving cache hit rates for 10K+ concurrent users.

### Install Redis

```bash
sudo apt update
sudo apt install redis-server -y
```

### Configure Redis

Edit the Redis configuration:

```bash
sudo nano /etc/redis/redis.conf
```

Recommended settings for production:

```
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### Start Redis

```bash
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### Verify Redis is Running

```bash
redis-cli ping
# Should return: PONG
```

### Configure Redis in `.env`

Add to your `.env` file:

```env
REDIS_URL="redis://localhost:6379"
```

**Note:** If `REDIS_URL` is not set, the application will automatically fall back to in-memory caching. This is fine for development but not recommended for production with high concurrency.

## 4. Application Setup

### Install Dependencies

```bash
pnpm install
```

### Build the Application

**Local Build (with optimizations):**

```bash
# Build with optimized memory settings
pnpm build
```

**Note:** The build process now includes:

- Webpack build worker (20-30% faster, 1-2GB RAM saved)
- Webpack memory optimizations (10-20% faster, 1GB RAM saved)
- Standalone output mode (smaller deployment size)

**For low-memory systems, create a swap file:**

```bash
# Create 2GB swap file (run once)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make it permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

**Alternative: Use GitHub Actions CI for builds**

Instead of building on the server, you can offload builds to GitHub Actions CI:

1. Push code to GitHub
2. GitHub Actions builds the application
3. Download artifacts and deploy to server

See `.github/workflows/build.yml` for the CI configuration.

---

## 5. Process Management with PM2

We use the `ecosystem.config.js` file included in the project.

### Start the Application

```bash
pm2 start ecosystem.config.js
```

### Save PM2 Process List

To ensure the app restarts on server reboot:

```bash
pm2 save
sudo pm2 startup
```

_(Run the command output by `sudo pm2 startup`)_

### PM2 Commands Cheat Sheet

- **Status**: `pm2 status`
- **Logs**: `pm2 logs watashiwa`
- **Restart**: `pm2 restart watashiwa`
- **Stop**: `pm2 stop watashiwa`

---

## 6. Option 2: Automated Remote Deployment

PM2 allows you to deploy from your local machine to the remote server with a single command.

### 1. Configure SSH Access

Ensure you can SSH into your server without a password (using SSH keys):

```bash
ssh-copy-id user@your-server-ip
```

### 2. Update `ecosystem.config.js`

Edit the `deploy` section in `ecosystem.config.js` with your server details:

- `user`: Your server username.
- `host`: Your server IP address.
- `repo`: Your Git repository URL (must be accessible by the server).
- `path`: The directory on the server where the app will live.

### 3. Setup Directories (Run Once)

Run this from your _local machine_:

```bash
pm2 deploy ecosystem.config.js production setup
```

### 4. Deploy

To deploy updates, commit your changes to Git and run locally:

```bash
pm2 deploy ecosystem.config.js production
```

This command will:

1. Pull the latest code from Git.
2. Install dependencies.
3. Generate Prisma client & Run migrations.
4. Build the Next.js app.
5. Reload the application with zero downtime.

---

## 7. Reverse Proxy Setup (Nginx)

### Install Nginx

```bash
sudo apt install nginx -y
```

### Configure Nginx

Create a new configuration file:

```bash
sudo nano /etc/nginx/sites-available/watashiwa
```

Paste the following configuration (replace `your-domain.com`):

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/watashiwa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 8. SSL Setup (HTTPS)

Secure your site with a free Let's Encrypt certificate.

### Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Obtain Certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts to configure HTTPS redirection.

---

## Troubleshooting

- **Check App Logs**: `pm2 logs watashiwa`
- **Check Nginx Logs**: `sudo tail -f /var/log/nginx/error.log`
- **Database Issues**: Verify `DATABASE_URL` in `.env` is correct and accessible.
- **Redis Issues**:
  - Check Redis status: `sudo systemctl status redis-server`
  - Test connection: `redis-cli ping`
  - Check Redis logs: `sudo tail -f /var/log/redis/redis-server.log`
  - If Redis is unavailable, the app will automatically fall back to in-memory caching
- **Connection Pool Issues**: Verify `DATABASE_URL` includes connection pool parameters or let the app add them automatically
