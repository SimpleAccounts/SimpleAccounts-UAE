import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test('debug registration form interaction', async ({ page }) => {
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Fill company name first
  const companyNameInput = page.locator('#companyName');
  await companyNameInput.fill('Test Company Debug');
  await page.waitForTimeout(500);
  
  // Take screenshot before interaction
  await page.screenshot({ path: 'debug-before-select.png', fullPage: true });
  
  // Find and click the company type select
  const selectInput = page.locator('input[aria-label="Select company type"]');
  const inputCount = await selectInput.count();
  console.log('Company type input count:', inputCount);
  
  // Click on it
  await selectInput.first().click({ force: true });
  await page.waitForTimeout(1000);
  
  // Take screenshot after click
  await page.screenshot({ path: 'debug-after-click.png', fullPage: true });
  
  // Check for menu
  const menu = page.locator('div[class*="menu"]');
  const menuCount = await menu.count();
  console.log('Menu count after click:', menuCount);
  
  // Try arrow down
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(500);
  
  // Take screenshot after arrow
  await page.screenshot({ path: 'debug-after-arrow.png', fullPage: true });
  
  const menuCountAfterArrow = await menu.count();
  console.log('Menu count after arrow:', menuCountAfterArrow);
  
  // Check for Next button
  const nextButton = page.getByRole('button', { name: /next/i });
  const nextCount = await nextButton.count();
  console.log('Next button count:', nextCount);
  
  // Get all buttons
  const allButtons = await page.locator('button').all();
  console.log('All buttons count:', allButtons.length);
  for (const btn of allButtons) {
    const text = await btn.textContent();
    console.log('  Button:', text?.trim());
  }
  
  expect(true).toBe(true);
});
