import { test, expect } from '@playwright/test';

test.describe('Login Redirect Debug', () => {
  test('should login and redirect to dashboard', async ({ page }) => {
    // Listen to console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(`[${msg.type()}] ${text}`);
      console.log(`[BROWSER ${msg.type()}]`, text);
    });

    // Navigate to login
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');

    // Fill in credentials
    await page.fill('#email-input', 'myselfmohsin@gmail.com');
    await page.fill('#password-input', 'Mohnaz123$');

    // Click login and wait for navigation
    console.log('[TEST] Clicking login button...');
    await page.click('button[type="submit"]');

    // Wait and check what happens
    await page.waitForTimeout(5000);

    // Check current URL
    const currentUrl = page.url();
    console.log('[TEST] Current URL after 5s:', currentUrl);

    // Check for our debug logs
    const adminLayoutLogs = consoleLogs.filter(log => log.includes('AdminLayout'));
    const authApiLogs = consoleLogs.filter(log => log.includes('authApi'));
    const loginLogs = consoleLogs.filter(log => log.includes('[Login]'));

    console.log('\n=== AdminLayout Logs ===');
    adminLayoutLogs.forEach(log => console.log(log));

    console.log('\n=== AuthApi Logs ===');
    authApiLogs.forEach(log => console.log(log));

    console.log('\n=== Login Logs ===');
    loginLogs.forEach(log => console.log(log));

    // Check if we're on the admin page
    if (currentUrl.includes('/admin')) {
      console.log('[TEST] ✓ Successfully redirected to admin!');
      expect(currentUrl).toContain('/admin');
    } else {
      console.log('[TEST] ✗ Still on login page - redirect failed');
      console.log('[TEST] All console logs:', consoleLogs);
      throw new Error('Login redirect failed - still on: ' + currentUrl);
    }
  });
});
