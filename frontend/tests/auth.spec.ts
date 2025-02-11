import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  // Redirect to login when not authenticated
  test('should redirect to login when not authenticated', async ({ page }) => {
    await expect(page).toHaveURL(/.*login/);
  });

  // Login successfully
  test('should login successfully', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="username"]', 'test');
    await page.fill('input[name="password"]', 'adient25!');
    await page.click('input[type="submit"]');
    
    // Should redirect to map view
    await expect(page).toHaveURL('http://localhost:5173/');
    // Map should be visible
    await expect(page.locator('.mapboxgl-map')).toBeVisible();
  });

  // Show error on invalid credentials
  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="username"]', 'wronguser');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('input[type="submit"]');
    
    await expect(page.locator('.text-red-500')).toBeVisible();
  });
}); 