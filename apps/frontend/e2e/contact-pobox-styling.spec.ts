import { test, expect } from '@playwright/test';

/**
 * Test PO Box/ZIP Code Field Styling
 * Verify that PO Box field has white background, not gray
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

test.describe('PO Box Field Styling', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should have white background for PO Box field in billing section', async ({ page }) => {
    // Navigate to contact list
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Click edit on first contact
    const actionsButton = page.locator('table tbody button[aria-haspopup="menu"]').first();
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /edit/i }).click();

    // Wait for edit page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Scroll to address section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(1000);

    // Find the PO Box field in billing section
    const billingPoBox = page.locator('input[name="postZipCode"]').first();
    await expect(billingPoBox).toBeVisible({ timeout: 5000 });

    // Get computed styles of the PO Box field
    const bgColor = await billingPoBox.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.backgroundColor;
    });

    console.log(`Billing PO Box background color: ${bgColor}`);

    // Check that background is white (rgb(255, 255, 255))
    // or transparent/rgba(0, 0, 0, 0) which inherits white from parent
    const isWhite =
      bgColor === 'rgb(255, 255, 255)' ||
      bgColor === 'rgba(255, 255, 255, 1)' ||
      bgColor === 'white';

    expect(isWhite).toBe(true);

    // Take screenshot of billing section for verification
    await page.screenshot({
      path: 'e2e/screenshots/billing-pobox-field.png',
      fullPage: false,
    });
  });

  test('should have white background for PO Box field in shipping section', async ({ page }) => {
    // Navigate to contact list
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Click edit on first contact
    const actionsButton = page.locator('table tbody button[aria-haspopup="menu"]').first();
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /edit/i }).click();

    // Wait for edit page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Scroll to shipping address section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Find the PO Box field in shipping section (second one)
    const shippingPoBox = page.locator('input[name="postZipCode"]').nth(1);
    await expect(shippingPoBox).toBeVisible({ timeout: 5000 });

    // Get computed styles of the PO Box field
    const bgColor = await shippingPoBox.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.backgroundColor;
    });

    console.log(`Shipping PO Box background color: ${bgColor}`);

    // Check that background is white
    const isWhite =
      bgColor === 'rgb(255, 255, 255)' ||
      bgColor === 'rgba(255, 255, 255, 1)' ||
      bgColor === 'white';

    expect(isWhite).toBe(true);

    // Take screenshot of shipping section for verification
    await page.screenshot({
      path: 'e2e/screenshots/shipping-pobox-field.png',
      fullPage: false,
    });
  });

  test('should compare PO Box field styling with other input fields', async ({ page }) => {
    // Navigate to contact edit page
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    const actionsButton = page.locator('table tbody button[aria-haspopup="menu"]').first();
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /edit/i }).click();

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Scroll to address section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(1000);

    // Get background color of a regular text input (e.g., City field)
    const cityInput = page
      .locator('input')
      .filter({ hasText: /location/i })
      .or(page.locator('input[placeholder*="Location"]'))
      .first();

    const cityBgColor = await cityInput.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.backgroundColor;
    });

    // Get background color of PO Box field
    const poBoxInput = page.locator('input[name="postZipCode"]').first();
    const poBoxBgColor = await poBoxInput.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.backgroundColor;
    });

    console.log(`City field background: ${cityBgColor}`);
    console.log(`PO Box field background: ${poBoxBgColor}`);

    // Both should have the same white background
    expect(cityBgColor).toBe(poBoxBgColor);

    // Take full screenshot showing all fields
    await page.screenshot({
      path: 'e2e/screenshots/address-fields-comparison.png',
      fullPage: false,
    });
  });
});
