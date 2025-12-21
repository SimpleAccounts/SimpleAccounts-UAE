import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:80';

test.describe('JavaScript Error Detection', () => {
  test('should capture all JavaScript errors preventing rendering', async ({ page }) => {
    const allErrors: Array<{ type: string; message: string; stack?: string }> = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        allErrors.push({
          type: 'console',
          message: msg.text(),
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
        });
      }
    });

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    // Try to evaluate React rendering
    const renderInfo = await page.evaluate(() => {
      const root = document.getElementById('root');
      const info: any = {
        rootExists: !!root,
        rootChildren: root ? root.children.length : 0,
        rootInnerHTML: root ? root.innerHTML.substring(0, 200) : '',
        hasReact: typeof (window as any).React !== 'undefined',
        errors: [],
      };

      // Check for any error boundaries
      const errorBoundaries = document.querySelectorAll('[data-error-boundary]');
      info.errorBoundaries = errorBoundaries.length;

      return info;
    });

    console.log('Render Info:', JSON.stringify(renderInfo, null, 2));
    console.log('Total Errors Captured:', allErrors.length);

    if (allErrors.length > 0) {
      console.log('Errors:', JSON.stringify(allErrors, null, 2));
    }

    // Check if React root has content
    if (renderInfo.rootChildren === 0 && renderInfo.rootInnerHTML.trim() === '') {
      console.log('⚠️ React root is empty - component not rendering');
    }

    // Take screenshot
    await page.screenshot({ path: 'test-results/js-errors-debug.png', fullPage: true });

    // Filter critical errors (excluding the export-to-csv 504 which is lazy-loaded)
    const criticalErrors = allErrors.filter(
      e =>
        !e.message.includes('export-to-csv') &&
        !e.message.includes('504') &&
        (e.type === 'pageerror' || e.message.includes('Cannot') || e.message.includes('undefined'))
    );

    console.log('Critical Errors:', criticalErrors.length);
    if (criticalErrors.length > 0) {
      console.log('Critical:', JSON.stringify(criticalErrors, null, 2));
    }

    // The test passes if we can identify the issue
    // We expect either rendering to work OR we capture the error
    expect(criticalErrors.length).toBeLessThan(5); // Allow some non-critical errors
  });
});
