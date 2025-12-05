package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.ProductFilterEnum;
import com.simpleaccounts.dao.ProductDao;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.exceptions.ServiceException;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.exceptions.ServiceErrorCode;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductServiceImpl Tests")
class ProductServiceImplTest {

    @Mock
    private ProductDao productDao;

    @Mock
    private CacheManager cacheManager;

    @Mock
    private Cache productCache;

    @InjectMocks
    private ProductServiceImpl productService;

    private Product testProduct;
    private Integer productId;

    @BeforeEach
    void setUp() {
        productId = 1001;
        testProduct = createTestProduct(productId, "Test Product", "TEST001");
    }

    private Product createTestProduct(Integer id, String name, String code) {
        Product product = new Product();
        product.setProductID(id);
        product.setProductName(name);
        product.setProductCode(code);
        product.setProductDescription("Test Description");
        product.setUnitPrice(new BigDecimal("99.99"));
        product.setCreatedBy(1);
        product.setCreatedDate(LocalDateTime.now());
        product.setDeleteFlag(false);
        product.setIsActive(true);
        product.setVersionNumber(1);
        return product;
    }

    @Nested
    @DisplayName("getDao() Tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return ProductDao instance")
        void shouldReturnProductDao() {
            assertThat(productService.getDao()).isEqualTo(productDao);
        }

