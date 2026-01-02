# Feature: Authentication

## Overview

Authentication is the gateway to the application, ensuring that users can securely access their personal study data. We use **Supabase Auth** for identity management and session handling.

## User Flows

### 1. Sign Up

- **Endpoint**: `/login` (Toggle to Sign Up)
- **Input**: Email, Password
- **Process**:
  1. User enters credentials.
  2. System creates a Supabase Auth user.
  3. **Auto-Login vs Confirmation**:
     - _If "Confirm Email" is Disabled in Supabase_: User is logged in immediately and redirected to `/`.
     - _If "Confirm Email" is Enabled_: Application shows "Check your email" message.
  4. **Email Confirmation Flow** (If Enabled):
     - User receives email with link: `…/auth/callback?code=xyz`.
     - Clicking link hits `/auth/callback` route.
     - Server exchanges `code` for `session`.
     - **Redirect**: User is automatically logged in and redirected to `/` (Dashboard).
  5. **Important**: User is _not_ considered active until they have a `User` record in our PostgreSQL database (handled via Seed or Signals).

### 2. Login

- **Endpoint**: `/login`
- **Input**: Email, Password
- **Process**:
  1. User enters credentials.
  2. System authenticates against Supabase.
  3. A Session Cookie is set (Duration: **30 days**).
  4. User is redirected to `/` (Dashboard).
- **Error Handling**: Invalid credentials show an error alert.

### 3. Forgot Password

- **Endpoint**: `/forgot-password`
- **Process**:
  1. User enters email.
  2. System sends a Password Reset Link.
  3. User clicks link -> Redirects to `/auth/callback` -> Redirects to `/reset-password`.
  4. User enters new password.
  5. Password is updated, user is logged in.

### 4. Route Protection

- **Mechanism**: Next.js Proxy (`src/proxy.ts`)
- **Protected Routes**:
  - `/` (Dashboard)
  - `/study`
  - `/decks`
  - `/stats`
- **Behavior**: Unauthenticated requests to these routes are redirected to `/login`.

## Technical Implementation

### Tech Stack

- **Auth Provider**: Supabase Auth (GoTrue)
- **Adapter**: `@supabase/ssr` (Next.js App Router compatible)
- **State**: HttpOnly Cookies

### Session Management

- **Persistence**: Sessions last for **30 days** (2,592,000 seconds).
- **Refresh**: Proxy automatically refreshes tokens if they are close to expiry.
- **Multi-Device Support**: Supabase Auth supports multiple concurrent sessions per user. Each device maintains its own session independently. Logging out from one device does not affect sessions on other devices.

### Data Security

- **Multi-tenancy**: All database queries in `actions.ts` MUST filter by `userId` obtained from `getUser()`.
- **Row Level Security (RLS)**: (Future) Can be enabled on Supabase Postgres level for extra security.

## Future Enhancements

- [ ] OAuth Providers (Google, GitHub)
- [ ] Profile Management (Avatar, Display Name)
