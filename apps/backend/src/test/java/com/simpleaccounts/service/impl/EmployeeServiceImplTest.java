package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.constant.dbfilter.EmployeeFilterEnum;
import com.simpleaccounts.dao.EmployeeDao;
import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeSalaryComponentRelation;
import com.simpleaccounts.entity.Employment;
import com.simpleaccounts.entity.SalaryStructure;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.repository.EmployeeRepository;
import com.simpleaccounts.repository.EmployeeSalaryComponentRelationRepository;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.dto.PayrollEmployeeDto;
import com.simpleaccounts.rest.payroll.dto.PayrollEmployeeResultSet;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.EmaiLogsService;
import com.simpleaccounts.service.EmploymentService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.EmailSender;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

    @Mock
    private EmployeeDao employeeDao;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private EmployeeSalaryComponentRelationRepository EmpSalaryCompRelRepository;

    @Mock
    private DateFormatUtil dateFormatUtil;

    @Mock
    private EmploymentService employmentService;

    @Mock
    private ResourceLoader resourceLoader;

    @Mock
    private EmailSender emailSender;

    @Mock
    private EmaiLogsService emaiLogsService;

    @Mock
    private UserService userService;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private Employee testEmployee;
    private Employment testEmployment;
    private User testUser;
    private Company testCompany;

    @BeforeEach
    void setUp() {
        testEmployee = new Employee();
        testEmployee.setId(1);
        testEmployee.setFirstName("John");
        testEmployee.setLastName("Doe");
        testEmployee.setEmail("john.doe@example.com");
        testEmployee.setMobileNumber("+971501234567");
        testEmployee.setIsActive(true);
        testEmployee.setDeleteFlag(false);
        testEmployee.setDob(LocalDateTime.of(1990, 1, 1, 0, 0));
        testEmployee.setCreatedDate(LocalDateTime.now());
        testEmployee.setLastUpdateDate(LocalDateTime.now());

        testEmployment = new Employment();
        testEmployment.setId(1);
        testEmployment.setEmployeeCode("EMP001");
        testEmployment.setDateOfJoining(LocalDateTime.of(2020, 1, 1, 0, 0));
        testEmployment.setDepartment("IT");
        testEmployment.setGrossSalary(new BigDecimal("5000.00"));
        testEmployment.setDeleteFlag(false);

        testCompany = new Company();
        testCompany.setCompanyId(1);
        testCompany.setCompanyLogo(new byte[]{1, 2, 3});

        testUser = new User();
        testUser.setId(1);
        testUser.setCompany(testCompany);
    }

    // Test getEmployeesForDropdown
    @Test
    void shouldGetEmployeesForDropdownSuccessfully() {
        List<DropdownModel> expectedDropdown = Arrays.asList(
                new DropdownModel(1, "John Doe"),
                new DropdownModel(2, "Jane Smith")
        );
        when(employeeDao.getEmployeesForDropdown()).thenReturn(expectedDropdown);

        List<DropdownModel> result = employeeService.getEmployeesForDropdown();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(1);
        assertThat(result.get(0).getValue()).isEqualTo("John Doe");
        verify(employeeDao, times(1)).getEmployeesForDropdown();
    }

    @Test
    void shouldReturnEmptyListWhenNoEmployeesForDropdown() {
        when(employeeDao.getEmployeesForDropdown()).thenReturn(Collections.emptyList());

        List<DropdownModel> result = employeeService.getEmployeesForDropdown();

        assertThat(result).isEmpty();
        verify(employeeDao, times(1)).getEmployeesForDropdown();
    }

    // Test getEmployeesNotInUserForDropdown
    @Test
    void shouldGetEmployeesNotInUserForDropdownSuccessfully() {
        List<DropdownObjectModel> expectedDropdown = Arrays.asList(
                new DropdownObjectModel(1, "John Doe", null),
                new DropdownObjectModel(2, "Jane Smith", null)
        );
        when(employeeDao.getEmployeesNotInUserForDropdown()).thenReturn(expectedDropdown);

        List<DropdownObjectModel> result = employeeService.getEmployeesNotInUserForDropdown();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(1);
        assertThat(result.get(0).getValue()).isEqualTo("John Doe");
        verify(employeeDao, times(1)).getEmployeesNotInUserForDropdown();
    }

    @Test
    void shouldReturnEmptyListWhenNoEmployeesNotInUser() {
        when(employeeDao.getEmployeesNotInUserForDropdown()).thenReturn(Collections.emptyList());

        List<DropdownObjectModel> result = employeeService.getEmployeesNotInUserForDropdown();

        assertThat(result).isEmpty();
        verify(employeeDao, times(1)).getEmployeesNotInUserForDropdown();
    }

    // Test getEmployees with pagination
    @Test
    void shouldGetEmployeesWithPaginationSuccessfully() {
        List<Employee> expectedEmployees = Arrays.asList(testEmployee);
        when(employeeDao.getEmployees(0, 10)).thenReturn(expectedEmployees);

        List<Employee> result = employeeService.getEmployees(0, 10);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1);
        assertThat(result.get(0).getFirstName()).isEqualTo("John");
        verify(employeeDao, times(1)).getEmployees(0, 10);
    }

    @Test
    void shouldReturnEmptyListWhenNoEmployeesWithPagination() {
        when(employeeDao.getEmployees(0, 10)).thenReturn(Collections.emptyList());

        List<Employee> result = employeeService.getEmployees(0, 10);

        assertThat(result).isEmpty();
        verify(employeeDao, times(1)).getEmployees(0, 10);
    }

    @Test
    void shouldGetEmployeesWithDifferentPageSizes() {
        List<Employee> expectedEmployees = Arrays.asList(testEmployee);
        when(employeeDao.getEmployees(1, 20)).thenReturn(expectedEmployees);

        List<Employee> result = employeeService.getEmployees(1, 20);

        assertThat(result).isNotNull();
        verify(employeeDao, times(1)).getEmployees(1, 20);
    }

    // Test getEmployees with search query
    @Test
    void shouldGetEmployeesWithSearchQuerySuccessfully() {
        List<Employee> expectedEmployees = Arrays.asList(testEmployee);
        when(employeeDao.getEmployees("John", 0, 10)).thenReturn(expectedEmployees);

        List<Employee> result = employeeService.getEmployees("John", 0, 10);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getFirstName()).isEqualTo("John");
        verify(employeeDao, times(1)).getEmployees("John", 0, 10);
    }

    @Test
    void shouldReturnEmptyListWhenSearchQueryNoMatch() {
        when(employeeDao.getEmployees("NonExistent", 0, 10)).thenReturn(Collections.emptyList());

        List<Employee> result = employeeService.getEmployees("NonExistent", 0, 10);

        assertThat(result).isEmpty();
        verify(employeeDao, times(1)).getEmployees("NonExistent", 0, 10);
    }

    @Test
    void shouldHandleEmptySearchQuery() {
        List<Employee> expectedEmployees = Arrays.asList(testEmployee);
        when(employeeDao.getEmployees("", 0, 10)).thenReturn(expectedEmployees);

        List<Employee> result = employeeService.getEmployees("", 0, 10);

        assertThat(result).isNotNull();
        verify(employeeDao, times(1)).getEmployees("", 0, 10);
    }

    // Test getEmployeeByEmail
    @Test
    void shouldGetEmployeeByEmailSuccessfully() {
        when(employeeDao.getEmployeeByEmail("john.doe@example.com"))
                .thenReturn(Optional.of(testEmployee));

        Optional<Employee> result = employeeService.getEmployeeByEmail("john.doe@example.com");

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("john.doe@example.com");
        assertThat(result.get().getFirstName()).isEqualTo("John");
        verify(employeeDao, times(1)).getEmployeeByEmail("john.doe@example.com");
    }

    @Test
    void shouldReturnEmptyWhenEmployeeEmailNotFound() {
        when(employeeDao.getEmployeeByEmail("notfound@example.com"))
                .thenReturn(Optional.empty());

        Optional<Employee> result = employeeService.getEmployeeByEmail("notfound@example.com");

        assertThat(result).isEmpty();
        verify(employeeDao, times(1)).getEmployeeByEmail("notfound@example.com");
    }

    @Test
    void shouldHandleNullEmailGracefully() {
        when(employeeDao.getEmployeeByEmail(null)).thenReturn(Optional.empty());

        Optional<Employee> result = employeeService.getEmployeeByEmail(null);

        assertThat(result).isEmpty();
        verify(employeeDao, times(1)).getEmployeeByEmail(null);
    }

    // Test getEmployeeList with filters
    @Test
    void shouldGetEmployeeListWithFiltersSuccessfully() {
        Map<EmployeeFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(EmployeeFilterEnum.IS_ACTIVE, true);

        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);

        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setTotalCount(1);
        expectedResponse.setData(Arrays.asList(testEmployee));

        when(employeeDao.getEmployeeList(filterMap, paginationModel))
                .thenReturn(expectedResponse);

        PaginationResponseModel result = employeeService.getEmployeeList(filterMap, paginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getTotalCount()).isEqualTo(1);
        assertThat(result.getData()).hasSize(1);
        verify(employeeDao, times(1)).getEmployeeList(filterMap, paginationModel);
    }

    @Test
    void shouldGetEmployeeListWithMultipleFilters() {
        Map<EmployeeFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(EmployeeFilterEnum.IS_ACTIVE, true);
        filterMap.put(EmployeeFilterEnum.EMPLOYEE_ID, 1);

        PaginationModel paginationModel = new PaginationModel();
        PaginationResponseModel expectedResponse = new PaginationResponseModel();

        when(employeeDao.getEmployeeList(filterMap, paginationModel))
                .thenReturn(expectedResponse);

        PaginationResponseModel result = employeeService.getEmployeeList(filterMap, paginationModel);

        assertThat(result).isNotNull();
        verify(employeeDao, times(1)).getEmployeeList(filterMap, paginationModel);
    }

    @Test
    void shouldGetEmployeeListWithEmptyFilters() {
        Map<EmployeeFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();
        PaginationResponseModel expectedResponse = new PaginationResponseModel();

        when(employeeDao.getEmployeeList(filterMap, paginationModel))
                .thenReturn(expectedResponse);

        PaginationResponseModel result = employeeService.getEmployeeList(filterMap, paginationModel);

        assertThat(result).isNotNull();
        verify(employeeDao, times(1)).getEmployeeList(filterMap, paginationModel);
    }

    // Test deleteByIds
    @Test
    void shouldDeleteByIdsSuccessfully() {
        ArrayList<Integer> ids = new ArrayList<>(Arrays.asList(1, 2, 3));
        doNothing().when(employeeDao).deleteByIds(ids);

        employeeService.deleteByIds(ids);

        verify(employeeDao, times(1)).deleteByIds(ids);
    }

    @Test
    void shouldDeleteSingleEmployeeById() {
        ArrayList<Integer> ids = new ArrayList<>(Collections.singletonList(1));
        doNothing().when(employeeDao).deleteByIds(ids);

        employeeService.deleteByIds(ids);

        verify(employeeDao, times(1)).deleteByIds(ids);
    }

    @Test
    void shouldHandleEmptyIdListForDelete() {
        ArrayList<Integer> ids = new ArrayList<>();
        doNothing().when(employeeDao).deleteByIds(ids);

        employeeService.deleteByIds(ids);

        verify(employeeDao, times(1)).deleteByIds(ids);
    }

    @Test
    void shouldDeleteMultipleEmployeesByIds() {
        ArrayList<Integer> ids = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5));
        doNothing().when(employeeDao).deleteByIds(ids);

        employeeService.deleteByIds(ids);

        verify(employeeDao, times(1)).deleteByIds(ids);
    }

    // Test getAllActiveCompleteEmployee
    @Test
    void shouldGetAllActiveCompleteEmployeeSuccessfully() {
        String payrollDate = "01-01-2023";
        LocalDateTime startDate = LocalDateTime.of(2023, 1, 1, 0, 0);

        PayrollEmployeeResultSet resultSet = mock(PayrollEmployeeResultSet.class);
        when(resultSet.getId()).thenReturn(1);
        when(resultSet.getEmpId()).thenReturn("EMP001");
        when(resultSet.getEmpFirstName()).thenReturn("John");
        when(resultSet.getEmpLastName()).thenReturn("Doe");
        when(resultSet.getEmpCode()).thenReturn("EMP001");

        testEmployment.setDateOfJoining(LocalDateTime.of(2022, 1, 1, 0, 0));

        SalaryStructure salaryStructure = new SalaryStructure();
        salaryStructure.setId(1);

        EmployeeSalaryComponentRelation salaryComponent = new EmployeeSalaryComponentRelation();
        salaryComponent.setSalaryStructure(salaryStructure);
        salaryComponent.setMonthlyAmount(new BigDecimal("5000.00"));
        salaryComponent.setNoOfDays(new BigDecimal("30"));

        when(dateFormatUtil.getDateStrAsLocalDateTime(payrollDate, CommonColumnConstants.DD_MM_YYYY))
                .thenReturn(startDate);
        when(employeeRepository.getAllActiveCompleteEmployee())
                .thenReturn(Collections.singletonList(resultSet));
        when(employmentService.findByPK(1)).thenReturn(testEmployment);
        when(EmpSalaryCompRelRepository.findByemployeeId("EMP001"))
                .thenReturn(Collections.singletonList(salaryComponent));

        List<PayrollEmployeeDto> result = employeeService.getAllActiveCompleteEmployee(payrollDate);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmpId()).isEqualTo("EMP001");
        assertThat(result.get(0).getEmpName()).isEqualTo("John Doe");
        assertThat(result.get(0).getGrossPay()).isEqualByComparingTo(new BigDecimal("5000.00"));
        verify(employeeRepository, times(1)).getAllActiveCompleteEmployee();
    }

    @Test
    void shouldCalculateDeductionsCorrectlyForPayroll() {
        String payrollDate = "01-01-2023";
        LocalDateTime startDate = LocalDateTime.of(2023, 1, 1, 0, 0);

        PayrollEmployeeResultSet resultSet = mock(PayrollEmployeeResultSet.class);
        when(resultSet.getId()).thenReturn(1);
        when(resultSet.getEmpId()).thenReturn("EMP001");
        when(resultSet.getEmpFirstName()).thenReturn("John");
        when(resultSet.getEmpLastName()).thenReturn("Doe");
        when(resultSet.getEmpCode()).thenReturn("EMP001");

        testEmployment.setDateOfJoining(LocalDateTime.of(2022, 1, 1, 0, 0));

        SalaryStructure earningsStructure = new SalaryStructure();
        earningsStructure.setId(1);

        SalaryStructure deductionStructure = new SalaryStructure();
        deductionStructure.setId(3);

        EmployeeSalaryComponentRelation earningComponent = new EmployeeSalaryComponentRelation();
        earningComponent.setSalaryStructure(earningsStructure);
        earningComponent.setMonthlyAmount(new BigDecimal("5000.00"));
        earningComponent.setNoOfDays(new BigDecimal("30"));

        EmployeeSalaryComponentRelation deductionComponent = new EmployeeSalaryComponentRelation();
        deductionComponent.setSalaryStructure(deductionStructure);
        deductionComponent.setMonthlyAmount(new BigDecimal("500.00"));
        deductionComponent.setNoOfDays(new BigDecimal("30"));

        when(dateFormatUtil.getDateStrAsLocalDateTime(payrollDate, CommonColumnConstants.DD_MM_YYYY))
                .thenReturn(startDate);
        when(employeeRepository.getAllActiveCompleteEmployee())
                .thenReturn(Collections.singletonList(resultSet));
        when(employmentService.findByPK(1)).thenReturn(testEmployment);
        when(EmpSalaryCompRelRepository.findByemployeeId("EMP001"))
                .thenReturn(Arrays.asList(earningComponent, deductionComponent));

        List<PayrollEmployeeDto> result = employeeService.getAllActiveCompleteEmployee(payrollDate);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getGrossPay()).isEqualByComparingTo(new BigDecimal("5000.00"));
        assertThat(result.get(0).getDeduction()).isEqualByComparingTo(new BigDecimal("500.00"));
        assertThat(result.get(0).getNetPay()).isEqualByComparingTo(new BigDecimal("4500.00"));
    }

    @Test
    void shouldExcludeEmployeesJoinedAfterPayrollDate() {
        String payrollDate = "01-01-2023";
        LocalDateTime startDate = LocalDateTime.of(2023, 1, 1, 0, 0);

        PayrollEmployeeResultSet resultSet = mock(PayrollEmployeeResultSet.class);
        when(resultSet.getId()).thenReturn(1);
        when(resultSet.getEmpId()).thenReturn("EMP001");
        when(resultSet.getEmpFirstName()).thenReturn("John");
        when(resultSet.getEmpLastName()).thenReturn("Doe");
        when(resultSet.getEmpCode()).thenReturn("EMP001");

        testEmployment.setDateOfJoining(LocalDateTime.of(2023, 2, 1, 0, 0));

        when(dateFormatUtil.getDateStrAsLocalDateTime(payrollDate, CommonColumnConstants.DD_MM_YYYY))
                .thenReturn(startDate);
        when(employeeRepository.getAllActiveCompleteEmployee())
                .thenReturn(Collections.singletonList(resultSet));
        when(employmentService.findByPK(1)).thenReturn(testEmployment);

        List<PayrollEmployeeDto> result = employeeService.getAllActiveCompleteEmployee(payrollDate);

        assertThat(result).isEmpty();
    }

    @Test
    void shouldIncludeEmployeesJoinedOnPayrollDate() {
        String payrollDate = "01-01-2023";
        LocalDateTime startDate = LocalDateTime.of(2023, 1, 1, 0, 0);

        PayrollEmployeeResultSet resultSet = mock(PayrollEmployeeResultSet.class);
        when(resultSet.getId()).thenReturn(1);
        when(resultSet.getEmpId()).thenReturn("EMP001");
        when(resultSet.getEmpFirstName()).thenReturn("John");
        when(resultSet.getEmpLastName()).thenReturn("Doe");
        when(resultSet.getEmpCode()).thenReturn("EMP001");

        testEmployment.setDateOfJoining(startDate);

        SalaryStructure salaryStructure = new SalaryStructure();
        salaryStructure.setId(1);

        EmployeeSalaryComponentRelation salaryComponent = new EmployeeSalaryComponentRelation();
        salaryComponent.setSalaryStructure(salaryStructure);
        salaryComponent.setMonthlyAmount(new BigDecimal("5000.00"));
        salaryComponent.setNoOfDays(new BigDecimal("30"));

        when(dateFormatUtil.getDateStrAsLocalDateTime(payrollDate, CommonColumnConstants.DD_MM_YYYY))
                .thenReturn(startDate);
        when(employeeRepository.getAllActiveCompleteEmployee())
                .thenReturn(Collections.singletonList(resultSet));
        when(employmentService.findByPK(1)).thenReturn(testEmployment);
        when(EmpSalaryCompRelRepository.findByemployeeId("EMP001"))
                .thenReturn(Collections.singletonList(salaryComponent));

        List<PayrollEmployeeDto> result = employeeService.getAllActiveCompleteEmployee(payrollDate);

        assertThat(result).hasSize(1);
    }

    @Test
    void shouldReturnEmptyListWhenNoActiveEmployees() {
        String payrollDate = "01-01-2023";
        LocalDateTime startDate = LocalDateTime.of(2023, 1, 1, 0, 0);

        when(dateFormatUtil.getDateStrAsLocalDateTime(payrollDate, CommonColumnConstants.DD_MM_YYYY))
                .thenReturn(startDate);
        when(employeeRepository.getAllActiveCompleteEmployee()).thenReturn(Collections.emptyList());

        List<PayrollEmployeeDto> result = employeeService.getAllActiveCompleteEmployee(payrollDate);

        assertThat(result).isEmpty();
    }

    @Test
    void shouldHandleNullPayrollEmployeeResultSet() {
        String payrollDate = "01-01-2023";
        LocalDateTime startDate = LocalDateTime.of(2023, 1, 1, 0, 0);

        when(dateFormatUtil.getDateStrAsLocalDateTime(payrollDate, CommonColumnConstants.DD_MM_YYYY))
                .thenReturn(startDate);
        when(employeeRepository.getAllActiveCompleteEmployee()).thenReturn(null);

        List<PayrollEmployeeDto> result = employeeService.getAllActiveCompleteEmployee(payrollDate);

        assertThat(result).isEmpty();
    }

    @Test
    void shouldHandleNullSalaryComponentRelations() {
        String payrollDate = "01-01-2023";
        LocalDateTime startDate = LocalDateTime.of(2023, 1, 1, 0, 0);

        PayrollEmployeeResultSet resultSet = mock(PayrollEmployeeResultSet.class);
        when(resultSet.getId()).thenReturn(1);
        when(resultSet.getEmpId()).thenReturn("EMP001");
        when(resultSet.getEmpFirstName()).thenReturn("John");
        when(resultSet.getEmpLastName()).thenReturn("Doe");
        when(resultSet.getEmpCode()).thenReturn("EMP001");

        testEmployment.setDateOfJoining(LocalDateTime.of(2022, 1, 1, 0, 0));

        when(dateFormatUtil.getDateStrAsLocalDateTime(payrollDate, CommonColumnConstants.DD_MM_YYYY))
                .thenReturn(startDate);
        when(employeeRepository.getAllActiveCompleteEmployee())
                .thenReturn(Collections.singletonList(resultSet));
        when(employmentService.findByPK(1)).thenReturn(testEmployment);
        when(EmpSalaryCompRelRepository.findByemployeeId("EMP001")).thenReturn(null);

        List<PayrollEmployeeDto> result = employeeService.getAllActiveCompleteEmployee(payrollDate);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getGrossPay()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.get(0).getDeduction()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.get(0).getNetPay()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void shouldCalculateMultipleSalaryComponentsCorrectly() {
        String payrollDate = "01-01-2023";
        LocalDateTime startDate = LocalDateTime.of(2023, 1, 1, 0, 0);

        PayrollEmployeeResultSet resultSet = mock(PayrollEmployeeResultSet.class);
        when(resultSet.getId()).thenReturn(1);
        when(resultSet.getEmpId()).thenReturn("EMP001");
        when(resultSet.getEmpFirstName()).thenReturn("John");
        when(resultSet.getEmpLastName()).thenReturn("Doe");
        when(resultSet.getEmpCode()).thenReturn("EMP001");

        testEmployment.setDateOfJoining(LocalDateTime.of(2022, 1, 1, 0, 0));

        SalaryStructure earningsStructure = new SalaryStructure();
        earningsStructure.setId(1);

        EmployeeSalaryComponentRelation basicSalary = new EmployeeSalaryComponentRelation();
        basicSalary.setSalaryStructure(earningsStructure);
        basicSalary.setMonthlyAmount(new BigDecimal("3000.00"));
        basicSalary.setNoOfDays(new BigDecimal("30"));

        EmployeeSalaryComponentRelation allowance = new EmployeeSalaryComponentRelation();
        allowance.setSalaryStructure(earningsStructure);
        allowance.setMonthlyAmount(new BigDecimal("2000.00"));
        allowance.setNoOfDays(new BigDecimal("30"));

        when(dateFormatUtil.getDateStrAsLocalDateTime(payrollDate, CommonColumnConstants.DD_MM_YYYY))
                .thenReturn(startDate);
        when(employeeRepository.getAllActiveCompleteEmployee())
                .thenReturn(Collections.singletonList(resultSet));
        when(employmentService.findByPK(1)).thenReturn(testEmployment);
        when(EmpSalaryCompRelRepository.findByemployeeId("EMP001"))
                .thenReturn(Arrays.asList(basicSalary, allowance));

        List<PayrollEmployeeDto> result = employeeService.getAllActiveCompleteEmployee(payrollDate);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getGrossPay()).isEqualByComparingTo(new BigDecimal("5000.00"));
    }

    // Test sendInvitationMail
    @Test
    void shouldSendInvitationMailSuccessfully() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        Resource resource = mock(Resource.class);
        Path tempFile = Files.createTempFile("test", ".html");
        Files.write(tempFile, "<html>Test Template</html>".getBytes());

        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.getURI()).thenReturn(tempFile.toUri());
        when(emailSender.invitationmailBody).thenReturn(
                "Dear {name}, Welcome to SimpleAccounts. Company Logo: {companylogo}");
        doNothing().when(emailSender).send(anyString(), anyString(), anyString(), anyString(), anyString(), eq(true));

        boolean result = employeeService.sendInvitationMail(testEmployee, request);

        assertThat(result).isTrue();
        verify(emailSender, times(1)).send(
                eq("john.doe@example.com"),
                eq("Welcome To SimpleAccounts"),
                anyString(),
                anyString(),
                anyString(),
                eq(true)
        );

        Files.deleteIfExists(tempFile);
    }

    @Test
    void shouldReturnFalseWhenEmailSendingFails() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        Resource resource = mock(Resource.class);
        Path tempFile = Files.createTempFile("test", ".html");
        Files.write(tempFile, "<html>Test Template</html>".getBytes());

        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.getURI()).thenReturn(tempFile.toUri());
        when(emailSender.invitationmailBody).thenReturn(
                "Dear {name}, Welcome to SimpleAccounts. Company Logo: {companylogo}");
        when(emailSender.send(anyString(), anyString(), anyString(), anyString(), anyString(), eq(true)))
                .thenThrow(new MessagingException("Email send failed"));

        boolean result = employeeService.sendInvitationMail(testEmployee, request);

        assertThat(result).isFalse();

        Files.deleteIfExists(tempFile);
    }

    @Test
    void shouldHandleCompanyWithoutLogoInInvitationMail() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        Resource resource = mock(Resource.class);
        Path tempFile = Files.createTempFile("test", ".html");
        Files.write(tempFile, "<html>Test Template</html>".getBytes());

        testCompany.setCompanyLogo(null);

        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.getURI()).thenReturn(tempFile.toUri());
        when(emailSender.invitationmailBody).thenReturn(
                "Dear {name}, Welcome to SimpleAccounts. Company Logo: {companylogo}");
        doNothing().when(emailSender).send(anyString(), anyString(), anyString(), anyString(), anyString(), eq(true));

        boolean result = employeeService.sendInvitationMail(testEmployee, request);

        assertThat(result).isTrue();
        ArgumentCaptor<String> bodyCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailSender).send(anyString(), anyString(), bodyCaptor.capture(), anyString(), anyString(), eq(true));
        assertThat(bodyCaptor.getValue()).contains("John Doe");

        Files.deleteIfExists(tempFile);
    }

    @Test
    void shouldHandleUserWithoutCompanyInInvitationMail() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        Resource resource = mock(Resource.class);
        Path tempFile = Files.createTempFile("test", ".html");
        Files.write(tempFile, "<html>Test Template</html>".getBytes());

        testUser.setCompany(null);

        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.getURI()).thenReturn(tempFile.toUri());
        when(emailSender.invitationmailBody).thenReturn(
                "Dear {name}, Welcome to SimpleAccounts. Company Logo: {companylogo}");
        doNothing().when(emailSender).send(anyString(), anyString(), anyString(), anyString(), anyString(), eq(true));

        boolean result = employeeService.sendInvitationMail(testEmployee, request);

        assertThat(result).isTrue();

        Files.deleteIfExists(tempFile);
    }

    @Test
    void shouldReplaceEmployeeNameInEmailBody() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        Resource resource = mock(Resource.class);
        Path tempFile = Files.createTempFile("test", ".html");
        Files.write(tempFile, "<html>Test Template</html>".getBytes());

        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(resourceLoader.getResource(anyString())).thenReturn(resource);
        when(resource.getURI()).thenReturn(tempFile.toUri());
        when(emailSender.invitationmailBody).thenReturn("Hello {name}");
        doNothing().when(emailSender).send(anyString(), anyString(), anyString(), anyString(), anyString(), eq(true));

        boolean result = employeeService.sendInvitationMail(testEmployee, request);

        assertThat(result).isTrue();
        ArgumentCaptor<String> bodyCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailSender).send(anyString(), anyString(), bodyCaptor.capture(), anyString(), anyString(), eq(true));
        assertThat(bodyCaptor.getValue()).contains("John Doe");
        assertThat(bodyCaptor.getValue()).doesNotContain("{name}");

        Files.deleteIfExists(tempFile);
    }

    // Test inherited getDao method
    @Test
    void shouldReturnEmployeeDaoFromGetDao() {
        assertThat(employeeService.getDao()).isEqualTo(employeeDao);
    }

    // Additional edge case tests
    @Test
    void shouldHandleMultipleEmployeesInPayroll() {
        String payrollDate = "01-01-2023";
        LocalDateTime startDate = LocalDateTime.of(2023, 1, 1, 0, 0);

        PayrollEmployeeResultSet resultSet1 = mock(PayrollEmployeeResultSet.class);
        when(resultSet1.getId()).thenReturn(1);
        when(resultSet1.getEmpId()).thenReturn("EMP001");
        when(resultSet1.getEmpFirstName()).thenReturn("John");
        when(resultSet1.getEmpLastName()).thenReturn("Doe");
        when(resultSet1.getEmpCode()).thenReturn("EMP001");

        PayrollEmployeeResultSet resultSet2 = mock(PayrollEmployeeResultSet.class);
        when(resultSet2.getId()).thenReturn(2);
        when(resultSet2.getEmpId()).thenReturn("EMP002");
        when(resultSet2.getEmpFirstName()).thenReturn("Jane");
        when(resultSet2.getEmpLastName()).thenReturn("Smith");
        when(resultSet2.getEmpCode()).thenReturn("EMP002");

        Employment employment1 = new Employment();
        employment1.setId(1);
        employment1.setDateOfJoining(LocalDateTime.of(2022, 1, 1, 0, 0));

        Employment employment2 = new Employment();
        employment2.setId(2);
        employment2.setDateOfJoining(LocalDateTime.of(2022, 6, 1, 0, 0));

        SalaryStructure salaryStructure = new SalaryStructure();
        salaryStructure.setId(1);

        EmployeeSalaryComponentRelation salary1 = new EmployeeSalaryComponentRelation();
        salary1.setSalaryStructure(salaryStructure);
        salary1.setMonthlyAmount(new BigDecimal("5000.00"));
        salary1.setNoOfDays(new BigDecimal("30"));

        EmployeeSalaryComponentRelation salary2 = new EmployeeSalaryComponentRelation();
        salary2.setSalaryStructure(salaryStructure);
        salary2.setMonthlyAmount(new BigDecimal("6000.00"));
        salary2.setNoOfDays(new BigDecimal("30"));

        when(dateFormatUtil.getDateStrAsLocalDateTime(payrollDate, CommonColumnConstants.DD_MM_YYYY))
                .thenReturn(startDate);
        when(employeeRepository.getAllActiveCompleteEmployee())
                .thenReturn(Arrays.asList(resultSet1, resultSet2));
        when(employmentService.findByPK(1)).thenReturn(employment1);
        when(employmentService.findByPK(2)).thenReturn(employment2);
        when(EmpSalaryCompRelRepository.findByemployeeId("EMP001"))
                .thenReturn(Collections.singletonList(salary1));
        when(EmpSalaryCompRelRepository.findByemployeeId("EMP002"))
                .thenReturn(Collections.singletonList(salary2));

        List<PayrollEmployeeDto> result = employeeService.getAllActiveCompleteEmployee(payrollDate);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getEmpCode()).isEqualTo("EMP001");
        assertThat(result.get(1).getEmpCode()).isEqualTo("EMP002");
    }

    @Test
    void shouldSetCorrectLopDayAndNoOfDaysInPayroll() {
        String payrollDate = "01-01-2023";
        LocalDateTime startDate = LocalDateTime.of(2023, 1, 1, 0, 0);

        PayrollEmployeeResultSet resultSet = mock(PayrollEmployeeResultSet.class);
        when(resultSet.getId()).thenReturn(1);
        when(resultSet.getEmpId()).thenReturn("EMP001");
        when(resultSet.getEmpFirstName()).thenReturn("John");
        when(resultSet.getEmpLastName()).thenReturn("Doe");
        when(resultSet.getEmpCode()).thenReturn("EMP001");

        testEmployment.setDateOfJoining(LocalDateTime.of(2022, 1, 1, 0, 0));

        SalaryStructure salaryStructure = new SalaryStructure();
        salaryStructure.setId(1);

        EmployeeSalaryComponentRelation salaryComponent = new EmployeeSalaryComponentRelation();
        salaryComponent.setSalaryStructure(salaryStructure);
        salaryComponent.setMonthlyAmount(new BigDecimal("5000.00"));
        salaryComponent.setNoOfDays(new BigDecimal("26"));

        when(dateFormatUtil.getDateStrAsLocalDateTime(payrollDate, CommonColumnConstants.DD_MM_YYYY))
                .thenReturn(startDate);
        when(employeeRepository.getAllActiveCompleteEmployee())
                .thenReturn(Collections.singletonList(resultSet));
        when(employmentService.findByPK(1)).thenReturn(testEmployment);
        when(EmpSalaryCompRelRepository.findByemployeeId("EMP001"))
                .thenReturn(Collections.singletonList(salaryComponent));

        List<PayrollEmployeeDto> result = employeeService.getAllActiveCompleteEmployee(payrollDate);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getLopDay()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.get(0).getNoOfDays()).isEqualByComparingTo(new BigDecimal("26"));
    }
}
