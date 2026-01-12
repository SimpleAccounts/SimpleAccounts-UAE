import { Page, expect, APIRequestContext } from '@playwright/test';
import { getApiBaseUrl, getFrontendBaseUrl } from './test-setup-helpers';

/**
 * Generates a unique invoice reference number using the pattern: INV-E2E-${Date.now()}
 *
 * @returns A unique invoice reference number
 *
 * @example
 * ```typescript
 * const invoiceNumber = generateInvoiceNumber();
 * // Returns: INV-E2E-1234567890
 * ```
 */
export function generateInvoiceNumber(): string {
  return `INV-E2E-${Date.now()}`;
}

/**
 * Invoice data structure for creation
 */
export interface InvoiceData {
  referenceNumber?: string;
  invoiceDate?: string; // Format: DD-MM-YYYY
  dueDate?: string; // Format: DD-MM-YYYY
  contactId: number; // Customer contact ID
  currencyCode?: number; // Currency code (default: 150 for AED)
  type?: number; // Invoice type: 1 = Supplier, 2 = Customer (default: 2)
  taxType?: number; // Tax type: 1 = Exclusive, 2 = Inclusive (default: 1)
  lineItems: InvoiceLineItem[];
  notes?: string;
  placeOfSupplyId?: number;
}

/**
 * Invoice line item data structure
 */
export interface InvoiceLineItem {
  productId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  vatId?: number; // VAT code ID
  discount?: number;
  subTotal?: number; // Auto-calculated if not provided
}

/**
 * Creates an invoice via API
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param invoiceData - Invoice data
 * @returns Created invoice data including invoiceId
 *
 * @example
 * ```typescript
 * const invoice = await createInvoiceViaAPI(request, token, {
 *   contactId: 1,
 *   lineItems: [{
 *     description: 'Test Product',
 *     quantity: 1,
 *     unitPrice: 1000
 *   }]
 * });
 * ```
 */
export async function createInvoiceViaAPI(
  request: APIRequestContext,
  authToken: string,
  invoiceData: InvoiceData
): Promise<InvoiceData & { invoiceId: number }> {
  const apiUrl = getApiBaseUrl();
  const today = new Date();
  // Use dd/MM/yyyy format which matches backend CommonColumnConstants.DD_MM_YYYY
  // This is the format Spring Boot expects for form data Date fields
  const formattedDate =
    invoiceData.invoiceDate ||
    `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 30);
  const formattedDueDate =
    invoiceData.dueDate ||
    `${String(dueDate.getDate()).padStart(2, '0')}/${String(dueDate.getMonth() + 1).padStart(2, '0')}/${dueDate.getFullYear()}`;

  const payload = {
    referenceNumber: invoiceData.referenceNumber || generateInvoiceNumber(),
    invoiceDate: formattedDate,
    invoiceDueDate: formattedDueDate,
    contactId: invoiceData.contactId,
    currencyCode: invoiceData.currencyCode || 150, // AED default
    type: invoiceData.type || 2, // Customer invoice default
    taxType: invoiceData.taxType || 1, // Exclusive VAT default
    notes: invoiceData.notes || '',
    placeOfSupplyId: invoiceData.placeOfSupplyId || '',
    // Line items need to be formatted for the API
    lineItems: JSON.stringify(
      invoiceData.lineItems.map(item => ({
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

  const response = await request.post(`${apiUrl}/rest/invoice/save`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: formData.toString(),
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to create invoice: ${response.status()} ${errorText}`);
  }

  const responseData = await response.json();
  return {
    ...invoiceData,
    invoiceId: responseData.invoiceId || responseData.id,
  };
}

/**
 * Posts an invoice (makes it final/active)
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param invoiceId - Invoice ID to post
 * @returns Posting response
 *
 * @example
 * ```typescript
 * await postInvoice(request, token, invoiceId);
 * ```
 */
