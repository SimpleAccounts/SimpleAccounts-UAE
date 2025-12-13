package com.simpleaccounts.rest.employeecontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeBankDetails;
import com.simpleaccounts.entity.Employment;
import com.simpleaccounts.entity.EmployeeParentRelation;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.repository.EmployeeBankDetailsRepository;
import com.simpleaccounts.repository.EmployeeRepository;
import com.simpleaccounts.repository.EmployeeSalaryComponentRelationRepository;
import com.simpleaccounts.repository.EmploymentRepository;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.PayrollRestHepler;
import com.simpleaccounts.rest.payroll.dto.PayrollEmployeeDto;
import com.simpleaccounts.rest.payroll.service.EmployeeSalaryComponentRelationService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.EmployeeBankDetailsService;
import com.simpleaccounts.service.EmployeeParentRelationService;
import com.simpleaccounts.service.EmployeeService;
import com.simpleaccounts.service.EmploymentService;
import com.simpleaccounts.utils.TransactionCategoryCreationHelper;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("EmployeeController Unit Tests")
class EmployeeControllerTest {

    private MockMvc mockMvc;

    @Mock
    private EmployeeService employeeService;

    @Mock
    private EmployeeHelper employeeHelper;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private PayrollRestHepler payrollRestHepler;

    @Mock
    private EmployeeParentRelationService employeeParentRelationService;

    @Mock
    private EmploymentService employmentService;

    @Mock
    private EmployeeBankDetailsService employeeBankDetailsService;

    @Mock
    private EmployeeSalaryComponentRelationService employeeSalaryComponentRelationService;

    @Mock
    private TransactionCategoryCreationHelper transactionCategoryCreationHelper;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private EmploymentRepository employmentRepository;

    @Mock
    private EmployeeSalaryComponentRelationRepository employeeSalaryComponentRelationRepository;

    @Mock
    private EmployeeBankDetailsRepository employeeBankDetailsRepository;

    @InjectMocks
    private EmployeeController employeeController;

