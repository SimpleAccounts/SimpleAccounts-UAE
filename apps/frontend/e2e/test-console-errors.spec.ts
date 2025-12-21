import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Console Error Check', () => {
  test('should check for React errors in console', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Capture all console messages
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        errors.push(text);
      } else if (msg.type() === 'warning') {
        warnings.push(text);
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    // Wait a bit for React to render
    await page.waitForTimeout(5000);

    // Check for specific React errors
    const reactErrors = errors.filter(
      err =>
        err.includes('Element type is invalid') ||
        err.includes('No reducer provided') ||
        err.includes('undefined') ||
        err.includes('Cannot read property') ||
        err.includes('corrupted') ||
        err.includes('MIME type')
    );

    console.log('Total errors:', errors.length);
    console.log('React-related errors:', reactErrors.length);
    if (reactErrors.length > 0) {
      console.log('React errors:', reactErrors);
    }

    console.log('Total warnings:', warnings.length);
    const reducerWarnings = warnings.filter(w => w.includes('No reducer provided'));
    if (reducerWarnings.length > 0) {
      console.log('Reducer warnings:', reducerWarnings.length);
    }

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/login-page-debug.png', fullPage: true });

    // Check page content
    const bodyText = await page.textContent('body');
    console.log('Body text length:', bodyText?.length || 0);

    // Check if React root exists
    const reactRoot = await page.locator('#root, [data-reactroot]').count();
    console.log('React root elements:', reactRoot);

    // The main check - no critical React errors
    expect(reactErrors.length).toBe(0);
  });
});
