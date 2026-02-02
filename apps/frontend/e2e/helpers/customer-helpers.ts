import { Page, APIRequestContext } from '@playwright/test';
import { getApiBaseUrl, getFrontendBaseUrl } from './test-setup-helpers';
import { loginTestUser } from './test-user-helpers';
import { createTestContact } from './contact-helpers';

/**
 * Generates a unique customer name using the pattern: Test Customer ${Date.now()}
 *
 * @param prefix - Optional prefix for the customer name (default: 'Test Customer')
 * @returns A unique customer name
 *
 * @example
 * ```typescript
 * const name = generateCustomerName();
 * // Returns: Test Customer 1234567890
 *
 * const customName = generateCustomerName('My Customer');
 * // Returns: My Customer 1234567890
 * ```
 */
export function generateCustomerName(prefix: string = 'Test Customer'): string {
  const timestamp = Date.now();
  return `${prefix} ${timestamp}`;
}

/**
 * Generates a unique customer email using the pattern: customer-${Date.now()}@example.com
 *
 * @returns A unique customer email address
 *
 * @example
 * ```typescript
 * const email = generateCustomerEmail();
 * // Returns: customer-1234567890@example.com
 * ```
 */
export function generateCustomerEmail(): string {
  const timestamp = Date.now();
  return `customer-${timestamp}@example.com`;
}

/**
 * Customer data structure for creation
 */
export interface CustomerData {
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
 * Creates a customer via API
 * This is the preferred method for test data setup as it's faster and more reliable
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param customerData - Customer data (optional fields will use defaults)
 * @returns Created customer data including contactId
 *
 * @example
 * ```typescript
 * const customer = await createCustomerViaAPI(request, token, {
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email: 'john@example.com'
 * });
 * ```
 */
export async function createCustomerViaAPI(
  request: APIRequestContext,
  authToken: string,
  customerData: Partial<CustomerData> = {}
): Promise<CustomerData & { contactId: number }> {
  const apiUrl = getApiBaseUrl();
  const timestamp = Date.now();

  // Generate default values if not provided
  const defaultData: CustomerData = {
    firstName: customerData.firstName || 'Test',
    lastName: customerData.lastName || `Customer ${timestamp}`,
    email: customerData.email || generateCustomerEmail(),
    organization: customerData.organization || `Test Customer Org ${timestamp}`,
    mobileNumber: customerData.mobileNumber || '971501234567',
    currencyCode: customerData.currencyCode || 150, // AED default
    taxTreatmentId: customerData.taxTreatmentId || 7, // Unregistered default
    countryId: customerData.countryId || 229, // UAE default
    stateId: customerData.stateId || 3798, // Dubai default
    city: customerData.city || 'Dubai',
    postZipCode: customerData.postZipCode || '00000',
    address: customerData.address || 'Dubai Downtown',
    isBillingAndShippingAddressSame: customerData.isBillingAndShippingAddressSame ?? true,
    isRegisteredForVat: customerData.isRegisteredForVat ?? false,
  };

  // Set shipping address same as billing if not specified
  if (defaultData.isBillingAndShippingAddressSame) {
    defaultData.shippingCountryId = defaultData.countryId;
    defaultData.shippingStateId = defaultData.stateId;
    defaultData.shippingCity = defaultData.city;
    defaultData.shippingPostZipCode = defaultData.postZipCode;
    defaultData.shippingAddress = defaultData.address;
  } else {
    defaultData.shippingCountryId = customerData.shippingCountryId || defaultData.countryId;
    defaultData.shippingStateId = customerData.shippingStateId || defaultData.stateId;
    defaultData.shippingCity = customerData.shippingCity || defaultData.city;
    defaultData.shippingPostZipCode = customerData.shippingPostZipCode || defaultData.postZipCode;
    defaultData.shippingAddress = customerData.shippingAddress || defaultData.address;
  }

  const payload = {
    firstName: defaultData.firstName,
    lastName: defaultData.lastName,
    email: defaultData.email,
    organization: defaultData.organization,
    mobileNumber: defaultData.mobileNumber,
    telephone: defaultData.telephone || '',
    contactType: 1, // 1 = Customer, 2 = Supplier
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
    vatRegistrationNumber: customerData.vatRegistrationNumber || '',
    isRegisteredForVat: defaultData.isRegisteredForVat,
    isActive: true,
    ...customerData, // Allow overriding any field
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
    throw new Error(`Failed to create customer: ${response.status()} ${errorText}`);
  }

  const responseData = await response.json();
  return {
    ...defaultData,
    ...customerData,
    contactId: responseData.contactId || responseData.id,
  } as CustomerData & { contactId: number };
}

/**
 * Creates a customer via UI using the standardized contact creation helper
 * This is a fallback method if API creation is not available
 *
 * @param page - Playwright Page object
 * @param customerData - Customer data
 * @throws Error if creation fails
 *
 * @example
 * ```typescript
 * await createCustomerViaUI(page, {
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email: 'john@example.com'
 * });
 * ```
 */
export async function createCustomerViaUI(
  page: Page,
  customerData: Partial<CustomerData> = {}
): Promise<void> {
  const timestamp = Date.now();
  const defaultData: CustomerData = {
    firstName: customerData.firstName || 'Test',
    lastName: customerData.lastName || `Customer ${timestamp}`,
    email: customerData.email || generateCustomerEmail(),
    organization: customerData.organization || `Test Customer Org ${timestamp}`,
    mobileNumber: customerData.mobileNumber || '971501234567',
  };

  await createTestContact(page, defaultData.firstName, defaultData.lastName, defaultData.email, {
    contactType: 'CUSTOMER',
    phone: defaultData.mobileNumber,
    organization: defaultData.organization,
  });
}

/**
 * Creates a test customer using the preferred method (API first, UI fallback)
 *
 * @param request - Playwright APIRequestContext
 * @param page - Playwright Page object (used for login if API fails)
 * @param authToken - Optional authentication token (will login if not provided)
 * @param customerData - Customer data
 * @returns Created customer data
 *
 * @example
 * ```typescript
 * const customer = await createTestCustomer(request, page, token, {
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email: 'john@example.com'
 * });
 * ```
 */
export async function createTestCustomer(
  request: APIRequestContext,
  page: Page,
  authToken?: string,
  customerData: Partial<CustomerData> = {}
): Promise<CustomerData & { contactId: number }> {
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
    return await createCustomerViaAPI(request, token, customerData);
  } catch (error) {
    console.warn('API customer creation failed, falling back to UI:', error);
    // Fallback to UI creation
    await createCustomerViaUI(page, customerData);
    // Return partial data (no ID available from UI creation)
    const timestamp = Date.now();
    return {
      firstName: customerData.firstName || 'Test',
      lastName: customerData.lastName || `Customer ${timestamp}`,
      email: customerData.email || generateCustomerEmail(),
      contactId: 0, // UI creation doesn't return ID
    } as CustomerData & { contactId: number };
  }
}
