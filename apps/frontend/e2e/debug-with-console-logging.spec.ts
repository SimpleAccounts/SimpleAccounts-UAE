import { test } from '@playwright/test';
import { login, createTestContact } from './helpers/contact-helpers';

const username = process.env.E2E_USERNAME || '';
const password = process.env.E2E_PASSWORD || '';

test('capture comprehensive console logs during contact creation', async ({ page }) => {
  // Capture ALL console messages
  const allConsoleLogs: string[] = [];

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    allConsoleLogs.push(`[${type.toUpperCase()}] ${text}`);
  });

  // Capture page errors
  const pageErrors: string[] = [];
  page.on('pageerror', err => {
    pageErrors.push(`PAGE ERROR: ${err.message}\n${err.stack}`);
  });

  // Login and create contact
  await login(page, username, password);

  const timestamp = Date.now();
  console.log(`\n🧪 [TEST] Starting contact creation test at ${new Date().toISOString()}`);
  console.log(`🧪 [TEST] Using email: apitest${timestamp}@example.com`);

  await createTestContact(page, 'DebugLog', 'Test', `apitest${timestamp}@example.com`);

  // Wait for any async operations
  await page.waitForTimeout(3000);

  console.log(`\n${'='.repeat(80)}`);
  console.log('📋 COMPLETE CONSOLE LOG OUTPUT');
  console.log('='.repeat(80));

  // Filter and display logs from our debug markers
  const relevantLogs = allConsoleLogs.filter(
    log =>
      log.includes('[CONTACT_CREATE]') ||
      log.includes('[getData]') ||
      log.includes('API') ||
      log.includes('validation') ||
      log.includes('address')
  );

  if (relevantLogs.length > 0) {
    relevantLogs.forEach(log => console.log(log));
  } else {
    console.log('⚠️  No debug logs captured. Showing all console output:');
    allConsoleLogs.forEach(log => console.log(log));
  }

  if (pageErrors.length > 0) {
    console.log(`\n${'='.repeat(80)}`);
    console.log('❌ PAGE ERRORS');
    console.log('='.repeat(80));
    pageErrors.forEach(err => console.log(err));
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`Final URL: ${page.url()}`);
  console.log('='.repeat(80));

  // Take screenshot
  await page.screenshot({ path: 'e2e/debug-console-logging.png', fullPage: true });
  console.log('\nScreenshot saved to e2e/debug-console-logging.png');
});
