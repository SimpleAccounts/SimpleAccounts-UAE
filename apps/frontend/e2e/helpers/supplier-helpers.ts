import { Page, APIRequestContext } from '@playwright/test';
import { getApiBaseUrl } from './test-setup-helpers';
import { loginTestUser } from './test-user-helpers';
import { createTestContact } from './contact-helpers';

/**
 * Generates a unique supplier name using the pattern: Test Supplier ${Date.now()}
 *
 * @param prefix - Optional prefix for the supplier name (default: 'Test Supplier')
 * @returns A unique supplier name
 *
 * @example
 * ```typescript
 * const name = generateSupplierName();
 * // Returns: Test Supplier 1234567890
 *
 * const customName = generateSupplierName('My Supplier');
 * // Returns: My Supplier 1234567890
 * ```
 */
export function generateSupplierName(prefix: string = 'Test Supplier'): string {
  const timestamp = Date.now();
  return `${prefix} ${timestamp}`;
}

/**
 * Generates a unique supplier email using the pattern: supplier-${Date.now()}@example.com
 *
 * @returns A unique supplier email address
 *
 * @example
 * ```typescript
 * const email = generateSupplierEmail();
 * // Returns: supplier-1234567890@example.com
 * ```
 */
export function generateSupplierEmail(): string {
  const timestamp = Date.now();
  return `supplier-${timestamp}@example.com`;
}

/**
 * Supplier data structure for creation (same as CustomerData but contactType = 2)
 */
export interface SupplierData {
  firstName: string;
  lastName: string;
  email: string;
  organization?: string;
  mobileNumber?: string;
  telephone?: string;
  currencyCode?: number; // Currency code (default: 150 for AED)
  taxTreatmentId?: number; // Tax treatment ID (default: 7 for Unregistered)
  countryId?: number; // Country code (default: 229 for UAE)
  stateId?: number; // State ID (default: 3798 for Dubai)
  city?: string; // City name (default: 'Dubai')
  postZipCode?: string; // Postal/Zip code (default: '00000')
  address?: string; // Billing address (default: 'Dubai Downtown')
  shippingCountryId?: number; // Shipping country code
  shippingStateId?: number; // Shipping state ID
  shippingCity?: string; // Shipping city
  shippingPostZipCode?: string; // Shipping postal code
  shippingAddress?: string; // Shipping address
  isBillingAndShippingAddressSame?: boolean; // Whether billing and shipping are same (default: true)
  vatRegistrationNumber?: string; // VAT registration number (optional)
  isRegisteredForVat?: boolean; // Whether registered for VAT (default: false)
}

/**
 * Creates a supplier via API
 * This is the preferred method for test data setup as it's faster and more reliable
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param supplierData - Supplier data (optional fields will use defaults)
 * @returns Created supplier data including contactId
 *
 * @example
 * ```typescript
 * const supplier = await createSupplierViaAPI(request, token, {
 *   firstName: 'Jane',
 *   lastName: 'Smith',
 *   email: 'jane@example.com'
 * });
 * ```
 */
