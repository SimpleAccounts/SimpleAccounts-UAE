package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.EmployeeFilterEnum;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeUserRelation;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Path;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("EmployeeDaoImpl Unit Tests")
class EmployeeDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<Employee> employeeTypedQuery;

    @Mock
    private TypedQuery<EmployeeUserRelation> employeeUserRelationTypedQuery;
    
    @Mock
    private TypedQuery<Long> countTypedQuery;

    @Mock
    private Query query;

    @Mock private CriteriaBuilder criteriaBuilder;
    @Mock private CriteriaQuery<Employee> criteriaQuery;
    @Mock private CriteriaQuery<Long> countCriteriaQuery;
    @Mock private Root<Employee> root;
    @Mock private Predicate predicate;
    @Mock private Path<Object> path;

    @Mock
    private DatatableSortingFilterConstant dataTableUtil;

    @InjectMocks
    private EmployeeDaoImpl employeeDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(employeeDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(employeeDao, "entityClass", Employee.class);
        
        when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
        when(criteriaBuilder.createQuery(Employee.class)).thenReturn(criteriaQuery);
        when(criteriaBuilder.createQuery(Long.class)).thenReturn(countCriteriaQuery);
        when(criteriaQuery.from(Employee.class)).thenReturn(root);
        when(countCriteriaQuery.from(Employee.class)).thenReturn(root);
        when(entityManager.createQuery(criteriaQuery)).thenReturn(employeeTypedQuery);
        when(entityManager.createQuery(countCriteriaQuery)).thenReturn(countTypedQuery);
        when(root.get(anyString())).thenReturn(path);
        when(criteriaBuilder.equal(any(), any())).thenReturn(predicate);
        
        // Default count
        when(countTypedQuery.getSingleResult()).thenReturn(0L);
    }

    @Test
    @DisplayName("Should return employees for dropdown when employees exist")
    void getEmployeesForDropdownReturnsDropdownModels() {
        List<Employee> employees = createEmployeeList(3);
        String expectedQuery = "SELECT e FROM Employee e WHERE e.isActive = true and e.deleteFlag = false";

        when(entityManager.createQuery(expectedQuery, Employee.class)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.getResultList()).thenReturn(employees);

        List<DropdownModel> result = employeeDao.getEmployeesForDropdown();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getLabel()).contains("John");
    }

    @Test
    @DisplayName("Should return empty list when no active employees")
    void getEmployeesForDropdownReturnsEmptyListWhenNoEmployees() {
        String expectedQuery = "SELECT e FROM Employee e WHERE e.isActive = true and e.deleteFlag = false";

        when(entityManager.createQuery(expectedQuery, Employee.class)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.getResultList()).thenReturn(new ArrayList<>());

        List<DropdownModel> result = employeeDao.getEmployeesForDropdown();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should concatenate first and last name for dropdown label")
    void getEmployeesForDropdownConcatenatesNames() {
        Employee employee = createEmployee(1, "John", "Doe", true, false);
        String expectedQuery = "SELECT e FROM Employee e WHERE e.isActive = true and e.deleteFlag = false";

        when(entityManager.createQuery(expectedQuery, Employee.class)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.getResultList()).thenReturn(Collections.singletonList(employee));

        List<DropdownModel> result = employeeDao.getEmployeesForDropdown();

        assertThat(result.get(0).getLabel()).isEqualTo("John Doe");
    }

    @Test
    @DisplayName("Should return employees not in user for dropdown")
    void getEmployeesNotInUserForDropdownReturnsActiveEmployeesWithoutUsers() {
        List<Employee> allEmployees = Arrays.asList(
            createEmployee(1, "John", "Doe", true, false),
            createEmployee(2, "Jane", "Smith", true, false),
            createEmployee(3, "Bob", "Johnson", false, false)
        );

        when(entityManager.createQuery("SELECT e FROM Employee e WHERE e.deleteFlag = false", Employee.class)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.getResultList()).thenReturn(allEmployees);

        when(entityManager.createQuery("SELECT er FROM EmployeeUserRelation er ", EmployeeUserRelation.class)).thenReturn(employeeUserRelationTypedQuery);
        when(employeeUserRelationTypedQuery.getResultList()).thenReturn(new ArrayList<>());

        List<DropdownObjectModel> result = employeeDao.getEmployeesNotInUserForDropdown();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2); 
    }

    @Test
    @DisplayName("Should exclude inactive employees from not in user dropdown")
    void getEmployeesNotInUserForDropdownExcludesInactiveEmployees() {
        List<Employee> allEmployees = Arrays.asList(
            createEmployee(1, "John", "Doe", false, false),
            createEmployee(2, "Jane", "Smith", null, false)
        );

        when(entityManager.createQuery("SELECT e FROM Employee e WHERE e.deleteFlag = false", Employee.class)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.getResultList()).thenReturn(allEmployees);

        when(entityManager.createQuery("SELECT er FROM EmployeeUserRelation er ", EmployeeUserRelation.class)).thenReturn(employeeUserRelationTypedQuery);
        when(employeeUserRelationTypedQuery.getResultList()).thenReturn(new ArrayList<>());

        List<DropdownObjectModel> result = employeeDao.getEmployeesNotInUserForDropdown();

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return employees by search query with pagination")
    void getEmployeesReturnsEmployeesBySearchQuery() {
        String searchQuery = "John";
        Integer pageNo = 0;
        Integer pageSize = 10;
        List<Employee> employees = createEmployeeList(5);

        when(entityManager.createNamedQuery("employeesByName", Employee.class)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setParameter("name", "%" + searchQuery + "%")).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setMaxResults(pageSize)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setFirstResult(pageNo * pageSize)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.getResultList()).thenReturn(employees);

        List<Employee> result = employeeDao.getEmployees(searchQuery, pageNo, pageSize);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
    }

    @Test
    @DisplayName("Should set correct pagination parameters for search")
    void getEmployeesSetsCorrectPaginationParameters() {
        String searchQuery = "Test";
        Integer pageNo = 2;
        Integer pageSize = 20;

        when(entityManager.createNamedQuery("employeesByName", Employee.class)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setParameter(anyString(), any())).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setMaxResults(pageSize)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setFirstResult(40)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.getResultList()).thenReturn(new ArrayList<>());

        employeeDao.getEmployees(searchQuery, pageNo, pageSize);

        verify(employeeTypedQuery).setFirstResult(40);
        verify(employeeTypedQuery).setMaxResults(20);
    }

    @Test
    @DisplayName("Should return all employees with pagination without search")
    void getEmployeesReturnsAllEmployeesWithPagination() {
        Integer pageNo = 0;
        Integer pageSize = 10;
        List<Employee> employees = createEmployeeList(10);

        when(entityManager.createNamedQuery("allEmployees", Employee.class)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setMaxResults(pageSize)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setFirstResult(0)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.getResultList()).thenReturn(employees);

        List<Employee> result = employeeDao.getEmployees(pageNo, pageSize);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(10);
    }

    @Test
    @DisplayName("Should return employee by email when exists")
    void getEmployeeByEmailReturnsEmployeeWhenExists() {
        String email = "john@example.com";
        Employee employee = createEmployee(1, "John", "Doe", true, false);
        employee.setEmail(email);

        when(entityManager.createNamedQuery("employeeByEmail", Employee.class)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setParameter("email", email)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.getResultList()).thenReturn(Collections.singletonList(employee));

        Optional<Employee> result = employeeDao.getEmployeeByEmail(email);

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo(email);
    }

    @Test
    @DisplayName("Should return empty optional when email not found")
    void getEmployeeByEmailReturnsEmptyWhenNotFound() {
        String email = "notfound@example.com";

        when(entityManager.createNamedQuery("employeeByEmail", Employee.class)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setParameter("email", email)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.getResultList()).thenReturn(new ArrayList<>());

        Optional<Employee> result = employeeDao.getEmployeeByEmail(email);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return empty optional when multiple employees found")
    void getEmployeeByEmailReturnsEmptyWhenMultipleFound() {
        String email = "duplicate@example.com";
        List<Employee> employees = createEmployeeList(2);

        when(entityManager.createNamedQuery("employeeByEmail", Employee.class)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setParameter("email", email)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.getResultList()).thenReturn(employees);

        Optional<Employee> result = employeeDao.getEmployeeByEmail(email);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return employee list with filters and pagination")
    void getEmployeeListReturnsListWithFiltersAndPagination() {
        Map<EmployeeFilterEnum, Object> filterMap = new EnumMap<>(EmployeeFilterEnum.class);
        filterMap.put(EmployeeFilterEnum.DELETE_FLAG, false);

        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("firstName");
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);

        List<Employee> employees = createEmployeeList(5);

        when(dataTableUtil.getColName(anyString(), any())).thenReturn("firstName");
        when(employeeTypedQuery.getResultList()).thenReturn(employees);
        when(countTypedQuery.getSingleResult()).thenReturn(5L);

        PaginationResponseModel result = employeeDao.getEmployeeList(filterMap, paginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getData()).isNotNull();
        assertThat(result.getCount()).isEqualTo(5);
    }

    @Test
    @DisplayName("Should soft delete employees by setting delete flag")
    void deleteByIdsSetsDeleteFlagOnEmployees() {
        List<Integer> ids = Arrays.asList(1, 2, 3);
        Employee employee1 = createEmployee(1, "John", "Doe", true, false);
        Employee employee2 = createEmployee(2, "Jane", "Smith", true, false);
        Employee employee3 = createEmployee(3, "Bob", "Johnson", true, false);

        when(entityManager.find(Employee.class, 1)).thenReturn(employee1);
        when(entityManager.find(Employee.class, 2)).thenReturn(employee2);
        when(entityManager.find(Employee.class, 3)).thenReturn(employee3);
        when(entityManager.merge(any(Employee.class))).thenAnswer(i -> i.getArguments()[0]);

        employeeDao.deleteByIds(ids);

        verify(entityManager, times(3)).merge(any(Employee.class));
        assertThat(employee1.getDeleteFlag()).isTrue();
        assertThat(employee2.getDeleteFlag()).isTrue();
        assertThat(employee3.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should not delete when IDs list is empty")
    void deleteByIdsDoesNotDeleteWhenListEmpty() {
        List<Integer> emptyIds = new ArrayList<>();
        employeeDao.deleteByIds(emptyIds);
        verify(entityManager, never()).find(any(), any());
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should not delete when IDs list is null")
    void deleteByIdsDoesNotDeleteWhenListNull() {
        employeeDao.deleteByIds(null);
        verify(entityManager, never()).find(any(), any());
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should delete single employee")
    void deleteByIdsDeletesSingleEmployee() {
        List<Integer> ids = Collections.singletonList(1);
        Employee employee = createEmployee(1, "Test", "User", true, false);

        when(entityManager.find(Employee.class, 1)).thenReturn(employee);
        when(entityManager.merge(any(Employee.class))).thenAnswer(i -> i.getArguments()[0]);

        employeeDao.deleteByIds(ids);

        verify(entityManager).merge(employee);
        assertThat(employee.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should handle large number of employees for dropdown")
    void getEmployeesForDropdownHandlesLargeList() {
        List<Employee> employees = createEmployeeList(100);
        String expectedQuery = "SELECT e FROM Employee e WHERE e.isActive = true and e.deleteFlag = false";

        when(entityManager.createQuery(expectedQuery, Employee.class)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.getResultList()).thenReturn(employees);

        List<DropdownModel> result = employeeDao.getEmployeesForDropdown();

        assertThat(result).hasSize(100);
    }

    @Test
    @DisplayName("Should return correct dropdown value and label")
    void getEmployeesForDropdownReturnsCorrectValueAndLabel() {
        Employee employee = createEmployee(5, "Test", "Employee", true, false);
        String expectedQuery = "SELECT e FROM Employee e WHERE e.isActive = true and e.deleteFlag = false";

        when(entityManager.createQuery(expectedQuery, Employee.class)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.getResultList()).thenReturn(Collections.singletonList(employee));

        List<DropdownModel> result = employeeDao.getEmployeesForDropdown();

        assertThat(result.get(0).getValue()).isEqualTo(5);
        assertThat(result.get(0).getLabel()).isEqualTo("Test Employee");
    }

    @Test
    @DisplayName("Should use correct named query for employees by name")
    void getEmployeesUsesCorrectNamedQuery() {
        when(entityManager.createNamedQuery("employeesByName", Employee.class)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setParameter(anyString(), any())).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setMaxResults(any(Integer.class))).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setFirstResult(any(Integer.class))).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.getResultList()).thenReturn(new ArrayList<>());

        employeeDao.getEmployees("test", 0, 10);

        verify(entityManager).createNamedQuery("employeesByName", Employee.class);
    }

    @Test
    @DisplayName("Should use correct named query for all employees")
    void getEmployeesWithoutSearchUsesCorrectNamedQuery() {
        when(entityManager.createNamedQuery("allEmployees", Employee.class)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setMaxResults(any(Integer.class))).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setFirstResult(any(Integer.class))).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.getResultList()).thenReturn(new ArrayList<>());

        employeeDao.getEmployees(0, 10);

        verify(entityManager).createNamedQuery("allEmployees", Employee.class);
    }

    @Test
    @DisplayName("Should wrap search query with percent signs")
    void getEmployeesWrapsSearchQueryWithPercent() {
        String searchQuery = "John";

        when(entityManager.createNamedQuery("employeesByName", Employee.class)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setParameter(anyString(), any())).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setMaxResults(any(Integer.class))).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setFirstResult(any(Integer.class))).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.getResultList()).thenReturn(new ArrayList<>());

        employeeDao.getEmployees(searchQuery, 0, 10);

        verify(employeeTypedQuery).setParameter("name", "%John%");
    }

    @Test
    @DisplayName("Should preserve employee data when deleting")
    void deleteByIdsPreservesEmployeeData() {
        Employee employee = createEmployee(1, "John", "Doe", true, false);
        employee.setEmail("john@example.com");

        when(entityManager.find(Employee.class, 1)).thenReturn(employee);
        when(entityManager.merge(any(Employee.class))).thenAnswer(i -> i.getArguments()[0]);

        employeeDao.deleteByIds(Collections.singletonList(1));

        assertThat(employee.getFirstName()).isEqualTo("John");
        assertThat(employee.getLastName()).isEqualTo("Doe");
        assertThat(employee.getEmail()).isEqualTo("john@example.com");
        assertThat(employee.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should handle null result list for employee by email")
    void getEmployeeByEmailHandlesNullResultList() {
        String email = "test@example.com";

        when(entityManager.createNamedQuery("employeeByEmail", Employee.class)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setParameter("email", email)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.getResultList()).thenReturn(null);

        Optional<Employee> result = employeeDao.getEmployeeByEmail(email);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should calculate correct offset for second page")
    void getEmployeesCalculatesCorrectOffsetForSecondPage() {
        Integer pageNo = 1;
        Integer pageSize = 10;

        when(entityManager.createNamedQuery("allEmployees", Employee.class)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setMaxResults(pageSize)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.setFirstResult(10)).thenReturn(employeeTypedQuery);
        when(employeeTypedQuery.getResultList()).thenReturn(new ArrayList<>());

        employeeDao.getEmployees(pageNo, pageSize);

        verify(employeeTypedQuery).setFirstResult(10);
    }

    private Employee createEmployee(int id, String firstName, String lastName,
                                    Boolean isActive, Boolean deleteFlag) {
        Employee employee = new Employee();
        employee.setId(id);
        employee.setFirstName(firstName);
        employee.setLastName(lastName);
        employee.setIsActive(isActive);
        employee.setDeleteFlag(deleteFlag);
        employee.setEmail(firstName.toLowerCase() + "@example.com");
        return employee;
    }

    private List<Employee> createEmployeeList(int count) {
        List<Employee> employees = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            employees.add(createEmployee(i + 1, "John" + i, "Doe" + i, true, false));
        }
        return employees;
    }
}
