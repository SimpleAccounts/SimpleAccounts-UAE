package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.InventoryHistoryDao;
import com.simpleaccounts.entity.Inventory;
import com.simpleaccounts.entity.InventoryHistory;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.entity.contact.Supplier;
import com.simpleaccounts.rest.InventoryController.InventoryRevenueModel;
import com.simpleaccounts.rest.InventoryController.TopInventoryRevenueModel;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InventoryHistoryServiceImplTest {

    @Mock
    private InventoryHistoryDao inventoryHistoryDao;

    @InjectMocks
    private InventoryHistoryServiceImpl inventoryHistoryService;

    private InventoryHistory testInventoryHistory;
    private Inventory testInventory;
    private Product testProduct;
    private Supplier testSupplier;

    @BeforeEach
    void setUp() {
        testProduct = new Product();
        testProduct.setProductId(1);
        testProduct.setProductName("Test Product");

        testSupplier = new Supplier();
        testSupplier.setContactId(1);
        testSupplier.setContactName("Test Supplier");

        testInventory = new Inventory();
        testInventory.setInventoryId(1);
        testInventory.setProductId(testProduct);
        testInventory.setSupplierId(testSupplier);
        testInventory.setQuantityOnHand(100);

        testInventoryHistory = new InventoryHistory();
        testInventoryHistory.setInventoryHistoryId(1);
        testInventoryHistory.setInventoryId(testInventory);
        testInventoryHistory.setQuantitySold(10);
        testInventoryHistory.setTransactionDate(LocalDateTime.now());
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnInventoryHistoryDaoWhenGetDaoCalled() {
        assertThat(inventoryHistoryService.getDao()).isEqualTo(inventoryHistoryDao);
    }

    @Test
    void shouldReturnNonNullDao() {
        assertThat(inventoryHistoryService.getDao()).isNotNull();
    }

    // ========== getHistoryByInventoryId Tests ==========

    @Test
    void shouldReturnInventoryHistoryWhenValidInventoryIdProvided() {
        when(inventoryHistoryDao.getHistoryByInventoryId(1)).thenReturn(testInventoryHistory);

        InventoryHistory result = inventoryHistoryService.getHistoryByInventoryId(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testInventoryHistory);
        assertThat(result.getInventoryHistoryId()).isEqualTo(1);
        verify(inventoryHistoryDao, times(1)).getHistoryByInventoryId(1);
    }

    @Test
    void shouldReturnNullWhenInventoryIdNotFound() {
        when(inventoryHistoryDao.getHistoryByInventoryId(999)).thenReturn(null);

        InventoryHistory result = inventoryHistoryService.getHistoryByInventoryId(999);

        assertThat(result).isNull();
        verify(inventoryHistoryDao, times(1)).getHistoryByInventoryId(999);
    }

    @Test
    void shouldHandleNullInventoryId() {
        when(inventoryHistoryDao.getHistoryByInventoryId(null)).thenReturn(null);

        InventoryHistory result = inventoryHistoryService.getHistoryByInventoryId(null);

        assertThat(result).isNull();
        verify(inventoryHistoryDao, times(1)).getHistoryByInventoryId(null);
    }

    @Test
    void shouldHandleZeroInventoryId() {
        when(inventoryHistoryDao.getHistoryByInventoryId(0)).thenReturn(null);

        InventoryHistory result = inventoryHistoryService.getHistoryByInventoryId(0);

        assertThat(result).isNull();
        verify(inventoryHistoryDao, times(1)).getHistoryByInventoryId(0);
    }

    @Test
    void shouldHandleNegativeInventoryId() {
        when(inventoryHistoryDao.getHistoryByInventoryId(-1)).thenReturn(null);

        InventoryHistory result = inventoryHistoryService.getHistoryByInventoryId(-1);

        assertThat(result).isNull();
        verify(inventoryHistoryDao, times(1)).getHistoryByInventoryId(-1);
    }

    // ========== getTotalRevenueForInventory Tests ==========

    @Test
    void shouldReturnTotalRevenueWhenInventoryHasRevenue() {
        InventoryRevenueModel revenueModel = new InventoryRevenueModel();
        revenueModel.setTotalRevenue(BigDecimal.valueOf(5000.00));

        when(inventoryHistoryDao.getTotalRevenueForInventory()).thenReturn(revenueModel);

        InventoryRevenueModel result = inventoryHistoryService.getTotalRevenueForInventory();

        assertThat(result).isNotNull();
        assertThat(result.getTotalRevenue()).isEqualTo(BigDecimal.valueOf(5000.00));
        verify(inventoryHistoryDao, times(1)).getTotalRevenueForInventory();
    }

    @Test
    void shouldReturnNullWhenNoRevenueData() {
        when(inventoryHistoryDao.getTotalRevenueForInventory()).thenReturn(null);

        InventoryRevenueModel result = inventoryHistoryService.getTotalRevenueForInventory();

        assertThat(result).isNull();
        verify(inventoryHistoryDao, times(1)).getTotalRevenueForInventory();
    }

    @Test
    void shouldReturnZeroRevenueWhenNoSales() {
        InventoryRevenueModel revenueModel = new InventoryRevenueModel();
        revenueModel.setTotalRevenue(BigDecimal.ZERO);

        when(inventoryHistoryDao.getTotalRevenueForInventory()).thenReturn(revenueModel);

        InventoryRevenueModel result = inventoryHistoryService.getTotalRevenueForInventory();

        assertThat(result).isNotNull();
        assertThat(result.getTotalRevenue()).isEqualTo(BigDecimal.ZERO);
        verify(inventoryHistoryDao, times(1)).getTotalRevenueForInventory();
    }

    // ========== getTotalQuantitySoldForInventory Tests ==========

    @Test
    void shouldReturnTotalQuantitySoldWhenInventoryHasSales() {
        InventoryRevenueModel revenueModel = new InventoryRevenueModel();
        revenueModel.setTotalQuantitySold(500);

        when(inventoryHistoryDao.getTotalQuantitySoldForInventory()).thenReturn(revenueModel);

        InventoryRevenueModel result = inventoryHistoryService.getTotalQuantitySoldForInventory();

        assertThat(result).isNotNull();
        assertThat(result.getTotalQuantitySold()).isEqualTo(500);
        verify(inventoryHistoryDao, times(1)).getTotalQuantitySoldForInventory();
    }

    @Test
    void shouldReturnNullWhenNoQuantitySoldData() {
        when(inventoryHistoryDao.getTotalQuantitySoldForInventory()).thenReturn(null);

        InventoryRevenueModel result = inventoryHistoryService.getTotalQuantitySoldForInventory();

        assertThat(result).isNull();
        verify(inventoryHistoryDao, times(1)).getTotalQuantitySoldForInventory();
    }

    @Test
    void shouldReturnZeroQuantitySoldWhenNoSales() {
        InventoryRevenueModel revenueModel = new InventoryRevenueModel();
        revenueModel.setTotalQuantitySold(0);

        when(inventoryHistoryDao.getTotalQuantitySoldForInventory()).thenReturn(revenueModel);

        InventoryRevenueModel result = inventoryHistoryService.getTotalQuantitySoldForInventory();

        assertThat(result).isNotNull();
        assertThat(result.getTotalQuantitySold()).isEqualTo(0);
        verify(inventoryHistoryDao, times(1)).getTotalQuantitySoldForInventory();
    }

    // ========== getTopSellingProductsForInventory Tests ==========

    @Test
    void shouldReturnTopSellingProductsWhenDataExists() {
        TopInventoryRevenueModel topProducts = new TopInventoryRevenueModel();
        List<InventoryRevenueModel> products = new ArrayList<>();
        InventoryRevenueModel product1 = new InventoryRevenueModel();
        product1.setTotalQuantitySold(100);
        products.add(product1);
        topProducts.setTopProducts(products);

        when(inventoryHistoryDao.getTopSellingProductsForInventory()).thenReturn(topProducts);

        TopInventoryRevenueModel result = inventoryHistoryService.getTopSellingProductsForInventory();

        assertThat(result).isNotNull();
        assertThat(result.getTopProducts()).hasSize(1);
        verify(inventoryHistoryDao, times(1)).getTopSellingProductsForInventory();
    }

    @Test
    void shouldReturnNullWhenNoTopSellingProducts() {
        when(inventoryHistoryDao.getTopSellingProductsForInventory()).thenReturn(null);

        TopInventoryRevenueModel result = inventoryHistoryService.getTopSellingProductsForInventory();

        assertThat(result).isNull();
        verify(inventoryHistoryDao, times(1)).getTopSellingProductsForInventory();
    }

    @Test
    void shouldReturnEmptyListWhenNoProducts() {
        TopInventoryRevenueModel topProducts = new TopInventoryRevenueModel();
        topProducts.setTopProducts(Collections.emptyList());

        when(inventoryHistoryDao.getTopSellingProductsForInventory()).thenReturn(topProducts);

        TopInventoryRevenueModel result = inventoryHistoryService.getTopSellingProductsForInventory();

        assertThat(result).isNotNull();
        assertThat(result.getTopProducts()).isEmpty();
        verify(inventoryHistoryDao, times(1)).getTopSellingProductsForInventory();
    }

    // ========== getTopProfitGeneratingProductsForInventory Tests ==========

    @Test
    void shouldReturnTopProfitGeneratingProductsWhenDataExists() {
        TopInventoryRevenueModel topProducts = new TopInventoryRevenueModel();
        List<InventoryRevenueModel> products = new ArrayList<>();
        InventoryRevenueModel product1 = new InventoryRevenueModel();
        product1.setTotalRevenue(BigDecimal.valueOf(10000.00));
        products.add(product1);
        topProducts.setTopProducts(products);

        when(inventoryHistoryDao.getTopProfitGeneratingProductsForInventory()).thenReturn(topProducts);

        TopInventoryRevenueModel result = inventoryHistoryService.getTopProfitGeneratingProductsForInventory();

        assertThat(result).isNotNull();
        assertThat(result.getTopProducts()).hasSize(1);
        verify(inventoryHistoryDao, times(1)).getTopProfitGeneratingProductsForInventory();
    }

    @Test
    void shouldReturnNullWhenNoProfitGeneratingProducts() {
        when(inventoryHistoryDao.getTopProfitGeneratingProductsForInventory()).thenReturn(null);

        TopInventoryRevenueModel result = inventoryHistoryService.getTopProfitGeneratingProductsForInventory();

        assertThat(result).isNull();
        verify(inventoryHistoryDao, times(1)).getTopProfitGeneratingProductsForInventory();
    }

    @Test
    void shouldHandleMultipleTopProfitProducts() {
        TopInventoryRevenueModel topProducts = new TopInventoryRevenueModel();
        List<InventoryRevenueModel> products = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            InventoryRevenueModel product = new InventoryRevenueModel();
            product.setTotalRevenue(BigDecimal.valueOf(i * 1000.00));
            products.add(product);
        }
        topProducts.setTopProducts(products);

        when(inventoryHistoryDao.getTopProfitGeneratingProductsForInventory()).thenReturn(topProducts);

        TopInventoryRevenueModel result = inventoryHistoryService.getTopProfitGeneratingProductsForInventory();

        assertThat(result).isNotNull();
        assertThat(result.getTopProducts()).hasSize(5);
        verify(inventoryHistoryDao, times(1)).getTopProfitGeneratingProductsForInventory();
    }

    // ========== getLowSellingProductsForInventory Tests ==========

    @Test
    void shouldReturnLowSellingProductsWhenDataExists() {
        TopInventoryRevenueModel lowProducts = new TopInventoryRevenueModel();
        List<InventoryRevenueModel> products = new ArrayList<>();
        InventoryRevenueModel product1 = new InventoryRevenueModel();
        product1.setTotalQuantitySold(5);
        products.add(product1);
        lowProducts.setTopProducts(products);

        when(inventoryHistoryDao.getLowSellingProductsForInventory()).thenReturn(lowProducts);

        TopInventoryRevenueModel result = inventoryHistoryService.getLowSellingProductsForInventory();

        assertThat(result).isNotNull();
        assertThat(result.getTopProducts()).hasSize(1);
        verify(inventoryHistoryDao, times(1)).getLowSellingProductsForInventory();
    }

    @Test
    void shouldReturnNullWhenNoLowSellingProducts() {
        when(inventoryHistoryDao.getLowSellingProductsForInventory()).thenReturn(null);

        TopInventoryRevenueModel result = inventoryHistoryService.getLowSellingProductsForInventory();

        assertThat(result).isNull();
        verify(inventoryHistoryDao, times(1)).getLowSellingProductsForInventory();
    }

    @Test
    void shouldHandleEmptyLowSellingProductsList() {
        TopInventoryRevenueModel lowProducts = new TopInventoryRevenueModel();
        lowProducts.setTopProducts(Collections.emptyList());

        when(inventoryHistoryDao.getLowSellingProductsForInventory()).thenReturn(lowProducts);

        TopInventoryRevenueModel result = inventoryHistoryService.getLowSellingProductsForInventory();

        assertThat(result).isNotNull();
        assertThat(result.getTopProducts()).isEmpty();
        verify(inventoryHistoryDao, times(1)).getLowSellingProductsForInventory();
    }

    // ========== getHistory Tests ==========

    @Test
    void shouldReturnHistoryListWhenValidProductIdAndSupplierIdProvided() {
        List<InventoryHistory> historyList = Arrays.asList(testInventoryHistory);

        when(inventoryHistoryDao.getHistory(1, 1)).thenReturn(historyList);

        List<InventoryHistory> result = inventoryHistoryService.getHistory(1, 1);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testInventoryHistory);
        verify(inventoryHistoryDao, times(1)).getHistory(1, 1);
    }

    @Test
    void shouldReturnEmptyListWhenNoHistoryFound() {
        when(inventoryHistoryDao.getHistory(999, 999)).thenReturn(Collections.emptyList());

        List<InventoryHistory> result = inventoryHistoryService.getHistory(999, 999);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(inventoryHistoryDao, times(1)).getHistory(999, 999);
    }

    @Test
    void shouldReturnNullWhenNullProductId() {
        when(inventoryHistoryDao.getHistory(null, 1)).thenReturn(null);

        List<InventoryHistory> result = inventoryHistoryService.getHistory(null, 1);

        assertThat(result).isNull();
        verify(inventoryHistoryDao, times(1)).getHistory(null, 1);
    }

    @Test
    void shouldReturnNullWhenNullSupplierId() {
        when(inventoryHistoryDao.getHistory(1, null)).thenReturn(null);

        List<InventoryHistory> result = inventoryHistoryService.getHistory(1, null);

        assertThat(result).isNull();
        verify(inventoryHistoryDao, times(1)).getHistory(1, null);
    }

    @Test
    void shouldReturnNullWhenBothIdsAreNull() {
        when(inventoryHistoryDao.getHistory(null, null)).thenReturn(null);

        List<InventoryHistory> result = inventoryHistoryService.getHistory(null, null);

        assertThat(result).isNull();
        verify(inventoryHistoryDao, times(1)).getHistory(null, null);
    }

    @Test
    void shouldReturnMultipleHistoryRecords() {
        InventoryHistory history2 = new InventoryHistory();
        history2.setInventoryHistoryId(2);
        history2.setInventoryId(testInventory);

        InventoryHistory history3 = new InventoryHistory();
        history3.setInventoryHistoryId(3);
        history3.setInventoryId(testInventory);

        List<InventoryHistory> historyList = Arrays.asList(testInventoryHistory, history2, history3);

        when(inventoryHistoryDao.getHistory(1, 1)).thenReturn(historyList);

        List<InventoryHistory> result = inventoryHistoryService.getHistory(1, 1);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testInventoryHistory, history2, history3);
        verify(inventoryHistoryDao, times(1)).getHistory(1, 1);
    }

    @Test
    void shouldHandleZeroProductId() {
        when(inventoryHistoryDao.getHistory(0, 1)).thenReturn(Collections.emptyList());

        List<InventoryHistory> result = inventoryHistoryService.getHistory(0, 1);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(inventoryHistoryDao, times(1)).getHistory(0, 1);
    }

    @Test
    void shouldHandleZeroSupplierId() {
        when(inventoryHistoryDao.getHistory(1, 0)).thenReturn(Collections.emptyList());

        List<InventoryHistory> result = inventoryHistoryService.getHistory(1, 0);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(inventoryHistoryDao, times(1)).getHistory(1, 0);
    }

    @Test
    void shouldHandleNegativeProductId() {
        when(inventoryHistoryDao.getHistory(-1, 1)).thenReturn(Collections.emptyList());

        List<InventoryHistory> result = inventoryHistoryService.getHistory(-1, 1);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(inventoryHistoryDao, times(1)).getHistory(-1, 1);
    }

    @Test
    void shouldHandleNegativeSupplierId() {
        when(inventoryHistoryDao.getHistory(1, -1)).thenReturn(Collections.emptyList());

        List<InventoryHistory> result = inventoryHistoryService.getHistory(1, -1);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(inventoryHistoryDao, times(1)).getHistory(1, -1);
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldPersistNewInventoryHistory() {
        inventoryHistoryService.persist(testInventoryHistory);

        verify(inventoryHistoryDao, times(1)).persist(testInventoryHistory);
    }

    @Test
    void shouldUpdateExistingInventoryHistory() {
        when(inventoryHistoryDao.update(testInventoryHistory)).thenReturn(testInventoryHistory);

        InventoryHistory result = inventoryHistoryService.update(testInventoryHistory);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testInventoryHistory);
        verify(inventoryHistoryDao, times(1)).update(testInventoryHistory);
    }

    @Test
    void shouldDeleteInventoryHistory() {
        inventoryHistoryService.delete(testInventoryHistory);

        verify(inventoryHistoryDao, times(1)).delete(testInventoryHistory);
    }

    @Test
    void shouldFindInventoryHistoryByPrimaryKey() {
        when(inventoryHistoryDao.findByPK(1)).thenReturn(testInventoryHistory);

        InventoryHistory result = inventoryHistoryService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testInventoryHistory);
        verify(inventoryHistoryDao, times(1)).findByPK(1);
    }
}
