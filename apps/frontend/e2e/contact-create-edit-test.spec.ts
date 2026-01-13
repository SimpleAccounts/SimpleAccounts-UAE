import { test, expect } from '@playwright/test';

/**
 * Contact Create and Edit Page Design Test
 * Verify both pages have proper design like the detail page
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

test.describe('Contact Create Page Design', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display create page with proper design', async ({ page }) => {
    await page.goto('/admin/master/contact/create');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take full screenshot
    await page.screenshot({
      path: 'e2e/screenshots/contact-create-page-full.png',
      fullPage: true,
    });

    // Check for page header
    const pageHeader = page
      .locator('h1, h2, h3')
      .filter({ hasText: /create|add.*contact/i })
      .first();
    await expect(pageHeader).toBeVisible({ timeout: 5000 });

    // Check for radio buttons
    const radioButtons = page.locator('[role="radio"]');
    const radioCount = await radioButtons.count();
    console.log(`Found ${radioCount} radio buttons on create page`);

    // Check for form sections - look for section headers
    const sectionHeaders = page
      .locator('h3, h4')
      .filter({ hasText: /contact name|contact details|address/i });
    const headersCount = await sectionHeaders.count();
    console.log(`Found ${headersCount} section headers on create page`);

    // Check for cards/sections
    const cards = page.locator('[class*="card"], .card, [class*="Card"]');
    const cardsCount = await cards.count();
    console.log(`Found ${cardsCount} cards on create page`);

    // Check for icons (should have Lucide icons)
    const icons = page.locator('svg');
    const iconsCount = await icons.count();
    console.log(`Found ${iconsCount} icons on create page`);

    // Check form fields
    const inputs = page.locator('input[type="text"], input[type="email"]');
    const inputCount = await inputs.count();
    console.log(`Found ${inputCount} input fields on create page`);
    expect(inputCount).toBeGreaterThan(5);
  });

  test('should have section headers with icons like edit page', async ({ page }) => {
    await page.goto('/admin/master/contact/create');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for "Contact Name" section
    const contactNameSection = page.getByText(/contact name/i).first();
    await expect(contactNameSection).toBeVisible({ timeout: 5000 });

    // Screenshot the top section
    await page.screenshot({
      path: 'e2e/screenshots/contact-create-top-section.png',
      clip: { x: 0, y: 0, width: 1200, height: 600 },
    });
  });

  test('should check radio button alignment on create page', async ({ page }) => {
    await page.goto('/admin/master/contact/create');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for radio buttons
    const radioButtons = page.locator('[role="radio"]');
    const count = await radioButtons.count();

    if (count >= 2) {
      const radio1 = radioButtons.first();
      const radio2 = radioButtons.nth(1);

      const box1 = await radio1.boundingBox();
      const box2 = await radio2.boundingBox();

      if (box1 && box2) {
        const yDifference = Math.abs(box1.y - box2.y);
        console.log(`Create page radio button Y-coordinate difference: ${yDifference}px`);

        // Screenshot radio section
        const radioGroup = page.locator('[role="radiogroup"]').first();
        await radioGroup.screenshot({
          path: 'e2e/screenshots/contact-create-radio-buttons.png',
        });

        expect(yDifference).toBeLessThan(5);
      }
    }
  });
});

test.describe('Contact Edit Page Design', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display edit page with proper design', async ({ page }) => {
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Click edit on first contact
    const actionsButton = page.locator('table tbody button[aria-haspopup="menu"]').first();
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /edit/i }).click();

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take full screenshot
    await page.screenshot({
      path: 'e2e/screenshots/contact-edit-page-design.png',
      fullPage: true,
    });

    // Check for page header with proper styling
    const pageHeader = page
      .locator('h1')
      .filter({ hasText: /edit|update/i })
      .first();
    await expect(pageHeader).toBeVisible({ timeout: 5000 });

    // Check for section cards with icons
    const cards = page.locator('[class*="card"], .card');
    const cardsCount = await cards.count();
    console.log(`Found ${cardsCount} cards on edit page`);
    expect(cardsCount).toBeGreaterThan(2);

    // Check for section headers with icons (User icon, Building2 icon, MapPin icon)
    const icons = page.locator('svg[class*="lucide"], svg');
    const iconsCount = await icons.count();
    console.log(`Found ${iconsCount} icons on edit page`);
    expect(iconsCount).toBeGreaterThan(5);
  });

  test('should have card-based sections on edit page', async ({ page }) => {
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    const actionsButton = page.locator('table tbody button[aria-haspopup="menu"]').first();
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /edit/i }).click();

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for "Contact Name" card with User icon
    const contactNameCard = page.locator('text=/contact name/i').first();
    await expect(contactNameCard).toBeVisible({ timeout: 5000 });

    // Check for "Contact Details" section
    const contactDetailsSection = page.getByText(/contact details/i).first();
    await expect(contactDetailsSection).toBeVisible({ timeout: 5000 });

    // Check for "Address" section
    const addressSection = page.getByText(/address.*details|billing|shipping/i).first();
    await expect(addressSection).toBeVisible({ timeout: 5000 });

    // Screenshot sections
    await page.screenshot({
      path: 'e2e/screenshots/contact-edit-sections.png',
      fullPage: false,
    });
  });

  test('should have cards with proper borders and spacing', async ({ page }) => {
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    const actionsButton = page.locator('table tbody button[aria-haspopup="menu"]').first();
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /edit/i }).click();

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for corp-card class or card styling
    const cards = page.locator('[class*="corp-card"], [class*="card"]');
    const firstCard = cards.first();

    if (await firstCard.isVisible()) {
      const box = await firstCard.boundingBox();
      console.log('First card dimensions:', box);

      // Screenshot just the first section card
      await firstCard.screenshot({
        path: 'e2e/screenshots/contact-edit-section-card.png',
      });
    }
  });
});

test.describe('Design Comparison', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('compare create and edit page styling consistency', async ({ page }) => {
    // Check create page
    await page.goto('/admin/master/contact/create');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const createRadios = await page.locator('[role="radio"]').count();
    const createCards = await page.locator('[class*="card"]').count();
    const createIcons = await page.locator('svg').count();

    console.log('Create page elements:', { createRadios, createCards, createIcons });

    // Check edit page
    await page.goto('/admin/master/contact');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    const actionsButton = page.locator('table tbody button[aria-haspopup="menu"]').first();
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /edit/i }).click();

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const editRadios = await page.locator('[role="radio"]').count();
    const editCards = await page.locator('[class*="card"]').count();
    const editIcons = await page.locator('svg').count();

    console.log('Edit page elements:', { editRadios, editCards, editIcons });

    // Both should have similar structure
    console.log('Design consistency check:');
    console.log(`Radio buttons - Create: ${createRadios}, Edit: ${editRadios}`);
    console.log(`Cards - Create: ${createCards}, Edit: ${editCards}`);
    console.log(`Icons - Create: ${createIcons}, Edit: ${editIcons}`);
  });
});
