import { Page, expect, APIRequestContext } from '@playwright/test';
import { getApiBaseUrl, getFrontendBaseUrl } from './test-setup-helpers';

/**
 * Generates a unique receipt number using the pattern: RCP-E2E-${Date.now()}
 *
 * @returns A unique receipt number
 *
 * @example
 * ```typescript
 * const receiptNumber = generateReceiptNumber();
 * // Returns: RCP-E2E-1234567890
 * ```
 */
export function generateReceiptNumber(): string {
  return `RCP-E2E-${Date.now()}`;
}

/**
 * Receipt data structure for creation
 */
export interface ReceiptData {
  receiptNo?: string;
  receiptDate?: string; // Format: DD-MM-YYYY
  contactId: number; // Customer contact ID
  invoiceId?: number; // Invoice ID to link receipt to
  amount: number; // Payment amount
  payMode?: string; // Payment mode: 'CASH', 'BANK', 'CHEQUE' (default: 'BANK')
  depositeToTransactionCategoryId?: number; // Bank account transaction category ID
  referenceCode?: string;
  notes?: string;
  invoiceReceiptMappings?: InvoiceReceiptMapping[]; // For partial payments
}

/**
 * Invoice receipt mapping for partial payments
 */
export interface InvoiceReceiptMapping {
  invoiceId: number;
  amount: number; // Amount applied to this invoice
}

/**
 * Creates a receipt via API
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param receiptData - Receipt data
 * @returns Created receipt data including receiptId
 *
 * @example
 * ```typescript
 * const receipt = await createReceiptViaAPI(request, token, {
 *   contactId: 1,
 *   invoiceId: 1,
 *   amount: 1000
 * });
 * ```
 */
export async function createReceiptViaAPI(
  request: APIRequestContext,
  authToken: string,
  receiptData: ReceiptData
): Promise<ReceiptData & { receiptId: number }> {
  const apiUrl = getApiBaseUrl();
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

  const payload: any = {
    receiptNo: receiptData.receiptNo || generateReceiptNumber(),
    receiptDate: receiptData.receiptDate || formattedDate,
    contactId: receiptData.contactId,
    amount: receiptData.amount,
    payMode: receiptData.payMode || 'BANK',
    referenceCode: receiptData.referenceCode || '',
    notes: receiptData.notes || '',
  };

  // Add invoice ID if provided
  if (receiptData.invoiceId) {
    payload.invoiceId = receiptData.invoiceId;
  }

  // Add bank account transaction category if provided
  if (receiptData.depositeToTransactionCategoryId) {
    payload.depositeToTransactionCategoryId = receiptData.depositeToTransactionCategoryId;
  }

  // Add invoice receipt mappings for partial payments
  if (receiptData.invoiceReceiptMappings && receiptData.invoiceReceiptMappings.length > 0) {
    payload.invoiceReceiptMappings = JSON.stringify(
      receiptData.invoiceReceiptMappings.map(mapping => ({
        invoiceId: mapping.invoiceId,
        amount: mapping.amount,
      }))
    );
  }

  const formData = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, String(value));
    }
  });

  const response = await request.post(`${apiUrl}/rest/receipt/save`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: formData.toString(),
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to create receipt: ${response.status()} ${errorText}`);
  }

  const responseData = await response.json();
  return {
    ...receiptData,
    receiptId: responseData.receiptId || responseData.id,
  };
}

/**
 * Creates a receipt from an invoice (records payment for an invoice)
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param invoiceId - Invoice ID to create receipt for
 * @param amount - Payment amount (defaults to full invoice amount)
 * @param options - Optional receipt configuration
 * @returns Created receipt data
 *
 * @example
 * ```typescript
 * const receipt = await createReceiptFromInvoice(request, token, 1, 1000);
 * ```
 */
export async function createReceiptFromInvoice(
  request: APIRequestContext,
  authToken: string,
  invoiceId: number,
  amount?: number,
  options: {
    payMode?: string;
    depositeToTransactionCategoryId?: number;
    contactId?: number;
  } = {}
): Promise<ReceiptData & { receiptId: number }> {
  // Get invoice details to get contact ID and amount if not provided
  const invoiceResponse = await request.get(
    `${getApiBaseUrl()}/rest/invoice/getInvoiceById?id=${invoiceId}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  if (!invoiceResponse.ok()) {
    throw new Error(`Failed to get invoice details: ${invoiceResponse.status()}`);
  }

  const invoice = await invoiceResponse.json();
  const paymentAmount = amount || parseFloat(invoice.totalAmount || invoice.amount || '0');

  const receiptData: ReceiptData = {
    contactId: options.contactId || invoice.contactId || invoice.contact?.contactId,
    invoiceId: invoiceId,
    amount: paymentAmount,
    payMode: options.payMode || 'BANK',
    depositeToTransactionCategoryId: options.depositeToTransactionCategoryId,
    invoiceReceiptMappings: [
      {
        invoiceId: invoiceId,
        amount: paymentAmount,
      },
    ],
  };

  return createReceiptViaAPI(request, authToken, receiptData);
}

