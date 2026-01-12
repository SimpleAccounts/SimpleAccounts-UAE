import { Page, expect, APIRequestContext } from '@playwright/test';
import { getApiBaseUrl, getFrontendBaseUrl } from './test-setup-helpers';

/**
 * Generates a unique debit note reference number using the pattern: DN-${Date.now()}
 *
 * @returns A unique debit note reference number
 *
 * @example
 * ```typescript
 * const debitNoteNumber = generateDebitNoteNumber();
 * // Returns: DN-1234567890
 * ```
 */
export function generateDebitNoteNumber(): string {
  return `DN-${Date.now()}`;
}

/**
 * Debit note data structure for creation
 * Note: Debit notes use the same API as credit notes but with type=13 (debit note)
 */
export interface DebitNoteData {
  debitNoteNumber?: string;
  debitNoteDate?: string; // Format: DD-MM-YYYY
  invoiceId: number; // Supplier invoice ID to create debit note from
  contactId: number; // Supplier contact ID
  currencyCode?: number; // Currency code (default: 150 for AED)
  taxType?: number; // Tax type: 1 = Exclusive, 2 = Inclusive (default: 1)
  lineItems: DebitNoteLineItem[];
  notes?: string;
  placeOfSupplyId?: number;
  discount?: number;
  isCreatedWithoutInvoice?: boolean; // If true, debit note is created without invoice link
}

/**
 * Debit note line item data structure
 */
export interface DebitNoteLineItem {
  productId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  vatId?: number; // VAT code ID
  discount?: number;
  subTotal?: number; // Auto-calculated if not provided
}

/**
 * Creates a debit note via API
 * Note: Debit notes use /rest/creditNote/save with type=13
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param debitNoteData - Debit note data
 * @returns Created debit note data including debitNoteId
 *
 * @example
 * ```typescript
 * const debitNote = await createDebitNoteViaAPI(request, token, {
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
export async function createDebitNoteViaAPI(
  request: APIRequestContext,
  authToken: string,
  debitNoteData: DebitNoteData
): Promise<DebitNoteData & { debitNoteId: number }> {
  const apiUrl = getApiBaseUrl();
  const today = new Date();
  // Use YYYY-MM-DD format (ISO format) which Spring Boot can parse correctly
  const formattedDate =
    debitNoteData.debitNoteDate ||
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const payload = {
    creditNoteNumber: debitNoteData.debitNoteNumber || generateDebitNoteNumber(),
    creditNoteDate: formattedDate,
    invoiceId: debitNoteData.invoiceId,
    contactId: debitNoteData.contactId,
    type: '13', // Type 13 = Debit Note (Supplier)
    currencyCode: debitNoteData.currencyCode || 150, // AED default
    taxType: debitNoteData.taxType || 1, // Exclusive VAT default
    notes: debitNoteData.notes || '',
    placeOfSupplyId: debitNoteData.placeOfSupplyId || '',
    discount: debitNoteData.discount || 0,
    isCreatedWithoutInvoice: debitNoteData.isCreatedWithoutInvoice || false,
    // Line items need to be formatted for the API
    lineItems: JSON.stringify(
      debitNoteData.lineItems.map(item => ({
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
    throw new Error(`Failed to create debit note: ${response.status()} ${errorText}`);
  }

  const responseData = await response.json();

  // The API returns a message, so we need to get the debit note ID from the list
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit for DB to sync

  try {
    const debitNoteResponse = await request.get(
      `${apiUrl}/rest/creditNote/getList?type=13&paginationDisable=true&referenceNumber=${payload.creditNoteNumber}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (debitNoteResponse.ok()) {
      const debitNoteResponseData = await debitNoteResponse.json();
      // The response might be a list or a single object
      const debitNote = Array.isArray(debitNoteResponseData.data)
        ? debitNoteResponseData.data.find(
            (dn: any) =>
              dn.creditNoteNumber === payload.creditNoteNumber ||
              dn.debitNoteNumber === payload.creditNoteNumber
          )
        : debitNoteResponseData;

      if (debitNote) {
        return {
          ...debitNoteData,
          debitNoteId: debitNote.id || debitNote.creditNoteId || debitNote.debitNoteId || 0,
        };
      }
    }
  } catch (error) {
    // If we can't find it, continue with fallback
    console.warn('Could not retrieve debit note ID:', error);
  }

  // Fallback: return with 0 ID if we can't find it
  return {
    ...debitNoteData,
    debitNoteId: responseData.id || responseData.debitNoteId || responseData.creditNoteId || 0,
  };
}

/**
 * Gets debit note details by ID
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param debitNoteId - Debit note ID
 * @returns Debit note details
 *
 * @example
 * ```typescript
 * const debitNote = await getDebitNoteDetails(request, token, 1);
 * ```
 */
