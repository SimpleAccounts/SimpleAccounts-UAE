import { Page, expect, APIRequestContext } from '@playwright/test';
import { getApiBaseUrl, getFrontendBaseUrl } from './test-setup-helpers';
import {
  createInvoiceViaAPI,
  postInvoice,
  getInvoiceDetails,
  getInvoiceList,
  navigateToInvoiceList,
  navigateToInvoiceDetail,
  InvoiceData,
  InvoiceLineItem,
} from './invoice-helpers';

/**
 * Generates a unique supplier invoice reference number using the pattern: SI-${Date.now()}
 *
 * @returns A unique supplier invoice reference number
 *
 * @example
 * ```typescript
 * const supplierInvoiceNumber = generateSupplierInvoiceNumber();
 * // Returns: SI-1234567890
 * ```
 */
export function generateSupplierInvoiceNumber(): string {
  return `SI-${Date.now()}`;
}

/**
 * Supplier invoice data structure for creation
 */
export interface SupplierInvoiceData {
  referenceNumber?: string;
  invoiceDate?: string; // Format: DD-MM-YYYY
  dueDate?: string; // Format: DD-MM-YYYY
  contactId: number; // Supplier contact ID
  currencyCode?: number; // Currency code (default: 150 for AED)
  taxType?: number; // Tax type: 1 = Exclusive, 2 = Inclusive (default: 1)
  lineItems: SupplierInvoiceLineItem[];
  notes?: string;
  placeOfSupplyId?: number;
}

/**
 * Supplier invoice line item data structure
 */
export interface SupplierInvoiceLineItem {
  productId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  vatId?: number; // VAT code ID
  discount?: number;
  subTotal?: number; // Auto-calculated if not provided
}

/**
 * Creates a supplier invoice via API (uses invoice API with type=1)
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param supplierInvoiceData - Supplier invoice data
 * @returns Created supplier invoice data including invoiceId
 *
 * @example
 * ```typescript
 * const supplierInvoice = await createSupplierInvoiceViaAPI(request, token, {
 *   contactId: 1,
 *   lineItems: [{
 *     description: 'Test Product',
 *     quantity: 1,
 *     unitPrice: 1000
 *   }]
 * });
 * ```
 */
export async function createSupplierInvoiceViaAPI(
  request: APIRequestContext,
  authToken: string,
  supplierInvoiceData: SupplierInvoiceData
): Promise<SupplierInvoiceData & { invoiceId: number }> {
  // Convert supplier invoice data to invoice data with type=1 (Supplier)
  const invoiceData: InvoiceData = {
    referenceNumber: supplierInvoiceData.referenceNumber || generateSupplierInvoiceNumber(),
    invoiceDate: supplierInvoiceData.invoiceDate,
    dueDate: supplierInvoiceData.dueDate,
    contactId: supplierInvoiceData.contactId,
    currencyCode: supplierInvoiceData.currencyCode,
    type: 1, // Supplier invoice type
    taxType: supplierInvoiceData.taxType,
    lineItems: supplierInvoiceData.lineItems.map(item => ({
      productId: item.productId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      vatId: item.vatId,
      discount: item.discount,
      subTotal: item.subTotal,
    })),
    notes: supplierInvoiceData.notes,
    placeOfSupplyId: supplierInvoiceData.placeOfSupplyId,
  };

  const result = await createInvoiceViaAPI(request, authToken, invoiceData);
  return {
    ...supplierInvoiceData,
    invoiceId: result.invoiceId,
  };
}

/**
 * Posts a supplier invoice (makes it final/active)
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param invoiceId - Supplier invoice ID to post
 * @returns Posting response
 *
 * @example
 * ```typescript
 * await postSupplierInvoice(request, token, invoiceId);
 * ```
 */
export async function postSupplierInvoice(
  request: APIRequestContext,
  authToken: string,
  invoiceId: number
): Promise<any> {
  return postInvoice(request, authToken, invoiceId);
}

/**
 * Gets supplier invoice details by ID
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param invoiceId - Supplier invoice ID
 * @returns Supplier invoice details
 *
 * @example
 * ```typescript
 * const supplierInvoice = await getSupplierInvoiceDetails(request, token, 1);
 * ```
 */
export async function getSupplierInvoiceDetails(
  request: APIRequestContext,
  authToken: string,
  invoiceId: number
): Promise<any> {
  return getInvoiceDetails(request, authToken, invoiceId);
}

/**
 * Gets supplier invoice list
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param options - Optional filters
 * @returns Supplier invoice list response
 *
 * @example
 * ```typescript
 * const supplierInvoices = await getSupplierInvoiceList(request, token, {
 *   contactId: 1,
 *   pageNo: 1
 * });
 * ```
 */
export async function getSupplierInvoiceList(
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
  return getInvoiceList(request, authToken, {
    type: 1, // Supplier invoice type
    ...options,
  });
}

/**
 * Navigates to supplier invoice list page
 *
 * @param page - Playwright Page object
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToSupplierInvoiceList(page);
 * ```
 */
export async function navigateToSupplierInvoiceList(page: Page): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const listPath = '/admin/expense/supplier-invoice';
  await page.goto(`${baseUrl}${listPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to supplier invoice detail page
 *
 * @param page - Playwright Page object
 * @param invoiceId - Supplier invoice ID
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToSupplierInvoiceDetail(page, 1);
 * ```
 */
export async function navigateToSupplierInvoiceDetail(
  page: Page,
  invoiceId: number
): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const detailPath = `/admin/expense/supplier-invoice/${invoiceId}`;
  await page.goto(`${baseUrl}${detailPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}
