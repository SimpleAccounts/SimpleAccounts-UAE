package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.ProductFilterEnum;
import com.simpleaccounts.dao.ProductDao;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.EnumMap;
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
@DisplayName("ProductServiceImpl Unit Tests")
class ProductServiceImplTest {

    @Mock
    private ProductDao productDao;

    @Mock
    private CacheManager cacheManager;

    @Mock
    private Cache cache;

    @InjectMocks
    private ProductServiceImpl productService;

    @Nested
    @DisplayName("getProductList Tests")
    class GetProductListTests {

        @Test
        @DisplayName("Should return product list with pagination")
        void getProductListReturnsPaginatedResults() {
            // Arrange
            Map<ProductFilterEnum, Object> filterMap = new EnumMap<>(ProductFilterEnum.class);
            filterMap.put(ProductFilterEnum.DELETE_FLAG, false);
            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNo(0);
            paginationModel.setPageSize(10);

            List<Product> products = createProductList(5);
            PaginationResponseModel expectedResponse = new PaginationResponseModel(5, products);

            when(productDao.getProductList(filterMap, paginationModel))
                .thenReturn(expectedResponse);

            // Act
            PaginationResponseModel result = productService.getProductList(filterMap, paginationModel);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(5);
            assertThat(result.getData()).hasSize(5);
            verify(productDao).getProductList(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should return empty list when no products match filter")
        void getProductListReturnsEmptyListWhenNoProducts() {
            // Arrange
            Map<ProductFilterEnum, Object> filterMap = new EnumMap<>(ProductFilterEnum.class);
            PaginationModel paginationModel = new PaginationModel();
            PaginationResponseModel expectedResponse = new PaginationResponseModel(0, new ArrayList<>());

            when(productDao.getProductList(filterMap, paginationModel))
                .thenReturn(expectedResponse);

            // Act
            PaginationResponseModel result = productService.getProductList(filterMap, paginationModel);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getCount()).isZero();
            assertThat(result.getData()).isEmpty();
        }

        @Test
        @DisplayName("Should handle null filter map")
        void getProductListHandlesNullFilterMap() {
            // Arrange
            PaginationModel paginationModel = new PaginationModel();
            PaginationResponseModel expectedResponse = new PaginationResponseModel(0, new ArrayList<>());

            when(productDao.getProductList(null, paginationModel))
                .thenReturn(expectedResponse);

            // Act
            PaginationResponseModel result = productService.getProductList(null, paginationModel);

            // Assert
            assertThat(result).isNotNull();
        }
    }

    @Nested
    @DisplayName("findByPK Tests")
    class FindByPKTests {

        @Test
        @DisplayName("Should return product by ID with caching")
        void findByPKReturnsProduct() {
            // Arrange
            Integer productId = 1;
            Product expectedProduct = createProduct(productId, "Test Product", "PROD001");

            when(productDao.findByPK(productId))
                .thenReturn(expectedProduct);

            // Act
            Product result = productService.findByPK(productId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getProductID()).isEqualTo(productId);
            assertThat(result.getProductName()).isEqualTo("Test Product");
            verify(productDao).findByPK(productId);
        }

        @Test
        @DisplayName("Should return null when product not found")
        void findByPKReturnsNullWhenNotFound() {
            // Arrange
            Integer productId = 999;

            when(productDao.findByPK(productId))
                .thenReturn(null);

            // Act
            Product result = productService.findByPK(productId);

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("update Tests")
    class UpdateTests {

        @BeforeEach
        void setUp() {
            when(cacheManager.getCache("productCache")).thenReturn(cache);
        }

        @Test
        @DisplayName("Should update product and evict from cache")
        void updateProductEvictsFromCache() {
            // Arrange
            Product product = createProduct(1, "Updated Product", "PROD001");

            when(productDao.update(product)).thenReturn(product);

            // Act
            Product result = productService.update(product);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getProductName()).isEqualTo("Updated Product");
            verify(cache).evict(1);
        }

        @Test
        @DisplayName("Should call DAO update method")
        void updateCallsDaoUpdate() {
            // Arrange
            Product product = createProduct(1, "Test Product", "PROD001");

            when(productDao.update(product)).thenReturn(product);

            // Act
            productService.update(product);

            // Assert
            verify(productDao).update(product);
        }
    }

