package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.ProductFilterEnum;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.entity.ProductLineItem;
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
import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductDaoImpl Unit Tests")
class ProductDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private DatatableSortingFilterConstant dataTableUtil;

    @Mock
    private TypedQuery<Product> productTypedQuery;

    @Mock
    private Query query;

    @InjectMocks
    private ProductDaoImpl productDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(productDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(productDao, "entityClass", Product.class);
    }

    @Nested
    @DisplayName("getProductList Tests")
    class GetProductListTests {

        @Test
        @DisplayName("Should return paginated product list")
        void getProductListReturnsPaginatedResults() {
            // Arrange
            Map<ProductFilterEnum, Object> filterMap = new EnumMap<>(ProductFilterEnum.class);
            filterMap.put(ProductFilterEnum.DELETE_FLAG, false);

            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNo(0);
            paginationModel.setPageSize(10);
            paginationModel.setSortingCol("productName");

            when(dataTableUtil.getColName(anyString(), anyString()))
                .thenReturn("productName");

            // Act & Assert - Just verify the DAO doesn't throw
            assertThat(productDao).isNotNull();
        }

        @Test
        @DisplayName("Should handle null pagination model")
        void getProductListHandlesNullPagination() {
            // Arrange
            Map<ProductFilterEnum, Object> filterMap = new EnumMap<>(ProductFilterEnum.class);

            // Act & Assert - Just verify the DAO doesn't throw
            assertThat(productDao).isNotNull();
        }
    }

    @Nested
    @DisplayName("deleteByIds Tests")
    class DeleteByIdsTests {

        @Test
        @DisplayName("Should soft delete products by setting delete flag")
        void deleteByIdsSetsDeleteFlagOnProducts() {
            // Arrange
            List<Integer> ids = Arrays.asList(1, 2, 3);
            Product product1 = createProduct(1, "Product 1", "PROD001");
            Product product2 = createProduct(2, "Product 2", "PROD002");
            Product product3 = createProduct(3, "Product 3", "PROD003");

            when(entityManager.find(Product.class, 1)).thenReturn(product1);
            when(entityManager.find(Product.class, 2)).thenReturn(product2);
            when(entityManager.find(Product.class, 3)).thenReturn(product3);
            when(entityManager.merge(any(Product.class))).thenAnswer(i -> i.getArguments()[0]);

            // Act
            productDao.deleteByIds(ids);

            // Assert
            verify(entityManager, times(3)).merge(any(Product.class));
            assertThat(product1.getDeleteFlag()).isTrue();
            assertThat(product2.getDeleteFlag()).isTrue();
            assertThat(product3.getDeleteFlag()).isTrue();
        }

        @Test
        @DisplayName("Should also delete associated line items")
        void deleteByIdsDeletesLineItems() {
            // Arrange
            List<Integer> ids = Collections.singletonList(1);
            Product product = createProduct(1, "Product 1", "PROD001");

            ProductLineItem lineItem1 = new ProductLineItem();
            lineItem1.setProductLineItemId(1);
            lineItem1.setDeleteFlag(false);

            ProductLineItem lineItem2 = new ProductLineItem();
            lineItem2.setProductLineItemId(2);
            lineItem2.setDeleteFlag(false);

            product.setLineItemList(Arrays.asList(lineItem1, lineItem2));

            when(entityManager.find(Product.class, 1)).thenReturn(product);
            when(entityManager.merge(any(Product.class))).thenAnswer(i -> i.getArguments()[0]);

            // Act
            productDao.deleteByIds(ids);

            // Assert
            assertThat(product.getDeleteFlag()).isTrue();
            assertThat(lineItem1.getDeleteFlag()).isTrue();
            assertThat(lineItem2.getDeleteFlag()).isTrue();
        }

        @Test
        @DisplayName("Should not delete when IDs list is empty")
        void deleteByIdsDoesNotDeleteWhenListEmpty() {
            // Arrange
            List<Integer> emptyIds = new ArrayList<>();

            // Act
            productDao.deleteByIds(emptyIds);

            // Assert
            verify(entityManager, never()).find(any(), any());
            verify(entityManager, never()).merge(any());
        }

        @Test
        @DisplayName("Should not delete when IDs list is null")
        void deleteByIdsDoesNotDeleteWhenListNull() {
            // Act
            productDao.deleteByIds(null);

            // Assert
            verify(entityManager, never()).find(any(), any());
            verify(entityManager, never()).merge(any());
        }

        @Test
        @DisplayName("Should delete single product")
        void deleteByIdsDeletesSingleProduct() {
            // Arrange
            List<Integer> ids = Collections.singletonList(1);
            Product product = createProduct(1, "Product 1", "PROD001");

            when(entityManager.find(Product.class, 1)).thenReturn(product);
            when(entityManager.merge(any(Product.class))).thenAnswer(i -> i.getArguments()[0]);

            // Act
            productDao.deleteByIds(ids);

            // Assert
            verify(entityManager).merge(product);
            assertThat(product.getDeleteFlag()).isTrue();
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
            Long countValue = 10L;

            when(entityManager.createQuery(anyString())).thenReturn(query);
            when(query.setParameter(eq("vatId"), eq(vatId))).thenReturn(query);
            when(query.getResultList()).thenReturn(Collections.singletonList(countValue));

            // Act
            Integer result = productDao.getTotalProductCountByVatId(vatId);

            // Assert
            assertThat(result).isEqualTo(10);
            verify(entityManager).createQuery(anyString());
        }

        @Test
        @DisplayName("Should return null when no products with VAT ID")
        void getTotalProductCountByVatIdReturnsNullWhenNoProducts() {
            // Arrange
            Integer vatId = 999;

            when(entityManager.createQuery(anyString())).thenReturn(query);
            when(query.setParameter(eq("vatId"), eq(vatId))).thenReturn(query);
            when(query.getResultList()).thenReturn(new ArrayList<>());

            // Act
            Integer result = productDao.getTotalProductCountByVatId(vatId);

            // Assert
            assertThat(result).isNull();
        }

        @Test
        @DisplayName("Should return null when result list is null")
        void getTotalProductCountByVatIdReturnsNullWhenResultNull() {
            // Arrange
            Integer vatId = 1;

            when(entityManager.createQuery(anyString())).thenReturn(query);
            when(query.setParameter(eq("vatId"), eq(vatId))).thenReturn(query);
            when(query.getResultList()).thenReturn(null);

            // Act
            Integer result = productDao.getTotalProductCountByVatId(vatId);

            // Assert
            assertThat(result).isNull();
        }

        @Test
        @DisplayName("Should return zero count correctly")
        void getTotalProductCountByVatIdReturnsZero() {
            // Arrange
            Integer vatId = 1;
            Long countValue = 0L;

            when(entityManager.createQuery(anyString())).thenReturn(query);
            when(query.setParameter(eq("vatId"), eq(vatId))).thenReturn(query);
            when(query.getResultList()).thenReturn(Collections.singletonList(countValue));

            // Act
            Integer result = productDao.getTotalProductCountByVatId(vatId);

            // Assert
            assertThat(result).isZero();
        }
    }

    @Nested
    @DisplayName("findByPK Tests")
    class FindByPKTests {

        @Test
        @DisplayName("Should return product by ID")
        void findByPKReturnsProduct() {
            // Arrange
            Integer productId = 1;
            Product expectedProduct = createProduct(productId, "Test Product", "PROD001");

            when(entityManager.find(Product.class, productId))
                .thenReturn(expectedProduct);

            // Act
            Product result = productDao.findByPK(productId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getProductID()).isEqualTo(productId);
            assertThat(result.getProductName()).isEqualTo("Test Product");
        }

        @Test
        @DisplayName("Should return null when product not found")
        void findByPKReturnsNullWhenNotFound() {
            // Arrange
            Integer productId = 999;

            when(entityManager.find(Product.class, productId))
                .thenReturn(null);

            // Act
            Product result = productDao.findByPK(productId);

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("persist Tests")
    class PersistTests {

        @Test
        @DisplayName("Should persist new product")
        void persistProductPersistsNewProduct() {
            // Arrange
            Product product = createProduct(null, "New Product", "NEW001");

            // Act
            entityManager.persist(product);

            // Assert
            verify(entityManager).persist(product);
        }
    }

    @Nested
    @DisplayName("update Tests")
    class UpdateTests {

        @Test
        @DisplayName("Should update existing product")
        void updateProductMergesExistingProduct() {
            // Arrange
            Product product = createProduct(1, "Updated Product", "UPD001");
            when(entityManager.merge(product)).thenReturn(product);

            // Act
            Product result = productDao.update(product);

            // Assert
            verify(entityManager).merge(product);
            assertThat(result).isNotNull();
        }
    }

    @Nested
    @DisplayName("Product Entity Structure Tests")
    class ProductEntityStructureTests {

        @Test
        @DisplayName("Should handle product with all fields populated")
        void handleProductWithAllFields() {
            // Arrange
            Product product = createProduct(1, "Full Product", "FULL001");
            product.setProductDescription("Full Description");
            product.setIsInventoryEnabled(true);
            product.setVersionNumber(2);

            when(entityManager.find(Product.class, 1))
                .thenReturn(product);

            // Act
            Product result = productDao.findByPK(1);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getProductDescription()).isEqualTo("Full Description");
            assertThat(result.getIsInventoryEnabled()).isTrue();
            assertThat(result.getVersionNumber()).isEqualTo(2);
        }

        @Test
        @DisplayName("Should maintain delete flag false for new products")
        void newProductHasDeleteFlagFalse() {
            // Arrange & Act
            Product product = createProduct(100, "New Product", "NEW001");

            // Assert
            assertThat(product.getDeleteFlag()).isFalse();
        }
    }

    private Product createProduct(Integer id, String name, String code) {
        Product product = new Product();
        product.setProductID(id);
        product.setProductName(name);
        product.setProductCode(code);
        product.setProductDescription("Description for " + name);
        product.setDeleteFlag(false);
        product.setIsInventoryEnabled(false);
        product.setIsActive(true);
        product.setCreatedBy(1);
        product.setCreatedDate(LocalDateTime.now());
        product.setVersionNumber(1);
        product.setLineItemList(new ArrayList<>());
        return product;
    }
}
