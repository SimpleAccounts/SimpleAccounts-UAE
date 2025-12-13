package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.InventoryHistoryDao;
import com.simpleaccounts.entity.Inventory;
import com.simpleaccounts.entity.InventoryHistory;
import com.simpleaccounts.rest.InventoryController.InventoryRevenueModel;
import com.simpleaccounts.rest.InventoryController.TopInventoryRevenueModel;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("InventoryHistoryServiceImpl Unit Tests")
class InventoryHistoryServiceImplTest {

    @Mock
    private InventoryHistoryDao inventoryHistoryDao;

    @InjectMocks
    private InventoryHistoryServiceImpl inventoryHistoryService;

    @Nested
    @DisplayName("getHistoryByInventoryId Tests")
    class GetHistoryByInventoryIdTests {

        @Test
        @DisplayName("Should return history by inventory ID")
        void getHistoryByInventoryIdReturnsHistory() {
            // Arrange
            Integer inventoryId = 1;
            InventoryHistory expectedHistory = createInventoryHistory(1, 100, 50.0f);

            when(inventoryHistoryDao.getHistoryByInventoryId(inventoryId))
                .thenReturn(expectedHistory);

            // Act
            InventoryHistory result = inventoryHistoryService.getHistoryByInventoryId(inventoryId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getQuantity()).isEqualTo(100);
            verify(inventoryHistoryDao).getHistoryByInventoryId(inventoryId);
        }

        @Test
        @DisplayName("Should return null when history not found")
        void getHistoryByInventoryIdReturnsNullWhenNotFound() {
            // Arrange
            Integer inventoryId = 999;

            when(inventoryHistoryDao.getHistoryByInventoryId(inventoryId))
                .thenReturn(null);

            // Act
            InventoryHistory result = inventoryHistoryService.getHistoryByInventoryId(inventoryId);

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("getTotalRevenueForInventory Tests")
    class GetTotalRevenueForInventoryTests {

        @Test
        @DisplayName("Should return total revenue model")
        void getTotalRevenueForInventoryReturnsRevenueModel() {
            // Arrange
            InventoryRevenueModel expectedModel = createInventoryRevenueModel();

            when(inventoryHistoryDao.getTotalRevenueForInventory())
                .thenReturn(expectedModel);

            // Act
            InventoryRevenueModel result = inventoryHistoryService.getTotalRevenueForInventory();

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getTotalRevenueMonthly()).isEqualTo(new BigDecimal("10000.00"));
            verify(inventoryHistoryDao).getTotalRevenueForInventory();
        }

        @Test
        @DisplayName("Should return null when no revenue data")
        void getTotalRevenueForInventoryReturnsNull() {
            // Arrange
            when(inventoryHistoryDao.getTotalRevenueForInventory())
                .thenReturn(null);

            // Act
            InventoryRevenueModel result = inventoryHistoryService.getTotalRevenueForInventory();

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("getTotalQuantitySoldForInventory Tests")
    class GetTotalQuantitySoldForInventoryTests {

        @Test
        @DisplayName("Should return total quantity sold model")
        void getTotalQuantitySoldForInventoryReturnsModel() {
            // Arrange
            InventoryRevenueModel expectedModel = createInventoryRevenueModel();
            expectedModel.setTotalQtySoldMonthly(new BigDecimal("500"));

            when(inventoryHistoryDao.getTotalQuantitySoldForInventory())
                .thenReturn(expectedModel);

            // Act
            InventoryRevenueModel result = inventoryHistoryService.getTotalQuantitySoldForInventory();

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getTotalQtySoldMonthly()).isEqualTo(new BigDecimal("500"));
            verify(inventoryHistoryDao).getTotalQuantitySoldForInventory();
        }
    }

    @Nested
    @DisplayName("getTopSellingProductsForInventory Tests")
    class GetTopSellingProductsForInventoryTests {

        @Test
        @DisplayName("Should return top selling products model")
        void getTopSellingProductsForInventoryReturnsModel() {
            // Arrange
            TopInventoryRevenueModel expectedModel = createTopInventoryRevenueModel();

            when(inventoryHistoryDao.getTopSellingProductsForInventory())
                .thenReturn(expectedModel);

            // Act
            TopInventoryRevenueModel result = inventoryHistoryService.getTopSellingProductsForInventory();

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getTopSellingProductsMonthly()).isNotNull();
            verify(inventoryHistoryDao).getTopSellingProductsForInventory();
        }
    }

    @Nested
    @DisplayName("getTopProfitGeneratingProductsForInventory Tests")
    class GetTopProfitGeneratingProductsForInventoryTests {

        @Test
        @DisplayName("Should return top profit generating products model")
        void getTopProfitGeneratingProductsReturnsModel() {
            // Arrange
            TopInventoryRevenueModel expectedModel = createTopInventoryRevenueModel();

            when(inventoryHistoryDao.getTopProfitGeneratingProductsForInventory())
                .thenReturn(expectedModel);

            // Act
            TopInventoryRevenueModel result = inventoryHistoryService.getTopProfitGeneratingProductsForInventory();

            // Assert
            assertThat(result).isNotNull();
            verify(inventoryHistoryDao).getTopProfitGeneratingProductsForInventory();
        }
    }

    @Nested
    @DisplayName("getLowSellingProductsForInventory Tests")
    class GetLowSellingProductsForInventoryTests {

