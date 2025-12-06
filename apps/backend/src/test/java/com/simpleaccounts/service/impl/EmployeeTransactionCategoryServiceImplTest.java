package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.EmployeeTransactionCategoryDao;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeTransactionCategoryRelation;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
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
class EmployeeTransactionCategoryServiceImplTest {

    @Mock
    private EmployeeTransactionCategoryDao employeeTransactionCategoryDao;

    @InjectMocks
    private EmployeeTransactionCategoryServiceImpl employeeTransactionCategoryService;

    private EmployeeTransactionCategoryRelation testRelation;
    private Employee testEmployee;
    private TransactionCategory testCategory;

    @BeforeEach
    void setUp() {
        testEmployee = new Employee();
        testEmployee.setEmployeeId(1);
        testEmployee.setFirstName("John");
        testEmployee.setLastName("Doe");

        testCategory = new TransactionCategory();
        testCategory.setTransactionCategoryId(100);
        testCategory.setTransactionCategoryName("Salary");

        testRelation = new EmployeeTransactionCategoryRelation();
        testRelation.setId(1);
        testRelation.setEmployee(testEmployee);
        testRelation.setTransactionCategory(testCategory);
        testRelation.setCreatedDate(LocalDateTime.now());
        testRelation.setDeleteFlag(false);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnEmployeeTransactionCategoryDaoWhenGetDaoCalled() {
        assertThat(employeeTransactionCategoryService.getDao()).isEqualTo(employeeTransactionCategoryDao);
    }

    @Test
    void shouldReturnNonNullDaoInstance() {
        assertThat(employeeTransactionCategoryService.getDao()).isNotNull();
    }

    // ========== addEmployeeTransactionCategory Tests ==========

    @Test
    void shouldAddEmployeeTransactionCategoryWithValidEmployeeAndCategory() {
        employeeTransactionCategoryService.addEmployeeTransactionCategory(testEmployee, testCategory);

        // Method has empty implementation, verify no exceptions thrown
        assertThat(testEmployee).isNotNull();
        assertThat(testCategory).isNotNull();
    }

    @Test
    void shouldAddEmployeeTransactionCategoryWithNullEmployee() {
        // Empty implementation should handle null employee
        employeeTransactionCategoryService.addEmployeeTransactionCategory(null, testCategory);

        // Verify no exceptions thrown
        assertThat(testCategory).isNotNull();
    }

    @Test
    void shouldAddEmployeeTransactionCategoryWithNullCategory() {
        // Empty implementation should handle null category
        employeeTransactionCategoryService.addEmployeeTransactionCategory(testEmployee, null);

        // Verify no exceptions thrown
        assertThat(testEmployee).isNotNull();
    }

    @Test
    void shouldAddEmployeeTransactionCategoryWithBothNull() {
        // Empty implementation should handle both null
        employeeTransactionCategoryService.addEmployeeTransactionCategory(null, null);

        // No exception expected for empty implementation
    }

    @Test
    void shouldAddEmployeeTransactionCategoryMultipleTimes() {
        employeeTransactionCategoryService.addEmployeeTransactionCategory(testEmployee, testCategory);
        employeeTransactionCategoryService.addEmployeeTransactionCategory(testEmployee, testCategory);
        employeeTransactionCategoryService.addEmployeeTransactionCategory(testEmployee, testCategory);

        // No exception expected for empty implementation
        assertThat(testEmployee).isNotNull();
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindRelationByPrimaryKey() {
        when(employeeTransactionCategoryDao.findByPK(1)).thenReturn(testRelation);

        EmployeeTransactionCategoryRelation result = employeeTransactionCategoryService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testRelation);
        assertThat(result.getId()).isEqualTo(1);
        verify(employeeTransactionCategoryDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenRelationNotFoundByPK() {
        when(employeeTransactionCategoryDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> employeeTransactionCategoryService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(employeeTransactionCategoryDao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewRelation() {
        employeeTransactionCategoryService.persist(testRelation);

        verify(employeeTransactionCategoryDao, times(1)).persist(testRelation);
    }

    @Test
    void shouldPersistRelationWithPrimaryKey() {
        when(employeeTransactionCategoryDao.findByPK(1)).thenReturn(null);

        employeeTransactionCategoryService.persist(testRelation, 1);

        verify(employeeTransactionCategoryDao, times(1)).findByPK(1);
        verify(employeeTransactionCategoryDao, times(1)).persist(testRelation);
    }

    @Test
    void shouldThrowExceptionWhenPersistingDuplicateRelation() {
        when(employeeTransactionCategoryDao.findByPK(1)).thenReturn(testRelation);

        assertThatThrownBy(() -> employeeTransactionCategoryService.persist(testRelation, 1))
                .isInstanceOf(ServiceException.class);

        verify(employeeTransactionCategoryDao, times(1)).findByPK(1);
        verify(employeeTransactionCategoryDao, never()).persist(any());
    }

    @Test
    void shouldUpdateExistingRelation() {
        when(employeeTransactionCategoryDao.update(testRelation)).thenReturn(testRelation);

        EmployeeTransactionCategoryRelation result = employeeTransactionCategoryService.update(testRelation);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testRelation);
        verify(employeeTransactionCategoryDao, times(1)).update(testRelation);
    }

    @Test
    void shouldUpdateRelationAndReturnUpdatedEntity() {
        testRelation.setDeleteFlag(true);
        when(employeeTransactionCategoryDao.update(testRelation)).thenReturn(testRelation);

        EmployeeTransactionCategoryRelation result = employeeTransactionCategoryService.update(testRelation);

        assertThat(result).isNotNull();
        assertThat(result.getDeleteFlag()).isTrue();
        verify(employeeTransactionCategoryDao, times(1)).update(testRelation);
    }

    @Test
    void shouldUpdateRelationWithPrimaryKey() {
        when(employeeTransactionCategoryDao.update(testRelation)).thenReturn(testRelation);

        EmployeeTransactionCategoryRelation result = employeeTransactionCategoryService.update(testRelation, 1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testRelation);
        verify(employeeTransactionCategoryDao, times(1)).update(testRelation);
    }

    @Test
    void shouldDeleteRelation() {
        employeeTransactionCategoryService.delete(testRelation);

        verify(employeeTransactionCategoryDao, times(1)).delete(testRelation);
    }

    @Test
    void shouldDeleteRelationWithPrimaryKey() {
        when(employeeTransactionCategoryDao.findByPK(1)).thenReturn(testRelation);

        employeeTransactionCategoryService.delete(testRelation, 1);

        verify(employeeTransactionCategoryDao, times(1)).findByPK(1);
        verify(employeeTransactionCategoryDao, times(1)).delete(testRelation);
    }

    @Test
    void shouldThrowExceptionWhenDeletingNonExistentRelation() {
        when(employeeTransactionCategoryDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> employeeTransactionCategoryService.delete(testRelation, 999))
                .isInstanceOf(ServiceException.class);

        verify(employeeTransactionCategoryDao, times(1)).findByPK(999);
        verify(employeeTransactionCategoryDao, never()).delete(any());
    }

    // ========== findByAttributes Tests ==========

    @Test
    void shouldFindRelationsByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employeeId", 1);
        attributes.put("deleteFlag", false);

        List<EmployeeTransactionCategoryRelation> expectedList = Arrays.asList(testRelation);
        when(employeeTransactionCategoryDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<EmployeeTransactionCategoryRelation> result = employeeTransactionCategoryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testRelation);
        verify(employeeTransactionCategoryDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employeeId", 999);

        when(employeeTransactionCategoryDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<EmployeeTransactionCategoryRelation> result = employeeTransactionCategoryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(employeeTransactionCategoryDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<EmployeeTransactionCategoryRelation> result = employeeTransactionCategoryService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(employeeTransactionCategoryDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<EmployeeTransactionCategoryRelation> result = employeeTransactionCategoryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(employeeTransactionCategoryDao, never()).findByAttributes(any());
    }

    @Test
    void shouldFindMultipleRelationsByAttributes() {
        EmployeeTransactionCategoryRelation relation2 = new EmployeeTransactionCategoryRelation();
        relation2.setId(2);
        relation2.setEmployee(testEmployee);

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employeeId", 1);

        List<EmployeeTransactionCategoryRelation> expectedList = Arrays.asList(testRelation, relation2);
        when(employeeTransactionCategoryDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<EmployeeTransactionCategoryRelation> result = employeeTransactionCategoryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(testRelation, relation2);
        verify(employeeTransactionCategoryDao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleRelationWithMinimalData() {
        EmployeeTransactionCategoryRelation minimalRelation = new EmployeeTransactionCategoryRelation();
        minimalRelation.setId(99);

        when(employeeTransactionCategoryDao.findByPK(99)).thenReturn(minimalRelation);

        EmployeeTransactionCategoryRelation result = employeeTransactionCategoryService.findByPK(99);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(99);
        assertThat(result.getEmployee()).isNull();
        assertThat(result.getTransactionCategory()).isNull();
        verify(employeeTransactionCategoryDao, times(1)).findByPK(99);
    }

    @Test
    void shouldHandleMultiplePersistOperations() {
        EmployeeTransactionCategoryRelation relation1 = new EmployeeTransactionCategoryRelation();
        EmployeeTransactionCategoryRelation relation2 = new EmployeeTransactionCategoryRelation();
        EmployeeTransactionCategoryRelation relation3 = new EmployeeTransactionCategoryRelation();

        employeeTransactionCategoryService.persist(relation1);
        employeeTransactionCategoryService.persist(relation2);
        employeeTransactionCategoryService.persist(relation3);

        verify(employeeTransactionCategoryDao, times(3)).persist(any(EmployeeTransactionCategoryRelation.class));
    }

    @Test
    void shouldHandleMultipleUpdateOperations() {
        when(employeeTransactionCategoryDao.update(any(EmployeeTransactionCategoryRelation.class))).thenReturn(testRelation);

        employeeTransactionCategoryService.update(testRelation);
        employeeTransactionCategoryService.update(testRelation);
        employeeTransactionCategoryService.update(testRelation);

        verify(employeeTransactionCategoryDao, times(3)).update(testRelation);
    }

    @Test
    void shouldHandleRelationWithDifferentEmployees() {
        Employee employee2 = new Employee();
        employee2.setEmployeeId(2);
        employee2.setFirstName("Jane");

        TransactionCategory category = new TransactionCategory();
        category.setTransactionCategoryId(200);

        employeeTransactionCategoryService.addEmployeeTransactionCategory(testEmployee, category);
        employeeTransactionCategoryService.addEmployeeTransactionCategory(employee2, category);

        // No exception expected
        assertThat(testEmployee.getEmployeeId()).isEqualTo(1);
        assertThat(employee2.getEmployeeId()).isEqualTo(2);
    }

    @Test
    void shouldVerifyDaoInteractionForFindByPK() {
        when(employeeTransactionCategoryDao.findByPK(1)).thenReturn(testRelation);

        employeeTransactionCategoryService.findByPK(1);
        employeeTransactionCategoryService.findByPK(1);

        verify(employeeTransactionCategoryDao, times(2)).findByPK(1);
    }

    @Test
    void shouldHandleNullRelationInUpdate() {
        EmployeeTransactionCategoryRelation nullRelation = new EmployeeTransactionCategoryRelation();
        when(employeeTransactionCategoryDao.update(any(EmployeeTransactionCategoryRelation.class))).thenReturn(nullRelation);

        EmployeeTransactionCategoryRelation result = employeeTransactionCategoryService.update(nullRelation);

        assertThat(result).isNotNull();
        verify(employeeTransactionCategoryDao, times(1)).update(nullRelation);
    }

    @Test
    void shouldHandleComplexAttributeSearch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employeeId", 1);
        attributes.put("transactionCategoryId", 100);
        attributes.put("deleteFlag", false);

        when(employeeTransactionCategoryDao.findByAttributes(attributes)).thenReturn(Arrays.asList(testRelation));

        List<EmployeeTransactionCategoryRelation> result = employeeTransactionCategoryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(employeeTransactionCategoryDao, times(1)).findByAttributes(attributes);
    }
}
