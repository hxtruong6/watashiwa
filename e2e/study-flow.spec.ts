import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
	test('should load landing page', async ({ page }) => {
		await page.goto('/');

		// Check for key elements of the landing page
		// Note: Title might be dynamic based on locale
		const titleOrHeading = page.locator('h1, h2').first();
		await expect(titleOrHeading).toBeVisible();

		// Basic check to ensure page isn't broken (500 or 404)
		await expect(page.locator('body')).not.toContainText('Internal Server Error');
		await expect(page.locator('body')).not.toContainText('404');
	});

	test('should redirect unauthenticated user to login from study page', async ({ page }) => {
		await page.goto('/study');

		// Expect redirect to login
		await expect(page).toHaveURL(/.*login/);

		// Verify login form is present
		// Ant Design Form `name` prop sets the `id` attribute
		await expect(page.locator('#auth-form')).toBeVisible();

		// Check for Login-specific UI elements to confirm we are on login page
		// "auth-form" is the name prop in <Form> component in AuthPage
	});
});