        @Test
        @DisplayName("Should return low selling products model")
        void getLowSellingProductsForInventoryReturnsModel() {
            // Arrange
            TopInventoryRevenueModel expectedModel = createTopInventoryRevenueModel();

            when(inventoryHistoryDao.getLowSellingProductsForInventory())
                .thenReturn(expectedModel);

            // Act
            TopInventoryRevenueModel result = inventoryHistoryService.getLowSellingProductsForInventory();

            // Assert
            assertThat(result).isNotNull();
            verify(inventoryHistoryDao).getLowSellingProductsForInventory();
        }
    }

    @Nested
    @DisplayName("getHistory Tests")
    class GetHistoryTests {

        @Test
        @DisplayName("Should return history list by product and supplier ID")
        void getHistoryReturnsHistoryList() {
            // Arrange
            Integer productId = 1;
            Integer supplierId = 2;
            List<InventoryHistory> expectedHistory = createInventoryHistoryList(5);

            when(inventoryHistoryDao.getHistory(productId, supplierId))
                .thenReturn(expectedHistory);

            // Act
            List<InventoryHistory> result = inventoryHistoryService.getHistory(productId, supplierId);

            // Assert
            assertThat(result).isNotNull().hasSize(5);
            verify(inventoryHistoryDao).getHistory(productId, supplierId);
        }

        @Test
        @DisplayName("Should return empty list when no history exists")
        void getHistoryReturnsEmptyList() {
            // Arrange
            Integer productId = 999;
            Integer supplierId = 999;

            when(inventoryHistoryDao.getHistory(productId, supplierId))
                .thenReturn(new ArrayList<>());

            // Act
            List<InventoryHistory> result = inventoryHistoryService.getHistory(productId, supplierId);

            // Assert
            assertThat(result).isNotNull().isEmpty();
        }
    }

    @Nested
    @DisplayName("findByPK Tests")
    class FindByPKTests {

        @Test
        @DisplayName("Should return inventory history by ID")
        void findByPKReturnsHistory() {
            // Arrange
            Integer historyId = 1;
            InventoryHistory expectedHistory = createInventoryHistory(historyId, 100, 50.0f);

            when(inventoryHistoryDao.findByPK(historyId))
                .thenReturn(expectedHistory);

            // Act
            InventoryHistory result = inventoryHistoryService.findByPK(historyId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getInventoryHistoryId()).isEqualTo(historyId);
            verify(inventoryHistoryDao).findByPK(historyId);
        }

        @Test
        @DisplayName("Should return null when history not found")
        void findByPKReturnsNullWhenNotFound() {
            // Arrange
            Integer historyId = 999;

            when(inventoryHistoryDao.findByPK(historyId))
                .thenReturn(null);

            // Act
            InventoryHistory result = inventoryHistoryService.findByPK(historyId);

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("persist Tests")
    class PersistTests {

        @Test
        @DisplayName("Should persist new inventory history")
        void persistHistorySaves() {
            // Arrange
            InventoryHistory history = createInventoryHistory(null, 50, 25.0f);

            // Act
            inventoryHistoryService.persist(history);

            // Assert
            verify(inventoryHistoryDao).persist(history);
        }
    }

    @Nested
    @DisplayName("update Tests")
    class UpdateTests {

        @Test
        @DisplayName("Should update existing inventory history")
        void updateHistoryUpdates() {
            // Arrange
            InventoryHistory history = createInventoryHistory(1, 75, 35.0f);

            when(inventoryHistoryDao.update(history)).thenReturn(history);

            // Act
            InventoryHistory result = inventoryHistoryService.update(history);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getQuantity()).isEqualTo(75);
            verify(inventoryHistoryDao).update(history);
        }
    }

    private List<InventoryHistory> createInventoryHistoryList(int count) {
        List<InventoryHistory> histories = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            histories.add(createInventoryHistory(i, 10 * i, 5.0f * i));
        }
        return histories;
    }

    private InventoryHistory createInventoryHistory(Integer id, Integer quantity, Float unitCost) {
        InventoryHistory history = new InventoryHistory();
        history.setInventoryHistoryId(id);
        history.setQuantity(quantity);
        history.setUnitCost(unitCost);
        history.setUnitSellingPrice(unitCost * 1.5f);
        history.setTransactionDate(LocalDate.now());
        history.setCreatedDate(LocalDateTime.now());

        Inventory inventory = new Inventory();
        inventory.setInventoryID(1);
        inventory.setStockOnHand(100);
        history.setInventory(inventory);

        return history;
    }

    private InventoryRevenueModel createInventoryRevenueModel() {
        InventoryRevenueModel model = new InventoryRevenueModel();
        model.setTotalRevenueMonthly(new BigDecimal("10000.00"));
        model.setTotalRevenueQuarterly(new BigDecimal("30000.00"));
        model.setTotalRevenueSixMonthly(new BigDecimal("60000.00"));
        model.setTotalRevenueYearly(new BigDecimal("120000.00"));
        return model;
    }

    private TopInventoryRevenueModel createTopInventoryRevenueModel() {
        TopInventoryRevenueModel model = new TopInventoryRevenueModel();

        Map<String, BigDecimal> monthlyProducts = new HashMap<>();
        monthlyProducts.put("Product A", new BigDecimal("5000.00"));
        monthlyProducts.put("Product B", new BigDecimal("3000.00"));
        model.setTopSellingProductsMonthly(monthlyProducts);

        Map<String, BigDecimal> quarterlyProducts = new HashMap<>();
        quarterlyProducts.put("Product A", new BigDecimal("15000.00"));
        quarterlyProducts.put("Product B", new BigDecimal("9000.00"));
        model.setTopSellingProductsQuarterly(quarterlyProducts);

        return model;
    }
}
