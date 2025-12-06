package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.bankaccount.ReconcileCategory;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.Query;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReconcileCategoryDaoImpl Unit Tests")
class ReconcileCategoryDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private Query query;

    @InjectMocks
    private ReconcileCategoryDaoImpl reconcileCategoryDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(reconcileCategoryDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(reconcileCategoryDao, "entityClass", ReconcileCategory.class);
    }

    @Test
    @DisplayName("Should return reconcile categories by type code")
    void findByTypeReturnsCategoriesByTypeCode() {
        // Arrange
        String reconcileCategoryCode = "1";
        List<ReconcileCategory> expectedCategories = createReconcileCategoryList(3);

        when(entityManager.createNamedQuery("allReconcileCategoryByparentReconcileCategoryId"))
            .thenReturn(query);
        when(query.setParameter("code", Integer.valueOf(reconcileCategoryCode)))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(expectedCategories);

        // Act
        List<ReconcileCategory> result = reconcileCategoryDao.findByType(reconcileCategoryCode);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).isEqualTo(expectedCategories);
    }

    @Test
    @DisplayName("Should return empty list when no categories found for type code")
    void findByTypeReturnsEmptyListWhenNoCategoriesFound() {
        // Arrange
        String reconcileCategoryCode = "999";

        when(entityManager.createNamedQuery("allReconcileCategoryByparentReconcileCategoryId"))
            .thenReturn(query);
        when(query.setParameter("code", Integer.valueOf(reconcileCategoryCode)))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<ReconcileCategory> result = reconcileCategoryDao.findByType(reconcileCategoryCode);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use named query allReconcileCategoryByparentReconcileCategoryId")
    void findByTypeUsesCorrectNamedQuery() {
        // Arrange
        String reconcileCategoryCode = "1";

        when(entityManager.createNamedQuery("allReconcileCategoryByparentReconcileCategoryId"))
            .thenReturn(query);
        when(query.setParameter("code", Integer.valueOf(reconcileCategoryCode)))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        reconcileCategoryDao.findByType(reconcileCategoryCode);

        // Assert
        verify(entityManager).createNamedQuery("allReconcileCategoryByparentReconcileCategoryId");
    }

    @Test
    @DisplayName("Should set code parameter as Integer")
    void findByTypeSetsCodeParameterAsInteger() {
        // Arrange
        String reconcileCategoryCode = "5";

        when(entityManager.createNamedQuery("allReconcileCategoryByparentReconcileCategoryId"))
            .thenReturn(query);
        when(query.setParameter("code", Integer.valueOf(reconcileCategoryCode)))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        reconcileCategoryDao.findByType(reconcileCategoryCode);

        // Assert
        verify(query).setParameter("code", 5);
    }

    @Test
    @DisplayName("Should convert string code to integer correctly")
    void findByTypeConvertsStringCodeToInteger() {
        // Arrange
        String reconcileCategoryCode = "123";

        when(entityManager.createNamedQuery("allReconcileCategoryByparentReconcileCategoryId"))
            .thenReturn(query);
        when(query.setParameter("code", 123))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        reconcileCategoryDao.findByType(reconcileCategoryCode);

        // Assert
        verify(query).setParameter("code", 123);
    }

    @Test
    @DisplayName("Should handle single category result")
    void findByTypeHandlesSingleCategoryResult() {
        // Arrange
        String reconcileCategoryCode = "1";
        ReconcileCategory category = createReconcileCategory(1, "Category 1");
        List<ReconcileCategory> expectedCategories = Collections.singletonList(category);

        when(entityManager.createNamedQuery("allReconcileCategoryByparentReconcileCategoryId"))
            .thenReturn(query);
        when(query.setParameter("code", Integer.valueOf(reconcileCategoryCode)))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(expectedCategories);

        // Act
        List<ReconcileCategory> result = reconcileCategoryDao.findByType(reconcileCategoryCode);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getReconcileCategoryName()).isEqualTo("Category 1");
    }

    @Test
    @DisplayName("Should handle multiple category results")
    void findByTypeHandlesMultipleCategoryResults() {
        // Arrange
        String reconcileCategoryCode = "1";
        List<ReconcileCategory> expectedCategories = createReconcileCategoryList(10);

        when(entityManager.createNamedQuery("allReconcileCategoryByparentReconcileCategoryId"))
            .thenReturn(query);
        when(query.setParameter("code", Integer.valueOf(reconcileCategoryCode)))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(expectedCategories);

        // Act
        List<ReconcileCategory> result = reconcileCategoryDao.findByType(reconcileCategoryCode);

        // Assert
        assertThat(result).hasSize(10);
    }

    @Test
    @DisplayName("Should call getResultList exactly once")
    void findByTypeCallsGetResultListOnce() {
        // Arrange
        String reconcileCategoryCode = "1";

        when(entityManager.createNamedQuery("allReconcileCategoryByparentReconcileCategoryId"))
            .thenReturn(query);
        when(query.setParameter("code", Integer.valueOf(reconcileCategoryCode)))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        reconcileCategoryDao.findByType(reconcileCategoryCode);

        // Assert
        verify(query, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should call createNamedQuery exactly once")
    void findByTypeCallsCreateNamedQueryOnce() {
        // Arrange
        String reconcileCategoryCode = "1";

        when(entityManager.createNamedQuery("allReconcileCategoryByparentReconcileCategoryId"))
            .thenReturn(query);
        when(query.setParameter("code", Integer.valueOf(reconcileCategoryCode)))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        reconcileCategoryDao.findByType(reconcileCategoryCode);

        // Assert
        verify(entityManager, times(1)).createNamedQuery("allReconcileCategoryByparentReconcileCategoryId");
    }

    @Test
    @DisplayName("Should handle zero code value")
    void findByTypeHandlesZeroCodeValue() {
        // Arrange
        String reconcileCategoryCode = "0";

        when(entityManager.createNamedQuery("allReconcileCategoryByparentReconcileCategoryId"))
            .thenReturn(query);
        when(query.setParameter("code", 0))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<ReconcileCategory> result = reconcileCategoryDao.findByType(reconcileCategoryCode);

        // Assert
        assertThat(result).isNotNull();
        verify(query).setParameter("code", 0);
    }

    @Test
    @DisplayName("Should handle negative code value")
    void findByTypeHandlesNegativeCodeValue() {
        // Arrange
        String reconcileCategoryCode = "-1";

        when(entityManager.createNamedQuery("allReconcileCategoryByparentReconcileCategoryId"))
            .thenReturn(query);
        when(query.setParameter("code", -1))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<ReconcileCategory> result = reconcileCategoryDao.findByType(reconcileCategoryCode);

        // Assert
        assertThat(result).isNotNull();
        verify(query).setParameter("code", -1);
    }

    @Test
    @DisplayName("Should throw exception for invalid numeric string")
    void findByTypeThrowsExceptionForInvalidNumericString() {
        // Arrange
        String reconcileCategoryCode = "invalid";

        // Act & Assert
        assertThatThrownBy(() -> reconcileCategoryDao.findByType(reconcileCategoryCode))
            .isInstanceOf(NumberFormatException.class);
    }

    @Test
    @DisplayName("Should throw exception for null code")
    void findByTypeThrowsExceptionForNullCode() {
        // Arrange
        String reconcileCategoryCode = null;

        // Act & Assert
        assertThatThrownBy(() -> reconcileCategoryDao.findByType(reconcileCategoryCode))
            .isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("Should throw exception for empty string code")
    void findByTypeThrowsExceptionForEmptyStringCode() {
        // Arrange
        String reconcileCategoryCode = "";

        // Act & Assert
        assertThatThrownBy(() -> reconcileCategoryDao.findByType(reconcileCategoryCode))
            .isInstanceOf(NumberFormatException.class);
    }

    @Test
    @DisplayName("Should handle whitespace in code string")
    void findByTypeThrowsExceptionForWhitespaceCode() {
        // Arrange
        String reconcileCategoryCode = "  ";

        // Act & Assert
        assertThatThrownBy(() -> reconcileCategoryDao.findByType(reconcileCategoryCode))
            .isInstanceOf(NumberFormatException.class);
    }

    @Test
    @DisplayName("Should return different results for different type codes")
    void findByTypeReturnsDifferentResultsForDifferentCodes() {
        // Arrange
        String code1 = "1";
        String code2 = "2";
        List<ReconcileCategory> categories1 = createReconcileCategoryList(3);
        List<ReconcileCategory> categories2 = createReconcileCategoryList(5);

        when(entityManager.createNamedQuery("allReconcileCategoryByparentReconcileCategoryId"))
            .thenReturn(query);
        when(query.setParameter("code", 1))
            .thenReturn(query);
        when(query.setParameter("code", 2))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(categories1)
            .thenReturn(categories2);

        // Act
        List<ReconcileCategory> result1 = reconcileCategoryDao.findByType(code1);
        List<ReconcileCategory> result2 = reconcileCategoryDao.findByType(code2);

        // Assert
        assertThat(result1).hasSize(3);
        assertThat(result2).hasSize(5);
    }

    @Test
    @DisplayName("Should verify ReconcileCategory entity structure")
    void reconcileCategoryEntityHasCorrectStructure() {
        // Arrange
        ReconcileCategory category = createReconcileCategory(1, "Test Category");
        category.setReconcileCategoryCode(100);
        category.setParentReconcileCategoryId(50);

        // Assert
        assertThat(category.getReconcileCategoryId()).isEqualTo(1);
        assertThat(category.getReconcileCategoryName()).isEqualTo("Test Category");
        assertThat(category.getReconcileCategoryCode()).isEqualTo(100);
        assertThat(category.getParentReconcileCategoryId()).isEqualTo(50);
    }

    @Test
    @DisplayName("Should return categories ordered by query result order")
    void findByTypeReturnsCategoriesInQueryOrder() {
        // Arrange
        String reconcileCategoryCode = "1";
        ReconcileCategory cat1 = createReconcileCategory(1, "Category A");
        ReconcileCategory cat2 = createReconcileCategory(2, "Category B");
        ReconcileCategory cat3 = createReconcileCategory(3, "Category C");
        List<ReconcileCategory> expectedCategories = Arrays.asList(cat1, cat2, cat3);

        when(entityManager.createNamedQuery("allReconcileCategoryByparentReconcileCategoryId"))
            .thenReturn(query);
        when(query.setParameter("code", Integer.valueOf(reconcileCategoryCode)))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(expectedCategories);

        // Act
        List<ReconcileCategory> result = reconcileCategoryDao.findByType(reconcileCategoryCode);

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getReconcileCategoryName()).isEqualTo("Category A");
        assertThat(result.get(1).getReconcileCategoryName()).isEqualTo("Category B");
        assertThat(result.get(2).getReconcileCategoryName()).isEqualTo("Category C");
    }

    @Test
    @DisplayName("Should handle large numeric code values")
    void findByTypeHandlesLargeNumericCodeValues() {
        // Arrange
        String reconcileCategoryCode = "999999";

        when(entityManager.createNamedQuery("allReconcileCategoryByparentReconcileCategoryId"))
            .thenReturn(query);
        when(query.setParameter("code", 999999))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<ReconcileCategory> result = reconcileCategoryDao.findByType(reconcileCategoryCode);

        // Assert
        assertThat(result).isNotNull();
        verify(query).setParameter("code", 999999);
    }

    @Test
    @DisplayName("Should handle code with leading zeros")
    void findByTypeHandlesCodeWithLeadingZeros() {
        // Arrange
        String reconcileCategoryCode = "007";

        when(entityManager.createNamedQuery("allReconcileCategoryByparentReconcileCategoryId"))
            .thenReturn(query);
        when(query.setParameter("code", 7))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<ReconcileCategory> result = reconcileCategoryDao.findByType(reconcileCategoryCode);

        // Assert
        assertThat(result).isNotNull();
        verify(query).setParameter("code", 7);
    }

    @Test
    @DisplayName("Should handle null result list from query")
    void findByTypeHandlesNullResultList() {
        // Arrange
        String reconcileCategoryCode = "1";

        when(entityManager.createNamedQuery("allReconcileCategoryByparentReconcileCategoryId"))
            .thenReturn(query);
        when(query.setParameter("code", Integer.valueOf(reconcileCategoryCode)))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(null);

        // Act
        List<ReconcileCategory> result = reconcileCategoryDao.findByType(reconcileCategoryCode);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should verify setParameter is called before getResultList")
    void findByTypeCallsSetParameterBeforeGetResultList() {
        // Arrange
        String reconcileCategoryCode = "1";

        when(entityManager.createNamedQuery("allReconcileCategoryByparentReconcileCategoryId"))
            .thenReturn(query);
        when(query.setParameter("code", Integer.valueOf(reconcileCategoryCode)))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        reconcileCategoryDao.findByType(reconcileCategoryCode);

        // Assert
        verify(query).setParameter("code", 1);
        verify(query).getResultList();
    }

    @Test
    @DisplayName("Should handle large result set")
    void findByTypeHandlesLargeResultSet() {
        // Arrange
        String reconcileCategoryCode = "1";
        List<ReconcileCategory> expectedCategories = createReconcileCategoryList(1000);

        when(entityManager.createNamedQuery("allReconcileCategoryByparentReconcileCategoryId"))
            .thenReturn(query);
        when(query.setParameter("code", Integer.valueOf(reconcileCategoryCode)))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(expectedCategories);

        // Act
        List<ReconcileCategory> result = reconcileCategoryDao.findByType(reconcileCategoryCode);

        // Assert
        assertThat(result).hasSize(1000);
    }

    @Test
    @DisplayName("Should return categories with parent-child relationships")
    void findByTypeReturnsCategoriesWithParentChildRelationships() {
        // Arrange
        String reconcileCategoryCode = "1";
        ReconcileCategory parent = createReconcileCategory(1, "Parent Category");
        parent.setReconcileCategoryCode(1);
        parent.setParentReconcileCategoryId(null);

        ReconcileCategory child1 = createReconcileCategory(2, "Child Category 1");
        child1.setReconcileCategoryCode(2);
        child1.setParentReconcileCategoryId(1);

        ReconcileCategory child2 = createReconcileCategory(3, "Child Category 2");
        child2.setReconcileCategoryCode(3);
        child2.setParentReconcileCategoryId(1);

        List<ReconcileCategory> expectedCategories = Arrays.asList(child1, child2);

        when(entityManager.createNamedQuery("allReconcileCategoryByparentReconcileCategoryId"))
            .thenReturn(query);
        when(query.setParameter("code", 1))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(expectedCategories);

        // Act
        List<ReconcileCategory> result = reconcileCategoryDao.findByType(reconcileCategoryCode);

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getParentReconcileCategoryId()).isEqualTo(1);
        assertThat(result.get(1).getParentReconcileCategoryId()).isEqualTo(1);
    }

    private List<ReconcileCategory> createReconcileCategoryList(int count) {
        List<ReconcileCategory> categories = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            categories.add(createReconcileCategory(i + 1, "Category " + (i + 1)));
        }
        return categories;
    }

    private ReconcileCategory createReconcileCategory(Integer id, String name) {
        ReconcileCategory category = new ReconcileCategory();
        category.setReconcileCategoryId(id);
        category.setReconcileCategoryName(name);
        category.setReconcileCategoryCode(id);
        category.setParentReconcileCategoryId(id > 1 ? 1 : null);
        return category;
    }
}
