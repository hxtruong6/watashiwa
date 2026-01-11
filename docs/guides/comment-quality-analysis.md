# Comment Quality Analysis: What to Keep vs Remove

**Senior Engineer Perspective** - Based on codebase review

---

## ✅ **KEEP: Good Comments**

### 1. **JSDoc Comments** (Essential for Public APIs)

**Example from `useServerAction.ts`:**

```typescript
/**
 * React hook for calling server actions with automatic "Unauthorized" error handling
 * Automatically logs out and redirects when session is invalid
 *
 * This is the PRIMARY way to call server actions from client components.
 * Features:
 * - Automatic logout/redirect on "Unauthorized" errors
 * - Race condition protection (prevents multiple redirects)
 * - Type-safe with ApiResponse<T>
 */
```

**Why Keep:**

- Documents public API contract
- Explains usage patterns
- Provides examples
- Helps IDE autocomplete and tooling

**Action:** ✅ Keep all JSDoc comments on exported functions/hooks/components

---

### 2. **"Why" Comments** (Architectural Decisions)

**Example from `ProfileSetupForm.tsx`:**

```typescript
// Use window.location.href for full page reload to ensure:
// 1. Server components see updated setup status (cache invalidation)
// 2. No race conditions with client-side state
// 3. Consistent with auth flow patterns in codebase
// 4. i18n system reads the updated NEXT_LOCALE cookie
//
// Note: router.push() could work, but window.location.href is safer
// because it guarantees a fresh server-side render with updated DB state.
// The slight performance trade-off is acceptable for correctness.
```

**Why Keep:**

- Explains **why** a specific approach was chosen
- Documents trade-offs and alternatives considered
- Helps future developers understand constraints

**Action:** ✅ Keep all architectural decision comments

---

### 3. **Platform/Workaround Comments**

**Example from `page.tsx` files:**

```typescript
// Access cookies() to satisfy Next.js requirement for crypto.randomUUID()
// This prevents Sentry interception issues during prerendering
```

**Why Keep:**

- Documents non-obvious platform requirements
- Explains workarounds for framework quirks
- Prevents accidental removal of "weird" code

**Action:** ✅ Keep platform-specific workaround comments

---

### 4. **Security/Authorization Comments**

**Example from `action-client.ts`:**

```typescript
// 1. Security Check (CRON_SECRET)
// Vercel automatically safeguards this if configured in vercel.json,
// but manual header check is good practice.
```

**Why Keep:**

- Documents security considerations
- Explains defense-in-depth approach
- Critical for security audits

**Action:** ✅ Keep all security-related comments

---

### 5. **Complex Domain Logic Comments**

**Example from `ProfileSetupForm.tsx`:**

```typescript
// Determine if dark theme based on background color
// Dark theme has darker backgrounds, so we check if colorBgContainer is dark
const isDarkTheme =
  token.colorBgContainer?.includes('15') || token.colorBgContainer?.includes('0B');
```

**Why Keep:**

- Explains non-obvious business logic
- Documents heuristics or algorithms
- Makes magic numbers/strings understandable

**Action:** ✅ Keep comments explaining complex domain logic

---

### 6. **Actionable TODO Comments** (With Context)

**Example:**

```typescript
// TODO: Add Role Check (e.g. requireRole('ADMIN'))
// TODO: kanji is not a relation on CardComment - schema needs update
```

**Why Keep:**

- Actionable items with clear context
- Documents known limitations
- Tracks technical debt

**Action:** ✅ Keep TODOs that have context and are actionable

---

## ❌ **REMOVE: Bad Comments**

### 1. **Commented-Out Code Blocks**

**Example from `route.ts`:**

```typescript
// try {
//   const now = new Date();
//   ...
// } catch (error) {
//   ...
// }
```

**Why Remove:**

- Dead code clutters the codebase
- Git history preserves old code
- Makes code harder to read
- Can become outdated and misleading

**Action:** ❌ **DELETE** all commented-out code blocks. Use git if you need to recover.

---

### 2. **Obvious/Redundant Comments**

