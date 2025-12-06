package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.ReconcileCategoryDao;
import com.simpleaccounts.entity.bankaccount.ReconcileCategory;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReconcileCategoryServiceImplTest {

    @Mock
    private ReconcileCategoryDao reconcileCategoryDao;

    @InjectMocks
    private ReconcileCategoryServiceImpl reconcileCategoryService;

    private ReconcileCategory testCategory;

    @BeforeEach
    void setUp() {
        testCategory = new ReconcileCategory();
        testCategory.setReconcileCategoryId(1);
        testCategory.setReconcileCategoryCode("INCOME");
        testCategory.setReconcileCategoryName("Income Category");
        testCategory.setReconcileCategoryType("CREDIT");
        testCategory.setCreatedBy(1);
        testCategory.setCreatedDate(LocalDateTime.now());
        testCategory.setDeleteFlag(false);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnReconcileCategoryDaoWhenGetDaoCalled() {
        assertThat(reconcileCategoryService.getDao()).isEqualTo(reconcileCategoryDao);
    }

    @Test
    void shouldReturnNonNullDaoInstance() {
        assertThat(reconcileCategoryService.getDao()).isNotNull();
    }

    // ========== findByType Tests ==========

    @Test
    void shouldReturnCategoriesWhenTypeMatches() {
        ReconcileCategory category2 = new ReconcileCategory();
        category2.setReconcileCategoryId(2);
        category2.setReconcileCategoryCode("SALARY");
        category2.setReconcileCategoryType("CREDIT");

        List<ReconcileCategory> expectedCategories = Arrays.asList(testCategory, category2);
        when(reconcileCategoryDao.findByType("CREDIT")).thenReturn(expectedCategories);

        List<ReconcileCategory> result = reconcileCategoryService.findByType("CREDIT");

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(testCategory, category2);
        verify(reconcileCategoryDao, times(1)).findByType("CREDIT");
    }

    @Test
    void shouldReturnEmptyListWhenNoTypeMatches() {
        when(reconcileCategoryDao.findByType("UNKNOWN")).thenReturn(Collections.emptyList());

        List<ReconcileCategory> result = reconcileCategoryService.findByType("UNKNOWN");

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(reconcileCategoryDao, times(1)).findByType("UNKNOWN");
    }

    @Test
    void shouldReturnSingleCategoryWhenOnlyOneMatches() {
        List<ReconcileCategory> expectedCategories = Collections.singletonList(testCategory);
        when(reconcileCategoryDao.findByType("CREDIT")).thenReturn(expectedCategories);

        List<ReconcileCategory> result = reconcileCategoryService.findByType("CREDIT");

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getReconcileCategoryCode()).isEqualTo("INCOME");
        verify(reconcileCategoryDao, times(1)).findByType("CREDIT");
    }

    @Test
    void shouldHandleMultipleCategoriesOfSameType() {
        List<ReconcileCategory> expectedCategories = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            ReconcileCategory category = new ReconcileCategory();
            category.setReconcileCategoryId(i);
            category.setReconcileCategoryCode("CODE" + i);
            category.setReconcileCategoryType("CREDIT");
            expectedCategories.add(category);
        }

        when(reconcileCategoryDao.findByType("CREDIT")).thenReturn(expectedCategories);

        List<ReconcileCategory> result = reconcileCategoryService.findByType("CREDIT");

        assertThat(result).isNotNull();
        assertThat(result).hasSize(10);
        assertThat(result.get(0).getReconcileCategoryCode()).isEqualTo("CODE1");
        assertThat(result.get(9).getReconcileCategoryCode()).isEqualTo("CODE10");
        verify(reconcileCategoryDao, times(1)).findByType("CREDIT");
    }

    @Test
    void shouldHandleDifferentCategoryTypes() {
        ReconcileCategory debitCategory = new ReconcileCategory();
        debitCategory.setReconcileCategoryId(2);
        debitCategory.setReconcileCategoryCode("EXPENSE");
        debitCategory.setReconcileCategoryType("DEBIT");

        List<ReconcileCategory> expectedCategories = Collections.singletonList(debitCategory);
        when(reconcileCategoryDao.findByType("DEBIT")).thenReturn(expectedCategories);

        List<ReconcileCategory> result = reconcileCategoryService.findByType("DEBIT");

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getReconcileCategoryType()).isEqualTo("DEBIT");
        verify(reconcileCategoryDao, times(1)).findByType("DEBIT");
    }

    @Test
    void shouldHandleNullType() {
        when(reconcileCategoryDao.findByType(null)).thenReturn(Collections.emptyList());

        List<ReconcileCategory> result = reconcileCategoryService.findByType(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(reconcileCategoryDao, times(1)).findByType(null);
    }

    @Test
    void shouldHandleEmptyStringType() {
        when(reconcileCategoryDao.findByType("")).thenReturn(Collections.emptyList());

        List<ReconcileCategory> result = reconcileCategoryService.findByType("");

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(reconcileCategoryDao, times(1)).findByType("");
    }

    @Test
    void shouldHandleCaseSensitiveTypes() {
        when(reconcileCategoryDao.findByType("credit")).thenReturn(Collections.emptyList());

        List<ReconcileCategory> result = reconcileCategoryService.findByType("credit");

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(reconcileCategoryDao, times(1)).findByType("credit");
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindReconcileCategoryByPrimaryKey() {
        when(reconcileCategoryDao.findByPK(1)).thenReturn(testCategory);

        ReconcileCategory result = reconcileCategoryService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testCategory);
        assertThat(result.getReconcileCategoryId()).isEqualTo(1);
        verify(reconcileCategoryDao, times(1)).findByPK(1);
    }

    @Test
    void shouldReturnNullWhenReconcileCategoryNotFoundByPK() {
        when(reconcileCategoryDao.findByPK(999)).thenReturn(null);

        ReconcileCategory result = reconcileCategoryService.findByPK(999);

        assertThat(result).isNull();
        verify(reconcileCategoryDao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewReconcileCategory() {
        reconcileCategoryService.persist(testCategory);

        verify(reconcileCategoryDao, times(1)).persist(testCategory);
    }

    @Test
    void shouldUpdateExistingReconcileCategory() {
        when(reconcileCategoryDao.update(testCategory)).thenReturn(testCategory);

        ReconcileCategory result = reconcileCategoryService.update(testCategory);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testCategory);
        verify(reconcileCategoryDao, times(1)).update(testCategory);
    }

    @Test
    void shouldUpdateReconcileCategoryAndReturnUpdatedEntity() {
        testCategory.setReconcileCategoryName("Updated Category Name");
        testCategory.setReconcileCategoryType("DEBIT");
        when(reconcileCategoryDao.update(testCategory)).thenReturn(testCategory);

        ReconcileCategory result = reconcileCategoryService.update(testCategory);

        assertThat(result).isNotNull();
        assertThat(result.getReconcileCategoryName()).isEqualTo("Updated Category Name");
        assertThat(result.getReconcileCategoryType()).isEqualTo("DEBIT");
        verify(reconcileCategoryDao, times(1)).update(testCategory);
    }

    @Test
    void shouldDeleteReconcileCategory() {
        reconcileCategoryService.delete(testCategory);

        verify(reconcileCategoryDao, times(1)).delete(testCategory);
    }

    @Test
    void shouldFindReconcileCategoriesByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("reconcileCategoryCode", "INCOME");
        attributes.put("deleteFlag", false);

        List<ReconcileCategory> expectedList = Arrays.asList(testCategory);
        when(reconcileCategoryDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<ReconcileCategory> result = reconcileCategoryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testCategory);
        verify(reconcileCategoryDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("reconcileCategoryCode", "NONEXISTENT");

        when(reconcileCategoryDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<ReconcileCategory> result = reconcileCategoryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(reconcileCategoryDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldFindByMultipleAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("reconcileCategoryType", "CREDIT");
        attributes.put("deleteFlag", false);

        ReconcileCategory category2 = new ReconcileCategory();
        category2.setReconcileCategoryId(2);
        category2.setReconcileCategoryCode("SALARY");
        category2.setReconcileCategoryType("CREDIT");

        List<ReconcileCategory> expectedList = Arrays.asList(testCategory, category2);
        when(reconcileCategoryDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<ReconcileCategory> result = reconcileCategoryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        verify(reconcileCategoryDao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleCategoryWithNullCode() {
        ReconcileCategory categoryWithNullCode = new ReconcileCategory();
        categoryWithNullCode.setReconcileCategoryId(2);
        categoryWithNullCode.setReconcileCategoryCode(null);
        categoryWithNullCode.setReconcileCategoryType("CREDIT");

        when(reconcileCategoryDao.findByPK(2)).thenReturn(categoryWithNullCode);

        ReconcileCategory result = reconcileCategoryService.findByPK(2);

        assertThat(result).isNotNull();
        assertThat(result.getReconcileCategoryCode()).isNull();
        verify(reconcileCategoryDao, times(1)).findByPK(2);
    }

    @Test
    void shouldHandleCategoryWithNullName() {
        ReconcileCategory categoryWithNullName = new ReconcileCategory();
        categoryWithNullName.setReconcileCategoryId(3);
        categoryWithNullName.setReconcileCategoryCode("CODE");
        categoryWithNullName.setReconcileCategoryName(null);

        when(reconcileCategoryDao.findByPK(3)).thenReturn(categoryWithNullName);

        ReconcileCategory result = reconcileCategoryService.findByPK(3);

        assertThat(result).isNotNull();
        assertThat(result.getReconcileCategoryName()).isNull();
        verify(reconcileCategoryDao, times(1)).findByPK(3);
    }

    @Test
    void shouldHandleCategoryWithMinimalData() {
        ReconcileCategory minimalCategory = new ReconcileCategory();
        minimalCategory.setReconcileCategoryId(99);

        when(reconcileCategoryDao.findByPK(99)).thenReturn(minimalCategory);

        ReconcileCategory result = reconcileCategoryService.findByPK(99);

        assertThat(result).isNotNull();
        assertThat(result.getReconcileCategoryId()).isEqualTo(99);
        assertThat(result.getReconcileCategoryCode()).isNull();
        assertThat(result.getReconcileCategoryName()).isNull();
        verify(reconcileCategoryDao, times(1)).findByPK(99);
    }

    @Test
    void shouldVerifyTransactionalBehavior() {
        when(reconcileCategoryDao.findByType("CREDIT")).thenReturn(Arrays.asList(testCategory));

        reconcileCategoryService.findByType("CREDIT");
        reconcileCategoryService.findByType("CREDIT");

        verify(reconcileCategoryDao, times(2)).findByType("CREDIT");
    }

    @Test
    void shouldHandleWhitespaceInType() {
        when(reconcileCategoryDao.findByType("  CREDIT  ")).thenReturn(Collections.emptyList());

        List<ReconcileCategory> result = reconcileCategoryService.findByType("  CREDIT  ");

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(reconcileCategoryDao, times(1)).findByType("  CREDIT  ");
    }

    @Test
    void shouldHandleSpecialCharactersInType() {
        when(reconcileCategoryDao.findByType("CREDIT-SPECIAL")).thenReturn(Collections.emptyList());

        List<ReconcileCategory> result = reconcileCategoryService.findByType("CREDIT-SPECIAL");

        assertThat(result).isNotNull();
        verify(reconcileCategoryDao, times(1)).findByType("CREDIT-SPECIAL");
    }

    @Test
    void shouldReturnDistinctCategoriesForType() {
        ReconcileCategory category1 = new ReconcileCategory();
        category1.setReconcileCategoryId(1);
        category1.setReconcileCategoryCode("INCOME1");
        category1.setReconcileCategoryType("CREDIT");

        ReconcileCategory category2 = new ReconcileCategory();
        category2.setReconcileCategoryId(2);
        category2.setReconcileCategoryCode("INCOME2");
        category2.setReconcileCategoryType("CREDIT");

        ReconcileCategory category3 = new ReconcileCategory();
        category3.setReconcileCategoryId(3);
        category3.setReconcileCategoryCode("INCOME3");
        category3.setReconcileCategoryType("CREDIT");

        List<ReconcileCategory> expectedCategories = Arrays.asList(category1, category2, category3);
        when(reconcileCategoryDao.findByType("CREDIT")).thenReturn(expectedCategories);

        List<ReconcileCategory> result = reconcileCategoryService.findByType("CREDIT");

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getReconcileCategoryId()).isEqualTo(1);
        assertThat(result.get(1).getReconcileCategoryId()).isEqualTo(2);
        assertThat(result.get(2).getReconcileCategoryId()).isEqualTo(3);
        verify(reconcileCategoryDao, times(1)).findByType("CREDIT");
    }

    @Test
    void shouldHandleLongTypeString() {
        String longType = "VERY_LONG_CATEGORY_TYPE_STRING_THAT_MIGHT_EXCEED_NORMAL_LENGTH";
        when(reconcileCategoryDao.findByType(longType)).thenReturn(Collections.emptyList());

        List<ReconcileCategory> result = reconcileCategoryService.findByType(longType);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(reconcileCategoryDao, times(1)).findByType(longType);
    }

    @Test
    void shouldHandleNumericTypeString() {
        when(reconcileCategoryDao.findByType("12345")).thenReturn(Collections.emptyList());

        List<ReconcileCategory> result = reconcileCategoryService.findByType("12345");

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(reconcileCategoryDao, times(1)).findByType("12345");
    }

    @Test
    void shouldVerifyDaoInteractionForFindByType() {
        when(reconcileCategoryDao.findByType("CREDIT")).thenReturn(Arrays.asList(testCategory));

        reconcileCategoryService.findByType("CREDIT");
        reconcileCategoryService.findByType("CREDIT");
        reconcileCategoryService.findByType("CREDIT");

        verify(reconcileCategoryDao, times(3)).findByType("CREDIT");
    }
}
