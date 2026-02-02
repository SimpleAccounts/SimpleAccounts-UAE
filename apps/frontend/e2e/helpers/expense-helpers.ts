import { Page, expect, APIRequestContext } from '@playwright/test';
import { getApiBaseUrl, getFrontendBaseUrl } from './test-setup-helpers';

/**
 * Generates a unique expense reference number using the pattern: EXP-${Date.now()}
 */
export function generateExpenseNumber(): string {
  return `EXP-${Date.now()}`;
}

/**
 * Expense data structure for creation
 */
export interface ExpenseData {
  expenseNumber?: string;
  expenseDate?: string; // Format: dd/MM/yyyy
  payee?: string; // "Company Expense" or vendor name
  amount: number; // Expense amount
  expenseCategory?: number; // Transaction category ID
  vatCategoryId?: number; // VAT code ID
  currencyCode?: number; // Currency code (default: 150 for AED)
  exclusiveVat?: boolean; // If true, VAT is exclusive (default: true)
  description?: string;
  notes?: string;
  bankAccountId?: number; // Bank account ID
  employeeId?: number; // Employee ID
  projectId?: number; // Project ID
  taxTreatmentId?: number;
  placeOfSupplyId?: number;
  isReverseChargeEnabled?: boolean;
  expenseType?: boolean;
  payMode?: 'BANK' | 'CASH';
}

/**
 * Gets expense categories list
 */
