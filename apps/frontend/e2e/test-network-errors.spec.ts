import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Network and JavaScript Loading', () => {
  test('should check if JavaScript bundles are loading', async ({ page }) => {
    const failedRequests: string[] = [];
    const loadedScripts: string[] = [];
    
    // Monitor network requests
    page.on('requestfailed', request => {
      failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    page.on('response', response => {
      if (response.url().includes('.js') || response.url().includes('index.js')) {
        loadedScripts.push(`${response.status()} ${response.url()}`);
      }
      if (response.status() >= 400) {
        failedRequests.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    console.log('Failed requests:', failedRequests.length);
    if (failedRequests.length > 0) {
      console.log('Failed:', failedRequests.slice(0, 10));
    }
    
    console.log('Loaded scripts:', loadedScripts.length);
    if (loadedScripts.length > 0) {
      console.log('Scripts:', loadedScripts.slice(0, 10));
    }
    
    // Check if main bundle loaded
    const mainBundleLoaded = loadedScripts.some(s => s.includes('index.js') || s.includes('main'));
    console.log('Main bundle loaded:', mainBundleLoaded);
    
    // Check for React in window
    const hasReact = await page.evaluate(() => {
      return typeof window.React !== 'undefined' || 
             typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined';
    });
    console.log('React in window:', hasReact);
    
    // Check if root has children
    const rootChildren = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.children.length : 0;
    });
    console.log('Root children:', rootChildren);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/network-check.png', fullPage: true });
    
    // Critical: main bundle should load
    expect(mainBundleLoaded).toBe(true);
    expect(failedRequests.filter(f => f.includes('.js')).length).toBe(0);
  });
});

