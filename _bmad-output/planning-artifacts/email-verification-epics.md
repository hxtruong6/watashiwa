# Email Verification & Welcome Email Feature - Epics & Stories

**Generated:** 2025-01-01  
**Last Updated:** 2025-01-01  
**Status:** ✅ **COMPLETED**  
**Feature:** Email Verification with OTP and Welcome Email  
**Architecture:** Vertical Slice with Inngest Background Jobs + MJML Templates + Official Mailtrap SDK

---

## Epic 1: Email Infrastructure Setup ✅ COMPLETED

### Story 1.1: Install and Configure Inngest ✅

**As a** developer  
**I want** Inngest SDK installed and configured  
**So that** I can run background jobs for email sending

**Acceptance Criteria:**

- [x] Inngest SDK installed (`inngest` package)
- [x] Inngest client created at `src/inngest/client.ts`
- [x] Inngest API route handler at `src/app/api/inngest/route.ts`
- [x] Inngest Dev Server can discover and run functions locally
- [x] Environment variables configured (`INNGEST_DEV=1` for local, keys for production)

**Implementation Notes:**

- ✅ Uses Next.js App Router integration (`inngest/next`)
- ✅ Configured for local development (no keys needed) and production
- ✅ Functions registered in `/api/inngest/route.ts`

---

### Story 1.2: Set Up Mailtrap Email Service ✅

**As a** developer  
**I want** Mailtrap configured for email sending  
**So that** I can send transactional emails reliably

**Acceptance Criteria:**

- [x] Mailtrap SDK configured (official `mailtrap` npm package)
- [x] Environment variables for Mailtrap API (`MAILTRAP_API_TOKEN`, `MAILTRAP_FROM_EMAIL`, `MAILTRAP_FROM_NAME`)
- [x] Email service module created at `src/modules/email/email.service.ts`
- [x] Email service supports sending HTML emails
- [x] Error handling and retry logic implemented

**Implementation Notes:**

- ✅ Uses official Mailtrap SDK (`mailtrap` package) for type safety
- ✅ Supports both development and production modes
- ✅ Proper error handling and logging implemented

---

### Story 1.3: Create Professional Email Templates ✅

**As a** user  
**I want** to receive professional, branded email templates  
**So that** I have a good first impression of the application

**Acceptance Criteria:**

- [x] Welcome email template created (HTML + plain text)
- [x] OTP verification email template created (HTML + plain text)
- [x] Templates use responsive design (mobile-friendly)
- [x] Templates include brand colors and styling
- [x] Templates support i18n (English, Vietnamese, Japanese)
- [x] Templates stored in `src/modules/email/utils/template-renderer.ts`

**Implementation Notes:**

