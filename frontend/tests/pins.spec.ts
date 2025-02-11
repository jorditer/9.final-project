import { test, expect } from '@playwright/test';

// Create a new pin
test.describe('Pin Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="username"]', 'Jordi');
    await page.fill('input[name="password"]', 'adient25!');
    await page.click('input[type="submit"]');
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  async function createPin(page: any, position: { x: number; y: number }) {
    await page.waitForSelector('.mapboxgl-map', { state: 'visible' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.dblclick('.mapboxgl-map', { position });
    await page.waitForSelector('input[name="title"]');
    await page.fill('input[name="title"]', 'Event');
    await page.fill('textarea[name="description"]', 'Description');
    await page.fill('input[name="location"]', 'Location');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('input[type="datetime-local"]', tomorrow.toISOString().slice(0, 16));

    await page.click('input[type="submit"]');

    await page.waitForResponse(
      response =>
        response.url().includes('/pins') &&
        response.request().method() === 'POST' &&
        response.status() === 201,
      { timeout: 5000 }
    );
  }

  test('should create a new pin', async ({ page }) => {
    test.setTimeout(10000);
    const position = { x: 200, y: 200 };

    await createPin(page, position);

    await page.click('.mapboxgl-map', { position });
    await page.waitForTimeout(1000);

    const popupVisible = await page.isVisible('.mapboxgl-popup');
    expect(popupVisible).toBe(true);
  });

  test('should delete an existing pin', async ({ page }) => {
    test.setTimeout(10000);
    const position = { x: 200, y: 200 };

    // Create the pin first
    await createPin(page, position);

    // Click on the map to trigger the popup for the created pin
    await page.click('.mapboxgl-map', { position });
    await page.waitForTimeout(1000);

    // Ensure the popup is visible
    const popupVisible = await page.isVisible('.mapboxgl-popup');
    expect(popupVisible).toBe(true);

    // Perform deletion: hover, click the delete icon, then confirm deletion
    await page.hover('.custom-popup h2');
    await page.click('.text-red-500');
    await page.click('button[title="Confirm"]');

    // Wait for the DELETE response indicating the pin was removed
    await page.waitForResponse(
      response =>
        response.url().includes('/pins') &&
        response.request().method() === 'DELETE' &&
        response.status() === 200,
      { timeout: 5000 }
    );

    // Optionally verify that the popup (or marker) is no longer visible after deletion
    await page.waitForTimeout(1000);
    const popupStillVisible = await page.isVisible('.mapboxgl-popup');
    expect(popupStillVisible).toBe(false);
  });

  // Filter pins by time
//   test('should filter pins by time', async ({ page }) => {
//     await page.click('button:text("Today")');
    
//     const pins = await page.locator('.mapboxgl-marker').count();
//     expect(pins).toBeGreaterThanOrEqual(0);
//   });
}); 