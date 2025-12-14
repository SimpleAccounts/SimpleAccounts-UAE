package com.simpleaccounts.rest.vatcontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.VatCategory;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.ProductService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.VatCategoryService;
import java.math.BigDecimal;
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
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@DisplayName("VatController Unit Tests")
class VatControllerTest {

    private MockMvc mockMvc;

    @Mock
    private VatCategoryService vatCategoryService;

    @Mock
    private VatCategoryRestHelper vatCategoryRestHelper;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private ProductService productService;

    @Mock
    private UserService userService;

    @InjectMocks
    private VatController vatController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(vatController).build();
        objectMapper = new ObjectMapper();
    }

    @Nested
    @DisplayName("getVatList Tests")
    class GetVatListTests {

        @Test
        @DisplayName("Should return VAT list with OK status")
        void getVatListReturnsOkStatus() throws Exception {
            // Arrange
            User user = createTestUser();
            List<VatCategory> categories = createVatCategoryList(3);
            List<VatCategoryModel> models = createVatCategoryModelList(3);
            PaginationResponseModel response = new PaginationResponseModel(3, categories);

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(user);
            when(vatCategoryService.getVatCategoryList(any(), any())).thenReturn(response);
            when(vatCategoryRestHelper.getList(any())).thenReturn(models);

            // Act & Assert
            mockMvc.perform(get("/rest/vat/getList")
                    .param("name", "")
                    .param("vatPercentage", ""))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return NOT_FOUND when response is null")
        void getVatListReturnsNotFoundWhenNull() throws Exception {
            // Arrange
            User user = createTestUser();
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(user);
            when(vatCategoryService.getVatCategoryList(any(), any())).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/vat/getList"))
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("delete Tests")
    class DeleteTests {

        @Test
        @DisplayName("Should delete VAT category successfully")
        void deleteReturnsOkStatus() throws Exception {
            // Arrange
            VatCategory category = createVatCategory(1);
            when(vatCategoryService.findByPK(1)).thenReturn(category);
            when(vatCategoryService.update(any(), anyInt())).thenReturn(category);

            // Act & Assert
            mockMvc.perform(delete("/rest/vat/delete")
                    .param("id", "1"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return NOT_FOUND when category not found")
        void deleteReturnsNotFoundWhenCategoryMissing() throws Exception {
            // Arrange
            when(vatCategoryService.findByPK(999)).thenReturn(null);

            // Act & Assert
            mockMvc.perform(delete("/rest/vat/delete")
                    .param("id", "999"))
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("getById Tests")
    class GetByIdTests {

        @Test
        @DisplayName("Should return VAT category by ID")
        void getByIdReturnsCategory() throws Exception {
            // Arrange
            VatCategory category = createVatCategory(1);
            VatCategoryModel model = createVatCategoryModel(1);
            when(vatCategoryService.findByPK(1)).thenReturn(category);
            when(vatCategoryRestHelper.getModel(category)).thenReturn(model);

            // Act & Assert
            mockMvc.perform(get("/rest/vat/getById")
                    .param("id", "1"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return NOT_FOUND when category not found by ID")
        void getByIdReturnsNotFoundWhenMissing() throws Exception {
            // Arrange
            when(vatCategoryService.findByPK(999)).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/vat/getById")
                    .param("id", "999"))
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("save Tests")
    class SaveTests {

        @Test
        @DisplayName("Should save VAT category successfully")
        void saveReturnsOkStatus() throws Exception {
            // Arrange
            VatCategoryRequestModel requestModel = new VatCategoryRequestModel();
            requestModel.setName("Test Category");
            requestModel.setVat(BigDecimal.valueOf(5));

            VatCategory category = createVatCategory(1);
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(vatCategoryRestHelper.getEntity(any())).thenReturn(category);
            doNothing().when(vatCategoryService).persist(any());

            // Act & Assert
            mockMvc.perform(post("/rest/vat/save")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("update Tests")
    class UpdateTests {

        @Test
        @DisplayName("Should update VAT category successfully")
        void updateReturnsOkStatus() throws Exception {
            // Arrange
            VatCategoryRequestModel requestModel = new VatCategoryRequestModel();
            requestModel.setId(1);
            requestModel.setName("Updated Category");
            requestModel.setVat(BigDecimal.valueOf(10));

            VatCategory category = createVatCategory(1);
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(vatCategoryRestHelper.getEntity(any())).thenReturn(category);
            when(vatCategoryService.update(any())).thenReturn(category);

            // Act & Assert
            mockMvc.perform(post("/rest/vat/update")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("getProductCountsForVat Tests")
    class GetProductCountsForVatTests {

        @Test
        @DisplayName("Should return product count for VAT")
        void getProductCountsForVatReturnsCount() throws Exception {
            // Arrange
            when(productService.getTotalProductCountByVatId(1)).thenReturn(10);

            // Act & Assert
            mockMvc.perform(get("/rest/vat/getProductCountsForVat")
                    .param("vatId", "1"))
                .andExpect(status().isOk());

            verify(productService).getTotalProductCountByVatId(1);
        }
    }

    private User createTestUser() {
        User user = new User();
        user.setUserId(1);
        user.setFirstName("Test");
        user.setLastName("User");
        return user;
    }

    private VatCategory createVatCategory(Integer id) {
        VatCategory category = new VatCategory();
        category.setId(id);
        category.setName("Category " + id);
        category.setVat(BigDecimal.valueOf(5));
        category.setDeleteFlag(false);
        return category;
    }

    private List<VatCategory> createVatCategoryList(int count) {
        List<VatCategory> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            list.add(createVatCategory(i + 1));
        }
        return list;
    }

    private VatCategoryModel createVatCategoryModel(Integer id) {
        VatCategoryModel model = new VatCategoryModel();
        model.setId(id);
        model.setName("Category " + id);
        model.setVat(BigDecimal.valueOf(5));
        return model;
    }

    private List<VatCategoryModel> createVatCategoryModelList(int count) {
        List<VatCategoryModel> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            list.add(createVatCategoryModel(i + 1));
        }
        return list;
    }
}
