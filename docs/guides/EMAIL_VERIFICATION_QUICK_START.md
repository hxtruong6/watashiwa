# Email Verification - Quick Start

**Quick reference for email verification setup**

> 📖 **For complete documentation, see [EMAIL_GUIDE.md](./EMAIL_GUIDE.md)**

---

## Install & Setup

```bash
# 1. Install dependencies
pnpm install inngest mjml mailtrap
pnpm add -D @types/mjml

# 2. Add to .env
INNGEST_DEV=1
MAILTRAP_API_TOKEN=your-token
MAILTRAP_FROM_EMAIL=noreply@watashi-jp.com
MAILTRAP_FROM_NAME=WatashiWa
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 3. Run migration
pnpm db:push

# 4. Start Inngest Dev Server
npx inngest-cli@latest dev
```

---

## Test It

1. **Welcome Email:** Register new user → Check email
2. **OTP Verification:** Profile → Verify Email → Enter code

---

## Production

**Self-hosted (Recommended):**

```bash
npm install -g inngest-cli
pm2 start inngest -- start
# Set INNGEST_BASE_URL=http://your-server:8288
```

**Or use Inngest Cloud:**

- Get keys from <https://cloud.inngest.com>
- Set `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`

---

## Troubleshooting

- **No emails?** Check Mailtrap token and Inngest Dev Server
- **OTP not working?** Check migration and rate limits
- **Functions not running?** Check Inngest Dev Server

---

## Next Steps

- **Full Guide:** [EMAIL_GUIDE.md](./EMAIL_GUIDE.md) - Complete documentation
- **Template System:** File-based templates with multi-language support
- **Design Guidelines:** Brand voice and spam prevention
