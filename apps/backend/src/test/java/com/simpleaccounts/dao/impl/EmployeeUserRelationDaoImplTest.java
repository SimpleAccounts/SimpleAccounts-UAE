package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.EmployeeUserRelation;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmployeeUserRelationDaoImpl Unit Tests")
class EmployeeUserRelationDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<EmployeeUserRelation> typedQuery;

    @Mock
    private CriteriaBuilder criteriaBuilder;

    @Mock
    private CriteriaQuery<EmployeeUserRelation> criteriaQuery;

    @Mock
    private Root<EmployeeUserRelation> root;

    @InjectMocks
    private EmployeeUserRelationDaoImpl dao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(dao, "entityManager", entityManager);
        ReflectionTestUtils.setField(dao, "entityClass", EmployeeUserRelation.class);
    }

    @Test
    @DisplayName("Should find employee user relation by primary key")
    void findByPKReturnsRelation() {
        // Arrange
        Integer id = 1;
        EmployeeUserRelation relation = createRelation(id);

        when(entityManager.find(EmployeeUserRelation.class, id))
            .thenReturn(relation);

        // Act
        EmployeeUserRelation result = dao.findByPK(id);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(id);
        verify(entityManager).find(EmployeeUserRelation.class, id);
    }

    @Test
    @DisplayName("Should return null when relation not found by primary key")
    void findByPKReturnsNullWhenNotFound() {
        // Arrange
        Integer id = 999;
        when(entityManager.find(EmployeeUserRelation.class, id))
            .thenReturn(null);

        // Act
        EmployeeUserRelation result = dao.findByPK(id);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should find relations with different IDs")
    void findByPKWithDifferentIds() {
        // Arrange
        EmployeeUserRelation relation1 = createRelation(1);
        EmployeeUserRelation relation2 = createRelation(2);

        when(entityManager.find(EmployeeUserRelation.class, 1)).thenReturn(relation1);
        when(entityManager.find(EmployeeUserRelation.class, 2)).thenReturn(relation2);

        // Act
        EmployeeUserRelation result1 = dao.findByPK(1);
        EmployeeUserRelation result2 = dao.findByPK(2);

        // Assert
        assertThat(result1.getId()).isEqualTo(1);
        assertThat(result2.getId()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should persist employee user relation successfully")
    void persistRelationSuccessfully() {
        // Arrange
        EmployeeUserRelation relation = createRelation(1);

        // Act
        EmployeeUserRelation result = dao.persist(relation);

        // Assert
        verify(entityManager).persist(relation);
        verify(entityManager).flush();
        verify(entityManager).refresh(relation);
        assertThat(result).isEqualTo(relation);
    }

    @Test
    @DisplayName("Should call entity manager operations in correct order for persist")
    void persistCallsEntityManagerInOrder() {
        // Arrange
        EmployeeUserRelation relation = createRelation(1);

        // Act
        dao.persist(relation);

        // Assert
        var inOrder = org.mockito.Mockito.inOrder(entityManager);
        inOrder.verify(entityManager).persist(relation);
        inOrder.verify(entityManager).flush();
        inOrder.verify(entityManager).refresh(relation);
    }

    @Test
    @DisplayName("Should update employee user relation successfully")
    void updateRelationSuccessfully() {
        // Arrange
        EmployeeUserRelation relation = createRelation(1);
        EmployeeUserRelation merged = createRelation(1);

        when(entityManager.merge(relation)).thenReturn(merged);

        // Act
        EmployeeUserRelation result = dao.update(relation);

        // Assert
        assertThat(result).isEqualTo(merged);
        verify(entityManager).merge(relation);
    }

    @Test
    @DisplayName("Should return merged entity from update")
    void updateReturnsMergedEntity() {
        // Arrange
        EmployeeUserRelation original = createRelation(1);
        EmployeeUserRelation merged = createRelation(1);

        when(entityManager.merge(original)).thenReturn(merged);

        // Act
        EmployeeUserRelation result = dao.update(original);

        // Assert
        assertThat(result).isSameAs(merged);
    }

    @Test
    @DisplayName("Should delete managed relation")
    void deleteRelationWhenManaged() {
        // Arrange
        EmployeeUserRelation relation = createRelation(1);
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
        EmployeeUserRelation relation = createRelation(1);
        EmployeeUserRelation merged = createRelation(1);

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
        List<EmployeeUserRelation> relations = createRelationList(3);

        when(entityManager.createNamedQuery(namedQuery, EmployeeUserRelation.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(relations);

        // Act
        List<EmployeeUserRelation> result = dao.executeNamedQuery(namedQuery);

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result).isEqualTo(relations);
    }

    @Test
    @DisplayName("Should return empty list from named query when no results")
    void executeNamedQueryReturnsEmptyList() {
        // Arrange
        String namedQuery = "findAllRelations";

        when(entityManager.createNamedQuery(namedQuery, EmployeeUserRelation.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<EmployeeUserRelation> result = dao.executeNamedQuery(namedQuery);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should find by attributes with string attribute")
    void findByAttributesWithStringAttribute() {
        // Arrange
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("notes", "Test");

        List<EmployeeUserRelation> relations = createRelationList(2);

        when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
        when(criteriaBuilder.createQuery(EmployeeUserRelation.class)).thenReturn(criteriaQuery);
        when(criteriaQuery.from(EmployeeUserRelation.class)).thenReturn(root);
        when(root.get("notes")).thenReturn(root.get("notes"));
        when(criteriaBuilder.like(any(), anyString())).thenReturn(criteriaBuilder.conjunction());
        when(criteriaQuery.where(any(Predicate[].class))).thenReturn(criteriaQuery);
        when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(relations);

        // Act
        List<EmployeeUserRelation> result = dao.findByAttributes(attributes);

        // Assert
        assertThat(result).hasSize(2);
        verify(criteriaBuilder).like(any(), eq("%Test%"));
    }

    @Test
    @DisplayName("Should find by attributes with non-string attribute")
    void findByAttributesWithNonStringAttribute() {
        // Arrange
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("id", 1);

        List<EmployeeUserRelation> relations = Collections.singletonList(createRelation(1));

        when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
        when(criteriaBuilder.createQuery(EmployeeUserRelation.class)).thenReturn(criteriaQuery);
        when(criteriaQuery.from(EmployeeUserRelation.class)).thenReturn(root);
        when(root.get("id")).thenReturn(root.get("id"));
        when(criteriaBuilder.equal(any(), any())).thenReturn(criteriaBuilder.conjunction());
        when(criteriaQuery.where(any(Predicate[].class))).thenReturn(criteriaQuery);
        when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(relations);

        // Act
        List<EmployeeUserRelation> result = dao.findByAttributes(attributes);

        // Assert
        assertThat(result).hasSize(1);
        verify(criteriaBuilder).equal(any(), eq(1));
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
    @DisplayName("Should dump all data from table")
    void dumpDataReturnsAllRecords() {
        // Arrange
        List<EmployeeUserRelation> relations = createRelationList(10);
        String query = "Select t from EmployeeUserRelation t";

        when(entityManager.createQuery(query)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(relations);

        // Act
        List<EmployeeUserRelation> result = dao.dumpData();

        // Assert
        assertThat(result).hasSize(10);
    }

    @Test
    @DisplayName("Should handle empty table when dumping data")
    void dumpDataHandlesEmptyTable() {
        // Arrange
        String query = "Select t from EmployeeUserRelation t";

        when(entityManager.createQuery(query)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<EmployeeUserRelation> result = dao.dumpData();

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should persist multiple relations")
    void persistMultipleRelations() {
        // Arrange
        EmployeeUserRelation relation1 = createRelation(1);
        EmployeeUserRelation relation2 = createRelation(2);

        // Act
        dao.persist(relation1);
        dao.persist(relation2);

        // Assert
        verify(entityManager, times(2)).persist(any(EmployeeUserRelation.class));
        verify(entityManager, times(2)).flush();
        verify(entityManager, times(2)).refresh(any(EmployeeUserRelation.class));
    }

    @Test
    @DisplayName("Should update multiple relations")
    void updateMultipleRelations() {
        // Arrange
        EmployeeUserRelation relation1 = createRelation(1);
        EmployeeUserRelation relation2 = createRelation(2);

        when(entityManager.merge(any(EmployeeUserRelation.class)))
            .thenAnswer(i -> i.getArguments()[0]);

        // Act
        dao.update(relation1);
        dao.update(relation2);

        // Assert
        verify(entityManager, times(2)).merge(any(EmployeeUserRelation.class));
    }

    @Test
    @DisplayName("Should handle null attributes in findByAttributes")
    void findByAttributesWithNullAttributes() {
        // Arrange
        Map<String, Object> attributes = new HashMap<>();

        when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
        when(criteriaBuilder.createQuery(EmployeeUserRelation.class)).thenReturn(criteriaQuery);
        when(criteriaQuery.from(EmployeeUserRelation.class)).thenReturn(root);
        when(criteriaQuery.where(any(Predicate[].class))).thenReturn(criteriaQuery);
        when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<EmployeeUserRelation> result = dao.findByAttributes(attributes);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle finding by PK with null ID")
    void findByPKWithNullId() {
        // Arrange
        when(entityManager.find(EmployeeUserRelation.class, null))
            .thenReturn(null);

        // Act
        EmployeeUserRelation result = dao.findByPK(null);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should correctly identify entity class")
    void entityClassIsCorrect() {
        // Arrange & Act
        Class<?> entityClass = (Class<?>) ReflectionTestUtils.getField(dao, "entityClass");

        // Assert
        assertThat(entityClass).isEqualTo(EmployeeUserRelation.class);
    }

    @Test
    @DisplayName("Should handle consecutive find operations")
    void consecutiveFindOperations() {
        // Arrange
        EmployeeUserRelation relation = createRelation(1);
        when(entityManager.find(EmployeeUserRelation.class, 1))
            .thenReturn(relation);

        // Act
        EmployeeUserRelation result1 = dao.findByPK(1);
        EmployeeUserRelation result2 = dao.findByPK(1);

        // Assert
        assertThat(result1).isEqualTo(result2);
        verify(entityManager, times(2)).find(EmployeeUserRelation.class, 1);
    }

    @Test
    @DisplayName("Should persist relation with employee and user IDs")
    void persistRelationWithEmployeeAndUserIds() {
        // Arrange
        EmployeeUserRelation relation = createRelation(1);
        relation.setEmployeeId(100);
        relation.setUserId(200);

        // Act
        dao.persist(relation);

        // Assert
        verify(entityManager).persist(relation);
        assertThat(relation.getId()).isEqualTo(1);
        assertThat(relation.getEmployeeId()).isEqualTo(100);
        assertThat(relation.getUserId()).isEqualTo(200);
    }

    private EmployeeUserRelation createRelation(Integer id) {
        EmployeeUserRelation relation = new EmployeeUserRelation();
        relation.setId(id);
        relation.setEmployeeId(id * 10);
        relation.setUserId(id * 20);
        return relation;
    }

    private List<EmployeeUserRelation> createRelationList(int count) {
        List<EmployeeUserRelation> relations = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            relations.add(createRelation(i));
        }
        return relations;
    }
}
