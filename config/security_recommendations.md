# Security Audit & Recommendations

**Date:** 2025-12-15
**Auditor:** Antigravity (Senior Security Engineer)
**Scope:** Current codebase (`src`) and configuration (`config`).

---

## 1. Executive Summary

The "WatashiWa" application has a foundational security posture with HTTPS enforcement and basic authentication via Supabase. However, there are significant areas for improvement, particularly regarding **Content Security Policy (CSP)**, **Input Validation**, and **Rate Limiting**. Addressing these will significantly reduce the risk of XSS, Injection, and Abuse attacks.

---

## 2. Infrastructure & Configuration (Nginx)

### A. Content Security Policy (CSP) - **CRITICAL**

The current CSP in `watashiwa.conf` is overly permissive:
`default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval';`

* **Risk**: `http:` and `https:` whitelist *every* domain on the internet, nullifying protections against malicious external scripts. `'unsafe-inline'` and `'unsafe-eval'` leave the app vulnerable to XSS.
* **Recommendation**: Tighten the CSP. Since Next.js requires `'unsafe-inline'` for some styles (unless nonces are strictly used), at least restrict the domains.

**Recommended Nginx Config Update:**

```nginx
# Remove generic http: https: and restricted specific allowed domains
# Add specific directives for script-src, style-src, img-src, etc.

add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://*.posthog.com https://*.sentry.io; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.posthog.com https://*.sentry.io; frame-ancestors 'self';" always;
```

### B. HSTS (HTTP Strict Transport Security)

* **Observation**: Missing in `watashiwa.conf`.
* **Risk**: Users might be downgraded to HTTP by MITM attacks on their first visit (before the 301 redirect).
* **Recommendation**: Add HSTS header.

```nginx
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
```

### C. Permissions Policy

* **Observation**: Missing.
* **Recommendation**: Explicitly disable powerful browser features you don't use.

```nginx
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), browsing-topics=()" always;
```

---

## 3. Application Security (Next.js & Code)

### A. Input Validation - **HIGH PRIORITY**

* **Observation**: `src/services/actions.ts` performs minimal validation (e.g., checking `rating` is 1-4). There is no systematic schema validation for inputs like strings, UUIDs, or complex objects.
* **Risk**: Malformed data can cause unexpected errors or be used for logical exploits.
* **Recommendation**: Integrate **Zod** for runtime schema validation in all Server Actions.

**Example Implementation:**

```typescript
import { z } from 'zod';

const ReviewSchema = z.object({
  cardId: z.string().uuid(),
  rating: z.number().int().min(1).max(4),
});

export async function submitReview(cardId: string, rating: number) {
  const result = ReviewSchema.safeParse({ cardId, rating });
  if (!result.success) {
    return { success: false, error: 'Invalid input data' };
  }
  // Proceed...
}
```

### B. Rate Limiting

* **Observation**: No application-level rate limiting observed in Middleware or Server Actions. Nginx limits are not visible in the provided snippet (upstream definition only).
* **Risk**: API abuse, brute force login attempts (handled partly by Supabase, but app logic is exposed), and Denial of Service (DoS).
* **Recommendation**: Implement rate limiting for critical actions (reviews, deck creation) using `@upstash/ratelimit` (if using Vercel/Serverless) or a custom Redis implementation.

### C. Sensitive Data Logging

* **Observation**: `console.log` is used throughout `actions.ts`.
  * Example: `Daily Stats for ${user.id}...`
* **Risk**: In production, logs might leak sensitive user patterns or identifiers to log aggregation services.
* **Recommendation**: Use a proper logging library (e.g., specific Sentry capture or Pino) and ensure logs are sanitized. Disable verbose logs in production.

---

## 4. Authentication & Authorization

### A. Middleware Security

* **Observation**: `src/utils/supabase/middleware.ts` checks for user existence but doesn't implement strict session validation beyond what Supabase provides.
* **Recommendation**: Ensure `supabase.auth.getUser()` is actually hitting the Auth server to validate the JWT, not just reading the local cookie (Supabase's `getUser` does verify, which is good).

### B. Role-Based Access Control (RBAC)

* **Observation**: `requireRole` and `hasRole` imports exist.
* **Recommendation**: Ensure *every* sensitive Server Action (e.g., `deleteDeck`, `updateUser`) is wrapped with these checks.

---

## 5. Dependency Management

* **Observation**: `package.json` has fixed versions for some deps, carets for others.
* **Recommendation**:
  * Run `pnpm audit` regularly in CI/CD.
  * Consider using `zod` for validation (currently missing).
  * Remove unused dev dependencies if any.

## 6. Summary of Action Items

1. **[Immediate]** Update Nginx `watashiwa.conf` to tighten CSP and add HSTS.
2. **[High]** Install `zod` and implement schema validation in `src/services/actions.ts`.
3. **[Medium]** Add rate limiting to `submitReview` and other write-heavy actions.
4. **[Medium]** Audit `console.log` usage and replace with proper logging.
