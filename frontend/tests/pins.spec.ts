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

  test('should create a new pin', async ({ page }) => {
	test.setTimeout(10000);
    // Wait for map to be fully loaded
    await page.waitForSelector('.mapboxgl-map', { state: 'visible' });
    await page.waitForLoadState('networkidle');
    
    const position = { x: 200, y: 200 };
    
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
      response => {
        console.log('Response URL:', response.url());
        console.log('Response Status:', response.status());
        console.log('Request Method:', response.request().method());
        return response.url().includes('/pins') && 
          response.request().method() === 'POST' &&
          response.status() === 201;
      },
      { timeout: 5000 }
    );

    await page.waitForLoadState('networkidle');
    
    // Click at the same position where we created the pin
    await page.click('.mapboxgl-map', { position });
    
    // Wait a moment for any animations/state updates
    await page.waitForTimeout(1000);
    
    // Debug: Check what's in the DOM after waiting
    const popupExists = await page.evaluate(() => {
        console.log('Looking for popup...');
        const popup = document.querySelector('.mapboxgl-popup');
        console.log('Popup found:', popup);
        return !!popup;
    });
    console.log('Popup exists:', popupExists);
    
    // Continue with deletion if popup exists
    if (popupExists) {
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
    }

    // Debug: log all classes present in the popup
    const classes = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        return Array.from(elements).map(el => el.className).filter(Boolean);
    });
    console.log('Available classes:', classes);
    
    // Debug: log the entire HTML structure
    const html = await page.evaluate(() => document.body.innerHTML);
    console.log('HTML:', html);
  });

  // Filter pins by time
//   test('should filter pins by time', async ({ page }) => {
//     await page.click('button:text("Today")');
    
//     const pins = await page.locator('.mapboxgl-marker').count();
//     expect(pins).toBeGreaterThanOrEqual(0);
//   });
}); 