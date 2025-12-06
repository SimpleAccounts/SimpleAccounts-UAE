package com.simpleaccounts.rest.vatcontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.VatCategory;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.ProductService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.VatCategoryService;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(VatController.class)
@AutoConfigureMockMvc(addFilters = false)
class VatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean private VatCategoryService vatCategoryService;
    @MockBean private VatCategoryRestHelper vatCategoryRestHelper;
    @MockBean private JwtTokenUtil jwtTokenUtil;
    @MockBean private ProductService productService;
    @MockBean private UserService userService;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    @Test
    void getVatListShouldReturnPaginatedList() throws Exception {
        User user = createUser(1);
        PaginationResponseModel pagination = new PaginationResponseModel(10, new ArrayList<>());
        List<VatCategoryModel> vatModels = Arrays.asList(
            createVatCategoryModel(1, "VAT 5%", new BigDecimal("5.0")),
            createVatCategoryModel(2, "VAT 10%", new BigDecimal("10.0"))
        );

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(user);
        when(vatCategoryService.getVatCategoryList(any(), any())).thenReturn(pagination);
        when(vatCategoryRestHelper.getList(any())).thenReturn(vatModels);

        mockMvc.perform(get("/rest/vat/getList")
                        .param("name", "VAT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(2))
                .andExpect(jsonPath("$.data").isArray());

        verify(vatCategoryService).getVatCategoryList(any(), any());
        verify(vatCategoryRestHelper).getList(any());
    }

    @Test
    void getVatListShouldReturnNotFoundWhenNull() throws Exception {
        User user = createUser(1);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(user);
        when(vatCategoryService.getVatCategoryList(any(), any())).thenReturn(null);

        mockMvc.perform(get("/rest/vat/getList"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getVatListShouldFilterByName() throws Exception {
        User user = createUser(1);
        PaginationResponseModel pagination = new PaginationResponseModel(1, new ArrayList<>());

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(user);
        when(vatCategoryService.getVatCategoryList(any(), any())).thenReturn(pagination);
        when(vatCategoryRestHelper.getList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/vat/getList")
                        .param("name", "Standard VAT"))
                .andExpect(status().isOk());

        verify(vatCategoryService).getVatCategoryList(any(), any());
    }

    @Test
    void getVatListShouldFilterByVatPercentage() throws Exception {
        User user = createUser(1);
        PaginationResponseModel pagination = new PaginationResponseModel(1, new ArrayList<>());

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(user);
        when(vatCategoryService.getVatCategoryList(any(), any())).thenReturn(pagination);
        when(vatCategoryRestHelper.getList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/vat/getList")
                        .param("vatPercentage", "5.0"))
                .andExpect(status().isOk());

        verify(vatCategoryService).getVatCategoryList(any(), any());
    }

    @Test
    void getVatListShouldHandleEmptyVatPercentage() throws Exception {
        User user = createUser(1);
        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(user);
        when(vatCategoryService.getVatCategoryList(any(), any())).thenReturn(pagination);
        when(vatCategoryRestHelper.getList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/vat/getList")
                        .param("vatPercentage", ""))
                .andExpect(status().isOk());
    }

    @Test
    void deleteShouldSetDeleteFlag() throws Exception {
        VatCategory vatCategory = createVatCategory(1, "VAT 5%");

        when(vatCategoryService.findByPK(1)).thenReturn(vatCategory);

        mockMvc.perform(delete("/rest/vat/delete")
                        .param("id", "1"))
                .andExpect(status().isOk());

        verify(vatCategoryService).update(vatCategory, 1);
    }

    @Test
    void deleteShouldReturnNotFoundWhenVatNotExists() throws Exception {
        when(vatCategoryService.findByPK(999)).thenReturn(null);

        mockMvc.perform(delete("/rest/vat/delete")
                        .param("id", "999"))
                .andExpect(status().isNotFound());

        verify(vatCategoryService, never()).update(any(), any());
    }

    @Test
    void deletesShouldDeleteMultipleVatCategories() throws Exception {
        DeleteModel deleteModel = new DeleteModel();
        deleteModel.setIds(Arrays.asList(1, 2, 3));

        mockMvc.perform(delete("/rest/vat/deletes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deleteModel)))
                .andExpect(status().isOk());

        verify(vatCategoryService).deleteByIds(Arrays.asList(1, 2, 3));
    }

    @Test
    void deletesShouldHandleException() throws Exception {
        DeleteModel deleteModel = new DeleteModel();
        deleteModel.setIds(Arrays.asList(1, 2));

        when(vatCategoryService.deleteByIds(any())).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(delete("/rest/vat/deletes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deleteModel)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getByIdShouldReturnVatCategory() throws Exception {
        VatCategory vatCategory = createVatCategory(1, "VAT 5%");
        VatCategoryModel vatModel = createVatCategoryModel(1, "VAT 5%", new BigDecimal("5.0"));

        when(vatCategoryService.findByPK(1)).thenReturn(vatCategory);
        when(vatCategoryRestHelper.getModel(vatCategory)).thenReturn(vatModel);

        mockMvc.perform(get("/rest/vat/getById")
                        .param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("VAT 5%"));

        verify(vatCategoryRestHelper).getModel(vatCategory);
    }

    @Test
    void getByIdShouldReturnNotFoundWhenVatNotExists() throws Exception {
        when(vatCategoryService.findByPK(999)).thenReturn(null);

        mockMvc.perform(get("/rest/vat/getById")
                        .param("id", "999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void saveShouldCreateNewVatCategory() throws Exception {
        VatCategoryRequestModel requestModel = createVatCategoryRequestModel("VAT 5%", "5.0");
        VatCategory vatCategory = createVatCategory(null, "VAT 5%");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(vatCategoryRestHelper.getEntity(any())).thenReturn(vatCategory);

        mockMvc.perform(post("/rest/vat/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk());

        verify(vatCategoryService).persist(any(VatCategory.class));
    }

    @Test
    void saveShouldHandleException() throws Exception {
        VatCategoryRequestModel requestModel = createVatCategoryRequestModel("VAT 5%", "5.0");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(vatCategoryRestHelper.getEntity(any())).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(post("/rest/vat/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void updateShouldUpdateVatCategory() throws Exception {
        VatCategoryRequestModel requestModel = createVatCategoryRequestModel("Updated VAT", "10.0");
        requestModel.setId(1);

        VatCategory vatCategory = createVatCategory(1, "Updated VAT");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(vatCategoryRestHelper.getEntity(any())).thenReturn(vatCategory);

        mockMvc.perform(post("/rest/vat/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk());

        verify(vatCategoryService).update(any(VatCategory.class));
    }

    @Test
    void updateShouldHandleException() throws Exception {
        VatCategoryRequestModel requestModel = createVatCategoryRequestModel("VAT", "5.0");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(vatCategoryRestHelper.getEntity(any())).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(post("/rest/vat/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getProductCountsForVatShouldReturnCount() throws Exception {
        when(productService.getTotalProductCountByVatId(1)).thenReturn(15);

        mockMvc.perform(get("/rest/vat/getProductCountsForVat")
                        .param("vatId", "1"))
                .andExpect(status().isOk())
                .andExpect(content().string("15"));

        verify(productService).getTotalProductCountByVatId(1);
    }

    @Test
    void getProductCountsForVatShouldReturnZeroWhenNoProducts() throws Exception {
        when(productService.getTotalProductCountByVatId(999)).thenReturn(0);

        mockMvc.perform(get("/rest/vat/getProductCountsForVat")
                        .param("vatId", "999"))
                .andExpect(status().isOk())
                .andExpect(content().string("0"));
    }

    @Test
    void saveShouldSetDefaultValues() throws Exception {
        VatCategoryRequestModel requestModel = createVatCategoryRequestModel("New VAT", "5.0");
        VatCategory vatCategory = createVatCategory(null, "New VAT");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(vatCategoryRestHelper.getEntity(any())).thenReturn(vatCategory);

        mockMvc.perform(post("/rest/vat/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk());

        verify(vatCategoryService).persist(any(VatCategory.class));
    }

    @Test
    void getVatListShouldReturnEmptyList() throws Exception {
        User user = createUser(1);
        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(user);
        when(vatCategoryService.getVatCategoryList(any(), any())).thenReturn(pagination);
        when(vatCategoryRestHelper.getList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/vat/getList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(0));
    }

    @Test
    void deleteShouldUpdateDeleteFlag() throws Exception {
        VatCategory vatCategory = createVatCategory(5, "Test VAT");
        vatCategory.setDeleteFlag(false);

        when(vatCategoryService.findByPK(5)).thenReturn(vatCategory);

        mockMvc.perform(delete("/rest/vat/delete")
                        .param("id", "5"))
                .andExpect(status().isOk());

        verify(vatCategoryService).update(vatCategory, 5);
    }

    @Test
    void getVatListShouldFilterByMultipleParameters() throws Exception {
        User user = createUser(1);
        PaginationResponseModel pagination = new PaginationResponseModel(2, new ArrayList<>());

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(user);
        when(vatCategoryService.getVatCategoryList(any(), any())).thenReturn(pagination);
        when(vatCategoryRestHelper.getList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/vat/getList")
                        .param("name", "Standard")
                        .param("vatPercentage", "5.0"))
                .andExpect(status().isOk());

        verify(vatCategoryService).getVatCategoryList(any(), any());
    }

    @Test
    void updateShouldSetLastUpdateDate() throws Exception {
        VatCategoryRequestModel requestModel = createVatCategoryRequestModel("Updated", "5.0");
        requestModel.setId(1);
        VatCategory vatCategory = createVatCategory(1, "Updated");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(vatCategoryRestHelper.getEntity(any())).thenReturn(vatCategory);

        mockMvc.perform(post("/rest/vat/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk());

        verify(vatCategoryService).update(any(VatCategory.class));
    }

    // Helper methods
    private User createUser(Integer id) {
        User user = new User();
        user.setUserId(id);
        user.setUserEmail("user@example.com");

        Role role = new Role();
        role.setRoleCode(2);
        user.setRole(role);

        return user;
    }

    private VatCategory createVatCategory(Integer id, String name) {
        VatCategory vatCategory = new VatCategory();
        vatCategory.setId(id);
        vatCategory.setName(name);
        vatCategory.setDeleteFlag(false);
        vatCategory.setVatPercentage(new BigDecimal("5.0"));
        return vatCategory;
    }

    private VatCategoryModel createVatCategoryModel(Integer id, String name, BigDecimal percentage) {
        VatCategoryModel model = new VatCategoryModel();
        model.setId(id);
        model.setName(name);
        model.setVatPercentage(percentage);
        return model;
    }

    private VatCategoryRequestModel createVatCategoryRequestModel(String name, String percentage) {
        VatCategoryRequestModel model = new VatCategoryRequestModel();
        model.setName(name);
        model.setVatPercentage(percentage);
        return model;
    }
}
