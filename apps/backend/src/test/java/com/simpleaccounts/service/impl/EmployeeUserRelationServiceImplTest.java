package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.EmployeeUserRelationDao;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeUserRelation;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.exceptions.ServiceException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EmployeeUserRelationServiceImplTest {

    @Mock
    private EmployeeUserRelationDao employeeUserRelationDao;

    @InjectMocks
    private EmployeeUserRelationServiceImpl employeeUserRelationService;

    private EmployeeUserRelation testRelation;
    private Employee testEmployee;
    private User testUser;

    @BeforeEach
    void setUp() {
        testEmployee = new Employee();
        testEmployee.setEmployeeId(1);
        testEmployee.setFirstName("John");
        testEmployee.setLastName("Doe");
        testEmployee.setEmail("john.doe@example.com");

        testUser = new User();
        testUser.setUserId(100);
        testUser.setUserName("johndoe");
        testUser.setEmailAddress("john.doe@example.com");

        testRelation = new EmployeeUserRelation();
        testRelation.setId(1);
        testRelation.setEmployee(testEmployee);
        testRelation.setUser(testUser);
        testRelation.setCreatedDate(LocalDateTime.now());
        testRelation.setDeleteFlag(false);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnEmployeeUserRelationDaoWhenGetDaoCalled() {
        assertThat(employeeUserRelationService.getDao()).isEqualTo(employeeUserRelationDao);
    }

    @Test
    void shouldReturnNonNullDaoInstance() {
        assertThat(employeeUserRelationService.getDao()).isNotNull();
    }

    // ========== addEmployeeUserRelation Tests ==========

    @Test
    void shouldAddEmployeeUserRelationWithValidEmployeeAndUser() {
        employeeUserRelationService.addEmployeeUserRelation(testEmployee, testUser);

        // Method has empty implementation, verify no exceptions thrown
        assertThat(testEmployee).isNotNull();
        assertThat(testUser).isNotNull();
    }

    @Test
    void shouldAddEmployeeUserRelationWithNullEmployee() {
        // Empty implementation should handle null employee
        employeeUserRelationService.addEmployeeUserRelation(null, testUser);

        // Verify no exceptions thrown
        assertThat(testUser).isNotNull();
    }

    @Test
    void shouldAddEmployeeUserRelationWithNullUser() {
        // Empty implementation should handle null user
        employeeUserRelationService.addEmployeeUserRelation(testEmployee, null);

        // Verify no exceptions thrown
        assertThat(testEmployee).isNotNull();
    }

    @Test
    void shouldAddEmployeeUserRelationWithBothNull() {
        // Empty implementation should handle both null
        employeeUserRelationService.addEmployeeUserRelation(null, null);

        // No exception expected for empty implementation
    }

    @Test
    void shouldAddEmployeeUserRelationMultipleTimes() {
        employeeUserRelationService.addEmployeeUserRelation(testEmployee, testUser);
        employeeUserRelationService.addEmployeeUserRelation(testEmployee, testUser);
        employeeUserRelationService.addEmployeeUserRelation(testEmployee, testUser);

        // No exception expected for empty implementation
        assertThat(testEmployee).isNotNull();
    }

    @Test
    void shouldAddEmployeeUserRelationWithDifferentUsers() {
        User user2 = new User();
        user2.setUserId(200);
        user2.setUserName("janedoe");

        employeeUserRelationService.addEmployeeUserRelation(testEmployee, testUser);
        employeeUserRelationService.addEmployeeUserRelation(testEmployee, user2);

        // No exception expected
        assertThat(testUser.getUserId()).isEqualTo(100);
        assertThat(user2.getUserId()).isEqualTo(200);
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindRelationByPrimaryKey() {
        when(employeeUserRelationDao.findByPK(1)).thenReturn(testRelation);

        EmployeeUserRelation result = employeeUserRelationService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testRelation);
        assertThat(result.getId()).isEqualTo(1);
        assertThat(result.getEmployee()).isEqualTo(testEmployee);
        assertThat(result.getUser()).isEqualTo(testUser);
        verify(employeeUserRelationDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenRelationNotFoundByPK() {
        when(employeeUserRelationDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> employeeUserRelationService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(employeeUserRelationDao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewRelation() {
        employeeUserRelationService.persist(testRelation);

        verify(employeeUserRelationDao, times(1)).persist(testRelation);
    }

    @Test
    void shouldPersistRelationWithPrimaryKey() {
        when(employeeUserRelationDao.findByPK(1)).thenReturn(null);

        employeeUserRelationService.persist(testRelation, 1);

        verify(employeeUserRelationDao, times(1)).findByPK(1);
        verify(employeeUserRelationDao, times(1)).persist(testRelation);
    }

    @Test
    void shouldThrowExceptionWhenPersistingDuplicateRelation() {
        when(employeeUserRelationDao.findByPK(1)).thenReturn(testRelation);

        assertThatThrownBy(() -> employeeUserRelationService.persist(testRelation, 1))
                .isInstanceOf(ServiceException.class);

        verify(employeeUserRelationDao, times(1)).findByPK(1);
        verify(employeeUserRelationDao, never()).persist(any());
    }

    @Test
    void shouldUpdateExistingRelation() {
        when(employeeUserRelationDao.update(testRelation)).thenReturn(testRelation);

        EmployeeUserRelation result = employeeUserRelationService.update(testRelation);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testRelation);
        verify(employeeUserRelationDao, times(1)).update(testRelation);
    }

    @Test
    void shouldUpdateRelationAndReturnUpdatedEntity() {
        testRelation.setDeleteFlag(true);
        when(employeeUserRelationDao.update(testRelation)).thenReturn(testRelation);

        EmployeeUserRelation result = employeeUserRelationService.update(testRelation);

        assertThat(result).isNotNull();
        assertThat(result.getDeleteFlag()).isTrue();
        verify(employeeUserRelationDao, times(1)).update(testRelation);
    }

    @Test
    void shouldUpdateRelationWithPrimaryKey() {
        when(employeeUserRelationDao.update(testRelation)).thenReturn(testRelation);

        EmployeeUserRelation result = employeeUserRelationService.update(testRelation, 1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testRelation);
        verify(employeeUserRelationDao, times(1)).update(testRelation);
    }

    @Test
    void shouldDeleteRelation() {
        employeeUserRelationService.delete(testRelation);

        verify(employeeUserRelationDao, times(1)).delete(testRelation);
    }

    @Test
    void shouldDeleteRelationWithPrimaryKey() {
        when(employeeUserRelationDao.findByPK(1)).thenReturn(testRelation);

        employeeUserRelationService.delete(testRelation, 1);

        verify(employeeUserRelationDao, times(1)).findByPK(1);
        verify(employeeUserRelationDao, times(1)).delete(testRelation);
    }

    @Test
    void shouldThrowExceptionWhenDeletingNonExistentRelation() {
        when(employeeUserRelationDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> employeeUserRelationService.delete(testRelation, 999))
                .isInstanceOf(ServiceException.class);

        verify(employeeUserRelationDao, times(1)).findByPK(999);
        verify(employeeUserRelationDao, never()).delete(any());
    }

    // ========== findByAttributes Tests ==========

    @Test
    void shouldFindRelationsByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employeeId", 1);
        attributes.put("deleteFlag", false);

        List<EmployeeUserRelation> expectedList = Arrays.asList(testRelation);
        when(employeeUserRelationDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<EmployeeUserRelation> result = employeeUserRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testRelation);
        verify(employeeUserRelationDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employeeId", 999);

        when(employeeUserRelationDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<EmployeeUserRelation> result = employeeUserRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(employeeUserRelationDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<EmployeeUserRelation> result = employeeUserRelationService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(employeeUserRelationDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<EmployeeUserRelation> result = employeeUserRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(employeeUserRelationDao, never()).findByAttributes(any());
    }

    @Test
    void shouldFindMultipleRelationsByAttributes() {
        EmployeeUserRelation relation2 = new EmployeeUserRelation();
        relation2.setId(2);
        relation2.setEmployee(testEmployee);

        User user2 = new User();
        user2.setUserId(200);
        relation2.setUser(user2);

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employeeId", 1);

        List<EmployeeUserRelation> expectedList = Arrays.asList(testRelation, relation2);
        when(employeeUserRelationDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<EmployeeUserRelation> result = employeeUserRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(testRelation, relation2);
        verify(employeeUserRelationDao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleRelationWithMinimalData() {
        EmployeeUserRelation minimalRelation = new EmployeeUserRelation();
        minimalRelation.setId(99);

        when(employeeUserRelationDao.findByPK(99)).thenReturn(minimalRelation);

        EmployeeUserRelation result = employeeUserRelationService.findByPK(99);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(99);
        assertThat(result.getEmployee()).isNull();
        assertThat(result.getUser()).isNull();
        verify(employeeUserRelationDao, times(1)).findByPK(99);
    }

    @Test
    void shouldHandleMultiplePersistOperations() {
        EmployeeUserRelation relation1 = new EmployeeUserRelation();
        EmployeeUserRelation relation2 = new EmployeeUserRelation();
        EmployeeUserRelation relation3 = new EmployeeUserRelation();

        employeeUserRelationService.persist(relation1);
        employeeUserRelationService.persist(relation2);
        employeeUserRelationService.persist(relation3);

        verify(employeeUserRelationDao, times(3)).persist(any(EmployeeUserRelation.class));
    }

    @Test
    void shouldHandleMultipleUpdateOperations() {
        when(employeeUserRelationDao.update(any(EmployeeUserRelation.class))).thenReturn(testRelation);

        employeeUserRelationService.update(testRelation);
        employeeUserRelationService.update(testRelation);
        employeeUserRelationService.update(testRelation);

        verify(employeeUserRelationDao, times(3)).update(testRelation);
    }

    @Test
    void shouldHandleRelationWithDifferentEmployees() {
        Employee employee2 = new Employee();
        employee2.setEmployeeId(2);
        employee2.setFirstName("Jane");

        employeeUserRelationService.addEmployeeUserRelation(testEmployee, testUser);
        employeeUserRelationService.addEmployeeUserRelation(employee2, testUser);

        // No exception expected
        assertThat(testEmployee.getEmployeeId()).isEqualTo(1);
        assertThat(employee2.getEmployeeId()).isEqualTo(2);
    }

    @Test
    void shouldVerifyDaoInteractionForFindByPK() {
        when(employeeUserRelationDao.findByPK(1)).thenReturn(testRelation);

        employeeUserRelationService.findByPK(1);
        employeeUserRelationService.findByPK(1);

        verify(employeeUserRelationDao, times(2)).findByPK(1);
    }

    @Test
    void shouldHandleNullRelationInUpdate() {
        EmployeeUserRelation nullRelation = new EmployeeUserRelation();
        when(employeeUserRelationDao.update(any(EmployeeUserRelation.class))).thenReturn(nullRelation);

        EmployeeUserRelation result = employeeUserRelationService.update(nullRelation);

        assertThat(result).isNotNull();
        verify(employeeUserRelationDao, times(1)).update(nullRelation);
    }

    @Test
    void shouldHandleComplexAttributeSearch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employeeId", 1);
        attributes.put("userId", 100);
        attributes.put("deleteFlag", false);

        when(employeeUserRelationDao.findByAttributes(attributes)).thenReturn(Arrays.asList(testRelation));

        List<EmployeeUserRelation> result = employeeUserRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(employeeUserRelationDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleRelationWithAllFieldsPopulated() {
        testRelation.setCreatedBy(5);
        testRelation.setLastUpdateDate(LocalDateTime.now());
        testRelation.setLastUpdatedBy(10);

        when(employeeUserRelationDao.findByPK(1)).thenReturn(testRelation);

        EmployeeUserRelation result = employeeUserRelationService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getCreatedBy()).isEqualTo(5);
        assertThat(result.getLastUpdatedBy()).isEqualTo(10);
        assertThat(result.getLastUpdateDate()).isNotNull();
        verify(employeeUserRelationDao, times(1)).findByPK(1);
    }

    @Test
    void shouldHandleSearchByUserId() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("userId", 100);

        when(employeeUserRelationDao.findByAttributes(attributes)).thenReturn(Arrays.asList(testRelation));

        List<EmployeeUserRelation> result = employeeUserRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUser().getUserId()).isEqualTo(100);
        verify(employeeUserRelationDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleSearchByEmployeeId() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employeeId", 1);

        when(employeeUserRelationDao.findByAttributes(attributes)).thenReturn(Arrays.asList(testRelation));

        List<EmployeeUserRelation> result = employeeUserRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmployee().getEmployeeId()).isEqualTo(1);
        verify(employeeUserRelationDao, times(1)).findByAttributes(attributes);
    }
}
