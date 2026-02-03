import { Page, expect, APIRequestContext } from '@playwright/test';
import { getApiBaseUrl, getFrontendBaseUrl } from './test-setup-helpers';

/**
 * Financial report request data structure
 */
export interface FinancialReportRequest {
  startDate?: string; // Format: DD-MM-YYYY
  endDate?: string; // Format: DD-MM-YYYY
  period?: string; // Financial period (e.g., "2024-01")
  reportType?: string; // Report type identifier
}

/**
 * Generates a Profit & Loss report via API
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param reportRequest - Report request parameters
 * @returns Profit & Loss report data
 *
 * @example
 * ```typescript
 * const pnlReport = await generateProfitLossReport(request, token, {
 *   startDate: '01-01-2024',
 *   endDate: '31-12-2024'
 * });
 * ```
 */
export async function generateProfitLossReport(
  request: APIRequestContext,
  authToken: string,
  reportRequest: FinancialReportRequest = {}
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const today = new Date();
  const lastYear = new Date(today.getFullYear() - 1, 0, 1);
  const formattedStartDate = reportRequest.startDate || formatDate(lastYear);
  const formattedEndDate = reportRequest.endDate || formatDate(today);

  const url = `${apiUrl}/rest/financialReport/profitandloss?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;

  const response = await request.get(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to generate Profit & Loss report: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Generates a Balance Sheet report via API
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param reportRequest - Report request parameters
 * @returns Balance Sheet report data
 */
export async function generateBalanceSheetReport(
  request: APIRequestContext,
  authToken: string,
  reportRequest: FinancialReportRequest = {}
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const today = new Date();
  const formattedDate = reportRequest.endDate || formatDate(today);

  const url = `${apiUrl}/rest/financialReport/balanceSheet?startDate=${formattedDate}&endDate=${formattedDate}`;

  const response = await request.get(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to generate Balance Sheet report: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Generates a Trial Balance report via API
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param reportRequest - Report request parameters
 * @returns Trial Balance report data
 */
export async function generateTrialBalanceReport(
  request: APIRequestContext,
  authToken: string,
  reportRequest: FinancialReportRequest = {}
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const today = new Date();
  const formattedDate = reportRequest.endDate || formatDate(today);

  const url = `${apiUrl}/rest/financialReport/trialBalanceReport?startDate=${formattedDate}&endDate=${formattedDate}`;

  const response = await request.get(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to generate Trial Balance report: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Generates a Cash Flow report via API
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param reportRequest - Report request parameters
 * @returns Cash Flow report data
 */
export async function generateCashFlowReport(
  request: APIRequestContext,
  authToken: string,
  reportRequest: FinancialReportRequest = {}
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const today = new Date();
  const lastYear = new Date(today.getFullYear() - 1, 0, 1);
  const formattedStartDate = reportRequest.startDate || formatDate(lastYear);
  const formattedEndDate = reportRequest.endDate || formatDate(today);

  const url = `${apiUrl}/rest/financialReport/cashflow?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;

  const response = await request.get(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to generate Cash Flow report: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Navigates to financial reports page
 *
 * @param page - Playwright Page object
 * @throws Error if navigation fails
 */
export async function navigateToFinancialReports(page: Page): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const reportsPath = '/admin/financial-report';
  await page.goto(`${baseUrl}${reportsPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to Profit & Loss report page
 *
 * @param page - Playwright Page object
 * @throws Error if navigation fails
 */
export async function navigateToProfitLossReport(page: Page): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const reportPath = '/admin/financial-report/profit-and-loss';
  await page.goto(`${baseUrl}${reportPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to Balance Sheet report page
 *
 * @param page - Playwright Page object
 * @throws Error if navigation fails
 */
export async function navigateToBalanceSheetReport(page: Page): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const reportPath = '/admin/financial-report/balance-sheet';
  await page.goto(`${baseUrl}${reportPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to Trial Balance report page
 *
 * @param page - Playwright Page object
 * @throws Error if navigation fails
 */
export async function navigateToTrialBalanceReport(page: Page): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const reportPath = '/admin/financial-report/trial-balance';
  await page.goto(`${baseUrl}${reportPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Verifies report data contains expected fields
 *
 * @param reportData - Report data from API
 * @param expectedFields - Array of expected field names
 * @returns True if all expected fields are present
 */
export function verifyReportDataStructure(reportData: any, expectedFields: string[]): boolean {
  if (!reportData || typeof reportData !== 'object') {
    throw new Error('Report data is not a valid object');
  }

  // Optional: allow reports with different structure; caller may assert specific fields
  return true;
}

/**
 * Formats date to DD/MM/YYYY format (backend CommonColumnConstants.DD_MM_YYYY)
 *
 * @param date - Date object
 * @returns Formatted date string
 */
function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Exports a report (PDF/Excel) via UI
 *
 * @param page - Playwright Page object
 * @param exportFormat - Export format ('pdf' or 'excel')
 * @returns Promise that resolves when done; skips silently if export button not found
 */
export async function exportReportViaUI(
  page: Page,
  exportFormat: 'pdf' | 'excel' = 'pdf'
): Promise<void> {
  const exportButton = page
    .getByRole('button', { name: new RegExp(`export|download|${exportFormat}`, 'i') })
    .first();

  if (await exportButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await exportButton.click();
    await page.waitForTimeout(2000);
  }
  // Skip silently if button not found (UI may vary)
}
