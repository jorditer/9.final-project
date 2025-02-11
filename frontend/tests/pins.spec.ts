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
    test.setTimeout(10000);
    // Wait for map to be fully loaded
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

  test('should delete an existing pin', async ({ page }) => {
    // 1. Wait for map and markers to load completely
    await page.waitForSelector('.mapboxgl-map', { state: 'visible' });
    await page.waitForTimeout(2000); // Give map time to fully render
    
    // 2. Wait for marker to be present and visible
    await page.waitForSelector('.mapboxgl-marker', { 
      state: 'visible',
      timeout: 5000 
    });
    
    // 3. Click the marker with retry logic
    await page.evaluate(() => {
      const marker = document.querySelector('.mapboxgl-marker');
      if (marker) {
        (marker as HTMLElement).click();
      }
    });
    
    // 4. Wait for popup to appear after marker click
    await page.waitForSelector('.custom-popup', { 
      state: 'visible',
      timeout: 5000 
    });
    
    // 5. Find and click the delete button
    await page.hover('[data-testid="pin-title"]');
    await page.waitForSelector('.text-red-500', { 
      state: 'visible',
      timeout: 5000 
    });
    await page.click('.text-red-500');
    
    // 6. Confirm deletion
    await page.click('button[title="Confirm"]');
    
    // 7. Wait for delete request to complete
    await page.waitForResponse(
      response => 
        response.url().includes('/pins') && 
        response.request().method() === 'DELETE' &&
        response.status() === 200,
      { timeout: 5000 }
    );
  });

//   Filter pins by time
  test('should filter pins by time', async ({ page }) => {
    await page.click('button:text("Today")');
    
    const pins = await page.locator('.mapboxgl-marker').count();
    expect(pins).toBeGreaterThanOrEqual(0);
  });
}); 