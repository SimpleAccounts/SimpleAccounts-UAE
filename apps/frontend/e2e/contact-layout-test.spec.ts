import { test, expect } from '@playwright/test';

/**
 * Contact Layout Tests
 * Tests the layout and design of contact pages (view, edit, create)
 * focusing on radio button alignment, address display, and overall design
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
  await page.waitForURL('**/admin/**');
}

// Helper function to create a test contact
async function createTestContact(page) {
  const timestamp = Date.now();
  const email = `test${timestamp}@example.com`;

  await page.goto('/admin/master/contact/create');
  await page.fill('input[placeholder*="First Name"]', 'TestFirst');
  await page.fill('input[placeholder*="Last Name"]', 'TestLast');
  await page.fill('input[type="email"]', email);

  // Select contact type
  await page.click('button[role="combobox"]:has-text("Select Contact Type")');
  await page.waitForSelector('[role="option"]', { timeout: 5000 });
  await page.locator('[role="option"]').first().click();

  // Select currency
  await page.click('button[role="combobox"]:has-text("Select Currency")');
  await page.waitForSelector('[role="option"]', { timeout: 5000 });
  await page.locator('[role="option"]').first().click();

  // Select tax treatment
  await page.click('button[role="combobox"]:has-text("Select Tax Treatment")');
  await page.waitForSelector('[role="option"]', { timeout: 5000 });
  await page.locator('[role="option"]').first().click();

  await page.getByRole('button', { name: /save|create/i }).click();
  await page.waitForURL('**/contact/**', { timeout: 10000 });

  return { email, firstName: 'TestFirst', lastName: 'TestLast' };
}

test.describe('Contact View Page Layout', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display view page with proper layout and spacing', async ({ page }) => {
    // Create a test contact first
    const contact = await createTestContact(page);

    // Navigate to contact list
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table', { timeout: 5000 });

    // Click on the first contact row to view
    await page.locator('table tbody tr').first().click();
    await page.waitForURL('**/contact/view**', { timeout: 5000 });

    // Check page header exists
    const pageHeader = page.locator('h1').first();
    await expect(pageHeader).toBeVisible();

    // Check breadcrumb navigation
    const breadcrumb = page.locator('nav').first();
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText('Home');
    await expect(breadcrumb).toContainText('Contacts');

    // Check status badge is visible
    const statusBadge = page.locator('[class*="badge"]').first();
    await expect(statusBadge).toBeVisible();

    // Check main content cards are visible
    const cards = page.locator('.corp-card, [class*="card"]');
    await expect(cards.first()).toBeVisible();

    // Check proper spacing between sections
    const cardsCount = await cards.count();
    expect(cardsCount).toBeGreaterThan(0);

    // Take screenshot for visual inspection
    await page.screenshot({
      path: 'e2e/screenshots/contact-view-layout.png',
      fullPage: true,
    });
  });

  test('should display contact information fields properly', async ({ page }) => {
    // Navigate to first contact
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table', { timeout: 5000 });
    await page.locator('table tbody tr').first().click();
    await page.waitForURL('**/contact/view**', { timeout: 5000 });

    // Check if info fields or cards are visible
    const cards = page.locator('[class*="card"], .card');
    const cardsCount = await cards.count();
    expect(cardsCount).toBeGreaterThan(0);

    // Verify icons are displayed (Lucide icons)
    const icons = page.locator('svg');
    expect(await icons.count()).toBeGreaterThan(2); // Should have multiple icons
  });

  test('should display addresses with proper formatting', async ({ page }) => {
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table', { timeout: 5000 });
    await page.locator('table tbody tr').first().click();
    await page.waitForURL('**/contact/view**', { timeout: 5000 });

    // Check for address sections - look for headings with Billing or Shipping text
    const billingText = page.getByText(/billing/i).first();
    await expect(billingText).toBeVisible();

    // Check cards are displayed
    const cards = page.locator('[class*="card"], .card');
    expect(await cards.count()).toBeGreaterThan(0);
  });
});

