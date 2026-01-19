import { Page, expect, APIRequestContext } from '@playwright/test';
import { getApiBaseUrl, getFrontendBaseUrl } from './test-setup-helpers';

/**
 * Generates a unique invoice reference number using the pattern: INV-E2E-${Date.now()}
 */
export function generateInvoiceNumber(): string {
  return `INV-E2E-${Date.now()}`;
}

/**
 * Invoice data structure for creation
 */
export interface InvoiceData {
  referenceNumber?: string;
  invoiceDate?: string; // Format: dd/MM/yyyy
  dueDate?: string; // Format: dd/MM/yyyy
  contactId: number;
  currencyCode?: number;
  type?: number; // 1 = Supplier (legacy), 2 = Customer, 6 = Supplier (modern)
  taxType?: boolean | number; // false = Exclusive, true = Inclusive
  lineItems: InvoiceLineItem[];
  notes?: string;
  placeOfSupplyId?: number;
  term?: string;
}

/**
 * Invoice line item data structure
 */
export interface InvoiceLineItem {
  productId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  vatCategoryId?: string;
  vatId?: number;
  discount?: number;
  discountType?: string;
  subTotal?: number;
  vatAmount?: number;
  exciseAmount?: number;
  exciseTaxId?: number;
  transactionCategoryId?: number;
}

/**
 * Creates an invoice via API
 */
export async function createInvoiceViaAPI(
  request: APIRequestContext,
  authToken: string,
  invoiceData: InvoiceData
): Promise<InvoiceData & { invoiceId: number }> {
  const apiUrl = getApiBaseUrl();
  const today = new Date();

  const getFormattedDate = (dateInput: string | Date | undefined, defaultDate: Date): string => {
    const d = dateInput ? new Date(dateInput) : defaultDate;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formattedDate = getFormattedDate(invoiceData.invoiceDate, today);
  const formattedDueDate = getFormattedDate(
    invoiceData.dueDate,
    (() => {
      const d = new Date(today);
      d.setDate(d.getDate() + 30);
      return d;
    })()
  );

  let totalNet = 0;
  let totalVatAmount = 0;
  let totalExciseAmount = 0;
  const taxTypeNum =
    typeof invoiceData.taxType === 'boolean' ? (invoiceData.taxType ? 2 : 1) : invoiceData.taxType || 1;
  const type = invoiceData.type || 2;
  const taxTypeBoolean =
    typeof invoiceData.taxType === 'boolean' ? invoiceData.taxType : invoiceData.taxType === 2;

  const lineItemsData = invoiceData.lineItems.map(item => {
    const quantity = item.quantity;
    const unitPrice = item.unitPrice;
    const discount = item.discount || 0;
    const discountType = item.discountType || 'FIXED';

    let netValue = quantity * unitPrice;
    if (discount > 0) {
      if (discountType === 'PERCENTAGE') netValue = netValue * (1 - discount / 100);
      else netValue = netValue - discount;
    }

    const vatCategoryId = item.vatCategoryId || (item.vatId ? String(item.vatId) : null);
    let vatAmount = 0;
    if (vatCategoryId && taxTypeNum === 1) vatAmount = netValue * 0.05;
    else if (vatCategoryId && taxTypeNum === 2) vatAmount = netValue * (5 / 105);

    const exciseAmount = item.exciseAmount || 0;
    const subTotal = netValue + vatAmount;

    totalNet += netValue;
    totalVatAmount += vatAmount;
    totalExciseAmount += exciseAmount;

    return {
      id: 0,
      productId: item.productId || null,
      description: item.description,
      quantity: quantity,
      unitPrice: unitPrice,
      vatCategoryId: vatCategoryId,
      discount: discount,
      discountType: discountType,
      subTotal: subTotal,
          vatAmount: vatAmount,
          exciseAmount: exciseAmount,
          exciseTaxId: item.exciseTaxId || null,
          transactionCategoryId: item.transactionCategoryId || (type === 6 || type === 1 ? 49 : 84), // Default to 49 (COGS) for supplier, 84 (Sales) for customer
        };
  });

  const totalAmount = totalNet + totalVatAmount;

  const refNum = invoiceData.referenceNumber || generateInvoiceNumber();

  const payload: Record<string, any> = {
    invoiceDate: formattedDate,
    invoiceDueDate: formattedDueDate,
    contactId: invoiceData.contactId,
    currencyCode: invoiceData.currencyCode || 150,
    type: String(type),
    taxType: taxTypeBoolean,
    notes: invoiceData.notes || '',
    placeOfSupplyId: invoiceData.placeOfSupplyId || null,
    lineItemsString: JSON.stringify(lineItemsData),
    totalAmount: totalAmount,
    totalVatAmount: totalVatAmount,
    totalExciseAmount: totalExciseAmount,
    discount: 0,
    term: invoiceData.term || 'NET_30',
    exchangeRate: 1,
    referenceNumber: refNum, // Always send referenceNumber
  };

  // Modern frontend uses 'invoiceNumber' for type 6 (Supplier)
  if (type === 6 || type === 1) {
    payload.invoiceNumber = refNum;
  }

  const multipartData: Record<string, string | number> = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      multipartData[key] = String(value);
    }
  });

  const response = await request.post(`${apiUrl}/rest/invoice/save`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    multipart: multipartData,
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    console.error('Invoice creation failed:', {
      status: response.status(),
      error: errorText,
      payload: payload,
    });
    throw new Error(`Failed to create invoice: ${response.status()} ${errorText}`);
  }

  const responseData = await response.json();
  return {
    ...invoiceData,
    invoiceId: responseData.invoiceId || responseData.id,
  };
}