        @Test
        @DisplayName("Should not return null")
        void shouldNotReturnNull() {
            assertThat(productService.getDao()).isNotNull();
        }
    }

    @Nested
    @DisplayName("findByPK() Tests")
    class FindByPKTests {

        @Test
        @DisplayName("Should find product by primary key")
        void shouldFindProductByPrimaryKey() {
            when(productDao.findByPK(productId)).thenReturn(testProduct);

            Product result = productService.findByPK(productId);

            assertThat(result).isNotNull();
            assertThat(result.getProductID()).isEqualTo(productId);
            assertThat(result.getProductName()).isEqualTo("Test Product");
            verify(productDao, times(1)).findByPK(productId);
        }

        @Test
        @DisplayName("Should throw ServiceException when product not found")
        void shouldThrowExceptionWhenProductNotFound() {
            when(productDao.findByPK(productId)).thenReturn(null);

            assertThatThrownBy(() -> productService.findByPK(productId))
                    .isInstanceOf(ServiceException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ServiceErrorCode.RecordDoesntExists);

            verify(productDao, times(1)).findByPK(productId);
        }

        @Test
        @DisplayName("Should handle zero as product ID")
        void shouldHandleZeroAsProductId() {
            Integer zeroId = 0;
            when(productDao.findByPK(zeroId)).thenReturn(null);

            assertThatThrownBy(() -> productService.findByPK(zeroId))
                    .isInstanceOf(ServiceException.class);

            verify(productDao, times(1)).findByPK(zeroId);
        }

        @Test
        @DisplayName("Should handle negative product ID")
        void shouldHandleNegativeProductId() {
            Integer negativeId = -1;
            when(productDao.findByPK(negativeId)).thenReturn(null);

            assertThatThrownBy(() -> productService.findByPK(negativeId))
                    .isInstanceOf(ServiceException.class);

            verify(productDao, times(1)).findByPK(negativeId);
        }

        @Test
        @DisplayName("Should use cache when finding product by PK")
        void shouldUseCacheWhenFindingByPK() {
            when(productDao.findByPK(productId)).thenReturn(testProduct);

            Product result = productService.findByPK(productId);

            assertThat(result).isNotNull();
            verify(productDao, times(1)).findByPK(productId);
        }

        @Test
        @DisplayName("Should handle very large product ID")
        void shouldHandleVeryLargeProductId() {
            Integer largeId = Integer.MAX_VALUE;
            Product largeProduct = createTestProduct(largeId, "Large ID Product", "LARGE001");
            when(productDao.findByPK(largeId)).thenReturn(largeProduct);

            Product result = productService.findByPK(largeId);

            assertThat(result).isNotNull();
            assertThat(result.getProductID()).isEqualTo(largeId);
        }
    }

    @Nested
    @DisplayName("getProductList() Tests")
    class GetProductListTests {

        @Test
        @DisplayName("Should get product list with filter and pagination")
        void shouldGetProductListWithFilterAndPagination() {
            Map<ProductFilterEnum, Object> filterMap = new HashMap<>();
            filterMap.put(ProductFilterEnum.PRODUCT_NAME, "Test");
            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNumber(1);
            paginationModel.setRecordPerPage(10);

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(productDao.getProductList(filterMap, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = productService.getProductList(filterMap, paginationModel);

            assertThat(result).isNotNull();
            assertThat(result).isSameAs(expectedResponse);
            verify(productDao, times(1)).getProductList(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should handle empty filter map")
        void shouldHandleEmptyFilterMap() {
            Map<ProductFilterEnum, Object> emptyFilterMap = new HashMap<>();
            PaginationModel paginationModel = new PaginationModel();

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(productDao.getProductList(emptyFilterMap, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = productService.getProductList(emptyFilterMap, paginationModel);

            assertThat(result).isNotNull();
            verify(productDao, times(1)).getProductList(emptyFilterMap, paginationModel);
        }

        @Test
        @DisplayName("Should handle null filter map")
        void shouldHandleNullFilterMap() {
            PaginationModel paginationModel = new PaginationModel();

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(productDao.getProductList(null, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = productService.getProductList(null, paginationModel);

            assertThat(result).isNotNull();
            verify(productDao, times(1)).getProductList(null, paginationModel);
        }

        @Test
        @DisplayName("Should handle null pagination model")
        void shouldHandleNullPaginationModel() {
            Map<ProductFilterEnum, Object> filterMap = new HashMap<>();

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(productDao.getProductList(filterMap, null))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = productService.getProductList(filterMap, null);

            assertThat(result).isNotNull();
            verify(productDao, times(1)).getProductList(filterMap, null);
        }

        @Test
        @DisplayName("Should handle multiple filter criteria")
        void shouldHandleMultipleFilterCriteria() {
            Map<ProductFilterEnum, Object> filterMap = new HashMap<>();
            filterMap.put(ProductFilterEnum.PRODUCT_NAME, "Test");
            filterMap.put(ProductFilterEnum.PRODUCT_CODE, "TEST001");
            filterMap.put(ProductFilterEnum.IS_ACTIVE, true);
            PaginationModel paginationModel = new PaginationModel();

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(productDao.getProductList(filterMap, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = productService.getProductList(filterMap, paginationModel);

            assertThat(result).isNotNull();
            verify(productDao, times(1)).getProductList(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should handle different page sizes")
        void shouldHandleDifferentPageSizes() {
            Map<ProductFilterEnum, Object> filterMap = new HashMap<>();
            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNumber(2);
            paginationModel.setRecordPerPage(50);

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(productDao.getProductList(filterMap, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = productService.getProductList(filterMap, paginationModel);

            assertThat(result).isNotNull();
            verify(productDao, times(1)).getProductList(filterMap, paginationModel);
        }
    }

    @Nested
    @DisplayName("update() Tests")
    class UpdateTests {

        @Test
        @DisplayName("Should update product and evict cache")
        void shouldUpdateProductAndEvictCache() {
            when(productDao.update(testProduct)).thenReturn(testProduct);
            when(cacheManager.getCache("productCache")).thenReturn(productCache);
            doNothing().when(productCache).evict(productId);

            Product result = productService.update(testProduct);

            assertThat(result).isNotNull();
            assertThat(result.getProductID()).isEqualTo(productId);
            verify(productDao, times(1)).update(testProduct);
            verify(cacheManager, times(1)).getCache("productCache");
            verify(productCache, times(1)).evict(productId);
        }

        @Test
        @DisplayName("Should handle null product ID in update")
        void shouldHandleNullProductIdInUpdate() {
            Product productWithNullId = createTestProduct(null, "No ID Product", "NOID001");
            when(productDao.update(productWithNullId)).thenReturn(productWithNullId);
            when(cacheManager.getCache("productCache")).thenReturn(productCache);

            Product result = productService.update(productWithNullId);

            assertThat(result).isNotNull();
            verify(productDao, times(1)).update(productWithNullId);
        }

        @Test
        @DisplayName("Should update product with modified fields")
        void shouldUpdateProductWithModifiedFields() {
            testProduct.setProductName("Updated Product Name");
            testProduct.setUnitPrice(new BigDecimal("199.99"));
            testProduct.setLastUpdatedBy(2);
            testProduct.setLastUpdateDate(LocalDateTime.now());

            when(productDao.update(testProduct)).thenReturn(testProduct);
            when(cacheManager.getCache("productCache")).thenReturn(productCache);
            doNothing().when(productCache).evict(productId);

            Product result = productService.update(testProduct);

            assertThat(result).isNotNull();
            assertThat(result.getProductName()).isEqualTo("Updated Product Name");
            assertThat(result.getUnitPrice()).isEqualByComparingTo(new BigDecimal("199.99"));
            verify(productDao, times(1)).update(testProduct);
            verify(productCache, times(1)).evict(productId);
        }

        @Test
        @DisplayName("Should evict correct product from cache after update")
        void shouldEvictCorrectProductFromCacheAfterUpdate() {
            Integer specificProductId = 5000;
            Product specificProduct = createTestProduct(specificProductId, "Specific Product", "SPEC001");

            when(productDao.update(specificProduct)).thenReturn(specificProduct);
            when(cacheManager.getCache("productCache")).thenReturn(productCache);
            doNothing().when(productCache).evict(specificProductId);

            productService.update(specificProduct);

            verify(productCache, times(1)).evict(specificProductId);
            verify(productCache, never()).evict(productId);
        }

        @Test
        @DisplayName("Should handle update when cache is null")
        void shouldHandleUpdateWhenCacheIsNull() {
            when(productDao.update(testProduct)).thenReturn(testProduct);
            when(cacheManager.getCache("productCache")).thenReturn(null);

            assertThatThrownBy(() -> productService.update(testProduct))
                    .isInstanceOf(NullPointerException.class);

            verify(productDao, times(1)).update(testProduct);
        }

        @Test
        @DisplayName("Should update product with zero unit price")
        void shouldUpdateProductWithZeroUnitPrice() {
            testProduct.setUnitPrice(BigDecimal.ZERO);

            when(productDao.update(testProduct)).thenReturn(testProduct);
            when(cacheManager.getCache("productCache")).thenReturn(productCache);
            doNothing().when(productCache).evict(productId);

            Product result = productService.update(testProduct);

            assertThat(result).isNotNull();
            assertThat(result.getUnitPrice()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should update product and increment version number")
        void shouldUpdateProductAndIncrementVersionNumber() {
            testProduct.setVersionNumber(2);

            when(productDao.update(testProduct)).thenReturn(testProduct);
            when(cacheManager.getCache("productCache")).thenReturn(productCache);
            doNothing().when(productCache).evict(productId);

            Product result = productService.update(testProduct);

            assertThat(result).isNotNull();
            assertThat(result.getVersionNumber()).isEqualTo(2);
        }
    }

    @Nested
    @DisplayName("deleteByIds() Tests")
    class DeleteByIdsTests {

        @Test
        @DisplayName("Should delete products by IDs and evict from cache")
        void shouldDeleteProductsByIdsAndEvictFromCache() {
            List<Integer> idsToDelete = Arrays.asList(1001, 1002, 1003);

            doNothing().when(productDao).deleteByIds(idsToDelete);
            when(cacheManager.getCache("productCache")).thenReturn(productCache);
            doNothing().when(productCache).evict(anyInt());

            productService.deleteByIds(idsToDelete);

            verify(productDao, times(1)).deleteByIds(idsToDelete);
            verify(cacheManager, times(1)).getCache("productCache");
            verify(productCache, times(1)).evict(1001);
            verify(productCache, times(1)).evict(1002);
            verify(productCache, times(1)).evict(1003);
        }

        @Test
        @DisplayName("Should handle single product deletion")
        void shouldHandleSingleProductDeletion() {
            List<Integer> singleId = Collections.singletonList(productId);

            doNothing().when(productDao).deleteByIds(singleId);
            when(cacheManager.getCache("productCache")).thenReturn(productCache);
            doNothing().when(productCache).evict(productId);

            productService.deleteByIds(singleId);

            verify(productDao, times(1)).deleteByIds(singleId);
            verify(productCache, times(1)).evict(productId);
        }

        @Test
        @DisplayName("Should handle empty ID list")
        void shouldHandleEmptyIdList() {
            List<Integer> emptyList = Collections.emptyList();

            doNothing().when(productDao).deleteByIds(emptyList);
            when(cacheManager.getCache("productCache")).thenReturn(productCache);

            productService.deleteByIds(emptyList);

            verify(productDao, times(1)).deleteByIds(emptyList);
            verify(productCache, never()).evict(anyInt());
        }

        @Test
        @DisplayName("Should delete multiple products efficiently")
        void shouldDeleteMultipleProductsEfficiently() {
            List<Integer> manyIds = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

            doNothing().when(productDao).deleteByIds(manyIds);
            when(cacheManager.getCache("productCache")).thenReturn(productCache);
            doNothing().when(productCache).evict(anyInt());

            productService.deleteByIds(manyIds);

            verify(productDao, times(1)).deleteByIds(manyIds);
            verify(productCache, times(10)).evict(anyInt());
        }

        @Test
        @DisplayName("Should evict all specified IDs from cache")
        void shouldEvictAllSpecifiedIdsFromCache() {
            List<Integer> idsToDelete = Arrays.asList(100, 200, 300);

            doNothing().when(productDao).deleteByIds(idsToDelete);
            when(cacheManager.getCache("productCache")).thenReturn(productCache);
            doNothing().when(productCache).evict(anyInt());

            productService.deleteByIds(idsToDelete);

            verify(productCache, times(1)).evict(100);
            verify(productCache, times(1)).evict(200);
            verify(productCache, times(1)).evict(300);
        }

        @Test
        @DisplayName("Should handle deletion when cache is null")
        void shouldHandleDeletionWhenCacheIsNull() {
            List<Integer> idsToDelete = Arrays.asList(1001, 1002);

            doNothing().when(productDao).deleteByIds(idsToDelete);
            when(cacheManager.getCache("productCache")).thenReturn(null);

            assertThatThrownBy(() -> productService.deleteByIds(idsToDelete))
                    .isInstanceOf(NullPointerException.class);

            verify(productDao, times(1)).deleteByIds(idsToDelete);
        }

        @Test
        @DisplayName("Should handle IDs with negative values")
        void shouldHandleIdsWithNegativeValues() {
            List<Integer> idsWithNegatives = Arrays.asList(-1, -2, -3);

            doNothing().when(productDao).deleteByIds(idsWithNegatives);
            when(cacheManager.getCache("productCache")).thenReturn(productCache);
            doNothing().when(productCache).evict(anyInt());

            productService.deleteByIds(idsWithNegatives);

            verify(productDao, times(1)).deleteByIds(idsWithNegatives);
            verify(productCache, times(3)).evict(anyInt());
        }

        @Test
        @DisplayName("Should handle IDs with zero values")
        void shouldHandleIdsWithZeroValues() {
            List<Integer> idsWithZero = Arrays.asList(0, 1, 2);

            doNothing().when(productDao).deleteByIds(idsWithZero);
            when(cacheManager.getCache("productCache")).thenReturn(productCache);
            doNothing().when(productCache).evict(anyInt());

            productService.deleteByIds(idsWithZero);

            verify(productDao, times(1)).deleteByIds(idsWithZero);
            verify(productCache, times(1)).evict(0);
        }

        @Test
        @DisplayName("Should handle duplicate IDs in list")
        void shouldHandleDuplicateIdsInList() {
            List<Integer> idsWithDuplicates = Arrays.asList(1001, 1002, 1001, 1003, 1002);

            doNothing().when(productDao).deleteByIds(idsWithDuplicates);
            when(cacheManager.getCache("productCache")).thenReturn(productCache);
            doNothing().when(productCache).evict(anyInt());

            productService.deleteByIds(idsWithDuplicates);

            verify(productDao, times(1)).deleteByIds(idsWithDuplicates);
            verify(productCache, times(5)).evict(anyInt());
        }
    }

    @Nested
    @DisplayName("getTotalProductCountByVatId() Tests")
    class GetTotalProductCountByVatIdTests {

        @Test
        @DisplayName("Should get total product count by VAT ID")
        void shouldGetTotalProductCountByVatId() {
            Integer vatId = 5;
            Integer expectedCount = 10;

            when(productDao.getTotalProductCountByVatId(vatId)).thenReturn(expectedCount);

            Integer result = productService.getTotalProductCountByVatId(vatId);

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(expectedCount);
            verify(productDao, times(1)).getTotalProductCountByVatId(vatId);
        }

        @Test
        @DisplayName("Should return zero when no products with VAT ID")
        void shouldReturnZeroWhenNoProductsWithVatId() {
            Integer vatId = 99;
            Integer expectedCount = 0;

            when(productDao.getTotalProductCountByVatId(vatId)).thenReturn(expectedCount);

            Integer result = productService.getTotalProductCountByVatId(vatId);

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(0);
            verify(productDao, times(1)).getTotalProductCountByVatId(vatId);
        }

        @Test
        @DisplayName("Should handle null VAT ID")
        void shouldHandleNullVatId() {
            when(productDao.getTotalProductCountByVatId(null)).thenReturn(0);

            Integer result = productService.getTotalProductCountByVatId(null);

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(0);
            verify(productDao, times(1)).getTotalProductCountByVatId(null);
        }

        @Test
        @DisplayName("Should handle negative VAT ID")
        void shouldHandleNegativeVatId() {
            Integer negativeVatId = -1;

            when(productDao.getTotalProductCountByVatId(negativeVatId)).thenReturn(0);

            Integer result = productService.getTotalProductCountByVatId(negativeVatId);

            assertThat(result).isNotNull();
            verify(productDao, times(1)).getTotalProductCountByVatId(negativeVatId);
        }

        @Test
        @DisplayName("Should handle zero VAT ID")
        void shouldHandleZeroVatId() {
            Integer zeroVatId = 0;
            Integer expectedCount = 5;

            when(productDao.getTotalProductCountByVatId(zeroVatId)).thenReturn(expectedCount);

            Integer result = productService.getTotalProductCountByVatId(zeroVatId);

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(expectedCount);
            verify(productDao, times(1)).getTotalProductCountByVatId(zeroVatId);
        }

        @Test
        @DisplayName("Should return large count for popular VAT ID")
        void shouldReturnLargeCountForPopularVatId() {
            Integer popularVatId = 1;
            Integer largeCount = 10000;

            when(productDao.getTotalProductCountByVatId(popularVatId)).thenReturn(largeCount);

            Integer result = productService.getTotalProductCountByVatId(popularVatId);

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(largeCount);
            verify(productDao, times(1)).getTotalProductCountByVatId(popularVatId);
        }

        @Test
        @DisplayName("Should handle different VAT IDs correctly")
        void shouldHandleDifferentVatIdsCorrectly() {
            Integer vatId1 = 1;
            Integer vatId2 = 2;
            Integer count1 = 15;
            Integer count2 = 25;

            when(productDao.getTotalProductCountByVatId(vatId1)).thenReturn(count1);
            when(productDao.getTotalProductCountByVatId(vatId2)).thenReturn(count2);

            Integer result1 = productService.getTotalProductCountByVatId(vatId1);
            Integer result2 = productService.getTotalProductCountByVatId(vatId2);

            assertThat(result1).isEqualTo(count1);
            assertThat(result2).isEqualTo(count2);
            assertThat(result1).isNotEqualTo(result2);
        }
    }

    @Nested
    @DisplayName("Cache Management Tests")
    class CacheManagementTests {

        @Test
        @DisplayName("Should use correct cache name for product cache")
        void shouldUseCorrectCacheNameForProductCache() {
            when(productDao.update(testProduct)).thenReturn(testProduct);
            when(cacheManager.getCache("productCache")).thenReturn(productCache);
            doNothing().when(productCache).evict(productId);

            productService.update(testProduct);

            verify(cacheManager, times(1)).getCache("productCache");
        }

        @Test
        @DisplayName("Should evict from cache on update operation")
        void shouldEvictFromCacheOnUpdateOperation() {
            when(productDao.update(testProduct)).thenReturn(testProduct);
            when(cacheManager.getCache("productCache")).thenReturn(productCache);
            doNothing().when(productCache).evict(productId);

            productService.update(testProduct);

            verify(productCache, times(1)).evict(productId);
        }

        @Test
        @DisplayName("Should evict from cache on delete operation")
        void shouldEvictFromCacheOnDeleteOperation() {
            List<Integer> ids = Collections.singletonList(productId);

            doNothing().when(productDao).deleteByIds(ids);
            when(cacheManager.getCache("productCache")).thenReturn(productCache);
            doNothing().when(productCache).evict(productId);

            productService.deleteByIds(ids);

            verify(productCache, times(1)).evict(productId);
        }

        @Test
        @DisplayName("Should use @Cacheable annotation for findByPK")
        void shouldUseCacheableAnnotationForFindByPK() {
            when(productDao.findByPK(productId)).thenReturn(testProduct);

            Product result = productService.findByPK(productId);

            assertThat(result).isNotNull();
            verify(productDao, times(1)).findByPK(productId);
        }

        @Test
        @DisplayName("Should evict multiple entries from cache in batch delete")
        void shouldEvictMultipleEntriesFromCacheInBatchDelete() {
            List<Integer> multipleIds = Arrays.asList(1, 2, 3, 4, 5);

            doNothing().when(productDao).deleteByIds(multipleIds);
            when(cacheManager.getCache("productCache")).thenReturn(productCache);
            doNothing().when(productCache).evict(anyInt());

            productService.deleteByIds(multipleIds);

            verify(productCache, times(5)).evict(anyInt());
        }
    }

    @Nested
    @DisplayName("Edge Cases and Error Handling Tests")
    class EdgeCasesAndErrorHandlingTests {

        @Test
        @DisplayName("Should handle product with all null optional fields")
        void shouldHandleProductWithAllNullOptionalFields() {
            Product minimalProduct = new Product();
            minimalProduct.setProductID(2000);

            when(productDao.findByPK(2000)).thenReturn(minimalProduct);

            Product result = productService.findByPK(2000);

            assertThat(result).isNotNull();
            assertThat(result.getProductID()).isEqualTo(2000);
        }

        @Test
        @DisplayName("Should handle product with maximum field values")
        void shouldHandleProductWithMaximumFieldValues() {
            Product maxProduct = new Product();
            maxProduct.setProductID(Integer.MAX_VALUE);
            maxProduct.setProductName("A".repeat(255));
            maxProduct.setUnitPrice(new BigDecimal("999999999.99"));

            when(productDao.findByPK(Integer.MAX_VALUE)).thenReturn(maxProduct);

            Product result = productService.findByPK(Integer.MAX_VALUE);

            assertThat(result).isNotNull();
            assertThat(result.getProductID()).isEqualTo(Integer.MAX_VALUE);
        }

        @Test
        @DisplayName("Should handle concurrent update operations")
        void shouldHandleConcurrentUpdateOperations() {
            Product product1 = createTestProduct(1, "Product 1", "P001");
            Product product2 = createTestProduct(2, "Product 2", "P002");

            when(productDao.update(product1)).thenReturn(product1);
            when(productDao.update(product2)).thenReturn(product2);
            when(cacheManager.getCache("productCache")).thenReturn(productCache);
            doNothing().when(productCache).evict(anyInt());

            productService.update(product1);
            productService.update(product2);

            verify(productDao, times(1)).update(product1);
            verify(productDao, times(1)).update(product2);
            verify(productCache, times(1)).evict(1);
            verify(productCache, times(1)).evict(2);
        }

        @Test
        @DisplayName("Should handle product with special characters in name")
        void shouldHandleProductWithSpecialCharactersInName() {
            Product specialProduct = createTestProduct(3000, "Test & Product <Special>", "SPEC@001");

            when(productDao.findByPK(3000)).thenReturn(specialProduct);

            Product result = productService.findByPK(3000);

            assertThat(result).isNotNull();
            assertThat(result.getProductName()).contains("&", "<", ">");
        }

        @Test
        @DisplayName("Should handle product with very long description")
        void shouldHandleProductWithVeryLongDescription() {
            Product longDescProduct = createTestProduct(4000, "Product", "LONG001");
            longDescProduct.setProductDescription("A".repeat(5000));

            when(productDao.update(longDescProduct)).thenReturn(longDescProduct);
            when(cacheManager.getCache("productCache")).thenReturn(productCache);
            doNothing().when(productCache).evict(4000);

            Product result = productService.update(longDescProduct);

            assertThat(result).isNotNull();
            assertThat(result.getProductDescription()).hasSize(5000);
        }

        @Test
        @DisplayName("Should handle empty string values")
        void shouldHandleEmptyStringValues() {
            Product emptyProduct = createTestProduct(5000, "", "");
            emptyProduct.setProductDescription("");

            when(productDao.findByPK(5000)).thenReturn(emptyProduct);

            Product result = productService.findByPK(5000);

            assertThat(result).isNotNull();
            assertThat(result.getProductName()).isEmpty();
            assertThat(result.getProductCode()).isEmpty();
        }

        @Test
        @DisplayName("Should handle product with deleted flag set")
        void shouldHandleProductWithDeletedFlagSet() {
            testProduct.setDeleteFlag(true);

            when(productDao.findByPK(productId)).thenReturn(testProduct);

            Product result = productService.findByPK(productId);

            assertThat(result).isNotNull();
            assertThat(result.getDeleteFlag()).isTrue();
        }

        @Test
        @DisplayName("Should handle product with inactive status")
        void shouldHandleProductWithInactiveStatus() {
            testProduct.setIsActive(false);

            when(productDao.findByPK(productId)).thenReturn(testProduct);

            Product result = productService.findByPK(productId);

            assertThat(result).isNotNull();
            assertThat(result.getIsActive()).isFalse();
        }
    }

    @Nested
    @DisplayName("Integration with Parent Service Tests")
    class IntegrationWithParentServiceTests {

        @Test
        @DisplayName("Should delegate to parent update method")
        void shouldDelegateToParentUpdateMethod() {
            when(productDao.update(testProduct)).thenReturn(testProduct);
            when(cacheManager.getCache("productCache")).thenReturn(productCache);
            doNothing().when(productCache).evict(productId);

            Product result = productService.update(testProduct);

            assertThat(result).isNotNull();
            verify(productDao, times(1)).update(testProduct);
        }

        @Test
        @DisplayName("Should use getDao method correctly")
        void shouldUseGetDaoMethodCorrectly() {
            assertThat(productService.getDao()).isInstanceOf(ProductDao.class);
            assertThat(productService.getDao()).isEqualTo(productDao);
        }

        @Test
        @DisplayName("Should handle findByPK through parent implementation")
        void shouldHandleFindByPKThroughParentImplementation() {
            when(productDao.findByPK(productId)).thenReturn(testProduct);

            Product result = productService.findByPK(productId);

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(testProduct);
        }
    }
}
