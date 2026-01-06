import { test, expect } from '@playwright/test';

test('screenshot register page light mode', async ({ page }) => {
  // Go to register page
  await page.goto('http://localhost:3000/register');

  // Wait for page to load
  await page.waitForTimeout(2000);

  // Take screenshot of register page
  await page.screenshot({
    path: 'test-results/register-page.png',
    fullPage: true,
  });

  // Check if Company Type select exists
  const companyTypeSelect = page.locator('#companyTypeCode');
  const isVisible = await companyTypeSelect.isVisible({ timeout: 5000 }).catch(() => false);
  console.log(`Company Type select visible: ${isVisible}`);

  // Click on the select to open dropdown
  if (isVisible) {
    await companyTypeSelect.click();
    await page.waitForTimeout(500);

    // Take screenshot with dropdown open
    await page.screenshot({
      path: 'test-results/register-dropdown-open.png',
      fullPage: true,
    });

    // Press escape to close
    await page.keyboard.press('Escape');
  }

  // Verify page loaded correctly
  await expect(page.locator('body')).toBeVisible();
  console.log('Register page loaded successfully');
});

test('screenshot register page dark mode', async ({ page }) => {
  // Go to register page
  await page.goto('http://localhost:3000/register');

  // Wait for page to load
  await page.waitForTimeout(2000);

  // Click theme toggle button (moon/sun icon in top right)
  const themeToggle = page
    .locator('button[aria-label*="theme"], button[aria-label*="mode"]')
    .first();
  const toggleVisible = await themeToggle.isVisible({ timeout: 3000 }).catch(() => false);

  if (toggleVisible) {
    await themeToggle.click();
    await page.waitForTimeout(1000);
    console.log('Switched to dark mode');
  } else {
    console.log('Theme toggle not found, trying alternative selector');
    // Try clicking by position (top right area)
    const altToggle = page.locator('header button').last();
    if (await altToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      await altToggle.click();
      await page.waitForTimeout(1000);
    }
  }

  // Take screenshot of dark mode
  await page.screenshot({
    path: 'test-results/register-dark-mode.png',
    fullPage: true,
  });

  // Check if Company Type select exists in dark mode
  const companyTypeSelect = page.locator('#companyTypeCode');
  const isVisible = await companyTypeSelect.isVisible({ timeout: 5000 }).catch(() => false);
  console.log(`Company Type select visible in dark mode: ${isVisible}`);

  // Click on the select to open dropdown
  if (isVisible) {
    await companyTypeSelect.click();
    await page.waitForTimeout(500);

    // Take screenshot with dropdown open in dark mode
    await page.screenshot({
      path: 'test-results/register-dark-dropdown-open.png',
      fullPage: true,
    });

    // Press escape to close
    await page.keyboard.press('Escape');
  }

  console.log('Dark mode test completed');
});
