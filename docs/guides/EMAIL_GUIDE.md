# Email System Guide - WatashiWa

**Last Updated:** 2025-01-01  
**Status:** ✅ Complete - Email verification with OTP and welcome emails  
**Architecture:** File-based templates, Inngest background jobs, Mailtrap SDK, Multi-language support

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Setup & Configuration](#setup--configuration)
4. [Architecture](#architecture)
5. [Template System](#template-system)
6. [Design Guidelines](#design-guidelines)
7. [Examples](#examples)
8. [Multi-Language Support](#multi-language-support)
9. [Troubleshooting](#troubleshooting)
10. [Reference](#reference)

---

## Overview

The email system provides:

- ✅ **Welcome emails** - Sent automatically on user registration
- ✅ **OTP verification** - Email verification with 6-digit codes
- ✅ **Background processing** - Inngest handles async email sending
- ✅ **File-based templates** - Designers work independently
- ✅ **Multi-language support** - Full translation (en, vi, ja)
- ✅ **Design system** - Consistent branding with design tokens
- ✅ **CAN-SPAM compliant** - Unsubscribe links and physical address

---

## Quick Start

**For developers who just need to get it running:**

See [EMAIL_VERIFICATION_QUICK_START.md](./EMAIL_VERIFICATION_QUICK_START.md) for a condensed setup guide.

**For complete documentation, continue reading below.**

---

## Setup & Configuration

### 1. Install Dependencies

```bash
pnpm install inngest mjml mailtrap
pnpm add -D @types/mjml
```

### 2. Environment Variables

```bash
# Local Development
INNGEST_DEV=1
INNGEST_APP_ID=watashi-jp

# Mailtrap Configuration
MAILTRAP_API_TOKEN=your-api-token
MAILTRAP_FROM_EMAIL=noreply@watashi-jp.com
MAILTRAP_FROM_NAME=WatashiWa

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# CAN-SPAM Compliance (optional, defaults to placeholder)
COMPANY_PHYSICAL_ADDRESS=Your Company Address Here
```

### 3. Database Migration

```bash
pnpm db:push
```

This adds `emailVerifiedAt`, `emailVerificationOTP`, and `emailVerificationOTPExpires` fields to the User model.

### 4. Start Inngest Dev Server

```bash
npx inngest-cli@latest dev
```

Keep this running alongside `pnpm dev` in a separate terminal.

### 5. Test It

1. **Welcome Email:** Register a new user → Check email inbox
2. **OTP Verification:** Go to Profile → Click "Verify Email" → Enter code

---

## Architecture

### System Components

```
┌─────────────────┐
│  User Action    │
│  (Registration) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  Server Action  │─────▶│   Inngest    │
│  (email.actions)│      │   Event      │
└─────────────────┘      └──────┬───────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Inngest Function      │
                    │  (send-welcome-email)  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Template Loader      │
                    │  (template-loader.ts)  │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
         ┌──────────────────┐    ┌──────────────────┐
         │  Load Template   │    │  Load Config     │
         │  (template.*.mjml)│    │  (config.json)  │
         └─────────┬─────────┘    └─────────┬────────┘
                   │                       │
                   └───────────┬───────────┘
                               │
                               ▼
                    ┌────────────────────────┐
                    │  Replace Variables    │
                    │  (tokens, user data)  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Compile MJML → HTML  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Mailtrap SDK         │
                    │  (Send Email)         │
                    └────────────────────────┘
```

### File Structure

```
src/
├── inngest/
│   ├── client.ts
│   └── functions/
│       ├── send-welcome-email.ts
│       └── send-otp-email.ts
├── modules/
│   └── email/
│       ├── templates/
│       │   ├── welcome/
│       │   │   ├── template.en.mjml
│       │   │   ├── template.vi.mjml
│       │   │   ├── template.ja.mjml
│       │   │   └── config.json
│       │   └── otp-verification/
│       │       ├── template.en.mjml
│       │       ├── template.vi.mjml
│       │       ├── template.ja.mjml
│       │       └── config.json
│       ├── components/
│       │   └── EmailVerificationButton.tsx
│       ├── utils/
│       │   ├── template-loader.ts
│       │   ├── email-tokens.ts
│       │   └── otp-generator.ts
│       ├── email.service.ts
│       ├── email.actions.ts
│       └── email.types.ts
└── app/
    └── api/
        └── inngest/
            └── route.ts
```

### Architecture Decisions

**Why Inngest?**

- Zero infrastructure (no Redis needed)
- Built-in monitoring and retries
- Works locally without cloud account
- Simple setup

**Why File-Based Templates?**

- Designers work independently
- No code deployment for template updates
- Version controlled in Git
- Easy to review changes

**Why MJML?**

- Responsive HTML across all email clients
- Handles email quirks (Outlook, Gmail, etc.)
- Auto-generated plain text versions

**Why Official Mailtrap SDK?**

- Full TypeScript support
- Better error handling
- Official support and updates

---

## Template System

### MJML Playground

- Design in <https://mjml.io/try-it-live>
- Export MJML code
- Replace hardcoded values with design tokens
- Share with developer

### Language-Specific Templates

Templates support multiple languages through separate template files:

- `template.en.mjml` - English (required)
- `template.vi.mjml` - Vietnamese (optional)
- `template.ja.mjml` - Japanese (optional)

**How Language Selection Works:**

1. User's language preference is passed to `renderTemplateFromFile(templateId, data, language)`
2. Template loader tries to load `template.{language}.mjml` first
3. Falls back to `template.mjml` if language-specific file doesn't exist
4. Falls back to `template.en.mjml` if neither exists

### Template Structure

Each template consists of:

1. **Language-specific MJML files** - `template.{language}.mjml`
2. **Configuration file** - `config.json` (shared across languages)

### Adding a New Template

#### Step 1: Create Template Directory

```bash
mkdir -p src/modules/email/templates/your-template-name
```

#### Step 2: Create Language-Specific Template Files

Create `template.en.mjml`, `template.vi.mjml`, `template.ja.mjml`:

```mjml
<mjml>
  <mj-head>
    <mj-title>Your Email Title</mj-title>
  </mj-head>
  <mj-body background-color="{{colors.bgBase}}">
    <!-- Header -->
    <mj-section background-color="{{colors.primary}}" padding="{{spacing.paddingLG}} {{spacing.paddingSM}}">
      <mj-column>
        <mj-text align="center" color="{{colors.white}}" font-size="{{typography.fontSizeHero}}" font-weight="{{typography.fontWeightBold}}">
          Your Title
        </mj-text>
      </mj-column>
    </mj-section>
    
    <!-- Body -->
    <mj-section background-color="{{colors.bgContainer}}" padding="{{spacing.paddingLG}} {{spacing.paddingMD}}">
      <mj-column>
        <mj-text font-size="{{typography.fontSizeBody}}" color="{{colors.textSecondary}}" line-height="1.6">
          Hi {{userName}},
        </mj-text>
        <mj-text font-size="{{typography.fontSizeBody}}" color="{{colors.textSecondary}}" line-height="1.6">
          Your email content here.
        </mj-text>
        <mj-button 
          background-color="{{colors.primary}}" 
          color="{{colors.white}}" 
          href="{{appUrl}}"
          border-radius="{{shape.borderRadius}}"
          padding="14px 32px"
          font-size="{{typography.fontSizeBody}}"
          font-weight="{{typography.fontWeightBold}}">
          Call to Action
        </mj-button>
      </mj-column>
    </mj-section>
    
    <!-- Footer (required for CAN-SPAM compliance) -->
    <mj-section background-color="{{colors.bgBase}}" padding="{{spacing.paddingMD}}">
      <mj-column>
        <mj-text align="center" font-size="{{typography.fontSizeCaption}}" color="{{colors.textTertiary}}">
          Happy Learning! 🚀<br/>
          The WatashiWa Team<br/><br/>
          <a href="{{appUrl}}/profile" style="color: {{colors.link}}; text-decoration: none;">Manage Account</a> | 
          <a href="{{appUrl}}/help" style="color: {{colors.link}}; text-decoration: none;">Help Center</a>
          <br/><br/>
          <small style="color: {{colors.textTertiary}};">
            {{companyAddress}}<br/>
            <a href="{{appUrl}}/unsubscribe" style="color: {{colors.link}}; text-decoration: underline;">Unsubscribe</a> | 
            <a href="{{appUrl}}/privacy" style="color: {{colors.link}}; text-decoration: underline;">Privacy Policy</a>
          </small>
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```

#### Step 3: Create Config JSON

Create `config.json`:

```json
{
  "id": "your-template-name",
  "name": "Your Template Name",
  "subject": {
    "en": "Your Subject Line",
    "vi": "Dòng chủ đề của bạn",
    "ja": "あなたの件名"
  },
  "variables": {
    "required": ["userName", "userEmail"],
    "optional": ["appUrl", "customField"]
  },
  "metadata": {
    "category": "transactional",
    "version": "1.0.0"
  }
}
```

#### Step 4: Use in Code

```typescript
import { renderTemplateFromFile } from '@/modules/email/utils/template-loader';

const templates = renderTemplateFromFile(
  'your-template-name',
  {
    userName: 'John Doe',
    userEmail: 'john@example.com',
    customField: 'value',
  },
  'en' // or 'vi', 'ja' - based on user's language preference
);

// templates.html - HTML version
// templates.text - Plain text version (auto-generated)
// templates.subject - Subject line for the language
```

### Design Tokens

**Colors:**

- `{{colors.primary}}` - #1E3A5F (Primary actions, headers)
- `{{colors.success}}` - #708238 (Success states)
- `{{colors.error}}` - #E64A19 (Error states)
- `{{colors.bgBase}}` - #F9F7F2 (App background)
- `{{colors.bgContainer}}` - #FFFFFF (Cards, modals)
- `{{colors.text}}` - #2D2D2D (Primary text)
- `{{colors.textSecondary}}` - #8C8C8C (Secondary text)
- `{{colors.textTertiary}}` - #999999 (Lighter text)
- `{{colors.border}}` - #EEEEEE (Light border)
- `{{colors.link}}` - #1E3A5F (Link color)
- `{{colors.white}}` - #FFFFFF (White text on colored backgrounds)

**Spacing:**

- `{{spacing.paddingLG}}` - 40px
- `{{spacing.paddingMD}}` - 30px
- `{{spacing.paddingSM}}` - 20px
- `{{spacing.paddingXS}}` - 16px

**Typography:**

- `{{typography.fontSizeHero}}` - 28px (Hero/Header text)
- `{{typography.fontSizeTitle}}` - 24px (Page title)
- `{{typography.fontSizeBody}}` - 16px (Body text)
- `{{typography.fontSizeCaption}}` - 14px (Meta/Caption)
- `{{typography.fontWeightBold}}` - 600
- `{{typography.fontWeightNormal}}` - 400

**Shape:**

- `{{shape.borderRadius}}` - 8px
- `{{shape.borderRadiusLarge}}` - 12px

**Special Variables:**

- `{{appUrl}}` - Application URL (auto-set from `NEXT_PUBLIC_APP_URL`)
- `{{companyAddress}}` - Physical address (auto-set from `COMPANY_PHYSICAL_ADDRESS`)

---

## Design Guidelines

### Brand Voice: "Zen Mastery"

**Core Principles:**

- **Calm & Focused:** No urgency, no pressure
- **Authentic & Helpful:** Genuine, not salesy
- **Respectful:** Trust the user's intelligence
- **Minimal:** Clear, concise, purposeful

### Spam Prevention Checklist

**❌ Avoid These Spam Triggers:**

**Urgency Words:**

- ❌ "URGENT", "ACT NOW", "LIMITED TIME"
- ❌ "Don't miss out", "Last chance"
- ✅ Use: "When you're ready", "Take your time"

**Sales Language:**

- ❌ "FREE", "CLICK HERE", "BUY NOW"
- ❌ "Special offer", "Exclusive deal"
- ✅ Use: Natural CTAs like "Begin Your Journey"

**Excessive Punctuation:**

- ❌ "Welcome!!!", "Verify NOW!!!"
- ❌ Multiple exclamation marks
- ✅ Use: One period, calm tone

**All Caps:**

- ❌ "VERIFY YOUR EMAIL"
- ✅ Use: "Verify your email address"

**Suspicious Links:**

- ❌ Shortened URLs (bit.ly, etc.)
- ❌ Generic link text ("Click here")
- ✅ Use: Full URLs, descriptive link text

### Subject Line Best Practices

**✅ Good Examples:**

- "Welcome to WatashiWa"
- "Verify your email address"
- "Your study session summary"

**❌ Bad Examples:**

- "🎉 Welcome to WatashiWa! 🎉" (too many emojis)
- "URGENT: Verify Your Email NOW!"
- "FREE: Start Learning Today!"

**Rules:**

1. No emojis in subject (or max 1, used sparingly)
2. Keep it under 50 characters (mobile preview)
3. Be specific and clear
4. No spam trigger words

### Content Guidelines

**Welcome Email:**

- Tone: Warm, welcoming, helpful
- Purpose: Onboard, not sell
- Good: "Thanks for joining WatashiWa", "Begin Your Journey"
- Avoid: "We're THRILLED!", "Don't miss out"

**OTP Email:**

- Tone: Clear, secure, helpful
- Purpose: Verify, not alarm
- Good: "Use this code to verify your email address", "Security note:"
- Avoid: "URGENT: Verify immediately!", "⚠️ Important: Act now!"

### CAN-SPAM Compliance

**Required Elements:**

1. **Unsubscribe Link**
   - Must be visible and functional
   - One-click unsubscribe preferred
   - Process within 10 business days

2. **Physical Address**
   - Include company physical address
   - Set via `COMPANY_PHYSICAL_ADDRESS` env var

3. **From Name & Email**
   - Use consistent sender name
   - Use verified domain email
   - Set via `MAILTRAP_FROM_NAME` and `MAILTRAP_FROM_EMAIL`

4. **Clear Identification**
   - Identify as advertisement if applicable
   - Transactional emails don't need this

---

## Examples

### Welcome Email

**Template Files:**

- `templates/welcome/template.en.mjml`
- `templates/welcome/template.vi.mjml`
- `templates/welcome/template.ja.mjml`
- `templates/welcome/config.json`

**Usage:**

```typescript
const templates = renderTemplateFromFile(
  'welcome',
  {
    userName: 'John Doe',
    userEmail: 'john@example.com',
  },
  'en'
);
```

### OTP Verification Email

**Template Files:**

- `templates/otp-verification/template.en.mjml`
- `templates/otp-verification/template.vi.mjml`
- `templates/otp-verification/template.ja.mjml`
- `templates/otp-verification/config.json`

**Usage:**

```typescript
const templates = renderTemplateFromFile(
  'otp-verification',
  {
    userName: 'John Doe',
    userEmail: 'john@example.com',
    otp: '123456',
  },
  'en'
);
```

See actual template files in `src/modules/email/templates/` for complete examples.

---

## Multi-Language Support

### How It Works

1. **User Language Preference**
   - Stored in user profile (`language` field
   - Passed in event data when triggering emails

2. **Template Selection**
   - Template loader receives `language` parameter
   - Loads `template.{language}.mjml` file
   - Falls back to English if language file doesn't exist

3. **Subject Line Selection**
   - Selected from `config.json` based on language
   - Falls back to English if language not available

### Example Flow

```
User Registration (language: 'vi')
    ↓
Event: { userEmail, userName, language: 'vi' }
    ↓
renderTemplateFromFile('welcome', data, 'vi')
    ↓
Loads: template.vi.mjml (Vietnamese content)
Loads: config.json
Selects: config.subject.vi → "Chào mừng bạn đến với WatashiWa"
    ↓
Email Sent:
- Subject: "Chào mừng bạn đến với WatashiWa" (Vietnamese)
- Body: Vietnamese content (fully translated)
```

### Adding a New Language

1. Create `template.{language}.mjml` file
2. Add subject line to `config.json`:

   ```json
   {
     "subject": {
       "en": "Welcome to WatashiWa",
       "vi": "Chào mừng bạn đến với WatashiWa",
       "ja": "WatashiWaへようこそ",
       "new-lang": "Translation here"
     }
   }
   ```

3. Update template loader if needed (currently supports en, vi, ja)

---

## Troubleshooting

### Emails Not Sending

1. **Check Mailtrap API token**
   - Verify `MAILTRAP_API_TOKEN` is set correctly
   - Check token is valid in Mailtrap dashboard

2. **Check Inngest Dev Server**
   - Ensure `npx inngest-cli@latest dev` is running
   - Check Inngest UI for function execution logs

3. **Check function runs in Inngest UI**
   - Open Inngest Dev Server UI (usually <http://localhost:8288>)
   - Look for function execution logs
   - Check for errors

### OTP Not Working

1. **Verify database migration ran**
   - Check `emailVerificationOTP` field exists in User model
   - Run `pnpm db:push` if needed

2. **Check rate limit**
   - Default: 3 requests per hour
   - Wait 1 hour if rate limit hit
   - Check `emailVerificationOTPExpires` in database

3. **Verify OTP format**
   - Must be 6 digits, numeric only
   - Check OTP generation in `otp-generator.ts`

### Inngest Functions Not Running

1. **Ensure Inngest Dev Server is running**
   - Run `npx inngest-cli@latest dev`
   - Check it's listening on correct port

2. **Check `/api/inngest/route.ts` exists**
   - Verify route handler is registered
   - Check Inngest functions are exported

3. **Verify event names match exactly**
   - Event: `user/registered` → Function: `send-welcome-email`
   - Event: `user/otp.requested` → Function: `send-otp-email`
   - Case-sensitive, must match exactly

### Template Not Found

1. **Check template directory exists**
   - Verify `src/modules/email/templates/{template-id}/` exists
   - Check file names: `template.en.mjml`, `template.vi.mjml`, etc.

2. **Check config.json exists**
   - Must be in same directory as template files
   - Verify JSON is valid

3. **Check required variables**
   - Template loader validates required variables
   - Error message will list missing variables

### Language-Specific Template Not Loading

1. **Check language file exists**
   - Verify `template.{language}.mjml` exists
   - Falls back to `template.en.mjml` if not found

2. **Check language parameter**
   - Verify `language` is passed to `renderTemplateFromFile()`
   - Defaults to 'en' if not provided

---

## Reference

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `INNGEST_DEV` | Yes (local) | Enable Inngest dev mode | - |
| `INNGEST_APP_ID` | Yes | Inngest app identifier | `watashi-jp` |
| `MAILTRAP_API_TOKEN` | Yes | Mailtrap API token | - |
| `MAILTRAP_FROM_EMAIL` | Yes | Sender email address | `noreply@watashi-jp.com` |
| `MAILTRAP_FROM_NAME` | Yes | Sender name | `WatashiWa` |
| `NEXT_PUBLIC_APP_URL` | Yes | Application base URL | `http://localhost:3000` |
| `COMPANY_PHYSICAL_ADDRESS` | No | Physical address (CAN-SPAM) | Placeholder |

### API Functions

**Server Actions (`email.actions.ts`):**

- `requestEmailVerification()` - Request OTP code
- `verifyEmailOTP(data)` - Verify OTP code
- `getEmailVerificationStatus()` - Get verification status

**Inngest Functions:**

- `send-welcome-email` - Triggered by `user/registered` event
- `send-otp-email` - Triggered by `user/otp.requested` event

**Template Loader:**

- `renderTemplateFromFile(templateId, data, language)` - Render template
- `discoverTemplates()` - Auto-discover all templates
- `validateTemplate(templateId)` - Validate template structure

### Template Discovery & Validation

**`discoverTemplates()`** - Auto-discover all templates

Returns array of template IDs found in `templates/` directory.

**Use Cases:**

- CI/CD pipeline validation
- Admin panel to list available templates
- Health check endpoints
- Development tools

**Example:**

```typescript
import { discoverTemplates } from '@/modules/email/utils/template-loader';

const templates = discoverTemplates();
// Returns: ['welcome', 'otp-verification']
```

**`validateTemplate(templateId)`** - Validate template structure

Validates that template has required files and correct structure.

**Use Cases:**

- Pre-deployment validation
- CI/CD checks
- Admin panel health checks
- Development validation

**Example:**

```typescript
import { validateTemplate } from '@/modules/email/utils/template-loader';

const result = validateTemplate('welcome');
if (!result.valid) {
  console.error('Template errors:', result.errors);
  // ['Template file not found: ...', 'Config file not found: ...']
}
```

**Validation Checks:**

- Template directory exists
- At least one template file exists (template.en.mjml, template.vi.mjml, etc.)
- config.json exists and is valid JSON
- Required config fields present (id, name, subject, variables)

**Practical Examples:**

1. **CI/CD Validation Script:**

```bash
# In package.json
"validate:email-templates": "tsx scripts/validate-email-templates.ts"

# Run before deployment
pnpm validate:email-templates
```

1. **Admin API Endpoint:**

```typescript
// GET /api/admin/email-templates
const templates = discoverTemplates();
const status = templates.map(id => validateTemplate(id));
```

1. **Pre-Send Validation:**

```typescript
// Before sending email, validate template
const validation = validateTemplate('welcome');
if (!validation.valid) {
  throw new Error(`Template invalid: ${validation.errors.join(', ')}`);
}
```

### OTP Settings

**Default Configuration:**

- **Length:** 6 digits
- **Format:** Numeric only
- **Expiration:** 15 minutes
- **Rate Limit:** 3 requests per hour
- **Hashing:** SHA-256

**Customization:**
Edit `src/modules/email/utils/otp-generator.ts` and `email.actions.ts`

### Production Deployment

**Option A: Self-Host Inngest (Recommended)**

```bash
# On your production server
npm install -g inngest-cli
pm2 start inngest -- start

# Environment variables
INNGEST_DEV=1
INNGEST_BASE_URL=http://your-server:8288
INNGEST_APP_ID=watashi-jp
```

**Option B: Inngest Cloud (Optional)**

```bash
# Environment variables
INNGEST_APP_ID=watashi-jp
INNGEST_EVENT_KEY=your-event-key
INNGEST_SIGNING_KEY=your-signing-key
# Don't set INNGEST_DEV=1
```

### Getting API Keys

**Mailtrap:**

1. Go to <https://mailtrap.io>
2. Navigate to Email API → API Tokens
3. Create and copy token

**Inngest Cloud (Optional):**

1. Go to <https://cloud.inngest.com>
2. Create app → Go to "Keys" section
3. Copy Event Key and Signing Key

**Note:** For local development, you don't need Inngest keys!

---

## Summary

**Current Implementation:**

- ✅ File-based templates with language support
- ✅ Inngest background job processing
- ✅ Mailtrap SDK integration
- ✅ Design system tokens
- ✅ CAN-SPAM compliance
- ✅ Full multi-language support (en, vi, ja)

**Key Benefits:**

- Designers work independently
- No code deployment for template updates
- Scalable and maintainable
- Type-safe and well-tested

**Quick Reference:**

- Quick Start: [EMAIL_VERIFICATION_QUICK_START.md](./EMAIL_VERIFICATION_QUICK_START.md)
- Templates: `src/modules/email/templates/`
- Loader: `src/modules/email/utils/template-loader.ts`
- Actions: `src/modules/email/email.actions.ts`
