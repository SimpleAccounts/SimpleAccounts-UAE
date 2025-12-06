package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.ProductWarehouse;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import javax.persistence.EntityManager;
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
@DisplayName("ProductWarehouseDaoImpl Unit Tests")
class ProductWarehouseDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<ProductWarehouse> typedQuery;

    @InjectMocks
    private ProductWarehouseDaoImpl productWarehouseDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(productWarehouseDao, "entityManager", entityManager);
    }

    @Test
    @DisplayName("Should return product warehouse list when warehouses exist")
    void getProductWarehouseListReturnsListWhenWarehousesExist() {
        // Arrange
        List<ProductWarehouse> expectedWarehouses = createProductWarehouseList(5);

        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedWarehouses);

        // Act
        List<ProductWarehouse> result = productWarehouseDao.getProductWarehouseList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).isEqualTo(expectedWarehouses);
    }

    @Test
    @DisplayName("Should return empty list when no warehouses exist")
    void getProductWarehouseListReturnsEmptyListWhenNoWarehouses() {
        // Arrange
        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        List<ProductWarehouse> result = productWarehouseDao.getProductWarehouseList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return empty list when query result is null")
    void getProductWarehouseListReturnsEmptyListWhenResultNull() {
        // Arrange
        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(null);

        // Act
        List<ProductWarehouse> result = productWarehouseDao.getProductWarehouseList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use correct named query")
    void getProductWarehouseListUsesCorrectNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        productWarehouseDao.getProductWarehouseList();

        // Assert
        verify(entityManager).createNamedQuery("allProductWarehouse", ProductWarehouse.class);
    }

    @Test
    @DisplayName("Should create typed query with ProductWarehouse class")
    void getProductWarehouseListCreatesTypedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        productWarehouseDao.getProductWarehouseList();

        // Assert
        verify(entityManager).createNamedQuery(anyString(), eq(ProductWarehouse.class));
    }

    @Test
    @DisplayName("Should call getResultList exactly once")
    void getProductWarehouseListCallsGetResultListOnce() {
        // Arrange
        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        productWarehouseDao.getProductWarehouseList();

        // Assert
        verify(typedQuery, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should return single warehouse when only one exists")
    void getProductWarehouseListReturnsSingleWarehouse() {
        // Arrange
        List<ProductWarehouse> warehouses = createProductWarehouseList(1);

        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(warehouses);

        // Act
        List<ProductWarehouse> result = productWarehouseDao.getProductWarehouseList();

        // Assert
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should return multiple warehouses when many exist")
    void getProductWarehouseListReturnsMultipleWarehouses() {
        // Arrange
        List<ProductWarehouse> warehouses = createProductWarehouseList(15);

        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(warehouses);

        // Act
        List<ProductWarehouse> result = productWarehouseDao.getProductWarehouseList();

        // Assert
        assertThat(result).hasSize(15);
    }

    @Test
    @DisplayName("Should never return null list")
    void getProductWarehouseListNeverReturnsNull() {
        // Arrange
        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(null);

        // Act
        List<ProductWarehouse> result = productWarehouseDao.getProductWarehouseList();

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should return new empty list when result is null")
    void getProductWarehouseListReturnsNewEmptyListWhenNull() {
        // Arrange
        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(null);

        // Act
        List<ProductWarehouse> result = productWarehouseDao.getProductWarehouseList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        assertThat(result).isInstanceOf(ArrayList.class);
    }

    @Test
    @DisplayName("Should return new empty list when result is empty")
    void getProductWarehouseListReturnsNewEmptyListWhenEmpty() {
        // Arrange
        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        List<ProductWarehouse> result = productWarehouseDao.getProductWarehouseList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        assertThat(result).isInstanceOf(ArrayList.class);
    }

    @Test
    @DisplayName("Should return actual list when warehouses exist")
    void getProductWarehouseListReturnsActualListWhenWarehousesExist() {
        // Arrange
        List<ProductWarehouse> warehouses = createProductWarehouseList(3);

        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(warehouses);

        // Act
        List<ProductWarehouse> result = productWarehouseDao.getProductWarehouseList();

        // Assert
        assertThat(result).isSameAs(warehouses);
    }

    @Test
    @DisplayName("Should handle large number of warehouses")
    void getProductWarehouseListHandlesLargeNumberOfWarehouses() {
        // Arrange
        List<ProductWarehouse> warehouses = createProductWarehouseList(1000);

        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(warehouses);

        // Act
        List<ProductWarehouse> result = productWarehouseDao.getProductWarehouseList();

        // Assert
        assertThat(result).hasSize(1000);
    }

    @Test
    @DisplayName("Should create query exactly once")
    void getProductWarehouseListCreatesQueryOnce() {
        // Arrange
        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        productWarehouseDao.getProductWarehouseList();

        // Assert
        verify(entityManager, times(1)).createNamedQuery("allProductWarehouse", ProductWarehouse.class);
    }

    @Test
    @DisplayName("Should check if result list is not null before checking isEmpty")
    void getProductWarehouseListChecksNullBeforeEmpty() {
        // Arrange
        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(null);

        // Act
        List<ProductWarehouse> result = productWarehouseDao.getProductWarehouseList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return different list instances on multiple calls with null results")
    void getProductWarehouseListReturnsDifferentListInstancesOnMultipleCalls() {
        // Arrange
        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(null);

        // Act
        List<ProductWarehouse> result1 = productWarehouseDao.getProductWarehouseList();
        List<ProductWarehouse> result2 = productWarehouseDao.getProductWarehouseList();

        // Assert
        assertThat(result1).isNotSameAs(result2);
        assertThat(result1).isEmpty();
        assertThat(result2).isEmpty();
    }

    @Test
    @DisplayName("Should return same list reference when result is not null or empty")
    void getProductWarehouseListReturnsSameReferenceWhenResultExists() {
        // Arrange
        List<ProductWarehouse> warehouses = createProductWarehouseList(3);

        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(warehouses);

        // Act
        List<ProductWarehouse> result = productWarehouseDao.getProductWarehouseList();

        // Assert
        assertThat(result).isSameAs(warehouses);
    }

    @Test
    @DisplayName("Should return warehouses with correct properties")
    void getProductWarehouseListReturnsWarehousesWithCorrectProperties() {
        // Arrange
        List<ProductWarehouse> warehouses = new ArrayList<>();
        ProductWarehouse warehouse1 = new ProductWarehouse();
        warehouse1.setProductWarehouseId(1);
        warehouse1.setProductWarehouseName("Warehouse 1");
        warehouses.add(warehouse1);

        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(warehouses);

        // Act
        List<ProductWarehouse> result = productWarehouseDao.getProductWarehouseList();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getProductWarehouseId()).isEqualTo(1);
        assertThat(result.get(0).getProductWarehouseName()).isEqualTo("Warehouse 1");
    }

    @Test
    @DisplayName("Should handle concurrent calls correctly")
    void getProductWarehouseListHandlesConcurrentCalls() {
        // Arrange
        List<ProductWarehouse> warehouses = createProductWarehouseList(5);

        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(warehouses);

        // Act
        List<ProductWarehouse> result1 = productWarehouseDao.getProductWarehouseList();
        List<ProductWarehouse> result2 = productWarehouseDao.getProductWarehouseList();

        // Assert
        assertThat(result1).hasSize(5);
        assertThat(result2).hasSize(5);
        verify(entityManager, times(2)).createNamedQuery("allProductWarehouse", ProductWarehouse.class);
    }

    @Test
    @DisplayName("Should call methods in correct order")
    void getProductWarehouseListCallsMethodsInCorrectOrder() {
        // Arrange
        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        productWarehouseDao.getProductWarehouseList();

        // Assert
        verify(entityManager).createNamedQuery("allProductWarehouse", ProductWarehouse.class);
        verify(typedQuery).getResultList();
    }

    @Test
    @DisplayName("Should return list with exact count matching query result")
    void getProductWarehouseListReturnsExactCount() {
        // Arrange
        List<ProductWarehouse> warehouses = createProductWarehouseList(7);

        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(warehouses);

        // Act
        List<ProductWarehouse> result = productWarehouseDao.getProductWarehouseList();

        // Assert
        assertThat(result).hasSize(7);
    }

    @Test
    @DisplayName("Should not modify the result list")
    void getProductWarehouseListDoesNotModifyResultList() {
        // Arrange
        List<ProductWarehouse> warehouses = createProductWarehouseList(3);
        List<ProductWarehouse> originalWarehouses = new ArrayList<>(warehouses);

        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(warehouses);

        // Act
        List<ProductWarehouse> result = productWarehouseDao.getProductWarehouseList();

        // Assert
        assertThat(result).hasSize(originalWarehouses.size());
        for (int i = 0; i < result.size(); i++) {
            assertThat(result.get(i).getProductWarehouseId())
                .isEqualTo(originalWarehouses.get(i).getProductWarehouseId());
        }
    }

    @Test
    @DisplayName("Should use allProductWarehouse named query constant")
    void getProductWarehouseListUsesCorrectQueryName() {
        // Arrange
        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        productWarehouseDao.getProductWarehouseList();

        // Assert
        verify(entityManager).createNamedQuery(eq("allProductWarehouse"), any());
    }

    @Test
    @DisplayName("Should return empty ArrayList when result list is empty collection")
    void getProductWarehouseListReturnsEmptyArrayListWhenEmptyCollection() {
        // Arrange
        when(entityManager.createNamedQuery("allProductWarehouse", ProductWarehouse.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<ProductWarehouse> result = productWarehouseDao.getProductWarehouseList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        assertThat(result).isInstanceOf(ArrayList.class);
    }

    private List<ProductWarehouse> createProductWarehouseList(int count) {
        List<ProductWarehouse> warehouses = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            ProductWarehouse warehouse = new ProductWarehouse();
            warehouse.setProductWarehouseId(i + 1);
            warehouse.setProductWarehouseName("Warehouse " + (i + 1));
            warehouses.add(warehouse);
        }
        return warehouses;
    }
}
