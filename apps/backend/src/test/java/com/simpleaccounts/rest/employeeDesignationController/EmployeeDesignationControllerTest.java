package com.simpleaccounts.rest.employeeDesignationController;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeDesignation;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.model.EmployeeDesignationPersistModel;
import com.simpleaccounts.repository.EmployeeRepository;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.EmployeeDesignationService;
import com.simpleaccounts.service.EmployeeService;
import com.simpleaccounts.service.UserService;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(EmployeeDesignationController.class)
@AutoConfigureMockMvc(addFilters = false)
class EmployeeDesignationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private JwtTokenUtil jwtTokenUtil;
    @MockBean private UserService userService;
    @MockBean private EmployeeDesignationRestHelper employeeDesignationRestHelper;
    @MockBean private EmployeeDesignationService employeeDesignationService;
    @MockBean private EmployeeService employeeService;
    @MockBean private EmployeeRepository employeeRepository;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    @Test
    void saveEmployeeDesignationShouldCreateNewDesignation() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

        User user = new User();
        user.setUserId(1);
        when(userService.findByPK(1)).thenReturn(user);

        EmployeeDesignation designation = new EmployeeDesignation();
        designation.setId(1);
        designation.setDesignationName("Manager");

        when(employeeDesignationRestHelper.getEmployeeDesignationEntity(any())).thenReturn(designation);
        doNothing().when(employeeDesignationService).persist(any());

        mockMvc.perform(post("/rest/employeeDesignation/saveEmployeeDesignation")
                        .param("designationName", "Manager"))
                .andExpect(status().isOk());

        verify(employeeDesignationService).persist(any(EmployeeDesignation.class));
    }

    @Test
    void saveEmployeeDesignationShouldReturnErrorOnException() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(post("/rest/employeeDesignation/saveEmployeeDesignation")
                        .param("designationName", "Manager"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void updateEmployeeDesignationShouldUpdateExisting() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

        User user = new User();
        user.setUserId(1);
        when(userService.findByPK(1)).thenReturn(user);

        EmployeeDesignation designation = new EmployeeDesignation();
        designation.setId(1);
        designation.setDesignationName("Senior Manager");

        when(employeeDesignationRestHelper.getEmployeeDesignationEntity(any())).thenReturn(designation);
        doNothing().when(employeeDesignationService).update(any());

        mockMvc.perform(post("/rest/employeeDesignation/updateEmployeeDesignation")
                        .param("id", "1")
                        .param("designationName", "Senior Manager"))
                .andExpect(status().isOk());

        verify(employeeDesignationService).update(any(EmployeeDesignation.class));
    }

    @Test
    void updateEmployeeDesignationShouldReturnErrorOnException() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(post("/rest/employeeDesignation/updateEmployeeDesignation")
                        .param("id", "1")
                        .param("designationName", "Manager"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void deleteEmployeeDesignationShouldSoftDelete() throws Exception {
        EmployeeDesignation designation = new EmployeeDesignation();
        designation.setId(1);
        designation.setDesignationName("Manager");
        designation.setDeleteFlag(false);

        when(employeeDesignationService.findByPK(1)).thenReturn(designation);
        when(employeeService.findByAttributes(any())).thenReturn(new ArrayList<>());
        doNothing().when(employeeDesignationService).update(any(), eq(1));

        mockMvc.perform(delete("/rest/employeeDesignation/deleteEmployeeDesignation")
                        .param("id", "1"))
                .andExpect(status().isOk());

        verify(employeeDesignationService).update(designation, 1);
    }

    @Test
    void deleteEmployeeDesignationShouldReturnConflictWhenEmployeesExist() throws Exception {
        EmployeeDesignation designation = new EmployeeDesignation();
        designation.setId(1);
        designation.setDesignationName("Manager");

        Employee employee = new Employee();
        employee.setId(1);
        employee.setDeleteFlag(false);

        when(employeeDesignationService.findByPK(1)).thenReturn(designation);
        when(employeeService.findByAttributes(any())).thenReturn(Arrays.asList(employee));

        mockMvc.perform(delete("/rest/employeeDesignation/deleteEmployeeDesignation")
                        .param("id", "1"))
                .andExpect(status().isConflict());
    }

    @Test
    void deleteEmployeeDesignationShouldIgnoreDeletedEmployees() throws Exception {
        EmployeeDesignation designation = new EmployeeDesignation();
        designation.setId(1);
        designation.setDesignationName("Manager");

        Employee deletedEmployee = new Employee();
        deletedEmployee.setId(1);
        deletedEmployee.setDeleteFlag(true);

        when(employeeDesignationService.findByPK(1)).thenReturn(designation);
        when(employeeService.findByAttributes(any())).thenReturn(Arrays.asList(deletedEmployee));
        doNothing().when(employeeDesignationService).update(any(), eq(1));

        mockMvc.perform(delete("/rest/employeeDesignation/deleteEmployeeDesignation")
                        .param("id", "1"))
                .andExpect(status().isOk());

        verify(employeeDesignationService).update(designation, 1);
    }

    @Test
    void deleteEmployeeDesignationShouldReturnErrorOnException() throws Exception {
        when(employeeDesignationService.findByPK(1)).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(delete("/rest/employeeDesignation/deleteEmployeeDesignation")
                        .param("id", "1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getEmployeeDesignationByIdShouldReturnDesignation() throws Exception {
        EmployeeDesignation designation = new EmployeeDesignation();
        designation.setId(1);
        designation.setDesignationName("Manager");

        EmployeeDesignationPersistModel model = new EmployeeDesignationPersistModel();
        model.setId(1);
        model.setDesignationName("Manager");

        when(employeeDesignationService.findByPK(1)).thenReturn(designation);
        when(employeeDesignationRestHelper.getEmployeeDesignationModel(designation)).thenReturn(model);

        mockMvc.perform(get("/rest/employeeDesignation/getEmployeeDesignationById")
                        .param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.designationName").value("Manager"));
    }

    @Test
    void getEmployeeDesignationByIdShouldReturnNotFoundWhenNull() throws Exception {
        when(employeeDesignationService.findByPK(1)).thenReturn(null);

        mockMvc.perform(get("/rest/employeeDesignation/getEmployeeDesignationById")
                        .param("id", "1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getEmployeeDesignationByIdShouldHandleException() throws Exception {
        when(employeeDesignationService.findByPK(1)).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(get("/rest/employeeDesignation/getEmployeeDesignationById")
                        .param("id", "1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getEmployeeDesignationForDropdownShouldReturnList() throws Exception {
        List<DropdownObjectModel> dropdownList = Arrays.asList(
            new DropdownObjectModel(1, "Manager"),
            new DropdownObjectModel(2, "Developer")
        );

        when(employeeDesignationService.getEmployeeDesignationDropdown()).thenReturn(dropdownList);

        mockMvc.perform(get("/rest/employeeDesignation/getEmployeeDesignationForDropdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getParentEmployeeDesignationForDropdownShouldReturnList() throws Exception {
        List<DropdownObjectModel> dropdownList = Arrays.asList(
            new DropdownObjectModel(1, "Senior Manager"),
            new DropdownObjectModel(2, "Director")
        );

        when(employeeDesignationService.getParentEmployeeDesignationForDropdown()).thenReturn(dropdownList);

        mockMvc.perform(get("/rest/employeeDesignation/getParentEmployeeDesignationForDropdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getEmployeeDesignationListShouldReturnPaginatedList() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

        User user = new User();
        user.setUserId(1);
        when(userService.findByPK(1)).thenReturn(user);

        PaginationResponseModel serviceResponse = new PaginationResponseModel(10, new ArrayList<>());
        PaginationResponseModel helperResponse = new PaginationResponseModel(10, new ArrayList<>());

        when(employeeDesignationService.getEmployeeDesignationList(any(), any())).thenReturn(serviceResponse);
        when(employeeDesignationRestHelper.getEmployeeDesignationListModel(serviceResponse)).thenReturn(helperResponse);

        mockMvc.perform(get("/rest/employeeDesignation/EmployeeDesignationList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(10));
    }

    @Test
    void getEmployeeDesignationListShouldReturnErrorWhenNull() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

        User user = new User();
        user.setUserId(1);
        when(userService.findByPK(1)).thenReturn(user);

        when(employeeDesignationService.getEmployeeDesignationList(any(), any())).thenReturn(null);

        mockMvc.perform(get("/rest/employeeDesignation/EmployeeDesignationList"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getEmployeeDesignationCountShouldReturnCount() throws Exception {
        EmployeeDesignation designation = new EmployeeDesignation();
        designation.setId(1);

        when(employeeDesignationService.findByPK(1)).thenReturn(designation);
        when(employeeRepository.countEmployeesByEmployeeDesignationIdAndDeleteFlag(designation, Boolean.FALSE))
            .thenReturn(5);

        mockMvc.perform(get("/rest/employeeDesignation/getEmployeeDesignationCount")
                        .param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(content().string("5"));
    }

    @Test
    void getEmployeeDesignationCountShouldReturnZeroWhenNoEmployees() throws Exception {
        EmployeeDesignation designation = new EmployeeDesignation();
        designation.setId(1);

        when(employeeDesignationService.findByPK(1)).thenReturn(designation);
        when(employeeRepository.countEmployeesByEmployeeDesignationIdAndDeleteFlag(designation, Boolean.FALSE))
            .thenReturn(0);

        mockMvc.perform(get("/rest/employeeDesignation/getEmployeeDesignationCount")
                        .param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(content().string("0"));
    }

    @Test
    void saveEmployeeDesignationShouldAcceptValidData() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

        User user = new User();
        user.setUserId(1);
        when(userService.findByPK(1)).thenReturn(user);

        EmployeeDesignation designation = new EmployeeDesignation();
        designation.setDesignationName("Project Manager");

        when(employeeDesignationRestHelper.getEmployeeDesignationEntity(any())).thenReturn(designation);
        doNothing().when(employeeDesignationService).persist(designation);

        mockMvc.perform(post("/rest/employeeDesignation/saveEmployeeDesignation")
                        .param("designationName", "Project Manager")
                        .param("description", "Manages projects"))
                .andExpect(status().isOk());

        verify(employeeDesignationService).persist(designation);
    }

    @Test
    void updateEmployeeDesignationShouldAcceptValidData() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

        User user = new User();
        user.setUserId(1);
        when(userService.findByPK(1)).thenReturn(user);

        EmployeeDesignation designation = new EmployeeDesignation();
        designation.setId(1);
        designation.setDesignationName("Updated Manager");

        when(employeeDesignationRestHelper.getEmployeeDesignationEntity(any())).thenReturn(designation);
        doNothing().when(employeeDesignationService).update(designation);

        mockMvc.perform(post("/rest/employeeDesignation/updateEmployeeDesignation")
                        .param("id", "1")
                        .param("designationName", "Updated Manager")
                        .param("description", "Updated description"))
                .andExpect(status().isOk());

        verify(employeeDesignationService).update(designation);
    }

    @Test
    void deleteEmployeeDesignationShouldHandleNullDesignation() throws Exception {
        when(employeeDesignationService.findByPK(1)).thenReturn(null);

        mockMvc.perform(delete("/rest/employeeDesignation/deleteEmployeeDesignation")
                        .param("id", "1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getEmployeeDesignationListShouldHandleFilters() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

        User user = new User();
        user.setUserId(1);
        when(userService.findByPK(1)).thenReturn(user);

        PaginationResponseModel serviceResponse = new PaginationResponseModel(5, new ArrayList<>());
        PaginationResponseModel helperResponse = new PaginationResponseModel(5, new ArrayList<>());

        when(employeeDesignationService.getEmployeeDesignationList(any(), any())).thenReturn(serviceResponse);
        when(employeeDesignationRestHelper.getEmployeeDesignationListModel(serviceResponse)).thenReturn(helperResponse);

        mockMvc.perform(get("/rest/employeeDesignation/EmployeeDesignationList")
                        .param("page", "1")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(5));

        verify(employeeDesignationService).getEmployeeDesignationList(any(), any());
    }

    @Test
    void deleteEmployeeDesignationShouldHandleMultipleEmployees() throws Exception {
        EmployeeDesignation designation = new EmployeeDesignation();
        designation.setId(1);
        designation.setDesignationName("Manager");

        Employee employee1 = new Employee();
        employee1.setId(1);
        employee1.setDeleteFlag(false);

        Employee employee2 = new Employee();
        employee2.setId(2);
        employee2.setDeleteFlag(false);

        when(employeeDesignationService.findByPK(1)).thenReturn(designation);
        when(employeeService.findByAttributes(any())).thenReturn(Arrays.asList(employee1, employee2));

        mockMvc.perform(delete("/rest/employeeDesignation/deleteEmployeeDesignation")
                        .param("id", "1"))
                .andExpect(status().isConflict());
    }

    @Test
    void getEmployeeDesignationCountShouldHandleNullDesignation() throws Exception {
        when(employeeDesignationService.findByPK(999)).thenReturn(null);

        mockMvc.perform(get("/rest/employeeDesignation/getEmployeeDesignationCount")
                        .param("id", "999"))
                .andExpect(status().isOk())
                .andExpect(content().string("0"));
    }
}
