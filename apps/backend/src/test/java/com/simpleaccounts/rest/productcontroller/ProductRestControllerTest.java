package com.simpleaccounts.rest.productcontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.transactioncategorycontroller.TranscationCategoryHelper;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.InvoiceLineItemService;
import com.simpleaccounts.service.ProductService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.VatCategoryService;
import com.simpleaccounts.utils.MessageUtil;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.test.util.ReflectionTestUtils;
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
    private VatCategoryService vatCategoryService;

    @Mock
    private ProductRestHelper productRestHelper;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private InvoiceLineItemService invoiceLineItemService;

    @Mock
    private TransactionCategoryService transactionCategoryService;

    @Mock
    private TranscationCategoryHelper transcationCategoryHelper;

    @Mock
    private UserService userService;

    @InjectMocks
    private ProductRestController productRestController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(productRestController).build();
        objectMapper = new ObjectMapper();
        ReloadableResourceBundleMessageSource testMessageSource = new ReloadableResourceBundleMessageSource();
        testMessageSource.setBasename("classpath:messages");
        ReflectionTestUtils.setField(MessageUtil.class, "messageSource", testMessageSource);
    }

    @Nested
    @DisplayName("getList Tests")
    class GetProductListTests {

        @Test
        @DisplayName("Should return product list successfully")
        void getProductListReturnsProductList() throws Exception {
            // Arrange
            User user = createUser(1);
            List<Product> products = createProductList(5);
            PaginationResponseModel response = new PaginationResponseModel(5, products);
            ProductListModel listModel = new ProductListModel();

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(user);
            when(productService.getProductList(any(), any())).thenReturn(response);
            when(productRestHelper.getListModel(any(Product.class))).thenReturn(listModel);

            // Act & Assert
            mockMvc.perform(get("/rest/product/getList"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when service returns null")
        void getProductListReturnsNotFoundWhenNull() throws Exception {
            // Arrange
            User user = createUser(1);

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(user);
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
            ProductRequestModel productModel = new ProductRequestModel();
            productModel.setProductID(1);

            when(productService.findByPK(1)).thenReturn(product);
            when(productRestHelper.getRequestModel(product)).thenReturn(productModel);

            // Act & Assert
            mockMvc.perform(get("/rest/product/getProductById").param("id", "1"))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("delete Tests")
    class DeleteProductTests {

        @Test
        @DisplayName("Should delete product when it exists")
        void deleteProductDeletesWhenExists() throws Exception {
            // Arrange
            Product product = createProduct(1, "Test Product", "PROD001");

            when(productService.findByPK(1)).thenReturn(product);

            // Act & Assert
            mockMvc.perform(delete("/rest/product/delete").param("id", "1"))
                .andExpect(status().isOk());

            verify(productService).deleteByIds(Arrays.asList(1));
        }

        @Test
        @DisplayName("Should return OK and not delete when product does not exist")
        void deleteProductDoesNothingWhenNotFound() throws Exception {
            // Arrange
            when(productService.findByPK(999)).thenReturn(null);

            // Act & Assert
            mockMvc.perform(delete("/rest/product/delete").param("id", "999"))
                .andExpect(status().isOk());

            verify(productService, never()).deleteByIds(any());
        }
    }

    @Nested
    @DisplayName("getInvoicesCountForProduct Tests")
    class GetInvoicesCountForProductTests {

        @Test
        @DisplayName("Should return invoice count for product")
        void getInvoicesCountForProductReturnsCount() throws Exception {
            // Arrange
            when(invoiceLineItemService.getTotalInvoiceCountByProductId(1)).thenReturn(5);

            // Act & Assert
            mockMvc.perform(get("/rest/product/getInvoicesCountForProduct").param("productId", "1"))
                .andExpect(status().isOk());
        }
    }

    private User createUser(Integer userId) {
        User user = new User();
        user.setUserId(userId);

        Role role = new Role();
        role.setRoleCode(1);
        user.setRole(role);

        return user;
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

    private List<Product> createProductList(int count) {
        List<Product> products = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            products.add(createProduct(i, "Product " + i, "PROD00" + i));
        }
        return products;
    }
}
