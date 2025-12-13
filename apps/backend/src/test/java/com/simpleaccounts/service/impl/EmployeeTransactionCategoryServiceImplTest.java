package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.EmployeeTransactionCategoryDao;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeTransactionCategoryRelation;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
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
@DisplayName("EmployeeTransactionCategoryServiceImpl Unit Tests")
class EmployeeTransactionCategoryServiceImplTest {

    @Mock
    private EmployeeTransactionCategoryDao employeeTransactionCategoryDao;

    @InjectMocks
    private EmployeeTransactionCategoryServiceImpl employeeTransactionCategoryService;

    private Employee testEmployee;
    private TransactionCategory testTransactionCategory;
    private EmployeeTransactionCategoryRelation testRelation;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(employeeTransactionCategoryService, "dao", employeeTransactionCategoryDao);
        testEmployee = createTestEmployee(1, "John", "Doe");
        testTransactionCategory = createTestTransactionCategory(1, "Salary Expense");
        testRelation = createTestRelation(1, testEmployee, testTransactionCategory);
    }

    @Test
    @DisplayName("Should add employee transaction category relation")
    void addEmployeeTransactionCategoryCreatesRelation() {
        employeeTransactionCategoryService.addEmployeeTransactionCategory(testEmployee, testTransactionCategory);

        ArgumentCaptor<EmployeeTransactionCategoryRelation> captor = ArgumentCaptor.forClass(EmployeeTransactionCategoryRelation.class);
        verify(employeeTransactionCategoryDao).persist(captor.capture());

        EmployeeTransactionCategoryRelation capturedRelation = captor.getValue();
        assertThat(capturedRelation.getEmployee()).isEqualTo(testEmployee);
        assertThat(capturedRelation.getTransactionCategory()).isEqualTo(testTransactionCategory);
    }

    @Test
    @DisplayName("Should find relation by primary key")
    void findByPKReturnsRelationWhenExists() {
        Integer id = 1;
        when(employeeTransactionCategoryDao.findByPK(id)).thenReturn(testRelation);

        EmployeeTransactionCategoryRelation result = employeeTransactionCategoryService.findByPK(id);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(id);
        assertThat(result.getEmployee()).isEqualTo(testEmployee);
        verify(employeeTransactionCategoryDao).findByPK(id);
    }

    @Test
    @DisplayName("Should return null when relation not found")
    void findByPKReturnsNullWhenNotFound() {
        Integer id = 999;
        when(employeeTransactionCategoryDao.findByPK(id)).thenReturn(null);

        EmployeeTransactionCategoryRelation result = employeeTransactionCategoryService.findByPK(id);

        assertThat(result).isNull();
        verify(employeeTransactionCategoryDao).findByPK(id);
    }

    @Test
    @DisplayName("Should persist new relation")
    void persistSavesNewRelation() {
        EmployeeTransactionCategoryRelation newRelation = createTestRelation(null, testEmployee, testTransactionCategory);

        employeeTransactionCategoryService.persist(newRelation);

        verify(employeeTransactionCategoryDao).persist(newRelation);
    }

    @Test
    @DisplayName("Should update existing relation")
    void updateModifiesExistingRelation() {
        TransactionCategory newCategory = createTestTransactionCategory(2, "Bonus Expense");
        testRelation.setTransactionCategory(newCategory);
        when(employeeTransactionCategoryDao.update(testRelation)).thenReturn(testRelation);

        EmployeeTransactionCategoryRelation result = employeeTransactionCategoryService.update(testRelation);

        assertThat(result).isNotNull();
        assertThat(result.getTransactionCategory().getCategoryName()).isEqualTo("Bonus Expense");
        verify(employeeTransactionCategoryDao).update(testRelation);
    }

    @Test
    @DisplayName("Should delete relation")
    void deleteRemovesRelation() {
        employeeTransactionCategoryService.delete(testRelation);

        verify(employeeTransactionCategoryDao).delete(testRelation);
    }

    @Test
    @DisplayName("Should find relations by employee")
    void findByAttributesReturnsRelationsForEmployee() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employee", testEmployee);
        List<EmployeeTransactionCategoryRelation> expectedList = Arrays.asList(testRelation);

        when(employeeTransactionCategoryDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<EmployeeTransactionCategoryRelation> result = employeeTransactionCategoryService.findByAttributes(attributes);

        assertThat(result).isNotNull().hasSize(1);
        assertThat(result.get(0).getEmployee()).isEqualTo(testEmployee);
        verify(employeeTransactionCategoryDao).findByAttributes(attributes);
    }

    @Test
    @DisplayName("Should return empty list when no relations found")
    void findByAttributesReturnsEmptyListWhenNotFound() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employee", testEmployee);

        when(employeeTransactionCategoryDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<EmployeeTransactionCategoryRelation> result = employeeTransactionCategoryService.findByAttributes(attributes);

        assertThat(result).isNotNull().isEmpty();
        verify(employeeTransactionCategoryDao).findByAttributes(attributes);
    }

    @Test
    @DisplayName("Should return DAO instance")
    void getDaoReturnsCorrectDao() {
        when(employeeTransactionCategoryDao.findByPK(1)).thenReturn(testRelation);

        employeeTransactionCategoryService.findByPK(1);

        verify(employeeTransactionCategoryDao).findByPK(1);
    }

    @Test
    @DisplayName("Should handle multiple transaction categories for same employee")
    void handlesMultipleTransactionCategoriesForSameEmployee() {
        TransactionCategory category2 = createTestTransactionCategory(2, "Bonus Expense");
        EmployeeTransactionCategoryRelation relation2 = createTestRelation(2, testEmployee, category2);

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employee", testEmployee);
        List<EmployeeTransactionCategoryRelation> expectedList = Arrays.asList(testRelation, relation2);

        when(employeeTransactionCategoryDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<EmployeeTransactionCategoryRelation> result = employeeTransactionCategoryService.findByAttributes(attributes);

        assertThat(result).isNotNull().hasSize(2);
        assertThat(result).extracting(r -> r.getTransactionCategory().getCategoryName())
            .containsExactlyInAnyOrder("Salary Expense", "Bonus Expense");
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

    private TransactionCategory createTestTransactionCategory(Integer id, String categoryName) {
        TransactionCategory category = new TransactionCategory();
        category.setTransactionCategoryId(id);
        category.setCategoryName(categoryName);
        category.setDeleteFlag(false);
        return category;
    }

    private EmployeeTransactionCategoryRelation createTestRelation(Integer id, Employee employee, TransactionCategory category) {
        EmployeeTransactionCategoryRelation relation = new EmployeeTransactionCategoryRelation();
        relation.setId(id);
        relation.setEmployee(employee);
        relation.setTransactionCategory(category);
        return relation;
    }
}
