package com.simpleaccounts.rest.payroll;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.dao.JournalLineItemDao;
import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeBankDetails;
import com.simpleaccounts.entity.Employment;
import com.simpleaccounts.entity.Payroll;
import com.simpleaccounts.entity.PayrollEmployee;
import com.simpleaccounts.entity.SalaryComponent;
import com.simpleaccounts.entity.SalaryRole;
import com.simpleaccounts.entity.SalaryStructure;
import com.simpleaccounts.entity.SalaryTemplate;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.model.EmployeeBankDetailsPersistModel;
import com.simpleaccounts.model.EmploymentPersistModel;
import com.simpleaccounts.repository.JournalLineItemRepository;
import com.simpleaccounts.repository.PayrollEmployeeRepository;
import com.simpleaccounts.repository.PayrollRepository;
import com.simpleaccounts.repository.PayrolEmployeeRepository;
import com.simpleaccounts.repository.SalaryComponentRepository;
import com.simpleaccounts.repository.SalaryRepository;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.UserDto;
import com.simpleaccounts.rest.payroll.dto.PayrollEmployeeDto;
import com.simpleaccounts.rest.payroll.model.PayrollListModel;
import com.simpleaccounts.rest.payroll.payrolService.PayrolService;
import com.simpleaccounts.rest.payroll.service.SalaryComponentService;
import com.simpleaccounts.rest.payroll.service.SalaryRoleService;
import com.simpleaccounts.rest.payroll.service.SalaryStructureService;
import com.simpleaccounts.rest.payroll.service.SalaryTemplateService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.EmployeeBankDetailsService;
import com.simpleaccounts.service.EmployeeService;
import com.simpleaccounts.service.EmploymentService;
import com.simpleaccounts.service.JournalLineItemService;
import com.simpleaccounts.service.JournalService;
import com.simpleaccounts.service.RoleModuleRelationService;
import com.simpleaccounts.service.TransactionCategoryBalanceService;
import com.simpleaccounts.service.TransactionCategoryService;
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
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("PayrollController Unit Tests")
class PayrollControllerTest {

    private MockMvc mockMvc;

    @Mock private JwtTokenUtil jwtTokenUtil;
    @Mock private RoleModuleRelationService roleModuleRelationService;
    @Mock private EmployeeService employeeService;
    @Mock private PayrolService payrolService;
    @Mock private SalaryComponentService salaryComponentService;
    @Mock private UserService userService;
    @Mock private EmployeeBankDetailsService employeeBankDetailsService;
    @Mock private PayrollRestHepler payrollRestHepler;
    @Mock private EmploymentService employmentService;
    @Mock private SalaryRoleService salaryRoleService;
    @Mock private SalaryTemplateService salaryTemplateService;
    @Mock private TransactionCategoryService transactionCategoryService;
    @Mock private SalaryStructureService salaryStructureService;
    @Mock private PayrollRepository payrollRepository;
    @Mock private JournalService journalService;
    @Mock private JournalLineItemService journalLineItemService;
    @Mock private JournalLineItemRepository journalLineItemRepository;
    @Mock private SalaryRepository salaryRepository;
    @Mock private PayrolEmployeeRepository payrolEmployeeRepository;
    @Mock private JournalLineItemDao journalLineItemDao;
    @Mock private TransactionCategoryBalanceService transactionCategoryBalanceService;
    @Mock private PayrollEmployeeRepository payrollEmployeeRepository;
    @Mock private SalaryComponentRepository salaryComponentRepository;

    @InjectMocks
    private PayrollController payrollController;

