package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.ReconcileCategoryDao;
import com.simpleaccounts.entity.bankaccount.ReconcileCategory;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReconcileCategoryServiceImpl Tests")
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
        testCategory.setReconcileCategoryName("Test Category");
        testCategory.setReconcileCategoryCode("TEST_CODE");
    }

    @Nested
    @DisplayName("getDao Tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return reconcile category dao")
        void shouldReturnReconcileCategoryDao() {
            assertThat(reconcileCategoryService.getDao()).isEqualTo(reconcileCategoryDao);
        }
    }

    @Nested
    @DisplayName("findByType Tests")
    class FindByTypeTests {

        @Test
        @DisplayName("Should return categories by type code")
        void shouldReturnCategoriesByTypeCode() {
            String typeCode = "TEST_CODE";
            List<ReconcileCategory> expectedCategories = Collections.singletonList(testCategory);
            when(reconcileCategoryDao.findByType(typeCode)).thenReturn(expectedCategories);

            List<ReconcileCategory> result = reconcileCategoryService.findByType(typeCode);

            assertThat(result).isNotNull().hasSize(1);
            assertThat(result.get(0).getReconcileCategoryCode()).isEqualTo(typeCode);
            verify(reconcileCategoryDao, times(1)).findByType(typeCode);
        }

        @Test
        @DisplayName("Should return empty list when no categories match type")
        void shouldReturnEmptyListWhenNoMatch() {
            String typeCode = "NON_EXISTENT";
            when(reconcileCategoryDao.findByType(typeCode)).thenReturn(Collections.emptyList());

            List<ReconcileCategory> result = reconcileCategoryService.findByType(typeCode);

            assertThat(result).isNotNull().isEmpty();
            verify(reconcileCategoryDao, times(1)).findByType(typeCode);
        }

        @Test
        @DisplayName("Should return multiple categories for same type")
        void shouldReturnMultipleCategoriesForSameType() {
            String typeCode = "INCOME";
            ReconcileCategory category2 = new ReconcileCategory();
            category2.setReconcileCategoryId(2);
            category2.setReconcileCategoryName("Second Category");
            category2.setReconcileCategoryCode("INCOME");

            List<ReconcileCategory> expectedCategories = Arrays.asList(testCategory, category2);
            when(reconcileCategoryDao.findByType(typeCode)).thenReturn(expectedCategories);

            List<ReconcileCategory> result = reconcileCategoryService.findByType(typeCode);

            assertThat(result).isNotNull().hasSize(2);
            verify(reconcileCategoryDao, times(1)).findByType(typeCode);
        }

        @Test
        @DisplayName("Should handle null type code")
        void shouldHandleNullTypeCode() {
            when(reconcileCategoryDao.findByType(null)).thenReturn(Collections.emptyList());

            List<ReconcileCategory> result = reconcileCategoryService.findByType(null);

            assertThat(result).isNotNull();
            verify(reconcileCategoryDao, times(1)).findByType(null);
        }

        @Test
        @DisplayName("Should handle empty type code")
        void shouldHandleEmptyTypeCode() {
            String typeCode = "";
            when(reconcileCategoryDao.findByType(typeCode)).thenReturn(Collections.emptyList());

            List<ReconcileCategory> result = reconcileCategoryService.findByType(typeCode);

            assertThat(result).isNotNull();
            verify(reconcileCategoryDao, times(1)).findByType(typeCode);
        }
    }
}
