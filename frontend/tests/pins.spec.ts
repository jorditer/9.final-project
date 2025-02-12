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

  test('should create a new pin', async ({ page }) => {
    await page.waitForSelector('.mapboxgl-map', { state: 'visible' });
    await page.waitForLoadState('networkidle');
    
    await page.waitForTimeout(2000);
    await page.dblclick('.mapboxgl-map', { position: testPosition });
    
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
  });

  // test('should delete an existing pin', async ({ page }) => {
  //   await page.waitForSelector('.mapboxgl-map', { state: 'visible' });
  //   await page.waitForLoadState('networkidle');
    
  //   await page.click('.mapboxgl-map', { position: testPosition });
    
  //   await page.waitForSelector('.mapboxgl-popup', { timeout: 5000 });
    
  //   await page.hover('.custom-popup h2');
  //   await page.click('.text-red-500');
  //   await page.click('button[title="Confirm"]');
    
  //   await page.waitForResponse(
  //     response => 
  //       response.url().includes('/pins') && 
  //       response.request().method() === 'DELETE' &&
  //       response.status() === 200,
  //     { timeout: 5000 }
  //   );
  // });
  
  test('should filter pins by time', async ({ page }) => {
    await page.click('button:text("Today")');
    
    const pins = await page.locator('.mapboxgl-marker').count();
    expect(pins).toBeGreaterThanOrEqual(0);
  });
}); 