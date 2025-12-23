import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Frontend Render Debug', () => {
  test('should debug why frontend is not rendering', async ({ page }) => {
    const allErrors: Array<{ type: string; message: string; stack?: string; url?: string }> = [];
    const consoleMessages: string[] = [];

    // Capture all console messages
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(`[${msg.type()}] ${text}`);
      if (msg.type() === 'error') {
        allErrors.push({
          type: 'console',
          message: text,
        });
      }
    });

    // Capture page errors (uncaught exceptions)
    page.on('pageerror', error => {
      allErrors.push({
        type: 'pageerror',
        message: error.message,
        stack: error.stack,
      });
    });

    // Capture failed requests
    page.on('requestfailed', request => {
      const failure = request.failure();
      if (failure) {
        allErrors.push({
          type: 'network',
          message: `${request.method()} ${request.url()} - ${failure.errorText}`,
          url: request.url(),
        });
      }
    });

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait a bit for React to render
    await page.waitForTimeout(5000);

    // Get page content and state
    const pageInfo = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        rootExists: !!root,
        rootChildren: root ? root.children.length : 0,
        rootInnerHTML: root ? root.innerHTML.substring(0, 500) : '',
        bodyInnerHTML: document.body.innerHTML.substring(0, 500),
        hasReact: typeof (window as any).React !== 'undefined',
        hasReactDOM: typeof (window as any).ReactDOM !== 'undefined',
        allScripts: Array.from(document.querySelectorAll('script')).map(s => ({
          src: s.src || 'inline',
          type: s.type,
        })),
        allErrors: (window as any).__REACT_ERROR__ || null,
      };
    });

    console.log('\n=== PAGE INFO ===');
    console.log(JSON.stringify(pageInfo, null, 2));

    console.log('\n=== CONSOLE MESSAGES (last 20) ===');
    consoleMessages.slice(-20).forEach(msg => console.log(msg));

    console.log('\n=== ERRORS ===');
    if (allErrors.length > 0) {
      allErrors.forEach(err => {
        console.log(`[${err.type}] ${err.message}`);
        if (err.stack) {
          console.log(err.stack);
        }
      });
    } else {
      console.log('No errors captured');
    }

    // Take screenshot
    await page.screenshot({ path: 'test-results/debug-frontend-render.png', fullPage: true });

    // Check if root is empty
    if (pageInfo.rootChildren === 0) {
      console.log('\n⚠️ React root is EMPTY - components are not rendering');

      // Check if it's a routing issue
      const currentUrl = page.url();
      console.log(`Current URL: ${currentUrl}`);

      // Check if there's any content at all
      if (pageInfo.rootInnerHTML.trim() === '') {
        console.log('⚠️ Root innerHTML is completely empty');
      }
    }

    // Check for specific React errors
    const reactErrors = allErrors.filter(
      err =>
        err.message.includes('Element type is invalid') ||
        err.message.includes('Cannot') ||
        err.message.includes('undefined') ||
        err.message.includes('is not a function')
    );

    if (reactErrors.length > 0) {
      console.log('\n=== REACT ERRORS ===');
      reactErrors.forEach(err => console.log(err.message));
    }

    // The test will pass regardless, we just want to see the output
    expect(pageInfo.rootExists).toBe(true);
  });
});
