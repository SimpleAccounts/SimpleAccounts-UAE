import { APIRequestContext } from '@playwright/test';
import { getApiBaseUrl } from './test-setup-helpers';

/**
 * VAT category data structure
 */
export interface VatCategoryData {
  id: number;
  name: string;
  vat: number; // VAT percentage as decimal (e.g., 5.0 for 5%)
}

/**
 * Retrieves all available VAT categories from the system
 * This verifies that VAT codes exist before creating transactions
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @returns List of VAT categories
 *
 * @example
 * ```typescript
 * const vatCategories = await getVatCategories(request, token);
 * // Returns: [{ id: 1, name: 'Standard Rate', vat: 5.0 }, ...]
 * ```
 */
export async function getVatCategories(
  request: APIRequestContext,
  authToken: string
): Promise<VatCategoryData[]> {
  const apiUrl = getApiBaseUrl();

  const response = await request.get(`${apiUrl}/rest/datalist/vatCategory`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get VAT categories: ${response.status()} ${errorText}`);
  }

  const vatCategories = await response.json();
  return vatCategories as VatCategoryData[];
}

/**
 * Verifies that a specific VAT category exists
 *
 * @param request - Playwright APIRequestContext
 * @param authToken - Authentication token
 * @param vatCategoryId - VAT category ID to verify
 * @returns True if VAT category exists, false otherwise
 *
 * @example
 * ```typescript
 * const exists = await verifyVatCategoryExists(request, token, 1);
 * ```
 */
export async function verifyVatCategoryExists(
  request: APIRequestContext,
  authToken: string,
  vatCategoryId: number
): Promise<boolean> {
  try {
    const vatCategories = await getVatCategories(request, authToken);
    return vatCategories.some(cat => cat.id === vatCategoryId);
  } catch (error) {
    console.warn('Failed to verify VAT category:', error);
    return false;
  }
}

/**
 * Gets a VAT category by ID
 *
 * @param request - Playwright APIRequestContext
 * @param authToken - Authentication token
 * @param vatCategoryId - VAT category ID
 * @returns VAT category data or null if not found
 *
 * @example
 * ```typescript
 * const vatCategory = await getVatCategoryById(request, token, 1);
 * ```
 */
export async function getVatCategoryById(
  request: APIRequestContext,
  authToken: string,
  vatCategoryId: number
): Promise<VatCategoryData | null> {
  try {
    const vatCategories = await getVatCategories(request, authToken);
    return vatCategories.find(cat => cat.id === vatCategoryId) || null;
  } catch (error) {
    console.warn('Failed to get VAT category:', error);
    return null;
  }
}

/**
 * Sets up and verifies VAT codes are available
 * This function ensures VAT codes exist before creating transactions
 *
 * @param request - Playwright APIRequestContext
 * @param authToken - Authentication token
 * @returns List of available VAT categories
 * @throws Error if no VAT categories are found
 *
 * @example
 * ```typescript
 * const vatCategories = await setupVATCodes(request, token);
 * // Ensures VAT codes are available for transaction creation
 * ```
 */
export async function setupVATCodes(
  request: APIRequestContext,
  authToken: string
): Promise<VatCategoryData[]> {
  const vatCategories = await getVatCategories(request, authToken);

  if (!vatCategories || vatCategories.length === 0) {
    throw new Error(
      'No VAT categories found. Please ensure VAT codes are configured in the system.'
    );
  }

  return vatCategories;
}

/**
 * VAT return report request data structure
 */
export interface VatReturnReportRequest {
  startDate?: string; // Format: DD-MM-YYYY
  endDate?: string; // Format: DD-MM-YYYY
  period?: string; // VAT period (e.g., "2024-01")
}

/**
 * Generates a VAT return report via API
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param reportRequest - Report request parameters
 * @returns VAT return report data
 *
 * @example
 * ```typescript
 * const vatReport = await generateVatReturnReport(request, token, {
 *   startDate: '01-01-2024',
 *   endDate: '31-03-2024'
 * });
 * ```
 */
export async function generateVatReturnReport(
  request: APIRequestContext,
  authToken: string,
  reportRequest: VatReturnReportRequest = {}
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const today = new Date();
  const lastQuarter = new Date(today.getFullYear(), today.getMonth() - 3, 1);
  const formattedStartDate = reportRequest.startDate || formatDate(lastQuarter);
  const formattedEndDate = reportRequest.endDate || formatDate(today);

  const url = `${apiUrl}/rest/financialReport/vatReturnReport?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;

  const response = await request.get(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to generate VAT return report: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Gets VAT report filing list
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param options - Optional filters
 * @returns VAT report filing list
 */
export async function getVatReportFilingList(
  request: APIRequestContext,
  authToken: string,
  options: {
    startDate?: string;
    endDate?: string;
    pageNo?: number;
    pageSize?: number;
    paginationDisable?: boolean;
  } = {}
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  let url = `${apiUrl}/rest/vatReport/getVatReportFilingList`;

  const params = new URLSearchParams();
  if (options.startDate) params.append('startDate', options.startDate);
  if (options.endDate) params.append('endDate', options.endDate);
  if (options.pageNo) params.append('pageNo', String(options.pageNo));
  if (options.pageSize) params.append('pageSize', String(options.pageSize));
  if (options.paginationDisable)
    params.append('paginationDisable', String(options.paginationDisable));

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await request.get(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get VAT report filing list: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Records VAT payment
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param paymentData - VAT payment data
 * @returns Payment record response
 */
export async function recordVatPayment(
  request: APIRequestContext,
  authToken: string,
  paymentData: {
    vatReportFilingId: number;
    paymentDate: string; // Format: DD-MM-YYYY
    paymentAmount: number;
    paymentMethod?: string;
    referenceNumber?: string;
  }
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const payload = {
    vatReportFilingId: paymentData.vatReportFilingId,
    paymentDate: paymentData.paymentDate,
    paymentAmount: paymentData.paymentAmount,
    paymentMethod: paymentData.paymentMethod || 'BANK_TRANSFER',
    referenceNumber: paymentData.referenceNumber || `VAT-PAY-${Date.now()}`,
  };

  const response = await request.post(`${apiUrl}/rest/vatReport/recordPayment`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to record VAT payment: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Navigates to VAT reports page
 *
 * @param page - Playwright Page object
 * @throws Error if navigation fails
 */
export async function navigateToVatReports(page: Page): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const reportsPath = '/admin/financial-report/vat-return';
  await page.goto(`${baseUrl}${reportsPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Formats date to DD-MM-YYYY format
 *
 * @param date - Date object
 * @returns Formatted date string
 */
/** Backend uses DD/MM/YYYY (CommonColumnConstants.DD_MM_YYYY). */
function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
