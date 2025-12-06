package com.simpleaccounts.rest.employeecontroller;

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

import com.simpleaccounts.entity.*;
import com.simpleaccounts.repository.EmployeeBankDetailsRepository;
import com.simpleaccounts.repository.EmployeeRepository;
import com.simpleaccounts.repository.EmployeeSalaryComponentRelationRepository;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.PayrollRestHepler;
import com.simpleaccounts.rest.payroll.dto.PayrollEmployeeDto;
import com.simpleaccounts.rest.payroll.service.EmployeeSalaryComponentRelationService;
import com.simpleaccounts.rfq_po.PoQuatationService;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.EmployeeBankDetailsService;
import com.simpleaccounts.service.EmployeeParentRelationService;
import com.simpleaccounts.service.EmployeeService;
import com.simpleaccounts.service.EmploymentService;
import com.simpleaccounts.utils.TransactionCategoryCreationHelper;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

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
@WebMvcTest(EmployeeController.class)
@AutoConfigureMockMvc(addFilters = false)
class EmployeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private EmployeeService employeeService;
    @MockBean private EmployeeHelper employeeHelper;
    @MockBean private JwtTokenUtil jwtTokenUtil;
    @MockBean private PayrollRestHepler payrollRestHepler;
    @MockBean private EmployeeParentRelationService employeeParentRelationService;
    @MockBean private EmploymentService employmentService;
    @MockBean private EmployeeBankDetailsService employeeBankDetailsService;
    @MockBean private EmployeeSalaryComponentRelationService employeeSalaryComponentRelationService;
    @MockBean private TransactionCategoryCreationHelper transactionCategoryCreationHelper;
    @MockBean private EmployeeRepository employeeRepository;
    @MockBean private EmploymentRepository employmentRepository;
    @MockBean private EmployeeSalaryComponentRelationRepository employeeSalaryComponentRelationRepository;
    @MockBean private EmployeeBankDetailsRepository employeeBankDetailsRepository;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    @Test
    void getEmployeeListShouldReturnPaginatedEmployees() throws Exception {
        PaginationResponseModel pagination = new PaginationResponseModel(10, new ArrayList<>());
        when(employeeService.getEmployeeList(any(), any())).thenReturn(pagination);
        when(employeeHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/employee/getList")
                        .param("name", "John")
                        .param("email", "john@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(10));

        verify(employeeService).getEmployeeList(any(), any());
        verify(employeeHelper).getListModel(any());
    }

    @Test
    void getEmployeeListShouldReturnNotFoundWhenNull() throws Exception {
        when(employeeService.getEmployeeList(any(), any())).thenReturn(null);

        mockMvc.perform(get("/rest/employee/getList"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getEmployeeListShouldHandleException() throws Exception {
        when(employeeService.getEmployeeList(any(), any())).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/rest/employee/getList"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getListForActiveEmployeesShouldReturnActiveOnly() throws Exception {
        PaginationResponseModel pagination = new PaginationResponseModel(5, new ArrayList<>());
        when(employeeService.getEmployeeList(any(), any())).thenReturn(pagination);
        when(employeeHelper.getListModelForProfileCompleted(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/employee/getListForActiveEmployees")
                        .param("name", "Jane"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(5));

        verify(employeeHelper).getListModelForProfileCompleted(any());
    }

    @Test
    void deleteEmployeeShouldSoftDeleteEmployee() throws Exception {
        Employee employee = new Employee();
        employee.setId(1);
        employee.setDeleteFlag(false);

        Employment employment = new Employment();
        employment.setId(1);

        EmployeeBankDetails bankDetails = new EmployeeBankDetails();
        bankDetails.setId(1);

        when(employeeRepository.findById(1)).thenReturn(Optional.of(employee));
        when(employmentRepository.findByemployeeId(1)).thenReturn(employment);
        when(employeeBankDetailsRepository.findByEmployeeId(1)).thenReturn(bankDetails);
        when(employeeSalaryComponentRelationRepository.findByemployeeId(1)).thenReturn(new ArrayList<>());

        mockMvc.perform(delete("/rest/employee/delete").param("id", "1"))
                .andExpect(status().isOk());

        verify(employeeRepository).save(employee);
    }

    @Test
    void deleteEmployeeShouldReturnErrorOnException() throws Exception {
        when(employeeRepository.findById(1)).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(delete("/rest/employee/delete").param("id", "1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void deleteProductsShouldDeleteMultipleEmployees() throws Exception {
        doNothing().when(employeeService).deleteByIds(any());

        mockMvc.perform(delete("/rest/employee/deletes")
                        .contentType("application/json")
                        .content("{\"ids\":[1,2,3]}"))
                .andExpect(status().isOk());

        verify(employeeService).deleteByIds(any());
    }

    @Test
    void deleteProductsShouldReturnErrorOnException() throws Exception {
        when(employeeService.deleteByIds(any())).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(delete("/rest/employee/deletes")
                        .contentType("application/json")
                        .content("{\"ids\":[1,2,3]}"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getEmployeeByIdShouldReturnEmployee() throws Exception {
        Employee employee = new Employee();
        employee.setId(1);
        employee.setFirstName("John");

        EmployeeBankDetails bankDetails = new EmployeeBankDetails();
        Employment employment = new Employment();
        EmployeeParentRelation parentRelation = new EmployeeParentRelation();

        EmployeeListModel listModel = new EmployeeListModel();
        listModel.setId(1);

        when(employeeService.findByPK(1)).thenReturn(employee);
        when(employeeBankDetailsService.findByAttributes(any())).thenReturn(Arrays.asList(bankDetails));
        when(employmentService.findByAttributes(any())).thenReturn(Arrays.asList(employment));
        when(employeeParentRelationService.findByAttributes(any())).thenReturn(Arrays.asList(parentRelation));
        when(employeeHelper.getModel(employee, employment, bankDetails, parentRelation)).thenReturn(listModel);

        mockMvc.perform(get("/rest/employee/getById").param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void getEmployeeByIdShouldReturnNotFoundWhenNull() throws Exception {
        when(employeeService.findByPK(1)).thenReturn(null);

        mockMvc.perform(get("/rest/employee/getById").param("id", "1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getEmployeeByIdShouldHandleException() throws Exception {
        when(employeeService.findByPK(1)).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/rest/employee/getById").param("id", "1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void saveShouldCreateNewEmployee() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(employeeService.findByAttributes(any())).thenReturn(new ArrayList<>());

        Employee employee = new Employee();
        employee.setId(1);
        when(employeeHelper.getEntity(any(), eq(1))).thenReturn(employee);
        doNothing().when(employeeService).persist(any());
        doNothing().when(employeeService).sendInvitationMail(any(), any());
        doNothing().when(transactionCategoryCreationHelper).createTransactionCategoryForEmployee(any());
        doNothing().when(employeeHelper).createDefaultSalaryComponentListForThisEmployee(any());

        mockMvc.perform(post("/rest/employee/save")
                        .param("firstName", "John")
                        .param("lastName", "Doe")
                        .param("email", "john.doe@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().string("1"));

        verify(employeeService).persist(any(Employee.class));
    }

    @Test
    void saveShouldReturnBadRequestWhenEmailExists() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

        Employee existingEmployee = new Employee();
        existingEmployee.setEmail("john.doe@example.com");

        when(employeeService.findByAttributes(any())).thenReturn(Arrays.asList(existingEmployee));

        mockMvc.perform(post("/rest/employee/save")
                        .param("firstName", "John")
                        .param("lastName", "Doe")
                        .param("email", "john.doe@example.com"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void saveShouldHandleException() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(post("/rest/employee/save")
                        .param("firstName", "John")
                        .param("lastName", "Doe")
                        .param("email", "john.doe@example.com"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void updateShouldUpdateExistingEmployee() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

        Employee employee = new Employee();
        employee.setId(1);
        when(employeeHelper.getEntity(any(), eq(1))).thenReturn(employee);
        doNothing().when(employeeService).update(any());
        doNothing().when(transactionCategoryCreationHelper).updateEmployeeTransactionCategory(any());

        mockMvc.perform(post("/rest/employee/update")
                        .param("id", "1")
                        .param("firstName", "John")
                        .param("lastName", "Doe"))
                .andExpect(status().isOk());

        verify(employeeService).update(any(Employee.class));
    }

    @Test
    void updateShouldHandleException() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(post("/rest/employee/update")
                        .param("id", "1")
                        .param("firstName", "John"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getEmployeesForDropdownShouldReturnList() throws Exception {
        List<DropdownModel> dropdownList = Arrays.asList(
            new DropdownModel(1, "Employee 1"),
            new DropdownModel(2, "Employee 2")
        );

        when(employeeService.getEmployeesForDropdown()).thenReturn(dropdownList);

        mockMvc.perform(get("/rest/employee/getEmployeesForDropdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getEmployeesNotInUserForDropdownShouldReturnList() throws Exception {
        List<DropdownObjectModel> dropdownList = Arrays.asList(
            new DropdownObjectModel(1, "Employee 1"),
            new DropdownObjectModel(2, "Employee 2")
        );

        when(employeeService.getEmployeesNotInUserForDropdown()).thenReturn(dropdownList);

        mockMvc.perform(get("/rest/employee/getEmployeesNotInUserForDropdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getAllActiveCompleteEmployeeShouldReturnEmployeeList() throws Exception {
        List<PayrollEmployeeDto> employeeList = new ArrayList<>();
        PayrollEmployeeDto dto1 = new PayrollEmployeeDto();
        dto1.setEmployeeId(1);
        employeeList.add(dto1);

        when(employeeService.getAllActiveCompleteEmployee(any())).thenReturn(employeeList);

        mockMvc.perform(get("/rest/employee/getAllActiveCompleteEmployee")
                        .param("payrollDate", "01/01/2024"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void getAllActiveCompleteEmployeeShouldReturnNotFoundWhenNull() throws Exception {
        when(employeeService.getAllActiveCompleteEmployee(any())).thenReturn(null);

        mockMvc.perform(get("/rest/employee/getAllActiveCompleteEmployee")
                        .param("payrollDate", "01/01/2024"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAllActiveCompleteEmployeeShouldHandleException() throws Exception {
        when(employeeService.getAllActiveCompleteEmployee(any())).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(get("/rest/employee/getAllActiveCompleteEmployee")
                        .param("payrollDate", "01/01/2024"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getEmployeeInviteEmailShouldSendInvitation() throws Exception {
        Employee employee = new Employee();
        employee.setId(1);
        employee.setEmail("john@example.com");

        when(employeeService.findByPK(1)).thenReturn(employee);
        doNothing().when(employeeService).sendInvitationMail(any(), any());

        mockMvc.perform(get("/rest/employee/getEmployeeInviteEmail")
                        .param("id", "1"))
                .andExpect(status().isOk());

        verify(employeeService).sendInvitationMail(employee, any());
    }

    @Test
    void getEmployeeInviteEmailShouldHandleException() throws Exception {
        when(employeeService.findByPK(1)).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(get("/rest/employee/getEmployeeInviteEmail")
                        .param("id", "1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void saveShouldHandleEmployeeWithParent() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(employeeService.findByAttributes(any())).thenReturn(new ArrayList<>());

        Employee employee = new Employee();
        employee.setId(1);
        employee.setParentId(5);

        Employee parentEmployee = new Employee();
        parentEmployee.setId(5);

        when(employeeHelper.getEntity(any(), eq(1))).thenReturn(employee);
        when(employeeService.findByPK(5)).thenReturn(parentEmployee);
        doNothing().when(employeeService).persist(any());
        doNothing().when(employeeService).sendInvitationMail(any(), any());
        doNothing().when(employeeParentRelationService).addEmployeeParentRelation(any(), any(), any());
        doNothing().when(transactionCategoryCreationHelper).createTransactionCategoryForEmployee(any());
        doNothing().when(employeeHelper).createDefaultSalaryComponentListForThisEmployee(any());

        mockMvc.perform(post("/rest/employee/save")
                        .param("firstName", "John")
                        .param("lastName", "Doe")
                        .param("email", "john.doe@example.com")
                        .param("parentId", "5"))
                .andExpect(status().isOk());

        verify(employeeParentRelationService).addEmployeeParentRelation(parentEmployee, employee, 1);
    }

    @Test
    void updateShouldHandleEmployeeWithParent() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

        Employee employee = new Employee();
        employee.setId(1);
        employee.setParentId(5);

        EmployeeParentRelation parentRelation = new EmployeeParentRelation();

        when(employeeHelper.getEntity(any(), eq(1))).thenReturn(employee);
        when(payrollRestHepler.getEmployeeParentRelationEntity(any(), any(), any())).thenReturn(parentRelation);
        doNothing().when(employeeService).update(any());
        doNothing().when(transactionCategoryCreationHelper).updateEmployeeTransactionCategory(any());
        doNothing().when(employeeParentRelationService).update(any());

        mockMvc.perform(post("/rest/employee/update")
                        .param("id", "1")
                        .param("parentId", "5")
                        .param("firstName", "John"))
                .andExpect(status().isOk());

        verify(employeeParentRelationService).update(parentRelation);
    }

    @Test
    void deleteEmployeeShouldDeleteRelatedSalaryComponents() throws Exception {
        Employee employee = new Employee();
        employee.setId(1);

        EmployeeSalaryComponentRelation relation1 = new EmployeeSalaryComponentRelation();
        relation1.setId(1);

        EmployeeSalaryComponentRelation relation2 = new EmployeeSalaryComponentRelation();
        relation2.setId(2);

        when(employeeRepository.findById(1)).thenReturn(Optional.of(employee));
        when(employmentRepository.findByemployeeId(1)).thenReturn(null);
        when(employeeSalaryComponentRelationRepository.findByemployeeId(1))
            .thenReturn(Arrays.asList(relation1, relation2));
        when(employeeBankDetailsRepository.findByEmployeeId(1)).thenReturn(null);

        mockMvc.perform(delete("/rest/employee/delete").param("id", "1"))
                .andExpect(status().isOk());

        verify(employeeSalaryComponentRelationRepository).save(relation1);
        verify(employeeSalaryComponentRelationRepository).save(relation2);
    }
}