export async function postInvoice(
  request: APIRequestContext,
  authToken: string,
  invoiceId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();

  const payload = {
    invoiceId: invoiceId,
  };

  const response = await request.post(`${apiUrl}/rest/invoice/posting`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to post invoice: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Gets invoice details by ID
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param invoiceId - Invoice ID
 * @returns Invoice details
 *
 * @example
 * ```typescript
 * const invoice = await getInvoiceDetails(request, token, 1);
 * ```
 */
export async function getInvoiceDetails(
  request: APIRequestContext,
  authToken: string,
  invoiceId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const response = await request.get(`${apiUrl}/rest/invoice/getInvoiceById?id=${invoiceId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get invoice details: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Gets invoice list
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param options - Optional filters
 * @returns Invoice list response
 *
 * @example
 * ```typescript
 * const invoices = await getInvoiceList(request, token, {
 *   type: 2, // Customer invoices
 *   pageNo: 1
 * });
 * ```
 */
export async function getInvoiceList(
  request: APIRequestContext,
  authToken: string,
  options: {
    type?: number; // 1 = Supplier, 2 = Customer
    contactId?: number;
    status?: number;
    pageNo?: number;
    pageSize?: number;
    paginationDisable?: boolean;
  } = {}
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  let url = `${apiUrl}/rest/invoice/list?`;

  if (options.type) {
    url += `type=${options.type}&`;
  }
  if (options.contactId) {
    url += `contactId=${options.contactId}&`;
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
    throw new Error(`Failed to get invoice list: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Navigates to invoice creation page
 *
 * @param page - Playwright Page object
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToCreateInvoice(page);
 * ```
 */
export async function navigateToCreateInvoice(page: Page): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const createPath = '/admin/income/customer-invoice/create';
  await page.goto(`${baseUrl}${createPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to invoice list page
 *
 * @param page - Playwright Page object
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToInvoiceList(page);
 * ```
 */
export async function navigateToInvoiceList(page: Page): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const listPath = '/admin/income/customer-invoice';
  await page.goto(`${baseUrl}${listPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to invoice detail page
 *
 * @param page - Playwright Page object
 * @param invoiceId - Invoice ID
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToInvoiceDetail(page, 1);
 * ```
 */
export async function navigateToInvoiceDetail(page: Page, invoiceId: number): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const detailPath = `/admin/income/customer-invoice/${invoiceId}`;
  await page.goto(`${baseUrl}${detailPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Creates an invoice via UI (fallback method)
 *
 * @param page - Playwright Page object
 * @param invoiceData - Invoice data
 * @throws Error if creation fails
 *
 * @example
 * ```typescript
 * await createInvoiceViaUI(page, {
 *   contactId: 1,
 *   lineItems: [{
 *     description: 'Test Product',
 *     quantity: 1,
 *     unitPrice: 1000
 *   }]
 * });
 * ```
 */
export async function createInvoiceViaUI(page: Page, invoiceData: InvoiceData): Promise<void> {
  await navigateToCreateInvoice(page);

  // Fill in invoice number if field exists
  if (invoiceData.referenceNumber) {
    const refInput = page.locator('input[name*="reference"], input[name*="number"]').first();
    if (await refInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await refInput.fill(invoiceData.referenceNumber);
    }
  }

  // Select customer/contact
  const contactSelect = page.locator('select[name*="contact"], select[name*="customer"]').first();
  if (await contactSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
    await contactSelect.selectOption(String(invoiceData.contactId));
  }

  // Fill in line items (simplified - actual implementation may vary)
  // This is a basic implementation; the actual form may be more complex
  const descriptionInput = page
    .locator('input[name*="description"], textarea[name*="description"]')
    .first();
  if (
    invoiceData.lineItems.length > 0 &&
    (await descriptionInput.isVisible({ timeout: 3000 }).catch(() => false))
  ) {
    await descriptionInput.fill(invoiceData.lineItems[0].description);
  }

  const quantityInput = page.locator('input[name*="quantity"]').first();
  if (
    invoiceData.lineItems.length > 0 &&
    (await quantityInput.isVisible({ timeout: 3000 }).catch(() => false))
  ) {
    await quantityInput.fill(String(invoiceData.lineItems[0].quantity));
  }

  const priceInput = page.locator('input[name*="price"], input[name*="unitPrice"]').first();
  if (
    invoiceData.lineItems.length > 0 &&
    (await priceInput.isVisible({ timeout: 3000 }).catch(() => false))
  ) {
    await priceInput.fill(String(invoiceData.lineItems[0].unitPrice));
  }

  // Submit the form
  const submitButton = page.getByRole('button', { name: /save|submit|create/i });
  if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await submitButton.click();
    await page.waitForTimeout(2000);
  }
}
