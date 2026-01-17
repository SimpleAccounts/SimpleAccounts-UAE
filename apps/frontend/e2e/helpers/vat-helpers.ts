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
