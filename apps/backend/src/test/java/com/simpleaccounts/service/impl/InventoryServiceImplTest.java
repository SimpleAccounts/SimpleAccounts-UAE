package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.InventoryFilterEnum;
import com.simpleaccounts.dao.InventoryDao;
import com.simpleaccounts.entity.Inventory;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.entity.contact.Supplier;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InventoryServiceImplTest {

    @Mock
    private InventoryDao inventoryDao;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    private Inventory testInventory;
    private Product testProduct;
    private Supplier testSupplier;
    private PaginationModel paginationModel;

    @BeforeEach
    void setUp() {
        testProduct = new Product();
        testProduct.setProductId(1);
        testProduct.setProductName("Test Product");
        testProduct.setProductPrice(BigDecimal.valueOf(100.00));

        testSupplier = new Supplier();
        testSupplier.setContactId(1);
        testSupplier.setContactName("Test Supplier");

        testInventory = new Inventory();
        testInventory.setInventoryId(1);
        testInventory.setProductId(testProduct);
        testInventory.setSupplierId(testSupplier);
        testInventory.setQuantityOnHand(100);
        testInventory.setUnitCost(BigDecimal.valueOf(50.00));

        paginationModel = new PaginationModel();
        paginationModel.setPage(0);
        paginationModel.setSize(10);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnInventoryDaoWhenGetDaoCalled() {
        assertThat(inventoryService.getDao()).isEqualTo(inventoryDao);
    }

    @Test
    void shouldReturnNonNullDao() {
        assertThat(inventoryService.getDao()).isNotNull();
    }

    // ========== getInventoryList Tests ==========

    @Test
    void shouldReturnPaginatedInventoryListWhenValidParametersProvided() {
        Map<InventoryFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(InventoryFilterEnum.PRODUCT_ID, 1);

        PaginationResponseModel responseModel = new PaginationResponseModel();
        responseModel.setTotalElements(1L);
        responseModel.setContent(Arrays.asList(testInventory));

        when(inventoryDao.getInventoryList(filterMap, paginationModel)).thenReturn(responseModel);

        PaginationResponseModel result = inventoryService.getInventoryList(filterMap, paginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1L);
        assertThat(result.getContent()).hasSize(1);
        verify(inventoryDao, times(1)).getInventoryList(filterMap, paginationModel);
    }

    @Test
    void shouldReturnEmptyListWhenNoInventoryMatches() {
        Map<InventoryFilterEnum, Object> filterMap = new HashMap<>();
        PaginationResponseModel responseModel = new PaginationResponseModel();
        responseModel.setTotalElements(0L);
        responseModel.setContent(Collections.emptyList());

        when(inventoryDao.getInventoryList(filterMap, paginationModel)).thenReturn(responseModel);

        PaginationResponseModel result = inventoryService.getInventoryList(filterMap, paginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(0L);
        assertThat(result.getContent()).isEmpty();
        verify(inventoryDao, times(1)).getInventoryList(filterMap, paginationModel);
    }

    @Test
    void shouldHandleNullFilterMap() {
        PaginationResponseModel responseModel = new PaginationResponseModel();
        responseModel.setTotalElements(0L);
        responseModel.setContent(Collections.emptyList());

        when(inventoryDao.getInventoryList(null, paginationModel)).thenReturn(responseModel);

        PaginationResponseModel result = inventoryService.getInventoryList(null, paginationModel);

        assertThat(result).isNotNull();
        verify(inventoryDao, times(1)).getInventoryList(null, paginationModel);
    }

    @Test
    void shouldHandleNullPaginationModel() {
        Map<InventoryFilterEnum, Object> filterMap = new HashMap<>();
        PaginationResponseModel responseModel = new PaginationResponseModel();

        when(inventoryDao.getInventoryList(filterMap, null)).thenReturn(responseModel);

        PaginationResponseModel result = inventoryService.getInventoryList(filterMap, null);

        assertThat(result).isNotNull();
        verify(inventoryDao, times(1)).getInventoryList(filterMap, null);
    }

    // ========== getProductByProductId Tests ==========

    @Test
    void shouldReturnInventoryListWhenValidProductIdProvided() {
        List<Inventory> inventoryList = Arrays.asList(testInventory);

        when(inventoryDao.getProductByProductId(1)).thenReturn(inventoryList);

        List<Inventory> result = inventoryService.getProductByProductId(1);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testInventory);
        verify(inventoryDao, times(1)).getProductByProductId(1);
    }

    @Test
    void shouldReturnEmptyListWhenProductIdNotFound() {
        when(inventoryDao.getProductByProductId(999)).thenReturn(Collections.emptyList());

        List<Inventory> result = inventoryService.getProductByProductId(999);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(inventoryDao, times(1)).getProductByProductId(999);
    }

    @Test
    void shouldHandleNullProductId() {
        when(inventoryDao.getProductByProductId(null)).thenReturn(null);

        List<Inventory> result = inventoryService.getProductByProductId(null);

        assertThat(result).isNull();
        verify(inventoryDao, times(1)).getProductByProductId(null);
    }

    @Test
    void shouldReturnMultipleInventoriesForSameProduct() {
        Inventory inventory2 = new Inventory();
        inventory2.setInventoryId(2);
        inventory2.setProductId(testProduct);

        List<Inventory> inventoryList = Arrays.asList(testInventory, inventory2);

        when(inventoryDao.getProductByProductId(1)).thenReturn(inventoryList);

        List<Inventory> result = inventoryService.getProductByProductId(1);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        verify(inventoryDao, times(1)).getProductByProductId(1);
    }

    // ========== getInventoryByProductId Tests ==========

    @Test
    void shouldReturnInventoryWhenValidProductIdProvided() {
        List<Inventory> inventoryList = Arrays.asList(testInventory);

        when(inventoryDao.getInventoryByProductId(1)).thenReturn(inventoryList);

        List<Inventory> result = inventoryService.getInventoryByProductId(1);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getProductId().getProductId()).isEqualTo(1);
        verify(inventoryDao, times(1)).getInventoryByProductId(1);
    }

    @Test
    void shouldReturnEmptyListWhenNoInventoryForProduct() {
        when(inventoryDao.getInventoryByProductId(999)).thenReturn(Collections.emptyList());

        List<Inventory> result = inventoryService.getInventoryByProductId(999);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(inventoryDao, times(1)).getInventoryByProductId(999);
    }

    @Test
    void shouldHandleNullProductIdInGetInventory() {
        when(inventoryDao.getInventoryByProductId(null)).thenReturn(null);

        List<Inventory> result = inventoryService.getInventoryByProductId(null);

        assertThat(result).isNull();
        verify(inventoryDao, times(1)).getInventoryByProductId(null);
    }

    // ========== getProductCountForInventory Tests ==========

    @Test
    void shouldReturnProductCountWhenInventoryHasProducts() {
        when(inventoryDao.getProductCountForInventory()).thenReturn(50);

        Integer result = inventoryService.getProductCountForInventory();

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(50);
        verify(inventoryDao, times(1)).getProductCountForInventory();
    }

    @Test
    void shouldReturnZeroWhenNoProducts() {
        when(inventoryDao.getProductCountForInventory()).thenReturn(0);

        Integer result = inventoryService.getProductCountForInventory();

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(0);
        verify(inventoryDao, times(1)).getProductCountForInventory();
    }

    @Test
    void shouldReturnNullWhenNoData() {
        when(inventoryDao.getProductCountForInventory()).thenReturn(null);

        Integer result = inventoryService.getProductCountForInventory();

        assertThat(result).isNull();
        verify(inventoryDao, times(1)).getProductCountForInventory();
    }

    // ========== totalStockOnHand Tests ==========

    @Test
    void shouldReturnTotalStockWhenInventoryHasStock() {
        when(inventoryDao.totalStockOnHand()).thenReturn(1000);

        Integer result = inventoryService.totalStockOnHand();

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(1000);
        verify(inventoryDao, times(1)).totalStockOnHand();
    }

    @Test
    void shouldReturnZeroWhenNoStock() {
        when(inventoryDao.totalStockOnHand()).thenReturn(0);

        Integer result = inventoryService.totalStockOnHand();

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(0);
        verify(inventoryDao, times(1)).totalStockOnHand();
    }

    @Test
    void shouldReturnNullWhenNoStockData() {
        when(inventoryDao.totalStockOnHand()).thenReturn(null);

        Integer result = inventoryService.totalStockOnHand();

        assertThat(result).isNull();
        verify(inventoryDao, times(1)).totalStockOnHand();
    }

    // ========== getlowStockProductCountForInventory Tests ==========

    @Test
    void shouldReturnLowStockCountWhenLowStockProductsExist() {
        when(inventoryDao.getlowStockProductCountForInventory()).thenReturn(5);

        Integer result = inventoryService.getlowStockProductCountForInventory();

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(5);
        verify(inventoryDao, times(1)).getlowStockProductCountForInventory();
    }

    @Test
    void shouldReturnZeroWhenNoLowStockProducts() {
        when(inventoryDao.getlowStockProductCountForInventory()).thenReturn(0);

        Integer result = inventoryService.getlowStockProductCountForInventory();

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(0);
        verify(inventoryDao, times(1)).getlowStockProductCountForInventory();
    }

    @Test
    void shouldReturnNullWhenNoLowStockData() {
        when(inventoryDao.getlowStockProductCountForInventory()).thenReturn(null);

        Integer result = inventoryService.getlowStockProductCountForInventory();

        assertThat(result).isNull();
        verify(inventoryDao, times(1)).getlowStockProductCountForInventory();
    }

    // ========== getlowStockProductListForInventory Tests ==========

    @Test
    void shouldReturnLowStockProductListWhenProductsExist() {
        List<Product> lowStockProducts = Arrays.asList(testProduct);

        when(inventoryDao.getlowStockProductListForInventory()).thenReturn(lowStockProducts);

        List<Product> result = inventoryService.getlowStockProductListForInventory();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testProduct);
        verify(inventoryDao, times(1)).getlowStockProductListForInventory();
    }

    @Test
    void shouldReturnEmptyListWhenNoLowStockProducts() {
        when(inventoryDao.getlowStockProductListForInventory()).thenReturn(Collections.emptyList());

        List<Product> result = inventoryService.getlowStockProductListForInventory();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(inventoryDao, times(1)).getlowStockProductListForInventory();
    }

    @Test
    void shouldReturnNullWhenNoLowStockProductList() {
        when(inventoryDao.getlowStockProductListForInventory()).thenReturn(null);

        List<Product> result = inventoryService.getlowStockProductListForInventory();

        assertThat(result).isNull();
        verify(inventoryDao, times(1)).getlowStockProductListForInventory();
    }

    // ========== getTopSellingProductListForInventory Tests ==========

    @Test
    void shouldReturnTopSellingProductsWhenDataExists() {
        InventoryListModel product1 = new InventoryListModel();
        List<InventoryListModel> topProducts = Arrays.asList(product1);

        when(inventoryDao.getTopSellingProductListForInventory()).thenReturn(topProducts);

        List<InventoryListModel> result = inventoryService.getTopSellingProductListForInventory();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(inventoryDao, times(1)).getTopSellingProductListForInventory();
    }

    @Test
    void shouldReturnEmptyListWhenNoTopSellingProducts() {
        when(inventoryDao.getTopSellingProductListForInventory()).thenReturn(Collections.emptyList());

        List<InventoryListModel> result = inventoryService.getTopSellingProductListForInventory();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(inventoryDao, times(1)).getTopSellingProductListForInventory();
    }

    @Test
    void shouldReturnNullWhenNoTopSellingProductData() {
        when(inventoryDao.getTopSellingProductListForInventory()).thenReturn(null);

        List<InventoryListModel> result = inventoryService.getTopSellingProductListForInventory();

        assertThat(result).isNull();
        verify(inventoryDao, times(1)).getTopSellingProductListForInventory();
    }

    // ========== getInventoryByProductIdAndSupplierId Tests ==========

    @Test
    void shouldReturnInventoryWhenValidProductIdAndSupplierIdProvided() {
        when(inventoryDao.getInventoryByProductIdAndSupplierId(1, 1)).thenReturn(testInventory);

        Inventory result = inventoryService.getInventoryByProductIdAndSupplierId(1, 1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testInventory);
        assertThat(result.getProductId().getProductId()).isEqualTo(1);
        assertThat(result.getSupplierId().getContactId()).isEqualTo(1);
        verify(inventoryDao, times(1)).getInventoryByProductIdAndSupplierId(1, 1);
    }

    @Test
    void shouldReturnNullWhenInventoryNotFound() {
        when(inventoryDao.getInventoryByProductIdAndSupplierId(999, 999)).thenReturn(null);

        Inventory result = inventoryService.getInventoryByProductIdAndSupplierId(999, 999);

        assertThat(result).isNull();
        verify(inventoryDao, times(1)).getInventoryByProductIdAndSupplierId(999, 999);
    }

    @Test
    void shouldHandleNullProductIdInGetByBothIds() {
        when(inventoryDao.getInventoryByProductIdAndSupplierId(null, 1)).thenReturn(null);

        Inventory result = inventoryService.getInventoryByProductIdAndSupplierId(null, 1);

        assertThat(result).isNull();
        verify(inventoryDao, times(1)).getInventoryByProductIdAndSupplierId(null, 1);
    }

    @Test
    void shouldHandleNullSupplierIdInGetByBothIds() {
        when(inventoryDao.getInventoryByProductIdAndSupplierId(1, null)).thenReturn(null);

        Inventory result = inventoryService.getInventoryByProductIdAndSupplierId(1, null);

        assertThat(result).isNull();
        verify(inventoryDao, times(1)).getInventoryByProductIdAndSupplierId(1, null);
    }

    // ========== getOutOfStockCountOfInventory Tests ==========

    @Test
    void shouldReturnOutOfStockCountWhenProductsOutOfStock() {
        when(inventoryDao.getOutOfStockCountOfInventory()).thenReturn(10);

        Integer result = inventoryService.getOutOfStockCountOfInventory();

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(10);
        verify(inventoryDao, times(1)).getOutOfStockCountOfInventory();
    }

    @Test
    void shouldReturnZeroWhenNoProductsOutOfStock() {
        when(inventoryDao.getOutOfStockCountOfInventory()).thenReturn(0);

        Integer result = inventoryService.getOutOfStockCountOfInventory();

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(0);
        verify(inventoryDao, times(1)).getOutOfStockCountOfInventory();
    }

    @Test
    void shouldReturnNullWhenNoOutOfStockData() {
        when(inventoryDao.getOutOfStockCountOfInventory()).thenReturn(null);

        Integer result = inventoryService.getOutOfStockCountOfInventory();

        assertThat(result).isNull();
        verify(inventoryDao, times(1)).getOutOfStockCountOfInventory();
    }

    // ========== getTotalInventoryValue Tests ==========

    @Test
    void shouldReturnTotalInventoryValueWhenInventoryExists() {
        BigDecimal expectedValue = BigDecimal.valueOf(50000.00);

        when(inventoryDao.getTotalInventoryValue()).thenReturn(expectedValue);

        BigDecimal result = inventoryService.getTotalInventoryValue();

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(expectedValue);
        verify(inventoryDao, times(1)).getTotalInventoryValue();
    }

    @Test
    void shouldReturnZeroWhenNoInventoryValue() {
        when(inventoryDao.getTotalInventoryValue()).thenReturn(BigDecimal.ZERO);

        BigDecimal result = inventoryService.getTotalInventoryValue();

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(BigDecimal.ZERO);
        verify(inventoryDao, times(1)).getTotalInventoryValue();
    }

    @Test
    void shouldReturnNullWhenNoInventoryValueData() {
        when(inventoryDao.getTotalInventoryValue()).thenReturn(null);

        BigDecimal result = inventoryService.getTotalInventoryValue();

        assertThat(result).isNull();
        verify(inventoryDao, times(1)).getTotalInventoryValue();
    }

    @Test
    void shouldHandleLargeInventoryValue() {
        BigDecimal largeValue = BigDecimal.valueOf(999999999.99);

        when(inventoryDao.getTotalInventoryValue()).thenReturn(largeValue);

        BigDecimal result = inventoryService.getTotalInventoryValue();

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(largeValue);
        verify(inventoryDao, times(1)).getTotalInventoryValue();
    }

    // ========== getTotalInventoryCountForContact Tests ==========

    @Test
    void shouldReturnInventoryCountWhenContactHasInventory() {
        when(inventoryDao.getTotalInventoryCountForContact(1)).thenReturn(25);

        Integer result = inventoryService.getTotalInventoryCountForContact(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(25);
        verify(inventoryDao, times(1)).getTotalInventoryCountForContact(1);
    }

    @Test
    void shouldReturnZeroWhenContactHasNoInventory() {
        when(inventoryDao.getTotalInventoryCountForContact(999)).thenReturn(0);

        Integer result = inventoryService.getTotalInventoryCountForContact(999);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(0);
        verify(inventoryDao, times(1)).getTotalInventoryCountForContact(999);
    }

    @Test
    void shouldReturnNullWhenNoInventoryCountData() {
        when(inventoryDao.getTotalInventoryCountForContact(0)).thenReturn(null);

        Integer result = inventoryService.getTotalInventoryCountForContact(0);

        assertThat(result).isNull();
        verify(inventoryDao, times(1)).getTotalInventoryCountForContact(0);
    }

    @Test
    void shouldHandleNegativeContactId() {
        when(inventoryDao.getTotalInventoryCountForContact(-1)).thenReturn(0);

        Integer result = inventoryService.getTotalInventoryCountForContact(-1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(0);
        verify(inventoryDao, times(1)).getTotalInventoryCountForContact(-1);
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldPersistNewInventory() {
        inventoryService.persist(testInventory);

        verify(inventoryDao, times(1)).persist(testInventory);
    }

    @Test
    void shouldUpdateExistingInventory() {
        when(inventoryDao.update(testInventory)).thenReturn(testInventory);

        Inventory result = inventoryService.update(testInventory);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testInventory);
        verify(inventoryDao, times(1)).update(testInventory);
    }

    @Test
    void shouldDeleteInventory() {
        inventoryService.delete(testInventory);

        verify(inventoryDao, times(1)).delete(testInventory);
    }

    @Test
    void shouldFindInventoryByPrimaryKey() {
        when(inventoryDao.findByPK(1)).thenReturn(testInventory);

        Inventory result = inventoryService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testInventory);
        verify(inventoryDao, times(1)).findByPK(1);
    }
}
