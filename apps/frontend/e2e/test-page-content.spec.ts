import { test } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Page Content Check', () => {
  test('should check what is actually rendered on login page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    // Take screenshot
    await page.screenshot({ path: 'test-results/login-page-content.png', fullPage: true });

    // Get all text content
    const bodyText = await page.textContent('body');
    console.log('Body text:', bodyText?.substring(0, 500));

    // Check for React root
    const root = await page.locator('#root').count();
    console.log('Root elements:', root);

    // Check for any inputs
    const inputs = await page.locator('input').count();
    console.log('Input elements:', inputs);

    // Check for forms
    const forms = await page.locator('form').count();
    console.log('Form elements:', forms);

    // Check for loading indicators
    const loading = await page
      .locator('[class*="loading"], [class*="spinner"], [class*="loader"]')
      .count();
    console.log('Loading indicators:', loading);

    // Check for error messages
    const errors = await page.locator('[class*="error"], [role="alert"]').count();
    console.log('Error elements:', errors);

    // Get page HTML structure
    const html = await page.content();
    console.log('HTML length:', html.length);
    console.log('Has React:', html.includes('react'));
    console.log('Has root div:', html.includes('<div id="root"'));

    // List all visible elements
    const allElements = await page.locator('*').count();
    console.log('Total elements:', allElements);
  });
});
