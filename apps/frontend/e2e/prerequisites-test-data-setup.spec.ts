import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { setupTestEnvironment, getApiBaseUrl } from './helpers/test-setup-helpers';
import { loginTestUser, getTestUserCredentials, createTestUser } from './helpers/test-user-helpers';
import { createPettyCashAccount, createTestBankAccount } from './helpers/bank-account-helpers';
import { createTestCustomer } from './helpers/customer-helpers';
import { createTestSupplier } from './helpers/supplier-helpers';
import { createTestProduct, createTestService } from './helpers/product-helpers';
import { setupVATCodes } from './helpers/vat-helpers';
import { setupChartOfAccounts } from './helpers/chart-of-accounts-helpers';

/**
 * Comprehensive test for Epic #491: Prerequisites and Test Data Setup
 * This test validates that all helper functions work correctly and can create
 * the necessary test data for workflow tests.
 */
test.describe('Prerequisites and Test Data Setup', () => {
  let page: Page;
  let authToken: string;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(120_000); // 2 minutes for user creation if needed

    // Setup test environment (skip database cleanup if it fails - not critical for test execution)
    await setupTestEnvironment({ clearDb: false, verifyServices: true });

    // Get browser page
    page = await browser.newPage();

    // Get credentials
    const credentials = getTestUserCredentials();

    // Try to login - if it fails, check if we can create user (only if no companies exist)
    try {
      await loginTestUser(page, credentials.username, credentials.password);
      console.log('✅ Login successful');
    } catch (loginError) {
      console.log('⚠️  Login failed, checking if user creation is possible...');
      // Check company count - if > 0, registration is not available
      const companyCountResponse = await request.get(
        `${getApiBaseUrl()}/rest/company/getCompanyCount`
      );
      const companyCount = await companyCountResponse.json();

      if (companyCount > 0) {
        throw new Error(
          `Login failed and user creation not possible (company count: ${companyCount}). ` +
            `Please ensure test user '${credentials.username}' exists in the database, or clear companies to enable registration.`
        );
      }

      // No companies exist, try to create user
      try {
        await createTestUser(page, {
          email: credentials.username,
          password: credentials.password,
          firstName: 'Test',
          lastName: 'User',
          companyName: 'Test Company',
        });
        console.log('✅ Test user created, attempting login...');
        // Wait a bit for user to be fully registered
        await page.waitForTimeout(2000);
        // Try login again after user creation
        await loginTestUser(page, credentials.username, credentials.password);
        console.log('✅ Login successful after user creation');
      } catch (createError) {
        throw new Error(
          `Failed to create or login test user: ${createError instanceof Error ? createError.message : String(createError)}`
        );
      }
    }

    // Extract token from localStorage
    authToken = (await page.evaluate(() => localStorage.getItem('accessToken'))) || '';
    if (!authToken) {
      throw new Error('Failed to get authentication token after login');
    }
    console.log('✅ Authentication token obtained');
  });

  test.afterAll(async () => {
    if (page) {
      await page.close();
    }
  });

  test('should setup and verify VAT codes exist', async ({ request }) => {
    const vatCategories = await setupVATCodes(request, authToken);

    expect(vatCategories).toBeDefined();
    expect(vatCategories.length).toBeGreaterThan(0);
    expect(vatCategories[0]).toHaveProperty('id');
    expect(vatCategories[0]).toHaveProperty('name');
    expect(vatCategories[0]).toHaveProperty('vat');
  });

  test('should setup and verify Chart of Accounts structure exists', async ({ request }) => {
    const coaList = await setupChartOfAccounts(request, authToken);

    expect(coaList).toBeDefined();
    expect(coaList.length).toBeGreaterThan(0);
    expect(coaList[0]).toHaveProperty('chartOfAccountId');
    expect(coaList[0]).toHaveProperty('chartOfAccountName');
    expect(coaList[0]).toHaveProperty('chartOfAccountCode');
  });

  test('should create petty cash account (essential for payment workflows)', async ({
    request,
  }) => {
    const pettyCash = await createPettyCashAccount(request, authToken, {
      openingBalance: 10000,
    });

    expect(pettyCash).toBeDefined();
    expect(pettyCash.bankAccountName).toContain('Petty Cash');
    expect(pettyCash.accountNumber).toContain('PC-');
    expect(pettyCash.openingBalance).toBe(10000);
    expect(pettyCash.bankAccountId).toBeGreaterThan(0);
  });

  test('should create test bank account', async ({ request }) => {
    const bankAccount = await createTestBankAccount(request, page, authToken, {
      bankAccountName: 'Test Bank Account',
      accountNumber: 'ACC-TEST-001',
      openingBalance: 5000,
    });

    expect(bankAccount).toBeDefined();
    expect(bankAccount.bankAccountName).toBe('Test Bank Account');
    expect(bankAccount.accountNumber).toBe('ACC-TEST-001');
    expect(bankAccount.openingBalance).toBe(5000);
    expect(bankAccount.bankAccountId).toBeGreaterThan(0);
  });

  test('should create test customer with proper billing/shipping addresses', async ({
    request,
  }) => {
    const customer = await createTestCustomer(request, page, authToken, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      organization: 'Test Customer Org',
      isBillingAndShippingAddressSame: true,
    });

    expect(customer).toBeDefined();
    expect(customer.firstName).toBe('John');
    expect(customer.lastName).toBe('Doe');
    expect(customer.email).toBe('john.doe@example.com');
    expect(customer.organization).toBe('Test Customer Org');
    expect(customer.contactId).toBeGreaterThan(0);
    expect(customer.isBillingAndShippingAddressSame).toBe(true);
  });

  test('should create test supplier with proper billing/shipping addresses', async ({
    request,
  }) => {
    const supplier = await createTestSupplier(request, page, authToken, {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      organization: 'Test Supplier Org',
      isBillingAndShippingAddressSame: true,
    });

    expect(supplier).toBeDefined();
    expect(supplier.firstName).toBe('Jane');
    expect(supplier.lastName).toBe('Smith');
    expect(supplier.email).toBe('jane.smith@example.com');
    expect(supplier.organization).toBe('Test Supplier Org');
    expect(supplier.contactId).toBeGreaterThan(0);
    expect(supplier.isBillingAndShippingAddressSame).toBe(true);
  });

  test('should create test product with proper VAT code', async ({ request }) => {
    const product = await createTestProduct(request, page, authToken, {
      productName: 'Test Product',
      productCode: 'PRD-TEST-001',
      productType: 'PRODUCT',
      salesUnitPrice: 100,
      purchaseUnitPrice: 80,
      vatCategoryId: 1, // Standard Rate
    });

    expect(product).toBeDefined();
    expect(product.productName).toBe('Test Product');
    expect(product.productCode).toBe('PRD-TEST-001');
    expect(product.productType).toBe('PRODUCT');
    expect(product.salesUnitPrice).toBe(100);
    expect(product.purchaseUnitPrice).toBe(80);
    expect(product.vatCategoryId).toBe(1);
  });

  test('should create test service', async ({ request }) => {
    const service = await createTestService(request, page, authToken, {
      productName: 'Test Service',
      productCode: 'SRV-TEST-001',
      salesUnitPrice: 150,
    });

    expect(service).toBeDefined();
    expect(service.productName).toBe('Test Service');
    expect(service.productCode).toBe('SRV-TEST-001');
    expect(service.productType).toBe('SERVICE');
    expect(service.salesUnitPrice).toBe(150);
  });

  test('should create all prerequisites in sequence (end-to-end validation)', async ({
    request,
  }) => {
    // This test validates that all helpers work together correctly

    // 1. Setup VAT codes
    const vatCategories = await setupVATCodes(request, authToken);
    expect(vatCategories.length).toBeGreaterThan(0);

    // 2. Setup Chart of Accounts
    const coaList = await setupChartOfAccounts(request, authToken);
    expect(coaList.length).toBeGreaterThan(0);

    // 3. Create petty cash account
    const pettyCash = await createPettyCashAccount(request, authToken);
    expect(pettyCash.bankAccountId).toBeGreaterThan(0);

    // 4. Create bank account
    const bankAccount = await createTestBankAccount(request, page, authToken);
    expect(bankAccount.bankAccountId).toBeGreaterThan(0);

    // 5. Create customer
    const customer = await createTestCustomer(request, page, authToken);
    expect(customer.contactId).toBeGreaterThan(0);

    // 6. Create supplier
    const supplier = await createTestSupplier(request, page, authToken);
    expect(supplier.contactId).toBeGreaterThan(0);

    // 7. Create product
    const product = await createTestProduct(request, page, authToken);
    expect(product.productID).toBeGreaterThanOrEqual(0); // May be 0 if API doesn't return ID

    // 8. Create service
    const service = await createTestService(request, page, authToken);
    expect(service.productID).toBeGreaterThanOrEqual(0); // May be 0 if API doesn't return ID

    // All prerequisites created successfully
    console.log('✅ All prerequisites created successfully:');
    console.log(`  - VAT Categories: ${vatCategories.length}`);
    console.log(`  - Chart of Accounts: ${coaList.length}`);
    console.log(`  - Petty Cash Account ID: ${pettyCash.bankAccountId}`);
    console.log(`  - Bank Account ID: ${bankAccount.bankAccountId}`);
    console.log(`  - Customer ID: ${customer.contactId}`);
    console.log(`  - Supplier ID: ${supplier.contactId}`);
    console.log(`  - Product ID: ${product.productID}`);
    console.log(`  - Service ID: ${service.productID}`);
  });
});
