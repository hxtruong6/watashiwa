# Git Hooks Setup

This project uses [Husky](https://typicode.github.io/husky/) to manage Git hooks and ensure code quality before pushing to GitHub.

## Pre-Push Hook

The pre-push hook automatically runs before every `git push` and performs the following checks:

1. **Unit Tests** (`pnpm test:run`) - Runs all Vitest unit tests
2. **E2E Tests** (`pnpm e2e`) - Runs all Playwright end-to-end tests

If **any** test fails, the push will be **aborted** to prevent broken code from being pushed to the repository.

## How It Works

When you run `git push`, Git will automatically execute `.husky/pre-push` which:

```bash
# Run unit tests
pnpm test:run

# If tests pass, run E2E tests
pnpm e2e

# If all tests pass, allow push
# If any test fails, abort push
```

## Setup (Already Done)

This is already configured for you, but for reference:

1. Install Husky: `pnpm add -D husky`
2. Initialize: `pnpm exec husky init`
3. Create pre-push hook: `.husky/pre-push`
4. Make executable: `chmod +x .husky/pre-push`

## Testing the Hook

Try to push code:

```bash
git add .
git commit -m "test commit"
git push
```

You should see:

```
Running unit tests...
✓ src/components/StudyContent.test.tsx (7 tests) 116ms
...

Running E2E tests...
✓ e2e/study-navigation.spec.ts (5 tests) 7.3s
...

✅ All tests passed! Proceeding with push...
```

## Bypassing the Hook (Not Recommended)

In emergency situations, you can bypass the hook with:

```bash
git push --no-verify
```

⚠️ **Warning**: Only use this if absolutely necessary (e.g., CI is down, urgent hotfix). The hook exists to protect code quality.

## Troubleshooting

### Hook not running?

1. Check if `.husky/pre-push` is executable:

   ```bash
   ls -la .husky/pre-push
   ```

   Should show `-rwxr-xr-x`

2. Ensure husky is initialized:

   ```bash
   pnpm prepare
   ```

### Tests failing locally but passing in PR?

- Make sure your local environment is up to date:

  ```bash
  pnpm install
  pnpm prisma generate
  ```

## CI/CD Integration

This pre-push hook complements (not replaces) CI/CD checks. GitHub Actions should still run tests on PRs as a second layer of protection.

## Related Scripts

- `pnpm test` - Run unit tests in watch mode
- `pnpm test:run` - Run unit tests once (used by hook)
- `pnpm e2e` - Run E2E tests (used by hook)
- `pnpm e2e:ui` - Run E2E tests with UI
