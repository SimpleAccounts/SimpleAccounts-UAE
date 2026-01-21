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

  // Add openingDate if not provided (required by backend - must be LocalDateTime format)
  const today = new Date();
  const openingDate =
    accountData.openingDate ||
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T00:00:00`;

  const finalPayload = {
    ...payload,
    openingDate: openingDate,
  };

  const response = await request.post(`${apiUrl}/rest/bank/save`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    data: finalPayload,
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    console.error('Bank account creation failed:', {
      status: response.status(),
      error: errorText,
      payload: finalPayload,
    });
    throw new Error(`Failed to create bank account: ${response.status()} ${errorText}`);
  }

  const responseData = await response.json().catch(() => ({}));
  console.log('Bank account creation response:', responseData);
  let bankAccountId = responseData.bankAccountId || responseData.id || 0;

  if (!bankAccountId) {
    console.log('Bank account ID not in response, fetching from list...');
    // Wait for DB sync if needed
    await new Promise(resolve => setTimeout(resolve, 3000));
    try {
      const listResponse = await request.get(
        `${apiUrl}/rest/bank/list?paginationDisable=true&bankAccountName=${encodeURIComponent(payload.bankAccountName)}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (listResponse.ok()) {
        const listData = await listResponse.json();
        console.log(
          'Bank account list received for filter, count:',
          listData.data?.length || listData.length
        );
        const items = Array.isArray(listData) ? listData : listData.data || [];
        const account = items.find(
          (a: any) =>
            a.bankAccountName === payload.bankAccountName ||
            a.name === payload.bankAccountName ||
            a.accounName === payload.bankAccountName
        );
        if (account) {
          bankAccountId = account.bankAccountId || account.id || 0;
          console.log('Found bank account in filtered list, ID:', bankAccountId);
        }
      }
    } catch (error) {
      console.warn('Could not retrieve bank account ID after creation:', error);
    }
  }

  return {
    ...payload,
    bankAccountId: bankAccountId,
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
/**
 * Transaction data structure for creation
 */
export interface TransactionData {
  bankId: number;
  transactionDate: string; // Format: DD-MM-YYYY
  transactionAmount: number;
  transactionType: string; // 'DEPOSIT' or 'WITHDRAWAL'
  description?: string;
  referenceNumber?: string;
  chartOfAccountId?: number;
  transactionCategoryId?: number;
  coaCategoryId?: number;
}

/**
 * Creates a deposit transaction via API
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param transactionData - Transaction data
 * @returns Created transaction response
 *
 * @example
 * ```typescript
 * const deposit = await createDepositTransaction(request, token, {
 *   bankId: 1,
 *   transactionDate: '01-01-2024',
 *   transactionAmount: 1000
 * });
 * ```
 */
export async function createDepositTransaction(
  request: APIRequestContext,
  authToken: string,
  transactionData: Partial<TransactionData> & { bankId: number; transactionAmount: number }
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

  const payload = {
    bankId: transactionData.bankId,
    transactionDate: transactionData.transactionDate || formattedDate,
    transactionAmount: transactionData.transactionAmount,
    transactionType: 'DEPOSIT',
    description: transactionData.description || `Test Deposit ${Date.now()}`,
    referenceNumber: transactionData.referenceNumber || `DEP-${Date.now()}`,
    chartOfAccountId: transactionData.chartOfAccountId || '',
    transactionCategoryId: transactionData.transactionCategoryId || '',
    coaCategoryId: transactionData.coaCategoryId || '',
  };

  const formData = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, String(value));
    }
  });

  const response = await request.post(`${apiUrl}/rest/transaction/save`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: formData.toString(),
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to create deposit transaction: ${response.status()} ${errorText}`);
  }

  return await response.text();
}

/**
 * Creates a withdrawal transaction via API
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param transactionData - Transaction data
 * @returns Created transaction response
 *
 * @example
 * ```typescript
 * const withdrawal = await createWithdrawalTransaction(request, token, {
 *   bankId: 1,
 *   transactionDate: '01-01-2024',
 *   transactionAmount: 500
 * });
 * ```
 */
export async function createWithdrawalTransaction(
  request: APIRequestContext,
  authToken: string,
  transactionData: Partial<TransactionData> & { bankId: number; transactionAmount: number }
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

  const payload = {
    bankId: transactionData.bankId,
    transactionDate: transactionData.transactionDate || formattedDate,
    transactionAmount: transactionData.transactionAmount,
    transactionType: 'WITHDRAWAL',
    description: transactionData.description || `Test Withdrawal ${Date.now()}`,
    referenceNumber: transactionData.referenceNumber || `WD-${Date.now()}`,
    chartOfAccountId: transactionData.chartOfAccountId || '',
    transactionCategoryId: transactionData.transactionCategoryId || '',
    coaCategoryId: transactionData.coaCategoryId || '',
  };

  const formData = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, String(value));
    }
  });

  const response = await request.post(`${apiUrl}/rest/transaction/save`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: formData.toString(),
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to create withdrawal transaction: ${response.status()} ${errorText}`);
  }

  return await response.text();
}

