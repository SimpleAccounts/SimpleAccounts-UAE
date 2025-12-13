package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.InventoryFilterEnum;
import com.simpleaccounts.dao.InventoryDao;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Inventory;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.productcontroller.InventoryListModel;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumMap;
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
@DisplayName("InventoryServiceImpl Unit Tests")
class InventoryServiceImplTest {

    @Mock
    private InventoryDao inventoryDao;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    @Nested
    @DisplayName("getInventoryList Tests")
    class GetInventoryListTests {

        @Test
        @DisplayName("Should return inventory list with pagination")
        void getInventoryListReturnsPaginatedResults() {
            // Arrange
            Map<InventoryFilterEnum, Object> filterMap = new EnumMap<>(InventoryFilterEnum.class);
            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNo(0);
            paginationModel.setPageSize(10);

            List<Inventory> inventories = createInventoryList(5);
            PaginationResponseModel expectedResponse = new PaginationResponseModel(5, inventories);

            when(inventoryDao.getInventoryList(filterMap, paginationModel))
                .thenReturn(expectedResponse);

            // Act
            PaginationResponseModel result = inventoryService.getInventoryList(filterMap, paginationModel);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(5);
            assertThat(result.getData()).hasSize(5);
            verify(inventoryDao).getInventoryList(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should return empty results when no inventory matches filter")
        void getInventoryListReturnsEmptyResults() {
            // Arrange
            Map<InventoryFilterEnum, Object> filterMap = new EnumMap<>(InventoryFilterEnum.class);
            PaginationModel paginationModel = new PaginationModel();
            PaginationResponseModel expectedResponse = new PaginationResponseModel(0, new ArrayList<>());

            when(inventoryDao.getInventoryList(filterMap, paginationModel))
                .thenReturn(expectedResponse);

            // Act
            PaginationResponseModel result = inventoryService.getInventoryList(filterMap, paginationModel);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getCount()).isZero();
        }
    }

    @Nested
    @DisplayName("getProductByProductId Tests")
    class GetProductByProductIdTests {

        @Test
        @DisplayName("Should return inventory list by product ID")
        void getProductByProductIdReturnsInventoryList() {
            // Arrange
            Integer productId = 1;
            List<Inventory> expectedInventory = createInventoryList(2);

            when(inventoryDao.getProductByProductId(productId))
                .thenReturn(expectedInventory);

            // Act
            List<Inventory> result = inventoryService.getProductByProductId(productId);

            // Assert
            assertThat(result).isNotNull().hasSize(2);
            verify(inventoryDao).getProductByProductId(productId);
        }

        @Test
        @DisplayName("Should return empty list when no inventory for product")
        void getProductByProductIdReturnsEmptyList() {
            // Arrange
            Integer productId = 999;

            when(inventoryDao.getProductByProductId(productId))
                .thenReturn(new ArrayList<>());

            // Act
            List<Inventory> result = inventoryService.getProductByProductId(productId);

            // Assert
            assertThat(result).isNotNull().isEmpty();
        }
    }

    @Nested
    @DisplayName("getInventoryByProductId Tests")
    class GetInventoryByProductIdTests {

        @Test
        @DisplayName("Should return inventory list by product ID")
        void getInventoryByProductIdReturnsInventoryList() {
            // Arrange
            Integer productId = 1;
            List<Inventory> expectedInventory = createInventoryList(3);

            when(inventoryDao.getInventoryByProductId(productId))
                .thenReturn(expectedInventory);

            // Act
            List<Inventory> result = inventoryService.getInventoryByProductId(productId);

            // Assert
            assertThat(result).isNotNull().hasSize(3);
            verify(inventoryDao).getInventoryByProductId(productId);
        }
    }

    @Nested
    @DisplayName("getProductCountForInventory Tests")
    class GetProductCountForInventoryTests {

        @Test
        @DisplayName("Should return product count for inventory")
        void getProductCountForInventoryReturnsCount() {
            // Arrange
            Integer expectedCount = 25;

            when(inventoryDao.getProductCountForInventory())
                .thenReturn(expectedCount);

            // Act
            Integer result = inventoryService.getProductCountForInventory();

            // Assert
            assertThat(result).isEqualTo(25);
            verify(inventoryDao).getProductCountForInventory();
        }

