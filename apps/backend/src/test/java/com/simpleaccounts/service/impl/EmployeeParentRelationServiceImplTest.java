package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.EmployeeParentRelationDao;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeParentRelation;
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
@DisplayName("EmployeeParentRelationServiceImpl Unit Tests")
class EmployeeParentRelationServiceImplTest {

    @Mock
    private EmployeeParentRelationDao employeeParentRelationDao;

    @InjectMocks
    private EmployeeParentRelationServiceImpl employeeParentRelationService;

    private Employee parentEmployee;
    private Employee childEmployee;
    private EmployeeParentRelation testRelation;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(employeeParentRelationService, "dao", employeeParentRelationDao);
        parentEmployee = createTestEmployee(1, "Manager", "One", "manager@test.com");
        childEmployee = createTestEmployee(2, "Developer", "Two", "developer@test.com");
        testRelation = createTestRelation(1, parentEmployee, childEmployee);
    }

    @Test
    @DisplayName("Should add employee parent relation")
    void addEmployeeParentRelationCreatesRelation() {
        Integer userId = 1;

        employeeParentRelationService.addEmployeeParentRelation(parentEmployee, childEmployee, userId);

        ArgumentCaptor<EmployeeParentRelation> captor = ArgumentCaptor.forClass(EmployeeParentRelation.class);
        verify(employeeParentRelationDao).persist(captor.capture());

        EmployeeParentRelation capturedRelation = captor.getValue();
        assertThat(capturedRelation.getParentID()).isEqualTo(parentEmployee);
        assertThat(capturedRelation.getChildID()).isEqualTo(childEmployee);
        assertThat(capturedRelation.getCreatedBy()).isEqualTo(userId);
        assertThat(capturedRelation.getLastUpdatedBy()).isEqualTo(userId);
        assertThat(capturedRelation.getCreatedDate()).isNotNull();
        assertThat(capturedRelation.getLastUpdateDate()).isNotNull();
    }

    @Test
    @DisplayName("Should find relation by primary key")
    void findByPKReturnsRelationWhenExists() {
        Integer id = 1;
        when(employeeParentRelationDao.findByPK(id)).thenReturn(testRelation);

        EmployeeParentRelation result = employeeParentRelationService.findByPK(id);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(id);
        assertThat(result.getParentID()).isEqualTo(parentEmployee);
        assertThat(result.getChildID()).isEqualTo(childEmployee);
        verify(employeeParentRelationDao).findByPK(id);
    }

    @Test
    @DisplayName("Should return null when relation not found")
    void findByPKReturnsNullWhenNotFound() {
        Integer id = 999;
        when(employeeParentRelationDao.findByPK(id)).thenReturn(null);

        EmployeeParentRelation result = employeeParentRelationService.findByPK(id);

        assertThat(result).isNull();
        verify(employeeParentRelationDao).findByPK(id);
    }

    @Test
    @DisplayName("Should persist new relation")
    void persistSavesNewRelation() {
        EmployeeParentRelation newRelation = createTestRelation(null, parentEmployee, childEmployee);

        employeeParentRelationService.persist(newRelation);

        verify(employeeParentRelationDao).persist(newRelation);
    }

    @Test
    @DisplayName("Should update existing relation")
    void updateModifiesExistingRelation() {
        Employee newChild = createTestEmployee(3, "New", "Developer", "new@test.com");
        testRelation.setChildID(newChild);
        when(employeeParentRelationDao.update(testRelation)).thenReturn(testRelation);

        EmployeeParentRelation result = employeeParentRelationService.update(testRelation);

        assertThat(result).isNotNull();
        assertThat(result.getChildID().getFirstName()).isEqualTo("New");
        verify(employeeParentRelationDao).update(testRelation);
    }

    @Test
    @DisplayName("Should delete relation")
    void deleteRemovesRelation() {
        employeeParentRelationService.delete(testRelation);

        verify(employeeParentRelationDao).delete(testRelation);
    }

    @Test
    @DisplayName("Should find relations by child ID")
    void findByAttributesReturnsRelationsForChild() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("childID", childEmployee);
        List<EmployeeParentRelation> expectedList = Arrays.asList(testRelation);

        when(employeeParentRelationDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<EmployeeParentRelation> result = employeeParentRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull().hasSize(1);
        assertThat(result.get(0).getChildID()).isEqualTo(childEmployee);
        verify(employeeParentRelationDao).findByAttributes(attributes);
    }

    @Test
    @DisplayName("Should find relations by parent ID")
    void findByAttributesReturnsRelationsForParent() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("parentID", parentEmployee);

        Employee child2 = createTestEmployee(3, "Developer", "Three", "dev3@test.com");
        EmployeeParentRelation relation2 = createTestRelation(2, parentEmployee, child2);
        List<EmployeeParentRelation> expectedList = Arrays.asList(testRelation, relation2);

        when(employeeParentRelationDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<EmployeeParentRelation> result = employeeParentRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull().hasSize(2);
        assertThat(result).allMatch(r -> r.getParentID().equals(parentEmployee));
        verify(employeeParentRelationDao).findByAttributes(attributes);
    }

    @Test
    @DisplayName("Should return empty list when no relations found")
    void findByAttributesReturnsEmptyListWhenNotFound() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("childID", childEmployee);

        when(employeeParentRelationDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<EmployeeParentRelation> result = employeeParentRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull().isEmpty();
        verify(employeeParentRelationDao).findByAttributes(attributes);
    }

    @Test
    @DisplayName("Should return DAO instance")
    void getDaoReturnsCorrectDao() {
        when(employeeParentRelationDao.findByPK(1)).thenReturn(testRelation);

        employeeParentRelationService.findByPK(1);

        verify(employeeParentRelationDao).findByPK(1);
    }

    @Test
    @DisplayName("Should handle hierarchical employee structure")
    void handlesHierarchicalEmployeeStructure() {
        // Create a hierarchy: CEO -> Manager -> Developer
        Employee ceo = createTestEmployee(1, "CEO", "One", "ceo@test.com");
        Employee manager = createTestEmployee(2, "Manager", "Two", "manager@test.com");
        Employee developer = createTestEmployee(3, "Developer", "Three", "developer@test.com");

        EmployeeParentRelation ceoToManager = createTestRelation(1, ceo, manager);
        EmployeeParentRelation managerToDeveloper = createTestRelation(2, manager, developer);

        // Find manager's parent (CEO)
        Map<String, Object> findManagerParent = new HashMap<>();
        findManagerParent.put("childID", manager);
        when(employeeParentRelationDao.findByAttributes(findManagerParent)).thenReturn(Arrays.asList(ceoToManager));

        List<EmployeeParentRelation> managerParentRelation = employeeParentRelationService.findByAttributes(findManagerParent);
        assertThat(managerParentRelation).hasSize(1);
        assertThat(managerParentRelation.get(0).getParentID().getFirstName()).isEqualTo("CEO");

        // Find manager's subordinates (Developer)
        Map<String, Object> findManagerChildren = new HashMap<>();
        findManagerChildren.put("parentID", manager);
        when(employeeParentRelationDao.findByAttributes(findManagerChildren)).thenReturn(Arrays.asList(managerToDeveloper));

        List<EmployeeParentRelation> managerChildrenRelation = employeeParentRelationService.findByAttributes(findManagerChildren);
        assertThat(managerChildrenRelation).hasSize(1);
        assertThat(managerChildrenRelation.get(0).getChildID().getFirstName()).isEqualTo("Developer");
    }

    @Test
    @DisplayName("Should set audit fields when creating relation")
    void setsAuditFieldsWhenCreatingRelation() {
        Integer userId = 99;
        LocalDateTime beforeCreate = LocalDateTime.now().minusSeconds(1);

        employeeParentRelationService.addEmployeeParentRelation(parentEmployee, childEmployee, userId);

        ArgumentCaptor<EmployeeParentRelation> captor = ArgumentCaptor.forClass(EmployeeParentRelation.class);
        verify(employeeParentRelationDao).persist(captor.capture());

        EmployeeParentRelation capturedRelation = captor.getValue();
        assertThat(capturedRelation.getCreatedBy()).isEqualTo(userId);
        assertThat(capturedRelation.getLastUpdatedBy()).isEqualTo(userId);
        assertThat(capturedRelation.getCreatedDate()).isAfter(beforeCreate);
        assertThat(capturedRelation.getLastUpdateDate()).isAfter(beforeCreate);
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

    private EmployeeParentRelation createTestRelation(Integer id, Employee parent, Employee child) {
        EmployeeParentRelation relation = new EmployeeParentRelation();
        relation.setId(id);
        relation.setParentID(parent);
        relation.setChildID(child);
        relation.setCreatedBy(1);
        relation.setCreatedDate(LocalDateTime.now());
        relation.setLastUpdatedBy(1);
        relation.setLastUpdateDate(LocalDateTime.now());
        return relation;
    }
}
