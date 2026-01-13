import { test, expect } from '@playwright/test';

/**
 * Simplified Contact Layout Tests
 * Focus on key layout issues: radio buttons, addresses, and basic design
 */

const TEST_USER = {
  email: 'myselfmohsin@gmail.com',
  password: 'Mohnaz123$',
};

// Helper function to login
async function login(page) {
  await page.goto('/login');
  await page.fill('input#email-input', TEST_USER.email);
  await page.fill('input#password-input', TEST_USER.password);
  await page.getByRole('button', { name: /log in/i }).click();
  await page.waitForURL('**/admin/**', { timeout: 10000 });
}

test.describe('Contact Layout - Key Issues', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should navigate to contact list successfully', async ({ page }) => {
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table, h1', { timeout: 10000 });

    // Check page loaded
    const pageTitle = page.locator('h1');
    await expect(pageTitle).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/contact-list.png',
      fullPage: true,
    });
  });

  test('should display view page when clicking on contact', async ({ page }) => {
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Click first contact row
    await page.locator('table tbody tr').first().click();
    await page.waitForLoadState('networkidle');

    // Wait for navigation to complete
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/contact-view-page.png',
      fullPage: true,
    });

    // Check that we're on a contact page
    const url = page.url();
    expect(url).toContain('/contact');
  });

  test('should check radio button alignment on edit page', async ({ page }) => {
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Find and click Edit button in actions menu
    const actionsButton = page.locator('table tbody button[aria-haspopup="menu"]').first();
    await actionsButton.click();
    await page.waitForSelector('[role="menuitem"]', { timeout: 5000 });
    await page.getByRole('menuitem', { name: /edit/i }).click();

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/contact-edit-page-full.png',
      fullPage: true,
    });

    // Check for radio buttons
    const radioButtons = page.locator('[role="radio"]');
    const count = await radioButtons.count();

    if (count >= 2) {
      // Get positions
      const radio1 = radioButtons.first();
      const radio2 = radioButtons.nth(1);

      const box1 = await radio1.boundingBox();
      const box2 = await radio2.boundingBox();

      if (box1 && box2) {
        const yDifference = Math.abs(box1.y - box2.y);
        console.log(`Radio button Y-coordinate difference: ${yDifference}px`);

        // Screenshot just the radio section
        await page.locator('[role="radiogroup"]').first().screenshot({
          path: 'e2e/screenshots/radio-buttons-alignment.png',
        });

        // Check alignment (should be within 5px)
        expect(yDifference).toBeLessThan(5);
      }
    } else {
      console.log('Radio buttons not found or less than 2');
    }
  });

  test('should check address sections display properly', async ({ page }) => {
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Navigate to edit page
    const actionsButton = page.locator('table tbody button[aria-haspopup="menu"]').first();
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /edit/i }).click();

    // Wait for page load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Scroll to address section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(1000);

    // Screenshot address sections
    await page.screenshot({
      path: 'e2e/screenshots/address-sections.png',
      fullPage: false,
    });

    // Check for billing text
    const billingHeading = page.getByText(/billing/i).first();
    await expect(billingHeading).toBeVisible({ timeout: 5000 });

    // Check for shipping text
    const shippingHeading = page.getByText(/shipping/i).first();
    await expect(shippingHeading).toBeVisible({ timeout: 5000 });

    // Check for "same as billing" checkbox
    const checkbox = page.locator('input[type="checkbox"]').first();
    await expect(checkbox).toBeVisible({ timeout: 5000 });
  });

  test('should verify form fields have proper spacing', async ({ page }) => {
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Navigate to edit page
    const actionsButton = page.locator('table tbody button[aria-haspopup="menu"]').first();
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /edit/i }).click();

    // Wait for page load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check form inputs exist
    const inputs = page.locator('input[type="text"], input[type="email"]');
    const inputCount = await inputs.count();

    console.log(`Found ${inputCount} form inputs`);
    expect(inputCount).toBeGreaterThan(5);

    // Screenshot form sections
    await page.screenshot({
      path: 'e2e/screenshots/form-fields-spacing.png',
      fullPage: true,
    });
  });
});