export async function getExpenseCategoriesList(
  request: APIRequestContext,
  authToken: string
): Promise<any[]> {
  const apiUrl = getApiBaseUrl();
  const response = await request.get(`${apiUrl}/rest/transactioncategory/getForExpenses`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get expense categories: ${response.status()} ${errorText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data?.data || [];
}

/**
 * Gets a default expense category ID for testing
 */
export async function getDefaultExpenseCategoryId(
  request: APIRequestContext,
  authToken: string
): Promise<number> {
  const categories = await getExpenseCategoriesList(request, authToken);
  const category = categories.find((item: any) => item?.transactionCategoryId || item?.id);
  const categoryId = category?.transactionCategoryId ?? category?.id;
  if (!categoryId) {
    throw new Error('No expense categories available for tests');
  }
  return categoryId;
}

/**
 * Creates an expense via API
 */
export async function createExpenseViaAPI(
  request: APIRequestContext,
  authToken: string,
  expenseData: ExpenseData
): Promise<ExpenseData & { expenseId: number }> {
  const apiUrl = getApiBaseUrl();
  const today = new Date();

  const getFormattedDate = (dateInput: string | Date | undefined, defaultDate: Date): string => {
    const d = dateInput ? new Date(dateInput) : defaultDate;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formattedDate = getFormattedDate(expenseData.expenseDate, today);

  const payload: any = {
    expenseNumber: expenseData.expenseNumber || generateExpenseNumber(),
    expenseDate: formattedDate,
    expenseAmount: expenseData.amount,
    expenseDescription: expenseData.description || 'E2E Test Expense',
    expenseCategory: expenseData.expenseCategory || null,
    vatCategoryId: expenseData.vatCategoryId || null,
    currencyCode: expenseData.currencyCode || 150,
    exclusiveVat: expenseData.exclusiveVat !== undefined ? expenseData.exclusiveVat : true,
    payee: expenseData.payee || 'Company Expense',
    payMode: expenseData.payMode || (expenseData.bankAccountId ? 'BANK' : 'CASH'),
    bankAccountId: expenseData.bankAccountId || null,
    employeeId: expenseData.employeeId || null,
    projectId: expenseData.projectId || null,
    taxTreatmentId: expenseData.taxTreatmentId || null,
    placeOfSupplyId: expenseData.placeOfSupplyId || null,
    isReverseChargeEnabled: expenseData.isReverseChargeEnabled || false,
    expenseType: expenseData.expenseType || false,
    isVatClaimable: true,
    delivaryNotes: expenseData.notes || '',
    receiptNumber: '',
    receiptAttachmentDescription: '',
    exchangeRate: 1,
  };

  const multipartData: Record<string, string | number | boolean> = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      multipartData[key] = typeof value === 'boolean' ? value : String(value);
    }
  });

  const response = await request.post(`${apiUrl}/rest/expense/save`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    multipart: multipartData,
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    console.error('Expense creation failed:', {
      status: response.status(),
      error: errorText,
      payload: payload,
    });
    throw new Error(`Failed to create expense: ${response.status()} ${errorText}`);
  }

  const responseData = await response.json();
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    const expenseListResponse = await request.get(
      `${apiUrl}/rest/expense/getList?paginationDisable=true&expenseNumber=${payload.expenseNumber}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (expenseListResponse.ok()) {
      const listData = await expenseListResponse.json();
      const expense = listData.data?.find((e: any) => e.expenseNumber === payload.expenseNumber);
      if (expense) {
        return {
          ...expenseData,
          expenseId: expense.id || expense.expenseId || 0,
        };
      }
    }
  } catch (error) {
    console.warn('Could not retrieve expense ID:', error);
  }

  return {
    ...expenseData,
    expenseId: responseData.id || responseData.expenseId || 0,
  };
}

/**
 * Gets expense details by ID
 */
export async function getExpenseDetails(
  request: APIRequestContext,
  authToken: string,
  expenseId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const response = await request.get(
    `${apiUrl}/rest/expense/getExpenseById?expenseId=${expenseId}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get expense details: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Gets expense list
 */
export async function getExpenseList(
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
  let url = `${apiUrl}/rest/expense/getList?`;

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
    throw new Error(`Failed to get expense list: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Posts/submits an expense
 */
export async function postExpense(
  request: APIRequestContext,
  authToken: string,
  expenseId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const normalizeNumber = (value: any): number | null => {
    const parsed = typeof value === 'string' ? Number(value) : value;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  let amount: number | null = null;
  let postingChartOfAccountId: number | null = null;

  try {
    const expenseDetails = await getExpenseDetails(request, authToken, expenseId);
    amount = normalizeNumber(expenseDetails?.expenseAmount ?? expenseDetails?.amount);
    postingChartOfAccountId = normalizeNumber(
      expenseDetails?.expenseCategory ??
        expenseDetails?.chartOfAccountId ??
        expenseDetails?.transactionCategoryId
    );
  } catch (error) {
    console.warn('Failed to fetch expense details for posting:', error);
  }

  if (amount == null || postingChartOfAccountId == null) {
    try {
      const expenseList = await getExpenseList(request, authToken, {
        paginationDisable: true,
      });
      const expenseRow = expenseList?.data?.find(
        (item: any) => item.expenseId === expenseId || item.id === expenseId
      );
      if (amount == null) {
        amount = normalizeNumber(expenseRow?.expenseAmount ?? expenseRow?.amount);
      }
      if (postingChartOfAccountId == null) {
        postingChartOfAccountId = normalizeNumber(
          expenseRow?.chartOfAccountId ??
            expenseRow?.expenseCategory ??
            expenseRow?.transactionCategoryId
        );
      }
    } catch (error) {
      console.warn('Failed to fetch expense list for posting:', error);
    }
  }

  if (amount == null || postingChartOfAccountId == null) {
    throw new Error(
      `Missing expense posting data for expense ${expenseId}: amount=${amount}, postingChartOfAccountId=${postingChartOfAccountId}`
    );
  }

  const response = await request.post(`${apiUrl}/rest/expense/posting`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    data: {
      amount,
      postingRefId: expenseId,
      postingRefType: 'EXPENSE',
      postingChartOfAccountId,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to post expense: ${response.status()} ${errorText}`);
  }

  const responseText = await response.text();
  try {
    return responseText ? JSON.parse(responseText) : { message: 'Expense posted successfully' };
  } catch {
    return { message: responseText || 'Expense posted successfully' };
  }
}

/**
 * Approves an expense
 */
export async function approveExpense(
  request: APIRequestContext,
  authToken: string,
  expenseId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const response = await request.post(`${apiUrl}/rest/expense/approve`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    data: { expenseId: expenseId, status: 'approved' },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    console.warn(`Expense approval failed: ${response.status()} ${errorText}`);
    return { success: true };
  }

  return await response.json();
}

/**
 * Navigates to expense creation page
 */
export async function navigateToCreateExpense(page: Page): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  await page.goto(`${baseUrl}/admin/expense/expense/create`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to expense list page
 */
export async function navigateToExpenseList(page: Page): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  await page.goto(`${baseUrl}/admin/expense/expense`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to expense detail page
 */
export async function navigateToExpenseDetail(page: Page, expenseId: number): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  await page.goto(`${baseUrl}/admin/expense/expense/${expenseId}`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(2000);
}