export async function getDebitNoteDetails(
  request: APIRequestContext,
  authToken: string,
  debitNoteId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  // Note: The API might not have a direct getDebitNoteById endpoint
  // This uses the credit note endpoint with type=13
  const response = await request.get(
    `${apiUrl}/rest/creditNote/getList?type=13&creditNoteId=${debitNoteId}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get debit note details: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Gets debit note by supplier invoice ID
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param invoiceId - Supplier invoice ID
 * @returns Debit note details
 *
 * @example
 * ```typescript
 * const debitNote = await getDebitNoteByInvoiceId(request, token, 1);
 * ```
 */
export async function getDebitNoteByInvoiceId(
  request: APIRequestContext,
  authToken: string,
  invoiceId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  // Note: This might use the same endpoint as credit notes
  const response = await request.get(
    `${apiUrl}/rest/creditNote/getCreditNoteByInvoiceId?id=${invoiceId}&type=13`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get debit note by invoice ID: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Gets debit note list
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param options - Optional filters
 * @returns Debit note list response
 *
 * @example
 * ```typescript
 * const debitNotes = await getDebitNoteList(request, token, {
 *   contactId: 1,
 *   pageNo: 1
 * });
 * ```
 */
export async function getDebitNoteList(
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
  let url = `${apiUrl}/rest/creditNote/getList?type=13&`; // Type 13 = Debit Note

  if (options.contactId) {
    url += `contact=${options.contactId}&`;
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
    throw new Error(`Failed to get debit note list: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Posts a debit note (marks it as posted/sent)
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param debitNoteId - Debit note ID to post
 * @returns Posting response
 *
 * @example
 * ```typescript
 * await postDebitNote(request, token, debitNoteId);
 * ```
 */
export async function postDebitNote(
  request: APIRequestContext,
  authToken: string,
  debitNoteId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();

  const payload = {
    postingRefId: debitNoteId,
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
    throw new Error(`Failed to post debit note: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Applies a debit note to a supplier invoice
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param debitNoteId - Debit note ID
 * @param invoiceId - Supplier invoice ID to apply debit note to
 * @param amount - Amount to apply (optional, defaults to full debit note amount)
 * @returns Application response
 *
 * @example
 * ```typescript
 * await applyDebitNoteToInvoice(request, token, debitNoteId, invoiceId, 1000);
 * ```
 */
export async function applyDebitNoteToInvoice(
  request: APIRequestContext,
  authToken: string,
  debitNoteId: number,
  invoiceId: number,
  amount?: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();

  const payload = {
    creditNoteId: debitNoteId, // Uses credit note ID field
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
    throw new Error(`Failed to apply debit note to invoice: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Processes a supplier refund for a debit note
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param debitNoteId - Debit note ID
 * @param refundData - Refund data
 * @returns Refund response
 *
 * @example
 * ```typescript
 * await processDebitNoteRefund(request, token, debitNoteId, {
 *   amount: 1000,
 *   bankAccountId: 1
 * });
 * ```
 */
export async function processDebitNoteRefund(
  request: APIRequestContext,
  authToken: string,
  debitNoteId: number,
  refundData: {
    amount: number;
    bankAccountId?: number;
    payMode?: string;
    notes?: string;
  }
): Promise<any> {
  const apiUrl = getApiBaseUrl();

  const payload = {
    creditNoteId: debitNoteId, // Uses credit note ID field
    amount: refundData.amount,
    depositeToTransactionCategoryId: refundData.bankAccountId,
    payMode: refundData.payMode || 'BANK',
    notes: refundData.notes || '',
  };

  // Note: Supplier refund might use the same endpoint as credit note refund
  const response = await request.post(`${apiUrl}/rest/creditNote/refund`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to process debit note refund: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Navigates to debit note creation page
 *
 * @param page - Playwright Page object
 * @param invoiceId - Optional invoice ID to pre-populate
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToCreateDebitNote(page, 1);
 * ```
 */
export async function navigateToCreateDebitNote(page: Page, invoiceId?: number): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const createPath = invoiceId
    ? `/admin/expense/debit-notes/create?invoiceId=${invoiceId}`
    : '/admin/expense/debit-notes/create';
  await page.goto(`${baseUrl}${createPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to debit note list page
 *
 * @param page - Playwright Page object
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToDebitNoteList(page);
 * ```
 */
export async function navigateToDebitNoteList(page: Page): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const listPath = '/admin/expense/debit-notes';
  await page.goto(`${baseUrl}${listPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to debit note detail page
 *
 * @param page - Playwright Page object
 * @param debitNoteId - Debit note ID
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToDebitNoteDetail(page, 1);
 * ```
 */
export async function navigateToDebitNoteDetail(page: Page, debitNoteId: number): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const detailPath = `/admin/expense/debit-notes/${debitNoteId}`;
  await page.goto(`${baseUrl}${detailPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}
