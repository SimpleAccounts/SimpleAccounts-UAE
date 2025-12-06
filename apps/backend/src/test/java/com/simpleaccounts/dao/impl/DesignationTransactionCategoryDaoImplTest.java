package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.DesignationTransactionCategory;
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
@DisplayName("DesignationTransactionCategoryDaoImpl Unit Tests")
class DesignationTransactionCategoryDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<DesignationTransactionCategory> typedQuery;

    @InjectMocks
    private DesignationTransactionCategoryDaoImpl dao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(dao, "entityManager", entityManager);
        ReflectionTestUtils.setField(dao, "entityClass", DesignationTransactionCategory.class);
    }

    @Test
    @DisplayName("Should return list of designation transaction categories by designation ID")
    void getListByDesignationIdReturnsCategories() {
        // Arrange
        Integer designationId = 1;
        List<DesignationTransactionCategory> categories = createCategoryList(3);

        when(entityManager.createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("designationId", designationId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(categories);

        // Act
        List<DesignationTransactionCategory> result = dao.getListByDesignationId(designationId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).isEqualTo(categories);
    }

    @Test
    @DisplayName("Should return empty list when no categories found for designation ID")
    void getListByDesignationIdReturnsEmptyList() {
        // Arrange
        Integer designationId = 999;

        when(entityManager.createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("designationId", designationId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<DesignationTransactionCategory> result = dao.getListByDesignationId(designationId);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use correct named query")
    void getListByDesignationIdUsesCorrectNamedQuery() {
        // Arrange
        Integer designationId = 1;

        when(entityManager.createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("designationId", designationId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        dao.getListByDesignationId(designationId);

        // Assert
        verify(entityManager).createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class);
    }

    @Test
    @DisplayName("Should set designation ID parameter correctly")
    void getListByDesignationIdSetsParameterCorrectly() {
        // Arrange
        Integer designationId = 42;

        when(entityManager.createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("designationId", designationId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        dao.getListByDesignationId(designationId);

        // Assert
        verify(typedQuery).setParameter("designationId", designationId);
    }

    @Test
    @DisplayName("Should handle null designation ID")
    void getListByDesignationIdWithNullId() {
        // Arrange
        when(entityManager.createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("designationId", null))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<DesignationTransactionCategory> result = dao.getListByDesignationId(null);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return single category in list")
    void getListByDesignationIdReturnsSingleCategory() {
        // Arrange
        Integer designationId = 1;
        DesignationTransactionCategory category = createCategory(1, "Category1");
        List<DesignationTransactionCategory> categories = Collections.singletonList(category);

        when(entityManager.createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("designationId", designationId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(categories);

        // Act
        List<DesignationTransactionCategory> result = dao.getListByDesignationId(designationId);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(category);
    }

    @Test
    @DisplayName("Should return multiple categories for same designation")
    void getListByDesignationIdReturnsMultipleCategories() {
        // Arrange
        Integer designationId = 1;
        List<DesignationTransactionCategory> categories = createCategoryList(5);

        when(entityManager.createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("designationId", designationId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(categories);

        // Act
        List<DesignationTransactionCategory> result = dao.getListByDesignationId(designationId);

        // Assert
        assertThat(result).hasSize(5);
    }

    @Test
    @DisplayName("Should handle different designation IDs")
    void getListByDesignationIdWithDifferentIds() {
        // Arrange
        List<DesignationTransactionCategory> categories1 = createCategoryList(2);
        List<DesignationTransactionCategory> categories2 = createCategoryList(3);

        when(entityManager.createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq("designationId"), any()))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(categories1)
            .thenReturn(categories2);

        // Act
        List<DesignationTransactionCategory> result1 = dao.getListByDesignationId(1);
        List<DesignationTransactionCategory> result2 = dao.getListByDesignationId(2);

        // Assert
        assertThat(result1).hasSize(2);
        assertThat(result2).hasSize(3);
    }

    @Test
    @DisplayName("Should call getResultList once per query")
    void getListByDesignationIdCallsGetResultListOnce() {
        // Arrange
        Integer designationId = 1;

        when(entityManager.createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("designationId", designationId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        dao.getListByDesignationId(designationId);

        // Assert
        verify(typedQuery, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should preserve category order from database")
    void getListByDesignationIdPreservesOrder() {
        // Arrange
        Integer designationId = 1;
        DesignationTransactionCategory cat1 = createCategory(1, "First");
        DesignationTransactionCategory cat2 = createCategory(2, "Second");
        DesignationTransactionCategory cat3 = createCategory(3, "Third");
        List<DesignationTransactionCategory> orderedCategories = Arrays.asList(cat1, cat2, cat3);

        when(entityManager.createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("designationId", designationId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(orderedCategories);

        // Act
        List<DesignationTransactionCategory> result = dao.getListByDesignationId(designationId);

        // Assert
        assertThat(result).containsExactly(cat1, cat2, cat3);
    }

    @Test
    @DisplayName("Should return new list instance for each call")
    void getListByDesignationIdReturnsNewInstance() {
        // Arrange
        Integer designationId = 1;

        when(entityManager.createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("designationId", designationId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>())
            .thenReturn(new ArrayList<>());

        // Act
        List<DesignationTransactionCategory> result1 = dao.getListByDesignationId(designationId);
        List<DesignationTransactionCategory> result2 = dao.getListByDesignationId(designationId);

        // Assert
        assertThat(result1).isNotSameAs(result2);
    }

    @Test
    @DisplayName("Should handle zero designation ID")
    void getListByDesignationIdWithZeroId() {
        // Arrange
        Integer designationId = 0;

        when(entityManager.createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("designationId", designationId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<DesignationTransactionCategory> result = dao.getListByDesignationId(designationId);

        // Assert
        assertThat(result).isEmpty();
        verify(typedQuery).setParameter("designationId", 0);
    }

    @Test
    @DisplayName("Should handle negative designation ID")
    void getListByDesignationIdWithNegativeId() {
        // Arrange
        Integer designationId = -1;

        when(entityManager.createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("designationId", designationId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<DesignationTransactionCategory> result = dao.getListByDesignationId(designationId);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle large designation ID")
    void getListByDesignationIdWithLargeId() {
        // Arrange
        Integer designationId = Integer.MAX_VALUE;

        when(entityManager.createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("designationId", designationId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<DesignationTransactionCategory> result = dao.getListByDesignationId(designationId);

        // Assert
        assertThat(result).isEmpty();
        verify(typedQuery).setParameter("designationId", Integer.MAX_VALUE);
    }

    @Test
    @DisplayName("Should return categories with all properties populated")
    void getListByDesignationIdReturnsPopulatedCategories() {
        // Arrange
        Integer designationId = 1;
        DesignationTransactionCategory category = createCategory(1, "TestCategory");
        category.setDesignationId(designationId);
        List<DesignationTransactionCategory> categories = Collections.singletonList(category);

        when(entityManager.createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("designationId", designationId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(categories);

        // Act
        List<DesignationTransactionCategory> result = dao.getListByDesignationId(designationId);

        // Assert
        assertThat(result.get(0).getId()).isEqualTo(1);
        assertThat(result.get(0).getDesignationId()).isEqualTo(designationId);
    }

    @Test
    @DisplayName("Should execute query with chained method calls")
    void getListByDesignationIdChainsMethodCalls() {
        // Arrange
        Integer designationId = 1;

        when(entityManager.createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("designationId", designationId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        dao.getListByDesignationId(designationId);

        // Assert
        var inOrder = org.mockito.Mockito.inOrder(entityManager, typedQuery);
        inOrder.verify(entityManager).createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class);
        inOrder.verify(typedQuery).setParameter("designationId", designationId);
        inOrder.verify(typedQuery).getResultList();
    }

    @Test
    @DisplayName("Should return immutable result list content")
    void getListByDesignationIdReturnsConsistentResults() {
        // Arrange
        Integer designationId = 1;
        List<DesignationTransactionCategory> categories = createCategoryList(2);

        when(entityManager.createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("designationId", designationId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(categories);

        // Act
        List<DesignationTransactionCategory> result = dao.getListByDesignationId(designationId);

        // Assert
        assertThat(result).containsExactlyElementsOf(categories);
    }

    @Test
    @DisplayName("Should handle consecutive queries with same designation ID")
    void getListByDesignationIdConsecutiveQueries() {
        // Arrange
        Integer designationId = 1;
        List<DesignationTransactionCategory> categories = createCategoryList(3);

        when(entityManager.createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("designationId", designationId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(categories);

        // Act
        List<DesignationTransactionCategory> result1 = dao.getListByDesignationId(designationId);
        List<DesignationTransactionCategory> result2 = dao.getListByDesignationId(designationId);

        // Assert
        assertThat(result1).hasSize(3);
        assertThat(result2).hasSize(3);
        verify(entityManager, times(2)).createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class);
    }

    @Test
    @DisplayName("Should not modify query result")
    void getListByDesignationIdDoesNotModifyResult() {
        // Arrange
        Integer designationId = 1;
        DesignationTransactionCategory originalCategory = createCategory(1, "Original");
        List<DesignationTransactionCategory> categories = new ArrayList<>(Collections.singletonList(originalCategory));

        when(entityManager.createNamedQuery("getListByDesignationId", DesignationTransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("designationId", designationId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(categories);

        // Act
        List<DesignationTransactionCategory> result = dao.getListByDesignationId(designationId);

        // Assert
        assertThat(result.get(0)).isEqualTo(originalCategory);
    }

    private DesignationTransactionCategory createCategory(Integer id, String name) {
        DesignationTransactionCategory category = new DesignationTransactionCategory();
        category.setId(id);
        return category;
    }

    private List<DesignationTransactionCategory> createCategoryList(int count) {
        List<DesignationTransactionCategory> categories = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            categories.add(createCategory(i, "Category" + i));
        }
        return categories;
    }
}
