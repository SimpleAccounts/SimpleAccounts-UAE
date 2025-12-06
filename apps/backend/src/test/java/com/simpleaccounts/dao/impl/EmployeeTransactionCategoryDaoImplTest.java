package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.EmployeeTransactionCategoryRelation;
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
@DisplayName("EmployeeTransactionCategoryDaoImpl Unit Tests")
class EmployeeTransactionCategoryDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<EmployeeTransactionCategoryRelation> typedQuery;

    @Mock
    private CriteriaBuilder criteriaBuilder;

    @Mock
    private CriteriaQuery<EmployeeTransactionCategoryRelation> criteriaQuery;

    @Mock
    private Root<EmployeeTransactionCategoryRelation> root;

    @InjectMocks
    private EmployeeTransactionCategoryDaoImpl dao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(dao, "entityManager", entityManager);
        ReflectionTestUtils.setField(dao, "entityClass", EmployeeTransactionCategoryRelation.class);
    }

    @Test
    @DisplayName("Should find employee transaction category relation by primary key")
    void findByPKReturnsRelation() {
        // Arrange
        Integer id = 1;
        EmployeeTransactionCategoryRelation relation = createRelation(id);

        when(entityManager.find(EmployeeTransactionCategoryRelation.class, id))
            .thenReturn(relation);

        // Act
        EmployeeTransactionCategoryRelation result = dao.findByPK(id);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(id);
        verify(entityManager).find(EmployeeTransactionCategoryRelation.class, id);
    }

    @Test
    @DisplayName("Should return null when relation not found by primary key")
    void findByPKReturnsNullWhenNotFound() {
        // Arrange
        Integer id = 999;
        when(entityManager.find(EmployeeTransactionCategoryRelation.class, id))
            .thenReturn(null);

        // Act
        EmployeeTransactionCategoryRelation result = dao.findByPK(id);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should find relations with different IDs")
    void findByPKWithDifferentIds() {
        // Arrange
        EmployeeTransactionCategoryRelation relation1 = createRelation(1);
        EmployeeTransactionCategoryRelation relation2 = createRelation(2);

        when(entityManager.find(EmployeeTransactionCategoryRelation.class, 1)).thenReturn(relation1);
        when(entityManager.find(EmployeeTransactionCategoryRelation.class, 2)).thenReturn(relation2);

        // Act
        EmployeeTransactionCategoryRelation result1 = dao.findByPK(1);
        EmployeeTransactionCategoryRelation result2 = dao.findByPK(2);

        // Assert
        assertThat(result1.getId()).isEqualTo(1);
        assertThat(result2.getId()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should persist employee transaction category relation successfully")
    void persistRelationSuccessfully() {
        // Arrange
        EmployeeTransactionCategoryRelation relation = createRelation(1);

        // Act
        EmployeeTransactionCategoryRelation result = dao.persist(relation);

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
        EmployeeTransactionCategoryRelation relation = createRelation(1);

        // Act
        dao.persist(relation);

        // Assert
        var inOrder = org.mockito.Mockito.inOrder(entityManager);
        inOrder.verify(entityManager).persist(relation);
        inOrder.verify(entityManager).flush();
        inOrder.verify(entityManager).refresh(relation);
    }

    @Test
    @DisplayName("Should update employee transaction category relation successfully")
    void updateRelationSuccessfully() {
        // Arrange
        EmployeeTransactionCategoryRelation relation = createRelation(1);
        EmployeeTransactionCategoryRelation merged = createRelation(1);

        when(entityManager.merge(relation)).thenReturn(merged);

        // Act
        EmployeeTransactionCategoryRelation result = dao.update(relation);

        // Assert
        assertThat(result).isEqualTo(merged);
        verify(entityManager).merge(relation);
    }

    @Test
    @DisplayName("Should return merged entity from update")
    void updateReturnsMergedEntity() {
        // Arrange
        EmployeeTransactionCategoryRelation original = createRelation(1);
        EmployeeTransactionCategoryRelation merged = createRelation(1);

        when(entityManager.merge(original)).thenReturn(merged);

        // Act
        EmployeeTransactionCategoryRelation result = dao.update(original);

        // Assert
        assertThat(result).isSameAs(merged);
    }

    @Test
    @DisplayName("Should delete managed relation")
    void deleteRelationWhenManaged() {
        // Arrange
        EmployeeTransactionCategoryRelation relation = createRelation(1);
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
        EmployeeTransactionCategoryRelation relation = createRelation(1);
        EmployeeTransactionCategoryRelation merged = createRelation(1);

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
        List<EmployeeTransactionCategoryRelation> relations = createRelationList(3);

        when(entityManager.createNamedQuery(namedQuery, EmployeeTransactionCategoryRelation.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(relations);

        // Act
        List<EmployeeTransactionCategoryRelation> result = dao.executeNamedQuery(namedQuery);

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result).isEqualTo(relations);
    }

    @Test
    @DisplayName("Should return empty list from named query when no results")
    void executeNamedQueryReturnsEmptyList() {
        // Arrange
        String namedQuery = "findAllRelations";

        when(entityManager.createNamedQuery(namedQuery, EmployeeTransactionCategoryRelation.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<EmployeeTransactionCategoryRelation> result = dao.executeNamedQuery(namedQuery);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should find by attributes with string attribute")
    void findByAttributesWithStringAttribute() {
        // Arrange
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("description", "Test");

        List<EmployeeTransactionCategoryRelation> relations = createRelationList(2);

        when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
        when(criteriaBuilder.createQuery(EmployeeTransactionCategoryRelation.class)).thenReturn(criteriaQuery);
        when(criteriaQuery.from(EmployeeTransactionCategoryRelation.class)).thenReturn(root);
        when(root.get("description")).thenReturn(root.get("description"));
        when(criteriaBuilder.like(any(), anyString())).thenReturn(criteriaBuilder.conjunction());
        when(criteriaQuery.where(any(Predicate[].class))).thenReturn(criteriaQuery);
        when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(relations);

        // Act
        List<EmployeeTransactionCategoryRelation> result = dao.findByAttributes(attributes);

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

        List<EmployeeTransactionCategoryRelation> relations = Collections.singletonList(createRelation(1));

        when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
        when(criteriaBuilder.createQuery(EmployeeTransactionCategoryRelation.class)).thenReturn(criteriaQuery);
        when(criteriaQuery.from(EmployeeTransactionCategoryRelation.class)).thenReturn(root);
        when(root.get("id")).thenReturn(root.get("id"));
        when(criteriaBuilder.equal(any(), any())).thenReturn(criteriaBuilder.conjunction());
        when(criteriaQuery.where(any(Predicate[].class))).thenReturn(criteriaQuery);
        when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(relations);

        // Act
        List<EmployeeTransactionCategoryRelation> result = dao.findByAttributes(attributes);

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
        List<EmployeeTransactionCategoryRelation> relations = createRelationList(10);
        String query = "Select t from EmployeeTransactionCategoryRelation t";

        when(entityManager.createQuery(query)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(relations);

        // Act
        List<EmployeeTransactionCategoryRelation> result = dao.dumpData();

        // Assert
        assertThat(result).hasSize(10);
    }

    @Test
    @DisplayName("Should handle empty table when dumping data")
    void dumpDataHandlesEmptyTable() {
        // Arrange
        String query = "Select t from EmployeeTransactionCategoryRelation t";

        when(entityManager.createQuery(query)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<EmployeeTransactionCategoryRelation> result = dao.dumpData();

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should persist multiple relations")
    void persistMultipleRelations() {
        // Arrange
        EmployeeTransactionCategoryRelation relation1 = createRelation(1);
        EmployeeTransactionCategoryRelation relation2 = createRelation(2);

        // Act
        dao.persist(relation1);
        dao.persist(relation2);

        // Assert
        verify(entityManager, times(2)).persist(any(EmployeeTransactionCategoryRelation.class));
        verify(entityManager, times(2)).flush();
        verify(entityManager, times(2)).refresh(any(EmployeeTransactionCategoryRelation.class));
    }

    @Test
    @DisplayName("Should update multiple relations")
    void updateMultipleRelations() {
        // Arrange
        EmployeeTransactionCategoryRelation relation1 = createRelation(1);
        EmployeeTransactionCategoryRelation relation2 = createRelation(2);

        when(entityManager.merge(any(EmployeeTransactionCategoryRelation.class)))
            .thenAnswer(i -> i.getArguments()[0]);

        // Act
        dao.update(relation1);
        dao.update(relation2);

        // Assert
        verify(entityManager, times(2)).merge(any(EmployeeTransactionCategoryRelation.class));
    }

    @Test
    @DisplayName("Should handle null attributes in findByAttributes")
    void findByAttributesWithNullAttributes() {
        // Arrange
        Map<String, Object> attributes = new HashMap<>();

        when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
        when(criteriaBuilder.createQuery(EmployeeTransactionCategoryRelation.class)).thenReturn(criteriaQuery);
        when(criteriaQuery.from(EmployeeTransactionCategoryRelation.class)).thenReturn(root);
        when(criteriaQuery.where(any(Predicate[].class))).thenReturn(criteriaQuery);
        when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<EmployeeTransactionCategoryRelation> result = dao.findByAttributes(attributes);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle finding by PK with null ID")
    void findByPKWithNullId() {
        // Arrange
        when(entityManager.find(EmployeeTransactionCategoryRelation.class, null))
            .thenReturn(null);

        // Act
        EmployeeTransactionCategoryRelation result = dao.findByPK(null);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should correctly identify entity class")
    void entityClassIsCorrect() {
        // Arrange & Act
        Class<?> entityClass = (Class<?>) ReflectionTestUtils.getField(dao, "entityClass");

        // Assert
        assertThat(entityClass).isEqualTo(EmployeeTransactionCategoryRelation.class);
    }

    @Test
    @DisplayName("Should handle consecutive find operations")
    void consecutiveFindOperations() {
        // Arrange
        EmployeeTransactionCategoryRelation relation = createRelation(1);
        when(entityManager.find(EmployeeTransactionCategoryRelation.class, 1))
            .thenReturn(relation);

        // Act
        EmployeeTransactionCategoryRelation result1 = dao.findByPK(1);
        EmployeeTransactionCategoryRelation result2 = dao.findByPK(1);

        // Assert
        assertThat(result1).isEqualTo(result2);
        verify(entityManager, times(2)).find(EmployeeTransactionCategoryRelation.class, 1);
    }

    @Test
    @DisplayName("Should persist relation with all properties")
    void persistRelationWithAllProperties() {
        // Arrange
        EmployeeTransactionCategoryRelation relation = createRelation(1);
        relation.setEmployeeId(100);
        relation.setTransactionCategoryId(200);

        // Act
        dao.persist(relation);

        // Assert
        verify(entityManager).persist(relation);
        assertThat(relation.getId()).isEqualTo(1);
        assertThat(relation.getEmployeeId()).isEqualTo(100);
        assertThat(relation.getTransactionCategoryId()).isEqualTo(200);
    }

    private EmployeeTransactionCategoryRelation createRelation(Integer id) {
        EmployeeTransactionCategoryRelation relation = new EmployeeTransactionCategoryRelation();
        relation.setId(id);
        relation.setEmployeeId(id * 10);
        relation.setTransactionCategoryId(id * 20);
        return relation;
    }

    private List<EmployeeTransactionCategoryRelation> createRelationList(int count) {
        List<EmployeeTransactionCategoryRelation> relations = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            relations.add(createRelation(i));
        }
        return relations;
    }
}
