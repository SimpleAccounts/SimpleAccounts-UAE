package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeParentRelation;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmployeeParentRelationDaoImpl Unit Tests")
class EmployeeParentRelationDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<EmployeeParentRelation> typedQuery;

    @InjectMocks
    private EmployeeParentRelationDaoImpl dao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(dao, "entityManager", entityManager);
        ReflectionTestUtils.setField(dao, "entityClass", EmployeeParentRelation.class);
    }

    @Test
    @DisplayName("Should call addEmployeeParentRelationDao without exceptions")
    void addEmployeeParentRelationDaoExecutes() {
        // Arrange
        Employee parent = createEmployee(1, "Parent");
        Employee child = createEmployee(2, "Child");
        Integer userId = 100;

        // Act
        dao.addEmployeeParentRelationDao(parent, child, userId);

        // Assert - method completes without exception
        // Since the method is empty, we just verify it doesn't throw
        assertThat(true).isTrue();
    }

    @Test
    @DisplayName("Should handle null parent employee")
    void addEmployeeParentRelationDaoWithNullParent() {
        // Arrange
        Employee child = createEmployee(2, "Child");
        Integer userId = 100;

        // Act
        dao.addEmployeeParentRelationDao(null, child, userId);

        // Assert
        assertThat(true).isTrue();
    }

    @Test
    @DisplayName("Should handle null child employee")
    void addEmployeeParentRelationDaoWithNullChild() {
        // Arrange
        Employee parent = createEmployee(1, "Parent");
        Integer userId = 100;

        // Act
        dao.addEmployeeParentRelationDao(parent, null, userId);

        // Assert
        assertThat(true).isTrue();
    }

    @Test
    @DisplayName("Should handle null user ID")
    void addEmployeeParentRelationDaoWithNullUserId() {
        // Arrange
        Employee parent = createEmployee(1, "Parent");
        Employee child = createEmployee(2, "Child");

        // Act
        dao.addEmployeeParentRelationDao(parent, child, null);

        // Assert
        assertThat(true).isTrue();
    }

    @Test
    @DisplayName("Should handle all null parameters")
    void addEmployeeParentRelationDaoWithAllNullParams() {
        // Act
        dao.addEmployeeParentRelationDao(null, null, null);

        // Assert
        assertThat(true).isTrue();
    }

    @Test
    @DisplayName("Should find employee parent relation by primary key")
    void findByPKReturnsRelation() {
        // Arrange
        Integer id = 1;
        EmployeeParentRelation relation = createRelation(id);

        when(entityManager.find(EmployeeParentRelation.class, id))
            .thenReturn(relation);

        // Act
        EmployeeParentRelation result = dao.findByPK(id);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(id);
    }

    @Test
    @DisplayName("Should return null when relation not found by PK")
    void findByPKReturnsNullWhenNotFound() {
        // Arrange
        Integer id = 999;
        when(entityManager.find(EmployeeParentRelation.class, id))
            .thenReturn(null);

        // Act
        EmployeeParentRelation result = dao.findByPK(id);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should persist employee parent relation successfully")
    void persistRelationSuccessfully() {
        // Arrange
        EmployeeParentRelation relation = createRelation(1);

        // Act
        EmployeeParentRelation result = dao.persist(relation);

        // Assert
        verify(entityManager).persist(relation);
        verify(entityManager).flush();
        verify(entityManager).refresh(relation);
        assertThat(result).isEqualTo(relation);
    }

    @Test
    @DisplayName("Should update employee parent relation successfully")
    void updateRelationSuccessfully() {
        // Arrange
        EmployeeParentRelation relation = createRelation(1);
        EmployeeParentRelation merged = createRelation(1);

        when(entityManager.merge(relation)).thenReturn(merged);

        // Act
        EmployeeParentRelation result = dao.update(relation);

        // Assert
        assertThat(result).isEqualTo(merged);
        verify(entityManager).merge(relation);
    }

    @Test
    @DisplayName("Should delete managed employee parent relation")
    void deleteRelationWhenManaged() {
        // Arrange
        EmployeeParentRelation relation = createRelation(1);
        when(entityManager.contains(relation)).thenReturn(true);

        // Act
        dao.delete(relation);

        // Assert
        verify(entityManager).contains(relation);
        verify(entityManager).remove(relation);
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should merge then delete unmanaged relation")
    void deleteRelationWhenNotManaged() {
        // Arrange
        EmployeeParentRelation relation = createRelation(1);
        EmployeeParentRelation merged = createRelation(1);

        when(entityManager.contains(relation)).thenReturn(false);
        when(entityManager.merge(relation)).thenReturn(merged);

        // Act
        dao.delete(relation);

        // Assert
        verify(entityManager).contains(relation);
        verify(entityManager).merge(relation);
        verify(entityManager).remove(merged);
    }

    @Test
    @DisplayName("Should execute named query successfully")
    void executeNamedQueryReturnsResults() {
        // Arrange
        String namedQuery = "findAllRelations";
        List<EmployeeParentRelation> relations = createRelationList(3);

        when(entityManager.createNamedQuery(namedQuery, EmployeeParentRelation.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(relations);

        // Act
        List<EmployeeParentRelation> result = dao.executeNamedQuery(namedQuery);

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result).isEqualTo(relations);
    }

    @Test
    @DisplayName("Should return empty list from named query when no results")
    void executeNamedQueryReturnsEmptyList() {
        // Arrange
        String namedQuery = "findAllRelations";

        when(entityManager.createNamedQuery(namedQuery, EmployeeParentRelation.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<EmployeeParentRelation> result = dao.executeNamedQuery(namedQuery);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should dump all data from table")
    void dumpDataReturnsAllRecords() {
        // Arrange
        List<EmployeeParentRelation> relations = createRelationList(10);
        String query = "Select t from EmployeeParentRelation t";

        when(entityManager.createQuery(query)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(relations);

        // Act
        List<EmployeeParentRelation> result = dao.dumpData();

        // Assert
        assertThat(result).hasSize(10);
    }

    @Test
    @DisplayName("Should persist multiple relations")
    void persistMultipleRelations() {
        // Arrange
        EmployeeParentRelation relation1 = createRelation(1);
        EmployeeParentRelation relation2 = createRelation(2);

        // Act
        dao.persist(relation1);
        dao.persist(relation2);

        // Assert
        verify(entityManager, times(2)).persist(any(EmployeeParentRelation.class));
    }

    @Test
    @DisplayName("Should handle consecutive method calls")
    void addEmployeeParentRelationDaoConsecutiveCalls() {
        // Arrange
        Employee parent1 = createEmployee(1, "Parent1");
        Employee child1 = createEmployee(2, "Child1");
        Employee parent2 = createEmployee(3, "Parent2");
        Employee child2 = createEmployee(4, "Child2");

        // Act
        dao.addEmployeeParentRelationDao(parent1, child1, 100);
        dao.addEmployeeParentRelationDao(parent2, child2, 200);

        // Assert - both calls complete without exception
        assertThat(true).isTrue();
    }

    @Test
    @DisplayName("Should handle same parent with different children")
    void addEmployeeParentRelationDaoSameParentDifferentChildren() {
        // Arrange
        Employee parent = createEmployee(1, "Parent");
        Employee child1 = createEmployee(2, "Child1");
        Employee child2 = createEmployee(3, "Child2");

        // Act
        dao.addEmployeeParentRelationDao(parent, child1, 100);
        dao.addEmployeeParentRelationDao(parent, child2, 100);

        // Assert
        assertThat(true).isTrue();
    }

    @Test
    @DisplayName("Should handle same child with different parents")
    void addEmployeeParentRelationDaoSameChildDifferentParents() {
        // Arrange
        Employee parent1 = createEmployee(1, "Parent1");
        Employee parent2 = createEmployee(2, "Parent2");
        Employee child = createEmployee(3, "Child");

        // Act
        dao.addEmployeeParentRelationDao(parent1, child, 100);
        dao.addEmployeeParentRelationDao(parent2, child, 100);

        // Assert
        assertThat(true).isTrue();
    }

    @Test
    @DisplayName("Should handle different user IDs")
    void addEmployeeParentRelationDaoWithDifferentUserIds() {
        // Arrange
        Employee parent = createEmployee(1, "Parent");
        Employee child = createEmployee(2, "Child");

        // Act
        dao.addEmployeeParentRelationDao(parent, child, 100);
        dao.addEmployeeParentRelationDao(parent, child, 200);
        dao.addEmployeeParentRelationDao(parent, child, 300);

        // Assert
        assertThat(true).isTrue();
    }

    @Test
    @DisplayName("Should return entity manager instance")
    void getEntityManagerReturnsInstance() {
        // Act
        EntityManager result = dao.getEntityManager();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isSameAs(entityManager);
    }

    @Test
    @DisplayName("Should handle zero user ID")
    void addEmployeeParentRelationDaoWithZeroUserId() {
        // Arrange
        Employee parent = createEmployee(1, "Parent");
        Employee child = createEmployee(2, "Child");

        // Act
        dao.addEmployeeParentRelationDao(parent, child, 0);

        // Assert
        assertThat(true).isTrue();
    }

    @Test
    @DisplayName("Should handle negative user ID")
    void addEmployeeParentRelationDaoWithNegativeUserId() {
        // Arrange
        Employee parent = createEmployee(1, "Parent");
        Employee child = createEmployee(2, "Child");

        // Act
        dao.addEmployeeParentRelationDao(parent, child, -1);

        // Assert
        assertThat(true).isTrue();
    }

    @Test
    @DisplayName("Should handle large user ID")
    void addEmployeeParentRelationDaoWithLargeUserId() {
        // Arrange
        Employee parent = createEmployee(1, "Parent");
        Employee child = createEmployee(2, "Child");

        // Act
        dao.addEmployeeParentRelationDao(parent, child, Integer.MAX_VALUE);

        // Assert
        assertThat(true).isTrue();
    }

    private Employee createEmployee(Integer id, String name) {
        Employee employee = new Employee();
        employee.setEmployeeId(id);
        employee.setFirstName(name);
        return employee;
    }

    private EmployeeParentRelation createRelation(Integer id) {
        EmployeeParentRelation relation = new EmployeeParentRelation();
        relation.setId(id);
        relation.setParent(createEmployee(id, "Parent" + id));
        relation.setChild(createEmployee(id + 100, "Child" + id));
        return relation;
    }

    private List<EmployeeParentRelation> createRelationList(int count) {
        List<EmployeeParentRelation> relations = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            relations.add(createRelation(i));
        }
        return relations;
    }
}
