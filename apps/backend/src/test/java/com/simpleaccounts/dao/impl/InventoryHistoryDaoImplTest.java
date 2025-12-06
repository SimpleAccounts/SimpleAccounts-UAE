package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.InventoryHistory;
import com.simpleaccounts.rest.InventoryController.InventoryRevenueModel;
import com.simpleaccounts.rest.InventoryController.TopInventoryRevenueModel;
import com.simpleaccounts.utils.DateUtils;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
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
@DisplayName("InventoryHistoryDaoImpl Unit Tests")
class InventoryHistoryDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<InventoryHistory> inventoryHistoryTypedQuery;

    @Mock
    private TypedQuery<Double> doubleTypedQuery;

    @Mock
    private TypedQuery<BigDecimal> bigDecimalTypedQuery;

    @Mock
    private Query query;

    @Mock
    private DateUtils dateUtil;

    @InjectMocks
    private InventoryHistoryDaoImpl dao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(dao, "entityManager", entityManager);
        ReflectionTestUtils.setField(dao, "entityClass", InventoryHistory.class);
    }

    @Test
    @DisplayName("Should return inventory history by inventory ID")
    void getHistoryByInventoryIdReturnsHistory() {
        // Arrange
        Integer inventoryId = 1;
        InventoryHistory history = createInventoryHistory(1);

        when(entityManager.createNamedQuery("getHistoryByInventoryId", InventoryHistory.class))
            .thenReturn(inventoryHistoryTypedQuery);
        when(inventoryHistoryTypedQuery.setParameter("inventoryId", inventoryId))
            .thenReturn(inventoryHistoryTypedQuery);
        when(inventoryHistoryTypedQuery.getSingleResult()).thenReturn(history);

        // Act
        InventoryHistory result = dao.getHistoryByInventoryId(inventoryId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should use correct named query for getting history by inventory ID")
    void getHistoryByInventoryIdUsesCorrectNamedQuery() {
        // Arrange
        Integer inventoryId = 1;
        when(entityManager.createNamedQuery("getHistoryByInventoryId", InventoryHistory.class))
            .thenReturn(inventoryHistoryTypedQuery);
        when(inventoryHistoryTypedQuery.setParameter("inventoryId", inventoryId))
            .thenReturn(inventoryHistoryTypedQuery);
        when(inventoryHistoryTypedQuery.getSingleResult()).thenReturn(createInventoryHistory(1));

        // Act
        dao.getHistoryByInventoryId(inventoryId);

        // Assert
        verify(entityManager).createNamedQuery("getHistoryByInventoryId", InventoryHistory.class);
    }

    @Test
    @DisplayName("Should set inventory ID parameter correctly")
    void getHistoryByInventoryIdSetsParameterCorrectly() {
        // Arrange
        Integer inventoryId = 42;
        when(entityManager.createNamedQuery("getHistoryByInventoryId", InventoryHistory.class))
            .thenReturn(inventoryHistoryTypedQuery);
        when(inventoryHistoryTypedQuery.setParameter("inventoryId", inventoryId))
            .thenReturn(inventoryHistoryTypedQuery);
        when(inventoryHistoryTypedQuery.getSingleResult()).thenReturn(createInventoryHistory(1));

        // Act
        dao.getHistoryByInventoryId(inventoryId);

        // Assert
        verify(inventoryHistoryTypedQuery).setParameter("inventoryId", inventoryId);
    }

    @Test
    @DisplayName("Should return total revenue for inventory with all periods")
    void getTotalRevenueForInventoryReturnsAllPeriods() {
        // Arrange
        Date now = new Date();
        when(dateUtil.get(any(Date.class))).thenReturn(now);
        when(entityManager.createNamedQuery("getTotalRevenue", Double.class))
            .thenReturn(doubleTypedQuery);
        when(doubleTypedQuery.setParameter(eq("startDate"), any())).thenReturn(doubleTypedQuery);
        when(doubleTypedQuery.setParameter(eq("endDate"), any())).thenReturn(doubleTypedQuery);
        when(doubleTypedQuery.setMaxResults(1)).thenReturn(doubleTypedQuery);
        when(doubleTypedQuery.getSingleResult())
            .thenReturn(1000.0, 3000.0, 6000.0, 12000.0);

        // Act
        InventoryRevenueModel result = dao.getTotalRevenueForInventory();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalRevenueMonthly()).isEqualTo(BigDecimal.valueOf(1000.0));
        assertThat(result.getTotalRevenueQuarterly()).isEqualTo(BigDecimal.valueOf(3000.0));
        assertThat(result.getTotalRevenueSixMonthly()).isEqualTo(BigDecimal.valueOf(6000.0));
        assertThat(result.getTotalRevenueYearly()).isEqualTo(BigDecimal.valueOf(12000.0));
    }

    @Test
    @DisplayName("Should return zero revenue when no data available")
    void getTotalRevenueForInventoryReturnsZeroWhenNoData() {
        // Arrange
        Date now = new Date();
        when(dateUtil.get(any(Date.class))).thenReturn(now);
        when(entityManager.createNamedQuery("getTotalRevenue", Double.class))
            .thenReturn(doubleTypedQuery);
        when(doubleTypedQuery.setParameter(eq("startDate"), any())).thenReturn(doubleTypedQuery);
        when(doubleTypedQuery.setParameter(eq("endDate"), any())).thenReturn(doubleTypedQuery);
        when(doubleTypedQuery.setMaxResults(1)).thenReturn(doubleTypedQuery);
        when(doubleTypedQuery.getSingleResult()).thenReturn(null);

        // Act
        InventoryRevenueModel result = dao.getTotalRevenueForInventory();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalRevenueMonthly()).isEqualTo(BigDecimal.ZERO);
        assertThat(result.getTotalRevenueQuarterly()).isEqualTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should return total quantity sold for inventory")
    void getTotalQuantitySoldForInventoryReturnsAllPeriods() {
        // Arrange
        Date now = new Date();
        when(dateUtil.get(any(Date.class))).thenReturn(now);
        when(entityManager.createNamedQuery("getTotalQtySold", BigDecimal.class))
            .thenReturn(bigDecimalTypedQuery);
        when(bigDecimalTypedQuery.setParameter(eq("startDate"), any())).thenReturn(bigDecimalTypedQuery);
        when(bigDecimalTypedQuery.setParameter(eq("endDate"), any())).thenReturn(bigDecimalTypedQuery);
        when(bigDecimalTypedQuery.setMaxResults(1)).thenReturn(bigDecimalTypedQuery);
        when(bigDecimalTypedQuery.getSingleResult())
            .thenReturn(BigDecimal.valueOf(100), BigDecimal.valueOf(300),
                       BigDecimal.valueOf(600), BigDecimal.valueOf(1200));

        // Act
        InventoryRevenueModel result = dao.getTotalQuantitySoldForInventory();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalQtySoldMonthly()).isEqualTo(BigDecimal.valueOf(100));
        assertThat(result.getTotalQtySoldQuarterly()).isEqualTo(BigDecimal.valueOf(300));
        assertThat(result.getTotalQtySoldSixMonthly()).isEqualTo(BigDecimal.valueOf(600));
        assertThat(result.getTotalQtySoldYearly()).isEqualTo(BigDecimal.valueOf(1200));
    }

    @Test
    @DisplayName("Should return top selling products for inventory")
    void getTopSellingProductsForInventoryReturnsTopProducts() {
        // Arrange
        Date now = new Date();
        when(dateUtil.get(any(Date.class))).thenReturn(now);
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter(eq("startDate"), any())).thenReturn(query);
        when(query.setParameter(eq("endDate"), any())).thenReturn(query);
        when(query.setMaxResults(5)).thenReturn(query);

        Object[] row1 = {100.0, "Product1"};
        Object[] row2 = {200.0, "Product2"};
        when(query.getResultList()).thenReturn(Arrays.asList(row1, row2));

        // Act
        TopInventoryRevenueModel result = dao.getTopSellingProductsForInventory();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTopSellingProductsMonthly()).isNotEmpty();
    }

    @Test
    @DisplayName("Should handle empty result list for top selling products")
    void getTopSellingProductsForInventoryHandlesEmptyResults() {
        // Arrange
        Date now = new Date();
        when(dateUtil.get(any(Date.class))).thenReturn(now);
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter(eq("startDate"), any())).thenReturn(query);
        when(query.setParameter(eq("endDate"), any())).thenReturn(query);
        when(query.setMaxResults(5)).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        TopInventoryRevenueModel result = dao.getTopSellingProductsForInventory();

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should return top profit generating products for inventory")
    void getTopProfitGeneratingProductsForInventoryReturnsProducts() {
        // Arrange
        Date now = new Date();
        when(dateUtil.get(any(Date.class))).thenReturn(now);
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter(eq("startDate"), any())).thenReturn(query);
        when(query.setParameter(eq("endDate"), any())).thenReturn(query);
        when(query.setMaxResults(10)).thenReturn(query);

        Object[] row1 = {500.0, "Product1"};
        when(query.getResultList()).thenReturn(Collections.singletonList(row1));

        // Act
        TopInventoryRevenueModel result = dao.getTopProfitGeneratingProductsForInventory();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalProfitMonthly()).isNotEmpty();
    }

    @Test
    @DisplayName("Should return low selling products for inventory")
    void getLowSellingProductsForInventoryReturnsProducts() {
        // Arrange
        Date now = new Date();
        when(dateUtil.get(any(Date.class))).thenReturn(now);
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter(eq("startDate"), any())).thenReturn(query);
        when(query.setParameter(eq("endDate"), any())).thenReturn(query);
        when(query.setMaxResults(5)).thenReturn(query);

        Object[] row1 = {10.0, "LowProduct"};
        when(query.getResultList()).thenReturn(Collections.singletonList(row1));

        // Act
        TopInventoryRevenueModel result = dao.getLowSellingProductsForInventory();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getLowSellingProductsMonthly()).isNotEmpty();
    }

    @Test
    @DisplayName("Should return history by product and supplier")
    void getHistoryReturnsHistoryList() {
        // Arrange
        Integer productId = 1;
        Integer supplierId = 2;
        List<InventoryHistory> histories = createInventoryHistoryList(3);

        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter("productId", productId)).thenReturn(query);
        when(query.setParameter("supplierId", supplierId)).thenReturn(query);
        when(query.getResultList()).thenReturn(histories);

        // Act
        List<InventoryHistory> result = dao.getHistory(productId, supplierId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("Should execute correct query for getting history")
    void getHistoryExecutesCorrectQuery() {
        // Arrange
        Integer productId = 1;
        Integer supplierId = 2;
        String expectedQuery = "SELECT ih FROM InventoryHistory ih WHERE ih.productId.productID=:productId AND ih.supplierId.contactId=:supplierId ORDER BY ih.createdDate";

        when(entityManager.createQuery(expectedQuery)).thenReturn(query);
        when(query.setParameter("productId", productId)).thenReturn(query);
        when(query.setParameter("supplierId", supplierId)).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        dao.getHistory(productId, supplierId);

        // Assert
        verify(entityManager).createQuery(expectedQuery);
        verify(query).setParameter("productId", productId);
        verify(query).setParameter("supplierId", supplierId);
    }

    @Test
    @DisplayName("Should return empty list when no history found")
    void getHistoryReturnsEmptyListWhenNoData() {
        // Arrange
        Integer productId = 999;
        Integer supplierId = 999;

        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter("productId", productId)).thenReturn(query);
        when(query.setParameter("supplierId", supplierId)).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<InventoryHistory> result = dao.getHistory(productId, supplierId);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should find inventory history by primary key")
    void findByPKReturnsInventoryHistory() {
        // Arrange
        Integer id = 1;
        InventoryHistory history = createInventoryHistory(id);

        when(entityManager.find(InventoryHistory.class, id))
            .thenReturn(history);

        // Act
        InventoryHistory result = dao.findByPK(id);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(id);
    }

    @Test
    @DisplayName("Should persist inventory history successfully")
    void persistInventoryHistorySuccessfully() {
        // Arrange
        InventoryHistory history = createInventoryHistory(1);

        // Act
        InventoryHistory result = dao.persist(history);

        // Assert
        verify(entityManager).persist(history);
        verify(entityManager).flush();
        verify(entityManager).refresh(history);
        assertThat(result).isEqualTo(history);
    }

    @Test
    @DisplayName("Should update inventory history successfully")
    void updateInventoryHistorySuccessfully() {
        // Arrange
        InventoryHistory history = createInventoryHistory(1);
        InventoryHistory merged = createInventoryHistory(1);

        when(entityManager.merge(history)).thenReturn(merged);

        // Act
        InventoryHistory result = dao.update(history);

        // Assert
        assertThat(result).isEqualTo(merged);
        verify(entityManager).merge(history);
    }

    @Test
    @DisplayName("Should handle null result in revenue calculation")
    void getTotalRevenueHandlesNullResult() {
        // Arrange
        Date now = new Date();
        when(dateUtil.get(any(Date.class))).thenReturn(now);
        when(entityManager.createNamedQuery("getTotalRevenue", Double.class))
            .thenReturn(doubleTypedQuery);
        when(doubleTypedQuery.setParameter(eq("startDate"), any())).thenReturn(doubleTypedQuery);
        when(doubleTypedQuery.setParameter(eq("endDate"), any())).thenReturn(doubleTypedQuery);
        when(doubleTypedQuery.setMaxResults(1)).thenReturn(doubleTypedQuery);
        when(doubleTypedQuery.getSingleResult()).thenReturn(null);

        // Act
        InventoryRevenueModel result = dao.getTotalRevenueForInventory();

        // Assert
        assertThat(result.getTotalRevenueMonthly()).isEqualTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should set max results to 5 for top selling products")
    void getTopSellingProductsSetsMaxResults() {
        // Arrange
        Date now = new Date();
        when(dateUtil.get(any(Date.class))).thenReturn(now);
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter(eq("startDate"), any())).thenReturn(query);
        when(query.setParameter(eq("endDate"), any())).thenReturn(query);
        when(query.setMaxResults(5)).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        dao.getTopSellingProductsForInventory();

        // Assert
        verify(query, times(4)).setMaxResults(5);
    }

    @Test
    @DisplayName("Should set max results to 10 for profit generating products")
    void getTopProfitGeneratingProductsSetsMaxResults() {
        // Arrange
        Date now = new Date();
        when(dateUtil.get(any(Date.class))).thenReturn(now);
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter(eq("startDate"), any())).thenReturn(query);
        when(query.setParameter(eq("endDate"), any())).thenReturn(query);
        when(query.setMaxResults(10)).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        dao.getTopProfitGeneratingProductsForInventory();

        // Assert
        verify(query, times(4)).setMaxResults(10);
    }

    private InventoryHistory createInventoryHistory(Integer id) {
        InventoryHistory history = new InventoryHistory();
        history.setId(id);
        return history;
    }

    private List<InventoryHistory> createInventoryHistoryList(int count) {
        List<InventoryHistory> histories = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            histories.add(createInventoryHistory(i));
        }
        return histories;
    }
}
