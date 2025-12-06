package com.simpleaccounts.rest.productcategorycontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.constant.dbfilter.ProductCategoryFilterEnum;
import com.simpleaccounts.entity.ProductCategory;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.ProductCategoryService;
import com.simpleaccounts.service.UserService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(ProductCategoryRestController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProductCategoryRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean private ProductCategoryService productCategoryService;
    @MockBean private JwtTokenUtil jwtTokenUtil;
    @MockBean private UserService userService;
    @MockBean private ProductCategoryRestHelper productCategoryRestHelper;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    private User adminUser;
    private User normalUser;

    @BeforeEach
    void setUp() {
        Role adminRole = new Role();
        adminRole.setRoleCode(1);

        Role userRole = new Role();
        userRole.setRoleCode(2);

        adminUser = new User();
        adminUser.setUserId(1);
        adminUser.setRole(adminRole);

        normalUser = new User();
        normalUser.setUserId(2);
        normalUser.setRole(userRole);
    }

    @Test
    void getListShouldReturnPaginatedProductCategories() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        PaginationResponseModel pagination = new PaginationResponseModel(10, new ArrayList<>());
        when(productCategoryService.getProductCategoryList(any(Map.class), any())).thenReturn(pagination);
        when(productCategoryRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/productcategory/getList")
                        .param("productCategoryCode", "CAT-001")
                        .param("productCategoryName", "Electronics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(10));

        verify(productCategoryService).getProductCategoryList(any(Map.class), any());
        verify(productCategoryRestHelper).getListModel(any());
    }

    @Test
    void getListShouldFilterByUserIdForNonAdminUser() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(2);
        when(userService.findByPK(2)).thenReturn(normalUser);

        PaginationResponseModel pagination = new PaginationResponseModel(5, new ArrayList<>());
        when(productCategoryService.getProductCategoryList(any(Map.class), any())).thenReturn(pagination);
        when(productCategoryRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/productcategory/getList")
                        .param("userId", "2"))
                .andExpect(status().isOk());

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(productCategoryService).getProductCategoryList(captor.capture(), any());

        Map<ProductCategoryFilterEnum, Object> filterData = captor.getValue();
        assert filterData.containsKey(ProductCategoryFilterEnum.USER_ID);
    }

    @Test
    void getListShouldNotFilterByUserIdForAdminUser() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        PaginationResponseModel pagination = new PaginationResponseModel(10, new ArrayList<>());
        when(productCategoryService.getProductCategoryList(any(Map.class), any())).thenReturn(pagination);
        when(productCategoryRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/productcategory/getList"))
                .andExpect(status().isOk());

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(productCategoryService).getProductCategoryList(captor.capture(), any());

        Map<ProductCategoryFilterEnum, Object> filterData = captor.getValue();
        assert !filterData.containsKey(ProductCategoryFilterEnum.USER_ID);
    }

    @Test
    void getListShouldApplyProductCategoryCodeFilter() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        PaginationResponseModel pagination = new PaginationResponseModel(3, new ArrayList<>());
        when(productCategoryService.getProductCategoryList(any(Map.class), any())).thenReturn(pagination);
        when(productCategoryRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/productcategory/getList")
                        .param("productCategoryCode", "CAT-001"))
                .andExpect(status().isOk());

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(productCategoryService).getProductCategoryList(captor.capture(), any());

        Map<ProductCategoryFilterEnum, Object> filterData = captor.getValue();
        assert filterData.containsKey(ProductCategoryFilterEnum.PRODUCT_CATEGORY_CODE);
    }

    @Test
    void getListShouldApplyProductCategoryNameFilter() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        PaginationResponseModel pagination = new PaginationResponseModel(2, new ArrayList<>());
        when(productCategoryService.getProductCategoryList(any(Map.class), any())).thenReturn(pagination);
        when(productCategoryRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/productcategory/getList")
                        .param("productCategoryName", "Electronics"))
                .andExpect(status().isOk());

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(productCategoryService).getProductCategoryList(captor.capture(), any());

        Map<ProductCategoryFilterEnum, Object> filterData = captor.getValue();
        assert filterData.containsKey(ProductCategoryFilterEnum.PRODUCT_CATEGORY_NAME);
    }

    @Test
    void getListShouldAlwaysFilterByDeleteFlagFalse() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        PaginationResponseModel pagination = new PaginationResponseModel(10, new ArrayList<>());
        when(productCategoryService.getProductCategoryList(any(Map.class), any())).thenReturn(pagination);
        when(productCategoryRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/productcategory/getList"))
                .andExpect(status().isOk());

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(productCategoryService).getProductCategoryList(captor.capture(), any());

        Map<ProductCategoryFilterEnum, Object> filterData = captor.getValue();
        assert filterData.get(ProductCategoryFilterEnum.DELETE_FLAG).equals(false);
    }

    @Test
    void getListShouldReturnInternalServerErrorWhenServiceReturnsNull() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(productCategoryService.getProductCategoryList(any(Map.class), any())).thenReturn(null);

        mockMvc.perform(get("/rest/productcategory/getList"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getByIdShouldReturnProductCategory() throws Exception {
        ProductCategory productCategory = new ProductCategory();
        productCategory.setId(1);
        productCategory.setProductCategoryCode("CAT-001");
        productCategory.setProductCategoryName("Electronics");

        ProductCategoryListModel listModel = new ProductCategoryListModel();
        listModel.setId(1);
        listModel.setProductCategoryCode("CAT-001");

        when(productCategoryService.findByPK(1)).thenReturn(productCategory);
        when(productCategoryRestHelper.getRequestModel(productCategory)).thenReturn(listModel);

        mockMvc.perform(get("/rest/productcategory/getById")
                        .param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.productCategoryCode").value("CAT-001"));

        verify(productCategoryService).findByPK(1);
        verify(productCategoryRestHelper).getRequestModel(productCategory);
    }

    @Test
    void deleteShouldSoftDeleteProductCategory() throws Exception {
        ProductCategory productCategory = new ProductCategory();
        productCategory.setId(1);
        productCategory.setDeleteFlag(false);

        when(productCategoryService.findByPK(1)).thenReturn(productCategory);

        mockMvc.perform(delete("/rest/productcategory/delete")
                        .param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0038"))
                .andExpect(jsonPath("$.error").value(false));

        verify(productCategoryService).update(productCategory, 1);
        assert productCategory.getDeleteFlag() == true;
    }

    @Test
    void deleteShouldReturnInternalServerErrorWhenProductCategoryNotFound() throws Exception {
        when(productCategoryService.findByPK(1)).thenReturn(null);

        mockMvc.perform(delete("/rest/productcategory/delete")
                        .param("id", "1"))
                .andExpect(status().isInternalServerError());

        verify(productCategoryService, never()).update(any(), any());
    }

    @Test
    void deletesShouldDeleteMultipleProductCategories() throws Exception {
        DeleteModel deleteModel = new DeleteModel();
        deleteModel.setIds(Arrays.asList(1, 2, 3));

        doNothing().when(productCategoryService).deleteByIds(any(List.class));

        mockMvc.perform(delete("/rest/productcategory/deletes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deleteModel)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0038"))
                .andExpect(jsonPath("$.error").value(false));

        verify(productCategoryService).deleteByIds(any(List.class));
    }

    @Test
    void deletesShouldReturnErrorOnException() throws Exception {
        DeleteModel deleteModel = new DeleteModel();
        deleteModel.setIds(Arrays.asList(1, 2, 3));

        doThrow(new RuntimeException("Database error")).when(productCategoryService).deleteByIds(any(List.class));

        mockMvc.perform(delete("/rest/productcategory/deletes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deleteModel)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value(true));
    }

    @Test
    void saveShouldCreateNewProductCategory() throws Exception {
        ProductCategoryListModel requestModel = new ProductCategoryListModel();
        requestModel.setProductCategoryCode("CAT-001");
        requestModel.setProductCategoryName("Electronics");

        ProductCategory productCategory = new ProductCategory();
        productCategory.setProductCategoryCode("CAT-001");
        productCategory.setProductCategoryName("Electronics");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(productCategoryRestHelper.getEntity(any(ProductCategoryListModel.class))).thenReturn(productCategory);

        mockMvc.perform(post("/rest/productcategory/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0039"))
                .andExpect(jsonPath("$.error").value(false));

        verify(productCategoryService).persist(any(ProductCategory.class));
    }

    @Test
    void saveShouldSetCreatedByAndCreatedDate() throws Exception {
        ProductCategoryListModel requestModel = new ProductCategoryListModel();
        requestModel.setProductCategoryCode("CAT-001");
        requestModel.setProductCategoryName("Electronics");

        ProductCategory productCategory = new ProductCategory();

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(5);
        when(userService.findByPK(5)).thenReturn(normalUser);
        when(productCategoryRestHelper.getEntity(any(ProductCategoryListModel.class))).thenReturn(productCategory);

        mockMvc.perform(post("/rest/productcategory/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk());

        ArgumentCaptor<ProductCategory> captor = ArgumentCaptor.forClass(ProductCategory.class);
        verify(productCategoryService).persist(captor.capture());

        ProductCategory savedCategory = captor.getValue();
        assert savedCategory.getCreatedBy() != null;
        assert savedCategory.getCreatedDate() != null;
    }

    @Test
    void saveShouldReturnErrorOnException() throws Exception {
        ProductCategoryListModel requestModel = new ProductCategoryListModel();
        requestModel.setProductCategoryCode("CAT-001");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(productCategoryRestHelper.getEntity(any())).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(post("/rest/productcategory/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value(true));

        verify(productCategoryService, never()).persist(any());
    }

    @Test
    void updateShouldUpdateExistingProductCategory() throws Exception {
        ProductCategoryListModel requestModel = new ProductCategoryListModel();
        requestModel.setId(1);
        requestModel.setProductCategoryCode("CAT-002");
        requestModel.setProductCategoryName("Updated Electronics");

        ProductCategory existingCategory = new ProductCategory();
        existingCategory.setId(1);
        existingCategory.setProductCategoryCode("CAT-001");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(productCategoryService.findByPK(1)).thenReturn(existingCategory);

        mockMvc.perform(post("/rest/productcategory/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0040"))
                .andExpect(jsonPath("$.error").value(false));

        verify(productCategoryService).update(any(ProductCategory.class));
        assert existingCategory.getProductCategoryCode().equals("CAT-002");
        assert existingCategory.getProductCategoryName().equals("Updated Electronics");
    }

    @Test
    void updateShouldSetLastUpdateByAndDate() throws Exception {
        ProductCategoryListModel requestModel = new ProductCategoryListModel();
        requestModel.setId(1);
        requestModel.setProductCategoryCode("CAT-002");
        requestModel.setProductCategoryName("Updated");

        ProductCategory existingCategory = new ProductCategory();
        existingCategory.setId(1);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(3);
        when(userService.findByPK(3)).thenReturn(normalUser);
        when(productCategoryService.findByPK(1)).thenReturn(existingCategory);

        mockMvc.perform(post("/rest/productcategory/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk());

        verify(productCategoryService).update(any(ProductCategory.class));
        // Model should have lastUpdateBy and lastUpdateDate set
        assert requestModel.getLastUpdateBy() != null;
        assert requestModel.getLastUpdateDate() != null;
    }

    @Test
    void updateShouldReturnErrorOnException() throws Exception {
        ProductCategoryListModel requestModel = new ProductCategoryListModel();
        requestModel.setId(1);
        requestModel.setProductCategoryCode("CAT-002");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(productCategoryService.findByPK(1)).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(post("/rest/productcategory/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value(true));

        verify(productCategoryService, never()).update(any(ProductCategory.class));
    }

    @Test
    void updateShouldOnlyUpdateSpecifiedFields() throws Exception {
        ProductCategoryListModel requestModel = new ProductCategoryListModel();
        requestModel.setId(1);
        requestModel.setProductCategoryCode("NEW-CODE");
        requestModel.setProductCategoryName("NEW-NAME");

        ProductCategory existingCategory = new ProductCategory();
        existingCategory.setId(1);
        existingCategory.setProductCategoryCode("OLD-CODE");
        existingCategory.setProductCategoryName("OLD-NAME");
        existingCategory.setDeleteFlag(false);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(productCategoryService.findByPK(1)).thenReturn(existingCategory);

        mockMvc.perform(post("/rest/productcategory/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk());

        verify(productCategoryService).update(existingCategory);
        assert existingCategory.getProductCategoryCode().equals("NEW-CODE");
        assert existingCategory.getProductCategoryName().equals("NEW-NAME");
        // DeleteFlag should remain unchanged
        assert existingCategory.getDeleteFlag() == false;
    }

    @Test
    void getListShouldHandleEmptyFilters() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        PaginationResponseModel pagination = new PaginationResponseModel(100, new ArrayList<>());
        when(productCategoryService.getProductCategoryList(any(Map.class), any())).thenReturn(pagination);
        when(productCategoryRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/productcategory/getList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(100));

        verify(productCategoryService).getProductCategoryList(any(Map.class), any());
    }

    @Test
    void saveShouldExtractUserIdFromJwtToken() throws Exception {
        ProductCategoryListModel requestModel = new ProductCategoryListModel();
        requestModel.setProductCategoryCode("CAT-001");
        requestModel.setProductCategoryName("Test");

        ProductCategory productCategory = new ProductCategory();

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(42);
        when(userService.findByPK(42)).thenReturn(normalUser);
        when(productCategoryRestHelper.getEntity(any())).thenReturn(productCategory);

        mockMvc.perform(post("/rest/productcategory/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk());

        verify(jwtTokenUtil).getUserIdFromHttpRequest(any(HttpServletRequest.class));
        verify(userService).findByPK(42);
    }

    @Test
    void updateShouldExtractUserIdFromJwtToken() throws Exception {
        ProductCategoryListModel requestModel = new ProductCategoryListModel();
        requestModel.setId(1);
        requestModel.setProductCategoryCode("CAT-001");

        ProductCategory productCategory = new ProductCategory();
        productCategory.setId(1);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(99);
        when(userService.findByPK(99)).thenReturn(adminUser);
        when(productCategoryService.findByPK(1)).thenReturn(productCategory);

        mockMvc.perform(post("/rest/productcategory/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk());

        verify(jwtTokenUtil).getUserIdFromHttpRequest(any(HttpServletRequest.class));
        verify(userService).findByPK(99);
    }
}