export async function createSupplierViaAPI(
  request: APIRequestContext,
  authToken: string,
  supplierData: Partial<SupplierData> = {}
): Promise<SupplierData & { contactId: number }> {
  const apiUrl = getApiBaseUrl();
  const timestamp = Date.now();

  // Generate default values if not provided
  const defaultData: SupplierData = {
    firstName: supplierData.firstName || 'Test',
    lastName: supplierData.lastName || `Supplier ${timestamp}`,
    email: supplierData.email || generateSupplierEmail(),
    organization: supplierData.organization || `Test Supplier Org ${timestamp}`,
    mobileNumber: supplierData.mobileNumber || '971501234567',
    currencyCode: supplierData.currencyCode || 150, // AED default
    taxTreatmentId: supplierData.taxTreatmentId || 7, // Unregistered default
    countryId: supplierData.countryId || 229, // UAE default
    stateId: supplierData.stateId || 3798, // Dubai default
    city: supplierData.city || 'Dubai',
    postZipCode: supplierData.postZipCode || '00000',
    address: supplierData.address || 'Dubai Downtown',
    isBillingAndShippingAddressSame: supplierData.isBillingAndShippingAddressSame ?? true,
    isRegisteredForVat: supplierData.isRegisteredForVat ?? false,
  };

  // Set shipping address same as billing if not specified
  if (defaultData.isBillingAndShippingAddressSame) {
    defaultData.shippingCountryId = defaultData.countryId;
    defaultData.shippingStateId = defaultData.stateId;
    defaultData.shippingCity = defaultData.city;
    defaultData.shippingPostZipCode = defaultData.postZipCode;
    defaultData.shippingAddress = defaultData.address;
  } else {
    defaultData.shippingCountryId = supplierData.shippingCountryId || defaultData.countryId;
    defaultData.shippingStateId = supplierData.shippingStateId || defaultData.stateId;
    defaultData.shippingCity = supplierData.shippingCity || defaultData.city;
    defaultData.shippingPostZipCode = supplierData.shippingPostZipCode || defaultData.postZipCode;
    defaultData.shippingAddress = supplierData.shippingAddress || defaultData.address;
  }

  const payload = {
    firstName: defaultData.firstName,
    lastName: defaultData.lastName,
    email: defaultData.email,
    organization: defaultData.organization,
    mobileNumber: defaultData.mobileNumber,
    telephone: defaultData.telephone || '',
    contactType: 2, // 2 = Supplier, 1 = Customer
    currencyCode: defaultData.currencyCode,
    taxTreatmentId: defaultData.taxTreatmentId,
    countryId: defaultData.countryId,
    stateId: defaultData.stateId,
    city: defaultData.city,
    postZipCode: defaultData.postZipCode,
    addressLine1: defaultData.address,
    addressLine2: '',
    addressLine3: '',
    shippingCountryId: defaultData.shippingCountryId,
    shippingStateId: defaultData.shippingStateId,
    shippingCity: defaultData.shippingCity,
    shippingPostZipCode: defaultData.shippingPostZipCode,
    isBillingAndShippingAddressSame: defaultData.isBillingAndShippingAddressSame,
    vatRegistrationNumber: supplierData.vatRegistrationNumber || '',
    isRegisteredForVat: defaultData.isRegisteredForVat,
    isActive: true,
    ...supplierData, // Allow overriding any field
  };

  const response = await request.post(`${apiUrl}/rest/contact/save`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to create supplier: ${response.status()} ${errorText}`);
  }

  const responseData = await response.json();
  return {
    ...defaultData,
    ...supplierData,
    contactId: responseData.contactId || responseData.id,
  } as SupplierData & { contactId: number };
}

/**
 * Creates a supplier via UI using the standardized contact creation helper
 * This is a fallback method if API creation is not available
 *
 * @param page - Playwright Page object
 * @param supplierData - Supplier data
 * @throws Error if creation fails
 *
 * @example
 * ```typescript
 * await createSupplierViaUI(page, {
 *   firstName: 'Jane',
 *   lastName: 'Smith',
 *   email: 'jane@example.com'
 * });
 * ```
 */
export async function createSupplierViaUI(
  page: Page,
  supplierData: Partial<SupplierData> = {}
): Promise<void> {
  const timestamp = Date.now();
  const defaultData: SupplierData = {
    firstName: supplierData.firstName || 'Test',
    lastName: supplierData.lastName || `Supplier ${timestamp}`,
    email: supplierData.email || generateSupplierEmail(),
    organization: supplierData.organization || `Test Supplier Org ${timestamp}`,
    mobileNumber: supplierData.mobileNumber || '971501234567',
  };

  await createTestContact(page, defaultData.firstName, defaultData.lastName, defaultData.email, {
    contactType: 'SUPPLIER',
    phone: defaultData.mobileNumber,
    organization: defaultData.organization,
  });
}

/**
 * Creates a test supplier using the preferred method (API first, UI fallback)
 *
 * @param request - Playwright APIRequestContext
 * @param page - Playwright Page object (used for login if API fails)
 * @param authToken - Optional authentication token (will login if not provided)
 * @param supplierData - Supplier data
 * @returns Created supplier data
 *
 * @example
 * ```typescript
 * const supplier = await createTestSupplier(request, page, token, {
 *   firstName: 'Jane',
 *   lastName: 'Smith',
 *   email: 'jane@example.com'
 * });
 * ```
 */
export async function createTestSupplier(
  request: APIRequestContext,
  page: Page,
  authToken?: string,
  supplierData: Partial<SupplierData> = {}
): Promise<SupplierData & { contactId: number }> {
  let token = authToken;

  // If no token provided, login to get one
  if (!token) {
    await loginTestUser(page);
    // Extract token from localStorage
    token = (await page.evaluate(() => localStorage.getItem('accessToken'))) || '';
    if (!token) {
      throw new Error('Failed to get authentication token after login');
    }
  }

  try {
    // Try API creation first (preferred method)
    return await createSupplierViaAPI(request, token, supplierData);
  } catch (error) {
    console.warn('API supplier creation failed, falling back to UI:', error);
    // Fallback to UI creation
    await createSupplierViaUI(page, supplierData);
    // Return partial data (no ID available from UI creation)
    const timestamp = Date.now();
    return {
      firstName: supplierData.firstName || 'Test',
      lastName: supplierData.lastName || `Supplier ${timestamp}`,
      email: supplierData.email || generateSupplierEmail(),
      contactId: 0, // UI creation doesn't return ID
    } as SupplierData & { contactId: number };
  }
}