**Example (hypothetical):**

```typescript
// Set loading to true
setLoading(true);

// Show error message
message.error(errorMessage);
```

**Why Remove:**

- Code is self-explanatory
- Adds noise without value
- Violates "code should be self-documenting" principle

**Action:** ❌ Remove comments that just restate what the code does

---

### 3. **Outdated/Incorrect Comments**

**Example:**

```typescript
// This function handles user authentication
// (But the function actually does something else now)
```

**Why Remove:**

- Misleading to developers
- Worse than no comment
- Can cause bugs if developers trust the comment

**Action:** ❌ Remove or update outdated comments immediately

---

### 4. **Vague TODO Comments**

**Example:**

```typescript
// TODO: Fix this later
// TODO: Improve
// TODO: Optimize
```

**Why Remove:**

- Not actionable
- No context
- Creates technical debt without value

**Action:** ❌ Remove vague TODOs or convert to actionable items with context

---

### 5. **Comments Explaining Simple Code**

**Example:**

```typescript
// Prevent multiple simultaneous submissions
if (loading) {
  return;
}
```

**Why Remove:**

- The code is already clear
- The variable name `loading` explains the intent
- Comment adds no value

**Action:** ❌ Remove if code is self-explanatory

---

## 📋 **Specific Recommendations for Your Codebase**

### Files to Clean Up

1. **`src/app/api/cron/reminders/route.ts`**
   - ❌ Remove entire commented-out code block (lines 13-91)
   - ✅ Keep security comment (line 5-7)

2. **`src/modules/core/index.ts`**
   - ❌ Remove commented-out exports (lines 17-18)
   - ✅ Keep explanatory comments about client-safe exports

3. **`src/app/profile/setup/ProfileSetupForm.tsx`**
   - ✅ Keep architectural decision comments (lines 207-215)
   - ✅ Keep domain logic comments (lines 107-108, 112)
   - ❌ Consider removing obvious comments like "Prevent multiple simultaneous submissions" if code is clear

4. **TODO Comments Review:**
   - ✅ Keep: `// TODO: Add Role Check (e.g. requireRole('ADMIN'))` - actionable
   - ✅ Keep: `// TODO: kanji is not a relation on CardComment - schema needs update` - has context
   - ❌ Review: `// TODO: later` - too vague, should be removed or expanded

---

## 🎯 **Comment Quality Principles**

### The "Why" Rule

- ✅ **Good:** Explains **why** something is done
- ❌ **Bad:** Explains **what** the code does (code should be self-explanatory)

### The "Non-Obvious" Rule

- ✅ **Good:** Documents non-obvious behavior, workarounds, or constraints
- ❌ **Bad:** Documents obvious behavior

### The "Future Developer" Rule

- ✅ **Good:** Helps a future developer (including yourself in 6 months) understand decisions
- ❌ **Bad:** Only helps someone reading the code right now

### The "Maintenance" Rule

- ✅ **Good:** Comments that are easy to keep in sync with code
- ❌ **Bad:** Comments that will become outdated quickly

---

## 🔧 **Action Plan**

1. **Immediate Cleanup:**
   - Remove all commented-out code blocks
   - Remove obvious/redundant comments
   - Update or remove outdated comments

2. **Review TODOs:**
   - Convert vague TODOs to actionable items with context
   - Remove TODOs that are no longer relevant
   - Consider moving TODOs to issue tracker if they're long-term

3. **Add Missing JSDoc:**
   - Add JSDoc to all exported functions/components
   - Document complex functions with examples

4. **Establish Standards:**
   - Use JSDoc for public APIs
   - Use inline comments only for "why" not "what"
   - Keep comments focused on non-obvious behavior

---

## 📚 **References**

- [Clean Code: Comments](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Google TypeScript Style Guide: Comments](https://google.github.io/styleguide/tsguide.html#comments)
- [JSDoc Documentation](https://jsdoc.app/)

---

**Last Updated:** 2025-01-XX
**Reviewed By:** Senior Engineer Analysis
