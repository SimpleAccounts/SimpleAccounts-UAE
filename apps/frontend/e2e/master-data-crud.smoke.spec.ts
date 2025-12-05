import { test, expect } from '@playwright/test';

const RUN_SMOKE = process.env.RUN_E2E_SMOKE === 'true';
const LOGIN_PATH = process.env.E2E_LOGIN_PATH || '/login';
const POST_LOGIN_PATH = process.env.E2E_POST_LOGIN_PATH || '/admin';
const COA_PATH = process.env.E2E_COA_PATH || '/admin/master/chart-of-account';
const PRODUCTS_PATH = process.env.E2E_PRODUCTS_PATH || '/admin/master/product';
const VAT_PATH = process.env.E2E_VAT_PATH || '/admin/master/vat-category';

const describeSmoke = RUN_SMOKE ? test.describe : test.describe.skip;

async function login(page: any, username: string, password: string) {
  await page.goto(LOGIN_PATH);
  await page.fill('input#username', username);
  await page.fill('input#password', password);

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
  await page.waitForURL(`**${normalizedPostLoginPath}**`, { timeout: 180_000 });
}

describeSmoke('Master Data CRUD smoke journey', () => {
  test('navigates to Chart of Accounts and views list', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run master data smoke test',
    );

    await login(page, username!, password!);

    // Navigate to Chart of Accounts
    await page.goto(COA_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[class*="chart-of-account"], [class*="coa"]', {
      timeout: 180_000,
    });

    // Verify list is displayed
    const heading = page.locator('h4, .h4').first();
    await expect(heading).toBeVisible({ timeout: 60_000 });
  });

  test('can open new Chart of Account form', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run COA form smoke test',
    );

    await login(page, username!, password!);

    // Navigate to COA creation
    const createPath = `${COA_PATH}/create`;
    await page.goto(createPath, { waitUntil: 'domcontentloaded' });

    // Verify form elements are present
    const formContainer = page.locator('form, [class*="create"]');
    await expect(formContainer.first()).toBeVisible({ timeout: 180_000 });

    // Check for account name/code inputs
    const nameInput = page.locator('input[name*="name"], input#name, input[id*="accountName"]');
    await expect(nameInput.first()).toBeVisible({ timeout: 60_000 });
  });

  test('navigates to Products list', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run products smoke test',
    );

    await login(page, username!, password!);

    // Navigate to Products
    await page.goto(PRODUCTS_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[class*="product"]', { timeout: 180_000 });

    // Verify product list is displayed
    const heading = page.locator('h4, .h4').first();
    await expect(heading).toBeVisible({ timeout: 60_000 });
  });

  test('can open new Product form', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run product form smoke test',
    );

    await login(page, username!, password!);

    // Navigate to product creation
    const createPath = `${PRODUCTS_PATH}/create`;
    await page.goto(createPath, { waitUntil: 'domcontentloaded' });

    // Verify form is present
    const formContainer = page.locator('form, [class*="create"]');
    await expect(formContainer.first()).toBeVisible({ timeout: 180_000 });
  });

  test('navigates to VAT Categories list', async ({ page }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run VAT categories smoke test',
    );

    await login(page, username!, password!);

    // Navigate to VAT Categories
    await page.goto(VAT_PATH, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[class*="vat"], [class*="tax"]', {
      timeout: 180_000,
    });

    // Verify VAT list is displayed
    const heading = page.locator('h4, .h4').first();
    await expect(heading).toBeVisible({ timeout: 60_000 });
  });
});
