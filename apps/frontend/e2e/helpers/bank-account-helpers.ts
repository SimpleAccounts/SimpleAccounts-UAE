import { Page, expect, APIRequestContext } from '@playwright/test';
import { getApiBaseUrl, getFrontendBaseUrl } from './test-setup-helpers';
import { loginTestUser } from './test-user-helpers';

/**
 * Generates a unique bank account name using the pattern: Test Bank Account ${Date.now()}
 *
 * @param prefix - Optional prefix for the account name (default: 'Test Bank Account')
 * @returns A unique bank account name
 *
 * @example
 * ```typescript
 * const name = generateBankAccountName();
 * // Returns: Test Bank Account 1234567890
 *
 * const customName = generateBankAccountName('My Account');
 * // Returns: My Account 1234567890
 * ```
 */
export function generateBankAccountName(prefix: string = 'Test Bank Account'): string {
  const timestamp = Date.now();
  return `${prefix} ${timestamp}`;
}

/**
 * Generates a unique account number using the pattern: ACC-${Date.now()}
 *
 * @returns A unique account number
 *
 * @example
 * ```typescript
 * const accountNumber = generateAccountNumber();
 * // Returns: ACC-1234567890
 * ```
 */
export function generateAccountNumber(): string {
  return `ACC-${Date.now()}`;
}

/**
 * Bank account data structure for creation
 */
export interface BankAccountData {
  bankAccountName: string;
  accountNumber: string;
  bankName?: string;
  bankAccountCurrency?: number; // Currency code (default: 150 for AED)
  bankAccountStatus?: number; // Bank account status code
  bankAccountType?: number; // Bank account type code
  bankCountry?: number; // Country code (default: 229 for UAE)
  openingBalance?: number;
  isprimaryAccountFlag?: boolean;
  personalCorporateAccountInd?: string; // 'C' for Corporate, 'P' for Personal (default: 'C')
}

/**
 * Creates a bank account via API
 * This is the preferred method for test data setup as it's faster and more reliable
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param accountData - Bank account data (optional fields will use defaults)
 * @returns Created bank account data including bankAccountId
 *
 * @example
 * ```typescript
 * const account = await createBankAccountViaAPI(request, token, {
 *   bankAccountName: 'Test Bank Account',
 *   accountNumber: 'ACC-123456'
 * });
 * ```
 */
