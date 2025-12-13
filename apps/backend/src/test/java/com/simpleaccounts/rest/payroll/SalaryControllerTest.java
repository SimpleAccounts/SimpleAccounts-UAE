package com.simpleaccounts.rest.payroll;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.Salary;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.model.SalaryPersistModel;
import com.simpleaccounts.rest.payroll.service.Impl.SalaryServiceImpl;
import com.simpleaccounts.rest.payroll.service.SalaryService;
import com.simpleaccounts.rest.payroll.service.SalaryTemplateService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.EmploymentService;
import com.simpleaccounts.service.UserService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("SalaryController Unit Tests")
class SalaryControllerTest {

    private MockMvc mockMvc;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private UserService userService;

    @Mock
    private SalaryRestHelper salaryRestHelper;

    @Mock
    private EmploymentService employmentService;

    @Mock
    private SalaryTemplateService salaryTemplateService;

    @Mock
    private SalaryService salaryService;

    @Mock
    private SalaryServiceImpl salaryServiceImpl;

    @InjectMocks
    private SalaryController salaryController;

    private User testUser;
    private Employee testEmployee;
    private Salary testSalary;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(salaryController).build();
        testUser = createTestUser(1, "Admin", "User", "admin@test.com");
        testEmployee = createTestEmployee(1, "John", "Doe", "john@test.com");
        testSalary = createTestSalary(1, testEmployee, BigDecimal.valueOf(5000));
    }

    @Test
    @DisplayName("Should return salary per month list")
    void getSalaryPerMonthListReturnsList() throws Exception {
        SalaryListPerMonthResponseModel response = new SalaryListPerMonthResponseModel();
        response.setSalaryPerMonthListModels(Collections.emptyList());

        when(salaryRestHelper.getSalaryPerMonthList(any())).thenReturn(response);

        mockMvc.perform(get("/rest/Salary/getSalaryPerMonthList")
                .param("year", "2024")
                .param("month", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return incomplete employee list")
    void getIncompleteEmployeeListReturnsList() throws Exception {
        IncompleteEmployeeResponseModel response = new IncompleteEmployeeResponseModel();
        response.setIncompleteEmployees(Collections.emptyList());

        when(salaryRestHelper.getIncompleteEmployeeList()).thenReturn(response);

        mockMvc.perform(get("/rest/Salary/getIncompleteEmployeeList"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should generate salary successfully")
    void generateSalarySucceeds() throws Exception {
        when(salaryRestHelper.generateSalary(any(), any())).thenReturn("Salary Generated Successfully");

        mockMvc.perform(post("/rest/Salary/generateSalary")
                .param("employeeId", "1")
                .param("salaryMonth", "January")
                .param("salaryYear", "2024"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should get salaries by employee ID")
    void getSalariesByEmployeeIdReturnsSalaries() throws Exception {
        SalarySlipModel salarySlipModel = createSalarySlipModel(1, "John Doe", BigDecimal.valueOf(5000));

        when(salaryService.getSalaryByEmployeeId(1, "01-01-2024")).thenReturn(salarySlipModel);

        mockMvc.perform(get("/rest/Salary/getSalariesByEmployeeId")
                .param("id", "1")
                .param("salaryDate", "01-01-2024")
                .param("sendMail", "false"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should get salaries and send email when sendMail is true")
    void getSalariesByEmployeeIdSendsEmail() throws Exception {
        SalarySlipModel salarySlipModel = createSalarySlipModel(1, "John Doe", BigDecimal.valueOf(5000));

        when(salaryService.getSalaryByEmployeeId(1, "01-01-2024")).thenReturn(salarySlipModel);
        doNothing().when(salaryRestHelper).sendPayslipEmail(any(), anyInt(), anyString(), anyString(), any());

        mockMvc.perform(get("/rest/Salary/getSalariesByEmployeeId")
                .param("id", "1")
                .param("salaryDate", "01-01-2024")
                .param("startDate", "01-01-2024")
                .param("endDate", "31-01-2024")
                .param("sendMail", "true"))
            .andExpect(status().isOk());

        verify(salaryRestHelper).sendPayslipEmail(eq(salarySlipModel), eq(1), eq("01-01-2024"), eq("31-01-2024"), any());
    }

    @Test
    @DisplayName("Should get employee transaction categories")
    void getEmployeeTcReturnsList() throws Exception {
        List<Object> transactions = Arrays.asList("Transaction1", "Transaction2");

        when(salaryServiceImpl.getEmployeeTransactions(1, "01-01-2024", "31-01-2024")).thenReturn(transactions);

        mockMvc.perform(get("/rest/Salary/getEmployeeTc")
                .param("employeeId", "1")
                .param("startDate", "01-01-2024")
                .param("endDate", "31-01-2024"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return not found when employee transactions are null")
    void getEmployeeTcReturnsNotFoundWhenNull() throws Exception {
        when(salaryServiceImpl.getEmployeeTransactions(1, "01-01-2024", "31-01-2024")).thenReturn(null);

        mockMvc.perform(get("/rest/Salary/getEmployeeTc")
                .param("employeeId", "1")
                .param("startDate", "01-01-2024")
                .param("endDate", "31-01-2024"))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should get salary slip list")
    void getSalarySlipListReturnsList() throws Exception {
        SalarySlipListtResponseModel response = new SalarySlipListtResponseModel();
        response.setSalarySlipList(Collections.emptyList());

        when(salaryRestHelper.getSalarySlipList(1)).thenReturn(response);

        mockMvc.perform(get("/rest/Salary/getSalarySlipList").param("id", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should handle salary generation with all parameters")
    void generateSalaryWithAllParameters() throws Exception {
        when(salaryRestHelper.generateSalary(any(), any())).thenReturn("Salary Generated");

        mockMvc.perform(post("/rest/Salary/generateSalary")
                .param("employeeId", "1")
                .param("salaryMonth", "January")
                .param("salaryYear", "2024")
                .param("basicSalary", "5000")
                .param("allowances", "1000")
                .param("deductions", "500"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should handle empty salary per month list")
    void getSalaryPerMonthListHandlesEmpty() throws Exception {
        SalaryListPerMonthResponseModel response = new SalaryListPerMonthResponseModel();
        response.setSalaryPerMonthListModels(Collections.emptyList());

        when(salaryRestHelper.getSalaryPerMonthList(any())).thenReturn(response);

        mockMvc.perform(get("/rest/Salary/getSalaryPerMonthList"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should handle incomplete employee list with multiple employees")
    void getIncompleteEmployeeListHandlesMultiple() throws Exception {
        IncompleteEmployeeResponseModel response = new IncompleteEmployeeResponseModel();
        List<IncompleteEmployeeModel> employees = Arrays.asList(
            createIncompleteEmployeeModel(1, "John", "Missing bank details"),
            createIncompleteEmployeeModel(2, "Jane", "Missing salary components")
        );
        response.setIncompleteEmployees(employees);

        when(salaryRestHelper.getIncompleteEmployeeList()).thenReturn(response);

        mockMvc.perform(get("/rest/Salary/getIncompleteEmployeeList"))
            .andExpect(status().isOk());
    }

    // Helper Methods
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
        Company company = new Company();
        company.setCompanyId(1);
        user.setCompany(company);
        return user;
    }

    private Employee createTestEmployee(Integer id, String firstName, String lastName, String email) {
        Employee employee = new Employee();
        employee.setId(id);
        employee.setFirstName(firstName);
        employee.setLastName(lastName);
        employee.setEmail(email);
        employee.setIsActive(true);
        employee.setDeleteFlag(false);
        return employee;
    }

    private Salary createTestSalary(Integer id, Employee employee, BigDecimal amount) {
        Salary salary = new Salary();
        salary.setId(id);
        salary.setEmployee(employee);
        salary.setNetSalary(amount);
        salary.setGrossSalary(amount);
        salary.setDeleteFlag(false);
        return salary;
    }

    private SalarySlipModel createSalarySlipModel(Integer id, String employeeName, BigDecimal netSalary) {
        SalarySlipModel model = new SalarySlipModel();
        model.setEmployeeId(id);
        model.setEmployeeName(employeeName);
        model.setNetSalary(netSalary);
        model.setGrossSalary(netSalary.add(BigDecimal.valueOf(500)));
        model.setTotalDeductions(BigDecimal.valueOf(500));
        return model;
    }

    private IncompleteEmployeeModel createIncompleteEmployeeModel(Integer id, String name, String reason) {
        IncompleteEmployeeModel model = new IncompleteEmployeeModel();
        model.setEmployeeId(id);
        model.setEmployeeName(name);
        model.setReason(reason);
        return model;
    }
}
