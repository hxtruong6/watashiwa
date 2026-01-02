# Security Recommendations Gap Analysis

**Date:** 2025-12-31
**Source:** Security Audit Recommendations (`config/security_recommendations.md`)
**Status:** Gap Analysis Complete

---

## Executive Summary

The security audit identified **6 critical and high-priority security improvements** that are **not explicitly covered** in the current epics and stories. While general security NFRs (NFR13-NFR24) exist, specific implementation stories for infrastructure security, input validation, rate limiting, and secure logging are missing.

**Gap Status:** ⚠️ **Security stories need to be added**

---

## Security Recommendations vs. Current Coverage

### 1. Content Security Policy (CSP) - **CRITICAL** ❌ NOT COVERED

**Recommendation:**

- Tighten CSP in Nginx configuration
- Remove overly permissive `http: https:` wildcards
- Add specific directives for script-src, style-src, img-src, etc.

**Current Coverage:**

- ❌ No explicit story for CSP implementation
- ❌ NFRs mention TLS 1.3 (NFR14) but not CSP headers
- ✅ Architecture mentions security but not CSP specifics

**Gap:** Infrastructure security story needed

**Suggested Story:**

- **Epic 1 or New Security Epic**: "Implement Content Security Policy (CSP) Headers"
- **Acceptance Criteria**: CSP configured with specific allowed domains, no wildcard protocols, proper directives for Next.js requirements

---

### 2. HSTS (HTTP Strict Transport Security) - **CRITICAL** ❌ NOT COVERED

**Recommendation:**

- Add HSTS header: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

**Current Coverage:**

- ❌ No explicit story for HSTS implementation
- ✅ NFR14 mentions TLS 1.3 but not HSTS headers

**Gap:** Infrastructure security header story needed

**Suggested Story:**

- **Epic 1 or New Security Epic**: "Implement HSTS and Security Headers"
- **Acceptance Criteria**: HSTS header configured, Permissions Policy header added, security headers tested

---

### 3. Permissions Policy - **MEDIUM** ❌ NOT COVERED

**Recommendation:**

- Add Permissions Policy header to disable unused browser features

**Current Coverage:**

- ❌ Not mentioned in epics or NFRs

**Gap:** Can be combined with HSTS story above

---

### 4. Input Validation with Zod - **HIGH PRIORITY** ⚠️ PARTIALLY COVERED

**Recommendation:**

- Install Zod and implement schema validation in all Server Actions
- Validate UUIDs, strings, complex objects

**Current Coverage:**

- ⚠️ Architecture mentions "Zod schemas" for AI Content Factory (line 161)
- ⚠️ Architecture mentions "JSON validation (Zod schemas)" for Story Engine
- ❌ No explicit story for implementing Zod validation in Server Actions
- ❌ No story for validating user inputs (ratings, cardIds, etc.)

**Gap:** Application-level input validation story needed

**Suggested Story:**

- **Epic 1 or Epic 2**: "Implement Zod Schema Validation for Server Actions"
- **Acceptance Criteria**: Zod installed, all Server Actions validate inputs with schemas, invalid inputs return clear errors

---

### 5. Rate Limiting - **MEDIUM** ❌ NOT COVERED

**Recommendation:**

- Implement rate limiting for critical actions (reviews, deck creation)
- Use `@upstash/ratelimit` or Redis implementation

**Current Coverage:**

- ❌ No explicit story for rate limiting
- ❌ NFRs mention API capacity (NFR11: 100+ req/sec) but not rate limiting per user
- ✅ Architecture mentions scalability but not abuse prevention

**Gap:** Rate limiting story needed

**Suggested Story:**

- **Epic 2 or New Security Epic**: "Implement Rate Limiting for Critical Actions"
- **Acceptance Criteria**: Rate limiting middleware implemented, limits configured for reviews/deck creation, proper error responses

---

### 6. Sensitive Data Logging - **MEDIUM** ❌ NOT COVERED

**Recommendation:**

- Replace `console.log` with proper logging library (Sentry/Pino)
- Sanitize logs to prevent sensitive data leakage
- Disable verbose logs in production

**Current Coverage:**

- ⚠️ Architecture mentions Sentry 10.32.1 for error monitoring
- ❌ No explicit story for secure logging practices
- ❌ No story for log sanitization

**Gap:** Secure logging story needed