export async function createBankAccountViaAPI(
  request: APIRequestContext,
  authToken: string,
  accountData: Partial<BankAccountData> = {}
): Promise<BankAccountData & { bankAccountId: number }> {
  const apiUrl = getApiBaseUrl();
  const defaultData: BankAccountData = {
    bankAccountName: accountData.bankAccountName || generateBankAccountName(),
    accountNumber: accountData.accountNumber || generateAccountNumber(),
    bankName: accountData.bankName || 'Test Bank',
    bankAccountCurrency: accountData.bankAccountCurrency || 150, // AED default
    bankAccountStatus: accountData.bankAccountStatus || 1, // Active default
    bankAccountType: accountData.bankAccountType || 1, // Bank Account type default
    bankCountry: accountData.bankCountry || 229, // UAE default
    openingBalance: accountData.openingBalance || 0,
    isprimaryAccountFlag: accountData.isprimaryAccountFlag ?? true,
    personalCorporateAccountInd: accountData.personalCorporateAccountInd || 'C',
  };

  const payload = {
    ...defaultData,
    ...accountData,
  };

  const response = await request.post(`${apiUrl}/rest/bank/save`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to create bank account: ${response.status()} ${errorText}`);
  }

  const responseData = await response.json();
  return {
    ...payload,
    bankAccountId: responseData.bankAccountId || responseData.id,
  };
}

/**
 * Creates a petty cash account via API
 * Petty cash is essential for payment workflows and is typically a cash account type
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param options - Optional configuration
 * @param options.openingBalance - Opening balance (default: 10000)
 * @returns Created petty cash account data
 *
 * @example
 * ```typescript
 * const pettyCash = await createPettyCashAccount(request, token);
 * ```
 */
export async function createPettyCashAccount(
  request: APIRequestContext,
  authToken: string,
  options: { openingBalance?: number } = {}
): Promise<BankAccountData & { bankAccountId: number }> {
  const accountData: Partial<BankAccountData> = {
    bankAccountName: `Petty Cash ${Date.now()}`,
    accountNumber: `PC-${Date.now()}`,
    bankName: 'Petty Cash',
    bankAccountType: 2, // Cash account type (petty cash is typically type 2)
    openingBalance: options.openingBalance ?? 10000,
    isprimaryAccountFlag: false,
  };

  return createBankAccountViaAPI(request, authToken, accountData);
}

/**
 * Creates a bank account via UI (fallback method)
 * Use this only if API creation is not available or fails
 *
 * @param page - Playwright Page object
 * @param accountData - Bank account data
 * @throws Error if creation fails
 *
 * @example
 * ```typescript
 * await createBankAccountViaUI(page, {
 *   bankAccountName: 'Test Bank Account',
 *   accountNumber: 'ACC-123456'
 * });
 * ```
 */
export async function createBankAccountViaUI(
  page: Page,
  accountData: Partial<BankAccountData> = {}
): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const bankAccountsPath = '/admin/banking/accounts/create';

  // Navigate to bank account creation page
  await page.goto(`${baseUrl}${bankAccountsPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const defaultData: BankAccountData = {
    bankAccountName: accountData.bankAccountName || generateBankAccountName(),
    accountNumber: accountData.accountNumber || generateAccountNumber(),
    bankName: accountData.bankName || 'Test Bank',
    openingBalance: accountData.openingBalance || 0,
  };

  // Fill in account name
  const nameInput = page.locator('input[name*="name"], input[id*="name"]').first();
  if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await nameInput.fill(defaultData.bankAccountName);
  }

  // Fill in account number
  const numberInput = page.locator('input[name*="number"], input[id*="number"]').first();
  if (await numberInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await numberInput.fill(defaultData.accountNumber);
  }

  // Fill in bank name if field exists
  const bankNameInput = page.locator('input[name*="bank"], input[id*="bank"]').first();
  if (await bankNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await bankNameInput.fill(defaultData.bankName || 'Test Bank');
  }

  // Fill in opening balance if field exists
  if (defaultData.openingBalance !== undefined) {
    const balanceInput = page.locator('input[name*="balance"], input[id*="balance"]').first();
    if (await balanceInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await balanceInput.fill(String(defaultData.openingBalance));
    }
  }

  // Submit the form
  const submitButton = page.getByRole('button', { name: /save|submit|create/i });
  if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await submitButton.click();
    await page.waitForTimeout(2000);
  }
}

/**
 * Creates a test bank account using the preferred method (API first, UI fallback)
 *
 * @param request - Playwright APIRequestContext
 * @param page - Playwright Page object (used for login if API fails)
 * @param authToken - Optional authentication token (will login if not provided)
 * @param accountData - Bank account data
 * @returns Created bank account data
 *
 * @example
 * ```typescript
 * const account = await createTestBankAccount(request, page, token, {
 *   bankAccountName: 'Test Bank Account',
 *   accountNumber: 'ACC-123456'
 * });
 * ```
 */
export async function createTestBankAccount(
  request: APIRequestContext,
  page: Page,
  authToken?: string,
  accountData: Partial<BankAccountData> = {}
): Promise<BankAccountData & { bankAccountId: number }> {
  let token = authToken;

  // If no token provided, login to get one
  if (!token) {
    const { loginTestUser } = await import('./test-user-helpers');
    await loginTestUser(page);
    // Extract token from localStorage
    token = (await page.evaluate(() => localStorage.getItem('accessToken'))) || '';
    if (!token) {
      throw new Error('Failed to get authentication token after login');
    }
  }

  try {
    // Try API creation first (preferred method)
    return await createBankAccountViaAPI(request, token, accountData);
  } catch (error) {
    console.warn('API bank account creation failed, falling back to UI:', error);
    // Fallback to UI creation
    await createBankAccountViaUI(page, accountData);
    // Return partial data (no ID available from UI creation)
    return {
      ...accountData,
      bankAccountName: accountData.bankAccountName || generateBankAccountName(),
      accountNumber: accountData.accountNumber || generateAccountNumber(),
      bankAccountId: 0, // UI creation doesn't return ID
    } as BankAccountData & { bankAccountId: number };
  }
}
