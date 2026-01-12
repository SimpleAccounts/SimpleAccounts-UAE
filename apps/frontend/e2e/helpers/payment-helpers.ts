import { Page, expect, APIRequestContext } from '@playwright/test';
import { getApiBaseUrl, getFrontendBaseUrl } from './test-setup-helpers';

/**
 * Generates a unique payment reference number using the pattern: PAY-${Date.now()}
 *
 * @returns A unique payment reference number
 *
 * @example
 * ```typescript
 * const paymentNumber = generatePaymentNumber();
 * // Returns: PAY-1234567890
 * ```
 */
export function generatePaymentNumber(): string {
  return `PAY-${Date.now()}`;
}

/**
 * Payment data structure for creation
 */
export interface PaymentData {
  paymentNo?: string;
  paymentDate?: string; // Format: DD-MM-YYYY
  contactId: number; // Supplier contact ID
  amount: number; // Payment amount
  payMode?: string; // Payment mode: 'CASH', 'BANK', 'CHEQUE' (default: 'BANK')
  depositeTo?: number; // Bank account transaction category ID
  notes?: string;
  referenceNo?: string;
  invoiceMappings?: InvoicePaymentMapping[]; // For linking payment to invoices
}

/**
 * Invoice payment mapping for partial/full payments
 */
export interface InvoicePaymentMapping {
  invoiceId: number;
  amount: number; // Amount applied to this invoice
}

/**
 * Creates a payment via API
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param paymentData - Payment data
 * @returns Created payment data including paymentId
 *
 * @example
 * ```typescript
 * const payment = await createPaymentViaAPI(request, token, {
 *   contactId: 1,
 *   amount: 1000,
 *   invoiceMappings: [{
 *     invoiceId: 1,
 *     amount: 1000
 *   }]
 * });
 * ```
 */
export async function createPaymentViaAPI(
  request: APIRequestContext,
  authToken: string,
  paymentData: PaymentData
): Promise<PaymentData & { paymentId: number }> {
  const apiUrl = getApiBaseUrl();
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

  const payload: any = {
    paymentNo: paymentData.paymentNo || generatePaymentNumber(),
    paymentDate: paymentData.paymentDate || formattedDate,
    contactId: paymentData.contactId,
    amount: paymentData.amount,
    payMode: paymentData.payMode || 'BANK',
    depositeTo: paymentData.depositeTo || '',
    notes: paymentData.notes || '',
    referenceNo: paymentData.referenceNo || '',
  };

  // Add invoice mappings if provided
  if (paymentData.invoiceMappings && paymentData.invoiceMappings.length > 0) {
    payload.paidInvoiceListStr = JSON.stringify(
      paymentData.invoiceMappings.map(mapping => ({
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

  const response = await request.post(`${apiUrl}/rest/payment/save`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: formData.toString(),
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to create payment: ${response.status()} ${errorText}`);
  }

  const responseData = await response.json();
  // The API might return paymentId in the response or we need to get it from list
  return {
    ...paymentData,
    paymentId: responseData.paymentId || responseData.id || 0,
  };
}

/**
 * Creates a payment from a supplier invoice
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param invoiceId - Supplier invoice ID to create payment for
 * @param amount - Payment amount (defaults to full invoice amount)
 * @param options - Optional payment configuration
 * @returns Created payment data
 *
 * @example
 * ```typescript
 * const payment = await createPaymentFromInvoice(request, token, 1, 1000);
 * ```
 */
export async function createPaymentFromInvoice(
  request: APIRequestContext,
  authToken: string,
  invoiceId: number,
  amount?: number,
  options: {
    payMode?: string;
    depositeTo?: number;
    contactId?: number;
  } = {}
): Promise<PaymentData & { paymentId: number }> {
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

  const paymentData: PaymentData = {
    contactId: options.contactId || invoice.contactId || invoice.contact?.contactId,
    amount: paymentAmount,
    payMode: options.payMode || 'BANK',
    depositeTo: options.depositeTo,
    invoiceMappings: [
      {
        invoiceId: invoiceId,
        amount: paymentAmount,
      },
    ],
  };

  return createPaymentViaAPI(request, authToken, paymentData);
}

/**
 * Gets payment details by ID
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param paymentId - Payment ID
 * @returns Payment details
 *
 * @example
 * ```typescript
 * const payment = await getPaymentDetails(request, token, 1);
 * ```
 */
export async function getPaymentDetails(
  request: APIRequestContext,
  authToken: string,
  paymentId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const response = await request.get(
    `${apiUrl}/rest/payment/getpaymentbyid?paymentId=${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get payment details: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Gets payment list
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param options - Optional filters
 * @returns Payment list response
 *
 * @example
 * ```typescript
 * const payments = await getPaymentList(request, token, {
 *   contactId: 1,
 *   pageNo: 1
 * });
 * ```
 */
export async function getPaymentList(
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
  let url = `${apiUrl}/rest/payment/getlist?`;

  if (options.contactId) {
    url += `supplierId=${options.contactId}&`;
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
    throw new Error(`Failed to get payment list: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Navigates to payment creation page
 *
 * @param page - Playwright Page object
 * @param invoiceId - Optional invoice ID to pre-populate
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToCreatePayment(page, 1);
 * ```
 */
export async function navigateToCreatePayment(page: Page, invoiceId?: number): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const createPath = invoiceId
    ? `/admin/expense/supplier-invoice/${invoiceId}/record-payment`
    : '/admin/expense/payment/create';
  await page.goto(`${baseUrl}${createPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to payment list page
 *
 * @param page - Playwright Page object
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToPaymentList(page);
 * ```
 */
export async function navigateToPaymentList(page: Page): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const listPath = '/admin/expense/payment';
  await page.goto(`${baseUrl}${listPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to payment detail page
 *
 * @param page - Playwright Page object
 * @param paymentId - Payment ID
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToPaymentDetail(page, 1);
 * ```
 */
export async function navigateToPaymentDetail(page: Page, paymentId: number): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const detailPath = `/admin/expense/payment/${paymentId}`;
  await page.goto(`${baseUrl}${detailPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}