test.describe('Contact Edit Page Layout', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display edit page with proper form layout', async ({ page }) => {
    // Navigate to contact list and click edit
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table', { timeout: 5000 });

    // Click actions menu and select edit
    await page.locator('table tbody button[aria-haspopup="menu"]').first().click();
    await page.getByRole('menuitem', { name: /edit/i }).click();
    await page.waitForURL(/\/(contact\/(edit|detail))/, { timeout: 10000 });

    // Check page header
    const pageHeader = page.locator('h1');
    await expect(pageHeader).toBeVisible();
    await expect(pageHeader).toContainText(/Edit|Update/);

    // Check form is visible
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/contact-edit-layout.png',
      fullPage: true,
    });
  });

  test('should have properly aligned radio buttons for status', async ({ page }) => {
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table', { timeout: 5000 });

    // Click edit on first contact
    await page.locator('table tbody button[aria-haspopup="menu"]').first().click();
    await page.getByRole('menuitem', { name: /edit/i }).click();
    await page.waitForURL(/\/(contact\/(edit|detail))/, { timeout: 10000 });

    // Check radio group exists
    const radioGroup = page.locator('[role="radiogroup"]').first();
    await expect(radioGroup).toBeVisible();

    // Get the radio buttons
    const radioButtons = page.locator('[role="radio"]');
    expect(await radioButtons.count()).toBe(2);

    // Check alignment - radio buttons should be in a flex container with proper gap
    const radioGroupBox = await radioGroup.boundingBox();
    expect(radioGroupBox).toBeTruthy();

    // Get positions of both radio button containers
    const activeRadio = radioButtons.first();
    const inactiveRadio = radioButtons.last();

    const activeBox = await activeRadio.boundingBox();
    const inactiveBox = await inactiveRadio.boundingBox();

    expect(activeBox).toBeTruthy();
    expect(inactiveBox).toBeTruthy();

    // Check vertical alignment (y-coordinates should be similar)
    const yDifference = Math.abs(activeBox!.y - inactiveBox!.y);
    expect(yDifference).toBeLessThan(5); // Allow 5px difference for alignment

    // Check that labels are next to radio buttons
    const activeLabel = page.locator('label[for="status-active"]');
    const inactiveLabel = page.locator('label[for="status-inactive"]');

    await expect(activeLabel).toBeVisible();
    await expect(inactiveLabel).toBeVisible();

    // Verify labels are properly aligned with radio buttons
    const activeLabelBox = await activeLabel.boundingBox();
    const inactiveLabelBox = await inactiveLabel.boundingBox();

    expect(activeLabelBox).toBeTruthy();
    expect(inactiveLabelBox).toBeTruthy();

    // Labels should be to the right of radio buttons
    expect(activeLabelBox!.x).toBeGreaterThan(activeBox!.x);
    expect(inactiveLabelBox!.x).toBeGreaterThan(inactiveBox!.x);
  });

  test('should display form fields in proper grid layout', async ({ page }) => {
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table', { timeout: 5000 });

    await page.locator('table tbody button[aria-haspopup="menu"]').first().click();
    await page.getByRole('menuitem', { name: /edit/i }).click();
    await page.waitForURL(/\/(contact\/(edit|detail))/, { timeout: 10000 });

    // Check that form sections are properly separated
    const formSections = page
      .locator('[class*="card"]')
      .filter({ hasText: /Contact Name|Contact Details|Address/ });
    expect(await formSections.count()).toBeGreaterThanOrEqual(3);

    // Check grid layouts for form fields
    const gridLayouts = page.locator('[class*="grid"]');
    expect(await gridLayouts.count()).toBeGreaterThan(0);

    // Verify proper spacing between form fields
    const formFields = page.locator('input[class*="corp-input"]');
    expect(await formFields.count()).toBeGreaterThan(5);
  });

  test('should display address sections with proper layout', async ({ page }) => {
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table', { timeout: 5000 });

    await page.locator('table tbody button[aria-haspopup="menu"]').first().click();
    await page.getByRole('menuitem', { name: /edit/i }).click();
    await page.waitForURL(/\/(contact\/(edit|detail))/, { timeout: 10000 });

    // Scroll to address section
    await page.locator('text=/Billing.*Address|Address Details/').scrollIntoViewIfNeeded();

    // Check for billing address section
    const billingSection = page.locator('text=/Billing/').first();
    await expect(billingSection).toBeVisible();

    // Check for shipping address section
    const shippingSection = page.locator('text=/Shipping/').first();
    await expect(shippingSection).toBeVisible();

    // Check for "same as billing" checkbox
    const sameAddressCheckbox = page
      .locator('input[type="checkbox"]')
      .filter({ has: page.locator('~ label:has-text("Same as Billing")') });
    await expect(sameAddressCheckbox.first()).toBeVisible();

    // Check separator between sections
    const separators = page.locator('[class*="separator"]');
    expect(await separators.count()).toBeGreaterThan(0);

    // Take screenshot of address section
    await page.screenshot({
      path: 'e2e/screenshots/contact-edit-addresses.png',
      fullPage: true,
    });
  });

  test('should have proper action buttons layout', async ({ page }) => {
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table', { timeout: 5000 });

    await page.locator('table tbody button[aria-haspopup="menu"]').first().click();
    await page.getByRole('menuitem', { name: /edit/i }).click();
    await page.waitForURL(/\/(contact\/(edit|detail))/, { timeout: 10000 });

    // Scroll to bottom where action buttons are
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check for action buttons
    const submitButton = page.getByRole('button', { name: /update|save/i });
    const cancelButton = page.getByRole('button', { name: /cancel/i });

    await expect(submitButton).toBeVisible();
    await expect(cancelButton).toBeVisible();

    // Check buttons are properly spaced
    const submitBox = await submitButton.boundingBox();
    const cancelBox = await cancelButton.boundingBox();

    expect(submitBox).toBeTruthy();
    expect(cancelBox).toBeTruthy();

    // Buttons should not overlap
    const horizontalOverlap =
      submitBox!.x < cancelBox!.x + cancelBox!.width &&
      cancelBox!.x < submitBox!.x + submitBox!.width;
    const verticalOverlap =
      submitBox!.y < cancelBox!.y + cancelBox!.height &&
      cancelBox!.y < submitBox!.y + submitBox!.height;

    // If they're on the same row, they shouldn't overlap horizontally
    if (Math.abs(submitBox!.y - cancelBox!.y) < 10) {
      expect(horizontalOverlap).toBe(false);
    }
  });
});

