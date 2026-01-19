import { Page, expect, APIRequestContext } from '@playwright/test';
import { getApiBaseUrl, getFrontendBaseUrl } from './test-setup-helpers';

/**
 * Generates a unique debit note reference number using the pattern: DN-${Date.now()}
 */
export function generateDebitNoteNumber(): string {
  return `DN-${Date.now()}`;
}

/**
 * Debit note data structure for creation
 */
export interface DebitNoteData {
  debitNoteNumber?: string;
  debitNoteDate?: string; // Format: dd/MM/yyyy
  invoiceId: number;
  contactId: number;
  currencyCode?: number;
  taxType?: number;
  lineItems: DebitNoteLineItem[];
  notes?: string;
  placeOfSupplyId?: number;
  discount?: number;
  isCreatedWithoutInvoice?: boolean;
}

/**
 * Debit note line item data structure
 */
export interface DebitNoteLineItem {
  productId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  vatId?: number;
  discount?: number;
  subTotal?: number;
}

/**
 * Creates a debit note via API
 */
export async function createDebitNoteViaAPI(
  request: APIRequestContext,
  authToken: string,
  debitNoteData: DebitNoteData
): Promise<DebitNoteData & { debitNoteId: number }> {
  const apiUrl = getApiBaseUrl();
  const today = new Date();

  const getFormattedDate = (dateInput: string | Date | undefined, defaultDate: Date): string => {
    const d = dateInput ? new Date(dateInput) : defaultDate;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formattedDate = getFormattedDate(debitNoteData.debitNoteDate, today);

  const payload: Record<string, any> = {
    creditNoteNumber: debitNoteData.debitNoteNumber || generateDebitNoteNumber(),
    creditNoteDate: formattedDate,
    invoiceId: debitNoteData.invoiceId || null,
    contactId: debitNoteData.contactId,
    type: '13',
    currencyCode: debitNoteData.currencyCode || 150,
    taxType: debitNoteData.taxType || 1,
    notes: debitNoteData.notes || '',
    placeOfSupplyId: debitNoteData.placeOfSupplyId || null,
    discount: debitNoteData.discount || 0,
    isCreatedWithoutInvoice: debitNoteData.isCreatedWithoutInvoice || false,
    cnCreatedOnPaidInvoice: '1',
    lineItemsString: JSON.stringify(
      debitNoteData.lineItems.map(item => ({
        id: 0,
        productId: item.productId || null,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatId: item.vatId || null,
        discount: item.discount || 0,
        subTotal: item.subTotal || item.quantity * item.unitPrice,
      }))
    ),
    totalAmount: debitNoteData.lineItems.reduce((sum, item) => sum + (item.subTotal || item.quantity * item.unitPrice), 0),
    totalVatAmount: 0,
    exchangeRate: 1,
  };

  const multipartData: Record<string, string | number | boolean> = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      multipartData[key] = typeof value === 'boolean' ? value : String(value);
    }
  });

  const response = await request.post(`${apiUrl}/rest/creditNote/save`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    multipart: multipartData,
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    console.error('Debit Note creation failed:', {
      status: response.status(),
      error: errorText,
      payload: payload,
    });
    throw new Error(`Failed to create debit note: ${response.status()} ${errorText}`);
  }

  const responseData = await response.json().catch(() => ({}));
  let debitNoteId = responseData.id || responseData.debitNoteId || 0;

  if (!debitNoteId) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      const listResponse = await request.get(
        `${apiUrl}/rest/creditNote/getList?type=13&paginationDisable=true&referenceNumber=${payload.creditNoteNumber}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (listResponse.ok()) {
        const listData = await listResponse.json();
        const debitNote = listData.data?.find(
          (dn: any) => dn.creditNoteNumber === payload.creditNoteNumber
        );
        if (debitNote) {
          debitNoteId = debitNote.id || debitNote.creditNoteId || 0;
        }
      }
    } catch (error) {
      console.warn('Could not retrieve debit note ID:', error);
    }
  }

  return {
    ...debitNoteData,
    debitNoteId: debitNoteId,
  };
}

/**
 * Gets debit note details by ID
 */
export async function getDebitNoteDetails(
  request: APIRequestContext,
  authToken: string,
  debitNoteId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const response = await request.get(`${apiUrl}/rest/creditNote/getList?type=13&creditNoteId=${debitNoteId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get debit note details: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Gets debit note by supplier invoice ID
 */
export async function getDebitNoteByInvoiceId(
  request: APIRequestContext,
  authToken: string,
  invoiceId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const response = await request.get(`${apiUrl}/rest/creditNote/getCreditNoteByInvoiceId?id=${invoiceId}&type=13`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get debit note by invoice ID: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Gets debit note list
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
  let url = `${apiUrl}/rest/creditNote/getList?type=13&`;

  if (options.contactId) url += `contact=${options.contactId}&`;
  if (options.invoiceId) url += `invoiceId=${options.invoiceId}&`;
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
    throw new Error(`Failed to get debit note list: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Posts a debit note
 */
export async function postDebitNote(
  request: APIRequestContext,
  authToken: string,
  debitNoteId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const response = await request.post(`${apiUrl}/rest/creditNote/creditNotePosting`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    data: {
      postingRefId: debitNoteId,
      postingRefType: 'DEBIT_NOTE',
      markAsSent: false,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to post debit note: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Applies a debit note to a supplier invoice
 */
export async function applyDebitNoteToInvoice(
  request: APIRequestContext,
  authToken: string,
  debitNoteId: number,
  invoiceId: number,
  amount?: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const response = await request.post(`${apiUrl}/rest/creditNote/applyToInvoice`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    data: { creditNoteId: debitNoteId, invoiceId: invoiceId, amount: amount },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to apply debit note to invoice: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Processes a supplier refund for a debit note
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
  const response = await request.post(`${apiUrl}/rest/creditNote/refund`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    data: {
      creditNoteId: debitNoteId,
      amount: refundData.amount,
      depositeToTransactionCategoryId: refundData.bankAccountId,
      payMode: refundData.payMode || 'BANK',
      notes: refundData.notes || '',
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to process debit note refund: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Navigates to debit note creation page
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
 */
export async function navigateToDebitNoteList(page: Page): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  await page.goto(`${baseUrl}/admin/expense/debit-notes`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to debit note detail page
 */
export async function navigateToDebitNoteDetail(page: Page, debitNoteId: number): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  await page.goto(`${baseUrl}/admin/expense/debit-notes/${debitNoteId}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}
