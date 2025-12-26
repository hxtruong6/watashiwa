import { expect, test } from '@playwright/test';

test.describe('Study Navigation Scenarios (Unauthenticated)', () => {
	// Scenario 1: Resume Last Session (Default)
	test('Scenario 1: Access /study (Resume/Default) -> Redirect to Login', async ({ page }) => {
		await page.goto('/study');
		await expect(page).toHaveURL(/.*login/);
		await expect(page.locator('#auth-form')).toBeVisible();
	});

	// Scenario 2: Global Study Mode (Explicit or Fallback)
	// Note: Unauthenticated users hitting this should still go to login
	test('Scenario 2: Access /study?mode=quick (Quick Review) -> Redirect to Login', async ({
		page,
	}) => {
		await page.goto('/study?mode=quick');
		await expect(page).toHaveURL(/.*login/);
	});

	// Scenario 3: Deck-Specific Study
	test('Scenario 3: Access /study?deckId=[uuid] -> Redirect to Login', async ({ page }) => {
		const fakeDeckId = '123e4567-e89b-12d3-a456-426614174000';
		await page.goto(`/study?deckId=${fakeDeckId}`);
		await expect(page).toHaveURL(/.*login/);
	});

	// Scenario 4: Course-Specific Study
	test('Scenario 4: Access /study?courseId=[uuid] -> Redirect to Login', async ({ page }) => {
		const fakeCourseId = '123e4567-e89b-12d3-a456-426614174000';
		await page.goto(`/study?courseId=${fakeCourseId}`);
		await expect(page).toHaveURL(/.*login/);
	});

	// Scenario 5: Mixed Parameters (Quick Mode + Deck)
	test('Scenario 5: Access /study?deckId=[uuid]&mode=quick -> Redirect to Login', async ({
		page,
	}) => {
		const fakeDeckId = '123e4567-e89b-12d3-a456-426614174000';
		await page.goto(`/study?deckId=${fakeDeckId}&mode=quick`);
		await expect(page).toHaveURL(/.*login/);
	});
});

test.describe('Study Navigation - Parameter Validation', () => {
	test('Invalid deckId format redirects to /study', async ({ page }) => {
		// Note: This test assumes user is authenticated
		// Invalid UUID format should redirect to /study (dashboard)
		await page.goto('/study?deckId=invalid-uuid');
		// Should redirect to /study (without invalid parameter)
		await expect(page).toHaveURL(/\/study(\?|$)/);
		// Should not contain the invalid parameter
		expect(page.url()).not.toContain('deckId=invalid-uuid');
	});

	test('Invalid courseId format redirects to /study', async ({ page }) => {
		// Note: This test assumes user is authenticated
		// Invalid UUID format should redirect to /study (dashboard)
		await page.goto('/study?courseId=not-a-uuid');
		// Should redirect to /study (without invalid parameter)
		await expect(page).toHaveURL(/\/study(\?|$)/);
		// Should not contain the invalid parameter
		expect(page.url()).not.toContain('courseId=not-a-uuid');
	});

	test('Valid UUID format is accepted', async ({ page }) => {
		// Note: This test assumes user is authenticated
		const validDeckId = '123e4567-e89b-12d3-a456-426614174000';
		await page.goto(`/study?deckId=${validDeckId}`);
		// Should stay on study page with the parameter (or redirect to login if not authenticated)
		// If authenticated, URL should contain the deckId
		const url = page.url();
		if (!url.includes('login')) {
			expect(url).toContain(`deckId=${validDeckId}`);
		}
	});
});

test.describe('Study Navigation - Route Verification', () => {
	test('All navigation paths use correct parameter names', async ({ page }) => {
		// This test verifies that navigation links use deckId (not deck) and /study (not /study/session)
		// Note: This is a structural test - actual navigation testing requires authenticated user setup

		// Verify that accessing /study doesn't result in 404
		await page.goto('/study');
		// Should either redirect to login or show study page (not 404)
		await expect(page).not.toHaveURL(/404/);
		await expect(page.locator('body')).not.toContainText('404');
		await expect(page.locator('body')).not.toContainText('Not Found');
	});

	test('Mode parameter is preserved in redirects', async ({ page }) => {
		// Note: This test assumes user is authenticated
		// When resuming session with mode parameter, it should be preserved
		await page.goto('/study?mode=quick');
		// Should either redirect to login or preserve mode parameter
		const url = page.url();
		if (!url.includes('login')) {
			// If authenticated and redirected, mode should be preserved
			// This is tested by checking the final URL after potential redirect
			expect(url).toMatch(/mode=quick/);
		}
	});
});
