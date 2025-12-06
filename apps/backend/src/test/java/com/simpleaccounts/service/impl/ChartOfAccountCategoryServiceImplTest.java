package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.ChartOfAccountCategoryDao;
import com.simpleaccounts.entity.ChartOfAccountCategory;
import com.simpleaccounts.exceptions.ServiceException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ChartOfAccountCategoryServiceImplTest {

    @Mock
    private ChartOfAccountCategoryDao dao;

    @InjectMocks
    private ChartOfAccountCategoryServiceImpl chartOfAccountCategoryService;

    private ChartOfAccountCategory testCategory;

    @BeforeEach
    void setUp() {
        testCategory = new ChartOfAccountCategory();
        testCategory.setChartOfAccountCategoryId(1);
        testCategory.setChartOfAccountCategoryCode("ASSETS");
        testCategory.setChartOfAccountCategoryName("Assets");
        testCategory.setChartOfAccountCategoryDescription("Asset Accounts");
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnDaoWhenGetDaoCalled() {
        assertThat(chartOfAccountCategoryService.getDao()).isEqualTo(dao);
    }

    // ========== findByPK Tests ==========

    @Test
    void shouldReturnCategoryWhenValidIdProvided() {
        when(dao.findByPK(1)).thenReturn(testCategory);

        ChartOfAccountCategory result = chartOfAccountCategoryService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testCategory);
        assertThat(result.getChartOfAccountCategoryId()).isEqualTo(1);
        assertThat(result.getChartOfAccountCategoryCode()).isEqualTo("ASSETS");
        verify(dao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenCategoryNotFoundByPK() {
        when(dao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> chartOfAccountCategoryService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(dao, times(1)).findByPK(999);
    }

    @Test
    void shouldReturnCategoryWithAllFieldsPopulated() {
        ChartOfAccountCategory fullCategory = new ChartOfAccountCategory();
        fullCategory.setChartOfAccountCategoryId(2);
        fullCategory.setChartOfAccountCategoryCode("LIABILITIES");
        fullCategory.setChartOfAccountCategoryName("Liabilities");
        fullCategory.setChartOfAccountCategoryDescription("Liability Accounts");

        when(dao.findByPK(2)).thenReturn(fullCategory);

        ChartOfAccountCategory result = chartOfAccountCategoryService.findByPK(2);

        assertThat(result).isNotNull();
        assertThat(result.getChartOfAccountCategoryCode()).isEqualTo("LIABILITIES");
        assertThat(result.getChartOfAccountCategoryName()).isEqualTo("Liabilities");
        assertThat(result.getChartOfAccountCategoryDescription()).isEqualTo("Liability Accounts");
        verify(dao, times(1)).findByPK(2);
    }

    @Test
    void shouldHandleDifferentCategoryIds() {
        ChartOfAccountCategory category1 = new ChartOfAccountCategory();
        category1.setChartOfAccountCategoryId(1);
        category1.setChartOfAccountCategoryCode("ASSETS");

        ChartOfAccountCategory category2 = new ChartOfAccountCategory();
        category2.setChartOfAccountCategoryId(2);
        category2.setChartOfAccountCategoryCode("EQUITY");

        when(dao.findByPK(1)).thenReturn(category1);
        when(dao.findByPK(2)).thenReturn(category2);

        ChartOfAccountCategory result1 = chartOfAccountCategoryService.findByPK(1);
        ChartOfAccountCategory result2 = chartOfAccountCategoryService.findByPK(2);

        assertThat(result1.getChartOfAccountCategoryId()).isEqualTo(1);
        assertThat(result2.getChartOfAccountCategoryId()).isEqualTo(2);
        verify(dao, times(1)).findByPK(1);
        verify(dao, times(1)).findByPK(2);
    }

    @Test
    void shouldCallFindByPKMultipleTimes() {
        when(dao.findByPK(1)).thenReturn(testCategory);

        chartOfAccountCategoryService.findByPK(1);
        chartOfAccountCategoryService.findByPK(1);
        chartOfAccountCategoryService.findByPK(1);

        verify(dao, times(3)).findByPK(1);
    }

    // ========== findAll Tests ==========

    @Test
    void shouldReturnAllCategoriesWhenCategoriesExist() {
        ChartOfAccountCategory liabilities = new ChartOfAccountCategory();
        liabilities.setChartOfAccountCategoryId(2);
        liabilities.setChartOfAccountCategoryCode("LIABILITIES");
        liabilities.setChartOfAccountCategoryName("Liabilities");

        ChartOfAccountCategory equity = new ChartOfAccountCategory();
        equity.setChartOfAccountCategoryId(3);
        equity.setChartOfAccountCategoryCode("EQUITY");
        equity.setChartOfAccountCategoryName("Equity");

        List<ChartOfAccountCategory> expectedList = Arrays.asList(testCategory, liabilities, equity);
        when(dao.getChartOfAccountCategoryList()).thenReturn(expectedList);

        List<ChartOfAccountCategory> result = chartOfAccountCategoryService.findAll();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testCategory, liabilities, equity);
        assertThat(result.get(0).getChartOfAccountCategoryCode()).isEqualTo("ASSETS");
        assertThat(result.get(1).getChartOfAccountCategoryCode()).isEqualTo("LIABILITIES");
        assertThat(result.get(2).getChartOfAccountCategoryCode()).isEqualTo("EQUITY");
        verify(dao, times(1)).getChartOfAccountCategoryList();
    }

    @Test
    void shouldReturnEmptyListWhenNoCategoriesExist() {
        when(dao.getChartOfAccountCategoryList()).thenReturn(Collections.emptyList());

        List<ChartOfAccountCategory> result = chartOfAccountCategoryService.findAll();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(dao, times(1)).getChartOfAccountCategoryList();
    }

    @Test
    void shouldReturnSingleCategory() {
        List<ChartOfAccountCategory> expectedList = Collections.singletonList(testCategory);
        when(dao.getChartOfAccountCategoryList()).thenReturn(expectedList);

        List<ChartOfAccountCategory> result = chartOfAccountCategoryService.findAll();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(testCategory);
        verify(dao, times(1)).getChartOfAccountCategoryList();
    }

    @Test
    void shouldReturnAllStandardAccountCategories() {
        List<ChartOfAccountCategory> categories = new ArrayList<>();

        String[] categoryCodes = {"ASSETS", "LIABILITIES", "EQUITY", "REVENUE", "EXPENSES"};
        String[] categoryNames = {"Assets", "Liabilities", "Equity", "Revenue", "Expenses"};

        for (int i = 0; i < categoryCodes.length; i++) {
            ChartOfAccountCategory category = new ChartOfAccountCategory();
            category.setChartOfAccountCategoryId(i + 1);
            category.setChartOfAccountCategoryCode(categoryCodes[i]);
            category.setChartOfAccountCategoryName(categoryNames[i]);
            categories.add(category);
        }

        when(dao.getChartOfAccountCategoryList()).thenReturn(categories);

        List<ChartOfAccountCategory> result = chartOfAccountCategoryService.findAll();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result.get(0).getChartOfAccountCategoryCode()).isEqualTo("ASSETS");
        assertThat(result.get(4).getChartOfAccountCategoryCode()).isEqualTo("EXPENSES");
        verify(dao, times(1)).getChartOfAccountCategoryList();
    }

    @Test
    void shouldCallFindAllMultipleTimes() {
        List<ChartOfAccountCategory> expectedList = Arrays.asList(testCategory);
        when(dao.getChartOfAccountCategoryList()).thenReturn(expectedList);

        chartOfAccountCategoryService.findAll();
        chartOfAccountCategoryService.findAll();

        verify(dao, times(2)).getChartOfAccountCategoryList();
    }

    @Test
    void shouldReturnCategoriesInCorrectOrder() {
        ChartOfAccountCategory cat1 = createCategory(1, "ASSETS", "Assets");
        ChartOfAccountCategory cat2 = createCategory(2, "LIABILITIES", "Liabilities");
        ChartOfAccountCategory cat3 = createCategory(3, "EQUITY", "Equity");

        List<ChartOfAccountCategory> expectedList = Arrays.asList(cat1, cat2, cat3);
        when(dao.getChartOfAccountCategoryList()).thenReturn(expectedList);

        List<ChartOfAccountCategory> result = chartOfAccountCategoryService.findAll();

        assertThat(result).hasSize(3);
        assertThat(result.get(0).getChartOfAccountCategoryId()).isEqualTo(1);
        assertThat(result.get(1).getChartOfAccountCategoryId()).isEqualTo(2);
        assertThat(result.get(2).getChartOfAccountCategoryId()).isEqualTo(3);
        verify(dao, times(1)).getChartOfAccountCategoryList();
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldPersistNewCategory() {
        chartOfAccountCategoryService.persist(testCategory);

        verify(dao, times(1)).persist(testCategory);
    }

    @Test
    void shouldUpdateExistingCategory() {
        when(dao.update(testCategory)).thenReturn(testCategory);

        ChartOfAccountCategory result = chartOfAccountCategoryService.update(testCategory);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testCategory);
        verify(dao, times(1)).update(testCategory);
    }

    @Test
    void shouldUpdateCategoryAndReturnUpdatedEntity() {
        testCategory.setChartOfAccountCategoryName("Updated Assets");
        testCategory.setChartOfAccountCategoryDescription("Updated Description");

        when(dao.update(testCategory)).thenReturn(testCategory);

        ChartOfAccountCategory result = chartOfAccountCategoryService.update(testCategory);

        assertThat(result).isNotNull();
        assertThat(result.getChartOfAccountCategoryName()).isEqualTo("Updated Assets");
        assertThat(result.getChartOfAccountCategoryDescription()).isEqualTo("Updated Description");
        verify(dao, times(1)).update(testCategory);
    }

    @Test
    void shouldDeleteCategory() {
        chartOfAccountCategoryService.delete(testCategory);

        verify(dao, times(1)).delete(testCategory);
    }

    @Test
    void shouldFindCategoriesByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("chartOfAccountCategoryCode", "ASSETS");

        List<ChartOfAccountCategory> expectedList = Arrays.asList(testCategory);
        when(dao.findByAttributes(attributes)).thenReturn(expectedList);

        List<ChartOfAccountCategory> result = chartOfAccountCategoryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testCategory);
        verify(dao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("chartOfAccountCategoryCode", "NONEXISTENT");

        when(dao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<ChartOfAccountCategory> result = chartOfAccountCategoryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(dao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<ChartOfAccountCategory> result = chartOfAccountCategoryService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(dao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<ChartOfAccountCategory> result = chartOfAccountCategoryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(dao, never()).findByAttributes(any());
    }

    @Test
    void shouldFindCategoriesByMultipleAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("chartOfAccountCategoryCode", "ASSETS");
        attributes.put("chartOfAccountCategoryName", "Assets");

        List<ChartOfAccountCategory> expectedList = Arrays.asList(testCategory);
        when(dao.findByAttributes(attributes)).thenReturn(expectedList);

        List<ChartOfAccountCategory> result = chartOfAccountCategoryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(dao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleCategoryWithMinimalData() {
        ChartOfAccountCategory minimalCategory = new ChartOfAccountCategory();
        minimalCategory.setChartOfAccountCategoryId(99);

        when(dao.findByPK(99)).thenReturn(minimalCategory);

        ChartOfAccountCategory result = chartOfAccountCategoryService.findByPK(99);

        assertThat(result).isNotNull();
        assertThat(result.getChartOfAccountCategoryId()).isEqualTo(99);
        assertThat(result.getChartOfAccountCategoryCode()).isNull();
        assertThat(result.getChartOfAccountCategoryName()).isNull();
        verify(dao, times(1)).findByPK(99);
    }

    @Test
    void shouldHandleCategoryWithNullDescription() {
        testCategory.setChartOfAccountCategoryDescription(null);
        when(dao.findByPK(1)).thenReturn(testCategory);

        ChartOfAccountCategory result = chartOfAccountCategoryService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getChartOfAccountCategoryDescription()).isNull();
        verify(dao, times(1)).findByPK(1);
    }

    @Test
    void shouldHandleCategoryWithLongDescription() {
        String longDescription = "This is a very long description for the chart of account category " +
                "that contains detailed information about what this category represents and how it should be used " +
                "in the accounting system. It may span multiple lines and contain various details.";
        testCategory.setChartOfAccountCategoryDescription(longDescription);

        when(dao.findByPK(1)).thenReturn(testCategory);

        ChartOfAccountCategory result = chartOfAccountCategoryService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getChartOfAccountCategoryDescription()).isEqualTo(longDescription);
        verify(dao, times(1)).findByPK(1);
    }

    @Test
    void shouldHandleSpecialCharactersInCategoryCode() {
        testCategory.setChartOfAccountCategoryCode("ASSET_TYPE_1");
        when(dao.findByPK(1)).thenReturn(testCategory);

        ChartOfAccountCategory result = chartOfAccountCategoryService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getChartOfAccountCategoryCode()).isEqualTo("ASSET_TYPE_1");
        verify(dao, times(1)).findByPK(1);
    }

    @Test
    void shouldHandleLargeListOfCategories() {
        List<ChartOfAccountCategory> largeList = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            ChartOfAccountCategory category = new ChartOfAccountCategory();
            category.setChartOfAccountCategoryId(i);
            category.setChartOfAccountCategoryCode("CAT" + i);
            category.setChartOfAccountCategoryName("Category " + i);
            largeList.add(category);
        }

        when(dao.getChartOfAccountCategoryList()).thenReturn(largeList);

        List<ChartOfAccountCategory> result = chartOfAccountCategoryService.findAll();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(50);
        assertThat(result.get(0).getChartOfAccountCategoryCode()).isEqualTo("CAT1");
        assertThat(result.get(49).getChartOfAccountCategoryCode()).isEqualTo("CAT50");
        verify(dao, times(1)).getChartOfAccountCategoryList();
    }

    @Test
    void shouldVerifyDaoInteractionForFindAll() {
        List<ChartOfAccountCategory> expectedList = Arrays.asList(testCategory);
        when(dao.getChartOfAccountCategoryList()).thenReturn(expectedList);

        chartOfAccountCategoryService.findAll();
        chartOfAccountCategoryService.findAll();
        chartOfAccountCategoryService.findAll();

        verify(dao, times(3)).getChartOfAccountCategoryList();
    }

    @Test
    void shouldHandleCategoriesWithSameCodeDifferentIds() {
        ChartOfAccountCategory cat1 = new ChartOfAccountCategory();
        cat1.setChartOfAccountCategoryId(1);
        cat1.setChartOfAccountCategoryCode("TEMP");

        ChartOfAccountCategory cat2 = new ChartOfAccountCategory();
        cat2.setChartOfAccountCategoryId(2);
        cat2.setChartOfAccountCategoryCode("TEMP");

        when(dao.findByPK(1)).thenReturn(cat1);
        when(dao.findByPK(2)).thenReturn(cat2);

        ChartOfAccountCategory result1 = chartOfAccountCategoryService.findByPK(1);
        ChartOfAccountCategory result2 = chartOfAccountCategoryService.findByPK(2);

        assertThat(result1.getChartOfAccountCategoryId()).isEqualTo(1);
        assertThat(result2.getChartOfAccountCategoryId()).isEqualTo(2);
        assertThat(result1.getChartOfAccountCategoryCode()).isEqualTo(result2.getChartOfAccountCategoryCode());
        verify(dao, times(1)).findByPK(1);
        verify(dao, times(1)).findByPK(2);
    }

    // ========== Helper Methods ==========

    private ChartOfAccountCategory createCategory(int id, String code, String name) {
        ChartOfAccountCategory category = new ChartOfAccountCategory();
        category.setChartOfAccountCategoryId(id);
        category.setChartOfAccountCategoryCode(code);
        category.setChartOfAccountCategoryName(name);
        return category;
    }
}
