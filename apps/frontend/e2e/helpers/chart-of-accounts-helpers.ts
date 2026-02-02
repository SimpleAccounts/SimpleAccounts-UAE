import { APIRequestContext } from '@playwright/test';
import { getApiBaseUrl } from './test-setup-helpers';

/**
 * Chart of Account data structure
 */
export interface ChartOfAccountData {
  chartOfAccountId: number;
  chartOfAccountName: string;
  chartOfAccountCode: string;
  chartOfAccountCategoryCode?: string;
  debitCreditFlag?: string; // 'D' for Debit, 'C' for Credit
}

/**
 * Retrieves all available Chart of Accounts from the system
 * This verifies that COA structure exists
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @returns List of Chart of Accounts
 *
 * @example
 * ```typescript
 * const coaList = await getChartOfAccounts(request, token);
 * ```
 */
export async function getChartOfAccounts(
  request: APIRequestContext,
  authToken: string
): Promise<ChartOfAccountData[]> {
  const apiUrl = getApiBaseUrl();

  // Try the datalist endpoint for chart of accounts
  const response = await request.get(`${apiUrl}/rest/datalist/chartOfAccount`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get Chart of Accounts: ${response.status()} ${errorText}`);
  }

  const coaList = await response.json();
  return coaList as ChartOfAccountData[];
}

/**
 * Verifies that a specific Chart of Account exists
 *
 * @param request - Playwright APIRequestContext
 * @param authToken - Authentication token
 * @param chartOfAccountId - Chart of Account ID to verify
 * @returns True if Chart of Account exists, false otherwise
 *
 * @example
 * ```typescript
 * const exists = await verifyChartOfAccountExists(request, token, 1);
 * ```
 */
export async function verifyChartOfAccountExists(
  request: APIRequestContext,
  authToken: string,
  chartOfAccountId: number
): Promise<boolean> {
  try {
    const coaList = await getChartOfAccounts(request, authToken);
    return coaList.some(coa => coa.chartOfAccountId === chartOfAccountId);
  } catch (error) {
    console.warn('Failed to verify Chart of Account:', error);
    return false;
  }
}

/**
 * Gets a Chart of Account by ID
 *
 * @param request - Playwright APIRequestContext
 * @param authToken - Authentication token
 * @param chartOfAccountId - Chart of Account ID
 * @returns Chart of Account data or null if not found
 *
 * @example
 * ```typescript
 * const coa = await getChartOfAccountById(request, token, 1);
 * ```
 */
export async function getChartOfAccountById(
  request: APIRequestContext,
  authToken: string,
  chartOfAccountId: number
): Promise<ChartOfAccountData | null> {
  try {
    const coaList = await getChartOfAccounts(request, authToken);
    return coaList.find(coa => coa.chartOfAccountId === chartOfAccountId) || null;
  } catch (error) {
    console.warn('Failed to get Chart of Account:', error);
    return null;
  }
}

/**
 * Sets up and verifies Chart of Accounts structure exists
 * This function ensures COA structure is available before creating transactions
 *
 * @param request - Playwright APIRequestContext
 * @param authToken - Authentication token
 * @returns List of available Chart of Accounts
 * @throws Error if no Chart of Accounts are found
 *
 * @example
 * ```typescript
 * const coaList = await setupChartOfAccounts(request, token);
 * // Ensures COA structure is available for transaction creation
 * ```
 */
export async function setupChartOfAccounts(
  request: APIRequestContext,
  authToken: string
): Promise<ChartOfAccountData[]> {
  const coaList = await getChartOfAccounts(request, authToken);

  if (!coaList || coaList.length === 0) {
    throw new Error(
      'No Chart of Accounts found. Please ensure COA structure is configured in the system.'
    );
  }

  return coaList;
}
