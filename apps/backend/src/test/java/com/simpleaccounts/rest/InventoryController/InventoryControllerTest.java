package com.simpleaccounts.rest.InventoryController;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.Inventory;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.productcontroller.InventoryListModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.InventoryHistoryService;
import com.simpleaccounts.service.InventoryService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@DisplayName("InventoryController Unit Tests")
class InventoryControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private InventoryService inventoryService;

    @Mock
    private InventoryHistoryService inventoryHistoryService;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @InjectMocks
    private InventoryController inventoryController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(inventoryController).build();
        objectMapper = new ObjectMapper();
    }

    @Nested
    @DisplayName("getInventoryList Tests")
    class GetInventoryListTests {

        @Test
        @DisplayName("Should return inventory list successfully")
        void getInventoryListReturnsInventories() throws Exception {
            // Arrange
            List<Inventory> inventories = createInventoryList(5);
            PaginationResponseModel response = new PaginationResponseModel(5, inventories);

            when(inventoryService.getInventoryList(any(), any())).thenReturn(response);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getList"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when no inventory exists")
        void getInventoryListReturnsNotFound() throws Exception {
            // Arrange
            when(inventoryService.getInventoryList(any(), any())).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getList"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("getInventoryById Tests")
    class GetInventoryByIdTests {

        @Test
        @DisplayName("Should return inventory by ID")
        void getInventoryByIdReturnsInventory() throws Exception {
            // Arrange
            Inventory inventory = createInventory(1, 100, 50);

            when(inventoryService.findByPK(1)).thenReturn(inventory);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getById")
                            .param("inventoryId", "1"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when inventory does not exist")
        void getInventoryByIdReturnsNotFound() throws Exception {
            // Arrange
            when(inventoryService.findByPK(999)).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getById")
                            .param("inventoryId", "999"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("getTotalProductCount Tests")
    class GetTotalProductCountTests {

        @Test
        @DisplayName("Should return total product count for inventory")
        void getTotalProductCountReturnsCount() throws Exception {
            // Arrange
            when(inventoryService.getProductCountForInventory()).thenReturn(25);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getTotalProductCount"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when count is null")
        void getTotalProductCountReturnsNotFound() throws Exception {
            // Arrange
            when(inventoryService.getProductCountForInventory()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getTotalProductCount"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("getTotalStockOnHand Tests")
    class GetTotalStockOnHandTests {

        @Test
        @DisplayName("Should return total stock on hand")
        void getTotalStockOnHandReturnsTotal() throws Exception {
            // Arrange
            when(inventoryService.totalStockOnHand()).thenReturn(500);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getTotalStockOnHand"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when stock is null")
        void getTotalStockOnHandReturnsNotFound() throws Exception {
            // Arrange
            when(inventoryService.totalStockOnHand()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getTotalStockOnHand"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("getLowStockProductCount Tests")
    class GetLowStockProductCountTests {

        @Test
        @DisplayName("Should return low stock product count")
        void getLowStockProductCountReturnsCount() throws Exception {
            // Arrange
            when(inventoryService.getlowStockProductCountForInventory()).thenReturn(10);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getLowStockProductCount"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when count is null")
        void getLowStockProductCountReturnsNotFound() throws Exception {
            // Arrange
            when(inventoryService.getlowStockProductCountForInventory()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getLowStockProductCount"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("getLowStockProductList Tests")
    class GetLowStockProductListTests {

        @Test
        @DisplayName("Should return low stock product list")
        void getLowStockProductListReturnsProducts() throws Exception {
            // Arrange
            List<Product> products = createProductList(5);

            when(inventoryService.getlowStockProductListForInventory()).thenReturn(products);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getLowStockProductList"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when no low stock products exist")
        void getLowStockProductListReturnsNotFound() throws Exception {
            // Arrange
            when(inventoryService.getlowStockProductListForInventory()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getLowStockProductList"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("getTopSellingProductList Tests")
    class GetTopSellingProductListTests {

        @Test
        @DisplayName("Should return top selling product list")
        void getTopSellingProductListReturnsProducts() throws Exception {
            // Arrange
            List<InventoryListModel> models = createInventoryListModels(5);

            when(inventoryService.getTopSellingProductListForInventory()).thenReturn(models);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getTopSellingProductList"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when no top selling products exist")
        void getTopSellingProductListReturnsNotFound() throws Exception {
            // Arrange
            when(inventoryService.getTopSellingProductListForInventory()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getTopSellingProductList"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("getOutOfStockCount Tests")
    class GetOutOfStockCountTests {

        @Test
        @DisplayName("Should return out of stock count")
        void getOutOfStockCountReturnsCount() throws Exception {
            // Arrange
            when(inventoryService.getOutOfStockCountOfInventory()).thenReturn(15);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getOutOfStockCount"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when count is null")
        void getOutOfStockCountReturnsNotFound() throws Exception {
            // Arrange
            when(inventoryService.getOutOfStockCountOfInventory()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getOutOfStockCount"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("getTotalInventoryValue Tests")
    class GetTotalInventoryValueTests {

        @Test
        @DisplayName("Should return total inventory value")
        void getTotalInventoryValueReturnsValue() throws Exception {
            // Arrange
            when(inventoryService.getTotalInventoryValue()).thenReturn(new BigDecimal("50000.00"));

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getTotalInventoryValue"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when value is null")
        void getTotalInventoryValueReturnsNotFound() throws Exception {
            // Arrange
            when(inventoryService.getTotalInventoryValue()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getTotalInventoryValue"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("getTotalRevenue Tests")
    class GetTotalRevenueTests {

        @Test
        @DisplayName("Should return total revenue model")
        void getTotalRevenueReturnsRevenueModel() throws Exception {
            // Arrange
            InventoryRevenueModel revenueModel = createInventoryRevenueModel();

            when(inventoryHistoryService.getTotalRevenueForInventory()).thenReturn(revenueModel);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getTotalRevenue"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when no revenue data")
        void getTotalRevenueReturnsNotFound() throws Exception {
            // Arrange
            when(inventoryHistoryService.getTotalRevenueForInventory()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getTotalRevenue"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("getTopSellingProducts Tests")
    class GetTopSellingProductsTests {

        @Test
        @DisplayName("Should return top selling products model")
        void getTopSellingProductsReturnsModel() throws Exception {
            // Arrange
            TopInventoryRevenueModel model = createTopInventoryRevenueModel();

            when(inventoryHistoryService.getTopSellingProductsForInventory()).thenReturn(model);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getTopSellingProducts"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when no data exists")
        void getTopSellingProductsReturnsNotFound() throws Exception {
            // Arrange
            when(inventoryHistoryService.getTopSellingProductsForInventory()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getTopSellingProducts"))
                    .andExpect(status().isNotFound());
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

        Product product = new Product();
        product.setProductID(id);
        product.setProductName("Product " + id);
        inventory.setProductId(product);

        return inventory;
    }

    private List<Product> createProductList(int count) {
        List<Product> products = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            Product product = new Product();
            product.setProductID(i);
            product.setProductName("Product " + i);
            product.setProductCode("PROD00" + i);
            product.setDeleteFlag(false);
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

        return model;
    }
}