    private Employee testEmployee;
    private User testUser;
    private Employment testEmployment;
    private EmployeeBankDetails testBankDetails;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(employeeController).build();
        testEmployee = createTestEmployee(1, "John", "Doe", "john@test.com");
        testUser = createTestUser(1, "Admin", "User", "admin@test.com");
        testEmployment = createTestEmployment(1, testEmployee);
        testBankDetails = createTestBankDetails(1, testEmployee);
    }

    @Test
    @DisplayName("Should return employee list with pagination")
    void getEmployeeListReturnsList() throws Exception {
        List<EmployeeListModel> listModels = Arrays.asList(createEmployeeListModel(1, "John", "Doe"));
        PaginationResponseModel response = new PaginationResponseModel(1, Arrays.asList(testEmployee));

        when(employeeService.getEmployeeList(any(), any())).thenReturn(response);
        when(employeeHelper.getListModel(any())).thenReturn(listModels);

        mockMvc.perform(get("/rest/employee/getList")
                .param("pageNo", "0")
                .param("pageSize", "10"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return not found when employee list is null")
    void getEmployeeListReturnsNotFoundWhenNull() throws Exception {
        when(employeeService.getEmployeeList(any(), any())).thenReturn(null);

        mockMvc.perform(get("/rest/employee/getList"))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should return active employees list")
    void getEmployeeListForActiveEmployeesReturnsList() throws Exception {
        List<EmployeeListModel> listModels = Arrays.asList(createEmployeeListModel(1, "John", "Doe"));
        PaginationResponseModel response = new PaginationResponseModel(1, Arrays.asList(testEmployee));

        when(employeeService.getEmployeeList(any(), any())).thenReturn(response);
        when(employeeHelper.getListModelForProfileCompleted(any())).thenReturn(listModels);

        mockMvc.perform(get("/rest/employee/getListForActiveEmployees"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return employee by ID")
    void getEmployeeByIdReturnsEmployee() throws Exception {
        EmployeeListModel listModel = createEmployeeListModel(1, "John", "Doe");

        when(employeeService.findByPK(1)).thenReturn(testEmployee);
        when(employeeBankDetailsService.findByAttributes(any())).thenReturn(Arrays.asList(testBankDetails));
        when(employmentService.findByAttributes(any())).thenReturn(Arrays.asList(testEmployment));
        when(employeeParentRelationService.findByAttributes(any())).thenReturn(Collections.emptyList());
        when(employeeHelper.getModel(any(), any(), any(), any())).thenReturn(listModel);

        mockMvc.perform(get("/rest/employee/getById").param("id", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return not found when employee does not exist")
    void getEmployeeByIdReturnsNotFound() throws Exception {
        when(employeeService.findByPK(999)).thenReturn(null);
        when(employeeBankDetailsService.findByAttributes(any())).thenReturn(Collections.emptyList());
        when(employmentService.findByAttributes(any())).thenReturn(Collections.emptyList());
        when(employeeParentRelationService.findByAttributes(any())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/employee/getById").param("id", "999"))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should delete employee successfully")
    void deleteEmployeeSucceeds() throws Exception {
        when(employeeRepository.findById(1)).thenReturn(Optional.of(testEmployee));
        when(employeeRepository.save(any())).thenReturn(testEmployee);
        when(employmentRepository.findByemployeeId(1)).thenReturn(testEmployment);
        when(employmentRepository.save(any())).thenReturn(testEmployment);
        when(employeeSalaryComponentRelationRepository.findByemployeeId(1)).thenReturn(Collections.emptyList());
        when(employeeBankDetailsRepository.findByEmployeeId(1)).thenReturn(testBankDetails);

        mockMvc.perform(delete("/rest/employee/delete").param("id", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should delete employees in bulk")
    void deleteProductsSucceeds() throws Exception {
        doNothing().when(employeeService).deleteByIds(any());

        mockMvc.perform(delete("/rest/employee/deletes")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"ids\":[1,2,3]}"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return employees for dropdown")
    void getEmployeesForDropdownReturnsList() throws Exception {
        List<DropdownModel> dropdownList = Arrays.asList(
            new DropdownModel(1, "John Doe"),
            new DropdownModel(2, "Jane Smith")
        );

        when(employeeService.getEmployeesForDropdown()).thenReturn(dropdownList);

        mockMvc.perform(get("/rest/employee/getEmployeesForDropdown"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return employees not in user for dropdown")
    void getEmployeesNotInUserForDropdownReturnsList() throws Exception {
        List<DropdownObjectModel> dropdownList = Arrays.asList(
            new DropdownObjectModel(1, "John Doe"),
            new DropdownObjectModel(2, "Jane Smith")
        );

        when(employeeService.getEmployeesNotInUserForDropdown()).thenReturn(dropdownList);

        mockMvc.perform(get("/rest/employee/getEmployeesNotInUserForDropdown"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return all active complete employees for payroll")
    void getAllActiveCompleteEmployeeReturnsList() throws Exception {
        List<PayrollEmployeeDto> employeeList = Arrays.asList(
            createPayrollEmployeeDto(1, 1, "John Doe", "EMP001", BigDecimal.valueOf(5000))
        );

        when(employeeService.getAllActiveCompleteEmployee("01-12-2024")).thenReturn(employeeList);

        mockMvc.perform(get("/rest/employee/getAllActiveCompleteEmployee")
                .param("payrollDate", "01-12-2024"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return not found when no active employees for payroll")
    void getAllActiveCompleteEmployeeReturnsNotFound() throws Exception {
        when(employeeService.getAllActiveCompleteEmployee("01-12-2024")).thenReturn(null);

        mockMvc.perform(get("/rest/employee/getAllActiveCompleteEmployee")
                .param("payrollDate", "01-12-2024"))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should send employee invite email")
    void getEmployeeInviteEmailSendsEmail() throws Exception {
        when(employeeService.findByPK(1)).thenReturn(testEmployee);
        when(employeeService.sendInvitationMail(any(), any())).thenReturn(true);

        mockMvc.perform(get("/rest/employee/getEmployeeInviteEmail").param("id", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should save new employee")
    void saveEmployeeSucceeds() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(employeeService.findByAttributes(any())).thenReturn(Collections.emptyList());
        when(employeeHelper.getEntity(any(), anyInt())).thenReturn(testEmployee);
        doNothing().when(employeeService).persist(any());
        when(employeeService.sendInvitationMail(any(), any())).thenReturn(true);
        doNothing().when(transactionCategoryCreationHelper).createTransactionCategoryForEmployee(any());
        doNothing().when(employeeHelper).createDefaultSalaryComponentListForThisEmployee(any());

        mockMvc.perform(post("/rest/employee/save")
                .param("firstName", "John")
                .param("lastName", "Doe")
                .param("email", "john@test.com"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return bad request when email already exists")
    void saveEmployeeReturnsBadRequestWhenEmailExists() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(employeeService.findByAttributes(any())).thenReturn(Arrays.asList(testEmployee));

        mockMvc.perform(post("/rest/employee/save")
                .param("firstName", "John")
                .param("lastName", "Doe")
                .param("email", "john@test.com"))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should update existing employee")
    void updateEmployeeSucceeds() throws Exception {
        testEmployee.setId(1);
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(employeeHelper.getEntity(any(), anyInt())).thenReturn(testEmployee);
        when(employeeService.update(any())).thenReturn(testEmployee);
        doNothing().when(transactionCategoryCreationHelper).updateEmployeeTransactionCategory(any());

        mockMvc.perform(post("/rest/employee/update")
                .param("id", "1")
                .param("firstName", "John Updated")
                .param("lastName", "Doe")
                .param("email", "john@test.com"))
            .andExpect(status().isOk());
    }

    private Employee createTestEmployee(Integer id, String firstName, String lastName, String email) {
        Employee employee = new Employee();
        employee.setId(id);
        employee.setFirstName(firstName);
        employee.setLastName(lastName);
        employee.setEmail(email);
        employee.setIsActive(true);
        employee.setDeleteFlag(false);
        employee.setCreatedBy(1);
        employee.setCreatedDate(LocalDateTime.now());
        return employee;
    }

    private User createTestUser(Integer id, String firstName, String lastName, String email) {
        User user = new User();
        user.setUserId(id);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setUserEmail(email);
        user.setIsActive(true);
        user.setDeleteFlag(false);
        user.setCreatedDate(LocalDateTime.now());
        user.setCreatedBy(1);
        return user;
    }

    private Employment createTestEmployment(Integer id, Employee employee) {
        Employment employment = new Employment();
        employment.setId(id);
        employment.setEmployee(employee);
        employment.setDateOfJoining(LocalDateTime.now().minusMonths(6));
        employment.setDeleteFlag(false);
        return employment;
    }

    private EmployeeBankDetails createTestBankDetails(Integer id, Employee employee) {
        EmployeeBankDetails bankDetails = new EmployeeBankDetails();
        bankDetails.setId(id);
        bankDetails.setEmployee(employee);
        bankDetails.setAccountHolderName(employee.getFirstName() + " " + employee.getLastName());
        bankDetails.setAccountNumber("1234567890");
        bankDetails.setIban("AE070331234567890123456");
        bankDetails.setDeleteFlag(false);
        return bankDetails;
    }

    private EmployeeListModel createEmployeeListModel(Integer id, String firstName, String lastName) {
        EmployeeListModel model = new EmployeeListModel();
        model.setId(id);
        model.setFirstName(firstName);
        model.setLastName(lastName);
        return model;
    }

    private PayrollEmployeeDto createPayrollEmployeeDto(Integer id, Integer empId, String empName, String empCode, BigDecimal grossPay) {
        PayrollEmployeeDto dto = new PayrollEmployeeDto();
        dto.setId(id);
        dto.setEmpId(empId);
        dto.setEmpName(empName);
        dto.setEmpCode(empCode);
        dto.setGrossPay(grossPay);
        dto.setDeduction(BigDecimal.ZERO);
        dto.setNetPay(grossPay);
        return dto;
    }
}
