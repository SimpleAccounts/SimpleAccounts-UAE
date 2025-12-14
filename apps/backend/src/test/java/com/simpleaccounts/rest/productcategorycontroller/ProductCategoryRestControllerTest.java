package com.simpleaccounts.rest.productcategorycontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.ProductCategory;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.ProductCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.MessageUtil;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductCategoryRestController Unit Tests")
class ProductCategoryRestControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private ProductCategoryService productCategoryService;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private UserService userServiceNew;

    @Mock
    private UserService userService;

    @Mock
    private ProductCategoryRestHelper productCategoryRestHelper;

    private ProductCategoryRestController productCategoryRestController;

    @BeforeEach
    void setUp() {
        productCategoryRestController = new ProductCategoryRestController(
            productCategoryService,
            jwtTokenUtil,
            userServiceNew,
            productCategoryRestHelper,
            userService);
        mockMvc = MockMvcBuilders.standaloneSetup(productCategoryRestController).build();
        objectMapper = new ObjectMapper();
        ReloadableResourceBundleMessageSource testMessageSource = new ReloadableResourceBundleMessageSource();
        testMessageSource.setBasename("classpath:messages");
        ReflectionTestUtils.setField(MessageUtil.class, "messageSource", testMessageSource);
    }

    @Nested
    @DisplayName("getProductCategoryList Tests")
    class GetProductCategoryListTests {

        @Test
        @DisplayName("Should return category list successfully")
        void getProductCategoryListReturnsCategories() throws Exception {
            // Arrange
            User user = new User();
            Role role = new Role();
            role.setRoleCode(1);
            user.setRole(role);

            List<ProductCategoryListModel> categoryModels = createCategoryModelList(5);
            PaginationResponseModel response = new PaginationResponseModel(5, categoryModels);

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(user);
            when(productCategoryService.getProductCategoryList(any(), any())).thenReturn(response);
            when(productCategoryRestHelper.getListModel(any())).thenReturn(categoryModels);

            // Act & Assert
            mockMvc.perform(get("/rest/productcategory/getList"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when no categories exist")
        void getProductCategoryListReturnsNotFound() throws Exception {
            // Arrange
            User user = new User();
            Role role = new Role();
            role.setRoleCode(1);
            user.setRole(role);

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(user);
            when(productCategoryService.getProductCategoryList(any(), any())).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/productcategory/getList"))
                    .andExpect(status().isInternalServerError());
        }

        @Test
        @DisplayName("Should handle empty list correctly")
        void getProductCategoryListHandlesEmptyList() throws Exception {
            // Arrange
            User user = new User();
            Role role = new Role();
            role.setRoleCode(1);
            user.setRole(role);

            PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(user);
            when(productCategoryService.getProductCategoryList(any(), any())).thenReturn(response);
            when(productCategoryRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

            // Act & Assert
            mockMvc.perform(get("/rest/productcategory/getList"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("getProductCategoryById Tests")
    class GetProductCategoryByIdTests {

        @Test
        @DisplayName("Should return category by ID")
        void getProductCategoryByIdReturnsCategory() throws Exception {
            // Arrange
            ProductCategory category = createCategory(1, "Electronics", "ELEC001");
            ProductCategoryListModel categoryModel = createCategoryModel(1, "Electronics", "ELEC001");

            when(productCategoryService.findByPK(1)).thenReturn(category);
            when(productCategoryRestHelper.getRequestModel(category)).thenReturn(categoryModel);

            // Act & Assert
            mockMvc.perform(get("/rest/productcategory/getById")
                            .param("id", "1"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when category does not exist")
        void getProductCategoryByIdReturnsNotFound() throws Exception {
            // Arrange
            when(productCategoryService.findByPK(999)).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/productcategory/getById")
                            .param("id", "999"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("deleteProductCategory Tests")
    class DeleteProductCategoryTests {

        @Test
        @DisplayName("Should delete category successfully")
        void deleteProductCategorySucceeds() throws Exception {
            // Arrange
            ProductCategory category = createCategory(1, "Electronics", "ELEC001");

            when(productCategoryService.findByPK(1)).thenReturn(category);

            // Act & Assert
            mockMvc.perform(delete("/rest/productcategory/delete")
                            .param("id", "1"))
                    .andExpect(status().isOk());

            verify(productCategoryService).update(any(ProductCategory.class), eq(1));
        }

        @Test
        @DisplayName("Should return not found when deleting non-existent category")
        void deleteProductCategoryReturnsNotFound() throws Exception {
            // Arrange
            when(productCategoryService.findByPK(999)).thenReturn(null);

            // Act & Assert
            mockMvc.perform(delete("/rest/productcategory/delete")
                            .param("id", "999"))
                    .andExpect(status().isInternalServerError());
        }
    }

    @Nested
    @DisplayName("Pagination Tests")
    class PaginationTests {

        @Test
        @DisplayName("Should handle pagination parameters correctly")
        void handlesPaginationParameters() throws Exception {
            // Arrange
            User user = new User();
            Role role = new Role();
            role.setRoleCode(1);
            user.setRole(role);

            List<ProductCategoryListModel> categoryModels = createCategoryModelList(10);
            PaginationResponseModel response = new PaginationResponseModel(10, categoryModels);

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(user);
            when(productCategoryService.getProductCategoryList(any(), any())).thenReturn(response);
            when(productCategoryRestHelper.getListModel(any())).thenReturn(categoryModels);

            // Act & Assert
            mockMvc.perform(get("/rest/productcategory/getList")
                            .param("pageNo", "0")
                            .param("pageSize", "10")
                            .param("sortingCol", "productCategoryName")
                            .param("sortingOrder", "asc"))
                    .andExpect(status().isOk());
        }
    }

    private List<ProductCategoryListModel> createCategoryModelList(int count) {
        List<ProductCategoryListModel> models = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            models.add(createCategoryModel(i, "Category " + i, "CAT00" + i));
        }
        return models;
    }

    private ProductCategoryListModel createCategoryModel(Integer id, String name, String code) {
        ProductCategoryListModel model = new ProductCategoryListModel();
        model.setId(id);
        model.setProductCategoryName(name);
        model.setProductCategoryCode(code);
        return model;
    }

    private ProductCategory createCategory(Integer id, String name, String code) {
        ProductCategory category = new ProductCategory();
        category.setId(id);
        category.setProductCategoryName(name);
        category.setProductCategoryCode(code);
        category.setProductCategoryDescription("Description for " + name);
        category.setDeleteFlag(false);
        category.setCreatedBy(1);
        category.setCreatedDate(LocalDateTime.now());
        category.setVersionNumber(1);
        return category;
    }
}
