package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.ChartOfAccountCategory;
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
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("ChartOfAccountCategoryDaoImpl Unit Tests")
class ChartOfAccountCategoryDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<ChartOfAccountCategory> typedQuery;

    @InjectMocks
    private ChartOfAccountCategoryDaoImpl chartOfAccountCategoryDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(chartOfAccountCategoryDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(chartOfAccountCategoryDao, "entityClass", ChartOfAccountCategory.class);
    }

    @Test
    @DisplayName("Should return list of chart of account categories")
    void getChartOfAccountCategoryListReturnsCategories() {
        // Arrange
        List<ChartOfAccountCategory> expectedCategories = createCategoryList(5);
        when(entityManager.createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedCategories);

        // Act
        List<ChartOfAccountCategory> result = chartOfAccountCategoryDao.getChartOfAccountCategoryList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).isEqualTo(expectedCategories);
    }

    @Test
    @DisplayName("Should return empty list when no categories exist")
    void getChartOfAccountCategoryListReturnsEmptyListWhenNoCategories() {
        // Arrange
        when(entityManager.createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<ChartOfAccountCategory> result = chartOfAccountCategoryDao.getChartOfAccountCategoryList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use allChartOfAccountCategory named query")
    void getChartOfAccountCategoryListUsesCorrectNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        chartOfAccountCategoryDao.getChartOfAccountCategoryList();

        // Assert
        verify(entityManager).createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class);
    }

    @Test
    @DisplayName("Should handle null result from query")
    void getChartOfAccountCategoryListHandlesNullResult() {
        // Arrange
        when(entityManager.createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(null);

        // Act
        List<ChartOfAccountCategory> result = chartOfAccountCategoryDao.getChartOfAccountCategoryList();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return single category when only one exists")
    void getChartOfAccountCategoryListReturnsSingleCategory() {
        // Arrange
        List<ChartOfAccountCategory> categories = Collections.singletonList(
            createCategory(1, "Assets")
        );
        when(entityManager.createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(categories);

        // Act
        List<ChartOfAccountCategory> result = chartOfAccountCategoryDao.getChartOfAccountCategoryList();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getChartOfAccountCategoryName()).isEqualTo("Assets");
    }

    @Test
    @DisplayName("Should return all categories in correct order")
    void getChartOfAccountCategoryListReturnsInCorrectOrder() {
        // Arrange
        ChartOfAccountCategory category1 = createCategory(1, "Assets");
        ChartOfAccountCategory category2 = createCategory(2, "Liabilities");
        ChartOfAccountCategory category3 = createCategory(3, "Equity");
        List<ChartOfAccountCategory> categories = Arrays.asList(category1, category2, category3);

        when(entityManager.createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(categories);

        // Act
        List<ChartOfAccountCategory> result = chartOfAccountCategoryDao.getChartOfAccountCategoryList();

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getChartOfAccountCategoryName()).isEqualTo("Assets");
        assertThat(result.get(1).getChartOfAccountCategoryName()).isEqualTo("Liabilities");
        assertThat(result.get(2).getChartOfAccountCategoryName()).isEqualTo("Equity");
    }

    @Test
    @DisplayName("Should call getResultList exactly once")
    void getChartOfAccountCategoryListCallsGetResultListOnce() {
        // Arrange
        when(entityManager.createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        chartOfAccountCategoryDao.getChartOfAccountCategoryList();

        // Assert
        verify(typedQuery, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should call createNamedQuery exactly once")
    void getChartOfAccountCategoryListCallsCreateNamedQueryOnce() {
        // Arrange
        when(entityManager.createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        chartOfAccountCategoryDao.getChartOfAccountCategoryList();

        // Assert
        verify(entityManager, times(1)).createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class);
    }

    @Test
    @DisplayName("Should return categories with different IDs")
    void getChartOfAccountCategoryListReturnsCategoriesWithDifferentIds() {
        // Arrange
        List<ChartOfAccountCategory> categories = createCategoryList(3);
        when(entityManager.createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(categories);

        // Act
        List<ChartOfAccountCategory> result = chartOfAccountCategoryDao.getChartOfAccountCategoryList();

        // Assert
        assertThat(result.get(0).getChartOfAccountCategoryId()).isEqualTo(1);
        assertThat(result.get(1).getChartOfAccountCategoryId()).isEqualTo(2);
        assertThat(result.get(2).getChartOfAccountCategoryId()).isEqualTo(3);
    }

    @Test
    @DisplayName("Should handle large number of categories")
    void getChartOfAccountCategoryListHandlesLargeNumberOfCategories() {
        // Arrange
        List<ChartOfAccountCategory> categories = createCategoryList(100);
        when(entityManager.createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(categories);

        // Act
        List<ChartOfAccountCategory> result = chartOfAccountCategoryDao.getChartOfAccountCategoryList();

        // Assert
        assertThat(result).hasSize(100);
    }

    @Test
    @DisplayName("Should return consistent results on multiple calls")
    void getChartOfAccountCategoryListReturnsConsistentResults() {
        // Arrange
        List<ChartOfAccountCategory> categories = createCategoryList(3);
        when(entityManager.createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(categories);

        // Act
        List<ChartOfAccountCategory> result1 = chartOfAccountCategoryDao.getChartOfAccountCategoryList();
        List<ChartOfAccountCategory> result2 = chartOfAccountCategoryDao.getChartOfAccountCategoryList();

        // Assert
        assertThat(result1).isEqualTo(result2);
    }

    @Test
    @DisplayName("Should verify entity manager is called")
    void getChartOfAccountCategoryListVerifiesEntityManagerCalled() {
        // Arrange
        when(entityManager.createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        chartOfAccountCategoryDao.getChartOfAccountCategoryList();

        // Assert
        verify(entityManager).createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class);
    }

    @Test
    @DisplayName("Should return categories with all properties set")
    void getChartOfAccountCategoryListReturnsCategoriesWithAllProperties() {
        // Arrange
        ChartOfAccountCategory category = new ChartOfAccountCategory();
        category.setChartOfAccountCategoryId(1);
        category.setChartOfAccountCategoryName("Revenue");
        category.setChartOfAccountCategoryCode("REV");

        List<ChartOfAccountCategory> categories = Collections.singletonList(category);
        when(entityManager.createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(categories);

        // Act
        List<ChartOfAccountCategory> result = chartOfAccountCategoryDao.getChartOfAccountCategoryList();

        // Assert
        assertThat(result.get(0).getChartOfAccountCategoryId()).isEqualTo(1);
        assertThat(result.get(0).getChartOfAccountCategoryName()).isEqualTo("Revenue");
        assertThat(result.get(0).getChartOfAccountCategoryCode()).isEqualTo("REV");
    }

    @Test
    @DisplayName("Should not modify returned list")
    void getChartOfAccountCategoryListDoesNotModifyReturnedList() {
        // Arrange
        List<ChartOfAccountCategory> categories = createCategoryList(3);
        when(entityManager.createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(categories);

        // Act
        List<ChartOfAccountCategory> result = chartOfAccountCategoryDao.getChartOfAccountCategoryList();

        // Assert
        assertThat(result).isSameAs(categories);
    }

    @Test
    @DisplayName("Should return different instances for different categories")
    void getChartOfAccountCategoryListReturnsDifferentInstances() {
        // Arrange
        List<ChartOfAccountCategory> categories = createCategoryList(2);
        when(entityManager.createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(categories);

        // Act
        List<ChartOfAccountCategory> result = chartOfAccountCategoryDao.getChartOfAccountCategoryList();

        // Assert
        assertThat(result.get(0)).isNotSameAs(result.get(1));
    }

    @Test
    @DisplayName("Should execute query without parameters")
    void getChartOfAccountCategoryListExecutesQueryWithoutParameters() {
        // Arrange
        when(entityManager.createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        chartOfAccountCategoryDao.getChartOfAccountCategoryList();

        // Assert
        verify(typedQuery, never()).setParameter(any(String.class), any());
    }

    @Test
    @DisplayName("Should use correct entity class")
    void getChartOfAccountCategoryListUsesCorrectEntityClass() {
        // Arrange
        when(entityManager.createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        chartOfAccountCategoryDao.getChartOfAccountCategoryList();

        // Assert
        verify(entityManager).createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class);
    }

    @Test
    @DisplayName("Should return list reference directly from query")
    void getChartOfAccountCategoryListReturnsDirectReference() {
        // Arrange
        List<ChartOfAccountCategory> expectedList = createCategoryList(3);
        when(entityManager.createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedList);

        // Act
        List<ChartOfAccountCategory> result = chartOfAccountCategoryDao.getChartOfAccountCategoryList();

        // Assert
        assertThat(result).isSameAs(expectedList);
    }

    @Test
    @DisplayName("Should handle categories with various names")
    void getChartOfAccountCategoryListHandlesVariousNames() {
        // Arrange
        ChartOfAccountCategory cat1 = createCategory(1, "Current Assets");
        ChartOfAccountCategory cat2 = createCategory(2, "Non-Current Assets");
        ChartOfAccountCategory cat3 = createCategory(3, "Current Liabilities");
        List<ChartOfAccountCategory> categories = Arrays.asList(cat1, cat2, cat3);

        when(entityManager.createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(categories);

        // Act
        List<ChartOfAccountCategory> result = chartOfAccountCategoryDao.getChartOfAccountCategoryList();

        // Assert
        assertThat(result).extracting(ChartOfAccountCategory::getChartOfAccountCategoryName)
            .containsExactly("Current Assets", "Non-Current Assets", "Current Liabilities");
    }

    @Test
    @DisplayName("Should delegate to executeNamedQuery method")
    void getChartOfAccountCategoryListDelegatesToExecuteNamedQuery() {
        // Arrange
        List<ChartOfAccountCategory> categories = createCategoryList(2);
        when(entityManager.createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(categories);

        // Act
        List<ChartOfAccountCategory> result = chartOfAccountCategoryDao.getChartOfAccountCategoryList();

        // Assert
        assertThat(result).isNotNull();
        verify(entityManager).createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class);
    }

    @Test
    @DisplayName("Should return categories with sequential IDs")
    void getChartOfAccountCategoryListReturnsCategoriesWithSequentialIds() {
        // Arrange
        List<ChartOfAccountCategory> categories = createCategoryList(5);
        when(entityManager.createNamedQuery("allChartOfAccountCategory", ChartOfAccountCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(categories);

        // Act
        List<ChartOfAccountCategory> result = chartOfAccountCategoryDao.getChartOfAccountCategoryList();

        // Assert
        for (int i = 0; i < result.size(); i++) {
            assertThat(result.get(i).getChartOfAccountCategoryId()).isEqualTo(i + 1);
        }
    }

    private List<ChartOfAccountCategory> createCategoryList(int count) {
        List<ChartOfAccountCategory> categories = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            categories.add(createCategory(i + 1, "Category " + (i + 1)));
        }
        return categories;
    }

    private ChartOfAccountCategory createCategory(int id, String name) {
        ChartOfAccountCategory category = new ChartOfAccountCategory();
        category.setChartOfAccountCategoryId(id);
        category.setChartOfAccountCategoryName(name);
        category.setChartOfAccountCategoryCode("CODE" + id);
        return category;
    }
}
