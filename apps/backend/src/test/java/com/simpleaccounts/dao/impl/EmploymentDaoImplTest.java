package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Employment;
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
@DisplayName("EmploymentDaoImpl Unit Tests")
class EmploymentDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<Employment> typedQuery;

    @Mock
    private CriteriaBuilder criteriaBuilder;

    @Mock
    private CriteriaQuery<Employment> criteriaQuery;

    @Mock
    private Root<Employment> root;

    @InjectMocks
    private EmploymentDaoImpl dao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(dao, "entityManager", entityManager);
        ReflectionTestUtils.setField(dao, "entityClass", Employment.class);
    }

    @Test
    @DisplayName("Should find employment by primary key")
    void findByPKReturnsEmployment() {
        // Arrange
        Integer id = 1;
        Employment employment = createEmployment(id);

        when(entityManager.find(Employment.class, id))
            .thenReturn(employment);

        // Act
        Employment result = dao.findByPK(id);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getEmploymentId()).isEqualTo(id);
        verify(entityManager).find(Employment.class, id);
    }

    @Test
    @DisplayName("Should return null when employment not found by primary key")
    void findByPKReturnsNullWhenNotFound() {
        // Arrange
        Integer id = 999;
        when(entityManager.find(Employment.class, id))
            .thenReturn(null);

        // Act
        Employment result = dao.findByPK(id);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should find employments with different IDs")
    void findByPKWithDifferentIds() {
        // Arrange
        Employment employment1 = createEmployment(1);
        Employment employment2 = createEmployment(2);

        when(entityManager.find(Employment.class, 1)).thenReturn(employment1);
        when(entityManager.find(Employment.class, 2)).thenReturn(employment2);

        // Act
        Employment result1 = dao.findByPK(1);
        Employment result2 = dao.findByPK(2);

        // Assert
        assertThat(result1.getEmploymentId()).isEqualTo(1);
        assertThat(result2.getEmploymentId()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should persist employment successfully")
    void persistEmploymentSuccessfully() {
        // Arrange
        Employment employment = createEmployment(1);

        // Act
        Employment result = dao.persist(employment);

        // Assert
        verify(entityManager).persist(employment);
        verify(entityManager).flush();
        verify(entityManager).refresh(employment);
        assertThat(result).isEqualTo(employment);
    }

    @Test
    @DisplayName("Should call entity manager operations in correct order for persist")
    void persistCallsEntityManagerInOrder() {
        // Arrange
        Employment employment = createEmployment(1);

        // Act
        dao.persist(employment);

        // Assert
        var inOrder = org.mockito.Mockito.inOrder(entityManager);
        inOrder.verify(entityManager).persist(employment);
        inOrder.verify(entityManager).flush();
        inOrder.verify(entityManager).refresh(employment);
    }

    @Test
    @DisplayName("Should update employment successfully")
    void updateEmploymentSuccessfully() {
        // Arrange
        Employment employment = createEmployment(1);
        Employment merged = createEmployment(1);

        when(entityManager.merge(employment)).thenReturn(merged);

        // Act
        Employment result = dao.update(employment);

        // Assert
        assertThat(result).isEqualTo(merged);
        verify(entityManager).merge(employment);
    }

    @Test
    @DisplayName("Should return merged entity from update")
    void updateReturnsMergedEntity() {
        // Arrange
        Employment original = createEmployment(1);
        Employment merged = createEmployment(1);

        when(entityManager.merge(original)).thenReturn(merged);

        // Act
        Employment result = dao.update(original);

        // Assert
        assertThat(result).isSameAs(merged);
    }

    @Test
    @DisplayName("Should delete managed employment")
    void deleteEmploymentWhenManaged() {
        // Arrange
        Employment employment = createEmployment(1);
        when(entityManager.contains(employment)).thenReturn(true);

        // Act
        dao.delete(employment);

        // Assert
        verify(entityManager).contains(employment);
        verify(entityManager).remove(employment);
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should merge then delete unmanaged employment")
    void deleteEmploymentWhenNotManaged() {
        // Arrange
        Employment employment = createEmployment(1);
        Employment merged = createEmployment(1);

        when(entityManager.contains(employment)).thenReturn(false);
        when(entityManager.merge(employment)).thenReturn(merged);

        // Act
        dao.delete(employment);

        // Assert
        verify(entityManager).contains(employment);
        verify(entityManager).merge(employment);
        verify(entityManager).remove(merged);
    }

    @Test
    @DisplayName("Should execute named query successfully")
    void executeNamedQueryReturnsResults() {
        // Arrange
        String namedQuery = "findAllEmployments";
        List<Employment> employments = createEmploymentList(3);

        when(entityManager.createNamedQuery(namedQuery, Employment.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(employments);

        // Act
        List<Employment> result = dao.executeNamedQuery(namedQuery);

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result).isEqualTo(employments);
    }

    @Test
    @DisplayName("Should return empty list from named query when no results")
    void executeNamedQueryReturnsEmptyList() {
        // Arrange
        String namedQuery = "findAllEmployments";

        when(entityManager.createNamedQuery(namedQuery, Employment.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<Employment> result = dao.executeNamedQuery(namedQuery);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should find by attributes with string attribute")
    void findByAttributesWithStringAttribute() {
        // Arrange
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employmentType", "Full-time");

        List<Employment> employments = createEmploymentList(2);

        when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
        when(criteriaBuilder.createQuery(Employment.class)).thenReturn(criteriaQuery);
        when(criteriaQuery.from(Employment.class)).thenReturn(root);
        when(root.get("employmentType")).thenReturn(root.get("employmentType"));
        when(criteriaBuilder.like(any(), anyString())).thenReturn(criteriaBuilder.conjunction());
        when(criteriaQuery.where(any(Predicate[].class))).thenReturn(criteriaQuery);
        when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(employments);

        // Act
        List<Employment> result = dao.findByAttributes(attributes);

        // Assert
        assertThat(result).hasSize(2);
        verify(criteriaBuilder).like(any(), eq("%Full-time%"));
    }

    @Test
    @DisplayName("Should find by attributes with non-string attribute")
    void findByAttributesWithNonStringAttribute() {
        // Arrange
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("employmentId", 1);

        List<Employment> employments = Collections.singletonList(createEmployment(1));

        when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
        when(criteriaBuilder.createQuery(Employment.class)).thenReturn(criteriaQuery);
        when(criteriaQuery.from(Employment.class)).thenReturn(root);
        when(root.get("employmentId")).thenReturn(root.get("employmentId"));
        when(criteriaBuilder.equal(any(), any())).thenReturn(criteriaBuilder.conjunction());
        when(criteriaQuery.where(any(Predicate[].class))).thenReturn(criteriaQuery);
        when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(employments);

        // Act
        List<Employment> result = dao.findByAttributes(attributes);

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
        List<Employment> employments = createEmploymentList(10);
        String query = "Select t from Employment t";

        when(entityManager.createQuery(query)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(employments);

        // Act
        List<Employment> result = dao.dumpData();

        // Assert
        assertThat(result).hasSize(10);
    }

    @Test
    @DisplayName("Should handle empty table when dumping data")
    void dumpDataHandlesEmptyTable() {
        // Arrange
        String query = "Select t from Employment t";

        when(entityManager.createQuery(query)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<Employment> result = dao.dumpData();

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should persist multiple employments")
    void persistMultipleEmployments() {
        // Arrange
        Employment employment1 = createEmployment(1);
        Employment employment2 = createEmployment(2);

        // Act
        dao.persist(employment1);
        dao.persist(employment2);

        // Assert
        verify(entityManager, times(2)).persist(any(Employment.class));
        verify(entityManager, times(2)).flush();
        verify(entityManager, times(2)).refresh(any(Employment.class));
    }

    @Test
    @DisplayName("Should update multiple employments")
    void updateMultipleEmployments() {
        // Arrange
        Employment employment1 = createEmployment(1);
        Employment employment2 = createEmployment(2);

        when(entityManager.merge(any(Employment.class)))
            .thenAnswer(i -> i.getArguments()[0]);

        // Act
        dao.update(employment1);
        dao.update(employment2);

        // Assert
        verify(entityManager, times(2)).merge(any(Employment.class));
    }

    @Test
    @DisplayName("Should handle null attributes in findByAttributes")
    void findByAttributesWithNullAttributes() {
        // Arrange
        Map<String, Object> attributes = new HashMap<>();

        when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
        when(criteriaBuilder.createQuery(Employment.class)).thenReturn(criteriaQuery);
        when(criteriaQuery.from(Employment.class)).thenReturn(root);
        when(criteriaQuery.where(any(Predicate[].class))).thenReturn(criteriaQuery);
        when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<Employment> result = dao.findByAttributes(attributes);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle finding by PK with null ID")
    void findByPKWithNullId() {
        // Arrange
        when(entityManager.find(Employment.class, null))
            .thenReturn(null);

        // Act
        Employment result = dao.findByPK(null);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should correctly identify entity class")
    void entityClassIsCorrect() {
        // Arrange & Act
        Class<?> entityClass = (Class<?>) ReflectionTestUtils.getField(dao, "entityClass");

        // Assert
        assertThat(entityClass).isEqualTo(Employment.class);
    }

    @Test
    @DisplayName("Should handle consecutive find operations")
    void consecutiveFindOperations() {
        // Arrange
        Employment employment = createEmployment(1);
        when(entityManager.find(Employment.class, 1))
            .thenReturn(employment);

        // Act
        Employment result1 = dao.findByPK(1);
        Employment result2 = dao.findByPK(1);

        // Assert
        assertThat(result1).isEqualTo(result2);
        verify(entityManager, times(2)).find(Employment.class, 1);
    }

    @Test
    @DisplayName("Should persist employment with all properties")
    void persistEmploymentWithAllProperties() {
        // Arrange
        Employment employment = createEmployment(1);
        employment.setEmploymentType("Contract");

        // Act
        dao.persist(employment);

        // Assert
        verify(entityManager).persist(employment);
        assertThat(employment.getEmploymentId()).isEqualTo(1);
        assertThat(employment.getEmploymentType()).isEqualTo("Contract");
    }

    @Test
    @DisplayName("Should handle update of employment with modified properties")
    void updateEmploymentWithModifiedProperties() {
        // Arrange
        Employment original = createEmployment(1);
        original.setEmploymentType("Part-time");

        Employment merged = createEmployment(1);
        merged.setEmploymentType("Full-time");

        when(entityManager.merge(original)).thenReturn(merged);

        // Act
        Employment result = dao.update(original);

        // Assert
        assertThat(result.getEmploymentType()).isEqualTo("Full-time");
    }

    private Employment createEmployment(Integer id) {
        Employment employment = new Employment();
        employment.setEmploymentId(id);
        employment.setEmploymentType("Full-time");
        return employment;
    }

    private List<Employment> createEmploymentList(int count) {
        List<Employment> employments = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            employments.add(createEmployment(i));
        }
        return employments;
    }
}
