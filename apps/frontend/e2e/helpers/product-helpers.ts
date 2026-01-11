import { APIRequestContext, Page } from '@playwright/test';
import { getApiBaseUrl } from './test-setup-helpers';
import { loginTestUser } from './test-user-helpers';

/**
 * Generates a unique product code using the pattern: PRD-${Date.now()}
 */
export function generateProductCode(): string {
  return `PRD-${Date.now()}`;
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
  productType?: 'PRODUCT' | 'SERVICE';
  productPriceType?: 'FIXED' | 'VARIABLE';
  vatCategoryId?: number;
  productCategoryId?: number;
  salesUnitPrice?: number;
  purchaseUnitPrice?: number;
  salesDescription?: string;
  purchaseDescription?: string;
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
): Promise<ProductData & { productID: number }> {
  const apiUrl = getApiBaseUrl();

  const defaultData: ProductData = {
    productName: productData.productName || generateProductName(),
    productCode: productData.productCode || generateProductCode(),
    productType: productData.productType || 'PRODUCT',
    productPriceType: productData.productPriceType || 'FIXED',
    vatCategoryId: productData.vatCategoryId || 1,
    salesUnitPrice: productData.salesUnitPrice || 100,
    purchaseUnitPrice: productData.purchaseUnitPrice || 80,
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
    salesUnitPrice: defaultData.salesUnitPrice,
    purchaseUnitPrice: defaultData.purchaseUnitPrice,
    salesDescription:
      productData.salesDescription || `Sales description for ${defaultData.productName}`,
    purchaseDescription:
      productData.purchaseDescription || `Purchase description for ${defaultData.productName}`,
    isActive: defaultData.isActive,
    vatIncluded: defaultData.vatIncluded,
    isInventoryEnabled: defaultData.isInventoryEnabled,
    unitTypeId: defaultData.unitTypeId,
    ...productData,
  };

  const response = await request.post(`${apiUrl}/rest/product/save`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    data: payload,
  });

  if (!response.ok()) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to create product: ${response.status()} ${errorText}`);
  }

  const responseData = await response.json().catch(() => ({}));
  return {
    ...defaultData,
    ...productData,
    productID: (responseData && (responseData.productID || responseData.id)) || 0,
  } as ProductData & { productID: number };
}

export async function createTestProduct(
  request: APIRequestContext,
  page: Page,
  authToken?: string,
  productData: Partial<ProductData> = {}
): Promise<ProductData & { productID: number }> {
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
): Promise<ProductData & { productID: number }> {
  return createTestProduct(request, page, authToken, { ...serviceData, productType: 'SERVICE' });
}
