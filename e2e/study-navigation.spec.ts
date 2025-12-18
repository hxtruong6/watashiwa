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
