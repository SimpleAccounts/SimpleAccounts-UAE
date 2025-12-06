package com.simpleaccounts.rest.InventoryController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.productcontroller.*;
import com.simpleaccounts.rest.transactioncategorycontroller.TranscationCategoryHelper;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InventoryController.class)
@DisplayName("InventoryController Tests")
class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TransactionCategoryService transactionCategoryService;

    @MockBean
    private InventoryService inventoryService;

    @MockBean
    private ProductRestHelper productRestHelper;

    @MockBean
    private TranscationCategoryHelper transcationCategoryHelper;

    @MockBean
    private JwtTokenUtil jwtTokenUtil;

    @MockBean
    private UserService userService;

    @MockBean
    private InventoryHistoryService inventoryHistoryService;

    private User mockUser;
    private Inventory mockInventory;
    private Product mockProduct;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setUserId(1);

        mockProduct = new Product();
        mockProduct.setProductID(1);
        mockProduct.setProductName("Test Product");
        mockProduct.setProductCode("PROD001");

        mockInventory = new Inventory();
        mockInventory.setInventoryID(1);
        mockInventory.setProductId(mockProduct);
        mockInventory.setStockOnHand(100);
        mockInventory.setQuantitySold(50);
        mockInventory.setPurchaseQuantity(150);
        mockInventory.setReorderLevel(20);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(mockUser);
    }

    @Test
    @DisplayName("Should get inventory product list successfully")
    void testGetInventoryProductList_Success() throws Exception {
        PaginationResponseModel paginationResponse = new PaginationResponseModel();
        paginationResponse.setData(Arrays.asList(mockInventory));
        paginationResponse.setTotalElements(1L);

        InventoryListModel listModel = new InventoryListModel();
        listModel.setInventoryId(1);
        listModel.setProductName("Test Product");

        when(inventoryService.getInventoryList(anyMap(), any())).thenReturn(paginationResponse);
        when(productRestHelper.getInventoryListModel(any(Inventory.class))).thenReturn(listModel);

        mockMvc.perform(get("/rest/inventory/getInventoryProductList")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.totalElements").value(1));

        verify(inventoryService, times(1)).getInventoryList(anyMap(), any());
    }

    @Test
    @DisplayName("Should return NOT_FOUND when inventory list is null")
    void testGetInventoryProductList_NotFound() throws Exception {
        when(inventoryService.getInventoryList(anyMap(), any())).thenReturn(null);

        mockMvc.perform(get("/rest/inventory/getInventoryProductList")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(inventoryService, times(1)).getInventoryList(anyMap(), any());
    }

    @Test
    @DisplayName("Should handle empty inventory list")
    void testGetInventoryProductList_EmptyList() throws Exception {
        PaginationResponseModel paginationResponse = new PaginationResponseModel();
        paginationResponse.setData(new ArrayList<>());
        paginationResponse.setTotalElements(0L);

        when(inventoryService.getInventoryList(anyMap(), any())).thenReturn(paginationResponse);

        mockMvc.perform(get("/rest/inventory/getInventoryProductList")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(0));

        verify(inventoryService, times(1)).getInventoryList(anyMap(), any());
    }

    @Test
    @DisplayName("Should handle exception in getInventoryProductList")
    void testGetInventoryProductList_Exception() throws Exception {
        when(inventoryService.getInventoryList(anyMap(), any()))
                .thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/rest/inventory/getInventoryProductList")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("Should get inventory by product ID successfully")
    void testGetInventoryByProductId_Success() throws Exception {
        List<Inventory> inventoryList = Arrays.asList(mockInventory);
        when(inventoryService.getInventoryByProductId(1)).thenReturn(inventoryList);

        mockMvc.perform(get("/rest/inventory/getInventoryByProductId")
                        .param("id", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(inventoryService, times(1)).getInventoryByProductId(1);
    }

    @Test
    @DisplayName("Should handle empty inventory list by product ID")
    void testGetInventoryByProductId_EmptyList() throws Exception {
        when(inventoryService.getInventoryByProductId(1)).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/inventory/getInventoryByProductId")
                        .param("id", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(inventoryService, times(1)).getInventoryByProductId(1);
    }

    @Test
    @DisplayName("Should get inventory by ID successfully")
    void testGetInventoryById_Success() throws Exception {
        ProductRequestModel requestModel = new ProductRequestModel();
        requestModel.setInventoryId(1);

        when(inventoryService.findByPK(1)).thenReturn(mockInventory);
        when(productRestHelper.getInventory(any(Inventory.class))).thenReturn(requestModel);

        mockMvc.perform(get("/rest/inventory/getInventoryById")
                        .param("id", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inventoryId").value(1));

        verify(inventoryService, times(1)).findByPK(1);
    }

    @Test
    @DisplayName("Should return BAD_REQUEST when inventory not found by ID")
    void testGetInventoryById_NotFound() throws Exception {
        when(inventoryService.findByPK(1)).thenReturn(null);

        mockMvc.perform(get("/rest/inventory/getInventoryById")
                        .param("id", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        verify(inventoryService, times(1)).findByPK(1);
    }

    @Test
    @DisplayName("Should update inventory successfully")
    void testUpdate_Success() throws Exception {
        ProductRequestModel requestModel = new ProductRequestModel();
        requestModel.setInventoryId(1);
        requestModel.setStockInHand(100);

        mockMvc.perform(post("/rest/inventory/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0083"))
                .andExpect(jsonPath("$.error").value(false));

        verify(productRestHelper, times(1)).updateInventoryEntity(any(), anyInt());
    }

    @Test
    @DisplayName("Should handle exception during update")
    void testUpdate_Exception() throws Exception {
        ProductRequestModel requestModel = new ProductRequestModel();
        requestModel.setInventoryId(1);

        doThrow(new RuntimeException("Update error"))
                .when(productRestHelper).updateInventoryEntity(any(), anyInt());

        mockMvc.perform(post("/rest/inventory/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value(true));
    }

    @Test
    @DisplayName("Should get product count for inventory")
    void testGetProductCountForInventory_Success() throws Exception {
        when(inventoryService.getProductCountForInventory()).thenReturn(50);

        mockMvc.perform(get("/rest/inventory/getProductCountForInventory")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("50"));

        verify(inventoryService, times(1)).getProductCountForInventory();
    }

    @Test
    @DisplayName("Should get total stock on hand")
    void testGetTotalStockOnHand_Success() throws Exception {
        when(inventoryService.totalStockOnHand()).thenReturn(1000);

        mockMvc.perform(get("/rest/inventory/getTotalStockOnHand")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("1000"));

        verify(inventoryService, times(1)).totalStockOnHand();
    }

    @Test
    @DisplayName("Should get low stock product count")
    void testGetLowStockProductCount_Success() throws Exception {
        when(inventoryService.getlowStockProductCountForInventory()).thenReturn(5);

        mockMvc.perform(get("/rest/inventory/getlowStockProductCountForInventory")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("5"));

        verify(inventoryService, times(1)).getlowStockProductCountForInventory();
    }

    @Test
    @DisplayName("Should get low stock product list")
    void testGetLowStockProductList_Success() throws Exception {
        List<Product> productList = Arrays.asList(mockProduct);
        when(inventoryService.getlowStockProductListForInventory()).thenReturn(productList);

        mockMvc.perform(get("/rest/inventory/getlowStockProductListForInventory")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(inventoryService, times(1)).getlowStockProductListForInventory();
    }

    @Test
    @DisplayName("Should handle null low stock product list")
    void testGetLowStockProductList_Null() throws Exception {
        when(inventoryService.getlowStockProductListForInventory()).thenReturn(null);

        mockMvc.perform(get("/rest/inventory/getlowStockProductListForInventory")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(inventoryService, times(1)).getlowStockProductListForInventory();
    }

    @Test
    @DisplayName("Should get top selling product list")
    void testGetTopSellingProductList_Success() throws Exception {
        List<InventoryListModel> topProducts = new ArrayList<>();
        InventoryListModel model = new InventoryListModel();
        model.setProductName("Top Product");
        topProducts.add(model);

        when(inventoryService.getTopSellingProductListForInventory()).thenReturn(topProducts);

        mockMvc.perform(get("/rest/inventory/getTopSellingProductListForInventory")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(inventoryService, times(1)).getTopSellingProductListForInventory();
    }

    @Test
    @DisplayName("Should get out of stock count")
    void testGetOutOfStockCount_Success() throws Exception {
        when(inventoryService.getOutOfStockCountOfInventory()).thenReturn(3);

        mockMvc.perform(get("/rest/inventory/getOutOfStockCountOfInventory")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("3"));

        verify(inventoryService, times(1)).getOutOfStockCountOfInventory();
    }

    @Test
    @DisplayName("Should get total inventory value")
    void testGetTotalInventoryValue_Success() throws Exception {
        BigDecimal totalValue = new BigDecimal("50000.00");
        when(inventoryService.getTotalInventoryValue()).thenReturn(totalValue);

        mockMvc.perform(get("/rest/inventory/getTotalInventoryValue")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("50000.00"));

        verify(inventoryService, times(1)).getTotalInventoryValue();
    }

    @Test
    @DisplayName("Should get total revenue of inventory")
    void testGetTotalRevenueOfInventory_Success() throws Exception {
        InventoryRevenueModel revenueModel = new InventoryRevenueModel();
        revenueModel.setTotalRevenue(new BigDecimal("100000"));

        when(inventoryHistoryService.getTotalRevenueForInventory()).thenReturn(revenueModel);

        mockMvc.perform(get("/rest/inventory/getTotalRevenueOfInventory")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRevenue").value(100000));

        verify(inventoryHistoryService, times(1)).getTotalRevenueForInventory();
    }

    @Test
    @DisplayName("Should get total quantity sold")
    void testGetTotalQuantitySold_Success() throws Exception {
        InventoryRevenueModel revenueModel = new InventoryRevenueModel();
        revenueModel.setTotalQuantity(500);

        when(inventoryHistoryService.getTotalQuantitySoldForInventory()).thenReturn(revenueModel);

        mockMvc.perform(get("/rest/inventory/getTotalQuantitySoldForInventory")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalQuantity").value(500));

        verify(inventoryHistoryService, times(1)).getTotalQuantitySoldForInventory();
    }

    @Test
    @DisplayName("Should get top selling products")
    void testGetTopSellingProducts_Success() throws Exception {
        TopInventoryRevenueModel topModel = new TopInventoryRevenueModel();

        when(inventoryHistoryService.getTopSellingProductsForInventory()).thenReturn(topModel);

        mockMvc.perform(get("/rest/inventory/getTopSellingProductsForInventory")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(inventoryHistoryService, times(1)).getTopSellingProductsForInventory();
    }

    @Test
    @DisplayName("Should get top profit generating products")
    void testGetTopProfitGeneratingProducts_Success() throws Exception {
        TopInventoryRevenueModel topModel = new TopInventoryRevenueModel();

        when(inventoryHistoryService.getTopProfitGeneratingProductsForInventory()).thenReturn(topModel);

        mockMvc.perform(get("/rest/inventory/getTopProfitGeneratingProductsForInventory")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(inventoryHistoryService, times(1)).getTopProfitGeneratingProductsForInventory();
    }

    @Test
    @DisplayName("Should get low selling products")
    void testGetLowSellingProducts_Success() throws Exception {
        TopInventoryRevenueModel topModel = new TopInventoryRevenueModel();

        when(inventoryHistoryService.getLowSellingProductsForInventory()).thenReturn(topModel);

        mockMvc.perform(get("/rest/inventory/getLowSellingProductsForInventory")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(inventoryHistoryService, times(1)).getLowSellingProductsForInventory();
    }

    @Test
    @DisplayName("Should get inventory history by product and supplier")
    void testGetInventoryHistory_Success() throws Exception {
        Contact supplier = new Contact();
        supplier.setContactId(1);
        supplier.setFirstName("Supplier");
        supplier.setLastName("Name");

        InventoryHistory history = new InventoryHistory();
        history.setId(1);
        history.setProductId(mockProduct);
        history.setSupplierId(supplier);
        history.setInventory(mockInventory);
        history.setQuantity(10);
        history.setUnitCost(new BigDecimal("100"));
        history.setTransactionDate(LocalDate.now());

        when(inventoryHistoryService.getHistory(1, 1))
                .thenReturn(Arrays.asList(history));

        mockMvc.perform(get("/rest/inventory/getInventoryHistoryByProductIdAndSupplierId")
                        .param("productId", "1")
                        .param("supplierId", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(inventoryHistoryService, times(1)).getHistory(1, 1);
    }

    @Test
    @DisplayName("Should handle inventory history with invoice")
    void testGetInventoryHistory_WithInvoice() throws Exception {
        Contact customer = new Contact();
        customer.setContactId(2);
        customer.setFirstName("Customer");

        Invoice invoice = new Invoice();
        invoice.setInvoiceId(1);
        invoice.setType(2); // Sales invoice
        invoice.setContact(customer);
        invoice.setReferenceNumber("INV-001");

        InventoryHistory history = new InventoryHistory();
        history.setId(1);
        history.setProductId(mockProduct);
        history.setInventory(mockInventory);
        history.setInvoice(invoice);
        history.setQuantity(5);
        history.setUnitCost(new BigDecimal("100"));
        history.setUnitSellingPrice(150.0f);
        history.setTransactionDate(LocalDate.now());

        when(inventoryHistoryService.getHistory(1, null))
                .thenReturn(Arrays.asList(history));

        mockMvc.perform(get("/rest/inventory/getInventoryHistoryByProductIdAndSupplierId")
                        .param("productId", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].transactionType").value("Sales"));

        verify(inventoryHistoryService, times(1)).getHistory(1, null);
    }

    @Test
    @DisplayName("Should handle inventory history with organization name")
    void testGetInventoryHistory_WithOrganization() throws Exception {
        Contact supplier = new Contact();
        supplier.setContactId(1);
        supplier.setOrganization("Test Organization");
        supplier.setFirstName("First");
        supplier.setLastName("Last");

        InventoryHistory history = new InventoryHistory();
        history.setId(1);
        history.setProductId(mockProduct);
        history.setSupplierId(supplier);
        history.setInventory(mockInventory);
        history.setQuantity(10);
        history.setTransactionDate(LocalDate.now());

        when(inventoryHistoryService.getHistory(1, 1))
                .thenReturn(Arrays.asList(history));

        mockMvc.perform(get("/rest/inventory/getInventoryHistoryByProductIdAndSupplierId")
                        .param("productId", "1")
                        .param("supplierId", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].supplierName").value("Test Organization"));

        verify(inventoryHistoryService, times(1)).getHistory(1, 1);
    }

    @Test
    @DisplayName("Should handle empty inventory history")
    void testGetInventoryHistory_Empty() throws Exception {
        when(inventoryHistoryService.getHistory(anyInt(), anyInt()))
                .thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/inventory/getInventoryHistoryByProductIdAndSupplierId")
                        .param("productId", "1")
                        .param("supplierId", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(inventoryHistoryService, times(1)).getHistory(1, 1);
    }

    @Test
    @DisplayName("Should handle zero values in inventory")
    void testGetProductCountForInventory_Zero() throws Exception {
        when(inventoryService.getProductCountForInventory()).thenReturn(0);

        mockMvc.perform(get("/rest/inventory/getProductCountForInventory")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("0"));

        verify(inventoryService, times(1)).getProductCountForInventory();
    }

    @Test
    @DisplayName("Should handle null inventory value")
    void testGetTotalInventoryValue_Null() throws Exception {
        when(inventoryService.getTotalInventoryValue()).thenReturn(null);

        mockMvc.perform(get("/rest/inventory/getTotalInventoryValue")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(inventoryService, times(1)).getTotalInventoryValue();
    }

    @Test
    @DisplayName("Should handle multiple inventory items by product ID")
    void testGetInventoryByProductId_Multiple() throws Exception {
        Inventory inventory2 = new Inventory();
        inventory2.setInventoryID(2);
        inventory2.setProductId(mockProduct);
        inventory2.setStockOnHand(50);

        when(inventoryService.getInventoryByProductId(1))
                .thenReturn(Arrays.asList(mockInventory, inventory2));

        mockMvc.perform(get("/rest/inventory/getInventoryByProductId")
                        .param("id", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));

        verify(inventoryService, times(1)).getInventoryByProductId(1);
    }

    @Test
    @DisplayName("Should verify content type in responses")
    void testGetInventoryProductList_ContentType() throws Exception {
        PaginationResponseModel paginationResponse = new PaginationResponseModel();
        paginationResponse.setData(new ArrayList<>());

        when(inventoryService.getInventoryList(anyMap(), any())).thenReturn(paginationResponse);

        mockMvc.perform(get("/rest/inventory/getInventoryProductList")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }
}
