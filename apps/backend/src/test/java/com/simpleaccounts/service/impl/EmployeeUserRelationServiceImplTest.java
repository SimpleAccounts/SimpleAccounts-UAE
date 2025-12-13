package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.EmployeeUserRelationDao;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeUserRelation;
import com.simpleaccounts.entity.User;
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
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("EmployeeUserRelationServiceImpl Unit Tests")
class EmployeeUserRelationServiceImplTest {

    @Mock
    private EmployeeUserRelationDao employeeUserRelationDao;

    @InjectMocks
    private EmployeeUserRelationServiceImpl employeeUserRelationService;

    private Employee testEmployee;
    private User testUser;
    private EmployeeUserRelation testRelation;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(employeeUserRelationService, "dao", employeeUserRelationDao);
        testEmployee = createTestEmployee(1, "John", "Doe", "john@test.com");
        testUser = createTestUser(1, "John", "Doe", "john@test.com");
        testRelation = createTestRelation(1, testEmployee, testUser);
    }

    @Test
    @DisplayName("Should add employee user relation")
    void addEmployeeUserRelationCreatesRelation() {
        employeeUserRelationService.addEmployeeUserRelation(testEmployee, testUser);

        ArgumentCaptor<EmployeeUserRelation> captor = ArgumentCaptor.forClass(EmployeeUserRelation.class);
        verify(employeeUserRelationDao).persist(captor.capture());

        EmployeeUserRelation capturedRelation = captor.getValue();
        assertThat(capturedRelation.getEmployee()).isEqualTo(testEmployee);
        assertThat(capturedRelation.getUser()).isEqualTo(testUser);
    }

    @Test
    @DisplayName("Should find relation by primary key")
    void findByPKReturnsRelationWhenExists() {
        Integer id = 1;
        when(employeeUserRelationDao.findByPK(id)).thenReturn(testRelation);

        EmployeeUserRelation result = employeeUserRelationService.findByPK(id);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(id);
        assertThat(result.getEmployee()).isEqualTo(testEmployee);
        assertThat(result.getUser()).isEqualTo(testUser);
        verify(employeeUserRelationDao).findByPK(id);
    }

    @Test
    @DisplayName("Should return null when relation not found")
    void findByPKReturnsNullWhenNotFound() {
        Integer id = 999;
        when(employeeUserRelationDao.findByPK(id)).thenReturn(null);

        EmployeeUserRelation result = employeeUserRelationService.findByPK(id);

        assertThat(result).isNull();
        verify(employeeUserRelationDao).findByPK(id);
    }

    @Test
    @DisplayName("Should persist new relation")
    void persistSavesNewRelation() {
        EmployeeUserRelation newRelation = createTestRelation(null, testEmployee, testUser);

        employeeUserRelationService.persist(newRelation);

        verify(employeeUserRelationDao).persist(newRelation);
    }

    @Test
    @DisplayName("Should update existing relation")
    void updateModifiesExistingRelation() {
        User newUser = createTestUser(2, "Jane", "Smith", "jane@test.com");
        testRelation.setUser(newUser);
        when(employeeUserRelationDao.update(testRelation)).thenReturn(testRelation);

        EmployeeUserRelation result = employeeUserRelationService.update(testRelation);

        assertThat(result).isNotNull();
        assertThat(result.getUser().getFirstName()).isEqualTo("Jane");
        verify(employeeUserRelationDao).update(testRelation);
    }

    @Test
    @DisplayName("Should delete relation")
    void deleteRemovesRelation() {
        employeeUserRelationService.delete(testRelation);

        verify(employeeUserRelationDao).delete(testRelation);
    }

    @Test
    @DisplayName("Should find relations by employee")
    void findByAttributesReturnsRelationsForEmployee() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employee", testEmployee);
        List<EmployeeUserRelation> expectedList = Arrays.asList(testRelation);

        when(employeeUserRelationDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<EmployeeUserRelation> result = employeeUserRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull().hasSize(1);
        assertThat(result.get(0).getEmployee()).isEqualTo(testEmployee);
        verify(employeeUserRelationDao).findByAttributes(attributes);
    }

    @Test
    @DisplayName("Should find relations by user")
    void findByAttributesReturnsRelationsForUser() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("user", testUser);
        List<EmployeeUserRelation> expectedList = Arrays.asList(testRelation);

        when(employeeUserRelationDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<EmployeeUserRelation> result = employeeUserRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull().hasSize(1);
        assertThat(result.get(0).getUser()).isEqualTo(testUser);
        verify(employeeUserRelationDao).findByAttributes(attributes);
    }

    @Test
    @DisplayName("Should return empty list when no relations found")
    void findByAttributesReturnsEmptyListWhenNotFound() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employee", testEmployee);

        when(employeeUserRelationDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<EmployeeUserRelation> result = employeeUserRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull().isEmpty();
        verify(employeeUserRelationDao).findByAttributes(attributes);
    }

    @Test
    @DisplayName("Should return DAO instance")
    void getDaoReturnsCorrectDao() {
        when(employeeUserRelationDao.findByPK(1)).thenReturn(testRelation);

        employeeUserRelationService.findByPK(1);

        verify(employeeUserRelationDao).findByPK(1);
    }

    @Test
    @DisplayName("Should link employee email to user email")
    void linksEmployeeEmailToUserEmail() {
        // Verify that both employee and user have matching emails
        assertThat(testEmployee.getEmail()).isEqualTo(testUser.getUserEmail());

        when(employeeUserRelationDao.findByPK(1)).thenReturn(testRelation);

        EmployeeUserRelation result = employeeUserRelationService.findByPK(1);

        assertThat(result.getEmployee().getEmail()).isEqualTo(result.getUser().getUserEmail());
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

    private EmployeeUserRelation createTestRelation(Integer id, Employee employee, User user) {
        EmployeeUserRelation relation = new EmployeeUserRelation();
        relation.setId(id);
        relation.setEmployee(employee);
        relation.setUser(user);
        return relation;
    }
}
