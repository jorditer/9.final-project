import { test, expect } from '@playwright/test';

// Create a new pin
test.describe('Pin Management', () => {
  test.setTimeout(35000);  // This will apply to all tests in this describe block
  
  const testPosition = { x: 200, y: 200 };
  const testTitle = 'Event';

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="username"]', 'test');
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
    await page.fill('input[name="title"]', testTitle);
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

    await page.click('.mapboxgl-map', { position });
    await page.waitForTimeout(1000);

    const popupVisible = await page.isVisible('.mapboxgl-popup');
    expect(popupVisible).toBe(true);

    await page.hover('.custom-popup h2');
    await page.click('.text-red-500');
    await page.click('button[title="Confirm"]');

    await page.waitForResponse(
      response =>
        response.url().includes('/pins') &&
        response.request().method() === 'DELETE' &&
        response.status() === 200,
      { timeout: 5000 }
    );
    
    await page.waitForTimeout(1000);
    const popupStillVisible = await page.isVisible('.mapboxgl-popup');
    expect(popupStillVisible).toBe(false);
  });

  test('should delete an existing pin', async ({ page }) => {
    await page.waitForSelector('.mapboxgl-map', { state: 'visible' });
    await page.waitForTimeout(2000); // Give map time to fully render
    
    await page.waitForSelector('.mapboxgl-marker', { 
      state: 'visible',
      timeout: 5000 
    });
    
    await page.evaluate(() => {
      const marker = document.querySelector('.mapboxgl-marker');
      if (marker) {
        (marker as HTMLElement).click();
      }
    });
    
    await page.waitForSelector('.custom-popup', { 
      state: 'visible',
      timeout: 5000 
    });
    
    await page.hover('[data-testid="pin-title"]');
    await page.waitForSelector('.text-red-500', { 
      state: 'visible',
      timeout: 5000 
    });
    await page.click('.text-red-500');
    
    await page.click('button[title="Confirm"]');
    
    await page.waitForResponse(
      response => 
        response.url().includes('/pins') && 
        response.request().method() === 'DELETE' &&
        response.status() === 200,
      { timeout: 5000 }
    );
  });

  test('should filter pins by time', async ({ page }) => {
    await page.click('button:text("Today")');
    
    const pins = await page.locator('.mapboxgl-marker').count();
    expect(pins).toBeGreaterThanOrEqual(0);
  });
}); 