        @Test
        @DisplayName("Should return null when no products in inventory")
        void getProductCountForInventoryReturnsNull() {
            // Arrange
            when(inventoryDao.getProductCountForInventory())
                .thenReturn(null);

            // Act
            Integer result = inventoryService.getProductCountForInventory();

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("totalStockOnHand Tests")
    class TotalStockOnHandTests {

        @Test
        @DisplayName("Should return total stock on hand")
        void totalStockOnHandReturnsTotal() {
            // Arrange
            Integer expectedTotal = 500;

            when(inventoryDao.totalStockOnHand())
                .thenReturn(expectedTotal);

            // Act
            Integer result = inventoryService.totalStockOnHand();

            // Assert
            assertThat(result).isEqualTo(500);
            verify(inventoryDao).totalStockOnHand();
        }

        @Test
        @DisplayName("Should return zero when no stock")
        void totalStockOnHandReturnsZero() {
            // Arrange
            when(inventoryDao.totalStockOnHand())
                .thenReturn(0);

            // Act
            Integer result = inventoryService.totalStockOnHand();

            // Assert
            assertThat(result).isZero();
        }
    }

    @Nested
    @DisplayName("getlowStockProductCountForInventory Tests")
    class GetLowStockProductCountForInventoryTests {

        @Test
        @DisplayName("Should return low stock product count")
        void getLowStockProductCountReturnsCount() {
            // Arrange
            Integer expectedCount = 10;

            when(inventoryDao.getlowStockProductCountForInventory())
                .thenReturn(expectedCount);

            // Act
            Integer result = inventoryService.getlowStockProductCountForInventory();

            // Assert
            assertThat(result).isEqualTo(10);
            verify(inventoryDao).getlowStockProductCountForInventory();
        }
    }

    @Nested
    @DisplayName("getlowStockProductListForInventory Tests")
    class GetLowStockProductListForInventoryTests {

        @Test
        @DisplayName("Should return low stock product list")
        void getLowStockProductListReturnsProducts() {
            // Arrange
            List<Product> expectedProducts = createProductList(5);

            when(inventoryDao.getlowStockProductListForInventory())
                .thenReturn(expectedProducts);

            // Act
            List<Product> result = inventoryService.getlowStockProductListForInventory();

            // Assert
            assertThat(result).isNotNull().hasSize(5);
            verify(inventoryDao).getlowStockProductListForInventory();
        }
    }

    @Nested
    @DisplayName("getTopSellingProductListForInventory Tests")
    class GetTopSellingProductListForInventoryTests {

        @Test
        @DisplayName("Should return top selling product list")
        void getTopSellingProductListReturnsProducts() {
            // Arrange
            List<InventoryListModel> expectedList = createInventoryListModels(5);

            when(inventoryDao.getTopSellingProductListForInventory())
                .thenReturn(expectedList);

            // Act
            List<InventoryListModel> result = inventoryService.getTopSellingProductListForInventory();

            // Assert
            assertThat(result).isNotNull().hasSize(5);
            verify(inventoryDao).getTopSellingProductListForInventory();
        }
    }

    @Nested
    @DisplayName("getInventoryByProductIdAndSupplierId Tests")
    class GetInventoryByProductIdAndSupplierIdTests {

        @Test
        @DisplayName("Should return inventory by product and supplier ID")
        void getInventoryByProductIdAndSupplierIdReturnsInventory() {
            // Arrange
            Integer productId = 1;
            Integer supplierId = 2;
            Inventory expectedInventory = createInventory(1, 100, 50);

            when(inventoryDao.getInventoryByProductIdAndSupplierId(productId, supplierId))
                .thenReturn(expectedInventory);

            // Act
            Inventory result = inventoryService.getInventoryByProductIdAndSupplierId(productId, supplierId);

            // Assert
            assertThat(result).isNotNull();
            verify(inventoryDao).getInventoryByProductIdAndSupplierId(productId, supplierId);
        }
    }

    @Nested
    @DisplayName("getOutOfStockCountOfInventory Tests")
    class GetOutOfStockCountOfInventoryTests {

        @Test
        @DisplayName("Should return out of stock count")
        void getOutOfStockCountReturnsCount() {
            // Arrange
            Integer expectedCount = 15;

            when(inventoryDao.getOutOfStockCountOfInventory())
                .thenReturn(expectedCount);

            // Act
            Integer result = inventoryService.getOutOfStockCountOfInventory();

            // Assert
            assertThat(result).isEqualTo(15);
            verify(inventoryDao).getOutOfStockCountOfInventory();
        }
    }

    @Nested
    @DisplayName("getTotalInventoryValue Tests")
    class GetTotalInventoryValueTests {

        @Test
        @DisplayName("Should return total inventory value")
        void getTotalInventoryValueReturnsValue() {
            // Arrange
            BigDecimal expectedValue = new BigDecimal("50000.00");

            when(inventoryDao.getTotalInventoryValue())
                .thenReturn(expectedValue);

            // Act
            BigDecimal result = inventoryService.getTotalInventoryValue();

            // Assert
            assertThat(result).isEqualTo(new BigDecimal("50000.00"));
            verify(inventoryDao).getTotalInventoryValue();
        }

        @Test
        @DisplayName("Should return zero when no inventory value")
        void getTotalInventoryValueReturnsZero() {
            // Arrange
            when(inventoryDao.getTotalInventoryValue())
                .thenReturn(BigDecimal.ZERO);

            // Act
            BigDecimal result = inventoryService.getTotalInventoryValue();

            // Assert
            assertThat(result).isEqualTo(BigDecimal.ZERO);
        }
    }

    @Nested
    @DisplayName("getTotalInventoryCountForContact Tests")
    class GetTotalInventoryCountForContactTests {

        @Test
        @DisplayName("Should return inventory count for contact")
        void getTotalInventoryCountForContactReturnsCount() {
            // Arrange
            int contactId = 1;
            Integer expectedCount = 20;

            when(inventoryDao.getTotalInventoryCountForContact(contactId))
                .thenReturn(expectedCount);

            // Act
            Integer result = inventoryService.getTotalInventoryCountForContact(contactId);

            // Assert
            assertThat(result).isEqualTo(20);
            verify(inventoryDao).getTotalInventoryCountForContact(contactId);
        }
    }

    @Nested
    @DisplayName("findByPK Tests")
    class FindByPKTests {

        @Test
        @DisplayName("Should return inventory by ID")
        void findByPKReturnsInventory() {
            // Arrange
            Integer inventoryId = 1;
            Inventory expectedInventory = createInventory(inventoryId, 100, 50);

            when(inventoryDao.findByPK(inventoryId))
                .thenReturn(expectedInventory);

            // Act
            Inventory result = inventoryService.findByPK(inventoryId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getInventoryID()).isEqualTo(inventoryId);
            verify(inventoryDao).findByPK(inventoryId);
        }
    }

    private List<Inventory> createInventoryList(int count) {
        List<Inventory> inventories = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            inventories.add(createInventory(i, 100 * i, 50 * i));
        }
        return inventories;
    }

    private Inventory createInventory(Integer id, Integer stockOnHand, Integer quantitySold) {
        Inventory inventory = new Inventory();
        inventory.setInventoryID(id);
        inventory.setStockOnHand(stockOnHand);
        inventory.setQuantitySold(quantitySold);
        inventory.setReorderLevel(10);
        inventory.setPurchaseQuantity(100);
        inventory.setUnitCost(50.0f);
        inventory.setUnitSellingPrice(75.0f);
        inventory.setDeleteFlag(false);
        inventory.setCreatedBy(1);
        inventory.setCreatedDate(LocalDateTime.now());
        return inventory;
    }

    private List<Product> createProductList(int count) {
        List<Product> products = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            Product product = new Product();
            product.setProductID(i);
            product.setProductName("Product " + i);
            product.setProductCode("PROD00" + i);
            products.add(product);
        }
        return products;
    }

    private List<InventoryListModel> createInventoryListModels(int count) {
        List<InventoryListModel> models = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            InventoryListModel model = new InventoryListModel();
            model.setProductName("Product " + i);
            model.setQuantitySold(100 * i);
            models.add(model);
        }
        return models;
    }
}