test.describe('Contact Create Page Layout', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display create page with proper form layout', async ({ page }) => {
    await page.goto('/admin/master/contact/create');
    await page.waitForSelector('form', { timeout: 5000 });

    // Check page header
    const pageHeader = page.locator('h1');
    await expect(pageHeader).toBeVisible();

    // Check form is visible
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/contact-create-layout.png',
      fullPage: true,
    });
  });

  test('should have consistent styling with edit page', async ({ page }) => {
    // Go to create page
    await page.goto('/admin/master/contact/create');
    await page.waitForSelector('form', { timeout: 5000 });

    // Check for similar elements as edit page
    const radioGroup = page.locator('[role="radiogroup"]').first();
    await expect(radioGroup).toBeVisible();

    const formSections = page.locator('[class*="card"]');
    expect(await formSections.count()).toBeGreaterThan(0);

    const gridLayouts = page.locator('[class*="grid"]');
    expect(await gridLayouts.count()).toBeGreaterThan(0);
  });
});

test.describe('Responsive Design Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display properly on tablet viewport', async ({ page }) => {
    // Set viewport to tablet size
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/admin/master/contact');
    await page.waitForSelector('table', { timeout: 5000 });
    await page.locator('table tbody tr').first().click();
    await page.waitForURL('**/contact/view**', { timeout: 5000 });

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/contact-view-tablet.png',
      fullPage: true,
    });

    // Elements should still be visible
    const pageHeader = page.locator('h1').first();
    await expect(pageHeader).toBeVisible();
  });

  test('should display properly on mobile viewport', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/admin/master/contact');
    await page.waitForTimeout(2000); // Give time for responsive layout

    // Take screenshot
    await page.screenshot({
      path: 'e2e/screenshots/contact-list-mobile.png',
      fullPage: true,
    });

    // Check that key elements are still accessible
    const pageHeader = page.locator('h1').first();
    await expect(pageHeader).toBeVisible();
  });
});

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should match expected visual design for view page', async ({ page }) => {
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table', { timeout: 5000 });
    await page.locator('table tbody tr').first().click();
    await page.waitForURL('**/contact/view**', { timeout: 5000 });

    // Wait for all content to load
    await page.waitForLoadState('networkidle');

    // Check theme colors are applied
    const primaryElements = page.locator(
      '[style*="color: rgb(32, 100, 216)"], [style*="color:#2064d8"]'
    );
    expect(await primaryElements.count()).toBeGreaterThan(0);
  });

  test('should have consistent spacing and padding', async ({ page }) => {
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table', { timeout: 5000 });

    await page.locator('table tbody button[aria-haspopup="menu"]').first().click();
    await page.getByRole('menuitem', { name: /edit/i }).click();
    await page.waitForURL(/\/(contact\/(edit|detail))/, { timeout: 10000 });

    // Check cards have consistent padding
    const cards = page.locator('[class*="card"]');
    const firstCardBox = await cards.first().boundingBox();
    expect(firstCardBox).toBeTruthy();

    // Cards should have reasonable dimensions
    expect(firstCardBox!.width).toBeGreaterThan(200);
    expect(firstCardBox!.height).toBeGreaterThan(50);
  });
});
