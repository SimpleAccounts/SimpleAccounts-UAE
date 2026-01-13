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
  taxType?: boolean | number; // Tax type: false/1 = Exclusive, true/2 = Inclusive (default: false)
  lineItems: InvoiceLineItem[];
  notes?: string;
  placeOfSupplyId?: number;
  term?: string; // Invoice term (e.g., 'NET_30', 'NET_7', 'DUE_ON_RECEIPT')
}

/**
 * Invoice line item data structure
 */
export interface InvoiceLineItem {
  productId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  vatCategoryId?: string; // VAT category ID as string (matches backend InvoiceLineItemModel)
  vatId?: number; // Legacy field, will be converted to vatCategoryId
  discount?: number;
  discountType?: string; // 'FIXED' or 'PERCENTAGE'
  subTotal?: number; // Auto-calculated if not provided
  vatAmount?: number; // VAT amount for this line item
  exciseAmount?: number; // Excise tax amount
  exciseTaxId?: number; // Excise tax ID
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
  // Spring Boot's default date parsing for @ModelAttribute uses ISO 8601 format (yyyy-MM-dd)
  // This is the format Spring Boot can parse by default without @DateTimeFormat annotation
  const formattedDate =
    invoiceData.invoiceDate ||
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 30);
  const formattedDueDate =
    invoiceData.dueDate ||
    `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;

  // Calculate totals from line items
  let totalNet = 0;
  let totalVatAmount = 0;
  let totalExciseAmount = 0;
  // Convert taxType to number for calculation: false/1 = Exclusive, true/2 = Inclusive
  const taxTypeNum =
    typeof invoiceData.taxType === 'boolean'
      ? invoiceData.taxType
        ? 2
        : 1
      : invoiceData.taxType || 1; // 1 = Exclusive, 2 = Inclusive

  const lineItemsData = invoiceData.lineItems.map(item => {
    const quantity = item.quantity;
    const unitPrice = item.unitPrice;
    const discount = item.discount || 0;
    const discountType = item.discountType || 'FIXED';

    // Calculate net value (after discount)
    let netValue = quantity * unitPrice;
    if (discount > 0) {
      if (discountType === 'PERCENTAGE') {
        netValue = netValue * (1 - discount / 100);
      } else {
        netValue = netValue - discount;
      }
    }

    // Calculate VAT amount (simplified - assumes 5% VAT if vatCategoryId provided)
    // In real scenario, VAT rate would come from vatCategory lookup
    // For E2E tests, we'll use a default VAT category ID if not provided
    // Default to empty string if no VAT category - backend will handle it
    const vatCategoryId = item.vatCategoryId || (item.vatId ? String(item.vatId) : '');
    let vatAmount = 0;
    // Only calculate VAT if vatCategoryId is provided
    // For now, skip VAT calculation if no vatCategoryId - backend will handle validation
    if (vatCategoryId && taxTypeNum === 1) {
      // Exclusive VAT: VAT is added on top
      vatAmount = netValue * 0.05; // Default 5% VAT (should lookup actual rate)
    } else if (vatCategoryId && taxTypeNum === 2) {
      // Inclusive VAT: VAT is included, extract it
      vatAmount = netValue * (5 / 105); // Default 5% VAT included
    }

    const exciseAmount = item.exciseAmount || 0;
    const subTotal = netValue + vatAmount;

    totalNet += netValue;
    totalVatAmount += vatAmount;
    totalExciseAmount += exciseAmount;

    return {
      id: 0,
      productId: item.productId || '',
      description: item.description,
      quantity: quantity,
      unitPrice: unitPrice,
      vatCategoryId: vatCategoryId,
      discount: discount,
      discountType: discountType,
      subTotal: subTotal,
      vatAmount: vatAmount,
      exciseAmount: exciseAmount,
      exciseTaxId: item.exciseTaxId || '',
    };
  });

  const totalAmount = totalNet + totalVatAmount;

  // Convert taxType: number (1/2) to boolean (false/true)
  // taxType: false = Exclusive VAT, true = Inclusive VAT
  const taxTypeBoolean =
    typeof invoiceData.taxType === 'boolean'
      ? invoiceData.taxType
      : invoiceData.taxType === 2 || invoiceData.taxType === true;

  const payload = {
    referenceNumber: invoiceData.referenceNumber || generateInvoiceNumber(),
    invoiceDate: formattedDate,
    invoiceDueDate: formattedDueDate,
    contactId: invoiceData.contactId,
    currencyCode: invoiceData.currencyCode || 150, // AED default
    type: String(invoiceData.type || 2), // Must be string: 1 = Supplier, 2 = Customer, 6 = Supplier (frontend uses 6)
    taxType: taxTypeBoolean, // Boolean: false = Exclusive, true = Inclusive
    notes: invoiceData.notes || '',
    placeOfSupplyId: invoiceData.placeOfSupplyId || '',
    lineItemsString: JSON.stringify(lineItemsData), // Field name must be lineItemsString (not lineItems)
    totalAmount: totalAmount,
    totalVatAmount: totalVatAmount,
    totalExciseAmount: totalExciseAmount,
    discount: 0, // Can be calculated if needed
    term: invoiceData.term || 'NET_30', // Default term (InvoiceDuePeriodEnum)
  };

  // Use FormData (multipart) to match frontend behavior
  // Spring Boot's default date parsing for @ModelAttribute uses ISO 8601 format (yyyy-MM-dd)
  // Send dates as ISO format strings which Spring Boot can parse by default
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // All values are sent as strings (dates are already formatted as ISO yyyy-MM-dd)
      formData.append(key, String(value));
    }
  });

  // Convert FormData to plain object for Playwright's multipart option
  // Playwright expects a plain object, not FormData instance
  const multipartData: Record<string, string | number> = {};
  for (const [key, value] of formData.entries()) {
    multipartData[key] = value as string | number;
  }

  const response = await request.post(`${apiUrl}/rest/invoice/save`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    multipart: multipartData,
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
