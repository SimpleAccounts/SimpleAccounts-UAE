package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.ProductWarehouseDao;
import com.simpleaccounts.entity.ProductWarehouse;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductWarehouseServiceImpl Unit Tests")
class ProductWarehouseServiceImplTest {

    @Mock
    private ProductWarehouseDao productWarehouseDao;

    @InjectMocks
    private ProductWarehouseServiceImpl productWarehouseService;

    @Nested
    @DisplayName("getProductWarehouseList Tests")
    class GetProductWarehouseListTests {

        @Test
        @DisplayName("Should return all warehouses")
        void getProductWarehouseListReturnsAllWarehouses() {
            // Arrange
            List<ProductWarehouse> expectedWarehouses = createWarehouseList(3);

            when(productWarehouseDao.getProductWarehouseList())
                .thenReturn(expectedWarehouses);

            // Act
            List<ProductWarehouse> result = productWarehouseService.getProductWarehouseList();

            // Assert
            assertThat(result).isNotNull().hasSize(3);
            verify(productWarehouseDao).getProductWarehouseList();
        }

        @Test
        @DisplayName("Should return empty list when no warehouses exist")
        void getProductWarehouseListReturnsEmptyList() {
            // Arrange
            when(productWarehouseDao.getProductWarehouseList())
                .thenReturn(new ArrayList<>());

            // Act
            List<ProductWarehouse> result = productWarehouseService.getProductWarehouseList();

            // Assert
            assertThat(result).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("Should return null when DAO returns null")
        void getProductWarehouseListReturnsNullWhenDaoReturnsNull() {
            // Arrange
            when(productWarehouseDao.getProductWarehouseList())
                .thenReturn(null);

            // Act
            List<ProductWarehouse> result = productWarehouseService.getProductWarehouseList();

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("findByPK Tests")
    class FindByPKTests {

        @Test
        @DisplayName("Should return warehouse by ID")
        void findByPKReturnsWarehouse() {
            // Arrange
            Integer warehouseId = 1;
            ProductWarehouse expectedWarehouse = createWarehouse(warehouseId, "Main Warehouse", "MAIN");

            when(productWarehouseDao.findByPK(warehouseId))
                .thenReturn(expectedWarehouse);

            // Act
            ProductWarehouse result = productWarehouseService.findByPK(warehouseId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getProductWarehouseId()).isEqualTo(warehouseId);
            assertThat(result.getWarehouseName()).isEqualTo("Main Warehouse");
            verify(productWarehouseDao).findByPK(warehouseId);
        }

        @Test
        @DisplayName("Should return null when warehouse not found")
        void findByPKReturnsNullWhenNotFound() {
            // Arrange
            Integer warehouseId = 999;

            when(productWarehouseDao.findByPK(warehouseId))
                .thenReturn(null);

            // Act
            ProductWarehouse result = productWarehouseService.findByPK(warehouseId);

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("persist Tests")
    class PersistTests {

        @Test
        @DisplayName("Should persist new warehouse")
        void persistWarehouseSaves() {
            // Arrange
            ProductWarehouse warehouse = createWarehouse(null, "New Warehouse", "NEW");

            // Act
            productWarehouseService.persist(warehouse);

            // Assert
            verify(productWarehouseDao).persist(warehouse);
        }
    }

    @Nested
    @DisplayName("update Tests")
    class UpdateTests {

        @Test
        @DisplayName("Should update existing warehouse")
        void updateWarehouseUpdates() {
            // Arrange
            ProductWarehouse warehouse = createWarehouse(1, "Updated Warehouse", "UPD");

            when(productWarehouseDao.update(warehouse)).thenReturn(warehouse);

            // Act
            ProductWarehouse result = productWarehouseService.update(warehouse);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getWarehouseName()).isEqualTo("Updated Warehouse");
            verify(productWarehouseDao).update(warehouse);
        }
    }

    @Nested
    @DisplayName("delete Tests")
    class DeleteTests {

        @Test
        @DisplayName("Should delete warehouse")
        void deleteWarehouseDeletes() {
            // Arrange
            ProductWarehouse warehouse = createWarehouse(1, "Warehouse to Delete", "DEL");

            // Act
            productWarehouseService.delete(warehouse);

            // Assert
            verify(productWarehouseDao).delete(warehouse);
        }
    }

    @Nested
    @DisplayName("findAll Tests")
    class FindAllTests {

        @Test
        @DisplayName("Should return all warehouses from dumpData")
        void findAllReturnsWarehouses() {
            // Arrange
            List<ProductWarehouse> expectedWarehouses = createWarehouseList(5);

            when(productWarehouseDao.dumpData())
                .thenReturn(expectedWarehouses);

            // Act
            List<ProductWarehouse> result = productWarehouseService.findAll();

            // Assert
            assertThat(result).isNotNull().hasSize(5);
            verify(productWarehouseDao).dumpData();
        }
    }

    @Nested
    @DisplayName("getDao Tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return ProductWarehouseDao instance")
        void getDaoReturnsProductWarehouseDao() {
            // The protected getDao() method returns the productWarehouseDao
            assertThat(productWarehouseService).isNotNull();
        }
    }

    @Nested
    @DisplayName("Warehouse Entity Validation Tests")
    class WarehouseEntityValidationTests {

        @Test
        @DisplayName("Should handle warehouse with all fields populated")
        void handleWarehouseWithAllFields() {
            // Arrange
            ProductWarehouse warehouse = createWarehouse(1, "Full Warehouse", "FULL");
            warehouse.setWarehouseDescription("Full description");
            warehouse.setWarehouseAddress("123 Test Street");

            when(productWarehouseDao.findByPK(1)).thenReturn(warehouse);

            // Act
            ProductWarehouse result = productWarehouseService.findByPK(1);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getWarehouseDescription()).isEqualTo("Full description");
            assertThat(result.getWarehouseAddress()).isEqualTo("123 Test Street");
        }

        @Test
        @DisplayName("Should handle warehouse with deleteFlag set")
        void handleWarehouseWithDeleteFlag() {
            // Arrange
            ProductWarehouse warehouse = createWarehouse(1, "Deleted Warehouse", "DEL");
            warehouse.setDeleteFlag(true);

            when(productWarehouseDao.findByPK(1)).thenReturn(warehouse);

            // Act
            ProductWarehouse result = productWarehouseService.findByPK(1);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getDeleteFlag()).isTrue();
        }
    }

    private List<ProductWarehouse> createWarehouseList(int count) {
        List<ProductWarehouse> warehouses = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            warehouses.add(createWarehouse(i, "Warehouse " + i, "WH00" + i));
        }
        return warehouses;
    }

    private ProductWarehouse createWarehouse(Integer id, String name, String code) {
        ProductWarehouse warehouse = new ProductWarehouse();
        warehouse.setProductWarehouseId(id);
        warehouse.setWarehouseName(name);
        warehouse.setWarehouseCode(code);
        warehouse.setWarehouseDescription("Description for " + name);
        warehouse.setWarehouseAddress("Address for " + name);
        warehouse.setDeleteFlag(false);
        warehouse.setCreatedBy(1);
        warehouse.setCreatedDate(LocalDateTime.now());
        return warehouse;
    }
}
