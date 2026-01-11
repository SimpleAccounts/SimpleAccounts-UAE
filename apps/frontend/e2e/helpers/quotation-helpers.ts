import { Page, expect, APIRequestContext } from '@playwright/test';
import { getApiBaseUrl, getFrontendBaseUrl } from './test-setup-helpers';

/**
 * Generates a unique quotation reference number using the pattern: QTN-${Date.now()}
 *
 * @returns A unique quotation reference number
 *
 * @example
 * ```typescript
 * const quotationNumber = generateQuotationNumber();
 * // Returns: QTN-1234567890
 * ```
 */
export function generateQuotationNumber(): string {
  return `QTN-${Date.now()}`;
}

/**
 * Quotation data structure for creation
 */
export interface QuotationData {
  quotationNumber?: string;
  quotationDate?: string; // Format: DD-MM-YYYY
  quotationExpiration?: string; // Format: DD-MM-YYYY
  contactId: number; // Customer contact ID
  currencyCode?: number; // Currency code (default: 150 for AED)
  taxType?: number; // Tax type: 1 = Exclusive, 2 = Inclusive (default: 1)
  lineItems: QuotationLineItem[];
  notes?: string;
  placeOfSupplyId?: number;
  discount?: number;
}

/**
 * Quotation line item data structure
 */
export interface QuotationLineItem {
  productId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  vatId?: number; // VAT code ID
  discount?: number;
  subTotal?: number; // Auto-calculated if not provided
}

/**
 * Creates a quotation via API
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param quotationData - Quotation data
 * @returns Created quotation data including quotationId
 *
 * @example
 * ```typescript
 * const quotation = await createQuotationViaAPI(request, token, {
 *   contactId: 1,
 *   lineItems: [{
 *     description: 'Test Product',
 *     quantity: 1,
 *     unitPrice: 1000
 *   }]
 * });
 * ```
 */
export async function createQuotationViaAPI(
  request: APIRequestContext,
  authToken: string,
  quotationData: QuotationData
): Promise<QuotationData & { quotationId: number }> {
  const apiUrl = getApiBaseUrl();
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
  const expirationDate = new Date(today);
  expirationDate.setDate(expirationDate.getDate() + 30);
  const formattedExpirationDate = `${String(expirationDate.getDate()).padStart(2, '0')}-${String(expirationDate.getMonth() + 1).padStart(2, '0')}-${expirationDate.getFullYear()}`;

  const payload = {
    type: '6', // Type 6 = Quotation for customer
    quotationNumber: quotationData.quotationNumber || generateQuotationNumber(),
    quotationdate: quotationData.quotationDate || formattedDate,
    quotaionExpiration: quotationData.quotationExpiration || formattedExpirationDate,
    customerId: quotationData.contactId,
    currencyCode: quotationData.currencyCode || 150, // AED default
    taxType: quotationData.taxType || 1, // Exclusive VAT default
    notes: quotationData.notes || '',
    placeOfSupplyId: quotationData.placeOfSupplyId || '',
    discount: quotationData.discount || 0,
    // Line items need to be formatted for the API
    lineItems: JSON.stringify(
      quotationData.lineItems.map(item => ({
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

  const response = await request.post(`${apiUrl}/rest/poquatation/saveQuatation`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: formData.toString(),
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to create quotation: ${response.status()} ${errorText}`);
  }

  const responseData = await response.json();
  // The API returns a message, so we need to get the quotation ID from the list
  // For now, we'll return the quotation data with a placeholder ID
  // In a real scenario, you might need to fetch the quotation by number
  return {
    ...quotationData,
    quotationId: responseData.id || responseData.quotationId || 0,
  };
}

/**
 * Gets quotation details by ID
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param quotationId - Quotation ID
 * @returns Quotation details
 *
 * @example
 * ```typescript
 * const quotation = await getQuotationDetails(request, token, 1);
 * ```
 */
export async function getQuotationDetails(
  request: APIRequestContext,
  authToken: string,
  quotationId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const response = await request.get(
    `${apiUrl}/rest/poquatation/getQuotationById?id=${quotationId}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get quotation details: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Gets quotation list
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param options - Optional filters
 * @returns Quotation list response
 *
 * @example
 * ```typescript
 * const quotations = await getQuotationList(request, token, {
 *   contactId: 1,
 *   pageNo: 1
 * });
 * ```
 */
export async function getQuotationList(
  request: APIRequestContext,
  authToken: string,
  options: {
    contactId?: number;
    status?: number;
    pageNo?: number;
    pageSize?: number;
    paginationDisable?: boolean;
  } = {}
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  let url = `${apiUrl}/rest/poquatation/getListForQuatation?type=6&`; // Type 6 = Quotation

  if (options.contactId) {
    url += `supplierId=${options.contactId}&`;
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
    throw new Error(`Failed to get quotation list: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Sends/posts a quotation (marks it as sent)
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param quotationId - Quotation ID to send
 * @returns Sending response
 *
 * @example
 * ```typescript
 * await sendQuotation(request, token, quotationId);
 * ```
 */
export async function sendQuotation(
  request: APIRequestContext,
  authToken: string,
  quotationId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();

  const payload = {
    id: quotationId,
  };

  const response = await request.post(`${apiUrl}/rest/poquatation/sendQuotation`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to send quotation: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Navigates to quotation creation page
 *
 * @param page - Playwright Page object
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToCreateQuotation(page);
 * ```
 */
export async function navigateToCreateQuotation(page: Page): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const createPath = '/admin/income/quotation/create';
  await page.goto(`${baseUrl}${createPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to quotation list page
 *
 * @param page - Playwright Page object
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToQuotationList(page);
 * ```
 */
export async function navigateToQuotationList(page: Page): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const listPath = '/admin/income/quotation';
  await page.goto(`${baseUrl}${listPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to quotation detail page
 *
 * @param page - Playwright Page object
 * @param quotationId - Quotation ID
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToQuotationDetail(page, 1);
 * ```
 */
export async function navigateToQuotationDetail(page: Page, quotationId: number): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const detailPath = `/admin/income/quotation/${quotationId}`;
  await page.goto(`${baseUrl}${detailPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}
