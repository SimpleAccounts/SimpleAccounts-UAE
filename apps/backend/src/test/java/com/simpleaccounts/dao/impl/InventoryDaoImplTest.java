package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.InventoryFilterEnum;
import com.simpleaccounts.entity.Inventory;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.productcontroller.InventoryListModel;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("InventoryDaoImpl Unit Tests")
class InventoryDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<Inventory> inventoryTypedQuery;

    @Mock
    private TypedQuery<Product> productTypedQuery;

    @Mock
    private Query query;

    @Mock
    private DatatableSortingFilterConstant dataTableUtil;

    @InjectMocks
    private InventoryDaoImpl inventoryDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(inventoryDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(inventoryDao, "entityClass", Inventory.class);
    }

    @Test
    @DisplayName("Should return inventory list with filters and pagination")
    void getInventoryListReturnsListWithFilters() {
        // Arrange
        Map<InventoryFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        List<Inventory> inventories = createInventoryList(5);

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.INVENTORY)))
            .thenReturn("productId");
        when(query.getSingleResult()).thenReturn(5L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(inventories);

        // Act
        PaginationResponseModel result = inventoryDao.getInventoryList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(5);
        assertThat(result.getData()).hasSize(5);
    }

    @Test
    @DisplayName("Should handle null pagination model")
    void getInventoryListHandlesNullPagination() {
        // Arrange
        Map<InventoryFilterEnum, Object> filterMap = new HashMap<>();
        List<Inventory> inventories = createInventoryList(3);

        when(query.getSingleResult()).thenReturn(3L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(inventories);

        // Act
        PaginationResponseModel result = inventoryDao.getInventoryList(filterMap, null);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(3);
    }

    @Test
    @DisplayName("Should return product by product ID")
    void getProductByProductIdReturnsProduct() {
        // Arrange
        Integer productId = 1;
        List<Inventory> inventories = createInventoryList(2);

        when(entityManager.createNamedQuery("getInventoryProductById", Inventory.class))
            .thenReturn(inventoryTypedQuery);
        when(inventoryTypedQuery.setParameter("productId", productId))
            .thenReturn(inventoryTypedQuery);
        when(inventoryTypedQuery.getResultList()).thenReturn(inventories);

        // Act
        List<Inventory> result = inventoryDao.getProductByProductId(productId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Should return empty list when no product found by ID")
    void getProductByProductIdReturnsEmptyList() {
        // Arrange
        Integer productId = 999;

        when(entityManager.createNamedQuery("getInventoryProductById", Inventory.class))
            .thenReturn(inventoryTypedQuery);
        when(inventoryTypedQuery.setParameter("productId", productId))
            .thenReturn(inventoryTypedQuery);
        when(inventoryTypedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<Inventory> result = inventoryDao.getProductByProductId(productId);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return inventory by product ID")
    void getInventoryByProductIdReturnsInventory() {
        // Arrange
        Integer productId = 1;
        List<Inventory> inventories = createInventoryList(3);

        when(entityManager.createNamedQuery("getInventoryProductById", Inventory.class))
            .thenReturn(inventoryTypedQuery);
        when(inventoryTypedQuery.setParameter("productId", productId))
            .thenReturn(inventoryTypedQuery);
        when(inventoryTypedQuery.getResultList()).thenReturn(inventories);

        // Act
        List<Inventory> result = inventoryDao.getInventoryByProductId(productId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("Should return product count for inventory")
    void getProductCountForInventoryReturnsCount() {
        // Arrange
        when(entityManager.createQuery("SELECT COUNT(DISTINCT productId ) FROM Inventory "))
            .thenReturn(query);
        when(query.getResultList()).thenReturn(Collections.singletonList(10L));

        // Act
        Integer result = inventoryDao.getProductCountForInventory();

        // Assert
        assertThat(result).isEqualTo(10);
    }

    @Test
    @DisplayName("Should return null when no products in inventory")
    void getProductCountForInventoryReturnsNull() {
        // Arrange
        when(entityManager.createQuery("SELECT COUNT(DISTINCT productId ) FROM Inventory "))
            .thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        Integer result = inventoryDao.getProductCountForInventory();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return total stock on hand")
    void totalStockOnHandReturnsTotal() {
        // Arrange
        when(entityManager.createQuery(" SELECT  SUM(i.stockOnHand) AS StockOnHand FROM Inventory i"))
            .thenReturn(query);
        when(query.getSingleResult()).thenReturn(100L);

        // Act
        Integer result = inventoryDao.totalStockOnHand();

        // Assert
        assertThat(result).isEqualTo(100);
    }

    @Test
    @DisplayName("Should return zero when no stock on hand")
    void totalStockOnHandReturnsZero() {
        // Arrange
        when(entityManager.createQuery(" SELECT  SUM(i.stockOnHand) AS StockOnHand FROM Inventory i"))
            .thenReturn(query);
        when(query.getSingleResult()).thenReturn(null);

        // Act
        Integer result = inventoryDao.totalStockOnHand();

        // Assert
        assertThat(result).isEqualTo(0);
    }

    @Test
    @DisplayName("Should return low stock product count")
    void getlowStockProductCountForInventoryReturnsCount() {
        // Arrange
        when(entityManager.createQuery(" SELECT COUNT(i.productId) FROM Inventory i WHERE i.stockOnHand <=i.reorderLevel"))
            .thenReturn(query);
        when(query.getResultList()).thenReturn(Collections.singletonList(5L));

        // Act
        Integer result = inventoryDao.getlowStockProductCountForInventory();

        // Assert
        assertThat(result).isEqualTo(5);
    }

    @Test
    @DisplayName("Should return null when no low stock products")
    void getlowStockProductCountForInventoryReturnsNull() {
        // Arrange
        when(entityManager.createQuery(" SELECT COUNT(i.productId) FROM Inventory i WHERE i.stockOnHand <=i.reorderLevel"))
            .thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        Integer result = inventoryDao.getlowStockProductCountForInventory();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return low stock product list")
    void getlowStockProductListForInventoryReturnsList() {
        // Arrange
        List<Product> products = createProductList(3);

        when(entityManager.createNamedQuery("getInventoryLowProduct", Product.class))
            .thenReturn(productTypedQuery);
        when(productTypedQuery.getResultList()).thenReturn(products);

        // Act
        List<Product> result = inventoryDao.getlowStockProductListForInventory();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("Should return top selling product list")
    void getTopSellingProductListForInventoryReturnsList() {
        // Arrange
        Product product1 = createProduct(1, "Product 1");
        Product product2 = createProduct(2, "Product 2");
        Object[] row1 = new Object[]{product1, 100L};
        Object[] row2 = new Object[]{product2, 80L};
        List<Object> results = Arrays.asList(row1, row2);

        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setFirstResult(0)).thenReturn(query);
        when(query.setMaxResults(5)).thenReturn(query);
        when(query.getResultList()).thenReturn(results);

        // Act
        List<InventoryListModel> result = inventoryDao.getTopSellingProductListForInventory();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getProductName()).isEqualTo("Product 1");
        assertThat(result.get(0).getQuantitySold()).isEqualTo(100);
    }

    @Test
    @DisplayName("Should return empty list when no top selling products")
    void getTopSellingProductListForInventoryReturnsEmptyList() {
        // Arrange
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setFirstResult(0)).thenReturn(query);
        when(query.setMaxResults(5)).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<InventoryListModel> result = inventoryDao.getTopSellingProductListForInventory();

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return inventory by product ID and supplier ID")
    void getInventoryByProductIdAndSupplierIdReturnsInventory() {
        // Arrange
        Integer productId = 1;
        Integer supplierId = 2;
        Inventory inventory = createInventory(1);

        when(entityManager.createNamedQuery("getInventoryByProductIdAndSupplierId", Inventory.class))
            .thenReturn(inventoryTypedQuery);
        when(inventoryTypedQuery.setParameter("productId", productId))
            .thenReturn(inventoryTypedQuery);
        when(inventoryTypedQuery.setParameter("supplierId", supplierId))
            .thenReturn(inventoryTypedQuery);
        when(inventoryTypedQuery.getSingleResult()).thenReturn(inventory);

        // Act
        Inventory result = inventoryDao.getInventoryByProductIdAndSupplierId(productId, supplierId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(inventory);
    }

    @Test
    @DisplayName("Should return out of stock count")
    void getOutOfStockCountOfInventoryReturnsCount() {
        // Arrange
        List<Integer> outOfStockProducts = Arrays.asList(1, 2, 3);

        when(entityManager.createQuery(" SELECT i.productId.productID FROM Inventory i GROUP BY i.productId.productID HAVING SUM(i.stockOnHand)=0"))
            .thenReturn(query);
        when(query.getResultList()).thenReturn(outOfStockProducts);

        // Act
        Integer result = inventoryDao.getOutOfStockCountOfInventory();

        // Assert
        assertThat(result).isEqualTo(3);
    }

    @Test
    @DisplayName("Should return zero when no out of stock items")
    void getOutOfStockCountOfInventoryReturnsZero() {
        // Arrange
        when(entityManager.createQuery(" SELECT i.productId.productID FROM Inventory i GROUP BY i.productId.productID HAVING SUM(i.stockOnHand)=0"))
            .thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        Integer result = inventoryDao.getOutOfStockCountOfInventory();

        // Assert
        assertThat(result).isEqualTo(0);
    }

    @Test
    @DisplayName("Should return total inventory value")
    void getTotalInventoryValueReturnsValue() {
        // Arrange
        BigDecimal totalValue = new BigDecimal("50000.00");

        when(entityManager.createQuery("SELECT SUM(i.stockOnHand*i.productId.avgPurchaseCost) FROM Inventory i"))
            .thenReturn(query);
        when(query.getSingleResult()).thenReturn(totalValue);

        // Act
        BigDecimal result = inventoryDao.getTotalInventoryValue();

        // Assert
        assertThat(result).isEqualByComparingTo(totalValue);
    }

    @Test
    @DisplayName("Should return zero when total inventory value is null")
    void getTotalInventoryValueReturnsZeroWhenNull() {
        // Arrange
        when(entityManager.createQuery("SELECT SUM(i.stockOnHand*i.productId.avgPurchaseCost) FROM Inventory i"))
            .thenReturn(query);
        when(query.getSingleResult()).thenReturn(null);

        // Act
        BigDecimal result = inventoryDao.getTotalInventoryValue();

        // Assert
        assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should return total inventory count for contact")
    void getTotalInventoryCountForContactReturnsCount() {
        // Arrange
        int contactId = 5;

        when(entityManager.createQuery("SELECT COUNT(i) FROM Inventory i WHERE i.supplierId.contactId =:contactId"))
            .thenReturn(query);
        when(query.setParameter("contactId", contactId)).thenReturn(query);
        when(query.getResultList()).thenReturn(Collections.singletonList(10L));

        // Act
        Integer result = inventoryDao.getTotalInventoryCountForContact(contactId);

        // Assert
        assertThat(result).isEqualTo(10);
    }

    @Test
    @DisplayName("Should return null when no inventory for contact")
    void getTotalInventoryCountForContactReturnsNull() {
        // Arrange
        int contactId = 999;

        when(entityManager.createQuery("SELECT COUNT(i) FROM Inventory i WHERE i.supplierId.contactId =:contactId"))
            .thenReturn(query);
        when(query.setParameter("contactId", contactId)).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        Integer result = inventoryDao.getTotalInventoryCountForContact(contactId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should set sorting column when pagination is not null")
    void getInventoryListSetsSortingColumn() {
        // Arrange
        Map<InventoryFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        paginationModel.setSortingCol("productName");

        when(dataTableUtil.getColName("productName", DatatableSortingFilterConstant.INVENTORY))
            .thenReturn("productId.productName");
        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        inventoryDao.getInventoryList(filterMap, paginationModel);

        // Assert
        verify(dataTableUtil).getColName("productName", DatatableSortingFilterConstant.INVENTORY);
    }

    @Test
    @DisplayName("Should use named query for getting inventory by product ID")
    void getInventoryByProductIdUsesNamedQuery() {
        // Arrange
        Integer productId = 1;

        when(entityManager.createNamedQuery("getInventoryProductById", Inventory.class))
            .thenReturn(inventoryTypedQuery);
        when(inventoryTypedQuery.setParameter("productId", productId))
            .thenReturn(inventoryTypedQuery);
        when(inventoryTypedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        inventoryDao.getInventoryByProductId(productId);

        // Assert
        verify(entityManager).createNamedQuery("getInventoryProductById", Inventory.class);
    }

    @Test
    @DisplayName("Should limit top selling products to 5")
    void getTopSellingProductListForInventoryLimitsToFive() {
        // Arrange
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setFirstResult(0)).thenReturn(query);
        when(query.setMaxResults(5)).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        inventoryDao.getTopSellingProductListForInventory();

        // Assert
        verify(query).setMaxResults(5);
    }

    @Test
    @DisplayName("Should handle large inventory list")
    void getInventoryListHandlesLargeList() {
        // Arrange
        Map<InventoryFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 100);
        List<Inventory> inventories = createInventoryList(100);

        when(query.getSingleResult()).thenReturn(100L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(inventories);

        // Act
        PaginationResponseModel result = inventoryDao.getInventoryList(filterMap, null);

        // Assert
        assertThat(result.getCount()).isEqualTo(100);
        assertThat(result.getData()).hasSize(100);
    }

    @Test
    @DisplayName("Should return consistent results on multiple calls")
    void getProductByProductIdReturnsConsistentResults() {
        // Arrange
        Integer productId = 1;
        List<Inventory> inventories = createInventoryList(2);

        when(entityManager.createNamedQuery("getInventoryProductById", Inventory.class))
            .thenReturn(inventoryTypedQuery);
        when(inventoryTypedQuery.setParameter("productId", productId))
            .thenReturn(inventoryTypedQuery);
        when(inventoryTypedQuery.getResultList()).thenReturn(inventories);

        // Act
        List<Inventory> result1 = inventoryDao.getProductByProductId(productId);
        List<Inventory> result2 = inventoryDao.getProductByProductId(productId);

        // Assert
        assertThat(result1).isEqualTo(result2);
    }

    @Test
    @DisplayName("Should execute correct query for product count")
    void getProductCountForInventoryExecutesCorrectQuery() {
        // Arrange
        when(entityManager.createQuery("SELECT COUNT(DISTINCT productId ) FROM Inventory "))
            .thenReturn(query);
        when(query.getResultList()).thenReturn(Collections.singletonList(5L));

        // Act
        inventoryDao.getProductCountForInventory();

        // Assert
        verify(entityManager).createQuery("SELECT COUNT(DISTINCT productId ) FROM Inventory ");
    }

    @Test
    @DisplayName("Should handle empty filter map")
    void getInventoryListHandlesEmptyFilterMap() {
        // Arrange
        Map<InventoryFilterEnum, Object> emptyFilterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.INVENTORY)))
            .thenReturn("productId");
        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        PaginationResponseModel result = inventoryDao.getInventoryList(emptyFilterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should set parameters for inventory by product and supplier")
    void getInventoryByProductIdAndSupplierIdSetsParameters() {
        // Arrange
        Integer productId = 1;
        Integer supplierId = 2;
        Inventory inventory = createInventory(1);

        when(entityManager.createNamedQuery("getInventoryByProductIdAndSupplierId", Inventory.class))
            .thenReturn(inventoryTypedQuery);
        when(inventoryTypedQuery.setParameter("productId", productId))
            .thenReturn(inventoryTypedQuery);
        when(inventoryTypedQuery.setParameter("supplierId", supplierId))
            .thenReturn(inventoryTypedQuery);
        when(inventoryTypedQuery.getSingleResult()).thenReturn(inventory);

        // Act
        inventoryDao.getInventoryByProductIdAndSupplierId(productId, supplierId);

        // Assert
        verify(inventoryTypedQuery).setParameter("productId", productId);
        verify(inventoryTypedQuery).setParameter("supplierId", supplierId);
    }

    @Test
    @DisplayName("Should convert Long to Integer for product count")
    void getProductCountForInventoryConvertsLongToInteger() {
        // Arrange
        when(entityManager.createQuery("SELECT COUNT(DISTINCT productId ) FROM Inventory "))
            .thenReturn(query);
        when(query.getResultList()).thenReturn(Collections.singletonList(42L));

        // Act
        Integer result = inventoryDao.getProductCountForInventory();

        // Assert
        assertThat(result).isInstanceOf(Integer.class);
        assertThat(result).isEqualTo(42);
    }

    @Test
    @DisplayName("Should convert Long to Integer for stock on hand")
    void totalStockOnHandConvertsLongToInteger() {
        // Arrange
        when(entityManager.createQuery(" SELECT  SUM(i.stockOnHand) AS StockOnHand FROM Inventory i"))
            .thenReturn(query);
        when(query.getSingleResult()).thenReturn(250L);

        // Act
        Integer result = inventoryDao.totalStockOnHand();

        // Assert
        assertThat(result).isInstanceOf(Integer.class);
        assertThat(result).isEqualTo(250);
    }

    @Test
    @DisplayName("Should order top selling products by quantity sold descending")
    void getTopSellingProductListForInventoryOrdersByQuantityDesc() {
        // Arrange
        Product product1 = createProduct(1, "Product 1");
        Product product2 = createProduct(2, "Product 2");
        Object[] row1 = new Object[]{product1, 100L};
        Object[] row2 = new Object[]{product2, 80L};
        List<Object> results = Arrays.asList(row1, row2);

        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setFirstResult(0)).thenReturn(query);
        when(query.setMaxResults(5)).thenReturn(query);
        when(query.getResultList()).thenReturn(results);

        // Act
        List<InventoryListModel> result = inventoryDao.getTopSellingProductListForInventory();

        // Assert
        assertThat(result.get(0).getQuantitySold()).isGreaterThan(result.get(1).getQuantitySold());
    }

    @Test
    @DisplayName("Should handle zero inventory value correctly")
    void getTotalInventoryValueHandlesZeroCorrectly() {
        // Arrange
        when(entityManager.createQuery("SELECT SUM(i.stockOnHand*i.productId.avgPurchaseCost) FROM Inventory i"))
            .thenReturn(query);
        when(query.getSingleResult()).thenReturn(BigDecimal.ZERO);

        // Act
        BigDecimal result = inventoryDao.getTotalInventoryValue();

        // Assert
        assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
    }

    private List<Inventory> createInventoryList(int count) {
        List<Inventory> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            list.add(createInventory(i + 1));
        }
        return list;
    }

    private Inventory createInventory(int id) {
        Inventory inventory = new Inventory();
        inventory.setInventoryId(id);
        inventory.setStockOnHand(100);
        inventory.setReorderLevel(20);
        return inventory;
    }

    private List<Product> createProductList(int count) {
        List<Product> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            list.add(createProduct(i + 1, "Product " + (i + 1)));
        }
        return list;
    }

    private Product createProduct(int id, String name) {
        Product product = new Product();
        product.setProductID(id);
        product.setProductName(name);
        return product;
    }

    private PaginationModel createPaginationModel(int pageNo, int pageSize) {
        PaginationModel model = new PaginationModel();
        model.setPageNo(pageNo);
        model.setPageSize(pageSize);
        return model;
    }
}
