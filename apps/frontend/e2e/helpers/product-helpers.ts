import { APIRequestContext, Page } from '@playwright/test';
import { getApiBaseUrl } from './test-setup-helpers';
import { loginTestUser } from './test-user-helpers';

/**
 * Generates a unique product code using the pattern: PRD-${Date.now()}
 */
export function generateProductCode(): string {
  // Backend parses the numeric suffix into an Integer (see ProductRestHelper),
  // so we must keep it within 32-bit int range.
  const suffix = Date.now() % 1_000_000_000; // < 1e9
  return `PRD-${suffix}`;
}

/**
 * Generates a unique product name using the pattern: Test Product ${Date.now()}
 */
export function generateProductName(prefix: string = 'Test Product'): string {
  const timestamp = Date.now();
  return `${prefix} ${timestamp}`;
}

export interface ProductData {
  productName: string;
  productCode: string;
  productType?: 'GOODS' | 'SERVICE';
  productPriceType?: 'SALES' | 'PURCHASE' | 'BOTH';
  vatCategoryId?: number;
  productCategoryId?: number;
  salesUnitPrice?: number;
  purchaseUnitPrice?: number;
  salesDescription?: string;
  purchaseDescription?: string;
  salesTransactionCategoryId?: number;
  purchaseTransactionCategoryId?: number;
  transactionCategoryId?: number;
  exciseTaxId?: number;
  isActive?: boolean;
  vatIncluded?: boolean;
  isInventoryEnabled?: boolean;
  unitTypeId?: number;
}

/**
 * Creates a product/service via API.
 * Note: `/rest/product/save` may return a message rather than the created entity.
 */
export async function createProductViaAPI(
  request: APIRequestContext,
  authToken: string,
  productData: Partial<ProductData> = {}
): Promise<ProductData & { productId: number }> {
  const apiUrl = getApiBaseUrl();

  const defaultData: ProductData = {
    productName: productData.productName || generateProductName(),
    productCode: productData.productCode || generateProductCode(),
    productType: productData.productType || 'GOODS',
    productPriceType: productData.productPriceType || 'BOTH',
    vatCategoryId: productData.vatCategoryId || 1,
    salesUnitPrice: productData.salesUnitPrice || 100,
    purchaseUnitPrice: productData.purchaseUnitPrice || 80,
    salesTransactionCategoryId: productData.salesTransactionCategoryId || 84, // "Sales"
    purchaseTransactionCategoryId: productData.purchaseTransactionCategoryId || 49, // "Cost of Goods Sold"
    transactionCategoryId: productData.transactionCategoryId || 150, // "Inventory Asset"
    isActive: productData.isActive ?? true,
    vatIncluded: productData.vatIncluded ?? false,
    isInventoryEnabled: productData.isInventoryEnabled ?? false,
    unitTypeId: productData.unitTypeId || 40,
  };

  const payload = {
    productName: defaultData.productName,
    productCode: defaultData.productCode,
    productType: defaultData.productType,
    productPriceType: defaultData.productPriceType,
    vatCategoryId: defaultData.vatCategoryId,
    productCategoryId: productData.productCategoryId || null,
    transactionCategoryId: defaultData.transactionCategoryId,
    salesUnitPrice: defaultData.salesUnitPrice,
    purchaseUnitPrice: defaultData.purchaseUnitPrice,
    salesDescription:
      productData.salesDescription || `Sales description for ${defaultData.productName}`,
    purchaseDescription:
      productData.purchaseDescription || `Purchase description for ${defaultData.productName}`,
    salesTransactionCategoryId: defaultData.salesTransactionCategoryId,
    purchaseTransactionCategoryId: defaultData.purchaseTransactionCategoryId,
    isActive: defaultData.isActive,
    vatIncluded: defaultData.vatIncluded,
    isInventoryEnabled: defaultData.isInventoryEnabled,
    unitTypeId: defaultData.unitTypeId,
    ...productData,
  };

  // Only include excise fields when explicitly configured; passing `0` triggers backend lookups and can NPE.
  if (productData.exciseTaxId && productData.exciseTaxId > 0) {
    (payload as any).exciseTaxId = productData.exciseTaxId;
    (payload as any).exciseTaxCheck = true;
  }

  const response = await request.post(`${apiUrl}/rest/product/save`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    console.error('Product creation failed:', {
      status: response.status(),
      error: errorText,
      payload: payload,
    });
    throw new Error(`Failed to create product: ${response.status()} ${errorText}`);
  }

  const responseData = await response.json().catch(() => ({}));
  console.log('Product creation response:', responseData);
  let productId = responseData?.productId || responseData?.id || responseData?.productID || 0;

  // If ID is missing, fetch it from the list by name
  if (!productId) {
    console.log('Product ID not in response, fetching from list...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    try {
      // Try both endpoints
      const urls = [
        `${apiUrl}/rest/product/getList?paginationDisable=true&name=${encodeURIComponent(payload.productName)}`,
        `${apiUrl}/rest/datalist/product?priceType=${payload.productPriceType || 'BOTH'}`,
      ];

      for (const url of urls) {
        const listResponse = await request.get(url, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (listResponse.ok()) {
          const listData = await listResponse.json();
          console.log(`Product list received from ${url}, count:`, Array.isArray(listData) ? listData.length : listData.data?.length);
          const items = Array.isArray(listData) ? listData : listData.data || [];
          const product = items.find(
            (p: any) => p.name === payload.productName || p.productName === payload.productName
          );
          if (product) {
            productId = product.id || product.productId || product.productID || 0;
            console.log('Found product in list, ID:', productId);
            if (productId) break;
          }
        }
      }
    } catch (error) {
      console.warn('Could not retrieve product ID after creation:', error);
    }
  }

  if (!productId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const listResponse = await request.get(
        `${apiUrl}/rest/product/getList?paginationDisable=true`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (listResponse.ok()) {
        const listData = await listResponse.json();
        const items = Array.isArray(listData) ? listData : listData.data || [];
        const product = items.find(
          (p: any) =>
            p.productName === payload.productName ||
            p.name === payload.productName ||
            p.productCode === payload.productCode ||
            p.code === payload.productCode
        );
        if (product) {
          productId = product.id || product.productId || product.productID || 0;
          console.log('Found product in full list, ID:', productId);
        }
      }
    } catch (error) {
      console.warn('Could not retrieve product ID from full list:', error);
    }
  }

  if (!productId) {
    throw new Error(`Product was created but could not retrieve its ID: ${payload.productName}`);
  }

  return {
    ...defaultData,
    ...productData,
    productId: productId,
  } as ProductData & { productId: number };
}

export async function createTestProduct(
  request: APIRequestContext,
  page: Page,
  authToken?: string,
  productData: Partial<ProductData> = {}
): Promise<ProductData & { productId: number }> {
  let token = authToken;
  if (!token) {
    await loginTestUser(page);
    token = (await page.evaluate(() => localStorage.getItem('accessToken'))) || '';
    if (!token) throw new Error('Failed to get authentication token after login');
  }
  return await createProductViaAPI(request, token, productData);
}

export async function createTestService(
  request: APIRequestContext,
  page: Page,
  authToken?: string,
  serviceData: Partial<ProductData> = {}
): Promise<ProductData & { productId: number }> {
  return createTestProduct(request, page, authToken, { ...serviceData, productType: 'SERVICE' });
}