- ✅ Uses **MJML** for responsive HTML that works across all email clients
- ✅ Templates embedded in TypeScript (no file I/O)
- ✅ Auto-generated plain text versions from HTML
- ✅ Supports i18n via language parameter in Inngest events
- ✅ Professional design with brand colors (#667eea)

---

## Epic 2: Database Schema Updates ✅ COMPLETED

### Story 2.1: Add Email Verification Fields to User Model ✅

**As a** developer  
**I want** email verification fields in the User model  
**So that** I can track verification status and store OTP codes

**Acceptance Criteria:**

- [x] Add `emailVerifiedAt` DateTime field (nullable) - tracks when verified
- [x] Add `emailVerificationOTP` string field (nullable) - stores hashed OTP
- [x] Add `emailVerificationOTPExpires` DateTime field (nullable) - OTP expiration
- [x] Create and run Prisma migration
- [x] Update TypeScript types

**Implementation Notes:**

- ✅ Uses `emailVerifiedAt` (DateTime) instead of boolean for better tracking
- ✅ OTP expires after 15 minutes
- ✅ OTP is 6-digit numeric code
- ✅ OTP is hashed (SHA-256) before storage
- ✅ Email cannot be changed (enforced by unique constraint)

---

## Epic 3: Background Job Implementation ✅ COMPLETED

### Story 3.1: Create Inngest Function for Welcome Email ✅

**As a** system  
**I want** to send welcome emails in the background  
**So that** user registration is not blocked by email sending

**Acceptance Criteria:**

- [x] Inngest function `send-welcome-email` created
- [x] Function triggered by `user/registered` event
- [x] Function sends welcome email via email service
- [x] Function handles errors gracefully (retries, logging)
- [x] Function registered in Inngest serve handler

**Implementation Notes:**

- ✅ Uses Inngest steps for durability
- ✅ Retry logic: 3 attempts with exponential backoff
- ✅ Logs email sending events for debugging
- ✅ Renders MJML templates before sending
- ✅ Supports i18n (English, Vietnamese, Japanese)

---

### Story 3.2: Create Inngest Function for OTP Email ✅

**As a** system  
**I want** to send OTP verification emails in the background  
**So that** users can verify their email without blocking the UI

**Acceptance Criteria:**

- [x] Inngest function `send-otp-email` created
- [x] Function triggered by `user/otp.requested` event
- [x] OTP generated in server action (before event trigger)
- [x] OTP stored in database with expiration (in server action)
- [x] Function sends OTP email via email service
- [x] Function handles errors gracefully

**Implementation Notes:**

- ✅ OTP generation: 6-digit random number (in `email.actions.ts`)
- ✅ OTP expiration: 15 minutes
- ✅ OTP stored hashed in User model (SHA-256)
- ✅ Rate limiting: max 3 OTP requests per hour per user
- ✅ OTP passed to Inngest function via event data

---

## Epic 4: User Registration Flow Integration ✅ COMPLETED

### Story 4.1: Send Welcome Email on User Registration ✅

**As a** new user  
**I want** to receive a welcome email after registration  
**So that** I feel welcomed and understand the next steps

**Acceptance Criteria:**

- [x] After successful signup, trigger `user/registered` event
- [x] Event includes user email, name, user ID, and language
- [x] Welcome email sent asynchronously (non-blocking)
- [x] User can log in immediately (no email verification required)
- [x] Email includes welcome message and next steps

**Implementation Notes:**

- ✅ Triggered from `syncUser()` when `isNewUser === true`
- ✅ Uses Inngest `send()` method (fire-and-forget)
- ✅ Does not block user login/redirect
- ✅ Error handling: logs errors but doesn't fail registration

---

## Epic 5: Email Verification Flow ✅ COMPLETED

### Story 5.1: Request Email Verification OTP ✅

**As a** user  
**I want** to request an OTP to verify my email  
**So that** I can verify my email address when I'm ready

**Acceptance Criteria:**

- [x] Server action `requestEmailVerification()` created
- [x] Action generates 6-digit OTP
- [x] Action stores OTP with 15-minute expiration
- [x] Action triggers `user/otp.requested` event
- [x] Action enforces rate limiting (3 requests/hour)
- [x] Action returns success/error response

**Implementation Notes:**

- ✅ OTP stored hashed in database (SHA-256)
- ✅ Rate limiting prevents abuse (1 hour cooldown)
- ✅ Returns user-friendly error messages
- ✅ Uses `executeSafeAction` for type safety

---

### Story 5.2: Verify Email with OTP ✅

**As a** user  
**I want** to verify my email using the OTP code  
**So that** my email is marked as verified

**Acceptance Criteria:**

- [x] Server action `verifyEmailOTP()` created
- [x] Action validates OTP code (matches and not expired)
- [x] Action updates `emailVerifiedAt` to current timestamp
- [x] Action clears OTP fields after successful verification
- [x] Action returns success/error response
- [x] Action handles invalid/expired OTP gracefully

**Implementation Notes:**

- ✅ Validates OTP within expiration window (15 minutes)
- ✅ Clears OTP after successful verification
- ✅ Returns clear error messages for invalid/expired OTP
- ✅ Uses `executeSafeAction` for type safety

---

## Epic 6: UI Integration ✅ COMPLETED

### Story 6.1: Add Email Verification Button to Profile ✅

**As a** user  
**I want** to see my email verification status and request verification  
**So that** I can verify my email when convenient

**Acceptance Criteria:**

- [x] Email verification status displayed in profile tab
- [x] "Verify Email" button shown if email not verified
- [x] Button triggers OTP request
- [x] Loading state during OTP request
- [x] Success/error messages displayed
- [x] OTP input modal/form for verification

**Implementation Notes:**

- ✅ Added to `SettingsModal` profile tab
- ✅ Uses Ant Design components (Button, Modal, Input, Flex)
- ✅ Shows verification status with icon (CheckCircle/CloseCircle)
- ✅ Implements OTP input with 6-digit code
- ✅ Uses theme tokens for colors (dark mode support)

---

### Story 6.2: OTP Verification Modal ✅

**As a** user  
**I want** to enter my OTP code in a modal  
**So that** I can verify my email easily

**Acceptance Criteria:**

- [x] Modal opens after requesting OTP
- [x] Modal shows email address being verified
- [x] 6-digit OTP input field (numeric only)
- [x] Submit button to verify OTP
- [x] Loading state during verification
- [x] Success message and modal close on success
- [x] Error message for invalid/expired OTP
- [x] Resend OTP option (respects rate limiting)

**Implementation Notes:**

- ✅ Uses Ant Design Modal and Input components
- ✅ Auto-focus on OTP input
- ✅ Formats OTP input (6 digits, numeric only, auto-advance)
- ✅ Shows expiration message (15 minutes)
- ✅ Resend button with rate limiting
- ✅ Memoized event handlers with `useCallback`

---

## Technical Architecture ✅ IMPLEMENTED

### Module Structure (Vertical Slice)

```
src/modules/email/
├── components/
│   └── EmailVerificationButton.tsx  ✅ UI component for verification
├── utils/
│   ├── otp-generator.ts            ✅ OTP generation, hashing, validation
│   └── template-renderer.ts        ✅ MJML email template rendering
├── email.service.ts                ✅ Mailtrap SDK integration
├── email.actions.ts                 ✅ Server actions (request/verify OTP, get status)
└── email.types.ts                  ✅ TypeScript types
```

### Inngest Functions

```
src/inngest/
├── client.ts                       ✅ Inngest client
└── functions/
    ├── send-welcome-email.ts      ✅ Welcome email function
    └── send-otp-email.ts          ✅ OTP email function
```

### API Routes

```
src/app/api/
└── inngest/
    └── route.ts                    ✅ Inngest serve handler
```

---

## Environment Variables ✅ CONFIGURED

```bash
# Inngest (Local Development - No keys needed!)
INNGEST_DEV=1
INNGEST_APP_ID=watashi-jp

# Inngest (Production - Optional Cloud)
INNGEST_EVENT_KEY=your-event-key
INNGEST_SIGNING_KEY=your-signing-key

# Mailtrap
MAILTRAP_API_TOKEN=your-api-token
MAILTRAP_FROM_EMAIL=noreply@watashi-jp.com
MAILTRAP_FROM_NAME=WatashiWa

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Security Considerations ✅ IMPLEMENTED

1. **OTP Security:**
   - ✅ Store OTP hashed in database (SHA-256)
   - ✅ Rate limiting to prevent brute force (3/hour)
   - ✅ Expiration window (15 minutes)

2. **Email Security:**
   - ✅ Validate email addresses
   - ✅ Prevent email enumeration attacks
   - ✅ Use HTTPS for all email links

3. **Background Jobs:**
   - ✅ Secure Inngest webhook endpoints
   - ✅ Error handling and retry logic (3 retries)
   - ✅ Non-blocking execution

---

## Implementation Differences from Original Plan

### ✅ Improvements Made

1. **MJML Templates:** Used MJML instead of raw HTML for better email client compatibility
2. **Official Mailtrap SDK:** Used official `mailtrap` package instead of manual API calls
3. **Email Verified Tracking:** Used `emailVerifiedAt` (DateTime) instead of boolean for better tracking
4. **OTP Generation Location:** OTP generated in server action (better security) rather than Inngest function
5. **Template Location:** Templates in TypeScript file (MJML) instead of separate HTML files
6. **Local Development:** No Inngest keys needed for local dev (`INNGEST_DEV=1`)

### 📝 Notes

- Templates support i18n via language parameter (English, Vietnamese, Japanese)
- Rate limiting implemented (3 requests per hour)
- OTP hashing implemented (SHA-256)
- All error handling and retry logic implemented
- UI uses Ant Design theme tokens for dark mode support

---

## Testing Status

### ✅ Manual Testing Completed

- [x] Welcome email sent on user registration
- [x] OTP email sent on verification request
- [x] OTP verification works correctly
- [x] Rate limiting enforced
- [x] Error handling works (invalid/expired OTP)
- [x] UI components render correctly

### 📋 Automated Testing (Future)

- [ ] Unit tests for OTP generation and validation
- [ ] Unit tests for email template rendering
- [ ] Integration tests for Inngest functions
- [ ] E2E tests for complete verification flow

---

## Success Metrics (To Track)

- Welcome email delivery rate > 95%
- OTP email delivery rate > 95%
- Email verification completion rate > 60%
- Average time to verify email < 5 minutes
- Background job success rate > 99%

---

## Future Enhancements

- [ ] Email verification reminder (if not verified after 7 days)
- [ ] Resend welcome email option
- [ ] Email verification analytics dashboard
- [ ] Support for multiple email addresses (future)
- [ ] Email change flow (if needed in future)
- [ ] Automated tests (unit, integration, E2E)

---

## Summary

**Status:** ✅ **ALL EPICS COMPLETED**

All 6 epics and 10 stories have been successfully implemented:

- ✅ Email infrastructure (Inngest + Mailtrap + MJML)
- ✅ Database schema updates
- ✅ Background job functions
- ✅ Registration flow integration
- ✅ Email verification flow
- ✅ UI integration

The system is production-ready with proper error handling, security measures, and user experience considerations.
