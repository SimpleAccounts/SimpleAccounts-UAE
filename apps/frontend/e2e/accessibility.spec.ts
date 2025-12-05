import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const RUN_SMOKE = process.env.RUN_E2E_SMOKE === 'true';
const LOGIN_PATH = process.env.E2E_LOGIN_PATH || '/login';
const POST_LOGIN_PATH = process.env.E2E_POST_LOGIN_PATH || '/admin';

const describeSmoke = RUN_SMOKE ? test.describe : test.describe.skip;

test.describe('Accessibility tests - Login page', () => {
  test('login page should not have critical accessibility violations', async ({
    page,
  }) => {
    await page.goto(LOGIN_PATH);
    await page.waitForSelector('input#username, input[name="username"]', {
      timeout: 30_000,
    });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast']) // May have false positives with dynamic themes
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    expect(criticalViolations).toEqual([]);
  });
});

describeSmoke('Accessibility tests - Authenticated pages', () => {
  test('dashboard should not have critical accessibility violations', async ({
    page,
  }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run authenticated accessibility tests',
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

    // Wait for dashboard to load
    await page.waitForLoadState('networkidle', { timeout: 60_000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast']) // May have false positives
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    // Log all violations for reporting
    if (accessibilityScanResults.violations.length > 0) {
      test.info().annotations.push({
        type: 'a11y-violations',
        description: JSON.stringify(
          accessibilityScanResults.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            nodes: v.nodes.length,
          })),
        ),
      });
    }

    expect(criticalViolations).toEqual([]);
  });

  test('invoice page should not have critical accessibility violations', async ({
    page,
  }) => {
    test.setTimeout(240_000);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;
    const invoicePath = '/admin/income/customer-invoice';

    test.skip(
      !username || !password,
      'Set E2E_USERNAME and E2E_PASSWORD to run authenticated accessibility tests',
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

    // Navigate to invoice page
    await page.goto(invoicePath, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.customer-invoice-screen', {
      timeout: 180_000,
    });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    expect(criticalViolations).toEqual([]);
  });
});