**Suggested Story:**

- **Epic 6 or New Security Epic**: "Implement Secure Logging Practices"
- **Acceptance Criteria**: Logging library integrated, sensitive data sanitized, production logs configured, verbose logs disabled in production

---

### 7. Middleware Security - ⚠️ PARTIALLY COVERED

**Recommendation:**

- Ensure `supabase.auth.getUser()` validates JWT with Auth server
- Implement strict session validation

**Current Coverage:**

- ✅ Story 1.2 covers authentication and JWT tokens (NFR17)
- ⚠️ Story mentions JWT but doesn't explicitly validate middleware security
- ✅ Architecture mentions Supabase Auth integration

**Gap:** Minor - Could add explicit middleware validation to Story 1.2

---

### 8. Role-Based Access Control (RBAC) - ⚠️ PARTIALLY COVERED

**Recommendation:**

- Ensure all sensitive Server Actions wrapped with `requireRole`/`hasRole` checks

**Current Coverage:**

- ⚠️ Architecture mentions `requireRole` and `hasRole` exist
- ❌ No explicit story for RBAC enforcement across all Server Actions
- ❌ Stories don't mention RBAC checks in acceptance criteria

**Gap:** RBAC enforcement story needed

**Suggested Story:**

- **Epic 1 or New Security Epic**: "Enforce Role-Based Access Control in Server Actions"
- **Acceptance Criteria**: All sensitive actions (deleteDeck, updateUser, etc.) wrapped with RBAC checks, unauthorized access returns proper errors

---

## Recommended Actions

### Option 1: Add Security Stories to Existing Epics

**Epic 1 (User Account & Profile Setup):**

- Add Story 1.8: "Implement Security Headers (CSP, HSTS, Permissions Policy)"
- Add Story 1.9: "Enforce Role-Based Access Control in Server Actions"

**Epic 2 (Core Semantic Learning Sessions):**

- Add Story 2.14: "Implement Zod Schema Validation for Server Actions"
- Add Story 2.15: "Implement Rate Limiting for Study Actions"

**Epic 6 (Algorithm Validation & Quality Assurance):**

- Add Story 6.9: "Implement Secure Logging Practices"

### Option 2: Create New Security Epic

**Epic 7: Security Hardening & Best Practices**

**Stories:**

- Story 7.1: Implement Content Security Policy (CSP) Headers
- Story 7.2: Implement HSTS and Security Headers
- Story 7.3: Implement Zod Schema Validation for Server Actions
- Story 7.4: Implement Rate Limiting for Critical Actions
- Story 7.5: Implement Secure Logging Practices
- Story 7.6: Enforce Role-Based Access Control in Server Actions

**FRs Covered:** NFR13-NFR24 (Security Requirements)
**User Outcomes:**

- System protected against XSS, injection, and abuse attacks
- User data secured with proper input validation
- Infrastructure hardened with security headers

---

## Priority Classification

**🔴 Critical (Immediate):**

1. CSP Implementation (XSS protection)
2. HSTS Implementation (MITM protection)

**🟠 High Priority:** 3. Input Validation with Zod (Injection protection) 4. RBAC Enforcement (Authorization protection)

**🟡 Medium Priority:** 5. Rate Limiting (Abuse prevention) 6. Secure Logging (Data leakage prevention)

---

## Integration with Existing NFRs

The security recommendations align with existing NFRs:

- **NFR13-NFR14**: Data encryption (covered) + CSP/HSTS (missing)
- **NFR17**: JWT tokens (covered) + Middleware validation (needs explicit story)
- **NFR18-NFR20**: Access control (covered) + RBAC enforcement (needs explicit story)
- **NFR21-NFR24**: Privacy compliance (covered) + Secure logging (missing)

**Recommendation:** Add explicit implementation stories to ensure NFRs are fully realized.

---

## Next Steps

1. **Review and Approve:** Decide between Option 1 (add to existing epics) or Option 2 (new security epic)

2. **Create Stories:** Add security stories with proper acceptance criteria following the same format as existing stories

3. **Update FR Coverage:** Ensure new stories map to appropriate NFRs (NFR13-NFR24)

4. **Update Implementation Readiness Report:** Re-run validation after adding security stories

---

**Assessment:** Security recommendations are valid and should be incorporated into the epics and stories to ensure comprehensive security coverage beyond general NFR statements.
