package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.EmployeeParentRelationDao;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeParentRelation;
import com.simpleaccounts.exceptions.ServiceException;
import java.time.LocalDateTime;
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
class EmployeeParentRelationServiceImplTest {

    @Mock
    private EmployeeParentRelationDao employeeParentRelationDao;

    @InjectMocks
    private EmployeeParentRelationServiceImpl employeeParentRelationService;

    private EmployeeParentRelation testEmployeeParentRelation;
    private Employee parentEmployee;
    private Employee childEmployee;

    @BeforeEach
    void setUp() {
        parentEmployee = new Employee();
        parentEmployee.setEmployeeId(1);
        parentEmployee.setEmployeeFirstName("John");
        parentEmployee.setEmployeeLastName("Manager");

        childEmployee = new Employee();
        childEmployee.setEmployeeId(2);
        childEmployee.setEmployeeFirstName("Jane");
        childEmployee.setEmployeeLastName("Employee");

        testEmployeeParentRelation = new EmployeeParentRelation();
        testEmployeeParentRelation.setEmployeeParentRelationId(1);
        testEmployeeParentRelation.setParentID(parentEmployee);
        testEmployeeParentRelation.setChildID(childEmployee);
        testEmployeeParentRelation.setCreatedBy(1);
        testEmployeeParentRelation.setCreatedDate(LocalDateTime.now());
        testEmployeeParentRelation.setLastUpdatedBy(1);
        testEmployeeParentRelation.setLastUpdateDate(LocalDateTime.now());
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnEmployeeParentRelationDaoWhenGetDaoCalled() {
        assertThat(employeeParentRelationService.getDao()).isEqualTo(employeeParentRelationDao);
    }

    // ========== addEmployeeParentRelation Tests ==========

    @Test
    void shouldAddEmployeeParentRelationWithValidParameters() {
        employeeParentRelationService.addEmployeeParentRelation(parentEmployee, childEmployee, 1);

        ArgumentCaptor<EmployeeParentRelation> captor = ArgumentCaptor.forClass(EmployeeParentRelation.class);
        verify(employeeParentRelationDao, times(1)).persist(captor.capture());

        EmployeeParentRelation capturedRelation = captor.getValue();
        assertThat(capturedRelation).isNotNull();
        assertThat(capturedRelation.getParentID()).isEqualTo(parentEmployee);
        assertThat(capturedRelation.getChildID()).isEqualTo(childEmployee);
        assertThat(capturedRelation.getCreatedBy()).isEqualTo(1);
        assertThat(capturedRelation.getLastUpdatedBy()).isEqualTo(1);
        assertThat(capturedRelation.getCreatedDate()).isNotNull();
        assertThat(capturedRelation.getLastUpdateDate()).isNotNull();
    }

    @Test
    void shouldSetCorrectTimestampsWhenAddingRelation() {
        LocalDateTime beforeCall = LocalDateTime.now().minusSeconds(1);

        employeeParentRelationService.addEmployeeParentRelation(parentEmployee, childEmployee, 1);

        LocalDateTime afterCall = LocalDateTime.now().plusSeconds(1);

        ArgumentCaptor<EmployeeParentRelation> captor = ArgumentCaptor.forClass(EmployeeParentRelation.class);
        verify(employeeParentRelationDao, times(1)).persist(captor.capture());

        EmployeeParentRelation capturedRelation = captor.getValue();
        assertThat(capturedRelation.getCreatedDate()).isAfter(beforeCall);
        assertThat(capturedRelation.getCreatedDate()).isBefore(afterCall);
        assertThat(capturedRelation.getLastUpdateDate()).isAfter(beforeCall);
        assertThat(capturedRelation.getLastUpdateDate()).isBefore(afterCall);
    }

    @Test
    void shouldAddMultipleEmployeeParentRelations() {
        Employee child2 = new Employee();
        child2.setEmployeeId(3);
        child2.setEmployeeFirstName("Bob");

        employeeParentRelationService.addEmployeeParentRelation(parentEmployee, childEmployee, 1);
        employeeParentRelationService.addEmployeeParentRelation(parentEmployee, child2, 1);

        verify(employeeParentRelationDao, times(2)).persist(any(EmployeeParentRelation.class));
    }

    @Test
    void shouldHandleDifferentUserIds() {
        employeeParentRelationService.addEmployeeParentRelation(parentEmployee, childEmployee, 5);

        ArgumentCaptor<EmployeeParentRelation> captor = ArgumentCaptor.forClass(EmployeeParentRelation.class);
        verify(employeeParentRelationDao, times(1)).persist(captor.capture());

        EmployeeParentRelation capturedRelation = captor.getValue();
        assertThat(capturedRelation.getCreatedBy()).isEqualTo(5);
        assertThat(capturedRelation.getLastUpdatedBy()).isEqualTo(5);
    }

    @Test
    void shouldAddRelationWithDifferentEmployeeCombinations() {
        Employee manager1 = new Employee();
        manager1.setEmployeeId(10);

        Employee employee1 = new Employee();
        employee1.setEmployeeId(20);

        employeeParentRelationService.addEmployeeParentRelation(manager1, employee1, 2);

        ArgumentCaptor<EmployeeParentRelation> captor = ArgumentCaptor.forClass(EmployeeParentRelation.class);
        verify(employeeParentRelationDao, times(1)).persist(captor.capture());

        EmployeeParentRelation capturedRelation = captor.getValue();
        assertThat(capturedRelation.getParentID()).isEqualTo(manager1);
        assertThat(capturedRelation.getChildID()).isEqualTo(employee1);
    }

    @Test
    void shouldHandleZeroUserId() {
        employeeParentRelationService.addEmployeeParentRelation(parentEmployee, childEmployee, 0);

        ArgumentCaptor<EmployeeParentRelation> captor = ArgumentCaptor.forClass(EmployeeParentRelation.class);
        verify(employeeParentRelationDao, times(1)).persist(captor.capture());

        EmployeeParentRelation capturedRelation = captor.getValue();
        assertThat(capturedRelation.getCreatedBy()).isEqualTo(0);
        assertThat(capturedRelation.getLastUpdatedBy()).isEqualTo(0);
    }

    // ========== findByPK Tests ==========

    @Test
    void shouldReturnEmployeeParentRelationWhenFoundByPK() {
        when(employeeParentRelationDao.findByPK(1)).thenReturn(testEmployeeParentRelation);

        EmployeeParentRelation result = employeeParentRelationService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getEmployeeParentRelationId()).isEqualTo(1);
        assertThat(result.getParentID()).isEqualTo(parentEmployee);
        assertThat(result.getChildID()).isEqualTo(childEmployee);
        verify(employeeParentRelationDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenEmployeeParentRelationNotFoundByPK() {
        when(employeeParentRelationDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> employeeParentRelationService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(employeeParentRelationDao, times(1)).findByPK(999);
    }

    @Test
    void shouldFindEmployeeParentRelationByDifferentIds() {
        EmployeeParentRelation relation2 = new EmployeeParentRelation();
        relation2.setEmployeeParentRelationId(2);

        when(employeeParentRelationDao.findByPK(1)).thenReturn(testEmployeeParentRelation);
        when(employeeParentRelationDao.findByPK(2)).thenReturn(relation2);

        EmployeeParentRelation result1 = employeeParentRelationService.findByPK(1);
        EmployeeParentRelation result2 = employeeParentRelationService.findByPK(2);

        assertThat(result1.getEmployeeParentRelationId()).isEqualTo(1);
        assertThat(result2.getEmployeeParentRelationId()).isEqualTo(2);
        verify(employeeParentRelationDao, times(1)).findByPK(1);
        verify(employeeParentRelationDao, times(1)).findByPK(2);
    }

    // ========== persist Tests ==========

    @Test
    void shouldPersistNewEmployeeParentRelation() {
        employeeParentRelationService.persist(testEmployeeParentRelation);

        verify(employeeParentRelationDao, times(1)).persist(testEmployeeParentRelation);
    }

    @Test
    void shouldPersistMultipleEmployeeParentRelations() {
        EmployeeParentRelation relation2 = new EmployeeParentRelation();
        relation2.setEmployeeParentRelationId(2);

        employeeParentRelationService.persist(testEmployeeParentRelation);
        employeeParentRelationService.persist(relation2);

        verify(employeeParentRelationDao, times(1)).persist(testEmployeeParentRelation);
        verify(employeeParentRelationDao, times(1)).persist(relation2);
    }

    // ========== update Tests ==========

    @Test
    void shouldUpdateExistingEmployeeParentRelation() {
        when(employeeParentRelationDao.update(testEmployeeParentRelation)).thenReturn(testEmployeeParentRelation);

        EmployeeParentRelation result = employeeParentRelationService.update(testEmployeeParentRelation);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testEmployeeParentRelation);
        verify(employeeParentRelationDao, times(1)).update(testEmployeeParentRelation);
    }

    @Test
    void shouldUpdateParentEmployee() {
        Employee newParent = new Employee();
        newParent.setEmployeeId(3);
        testEmployeeParentRelation.setParentID(newParent);

        when(employeeParentRelationDao.update(testEmployeeParentRelation)).thenReturn(testEmployeeParentRelation);

        EmployeeParentRelation result = employeeParentRelationService.update(testEmployeeParentRelation);

        assertThat(result).isNotNull();
        assertThat(result.getParentID()).isEqualTo(newParent);
        verify(employeeParentRelationDao, times(1)).update(testEmployeeParentRelation);
    }

    @Test
    void shouldUpdateChildEmployee() {
        Employee newChild = new Employee();
        newChild.setEmployeeId(4);
        testEmployeeParentRelation.setChildID(newChild);

        when(employeeParentRelationDao.update(testEmployeeParentRelation)).thenReturn(testEmployeeParentRelation);

        EmployeeParentRelation result = employeeParentRelationService.update(testEmployeeParentRelation);

        assertThat(result).isNotNull();
        assertThat(result.getChildID()).isEqualTo(newChild);
        verify(employeeParentRelationDao, times(1)).update(testEmployeeParentRelation);
    }

    // ========== delete Tests ==========

    @Test
    void shouldDeleteEmployeeParentRelation() {
        employeeParentRelationService.delete(testEmployeeParentRelation);

        verify(employeeParentRelationDao, times(1)).delete(testEmployeeParentRelation);
    }

    @Test
    void shouldDeleteMultipleEmployeeParentRelations() {
        EmployeeParentRelation relation2 = new EmployeeParentRelation();
        relation2.setEmployeeParentRelationId(2);

        employeeParentRelationService.delete(testEmployeeParentRelation);
        employeeParentRelationService.delete(relation2);

        verify(employeeParentRelationDao, times(1)).delete(testEmployeeParentRelation);
        verify(employeeParentRelationDao, times(1)).delete(relation2);
    }

    // ========== findByAttributes Tests ==========

    @Test
    void shouldReturnEmployeeParentRelationsWhenValidAttributesProvided() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("parentID", parentEmployee);

        List<EmployeeParentRelation> expectedList = Arrays.asList(testEmployeeParentRelation);
        when(employeeParentRelationDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<EmployeeParentRelation> result = employeeParentRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testEmployeeParentRelation);
        verify(employeeParentRelationDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        Employee nonExistentEmployee = new Employee();
        nonExistentEmployee.setEmployeeId(999);
        attributes.put("parentID", nonExistentEmployee);

        when(employeeParentRelationDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<EmployeeParentRelation> result = employeeParentRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(employeeParentRelationDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnMultipleRelationsWhenMultipleMatch() {
        EmployeeParentRelation relation2 = new EmployeeParentRelation();
        relation2.setEmployeeParentRelationId(2);
        relation2.setParentID(parentEmployee);

        Employee child2 = new Employee();
        child2.setEmployeeId(3);
        relation2.setChildID(child2);

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("parentID", parentEmployee);

        List<EmployeeParentRelation> expectedList = Arrays.asList(testEmployeeParentRelation, relation2);
        when(employeeParentRelationDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<EmployeeParentRelation> result = employeeParentRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(testEmployeeParentRelation, relation2);
        verify(employeeParentRelationDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldFindRelationsByChildEmployee() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("childID", childEmployee);

        List<EmployeeParentRelation> expectedList = Arrays.asList(testEmployeeParentRelation);
        when(employeeParentRelationDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<EmployeeParentRelation> result = employeeParentRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getChildID()).isEqualTo(childEmployee);
        verify(employeeParentRelationDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<EmployeeParentRelation> result = employeeParentRelationService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(employeeParentRelationDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<EmployeeParentRelation> result = employeeParentRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(employeeParentRelationDao, never()).findByAttributes(any());
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleHierarchyWithMultipleLevels() {
        Employee topManager = new Employee();
        topManager.setEmployeeId(100);

        Employee middleManager = new Employee();
        middleManager.setEmployeeId(101);

        Employee employee = new Employee();
        employee.setEmployeeId(102);

        employeeParentRelationService.addEmployeeParentRelation(topManager, middleManager, 1);
        employeeParentRelationService.addEmployeeParentRelation(middleManager, employee, 1);

        verify(employeeParentRelationDao, times(2)).persist(any(EmployeeParentRelation.class));
    }

    @Test
    void shouldHandleSameParentMultipleChildren() {
        Employee child1 = new Employee();
        child1.setEmployeeId(10);

        Employee child2 = new Employee();
        child2.setEmployeeId(11);

        Employee child3 = new Employee();
        child3.setEmployeeId(12);

        employeeParentRelationService.addEmployeeParentRelation(parentEmployee, child1, 1);
        employeeParentRelationService.addEmployeeParentRelation(parentEmployee, child2, 1);
        employeeParentRelationService.addEmployeeParentRelation(parentEmployee, child3, 1);

        ArgumentCaptor<EmployeeParentRelation> captor = ArgumentCaptor.forClass(EmployeeParentRelation.class);
        verify(employeeParentRelationDao, times(3)).persist(captor.capture());

        List<EmployeeParentRelation> capturedRelations = captor.getAllValues();
        assertThat(capturedRelations).hasSize(3);
        assertThat(capturedRelations).allMatch(rel -> rel.getParentID().equals(parentEmployee));
    }

    @Test
    void shouldVerifyDaoInteractionForMultipleOperations() {
        when(employeeParentRelationDao.findByPK(1)).thenReturn(testEmployeeParentRelation);
        when(employeeParentRelationDao.update(testEmployeeParentRelation)).thenReturn(testEmployeeParentRelation);

        employeeParentRelationService.findByPK(1);
        employeeParentRelationService.update(testEmployeeParentRelation);
        employeeParentRelationService.persist(testEmployeeParentRelation);
        employeeParentRelationService.delete(testEmployeeParentRelation);

        verify(employeeParentRelationDao, times(1)).findByPK(1);
        verify(employeeParentRelationDao, times(1)).update(testEmployeeParentRelation);
        verify(employeeParentRelationDao, times(1)).persist(testEmployeeParentRelation);
        verify(employeeParentRelationDao, times(1)).delete(testEmployeeParentRelation);
    }

    @Test
    void shouldHandleRelationWithNullOptionalFields() {
        EmployeeParentRelation minimalRelation = new EmployeeParentRelation();
        minimalRelation.setEmployeeParentRelationId(5);
        minimalRelation.setParentID(parentEmployee);
        minimalRelation.setChildID(childEmployee);

        when(employeeParentRelationDao.findByPK(5)).thenReturn(minimalRelation);

        EmployeeParentRelation result = employeeParentRelationService.findByPK(5);

        assertThat(result).isNotNull();
        assertThat(result.getEmployeeParentRelationId()).isEqualTo(5);
        verify(employeeParentRelationDao, times(1)).findByPK(5);
    }
}