    private User testUser;
    private Employee testEmployee;
    private Payroll testPayroll;
    private EmployeeBankDetails testBankDetails;
    private Employment testEmployment;
    private SalaryRole testSalaryRole;
    private SalaryStructure testSalaryStructure;
    private SalaryComponent testSalaryComponent;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(payrollController).build();
        testUser = createTestUser(1, "Admin", "User", "admin@test.com");
        testEmployee = createTestEmployee(1, "John", "Doe", "john@test.com");
        testPayroll = createTestPayroll(1, "January Payroll", "Draft");
        testBankDetails = createTestBankDetails(1, testEmployee);
        testEmployment = createTestEmployment(1, testEmployee);
        testSalaryRole = createTestSalaryRole(1, "Developer");
        testSalaryStructure = createTestSalaryStructure(1, "Earnings");
        testSalaryComponent = createTestSalaryComponent(1, "Basic Salary", BigDecimal.valueOf(5000));
    }

    // Bank Details Tests
    @Test
    @DisplayName("Should save employee bank details")
    void saveEmployeeBankDetailsSucceeds() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(payrollRestHepler.getEntity(any(EmployeeBankDetailsPersistModel.class))).thenReturn(testBankDetails);
        doNothing().when(employeeBankDetailsService).persist(any());

        mockMvc.perform(post("/rest/payroll/saveEmployeeBankDetails")
                .param("accountHolderName", "John Doe")
                .param("accountNumber", "1234567890"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should update employee bank details")
    void updateEmployeeBankDetailsSucceeds() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(payrollRestHepler.getEntity(any(EmployeeBankDetailsPersistModel.class))).thenReturn(testBankDetails);
        when(employeeBankDetailsService.update(any())).thenReturn(testBankDetails);

        mockMvc.perform(post("/rest/payroll/updateEmployeeBankDetails")
                .param("id", "1")
                .param("accountHolderName", "John Doe Updated"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should delete employee bank details")
    void deleteEmployeeBankDetailsSucceeds() throws Exception {
        when(employeeBankDetailsService.findByPK(1)).thenReturn(testBankDetails);
        when(employeeBankDetailsService.update(any(), anyInt())).thenReturn(testBankDetails);

        mockMvc.perform(delete("/rest/payroll/delete").param("id", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should get employee bank details by ID")
    void getBankDetailsByIdReturnsDetails() throws Exception {
        EmployeeBankDetailsPersistModel model = new EmployeeBankDetailsPersistModel();
        model.setId(1);
        model.setAccountHolderName("John Doe");

        when(employeeBankDetailsService.findByPK(1)).thenReturn(testBankDetails);
        when(payrollRestHepler.getModel(testBankDetails)).thenReturn(model);

        mockMvc.perform(get("/rest/payroll/getById").param("id", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return not found when bank details do not exist")
    void getBankDetailsByIdReturnsNotFound() throws Exception {
        when(employeeBankDetailsService.findByPK(999)).thenReturn(null);

        mockMvc.perform(get("/rest/payroll/getById").param("id", "999"))
            .andExpect(status().isNotFound());
    }

    // Employment Tests
    @Test
    @DisplayName("Should save employment")
    void saveEmploymentSucceeds() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(payrollRestHepler.getEmploymentEntity(any())).thenReturn(testEmployment);
        doNothing().when(employmentService).persist(any());

        mockMvc.perform(post("/rest/payroll/saveEmployment")
                .param("employeeId", "1")
                .param("dateOfJoining", "2024-01-15"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should update employment")
    void updateEmploymentSucceeds() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(payrollRestHepler.getEmploymentEntity(any())).thenReturn(testEmployment);
        when(employmentService.update(any())).thenReturn(testEmployment);

        mockMvc.perform(post("/rest/payroll/updateEmployment")
                .param("id", "1")
                .param("employmentStatus", "Active"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should delete employment")
    void deleteEmploymentSucceeds() throws Exception {
        when(employmentService.findByPK(1)).thenReturn(testEmployment);
        when(employmentService.update(any(), anyInt())).thenReturn(testEmployment);

        mockMvc.perform(delete("/rest/payroll/deleteEmployment").param("id", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should get employment by ID")
    void getEmploymentByIdReturnsEmployment() throws Exception {
        EmploymentPersistModel model = new EmploymentPersistModel();
        model.setId(1);

        when(employmentService.findByPK(1)).thenReturn(testEmployment);
        when(payrollRestHepler.getEmploymentModel(testEmployment)).thenReturn(model);

        mockMvc.perform(get("/rest/payroll/getEmploymentById").param("id", "1"))
            .andExpect(status().isOk());
    }

    // Salary Role Tests
    @Test
    @DisplayName("Should return salary roles for dropdown")
    void getSalaryRolesForDropdownReturnsList() throws Exception {
        List<DropdownObjectModel> dropdownList = Arrays.asList(
            new DropdownObjectModel(1, "Developer"),
            new DropdownObjectModel(2, "Manager")
        );

        when(salaryRoleService.getSalaryRolesForDropdownObjectModel()).thenReturn(dropdownList);

        mockMvc.perform(get("/rest/payroll/getSalaryRolesForDropdown"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should save salary role")
    void saveSalaryRoleSucceeds() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(payrollRestHepler.getSalaryRoleEntity(any())).thenReturn(testSalaryRole);
        doNothing().when(salaryRoleService).persist(any());

        mockMvc.perform(post("/rest/payroll/saveSalaryRole")
                .param("roleName", "Developer"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should get salary role list")
    void getSalaryRoleListReturnsList() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(1, Arrays.asList(testSalaryRole));

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(salaryRoleService.getSalaryRoleList(any(), any())).thenReturn(response);
        when(payrollRestHepler.getSalaryRoleListModel(response)).thenReturn(response);

        mockMvc.perform(get("/rest/payroll/salaryRoleList")
                .param("pageNo", "0")
                .param("pageSize", "10"))
            .andExpect(status().isOk());
    }

    // Salary Structure Tests
    @Test
    @DisplayName("Should return salary structure for dropdown")
    void getSalaryStructureForDropdownReturnsList() throws Exception {
        List<DropdownObjectModel> dropdownList = Arrays.asList(
            new DropdownObjectModel(1, "Earnings"),
            new DropdownObjectModel(2, "Deductions")
        );

        when(salaryStructureService.getSalaryStructureDropdown()).thenReturn(dropdownList);

        mockMvc.perform(get("/rest/payroll/getSalaryStructureForDropdown"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should save salary structure")
    void saveSalaryStructureSucceeds() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(payrollRestHepler.getSalaryStructureEntity(any())).thenReturn(testSalaryStructure);
        doNothing().when(salaryStructureService).persist(any());

        mockMvc.perform(post("/rest/payroll/saveSalaryStructure")
                .param("structureName", "Earnings"))
            .andExpect(status().isOk());
    }

    // Payroll Tests
    @Test
    @DisplayName("Should create new payroll")
    void createPayrollSucceeds() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(payrolService.createNewPayrol(any(), any(), anyInt())).thenReturn(testPayroll);

        mockMvc.perform(post("/rest/payroll/createPayroll")
                .param("payrollSubject", "January Payroll")
                .param("payrollDate", "2024-01-31"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should get payroll list")
    void getPayrollListReturnsList() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(1, Arrays.asList(testPayroll));
        List<PayrollListModel> listModels = Arrays.asList(createPayrollListModel(1, "January Payroll"));

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(payrolService.getList(any(), any())).thenReturn(response);
        when(payrollRestHepler.getListModel(any())).thenReturn(listModels);

        mockMvc.perform(get("/rest/payroll/getList")
                .param("pageNo", "0")
                .param("pageSize", "10"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should get payroll by ID")
    void getPayrollByIdReturnsPayroll() throws Exception {
        when(payrollRestHepler.getPayroll(1)).thenReturn(testPayroll);
        when(userService.findByPK(anyInt())).thenReturn(testUser);
        when(payrolService.getEmployeeList(1)).thenReturn(Arrays.asList(1, 2));

        mockMvc.perform(get("/rest/payroll/getPayroll").param("id", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should get all payroll employees")
    void getAllPayrollEmployeeReturnsList() throws Exception {
        List<PayrollEmployeeDto> employeeList = Arrays.asList(
            createPayrollEmployeeDto(1, "John Doe", BigDecimal.valueOf(5000))
        );

        when(payrolService.getAllPayrollEmployee(1, "01-01-2024")).thenReturn(employeeList);

        mockMvc.perform(get("/rest/payroll/getAllPayrollEmployee")
                .param("payrollid", "1")
                .param("payrollDate", "01-01-2024"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should get approver users")
    void getApproverUsersReturnsList() throws Exception {
        List<UserDto> userList = Arrays.asList(createUserDto(1, "Admin User"));

        when(payrolService.getAprovedUserList()).thenReturn(userList);

        mockMvc.perform(get("/rest/payroll/getAproverUsers"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should get user and role")
    void getUserAndRoleReturnsList() throws Exception {
        List<DropdownModel> dropdownList = Arrays.asList(new DropdownModel(1, "Admin"));

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.getUserForPayrollDropdown(1)).thenReturn(dropdownList);

        mockMvc.perform(get("/rest/payroll/getUserAndRole"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should delete payroll")
    void deletePayrollSucceeds() throws Exception {
        doNothing().when(payrolService).deletePayroll(1);

        mockMvc.perform(delete("/rest/payroll/deletePayroll").param("payrollId", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should remove employees from payroll")
    void removeEmployeeSucceeds() throws Exception {
        doNothing().when(payrolService).deleteByIds(any());

        mockMvc.perform(delete("/rest/payroll/removeEmployee")
                .param("payEmpListIds", "1,2,3"))
            .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Should get salary component by employee ID")
    void getSalaryComponentByEmployeeIdReturnsComponent() throws Exception {
        DefaultEmployeeSalaryComponentRelationModel model = new DefaultEmployeeSalaryComponentRelationModel();

        when(payrollRestHepler.getSalaryComponentByEmployeeId(1)).thenReturn(model);

        mockMvc.perform(get("/rest/payroll/getSalaryComponentByEmployeeId").param("id", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should get unpaid payroll list")
    void getUnpaidPayrollListReturnsList() throws Exception {
        List<Payroll> payrollList = Arrays.asList(testPayroll);
        List<PayrollDropdownModel> dropdownList = Arrays.asList(new PayrollDropdownModel());

        when(payrollRestHepler.getPayrollList()).thenReturn(payrollList);
        when(payrollRestHepler.getUnpaidPayrollList(payrollList)).thenReturn(dropdownList);

        mockMvc.perform(get("/rest/payroll/getUnpaidPayrollList"))
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

    private Payroll createTestPayroll(Integer id, String subject, String status) {
        Payroll payroll = new Payroll();
        payroll.setId(id);
        payroll.setPayrollSubject(subject);
        payroll.setStatus(status);
        payroll.setPayrollDate(LocalDateTime.now());
        payroll.setGeneratedBy("1");
        payroll.setDeleteFlag(false);
        payroll.setIsActive(true);
        return payroll;
    }

    private EmployeeBankDetails createTestBankDetails(Integer id, Employee employee) {
        EmployeeBankDetails bankDetails = new EmployeeBankDetails();
        bankDetails.setId(id);
        bankDetails.setEmployee(employee);
        bankDetails.setAccountHolderName(employee.getFirstName() + " " + employee.getLastName());
        bankDetails.setAccountNumber("1234567890");
        bankDetails.setDeleteFlag(false);
        return bankDetails;
    }

    private Employment createTestEmployment(Integer id, Employee employee) {
        Employment employment = new Employment();
        employment.setId(id);
        employment.setEmployee(employee);
        employment.setDateOfJoining(LocalDateTime.now().minusMonths(6));
        employment.setDeleteFlag(false);
        return employment;
    }

    private SalaryRole createTestSalaryRole(Integer id, String name) {
        SalaryRole role = new SalaryRole();
        role.setId(id);
        role.setRoleName(name);
        role.setDeleteFlag(false);
        return role;
    }

    private SalaryStructure createTestSalaryStructure(Integer id, String name) {
        SalaryStructure structure = new SalaryStructure();
        structure.setId(id);
        structure.setStructureName(name);
        structure.setDeleteFlag(false);
        return structure;
    }

    private SalaryComponent createTestSalaryComponent(Integer id, String code, BigDecimal amount) {
        SalaryComponent component = new SalaryComponent();
        component.setId(id);
        component.setComponentCode(code);
        component.setFlatAmount(amount);
        component.setDeleteFlag(false);
        return component;
    }

    private PayrollListModel createPayrollListModel(Integer id, String subject) {
        PayrollListModel model = new PayrollListModel();
        model.setId(id);
        model.setPayrollSubject(subject);
        return model;
    }

    private PayrollEmployeeDto createPayrollEmployeeDto(Integer id, String name, BigDecimal grossPay) {
        PayrollEmployeeDto dto = new PayrollEmployeeDto();
        dto.setId(id);
        dto.setEmpName(name);
        dto.setGrossPay(grossPay);
        dto.setDeduction(BigDecimal.ZERO);
        dto.setNetPay(grossPay);
        return dto;
    }

    private UserDto createUserDto(Integer id, String name) {
        UserDto dto = new UserDto();
        dto.setUserId(id);
        dto.setFullName(name);
        return dto;
    }
}
