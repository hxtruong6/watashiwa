# Deployment Guide for Watashi JP (Linux Ubuntu)

This guide outlines the steps to deploy the **Watashi JP** application to a Linux Ubuntu server using **PM2** for process management and **Nginx** as a reverse proxy.

## Prerequisites

- **Ubuntu Server** (20.04 LTS or newer recommended)
- **Node.js** (v18 or newer) & **npm** / **pnpm**
- **PostgreSQL** database
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

1. **Clone the repository** to your server (e.g., `/var/www/watashi-jp`).
2. **Create a `.env` file** in the project root:

   ```bash
   cp .env.example .env
   nano .env
   ```

3. **Configure your Database URL**:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/watashi_jp?schema=public"
   ```

4. **Run Migrations**:

   ```bash
   npx prisma migrate deploy
   ```

   *This applies pending migrations to your production database.*

5. **Generate Prisma Client**:

   ```bash
   npx prisma generate
   ```

---

## 3. Application Setup

### Install Dependencies

```bash
pnpm install
```

### Build the Application

```bash
pnpm build
```

---

## 4. Process Management with PM2

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

*(Run the command output by `sudo pm2 startup`)*

### PM2 Commands Cheat Sheet

- **Status**: `pm2 status`
- **Logs**: `pm2 logs watashi-jp`
- **Restart**: `pm2 restart watashi-jp`
- **Stop**: `pm2 stop watashi-jp`

---

## Option 2: Automated Remote Deployment

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

Run this from your *local machine*:

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

## Reverse Proxy Setup (Nginx)

### Install Nginx

```bash
sudo apt install nginx -y
```

### Configure Nginx

Create a new configuration file:

```bash
sudo nano /etc/nginx/sites-available/watashi-jp
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
sudo ln -s /etc/nginx/sites-available/watashi-jp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6. SSL Setup (HTTPS)

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

- **Check App Logs**: `pm2 logs watashi-jp`
- **Check Nginx Logs**: `sudo tail -f /var/log/nginx/error.log`
- **Database Issues**: Verify `DATABASE_URL` in `.env` is correct and accessible.