/**
 * Gets transaction list for a bank account
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param bankId - Bank account ID
 * @param options - Optional filters
 * @returns Transaction list response
 *
 * @example
 * ```typescript
 * const transactions = await getTransactionList(request, token, 1, {
 *   transactionType: 'DEPOSIT'
 * });
 * ```
 */
export async function getTransactionList(
  request: APIRequestContext,
  authToken: string,
  bankId: number,
  options: {
    transactionType?: string;
    transactionDate?: string;
    chartOfAccountId?: number;
    pageNo?: number;
    pageSize?: number;
    paginationDisable?: boolean;
  } = {}
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  let url = `${apiUrl}/rest/transaction/list?bankId=${bankId}`;

  if (options.transactionType) {
    url += `&transactionType=${options.transactionType}`;
  }
  if (options.transactionDate) {
    url += `&transactionDate=${options.transactionDate}`;
  }
  if (options.chartOfAccountId) {
    url += `&chartOfAccountId=${options.chartOfAccountId}`;
  }
  if (options.pageNo) {
    url += `&pageNo=${options.pageNo}`;
  }
  if (options.pageSize) {
    url += `&pageSize=${options.pageSize}`;
  }
  if (options.paginationDisable) {
    url += `&paginationDisable=${options.paginationDisable}`;
  }

  const response = await request.get(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get transaction list: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Gets bank account details including current balance
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param bankId - Bank account ID
 * @returns Bank account details
 *
 * @example
 * ```typescript
 * const account = await getBankAccountDetails(request, token, 1);
 * const balance = account.currentBalance;
 * ```
 */
export async function getBankAccountDetails(
  request: APIRequestContext,
  authToken: string,
  bankId: number
): Promise<any> {
  const apiUrl = getApiBaseUrl();
  const response = await request.get(`${apiUrl}/rest/bank/getbyid?id=${bankId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to get bank account details: ${response.status()} ${errorText}`);
  }

  return await response.json();
}

/**
 * Verifies bank account balance matches expected amount
 *
 * @param request - Playwright APIRequestContext for making API calls
 * @param authToken - Authentication token
 * @param bankId - Bank account ID
 * @param expectedBalance - Expected balance amount
 * @returns True if balance matches, throws error otherwise
 *
 * @example
 * ```typescript
 * await verifyBankAccountBalance(request, token, 1, 5000);
 * ```
 */
export async function verifyBankAccountBalance(
  request: APIRequestContext,
  authToken: string,
  bankId: number,
  expectedBalance: number
): Promise<boolean> {
  const account = await getBankAccountDetails(request, authToken, bankId);
  const currentBalance = parseFloat(account.currentBalance || account.balance || 0);

  if (Math.abs(currentBalance - expectedBalance) > 0.01) {
    throw new Error(
      `Bank account balance mismatch. Expected: ${expectedBalance}, Actual: ${currentBalance}`
    );
  }

  return true;
}

/**
 * Navigates to bank account transactions page
 *
 * @param page - Playwright Page object
 * @param bankId - Bank account ID
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToBankTransactions(page, 1);
 * ```
 */
export async function navigateToBankTransactions(page: Page, bankId: number): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const transactionsPath = `/admin/banking/accounts/${bankId}/transactions`;
  await page.goto(`${baseUrl}${transactionsPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Navigates to bank statement page
 *
 * @param page - Playwright Page object
 * @param bankId - Bank account ID
 * @throws Error if navigation fails
 *
 * @example
 * ```typescript
 * await navigateToBankStatement(page, 1);
 * ```
 */
export async function navigateToBankStatement(page: Page, bankId: number): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const statementPath = `/admin/banking/accounts/${bankId}/statement`;
  await page.goto(`${baseUrl}${statementPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

/**
 * Creates a deposit transaction via UI (fallback method)
 *
 * @param page - Playwright Page object
 * @param transactionData - Transaction data
 * @throws Error if creation fails
 *
 * @example
 * ```typescript
 * await createDepositTransactionViaUI(page, {
 *   bankId: 1,
 *   transactionAmount: 1000
 * });
 * ```
 */
export async function createDepositTransactionViaUI(
  page: Page,
  transactionData: Partial<TransactionData> & { bankId: number; transactionAmount: number }
): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const createPath = `/admin/banking/accounts/${transactionData.bankId}/transactions/create`;

  await page.goto(`${baseUrl}${createPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Select transaction type as DEPOSIT
  const transactionTypeSelect = page
    .locator('select[name*="transactionType"], select[name*="type"]')
    .first();
  if (await transactionTypeSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
    await transactionTypeSelect.selectOption('DEPOSIT');
  }

  // Fill in amount
  const amountInput = page.locator('input[name*="amount"], input[id*="amount"]').first();
  if (await amountInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await amountInput.fill(String(transactionData.transactionAmount));
  }

  // Fill in description if provided
  if (transactionData.description) {
    const descInput = page
      .locator('textarea[name*="description"], input[name*="description"]')
      .first();
    if (await descInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await descInput.fill(transactionData.description);
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
 * Creates a withdrawal transaction via UI (fallback method)
 *
 * @param page - Playwright Page object
 * @param transactionData - Transaction data
 * @throws Error if creation fails
 *
 * @example
 * ```typescript
 * await createWithdrawalTransactionViaUI(page, {
 *   bankId: 1,
 *   transactionAmount: 500
 * });
 * ```
 */
export async function createWithdrawalTransactionViaUI(
  page: Page,
  transactionData: Partial<TransactionData> & { bankId: number; transactionAmount: number }
): Promise<void> {
  const baseUrl = getFrontendBaseUrl();
  const createPath = `/admin/banking/accounts/${transactionData.bankId}/transactions/create`;

  await page.goto(`${baseUrl}${createPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Select transaction type as WITHDRAWAL
  const transactionTypeSelect = page
    .locator('select[name*="transactionType"], select[name*="type"]')
    .first();
  if (await transactionTypeSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
    await transactionTypeSelect.selectOption('WITHDRAWAL');
  }

  // Fill in amount
  const amountInput = page.locator('input[name*="amount"], input[id*="amount"]').first();
  if (await amountInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await amountInput.fill(String(transactionData.transactionAmount));
  }

  // Fill in description if provided
  if (transactionData.description) {
    const descInput = page
      .locator('textarea[name*="description"], input[name*="description"]')
      .first();
    if (await descInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await descInput.fill(transactionData.description);
    }
  }

  // Submit the form
  const submitButton = page.getByRole('button', { name: /save|submit|create/i });
  if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await submitButton.click();
    await page.waitForTimeout(2000);
  }
}
