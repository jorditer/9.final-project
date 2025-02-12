import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await expect(page).toHaveURL(/.*login/);
  });

  test('should login successfully', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="username"]', 'test');
    await page.fill('input[name="password"]', 'adient25!');
    await page.click('input[type="submit"]');
    
    await expect(page).toHaveURL('http://localhost:5173/');
    await expect(page.locator('.mapboxgl-map')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="username"]', 'wronguser');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('input[type="submit"]');
    
    await expect(page.locator('.text-red-500')).toBeVisible();
  });
}); 