/**
 * Gets receipt details by ID
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param receiptId - Receipt ID
 * @returns Receipt details
 *
 * @example
 * ```typescript
 * const receipt = await getReceiptDetails(request, token, 1);
 * ```
 */
export async function getReceiptDetails(
  request: APIRequestContext,
  authToken: string,
  receiptId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const response = await request.get(`${apiUrl}/rest/receipt/getReceiptById?id=${receiptId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get receipt details: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Gets receipt list
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param options - Optional filters
 * @returns Receipt list response
 *
 * @example
 * ```typescript
 * const receipts = await getReceiptList(request, token, {
 *   contactId: 1,
 *   pageNo: 1
 * });
 * ```
 */
export async function getReceiptList(
  request: APIRequestContext,
  authToken: string,
  options: {
    contactId?: number;
    invoiceId?: number;
    pageNo?: number;
    pageSize?: number;
    paginationDisable?: boolean;
  } = {}
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  let url = `${apiUrl}/rest/receipt/list?`;

  if (options.contactId) {
    url += `contactId=${options.contactId}&`;
  }
  if (options.invoiceId) {
    url += `invoiceId=${options.invoiceId}&`;
  }
  if (options.pageNo) {
    url += `pageNo=${options.pageNo}&`;
  }
  if (options.pageSize) {
    url += `pageSize=${options.pageSize}&`;
  }
  if (options.paginationDisable) {
    url += `paginationDisable=${options.paginationDisable}&`;
  }

  // Remove trailing &
  url = url.replace(/&$/, '');

  const response = await request.get(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get receipt list: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Navigates to receipt creation page
 *
 * @param page - Playwright Page object
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToCreateReceipt(page);
 * ```
 */
export async function navigateToCreateReceipt(page: Page): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const createPath = '/admin/income/receipt/create';
  await page.goto(`${baseUrl}${createPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to record payment page for an invoice
 *
 * @param page - Playwright Page object
 * @param invoiceId - Invoice ID
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToRecordPayment(page, 1);
 * ```
 */
export async function navigateToRecordPayment(page: Page, invoiceId: number): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const recordPaymentPath = `/admin/income/customer-invoice/${invoiceId}/record-payment`;
  await page.goto(`${baseUrl}${recordPaymentPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to receipt list page
 *
 * @param page - Playwright Page object
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToReceiptList(page);
 * ```
 */
export async function navigateToReceiptList(page: Page): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const listPath = '/admin/income/receipt';
  await page.goto(`${baseUrl}${listPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Creates a receipt via UI (fallback method)
 *
 * @param page - Playwright Page object
 * @param receiptData - Receipt data
 * @throws Error if creation fails
 *
 * @example
 * ```typescript
 * await createReceiptViaUI(page, {
 *   contactId: 1,
 *   invoiceId: 1,
 *   amount: 1000
 * });
 * ```
 */
export async function createReceiptViaUI(page: Page, receiptData: ReceiptData): Promise<void> {
  await navigateToCreateReceipt(page);

  // Fill in receipt number if field exists
  if (receiptData.receiptNo) {
    const receiptNoInput = page.locator('input[name*="receiptNo"], input[name*="number"]').first();
    if (await receiptNoInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await receiptNoInput.fill(receiptData.receiptNo);
    }
  }

  // Select customer/contact
  const contactSelect = page.locator('select[name*="contact"], select[name*="customer"]').first();
  if (await contactSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
    await contactSelect.selectOption(String(receiptData.contactId));
  }

  // Select invoice if provided
  if (receiptData.invoiceId) {
    const invoiceSelect = page.locator('select[name*="invoice"]').first();
    if (await invoiceSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      await invoiceSelect.selectOption(String(receiptData.invoiceId));
    }
  }

  // Fill in amount
  const amountInput = page.locator('input[name*="amount"]').first();
  if (await amountInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await amountInput.fill(String(receiptData.amount));
  }

  // Select payment mode
  if (receiptData.payMode) {
    const payModeSelect = page
      .locator('select[name*="payMode"], select[name*="paymentMode"]')
      .first();
    if (await payModeSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      await payModeSelect.selectOption(receiptData.payMode);
    }
  }

  // Submit the form
  const submitButton = page.getByRole('button', { name: /save|submit|create|record/i });
  if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await submitButton.click();
    await page.waitForTimeout(2000);
  }
}
