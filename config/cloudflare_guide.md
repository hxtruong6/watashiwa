# Cloudflare Professional Setup Guide for WatashiWa.app

## 1. Initial Setup & DNS

**Goal**: Point your domain to Cloudflare and then to your VPS.

1. **Add Site**: Log in to Cloudflare > Add Site > Enter `watashiwa.app`.
2. **Select Plan**: Free (sufficient for now).
3. **Update Nameservers**:
    * Cloudflare will give you two nameservers (e.g., `bob.ns.cloudflare.com`, `alice.ns.cloudflare.com`).
    * Go to your Registrar (Whois/Namecheap/GoDaddy).
    * Change Custom DNS to these two keys.
4. **DNS Records**:
    * Add **A Record**:
        * Name: `@` (root)
        * IPv4: `34.143.229.101`
        * Proxy status: **Proxied (Orange Cloud)**
    * Add **CNAME Record**:
        * Name: `www`
        * Target: `watashiwa.app`
        * Proxy status: **Proxied (Orange Cloud)**

### Handling Other Records (Mail, FTP, etc.)

Cloudflare typically scans and imports these for you, but if you need to add them manually:

* **MX Records (Email)**:
  * **Keep strictly Gray Cloud (DNS Only)**. Proxied MX records will break your email.
  * Example: Type: `MX`, Name: `@`, Mail Server: `mail.watashiwa.app`, TTL: `Auto`.

* **TXT Records (SPF, DKIM, Verification)**:
  * **Keep Gray Cloud (DNS Only)**.
  * These are for proving ownership or email security and don't involve web traffic.

* **FTP / Mail Subdomains**:
  * If you access your server via `ftp.watashiwa.app` or `mail.watashiwa.app`:
  * Create an **A Record** for `ftp` or `mail` pointing to your VPS IP `34.143.229.101`.
  * **IMPORTANT**: Set Proxy status to **DNS Only (Gray Cloud)**.
  * Cloudflare's proxy does not support FTP traffic.

---

## 2. SSL/TLS Strategy (The "Expert" Way)

**Why**: Don't use "Flexible" (insecure between Cloudflare and you). Don't use Certbot (Let's Encrypt renews every 90 days and can break behind Cloudflare proxy).
**Solution**: Use **Cloudflare Origin CA Certificate**.

1. **Go to SSL/TLS > Overview**:
    * Set encryption mode to **Full (Strict)**.
2. **Go to SSL/TLS > Origin Server**:
    * Click **Create Certificate**.
    * Leave defaults (RSA 2048, valid 15 years).
    * Click **Create**.
3. **Save Key and Cert**:
    * You will see a "Origin Certificate" and "Private Key".
    * Copy the **Origin Certificate** to a file on your VPS: `/etc/ssl/certs/watashiwa_cf_cert.pem`
    * Copy the **Private Key** to a file on your VPS: `/etc/ssl/private/watashiwa_cf_key.pem`

---

## 3. Nginx Configuration Update

Update your Nginx config (`/etc/nginx/sites-available/watashiwa.app`) to use this cert.

```nginx
server {
    listen 80;
    server_name watashiwa.app www.watashiwa.app;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name watashiwa.app www.watashiwa.app;

    # Cloudflare Origin Certs
    ssl_certificate /etc/ssl/certs/watashiwa_cf_cert.pem;
    ssl_certificate_key /etc/ssl/private/watashiwa_cf_key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # ... rest of your proxy settings
}
```

---

## 4. Security Settings

1. **Security > Settings**:
    * **Security Level**: Medium.
    * **Challenge Passage**: 30 minutes.
    * **Bot Fight Mode**: On. (Good for preventing scrapers).
2. **Security > WAF**:
    * (Optional) Block traffic not coming from your country if currently targeting specific region, or leave open.

---

## 5. Speed & Optimization

1. **Speed > Optimization**:
    * **Auto Minify**: Check JavaScript, CSS, HTML. (Safe for Next.js usually, but test).
    * **Brotli**: On.
    * **Rocket Loader**: **OFF**. (Warning: Rocket Loader often breaks React/Next.js hydration).
2. **Caching > Configuration**:
    * **Caching Level**: Standard.
    * **Browser Cache TTL**: 4 hours or 1 year (since we set immutable headers in Nginx).

# Cloudflare Master Setup Guide (From Scratch) [NEW]

Since `watashiwa.app` is a brand new domain, you need to create these records manually.

## Phase 1: Registrar Setup (Whois / Namecheap / etc)

1. Log in to where you bought the domain.
2. Find **Nameservers** or **DNS** settings.
3. Change them to **Custom DNS**.
4. Enter the 2 Nameservers Cloudflare gave you (e.g., `alice.ns.cloudflare.com`, `bob.ns.cloudflare.com`).
5. Wait 1-2 hours for propagation.

---

## Phase 2: DNS Records (The "Control Panel")

Go to Cloudflare Dashboard > **DNS** > **Records**. Delete everything there, then add these exact records:

### 1. The Website (Next.js App)

This makes `watashiwa.app` and `www.watashiwa.app` load your site.

| Type | Name | Content | Proxy Status | Note |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` | `34.143.229.101` | **Proxied (Orange)** | Points root domain to VPS |
| **CNAME** | `www` | `watashiwa.app` | **Proxied (Orange)** | Points www to root |

### 2. Server Management (SSH / FTP)

**Critical**: These must be **Gray Cloud (DNS Only)** so you can connect directly to the server. Cloudflare Proxy blocks SSH/FTP.

| Type | Name | Content | Proxy Status | Note |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `ssh` | `34.143.229.101` | **DNS Only (Gray)** | Use `ssh user@ssh.watashiwa.app` |
| **A** | `ftp` | `34.143.229.101` | **DNS Only (Gray)** | For FileZilla/FTP clients |

### 3. Email (Choose ONE Option)

#### Option A: Easiest (Recommended) - Cloudflare Email Routing

If you want `admin@watashiwa.app` -> forwards to your Gmail `hxtruong6@gmail.com`.

1. Go to **Email** tab in Cloudflare sidebar.
2. Click **Enable Email Routing**.
3. It will ask to "Add Records" automatically. Click **Add Records**.
4. Done. You don't need to configure MX manually.

#### Option B: Advanced - Custom Mail Server (Zoho / Google Workspace)

Only do this if you paid for business email.

* **MX Records**: Provided by Zoho/Google. **Always Gray Cloud**.
* **SPF/DKIM (TXT)**: Provided by Zoho/Google. **Always Gray Cloud**.

---

## Phase 3: SSL Setup (HTTPS)

1. **SSL/TLS > Overview**: Select **Full (Strict)**.
2. **SSL/TLS > Edge Certificates**: Enable "Always Use HTTPS".
3. **SSL/TLS > Origin Server**:
    * Create Certificate.
    * Save the `.pem` and `.key` files to your VPS as described in `watashiwa.conf`.
    * Restart Nginx: `sudo systemctl restart nginx`.

---

## Phase 4: Verification

1. **Website**: Visit `https://watashiwa.app` -> Should load your app secure.
2. **SSH**: `ssh xuantruong@ssh.watashiwa.app` -> Should connect.
3. **Email**: Send specific test email to your new address.
