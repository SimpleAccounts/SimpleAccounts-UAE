package com.simpleaccounts.rest.productcontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.entity.ProductCategory;
import com.simpleaccounts.entity.ProductWarehouse;
import com.simpleaccounts.entity.VatCategory;
import com.simpleaccounts.helper.ProductRestControllerHelper;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.ProductCategoryService;
import com.simpleaccounts.service.ProductLineItemService;
import com.simpleaccounts.service.ProductService;
import com.simpleaccounts.service.ProductWarehouseService;
import com.simpleaccounts.service.VatCategoryService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductRestController Unit Tests")
class ProductRestControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private ProductService productService;

    @Mock
    private ProductLineItemService productLineItemService;

    @Mock
    private ProductCategoryService productCategoryService;

    @Mock
    private VatCategoryService vatCategoryService;

    @Mock
    private ProductWarehouseService productWarehouseService;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private ProductRestControllerHelper productRestControllerHelper;

    @InjectMocks
    private ProductRestController productRestController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(productRestController).build();
        objectMapper = new ObjectMapper();
    }

    @Nested
    @DisplayName("getProducts Tests")
    class GetProductsTests {

        @Test
        @DisplayName("Should return product list successfully")
        void getProductsReturnsProductList() throws Exception {
            // Arrange
            List<ProductModel> productModels = createProductModelList(5);
            PaginationResponseModel response = new PaginationResponseModel(5, productModels);

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(productService.getProductList(any(), any())).thenReturn(response);
            when(productRestControllerHelper.getModelList(any())).thenReturn(productModels);

            // Act & Assert
            mockMvc.perform(get("/rest/product/getList"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when no products exist")
        void getProductsReturnsNotFoundWhenEmpty() throws Exception {
            // Arrange
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(productService.getProductList(any(), any())).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/product/getList"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("getProductById Tests")
    class GetProductByIdTests {

        @Test
        @DisplayName("Should return product by ID")
        void getProductByIdReturnsProduct() throws Exception {
            // Arrange
            Product product = createProduct(1, "Test Product", "PROD001");
            ProductModel productModel = createProductModel(1, "Test Product", "PROD001");

            when(productService.findByPK(1)).thenReturn(product);
            when(productRestControllerHelper.getModel(product)).thenReturn(productModel);

            // Act & Assert
            mockMvc.perform(get("/rest/product/getById")
                            .param("productId", "1"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when product does not exist")
        void getProductByIdReturnsNotFound() throws Exception {
            // Arrange
            when(productService.findByPK(999)).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/product/getById")
                            .param("productId", "999"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("deleteProduct Tests")
    class DeleteProductTests {

        @Test
        @DisplayName("Should delete product successfully")
        void deleteProductSucceeds() throws Exception {
            // Arrange
            Product product = createProduct(1, "Test Product", "PROD001");

            when(productService.findByPK(1)).thenReturn(product);

            // Act & Assert
            mockMvc.perform(delete("/rest/product/delete")
                            .param("productId", "1"))
                    .andExpect(status().isOk());

            verify(productService).update(any(Product.class));
        }

        @Test
        @DisplayName("Should return not found when deleting non-existent product")
        void deleteProductReturnsNotFound() throws Exception {
            // Arrange
            when(productService.findByPK(999)).thenReturn(null);

            // Act & Assert
            mockMvc.perform(delete("/rest/product/delete")
                            .param("productId", "999"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("getCategories Tests")
    class GetCategoriesTests {

        @Test
        @DisplayName("Should return product categories")
        void getCategoriesReturnsCategories() throws Exception {
            // Arrange
            List<ProductCategory> categories = createCategoryList(3);

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(productCategoryService.findAllProductCategoryByUserId(1, false))
                    .thenReturn(categories);

            // Act & Assert
            mockMvc.perform(get("/rest/product/getcategory"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return empty list when no categories exist")
        void getCategoriesReturnsEmptyList() throws Exception {
            // Arrange
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(productCategoryService.findAllProductCategoryByUserId(1, false))
                    .thenReturn(new ArrayList<>());

            // Act & Assert
            mockMvc.perform(get("/rest/product/getcategory"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("getVatCategories Tests")
    class GetVatCategoriesTests {

        @Test
        @DisplayName("Should return VAT categories")
        void getVatCategoriesReturnsCategories() throws Exception {
            // Arrange
            List<VatCategory> vatCategories = createVatCategoryList(3);

            when(vatCategoryService.getVatCategoryList()).thenReturn(vatCategories);

            // Act & Assert
            mockMvc.perform(get("/rest/product/getvatcategory"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when no VAT categories exist")
        void getVatCategoriesReturnsNotFound() throws Exception {
            // Arrange
            when(vatCategoryService.getVatCategoryList()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/product/getvatcategory"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("getWarehouses Tests")
    class GetWarehousesTests {

        @Test
        @DisplayName("Should return warehouses")
        void getWarehousesReturnsWarehouses() throws Exception {
            // Arrange
            List<ProductWarehouse> warehouses = createWarehouseList(3);

            when(productWarehouseService.getProductWarehouseList()).thenReturn(warehouses);

            // Act & Assert
            mockMvc.perform(get("/rest/product/getwarehouse"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when no warehouses exist")
        void getWarehousesReturnsNotFound() throws Exception {
            // Arrange
            when(productWarehouseService.getProductWarehouseList()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/product/getwarehouse"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("getTotalProductCountByVatId Tests")
    class GetTotalProductCountByVatIdTests {

        @Test
        @DisplayName("Should return product count by VAT ID")
        void getTotalProductCountByVatIdReturnsCount() throws Exception {
            // Arrange
            when(productService.getTotalProductCountByVatId(1)).thenReturn(10);

            // Act & Assert
            mockMvc.perform(get("/rest/product/getTotalProductCountByVatId")
                            .param("vatId", "1"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when count is null")
        void getTotalProductCountByVatIdReturnsNotFound() throws Exception {
            // Arrange
            when(productService.getTotalProductCountByVatId(999)).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/product/getTotalProductCountByVatId")
                            .param("vatId", "999"))
                    .andExpect(status().isNotFound());
        }
    }

    private List<ProductModel> createProductModelList(int count) {
        List<ProductModel> models = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            models.add(createProductModel(i, "Product " + i, "PROD00" + i));
        }
        return models;
    }

    private ProductModel createProductModel(Integer id, String name, String code) {
        ProductModel model = new ProductModel();
        model.setProductId(id);
        model.setProductName(name);
        model.setProductCode(code);
        return model;
    }

    private Product createProduct(Integer id, String name, String code) {
        Product product = new Product();
        product.setProductID(id);
        product.setProductName(name);
        product.setProductCode(code);
        product.setProductDescription("Description for " + name);
        product.setDeleteFlag(false);
        product.setCreatedBy(1);
        product.setCreatedDate(LocalDateTime.now());
        product.setLineItemList(new ArrayList<>());
        return product;
    }

    private List<ProductCategory> createCategoryList(int count) {
        List<ProductCategory> categories = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            ProductCategory category = new ProductCategory();
            category.setId(i);
            category.setProductCategoryName("Category " + i);
            category.setProductCategoryCode("CAT00" + i);
            category.setDeleteFlag(false);
            categories.add(category);
        }
        return categories;
    }

    private List<VatCategory> createVatCategoryList(int count) {
        List<VatCategory> categories = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            VatCategory vatCategory = new VatCategory();
            vatCategory.setId(i);
            vatCategory.setVatCategoryName("VAT " + (5 * i) + "%");
            vatCategory.setVat(new BigDecimal(5 * i));
            vatCategory.setDeleteFlag(false);
            categories.add(vatCategory);
        }
        return categories;
    }

    private List<ProductWarehouse> createWarehouseList(int count) {
        List<ProductWarehouse> warehouses = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            ProductWarehouse warehouse = new ProductWarehouse();
            warehouse.setProductWarehouseId(i);
            warehouse.setWarehouseName("Warehouse " + i);
            warehouse.setWarehouseCode("WH00" + i);
            warehouse.setDeleteFlag(false);
            warehouses.add(warehouse);
        }
        return warehouses;
    }
}
