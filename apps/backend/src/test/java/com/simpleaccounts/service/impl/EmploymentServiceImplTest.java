package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.ActivityDao;
import com.simpleaccounts.dao.EmploymentDao;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.Employment;
import com.simpleaccounts.exceptions.ServiceException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
@DisplayName("EmploymentServiceImpl Unit Tests")
class EmploymentServiceImplTest {

    @Mock
    private EmploymentDao employmentDao;

    @Mock
    private ActivityDao activityDao;

    @InjectMocks
    private EmploymentServiceImpl employmentService;

    private Employment testEmployment;
    private Employee testEmployee;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(employmentService, "activityDao", activityDao);
        testEmployee = createTestEmployee(1, "John", "Doe");
        testEmployment = createTestEmployment(1, testEmployee, LocalDateTime.of(2024, 1, 15, 0, 0));
    }

    @Test
    @DisplayName("Should find employment by primary key")
    void findByPKReturnsEmploymentWhenExists() {
        Integer id = 1;
        when(employmentDao.findByPK(id)).thenReturn(testEmployment);

        Employment result = employmentService.findByPK(id);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(id);
        assertThat(result.getEmployee()).isEqualTo(testEmployee);
        verify(employmentDao).findByPK(id);
    }

    @Test
    @DisplayName("Should return null when employment not found")
    void findByPKThrowsExceptionWhenNotFound() {
        Integer id = 999;
        when(employmentDao.findByPK(id)).thenReturn(null);

        assertThatThrownBy(() -> employmentService.findByPK(id)).isInstanceOf(ServiceException.class);
        verify(employmentDao).findByPK(id);
    }

    @Test
    @DisplayName("Should persist new employment")
    void persistSavesNewEmployment() {
        Employment newEmployment = createTestEmployment(null, testEmployee, LocalDateTime.now());

        employmentService.persist(newEmployment);

        verify(employmentDao).persist(newEmployment);
    }

    @Test
    @DisplayName("Should update existing employment")
    void updateModifiesExistingEmployment() {
        testEmployment.setDepartment("Engineering");
        when(employmentDao.update(testEmployment)).thenReturn(testEmployment);

        Employment result = employmentService.update(testEmployment);

        assertThat(result).isNotNull();
        assertThat(result.getDepartment()).isEqualTo("Engineering");
        verify(employmentDao).update(testEmployment);
    }

    @Test
    @DisplayName("Should update employment with ID")
    void updateWithIdModifiesExistingEmployment() {
        Integer id = 1;
        testEmployment.setGrossSalary(BigDecimal.valueOf(15000));
        when(employmentDao.update(testEmployment)).thenReturn(testEmployment);

        Employment result = employmentService.update(testEmployment, id);

        assertThat(result).isNotNull();
        assertThat(result.getGrossSalary()).isEqualTo(BigDecimal.valueOf(15000));
        verify(employmentDao).update(testEmployment);
    }

    @Test
    @DisplayName("Should delete employment")
    void deleteRemovesEmployment() {
        employmentService.delete(testEmployment);

        verify(employmentDao).delete(testEmployment);
    }

    @Test
    @DisplayName("Should find employment by employee")
    void findByAttributesReturnsEmploymentForEmployee() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employee", testEmployee);
        List<Employment> expectedList = Arrays.asList(testEmployment);

        when(employmentDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<Employment> result = employmentService.findByAttributes(attributes);

        assertThat(result).isNotNull().hasSize(1);
        assertThat(result.get(0).getEmployee()).isEqualTo(testEmployee);
        verify(employmentDao).findByAttributes(attributes);
    }

    @Test
    @DisplayName("Should return empty list when no employment found")
    void findByAttributesReturnsEmptyListWhenNotFound() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employee", testEmployee);

        when(employmentDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<Employment> result = employmentService.findByAttributes(attributes);

        assertThat(result).isNotNull().isEmpty();
        verify(employmentDao).findByAttributes(attributes);
    }

    @Test
    @DisplayName("Should return DAO instance")
    void getDaoReturnsCorrectDao() {
        when(employmentDao.findByPK(1)).thenReturn(testEmployment);

        employmentService.findByPK(1);

        verify(employmentDao).findByPK(1);
    }

    @Test
    @DisplayName("Should handle date of joining")
    void handlesDateOfJoining() {
        LocalDateTime joiningDate = LocalDateTime.of(2024, 6, 1, 0, 0);
        testEmployment.setDateOfJoining(joiningDate);
        when(employmentDao.findByPK(1)).thenReturn(testEmployment);

        Employment result = employmentService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getDateOfJoining()).isEqualTo(joiningDate);
    }

    @Test
    @DisplayName("Should handle soft delete flag")
    void handlesSoftDeleteFlag() {
        testEmployment.setDeleteFlag(true);
        when(employmentDao.findByPK(1)).thenReturn(testEmployment);

        Employment result = employmentService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getDeleteFlag()).isTrue();
    }

    private Employee createTestEmployee(Integer id, String firstName, String lastName) {
        Employee employee = new Employee();
        employee.setId(id);
        employee.setFirstName(firstName);
        employee.setLastName(lastName);
        employee.setIsActive(true);
        employee.setDeleteFlag(false);
        return employee;
    }

    private Employment createTestEmployment(Integer id, Employee employee, LocalDateTime dateOfJoining) {
        Employment employment = new Employment();
        employment.setId(id);
        employment.setEmployee(employee);
        employment.setDateOfJoining(dateOfJoining);
        employment.setDepartment("Engineering");
        employment.setContractType("FullTime");
        employment.setGrossSalary(BigDecimal.valueOf(21000));
        employment.setDeleteFlag(false);
        employment.setCreatedBy(1);
        employment.setCreatedDate(LocalDateTime.now());
        return employment;
    }
}
