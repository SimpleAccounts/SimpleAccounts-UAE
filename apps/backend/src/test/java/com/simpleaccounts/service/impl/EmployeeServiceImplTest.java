package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.core.io.ResourceLoader;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("EmployeeServiceImpl Unit Tests")
class EmployeeServiceImplTest {

    @Mock
    private EmployeeDao employeeDao;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private EmployeeSalaryComponentRelationRepository empSalaryCompRelRepository;

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

    @Mock
    private HttpServletRequest httpServletRequest;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private Employee testEmployee;
    private User testUser;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(employeeService, "dao", employeeDao);
        testEmployee = createTestEmployee(1, "John", "Doe", "john@test.com");
        testUser = createTestUser(1, "Admin", "User", "admin@test.com");
    }

    @Test
    @DisplayName("Should return employees for dropdown when employees exist")
    void getEmployeesForDropdownReturnsDropdownModels() {
        List<DropdownModel> expectedList = Arrays.asList(
            new DropdownModel(1, "John Doe"),
            new DropdownModel(2, "Jane Smith")
        );

        when(employeeDao.getEmployeesForDropdown()).thenReturn(expectedList);

        List<DropdownModel> result = employeeService.getEmployeesForDropdown();

        assertThat(result).isNotNull().hasSize(2);
        assertThat(result.get(0).getLabel()).isEqualTo("John Doe");
        verify(employeeDao).getEmployeesForDropdown();
    }

    @Test
    @DisplayName("Should return empty list when no employees exist for dropdown")
    void getEmployeesForDropdownReturnsEmptyList() {
        when(employeeDao.getEmployeesForDropdown()).thenReturn(Collections.emptyList());

        List<DropdownModel> result = employeeService.getEmployeesForDropdown();

        assertThat(result).isNotNull().isEmpty();
        verify(employeeDao).getEmployeesForDropdown();
    }

    @Test
    @DisplayName("Should return employees not in user for dropdown")
    void getEmployeesNotInUserForDropdownReturnsResults() {
        List<DropdownObjectModel> expectedList = Arrays.asList(
            new DropdownObjectModel(1, "John Doe"),
            new DropdownObjectModel(2, "Jane Smith")
        );

        when(employeeDao.getEmployeesNotInUserForDropdown()).thenReturn(expectedList);

        List<DropdownObjectModel> result = employeeService.getEmployeesNotInUserForDropdown();

        assertThat(result).isNotNull().hasSize(2);
        verify(employeeDao).getEmployeesNotInUserForDropdown();
    }

    @Test
    @DisplayName("Should return paginated employees")
    void getEmployeesReturnsPaginatedEmployees() {
        Integer pageNo = 0;
        Integer pageSize = 10;
        List<Employee> employees = Arrays.asList(testEmployee);

        when(employeeDao.getEmployees(pageNo, pageSize)).thenReturn(employees);

        List<Employee> result = employeeService.getEmployees(pageNo, pageSize);

        assertThat(result).isNotNull().hasSize(1);
        assertThat(result.get(0).getFirstName()).isEqualTo("John");
        verify(employeeDao).getEmployees(pageNo, pageSize);
    }

    @Test
    @DisplayName("Should return employees by search query with pagination")
    void getEmployeesReturnsEmployeesBySearchQuery() {
        String searchQuery = "John";
        Integer pageNo = 0;
        Integer pageSize = 10;
        List<Employee> employees = Arrays.asList(testEmployee);

        when(employeeDao.getEmployees(searchQuery, pageNo, pageSize)).thenReturn(employees);

        List<Employee> result = employeeService.getEmployees(searchQuery, pageNo, pageSize);

        assertThat(result).isNotNull().hasSize(1);
        verify(employeeDao).getEmployees(searchQuery, pageNo, pageSize);
    }

    @Test
    @DisplayName("Should return employee by email when exists")
    void getEmployeeByEmailReturnsEmployeeWhenExists() {
        String email = "john@test.com";
        when(employeeDao.getEmployeeByEmail(email)).thenReturn(Optional.of(testEmployee));

        Optional<Employee> result = employeeService.getEmployeeByEmail(email);

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo(email);
        verify(employeeDao).getEmployeeByEmail(email);
    }

    @Test
    @DisplayName("Should return empty optional when employee not found by email")
    void getEmployeeByEmailReturnsEmptyWhenNotFound() {
        String email = "notfound@test.com";
        when(employeeDao.getEmployeeByEmail(email)).thenReturn(Optional.empty());

        Optional<Employee> result = employeeService.getEmployeeByEmail(email);

        assertThat(result).isEmpty();
        verify(employeeDao).getEmployeeByEmail(email);
    }

    @Test
    @DisplayName("Should return employee list with filters and pagination")
    void getEmployeeListReturnsFilteredList() {
        Map<EmployeeFilterEnum, Object> filterMap = new EnumMap<>(EmployeeFilterEnum.class);
        filterMap.put(EmployeeFilterEnum.DELETE_FLAG, false);

        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);

        PaginationResponseModel expectedResponse = new PaginationResponseModel(1, Arrays.asList(testEmployee));

        when(employeeDao.getEmployeeList(filterMap, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = employeeService.getEmployeeList(filterMap, paginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(1);
        verify(employeeDao).getEmployeeList(filterMap, paginationModel);
    }

    @Test
    @DisplayName("Should delete employees by IDs")
    void deleteByIdsDeletesEmployees() {
        ArrayList<Integer> ids = new ArrayList<>(Arrays.asList(1, 2, 3));

        doNothing().when(employeeDao).deleteByIds(ids);

        employeeService.deleteByIds(ids);

        verify(employeeDao).deleteByIds(ids);
    }

    @Test
    @DisplayName("Should handle empty list when deleting by IDs")
    void deleteByIdsHandlesEmptyList() {
        ArrayList<Integer> emptyIds = new ArrayList<>();

        doNothing().when(employeeDao).deleteByIds(emptyIds);

        employeeService.deleteByIds(emptyIds);

        verify(employeeDao).deleteByIds(emptyIds);
    }

    @Test
    @DisplayName("Should return active complete employees for payroll")
    void getAllActiveCompleteEmployeeReturnsEmployeesForPayroll() {
        String payrollDate = "01-12-2024";
        LocalDateTime startDate = LocalDateTime.of(2024, 12, 1, 0, 0);

        PayrollEmployeeResultSet resultSet = createPayrollEmployeeResultSet(1, 1, "John", "Doe", "EMP001");
        List<PayrollEmployeeResultSet> resultSets = Arrays.asList(resultSet);

        Employment employment = createEmployment(1, LocalDateTime.of(2024, 1, 1, 0, 0));

        EmployeeSalaryComponentRelation salaryRelation = createSalaryComponentRelation(1, BigDecimal.valueOf(5000), 1);
        List<EmployeeSalaryComponentRelation> salaryRelations = Arrays.asList(salaryRelation);

        when(dateFormatUtil.getDateStrAsLocalDateTime(anyString(), anyString())).thenReturn(startDate);
        when(employeeRepository.getAllActiveCompleteEmployee()).thenReturn(resultSets);
        when(employmentService.findByPK(anyInt())).thenReturn(employment);
        when(empSalaryCompRelRepository.findByemployeeId(anyInt())).thenReturn(salaryRelations);

        List<PayrollEmployeeDto> result = employeeService.getAllActiveCompleteEmployee(payrollDate);

        assertThat(result).isNotNull().hasSize(1);
        assertThat(result.get(0).getEmpName()).isEqualTo("John Doe");
        assertThat(result.get(0).getGrossPay()).isEqualTo(BigDecimal.valueOf(5000));
    }

    @Test
    @DisplayName("Should return empty list when no active employees for payroll")
    void getAllActiveCompleteEmployeeReturnsEmptyWhenNoEmployees() {
        String payrollDate = "01-12-2024";
        LocalDateTime startDate = LocalDateTime.of(2024, 12, 1, 0, 0);

        when(dateFormatUtil.getDateStrAsLocalDateTime(anyString(), anyString())).thenReturn(startDate);
        when(employeeRepository.getAllActiveCompleteEmployee()).thenReturn(null);

        List<PayrollEmployeeDto> result = employeeService.getAllActiveCompleteEmployee(payrollDate);

        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should filter employees by joining date for payroll")
    void getAllActiveCompleteEmployeeFiltersEmployeesByJoiningDate() {
        String payrollDate = "01-06-2024";
        LocalDateTime startDate = LocalDateTime.of(2024, 6, 1, 0, 0);

        PayrollEmployeeResultSet resultSet = createPayrollEmployeeResultSet(1, 1, "John", "Doe", "EMP001");
        List<PayrollEmployeeResultSet> resultSets = Arrays.asList(resultSet);

        // Employee joined after payroll date - should be filtered out
        Employment employment = createEmployment(1, LocalDateTime.of(2024, 7, 1, 0, 0));

        when(dateFormatUtil.getDateStrAsLocalDateTime(anyString(), anyString())).thenReturn(startDate);
        when(employeeRepository.getAllActiveCompleteEmployee()).thenReturn(resultSets);
        when(employmentService.findByPK(anyInt())).thenReturn(employment);

        List<PayrollEmployeeDto> result = employeeService.getAllActiveCompleteEmployee(payrollDate);

        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should calculate deductions correctly for payroll")
    void getAllActiveCompleteEmployeeCalculatesDeductionsCorrectly() {
        String payrollDate = "01-12-2024";
        LocalDateTime startDate = LocalDateTime.of(2024, 12, 1, 0, 0);

        PayrollEmployeeResultSet resultSet = createPayrollEmployeeResultSet(1, 1, "John", "Doe", "EMP001");
        List<PayrollEmployeeResultSet> resultSets = Arrays.asList(resultSet);

        Employment employment = createEmployment(1, LocalDateTime.of(2024, 1, 1, 0, 0));

        // Create earnings and deductions
        EmployeeSalaryComponentRelation earning = createSalaryComponentRelation(1, BigDecimal.valueOf(5000), 1);
        EmployeeSalaryComponentRelation deduction = createSalaryComponentRelation(2, BigDecimal.valueOf(500), 3); // 3 = deduction
        List<EmployeeSalaryComponentRelation> salaryRelations = Arrays.asList(earning, deduction);

        when(dateFormatUtil.getDateStrAsLocalDateTime(anyString(), anyString())).thenReturn(startDate);
        when(employeeRepository.getAllActiveCompleteEmployee()).thenReturn(resultSets);
        when(employmentService.findByPK(anyInt())).thenReturn(employment);
        when(empSalaryCompRelRepository.findByemployeeId(anyInt())).thenReturn(salaryRelations);

        List<PayrollEmployeeDto> result = employeeService.getAllActiveCompleteEmployee(payrollDate);

        assertThat(result).isNotNull().hasSize(1);
        assertThat(result.get(0).getGrossPay()).isEqualTo(BigDecimal.valueOf(5000));
        assertThat(result.get(0).getDeduction()).isEqualTo(BigDecimal.valueOf(500));
        assertThat(result.get(0).getNetPay()).isEqualTo(BigDecimal.valueOf(4500));
    }

    @Test
    @DisplayName("Should return DAO instance")
    void getDaoReturnsEmployeeDao() {
        assertThat(employeeService.getEmployeesForDropdown()).isNotNull();
        verify(employeeDao).getEmployeesForDropdown();
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
        Company company = new Company();
        company.setCompanyId(1);
        company.setCompanyName("Test Company");
        user.setCompany(company);
        return user;
    }

    private PayrollEmployeeResultSet createPayrollEmployeeResultSet(Integer id, Integer empId, String firstName, String lastName, String empCode) {
        return new PayrollEmployeeResultSet() {
            @Override
            public Integer getId() {
                return id;
            }

            @Override
            public Integer getEmpId() {
                return empId;
            }

            @Override
            public String getEmpFirstName() {
                return firstName;
            }

            @Override
            public String getEmpLastName() {
                return lastName;
            }

            @Override
            public String getEmpCode() {
                return empCode;
            }
        };
    }

    private Employment createEmployment(Integer id, LocalDateTime dateOfJoining) {
        Employment employment = new Employment();
        employment.setId(id);
        employment.setDateOfJoining(dateOfJoining);
        employment.setDeleteFlag(false);
        return employment;
    }

    private EmployeeSalaryComponentRelation createSalaryComponentRelation(Integer id, BigDecimal monthlyAmount, Integer structureId) {
        EmployeeSalaryComponentRelation relation = new EmployeeSalaryComponentRelation();
        relation.setId(id);
        relation.setMonthlyAmount(monthlyAmount);
        relation.setNoOfDays(BigDecimal.valueOf(30));

        SalaryStructure structure = new SalaryStructure();
        structure.setId(structureId);
        relation.setSalaryStructure(structure);

        return relation;
    }
}