/**
 * Posts an invoice
 */
export async function postInvoice(
  request: APIRequestContext,
  authToken: string,
  invoiceId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const response = await request.post(`${apiUrl}/rest/invoice/posting`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    data: {
      postingRefId: invoiceId,
      postingRefType: 'INVOICE',
      markAsSent: false, // Default to false for tests
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to post invoice: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Gets invoice details by ID
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
 */
export async function getInvoiceList(
  request: APIRequestContext,
  authToken: string,
  options: {
    type?: number;
    contactId?: number;
    status?: number;
    pageNo?: number;
    pageSize?: number;
    paginationDisable?: boolean;
  } = {}
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  let url = `${apiUrl}/rest/invoice/list?`;

  if (options.type) url += `type=${options.type}&`;
  if (options.contactId) url += `contactId=${options.contactId}&`;
  if (options.status) url += `status=${options.status}&`;
  if (options.pageNo) url += `pageNo=${options.pageNo}&`;
  if (options.pageSize) url += `pageSize=${options.pageSize}&`;
  if (options.paginationDisable) url += `paginationDisable=${options.paginationDisable}&`;

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
 */
export async function navigateToCreateInvoice(page: Page): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  await page.goto(`${baseUrl}/admin/income/customer-invoice/create`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to invoice list page
 */
export async function navigateToInvoiceList(page: Page): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  await page.goto(`${baseUrl}/admin/income/customer-invoice`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to invoice detail page
 */
export async function navigateToInvoiceDetail(page: Page, invoiceId: number): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  await page.goto(`${baseUrl}/admin/income/customer-invoice/${invoiceId}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Creates an invoice via UI (fallback)
 */
export async function createInvoiceViaUI(page: Page, invoiceData: InvoiceData): Promise<void> {
  await navigateToCreateInvoice(page);

  if (invoiceData.referenceNumber) {
    const refInput = page.locator('input[name*="reference"], input[name*="number"]').first();
    if (await refInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await refInput.fill(invoiceData.referenceNumber);
    }
  }

  const contactSelect = page.locator('select[name*="contact"], select[name*="customer"]').first();
  if (await contactSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
    await contactSelect.selectOption(String(invoiceData.contactId));
  }

  if (invoiceData.lineItems.length > 0) {
    const descriptionInput = page.locator('input[name*="description"], textarea[name*="description"]').first();
    if (await descriptionInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await descriptionInput.fill(invoiceData.lineItems[0].description);
    }

    const quantityInput = page.locator('input[name*="quantity"]').first();
    if (await quantityInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await quantityInput.fill(String(invoiceData.lineItems[0].quantity));
    }

    const priceInput = page.locator('input[name*="price"], input[name*="unitPrice"]').first();
    if (await priceInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await priceInput.fill(String(invoiceData.lineItems[0].unitPrice));
    }
  }

  const submitButton = page.getByRole('button', { name: /save|submit|create/i });
  if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await submitButton.click();
    await page.waitForTimeout(2000);
  }
}
