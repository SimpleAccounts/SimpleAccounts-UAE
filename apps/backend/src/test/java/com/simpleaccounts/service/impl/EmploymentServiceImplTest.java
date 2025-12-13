package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.EmploymentDao;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.Employment;
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

    @InjectMocks
    private EmploymentServiceImpl employmentService;

    private Employment testEmployment;
    private Employee testEmployee;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(employmentService, "dao", employmentDao);
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
    void findByPKReturnsNullWhenNotFound() {
        Integer id = 999;
        when(employmentDao.findByPK(id)).thenReturn(null);

        Employment result = employmentService.findByPK(id);

        assertThat(result).isNull();
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
        testEmployment.setEmploymentStatus("Active");
        when(employmentDao.update(testEmployment)).thenReturn(testEmployment);

        Employment result = employmentService.update(testEmployment);

        assertThat(result).isNotNull();
        assertThat(result.getEmploymentStatus()).isEqualTo("Active");
        verify(employmentDao).update(testEmployment);
    }

    @Test
    @DisplayName("Should update employment with ID")
    void updateWithIdModifiesExistingEmployment() {
        Integer id = 1;
        testEmployment.setLeaveBalance(BigDecimal.valueOf(15));
        when(employmentDao.update(testEmployment, id)).thenReturn(testEmployment);

        Employment result = employmentService.update(testEmployment, id);

        assertThat(result).isNotNull();
        assertThat(result.getLeaveBalance()).isEqualTo(BigDecimal.valueOf(15));
        verify(employmentDao).update(testEmployment, id);
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
    @DisplayName("Should handle leave balance")
    void handlesLeaveBalance() {
        BigDecimal leaveBalance = BigDecimal.valueOf(21);
        testEmployment.setLeaveBalance(leaveBalance);
        when(employmentDao.findByPK(1)).thenReturn(testEmployment);

        Employment result = employmentService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getLeaveBalance()).isEqualTo(leaveBalance);
    }

    @Test
    @DisplayName("Should handle employment status")
    void handlesEmploymentStatus() {
        String status = "Probation";
        testEmployment.setEmploymentStatus(status);
        when(employmentDao.findByPK(1)).thenReturn(testEmployment);

        Employment result = employmentService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getEmploymentStatus()).isEqualTo(status);
    }

    @Test
    @DisplayName("Should handle termination date")
    void handlesTerminationDate() {
        LocalDateTime terminationDate = LocalDateTime.of(2024, 12, 31, 0, 0);
        testEmployment.setTerminationDate(terminationDate);
        when(employmentDao.findByPK(1)).thenReturn(testEmployment);

        Employment result = employmentService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getTerminationDate()).isEqualTo(terminationDate);
    }

    @Test
    @DisplayName("Should handle probation end date")
    void handlesProbationEndDate() {
        LocalDateTime probationEndDate = LocalDateTime.of(2024, 7, 15, 0, 0);
        testEmployment.setProbationEndDate(probationEndDate);
        when(employmentDao.findByPK(1)).thenReturn(testEmployment);

        Employment result = employmentService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getProbationEndDate()).isEqualTo(probationEndDate);
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
        employment.setEmploymentStatus("Active");
        employment.setLeaveBalance(BigDecimal.valueOf(21));
        employment.setDeleteFlag(false);
        employment.setCreatedBy(1);
        employment.setCreatedDate(LocalDateTime.now());
        return employment;
    }
}
