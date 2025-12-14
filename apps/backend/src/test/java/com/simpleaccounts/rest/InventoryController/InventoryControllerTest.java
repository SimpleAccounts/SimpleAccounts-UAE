package com.simpleaccounts.rest.InventoryController;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.Inventory;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.productcontroller.InventoryListModel;
import com.simpleaccounts.rest.productcontroller.ProductRestHelper;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.InventoryHistoryService;
import com.simpleaccounts.service.InventoryService;
import com.simpleaccounts.rest.transactioncategorycontroller.TranscationCategoryHelper;
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

    @Mock
    private UserService userService;

    @Mock
    private TransactionCategoryService transactionCategoryService;

    @Mock
    private ProductRestHelper productRestHelper;

    @Mock
    private TranscationCategoryHelper transcationCategoryHelper;

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
            User user = new User();
            Role role = new Role();
            role.setRoleCode(1);
            user.setRole(role);

            List<Inventory> inventories = createInventoryList(5);
            PaginationResponseModel response = new PaginationResponseModel(5, inventories);
            InventoryListModel listModel = new InventoryListModel();

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(user);
            when(inventoryService.getInventoryList(any(), any())).thenReturn(response);
            when(productRestHelper.getInventoryListModel(any(Inventory.class))).thenReturn(listModel);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getInventoryProductList"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when no inventory exists")
        void getInventoryListReturnsNotFound() throws Exception {
            // Arrange
            User user = new User();
            Role role = new Role();
            role.setRoleCode(1);
            user.setRole(role);

            when(inventoryService.getInventoryList(any(), any())).thenReturn(null);
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(user);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getInventoryProductList"))
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
            mockMvc.perform(get("/rest/inventory/getInventoryById")
                            .param("id", "1"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when inventory does not exist")
        void getInventoryByIdReturnsNotFound() throws Exception {
            // Arrange
            when(inventoryService.findByPK(999)).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getInventoryById")
                            .param("id", "999"))
                    .andExpect(status().isBadRequest());
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
            mockMvc.perform(get("/rest/inventory/getProductCountForInventory"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return OK when count is null")
        void getTotalProductCountReturnsOkWhenNull() throws Exception {
            // Arrange
            when(inventoryService.getProductCountForInventory()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getProductCountForInventory"))
                    .andExpect(status().isOk());
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
        @DisplayName("Should return OK when stock is null")
        void getTotalStockOnHandReturnsOkWhenNull() throws Exception {
            // Arrange
            when(inventoryService.totalStockOnHand()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getTotalStockOnHand"))
                    .andExpect(status().isOk());
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
            mockMvc.perform(get("/rest/inventory/getlowStockProductCountForInventory"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return OK when count is null")
        void getLowStockProductCountReturnsOkWhenNull() throws Exception {
            // Arrange
            when(inventoryService.getlowStockProductCountForInventory()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getlowStockProductCountForInventory"))
                    .andExpect(status().isOk());
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
            mockMvc.perform(get("/rest/inventory/getlowStockProductListForInventory"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when no low stock products exist")
        void getLowStockProductListReturnsNotFound() throws Exception {
            // Arrange
            when(inventoryService.getlowStockProductListForInventory()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getlowStockProductListForInventory"))
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
            mockMvc.perform(get("/rest/inventory/getTopSellingProductListForInventory"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return OK when no top selling products exist")
        void getTopSellingProductListReturnsOkWhenNull() throws Exception {
            // Arrange
            when(inventoryService.getTopSellingProductListForInventory()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getTopSellingProductListForInventory"))
                    .andExpect(status().isOk());
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
            mockMvc.perform(get("/rest/inventory/getOutOfStockCountOfInventory"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return OK when count is null")
        void getOutOfStockCountReturnsOkWhenNull() throws Exception {
            // Arrange
            when(inventoryService.getOutOfStockCountOfInventory()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getOutOfStockCountOfInventory"))
                    .andExpect(status().isOk());
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
        @DisplayName("Should return OK when value is null")
        void getTotalInventoryValueReturnsOkWhenNull() throws Exception {
            // Arrange
            when(inventoryService.getTotalInventoryValue()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getTotalInventoryValue"))
                    .andExpect(status().isOk());
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
            mockMvc.perform(get("/rest/inventory/getTotalRevenueOfInventory"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return OK when no revenue data")
        void getTotalRevenueReturnsOkWhenNull() throws Exception {
            // Arrange
            when(inventoryHistoryService.getTotalRevenueForInventory()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getTotalRevenueOfInventory"))
                    .andExpect(status().isOk());
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
            mockMvc.perform(get("/rest/inventory/getTopSellingProductsForInventory"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return OK when no data exists")
        void getTopSellingProductsReturnsOkWhenNull() throws Exception {
            // Arrange
            when(inventoryHistoryService.getTopSellingProductsForInventory()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/inventory/getTopSellingProductsForInventory"))
                    .andExpect(status().isOk());
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
