package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.DesignationTransactionCategoryDao;
import com.simpleaccounts.entity.DesignationTransactionCategory;
import com.simpleaccounts.exceptions.ServiceException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DesignationTransactionCategoryServiceImplTest {

    @Mock
    private DesignationTransactionCategoryDao designationTransactionCategoryDao;

    @InjectMocks
    private DesignationTransactionCategoryServiceImpl designationTransactionCategoryService;

    private DesignationTransactionCategory testCategory;
    private DesignationTransactionCategory testCategory2;

    @BeforeEach
    void setUp() {
        testCategory = new DesignationTransactionCategory();
        testCategory.setId(1);
        testCategory.setDesignationId(100);
        testCategory.setTransactionCategoryId(200);
        testCategory.setDeleteFlag(false);
        testCategory.setCreatedDate(LocalDateTime.now());
        testCategory.setCreatedBy(1);

        testCategory2 = new DesignationTransactionCategory();
        testCategory2.setId(2);
        testCategory2.setDesignationId(100);
        testCategory2.setTransactionCategoryId(201);
        testCategory2.setDeleteFlag(false);
        testCategory2.setCreatedDate(LocalDateTime.now());
        testCategory2.setCreatedBy(1);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnDesignationTransactionCategoryDaoFromGetDao() {
        assertThat(designationTransactionCategoryService.getDao())
                .isEqualTo(designationTransactionCategoryDao);
    }

    // ========== getListByDesignationId Tests ==========

    @Test
    void shouldGetListByDesignationIdSuccessfully() {
        List<DesignationTransactionCategory> expectedList = Arrays.asList(testCategory, testCategory2);
        when(designationTransactionCategoryDao.getListByDesignationId(100)).thenReturn(expectedList);

        List<DesignationTransactionCategory> result =
                designationTransactionCategoryService.getListByDesignationId(100);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(testCategory, testCategory2);
        assertThat(result.get(0).getDesignationId()).isEqualTo(100);
        assertThat(result.get(1).getDesignationId()).isEqualTo(100);
        verify(designationTransactionCategoryDao, times(1)).getListByDesignationId(100);
    }

    @Test
    void shouldReturnEmptyListWhenNoTransactionCategoriesForDesignation() {
        when(designationTransactionCategoryDao.getListByDesignationId(999)).thenReturn(Collections.emptyList());

        List<DesignationTransactionCategory> result =
                designationTransactionCategoryService.getListByDesignationId(999);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(designationTransactionCategoryDao, times(1)).getListByDesignationId(999);
    }

    @Test
    void shouldReturnNullWhenDaoReturnsNull() {
        when(designationTransactionCategoryDao.getListByDesignationId(100)).thenReturn(null);

        List<DesignationTransactionCategory> result =
                designationTransactionCategoryService.getListByDesignationId(100);

        assertThat(result).isNull();
        verify(designationTransactionCategoryDao, times(1)).getListByDesignationId(100);
    }

    @Test
    void shouldGetSingleTransactionCategoryForDesignation() {
        List<DesignationTransactionCategory> expectedList = Collections.singletonList(testCategory);
        when(designationTransactionCategoryDao.getListByDesignationId(100)).thenReturn(expectedList);

        List<DesignationTransactionCategory> result =
                designationTransactionCategoryService.getListByDesignationId(100);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1);
        verify(designationTransactionCategoryDao, times(1)).getListByDesignationId(100);
    }

    @Test
    void shouldHandleMultipleDesignationIds() {
        List<DesignationTransactionCategory> list1 = Collections.singletonList(testCategory);
        List<DesignationTransactionCategory> list2 = Collections.singletonList(testCategory2);

        when(designationTransactionCategoryDao.getListByDesignationId(100)).thenReturn(list1);
        when(designationTransactionCategoryDao.getListByDesignationId(200)).thenReturn(list2);

        List<DesignationTransactionCategory> result1 =
                designationTransactionCategoryService.getListByDesignationId(100);
        List<DesignationTransactionCategory> result2 =
                designationTransactionCategoryService.getListByDesignationId(200);

        assertThat(result1).hasSize(1);
        assertThat(result2).hasSize(1);
        verify(designationTransactionCategoryDao, times(1)).getListByDesignationId(100);
        verify(designationTransactionCategoryDao, times(1)).getListByDesignationId(200);
    }

    @Test
    void shouldHandleZeroDesignationId() {
        when(designationTransactionCategoryDao.getListByDesignationId(0)).thenReturn(Collections.emptyList());

        List<DesignationTransactionCategory> result =
                designationTransactionCategoryService.getListByDesignationId(0);

        assertThat(result).isEmpty();
        verify(designationTransactionCategoryDao, times(1)).getListByDesignationId(0);
    }

    @Test
    void shouldHandleNullDesignationId() {
        when(designationTransactionCategoryDao.getListByDesignationId(null)).thenReturn(Collections.emptyList());

        List<DesignationTransactionCategory> result =
                designationTransactionCategoryService.getListByDesignationId(null);

        assertThat(result).isNotNull();
        verify(designationTransactionCategoryDao, times(1)).getListByDesignationId(null);
    }

    @Test
    void shouldHandleNegativeDesignationId() {
        when(designationTransactionCategoryDao.getListByDesignationId(-1)).thenReturn(Collections.emptyList());

        List<DesignationTransactionCategory> result =
                designationTransactionCategoryService.getListByDesignationId(-1);

        assertThat(result).isEmpty();
        verify(designationTransactionCategoryDao, times(1)).getListByDesignationId(-1);
    }

    @Test
    void shouldHandleLargeNumberOfCategories() {
        List<DesignationTransactionCategory> largeList = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            DesignationTransactionCategory category = new DesignationTransactionCategory();
            category.setId(i);
            category.setDesignationId(100);
            category.setTransactionCategoryId(200 + i);
            largeList.add(category);
        }

        when(designationTransactionCategoryDao.getListByDesignationId(100)).thenReturn(largeList);

        List<DesignationTransactionCategory> result =
                designationTransactionCategoryService.getListByDesignationId(100);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(50);
        verify(designationTransactionCategoryDao, times(1)).getListByDesignationId(100);
    }

    @Test
    void shouldGetListByDesignationIdMultipleTimes() {
        List<DesignationTransactionCategory> expectedList = Arrays.asList(testCategory);
        when(designationTransactionCategoryDao.getListByDesignationId(100)).thenReturn(expectedList);

        designationTransactionCategoryService.getListByDesignationId(100);
        designationTransactionCategoryService.getListByDesignationId(100);
        designationTransactionCategoryService.getListByDesignationId(100);

        verify(designationTransactionCategoryDao, times(3)).getListByDesignationId(100);
    }

    // ========== Inherited CRUD Operations Tests ==========

    @Test
    void shouldFindByPrimaryKeySuccessfully() {
        when(designationTransactionCategoryDao.findByPK(1)).thenReturn(testCategory);

        DesignationTransactionCategory result = designationTransactionCategoryService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1);
        assertThat(result.getDesignationId()).isEqualTo(100);
        verify(designationTransactionCategoryDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenFindByPKReturnsNull() {
        when(designationTransactionCategoryDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> designationTransactionCategoryService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(designationTransactionCategoryDao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewCategorySuccessfully() {
        doNothing().when(designationTransactionCategoryDao).persist(testCategory);

        designationTransactionCategoryService.persist(testCategory);

        verify(designationTransactionCategoryDao, times(1)).persist(testCategory);
    }

    @Test
    void shouldUpdateExistingCategorySuccessfully() {
        when(designationTransactionCategoryDao.update(testCategory)).thenReturn(testCategory);

        DesignationTransactionCategory result = designationTransactionCategoryService.update(testCategory);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testCategory);
        verify(designationTransactionCategoryDao, times(1)).update(testCategory);
    }

    @Test
    void shouldDeleteCategorySuccessfully() {
        doNothing().when(designationTransactionCategoryDao).delete(testCategory);

        designationTransactionCategoryService.delete(testCategory);

        verify(designationTransactionCategoryDao, times(1)).delete(testCategory);
    }

    @Test
    void shouldFindAllCategoriesSuccessfully() {
        List<DesignationTransactionCategory> allCategories = Arrays.asList(testCategory, testCategory2);
        when(designationTransactionCategoryDao.findAll()).thenReturn(allCategories);

        List<DesignationTransactionCategory> result = designationTransactionCategoryService.findAll();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        verify(designationTransactionCategoryDao, times(1)).findAll();
    }

    // ========== Edge Cases and Integration Tests ==========

    @Test
    void shouldHandleCategoryWithDeletedFlag() {
        DesignationTransactionCategory deletedCategory = new DesignationTransactionCategory();
        deletedCategory.setId(3);
        deletedCategory.setDesignationId(100);
        deletedCategory.setDeleteFlag(true);

        List<DesignationTransactionCategory> categories = Collections.singletonList(deletedCategory);
        when(designationTransactionCategoryDao.getListByDesignationId(100)).thenReturn(categories);

        List<DesignationTransactionCategory> result =
                designationTransactionCategoryService.getListByDesignationId(100);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDeleteFlag()).isTrue();
    }

    @Test
    void shouldHandleCategoryWithNullFields() {
        DesignationTransactionCategory categoryWithNulls = new DesignationTransactionCategory();
        categoryWithNulls.setId(4);
        categoryWithNulls.setDesignationId(100);
        categoryWithNulls.setTransactionCategoryId(null);
        categoryWithNulls.setCreatedBy(null);

        List<DesignationTransactionCategory> categories = Collections.singletonList(categoryWithNulls);
        when(designationTransactionCategoryDao.getListByDesignationId(100)).thenReturn(categories);

        List<DesignationTransactionCategory> result =
                designationTransactionCategoryService.getListByDesignationId(100);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTransactionCategoryId()).isNull();
        assertThat(result.get(0).getCreatedBy()).isNull();
    }

    @Test
    void shouldHandleMaxIntegerDesignationId() {
        when(designationTransactionCategoryDao.getListByDesignationId(Integer.MAX_VALUE))
                .thenReturn(Collections.emptyList());

        List<DesignationTransactionCategory> result =
                designationTransactionCategoryService.getListByDesignationId(Integer.MAX_VALUE);

        assertThat(result).isEmpty();
        verify(designationTransactionCategoryDao, times(1)).getListByDesignationId(Integer.MAX_VALUE);
    }

    @Test
    void shouldHandleMinIntegerDesignationId() {
        when(designationTransactionCategoryDao.getListByDesignationId(Integer.MIN_VALUE))
                .thenReturn(Collections.emptyList());

        List<DesignationTransactionCategory> result =
                designationTransactionCategoryService.getListByDesignationId(Integer.MIN_VALUE);

        assertThat(result).isEmpty();
        verify(designationTransactionCategoryDao, times(1)).getListByDesignationId(Integer.MIN_VALUE);
    }

    @Test
    void shouldUpdateCategoryAndVerifyChanges() {
        testCategory.setTransactionCategoryId(300);
        testCategory.setLastUpdateDate(LocalDateTime.now());

        when(designationTransactionCategoryDao.update(testCategory)).thenReturn(testCategory);

        DesignationTransactionCategory result = designationTransactionCategoryService.update(testCategory);

        assertThat(result.getTransactionCategoryId()).isEqualTo(300);
        assertThat(result.getLastUpdateDate()).isNotNull();
        verify(designationTransactionCategoryDao, times(1)).update(testCategory);
    }

    @Test
    void shouldPersistMultipleCategoriesSequentially() {
        doNothing().when(designationTransactionCategoryDao).persist(any(DesignationTransactionCategory.class));

        designationTransactionCategoryService.persist(testCategory);
        designationTransactionCategoryService.persist(testCategory2);

        verify(designationTransactionCategoryDao, times(2)).persist(any(DesignationTransactionCategory.class));
    }

    @Test
    void shouldDeleteMultipleCategoriesSequentially() {
        doNothing().when(designationTransactionCategoryDao).delete(any(DesignationTransactionCategory.class));

        designationTransactionCategoryService.delete(testCategory);
        designationTransactionCategoryService.delete(testCategory2);

        verify(designationTransactionCategoryDao, times(2)).delete(any(DesignationTransactionCategory.class));
    }

    @Test
    void shouldVerifyDaoInteractionForComplexScenario() {
        when(designationTransactionCategoryDao.getListByDesignationId(100))
                .thenReturn(Arrays.asList(testCategory, testCategory2));
        when(designationTransactionCategoryDao.findByPK(1)).thenReturn(testCategory);
        when(designationTransactionCategoryDao.update(testCategory)).thenReturn(testCategory);

        List<DesignationTransactionCategory> list =
                designationTransactionCategoryService.getListByDesignationId(100);
        DesignationTransactionCategory found = designationTransactionCategoryService.findByPK(1);
        found.setTransactionCategoryId(999);
        DesignationTransactionCategory updated = designationTransactionCategoryService.update(found);

        assertThat(list).hasSize(2);
        assertThat(found).isNotNull();
        assertThat(updated.getTransactionCategoryId()).isEqualTo(999);

        verify(designationTransactionCategoryDao, times(1)).getListByDesignationId(100);
        verify(designationTransactionCategoryDao, times(1)).findByPK(1);
        verify(designationTransactionCategoryDao, times(1)).update(testCategory);
    }

    @Test
    void shouldHandleEmptyListReturnFromFindAll() {
        when(designationTransactionCategoryDao.findAll()).thenReturn(Collections.emptyList());

        List<DesignationTransactionCategory> result = designationTransactionCategoryService.findAll();

        assertThat(result).isEmpty();
        verify(designationTransactionCategoryDao, times(1)).findAll();
    }

    @Test
    void shouldHandleMultipleFindByPKCalls() {
        when(designationTransactionCategoryDao.findByPK(1)).thenReturn(testCategory);
        when(designationTransactionCategoryDao.findByPK(2)).thenReturn(testCategory2);

        DesignationTransactionCategory result1 = designationTransactionCategoryService.findByPK(1);
        DesignationTransactionCategory result2 = designationTransactionCategoryService.findByPK(2);

        assertThat(result1.getId()).isEqualTo(1);
        assertThat(result2.getId()).isEqualTo(2);
        verify(designationTransactionCategoryDao, times(1)).findByPK(1);
        verify(designationTransactionCategoryDao, times(1)).findByPK(2);
    }
}
