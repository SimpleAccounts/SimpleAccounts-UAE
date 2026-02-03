import { Page, expect, APIRequestContext } from '@playwright/test';
import { getApiBaseUrl, getFrontendBaseUrl } from './test-setup-helpers';
import { loginTestUser } from './test-user-helpers';

/**
 * Reconciliation data structure
 */
export interface ReconciliationData {
  bankId: number;
  closingBalance: number;
  reconciliationDate: string; // Format: DD-MM-YYYY
  transactionIds?: number[]; // IDs of transactions to reconcile
  notes?: string;
}

/**
 * Creates a bank reconciliation via API
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param reconciliationData - Reconciliation data
 * @returns Created reconciliation response
 *
 * @example
 * ```typescript
 * const reconciliation = await createReconciliationViaAPI(request, token, {
 *   bankId: 1,
 *   closingBalance: 5000,
 *   reconciliationDate: '01-01-2024'
 * });
 * ```
 */
export async function createReconciliationViaAPI(
  request: APIRequestContext,
  authToken: string,
  reconciliationData: ReconciliationData
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

  const payload = {
    bankId: reconciliationData.bankId,
    closingBalance: reconciliationData.closingBalance,
    date: reconciliationData.reconciliationDate || formattedDate,
    transactionIds: reconciliationData.transactionIds || [],
    notes: reconciliationData.notes || '',
  };

  const formData = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, String(item));
        });
      } else {
        formData.append(key, String(value));
      }
    }
  });

  const response = await request.post(`${apiUrl}/rest/reconsile/reconcilenow`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: formData.toString(),
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to create reconciliation: ${response.status()} ${errorText}`);
  }

  return await response.text();
}

/**
 * Gets reconciliation list for a bank account
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param bankId - Bank account ID
 * @returns Reconciliation list response
 */
export async function getReconciliationList(
  request: APIRequestContext,
  authToken: string,
  bankId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const response = await request.get(`${apiUrl}/rest/reconsile/list?bankId=${bankId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get reconciliation list: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Gets transactions available for reconciliation
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param bankId - Bank account ID
 * @param categoryCode - Reconciliation category code (optional)
 * @returns Transaction list for reconciliation
 */
export async function getReconciliationTransactions(
  request: APIRequestContext,
  authToken: string,
  bankId: number,
  categoryCode?: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  let url = `${apiUrl}/rest/reconsile/getTransactionCat?bankId=${bankId}`;
  if (categoryCode) {
    url += `&categoryCode=${categoryCode}`;
  }

  const response = await request.get(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get reconciliation transactions: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Matches a transaction with an invoice for reconciliation
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param transactionId - Transaction ID
 * @param invoiceId - Invoice ID to match
 * @returns Match response
 */
export async function matchTransactionWithInvoice(
  request: APIRequestContext,
  authToken: string,
  transactionId: number,
  invoiceId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const response = await request.post(`${apiUrl}/rest/reconsile/matchTransactionWithInvoice`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    data: {
      transactionId,
      invoiceId,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to match transaction with invoice: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Matches a transaction with a receipt for reconciliation
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param transactionId - Transaction ID
 * @param receiptId - Receipt ID to match
 * @returns Match response
 */
export async function matchTransactionWithReceipt(
  request: APIRequestContext,
  authToken: string,
  transactionId: number,
  receiptId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const response = await request.post(`${apiUrl}/rest/reconsile/matchTransactionWithReceipt`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    data: {
      transactionId,
      receiptId,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to match transaction with receipt: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Navigates to bank reconciliation page
 *
 * @param page - Playwright Page object
 * @param bankId - Bank account ID
 * @throws Error if navigation fails
 */
export async function navigateToReconciliation(page: Page, bankId: number): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const reconcilePath = `/admin/banking/accounts/${bankId}/reconcile`;
  await page.goto(`${baseUrl}${reconcilePath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Creates a reconciliation via UI (fallback method)
 *
 * @param page - Playwright Page object
 * @param reconciliationData - Reconciliation data
 * @throws Error if creation fails
 */
export async function createReconciliationViaUI(
  page: Page,
  reconciliationData: ReconciliationData
): Promise<void> {
  await navigateToReconciliation(page, reconciliationData.bankId);

  // Fill in closing balance
  const closingBalanceInput = page
    .locator('input[name*="closingBalance"], input[id*="closingBalance"]')
    .first();
  if (await closingBalanceInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await closingBalanceInput.fill(String(reconciliationData.closingBalance));
  }

  // Fill in reconciliation date
  const dateInput = page
    .locator('input[name*="date"], input[id*="date"], input[type="date"]')
    .first();
  if (await dateInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await dateInput.fill(reconciliationData.reconciliationDate);
  }

  // Select transactions to reconcile if provided
  if (reconciliationData.transactionIds && reconciliationData.transactionIds.length > 0) {
    for (const transactionId of reconciliationData.transactionIds) {
      const transactionCheckbox = page
        .locator(`input[type="checkbox"][value="${transactionId}"]`)
        .first();
      if (await transactionCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
        await transactionCheckbox.check();
      }
    }
  }

  // Submit the form
  const submitButton = page.getByRole('button', { name: /reconcile|save|submit/i });
  if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await submitButton.click();
    await page.waitForTimeout(2000);
  }
}

/**
 * Verifies reconciliation status
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param bankId - Bank account ID
 * @param expectedStatus - Expected reconciliation status
 * @returns True if status matches
 */
export async function verifyReconciliationStatus(
  request: APIRequestContext,
  authToken: string,
  bankId: number,
  expectedStatus: string
): Promise<boolean> {
  const reconciliations = await getReconciliationList(request, authToken, bankId);
  const latestReconciliation = Array.isArray(reconciliations)
    ? reconciliations[0]
    : reconciliations.data?.[0];

  if (!latestReconciliation) {
    throw new Error('No reconciliation found');
  }

  const actualStatus = latestReconciliation.status || latestReconciliation.reconciliationStatus;
  if (actualStatus !== expectedStatus) {
    throw new Error(
      `Reconciliation status mismatch. Expected: ${expectedStatus}, Actual: ${actualStatus}`
    );
  }

  return true;
}
