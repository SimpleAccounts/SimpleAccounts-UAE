import { Page, expect, APIRequestContext } from '@playwright/test';
import { getApiBaseUrl, getFrontendBaseUrl } from './test-setup-helpers';

/**
 * Generates a unique credit note reference number using the pattern: CN-${Date.now()}
 *
 * @returns A unique credit note reference number
 *
 * @example
 * ```typescript
 * const creditNoteNumber = generateCreditNoteNumber();
 * // Returns: CN-1234567890
 * ```
 */
export function generateCreditNoteNumber(): string {
  return `CN-${Date.now()}`;
}

/**
 * Credit note data structure for creation
 */
export interface CreditNoteData {
  creditNoteNumber?: string;
  creditNoteDate?: string; // Format: DD-MM-YYYY
  invoiceId: number; // Invoice ID to create credit note from
  contactId: number; // Customer contact ID
  currencyCode?: number; // Currency code (default: 150 for AED)
  taxType?: number; // Tax type: 1 = Exclusive, 2 = Inclusive (default: 1)
  lineItems: CreditNoteLineItem[];
  notes?: string;
  placeOfSupplyId?: number;
  discount?: number;
  isCreatedWithoutInvoice?: boolean; // If true, credit note is created without invoice link
  cnCreatedOnPaidInvoice?: boolean; // If true, credit note is created on paid invoice
}

/**
 * Credit note line item data structure
 */
export interface CreditNoteLineItem {
  productId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  vatId?: number; // VAT code ID
  discount?: number;
  subTotal?: number; // Auto-calculated if not provided
}

/**
 * Creates a credit note via API
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param creditNoteData - Credit note data
 * @returns Created credit note data including creditNoteId
 *
 * @example
 * ```typescript
 * const creditNote = await createCreditNoteViaAPI(request, token, {
 *   invoiceId: 1,
 *   contactId: 1,
 *   lineItems: [{
 *     description: 'Test Product',
 *     quantity: 1,
 *     unitPrice: 1000
 *   }]
 * });
 * ```
 */
export async function createCreditNoteViaAPI(
  request: APIRequestContext,
  authToken: string,
  creditNoteData: CreditNoteData
): Promise<CreditNoteData & { creditNoteId: number }> {
  const apiUrl = getApiBaseUrl();
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

  const payload = {
    creditNoteNumber: creditNoteData.creditNoteNumber || generateCreditNoteNumber(),
    creditNoteDate: creditNoteData.creditNoteDate || formattedDate,
    invoiceId: creditNoteData.invoiceId,
    contactId: creditNoteData.contactId,
    currencyCode: creditNoteData.currencyCode || 150, // AED default
    taxType: creditNoteData.taxType || 1, // Exclusive VAT default
    notes: creditNoteData.notes || '',
    placeOfSupplyId: creditNoteData.placeOfSupplyId || '',
    discount: creditNoteData.discount || 0,
    isCreatedWithoutInvoice: creditNoteData.isCreatedWithoutInvoice || false,
    cnCreatedOnPaidInvoice: creditNoteData.cnCreatedOnPaidInvoice || false,
    // Line items need to be formatted for the API
    lineItems: JSON.stringify(
      creditNoteData.lineItems.map(item => ({
        productId: item.productId || '',
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatId: item.vatId || '',
        discount: item.discount || 0,
        subTotal: item.subTotal || item.quantity * item.unitPrice,
      }))
    ),
  };

  const formData = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, String(value));
    }
  });

  const response = await request.post(`${apiUrl}/rest/creditNote/save`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: formData.toString(),
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to create credit note: ${response.status()} ${errorText}`);
  }

  const responseData = await response.json();

  // The API returns a message, so we need to get the credit note ID from the list
  // Fetch the credit note by invoice ID to get the credit note ID
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit for DB to sync

  try {
    const creditNoteResponse = await request.get(
      `${apiUrl}/rest/creditNote/getCreditNoteByInvoiceId?id=${creditNoteData.invoiceId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (creditNoteResponse.ok()) {
      const creditNoteData = await creditNoteResponse.json();
      // The response might be a list or a single object
      const creditNote = Array.isArray(creditNoteData)
        ? creditNoteData.find(
            (cn: any) => cn.creditNoteNumber === payload.creditNoteNumber || cn.creditNoteNumber
          )
        : creditNoteData;

      if (creditNote) {
        return {
          ...creditNoteData,
          creditNoteId: creditNote.id || creditNote.creditNoteId || 0,
        };
      }
    }
  } catch (error) {
    // If we can't find it, continue with fallback
    console.warn('Could not retrieve credit note ID:', error);
  }

  // Fallback: return with 0 ID if we can't find it
  return {
    ...creditNoteData,
    creditNoteId: responseData.id || responseData.creditNoteId || 0,
  };
}

/**
 * Gets credit note details by ID
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param creditNoteId - Credit note ID
 * @returns Credit note details
 *
 * @example
 * ```typescript
 * const creditNote = await getCreditNoteDetails(request, token, 1);
 * ```
 */
