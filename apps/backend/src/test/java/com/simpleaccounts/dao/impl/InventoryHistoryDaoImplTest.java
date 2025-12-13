package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.InventoryHistoryDao;
import com.simpleaccounts.entity.Inventory;
import com.simpleaccounts.entity.InventoryHistory;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.rest.InventoryController.InventoryRevenueModel;
import com.simpleaccounts.rest.InventoryController.TopInventoryRevenueModel;
import com.simpleaccounts.utils.DateUtils;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
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
@DisplayName("InventoryHistoryDaoImpl Unit Tests")
class InventoryHistoryDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private DateUtils dateUtil;

    @Mock
    private TypedQuery<InventoryHistory> historyTypedQuery;

    @Mock
    private TypedQuery<Double> doubleTypedQuery;

    @Mock
    private TypedQuery<BigDecimal> bigDecimalTypedQuery;

    @Mock
    private Query query;

    @InjectMocks
    private InventoryHistoryDaoImpl inventoryHistoryDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(inventoryHistoryDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(inventoryHistoryDao, "entityClass", InventoryHistory.class);
    }

    @Nested
    @DisplayName("getHistoryByInventoryId Tests")
    class GetHistoryByInventoryIdTests {

        @Test
        @DisplayName("Should return history by inventory ID")
        void getHistoryByInventoryIdReturnsHistory() {
            // Arrange
            Integer inventoryId = 1;
            InventoryHistory expectedHistory = createInventoryHistory(1, 100, 50.0f);
            List<InventoryHistory> historyList = new ArrayList<>();
            historyList.add(expectedHistory);

            when(entityManager.createNamedQuery("getHistoryByInventoryId", InventoryHistory.class))
                .thenReturn(historyTypedQuery);
            when(historyTypedQuery.setParameter("inventoryId", inventoryId))
                .thenReturn(historyTypedQuery);
            when(historyTypedQuery.getResultList())
                .thenReturn(historyList);
            when(historyTypedQuery.getSingleResult())
                .thenReturn(expectedHistory);

            // Act
            InventoryHistory result = inventoryHistoryDao.getHistoryByInventoryId(inventoryId);

            // Assert
            assertThat(result).isNotNull();
            verify(entityManager).createNamedQuery("getHistoryByInventoryId", InventoryHistory.class);
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

            when(entityManager.createQuery(anyString()))
                .thenReturn(query);
            when(query.setParameter("productId", productId))
                .thenReturn(query);
            when(query.setParameter("supplierId", supplierId))
                .thenReturn(query);
            when(query.getResultList())
                .thenReturn(expectedHistory);

            // Act
            List<InventoryHistory> result = inventoryHistoryDao.getHistory(productId, supplierId);

            // Assert
            assertThat(result).isNotNull().hasSize(5);
        }

        @Test
        @DisplayName("Should return empty list when no history exists")
        void getHistoryReturnsEmptyList() {
            // Arrange
            Integer productId = 999;
            Integer supplierId = 999;

            when(entityManager.createQuery(anyString()))
                .thenReturn(query);
            when(query.setParameter("productId", productId))
                .thenReturn(query);
            when(query.setParameter("supplierId", supplierId))
                .thenReturn(query);
            when(query.getResultList())
                .thenReturn(new ArrayList<>());

            // Act
            List<InventoryHistory> result = inventoryHistoryDao.getHistory(productId, supplierId);

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

            when(entityManager.find(InventoryHistory.class, historyId))
                .thenReturn(expectedHistory);

            // Act
            InventoryHistory result = inventoryHistoryDao.findByPK(historyId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getInventoryHistoryId()).isEqualTo(historyId);
        }

        @Test
        @DisplayName("Should return null when history not found")
        void findByPKReturnsNullWhenNotFound() {
            // Arrange
            Integer historyId = 999;

            when(entityManager.find(InventoryHistory.class, historyId))
                .thenReturn(null);

            // Act
            InventoryHistory result = inventoryHistoryDao.findByPK(historyId);

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("persist Tests")
    class PersistTests {

        @Test
        @DisplayName("Should persist new inventory history")
        void persistHistoryPersistsNewHistory() {
            // Arrange
            InventoryHistory history = createInventoryHistory(null, 50, 25.0f);

            // Act
            entityManager.persist(history);

            // Assert
            verify(entityManager).persist(history);
        }
    }

    @Nested
    @DisplayName("update Tests")
    class UpdateTests {

        @Test
        @DisplayName("Should update existing inventory history")
        void updateHistoryMergesExistingHistory() {
            // Arrange
            InventoryHistory history = createInventoryHistory(1, 75, 35.0f);
            when(entityManager.merge(history)).thenReturn(history);

            // Act
            InventoryHistory result = inventoryHistoryDao.update(history);

            // Assert
            verify(entityManager).merge(history);
            assertThat(result).isNotNull();
        }
    }

    @Nested
    @DisplayName("delete Tests")
    class DeleteTests {

        @Test
        @DisplayName("Should delete inventory history")
        void deleteHistoryRemovesHistory() {
            // Arrange
            InventoryHistory history = createInventoryHistory(1, 100, 50.0f);
            when(entityManager.contains(history)).thenReturn(true);

            // Act
            inventoryHistoryDao.delete(history);

            // Assert
            verify(entityManager).remove(history);
        }
    }

    @Nested
    @DisplayName("Inventory History Entity Structure Tests")
    class InventoryHistoryEntityStructureTests {

        @Test
        @DisplayName("Should handle inventory history with all fields populated")
        void handleHistoryWithAllFields() {
            // Arrange
            InventoryHistory history = createInventoryHistory(1, 100, 50.0f);
            history.setUnitSellingPrice(75.0f);
            history.setTransactionDate(LocalDate.now());

            when(entityManager.find(InventoryHistory.class, 1))
                .thenReturn(history);

            // Act
            InventoryHistory result = inventoryHistoryDao.findByPK(1);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getQuantity()).isEqualTo(100);
            assertThat(result.getUnitCost()).isEqualTo(50.0f);
            assertThat(result.getUnitSellingPrice()).isEqualTo(75.0f);
        }

        @Test
        @DisplayName("Should handle inventory history with inventory reference")
        void handleHistoryWithInventoryReference() {
            // Arrange
            InventoryHistory history = createInventoryHistory(1, 100, 50.0f);

            Inventory inventory = new Inventory();
            inventory.setInventoryID(10);
            inventory.setStockOnHand(500);
            history.setInventory(inventory);

            when(entityManager.find(InventoryHistory.class, 1))
                .thenReturn(history);

            // Act
            InventoryHistory result = inventoryHistoryDao.findByPK(1);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getInventory()).isNotNull();
            assertThat(result.getInventory().getInventoryID()).isEqualTo(10);
        }

        @Test
        @DisplayName("Should handle inventory history with product reference")
        void handleHistoryWithProductReference() {
            // Arrange
            InventoryHistory history = createInventoryHistory(1, 100, 50.0f);

            Product product = new Product();
            product.setProductID(5);
            product.setProductName("Test Product");
            history.setProductId(product);

            when(entityManager.find(InventoryHistory.class, 1))
                .thenReturn(history);

            // Act
            InventoryHistory result = inventoryHistoryDao.findByPK(1);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getProductId()).isNotNull();
            assertThat(result.getProductId().getProductID()).isEqualTo(5);
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
}