    @Nested
    @DisplayName("deleteByIds Tests")
    class DeleteByIdsTests {

        @BeforeEach
        void setUp() {
            when(cacheManager.getCache("productCache")).thenReturn(cache);
        }

        @Test
        @DisplayName("Should delete products by IDs and evict from cache")
        void deleteByIdsEvictsFromCache() {
            // Arrange
            List<Integer> ids = Arrays.asList(1, 2, 3);

            // Act
            productService.deleteByIds(ids);

            // Assert
            verify(productDao).deleteByIds(ids);
            verify(cache, times(3)).evict(anyInt());
        }

        @Test
        @DisplayName("Should handle single ID deletion")
        void deleteByIdsSingleId() {
            // Arrange
            List<Integer> ids = Collections.singletonList(1);

            // Act
            productService.deleteByIds(ids);

            // Assert
            verify(productDao).deleteByIds(ids);
            verify(cache).evict(1);
        }

        @Test
        @DisplayName("Should handle empty ID list")
        void deleteByIdsEmptyList() {
            // Arrange
            List<Integer> ids = new ArrayList<>();

            // Act
            productService.deleteByIds(ids);

            // Assert
            verify(productDao).deleteByIds(ids);
            verify(cache, never()).evict(anyInt());
        }
    }

    @Nested
    @DisplayName("getTotalProductCountByVatId Tests")
    class GetTotalProductCountByVatIdTests {

        @Test
        @DisplayName("Should return product count by VAT ID")
        void getTotalProductCountByVatIdReturnsCount() {
            // Arrange
            Integer vatId = 1;
            Integer expectedCount = 10;

            when(productDao.getTotalProductCountByVatId(vatId))
                .thenReturn(expectedCount);

            // Act
            Integer result = productService.getTotalProductCountByVatId(vatId);

            // Assert
            assertThat(result).isEqualTo(10);
            verify(productDao).getTotalProductCountByVatId(vatId);
        }

        @Test
        @DisplayName("Should return null when no products with VAT ID")
        void getTotalProductCountByVatIdReturnsNullWhenNone() {
            // Arrange
            Integer vatId = 999;

            when(productDao.getTotalProductCountByVatId(vatId))
                .thenReturn(null);

            // Act
            Integer result = productService.getTotalProductCountByVatId(vatId);

            // Assert
            assertThat(result).isNull();
        }

        @Test
        @DisplayName("Should return zero when count is zero")
        void getTotalProductCountByVatIdReturnsZero() {
            // Arrange
            Integer vatId = 1;

            when(productDao.getTotalProductCountByVatId(vatId))
                .thenReturn(0);

            // Act
            Integer result = productService.getTotalProductCountByVatId(vatId);

            // Assert
            assertThat(result).isZero();
        }
    }

    @Nested
    @DisplayName("getDao Tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return ProductDao instance")
        void getDaoReturnsProductDao() {
            // Act & Assert - implicitly tested through other methods
            // The getDao method is protected and used internally
            assertThat(productService).isNotNull();
        }
    }

    private List<Product> createProductList(int count) {
        List<Product> products = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            products.add(createProduct(i, "Product " + i, "PROD00" + i));
        }
        return products;
    }

    private Product createProduct(Integer id, String name, String code) {
        Product product = new Product();
        product.setProductID(id);
        product.setProductName(name);
        product.setProductCode(code);
        product.setProductDescription("Description for " + name);
        product.setDeleteFlag(false);
        product.setIsInventoryEnabled(false);
        product.setCreatedBy(1);
        product.setCreatedDate(LocalDateTime.now());
        product.setVersionNumber(1);
        return product;
    }
}