export async function getCreditNoteDetails(
  request: APIRequestContext,
  authToken: string,
  creditNoteId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  // Note: The API might not have a direct getCreditNoteById endpoint
  // This is a placeholder - adjust based on actual API
  const response = await request.get(
    `${apiUrl}/rest/creditNote/getList?creditNoteId=${creditNoteId}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get credit note details: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Gets credit note by invoice ID
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param invoiceId - Invoice ID
 * @returns Credit note details
 *
 * @example
 * ```typescript
 * const creditNote = await getCreditNoteByInvoiceId(request, token, 1);
 * ```
 */
export async function getCreditNoteByInvoiceId(
  request: APIRequestContext,
  authToken: string,
  invoiceId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const response = await request.get(
    `${apiUrl}/rest/creditNote/getCreditNoteByInvoiceId?id=${invoiceId}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get credit note by invoice ID: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Gets credit note list
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param options - Optional filters
 * @returns Credit note list response
 *
 * @example
 * ```typescript
 * const creditNotes = await getCreditNoteList(request, token, {
 *   contactId: 1,
 *   pageNo: 1
 * });
 * ```
 */
export async function getCreditNoteList(
  request: APIRequestContext,
  authToken: string,
  options: {
    contactId?: number;
    invoiceId?: number;
    status?: number;
    pageNo?: number;
    pageSize?: number;
    paginationDisable?: boolean;
  } = {}
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  let url = `${apiUrl}/rest/creditNote/getList?`;

  if (options.contactId) {
    url += `contactId=${options.contactId}&`;
  }
  if (options.invoiceId) {
    url += `invoiceId=${options.invoiceId}&`;
  }
  if (options.status) {
    url += `status=${options.status}&`;
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
    throw new Error(`Failed to get credit note list: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Posts a credit note (marks it as posted/sent)
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param creditNoteId - Credit note ID to post
 * @returns Posting response
 *
 * @example
 * ```typescript
 * await postCreditNote(request, token, creditNoteId);
 * ```
 */
export async function postCreditNote(
  request: APIRequestContext,
  authToken: string,
  creditNoteId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();

  const payload = {
    postingRefId: creditNoteId,
  };

  const response = await request.post(`${apiUrl}/rest/creditNote/creditNotePosting`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to post credit note: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Applies a credit note to an invoice
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param creditNoteId - Credit note ID
 * @param invoiceId - Invoice ID to apply credit note to
 * @param amount - Amount to apply (optional, defaults to full credit note amount)
 * @returns Application response
 *
 * @example
 * ```typescript
 * await applyCreditNoteToInvoice(request, token, creditNoteId, invoiceId, 1000);
 * ```
 */
export async function applyCreditNoteToInvoice(
  request: APIRequestContext,
  authToken: string,
  creditNoteId: number,
  invoiceId: number,
  amount?: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();

  const payload = {
    creditNoteId: creditNoteId,
    invoiceId: invoiceId,
    amount: amount,
  };

  const response = await request.post(`${apiUrl}/rest/creditNote/applyToInvoice`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to apply credit note to invoice: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Processes a refund for a credit note
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param creditNoteId - Credit note ID
 * @param refundData - Refund data
 * @returns Refund response
 *
 * @example
 * ```typescript
 * await processCreditNoteRefund(request, token, creditNoteId, {
 *   amount: 1000,
 *   bankAccountId: 1
 * });
 * ```
 */
export async function processCreditNoteRefund(
  request: APIRequestContext,
  authToken: string,
  creditNoteId: number,
  refundData: {
    amount: number;
    bankAccountId?: number;
    payMode?: string;
    notes?: string;
  }
): Promise<any> {
  const apiUrl = getApiBaseUrl();

  const payload = {
    creditNoteId: creditNoteId,
    amount: refundData.amount,
    depositeToTransactionCategoryId: refundData.bankAccountId,
    payMode: refundData.payMode || 'BANK',
    notes: refundData.notes || '',
  };

  const response = await request.post(`${apiUrl}/rest/creditNote/refund`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to process credit note refund: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Navigates to credit note creation page
 *
 * @param page - Playwright Page object
 * @param invoiceId - Optional invoice ID to pre-populate
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToCreateCreditNote(page, 1);
 * ```
 */
export async function navigateToCreateCreditNote(page: Page, invoiceId?: number): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const createPath = invoiceId
    ? `/admin/income/credit-note/create?invoiceId=${invoiceId}`
    : '/admin/income/credit-note/create';
  await page.goto(`${baseUrl}${createPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to credit note list page
 *
 * @param page - Playwright Page object
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToCreditNoteList(page);
 * ```
 */
export async function navigateToCreditNoteList(page: Page): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const listPath = '/admin/income/credit-note';
  await page.goto(`${baseUrl}${listPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to credit note detail page
 *
 * @param page - Playwright Page object
 * @param creditNoteId - Credit note ID
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToCreditNoteDetail(page, 1);
 * ```
 */
export async function navigateToCreditNoteDetail(page: Page, creditNoteId: number): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const detailPath = `/admin/income/credit-note/${creditNoteId}`;
  await page.goto(`${baseUrl}${detailPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}
