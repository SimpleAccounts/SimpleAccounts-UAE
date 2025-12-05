import { test, expect } from '@playwright/test';

const RUN_SMOKE = process.env.RUN_E2E_SMOKE === 'true';
const LOGIN_PATH = process.env.E2E_LOGIN_PATH || '/login';
const POST_LOGIN_PATH = process.env.E2E_POST_LOGIN_PATH || '/admin';
const CONTACTS_PATH =
  process.env.E2E_CONTACTS_PATH || '/admin/master/contact';

const describeSmoke = RUN_SMOKE ? test.describe : test.describe.skip;

describeSmoke('Contact management smoke journey', () => {
  test('logs in and navigates to contacts list', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run the contact smoke test',
    );

    // Login
    await page.goto(LOGIN_PATH);
    await expect(page.locator('input#username')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();

    await page.fill('input#username', username!);
    await page.fill('input#password', password!);

    const loginButton = page.getByRole('button', { name: /log in/i });
    const buttonHandle = await loginButton.elementHandle();
    if (buttonHandle) {
      await loginButton.click({ timeout: 180_000 });
    } else {
      await page.keyboard.press('Enter', { delay: 200 });
    }

    const normalizedPostLoginPath = POST_LOGIN_PATH.startsWith('/')
      ? POST_LOGIN_PATH
      : `/${POST_LOGIN_PATH}`;
    await page.waitForURL(`**${normalizedPostLoginPath}**`, {
      timeout: 180_000,
    });

    // Navigate to contacts
    await page.goto(CONTACTS_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.contact-screen, [class*="contact"]', {
      timeout: 180_000,
    });

    // Verify the contact list container is displayed
    const listContainer = page.locator('.contact-screen, [class*="contact-list"]');
    await expect(listContainer.first()).toBeVisible({ timeout: 60_000 });
  });

  test('can open new contact form', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run the contact form smoke test',
    );

    // Login
    await page.goto(LOGIN_PATH);
    await page.fill('input#username', username!);
    await page.fill('input#password', password!);

    const loginButton = page.getByRole('button', { name: /log in/i });
    const buttonHandle = await loginButton.elementHandle();
    if (buttonHandle) {
      await loginButton.click({ timeout: 180_000 });
    } else {
      await page.keyboard.press('Enter', { delay: 200 });
    }

    const normalizedPostLoginPath = POST_LOGIN_PATH.startsWith('/')
      ? POST_LOGIN_PATH
      : `/${POST_LOGIN_PATH}`;
    await page.waitForURL(`**${normalizedPostLoginPath}**`, {
      timeout: 180_000,
    });

    // Navigate to contact creation
    const createContactPath = `${CONTACTS_PATH}/create`;
    await page.goto(createContactPath, { waitUntil: 'domcontentloaded' });

    // Verify form elements are present (name input field)
    const nameInput = page.locator('input[name*="name"], input#name, input[id*="name"]');
    await expect(nameInput.first()).toBeVisible({ timeout: 180_000 });
  });
});
