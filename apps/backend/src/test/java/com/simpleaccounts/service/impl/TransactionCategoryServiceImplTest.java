package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.TransactionCategoryFilterEnum;
import com.simpleaccounts.criteria.TransactionCategoryFilterNew;
import com.simpleaccounts.criteria.bankaccount.TransactionCategoryCriteria;
import com.simpleaccounts.dao.bankaccount.TransactionCategoryDao;
import com.simpleaccounts.entity.Activity;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
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
class TransactionCategoryServiceImplTest {

    @Mock
    private TransactionCategoryDao transactionCategoryDao;

    @InjectMocks
    private TransactionCategoryServiceImpl transactionCategoryService;

    private TransactionCategory category1;
    private TransactionCategory category2;
    private TransactionCategory category3;
    private ChartOfAccount chartOfAccount;
    private List<TransactionCategory> categoryList;

    @BeforeEach
    void setUp() {
        chartOfAccount = new ChartOfAccount();
        chartOfAccount.setChartOfAccountId(1);
        chartOfAccount.setChartOfAccountName("Assets");

        category1 = new TransactionCategory();
        category1.setTransactionCategoryId(1);
        category1.setTransactionCategoryCode("CAT001");
        category1.setTransactionCategoryName("Category 1");
        category1.setChartOfAccount(chartOfAccount);

        category2 = new TransactionCategory();
        category2.setTransactionCategoryId(2);
        category2.setTransactionCategoryCode("CAT002");
        category2.setTransactionCategoryName("Category 2");
        category2.setChartOfAccount(chartOfAccount);

        category3 = new TransactionCategory();
        category3.setTransactionCategoryId(3);
        category3.setTransactionCategoryCode("CAT003");
        category3.setTransactionCategoryName("Category 3");
        category3.setChartOfAccount(chartOfAccount);

        categoryList = new ArrayList<>(Arrays.asList(category1, category2, category3));
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnTransactionCategoryDaoWhenGetDaoCalled() {
        assertThat(transactionCategoryService.getDao()).isEqualTo(transactionCategoryDao);
    }

    @Test
    void shouldReturnSameDaoInstanceOnMultipleCalls() {
        assertThat(transactionCategoryService.getDao()).isSameAs(transactionCategoryDao);
        assertThat(transactionCategoryService.getDao()).isSameAs(transactionCategoryDao);
    }

    // ========== findAllTransactionCategory Tests ==========

    @Test
    void shouldReturnAllTransactionCategories() {
        when(transactionCategoryDao.findAllTransactionCategory()).thenReturn(categoryList);

        List<TransactionCategory> result = transactionCategoryService.findAllTransactionCategory();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(category1, category2, category3);
        verify(transactionCategoryDao, times(1)).findAllTransactionCategory();
    }

    @Test
    void shouldReturnEmptyListWhenNoCategories() {
        when(transactionCategoryDao.findAllTransactionCategory()).thenReturn(Collections.emptyList());

        List<TransactionCategory> result = transactionCategoryService.findAllTransactionCategory();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(transactionCategoryDao, times(1)).findAllTransactionCategory();
    }

    @Test
    void shouldReturnNullWhenDaoReturnsNull() {
        when(transactionCategoryDao.findAllTransactionCategory()).thenReturn(null);

        List<TransactionCategory> result = transactionCategoryService.findAllTransactionCategory();

        assertThat(result).isNull();
        verify(transactionCategoryDao, times(1)).findAllTransactionCategory();
    }

    // ========== findTransactionCategoryByTransactionCategoryCode Tests ==========

    @Test
    void shouldReturnCategoryWhenCodeExists() {
        when(transactionCategoryDao.findTransactionCategoryByTransactionCategoryCode("CAT001")).thenReturn(category1);

        TransactionCategory result = transactionCategoryService.findTransactionCategoryByTransactionCategoryCode("CAT001");

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(category1);
        assertThat(result.getTransactionCategoryCode()).isEqualTo("CAT001");
        verify(transactionCategoryDao, times(1)).findTransactionCategoryByTransactionCategoryCode("CAT001");
    }

    @Test
    void shouldReturnNullWhenCodeNotFound() {
        when(transactionCategoryDao.findTransactionCategoryByTransactionCategoryCode("INVALID")).thenReturn(null);

        TransactionCategory result = transactionCategoryService.findTransactionCategoryByTransactionCategoryCode("INVALID");

        assertThat(result).isNull();
        verify(transactionCategoryDao, times(1)).findTransactionCategoryByTransactionCategoryCode("INVALID");
    }

    @Test
    void shouldHandleNullCode() {
        when(transactionCategoryDao.findTransactionCategoryByTransactionCategoryCode(null)).thenReturn(null);

        TransactionCategory result = transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(null);

        assertThat(result).isNull();
        verify(transactionCategoryDao, times(1)).findTransactionCategoryByTransactionCategoryCode(null);
    }

    @Test
    void shouldHandleEmptyCode() {
        when(transactionCategoryDao.findTransactionCategoryByTransactionCategoryCode("")).thenReturn(null);

        TransactionCategory result = transactionCategoryService.findTransactionCategoryByTransactionCategoryCode("");

        assertThat(result).isNull();
        verify(transactionCategoryDao, times(1)).findTransactionCategoryByTransactionCategoryCode("");
    }

    // ========== findAllTransactionCategoryByUserId Tests ==========

    @Test
    void shouldReturnCategoriesForUserId() {
        when(transactionCategoryDao.executeQuery(anyList())).thenReturn(categoryList);

        List<TransactionCategory> result = transactionCategoryService.findAllTransactionCategoryByUserId(1);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        verify(transactionCategoryDao, times(1)).executeQuery(anyList());
    }

    @Test
    void shouldReturnEmptyListWhenUserHasNoCategories() {
        when(transactionCategoryDao.executeQuery(anyList())).thenReturn(Collections.emptyList());

        List<TransactionCategory> result = transactionCategoryService.findAllTransactionCategoryByUserId(999);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(transactionCategoryDao, times(1)).executeQuery(anyList());
    }

    @Test
    void shouldHandleNullUserId() {
        when(transactionCategoryDao.executeQuery(anyList())).thenReturn(Collections.emptyList());

        List<TransactionCategory> result = transactionCategoryService.findAllTransactionCategoryByUserId(null);

        assertThat(result).isNotNull();
        verify(transactionCategoryDao, times(1)).executeQuery(anyList());
    }

    // ========== getDefaultTransactionCategory Tests ==========

    @Test
    void shouldReturnFirstCategoryAsDefault() {
        when(transactionCategoryDao.findAllTransactionCategory()).thenReturn(categoryList);

        TransactionCategory result = transactionCategoryService.getDefaultTransactionCategory();

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(category1);
        verify(transactionCategoryDao, times(1)).findAllTransactionCategory();
    }

    @Test
    void shouldReturnNullWhenNoCategoriesExist() {
        when(transactionCategoryDao.findAllTransactionCategory()).thenReturn(Collections.emptyList());

        TransactionCategory result = transactionCategoryService.getDefaultTransactionCategory();

        assertThat(result).isNull();
        verify(transactionCategoryDao, times(1)).findAllTransactionCategory();
    }

    @Test
    void shouldReturnNullWhenListIsNull() {
        when(transactionCategoryDao.findAllTransactionCategory()).thenReturn(null);

        TransactionCategory result = transactionCategoryService.getDefaultTransactionCategory();

        assertThat(result).isNull();
        verify(transactionCategoryDao, times(1)).findAllTransactionCategory();
    }

    // ========== getCategoriesByComplexCriteria Tests ==========

    @Test
    void shouldReturnCategoriesByCriteria() {
        TransactionCategoryCriteria criteria = new TransactionCategoryCriteria();
        when(transactionCategoryDao.findByAttributes(any())).thenReturn(categoryList);

        List<TransactionCategory> result = transactionCategoryService.getCategoriesByComplexCriteria(criteria);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
    }

    @Test
    void shouldReturnEmptyListWhenNoCriteriaMatch() {
        TransactionCategoryCriteria criteria = new TransactionCategoryCriteria();
        when(transactionCategoryDao.findByAttributes(any())).thenReturn(Collections.emptyList());

        List<TransactionCategory> result = transactionCategoryService.getCategoriesByComplexCriteria(criteria);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void shouldHandleNullCriteria() {
        when(transactionCategoryDao.findByAttributes(any())).thenReturn(Collections.emptyList());

        List<TransactionCategory> result = transactionCategoryService.getCategoriesByComplexCriteria(null);

        assertThat(result).isNotNull();
    }

    // ========== findAllTransactionCategoryByChartOfAccountIdAndName Tests ==========

    @Test
    void shouldReturnCategoriesByChartOfAccountIdAndName() {
        when(transactionCategoryDao.findAllTransactionCategoryByChartOfAccountIdAndName(1, "Category 1"))
                .thenReturn(Collections.singletonList(category1));

        List<TransactionCategory> result = transactionCategoryService.findAllTransactionCategoryByChartOfAccountIdAndName(1, "Category 1");

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(category1);
        verify(transactionCategoryDao, times(1)).findAllTransactionCategoryByChartOfAccountIdAndName(1, "Category 1");
    }

    @Test
    void shouldReturnEmptyListWhenNoMatch() {
        when(transactionCategoryDao.findAllTransactionCategoryByChartOfAccountIdAndName(999, "NonExistent"))
                .thenReturn(Collections.emptyList());

        List<TransactionCategory> result = transactionCategoryService.findAllTransactionCategoryByChartOfAccountIdAndName(999, "NonExistent");

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(transactionCategoryDao, times(1)).findAllTransactionCategoryByChartOfAccountIdAndName(999, "NonExistent");
    }

    // ========== findAllTransactionCategoryByChartOfAccount Tests ==========

    @Test
    void shouldReturnCategoriesByChartOfAccountId() {
        when(transactionCategoryDao.findAllTransactionCategoryByChartOfAccount(1)).thenReturn(categoryList);

        List<TransactionCategory> result = transactionCategoryService.findAllTransactionCategoryByChartOfAccount(1);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        verify(transactionCategoryDao, times(1)).findAllTransactionCategoryByChartOfAccount(1);
    }

    @Test
    void shouldReturnEmptyListWhenChartOfAccountHasNoCategories() {
        when(transactionCategoryDao.findAllTransactionCategoryByChartOfAccount(999)).thenReturn(Collections.emptyList());

        List<TransactionCategory> result = transactionCategoryService.findAllTransactionCategoryByChartOfAccount(999);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(transactionCategoryDao, times(1)).findAllTransactionCategoryByChartOfAccount(999);
    }

    @Test
    void shouldHandleNullChartOfAccountId() {
        when(transactionCategoryDao.findAllTransactionCategoryByChartOfAccount(null)).thenReturn(Collections.emptyList());

        List<TransactionCategory> result = transactionCategoryService.findAllTransactionCategoryByChartOfAccount(null);

        assertThat(result).isNotNull();
        verify(transactionCategoryDao, times(1)).findAllTransactionCategoryByChartOfAccount(null);
    }

    // ========== findTransactionCategoryListByParentCategory Tests ==========

    @Test
    void shouldReturnCategoriesByParentCategoryId() {
        when(transactionCategoryDao.findTransactionCategoryListByParentCategory(1)).thenReturn(categoryList);

        List<TransactionCategory> result = transactionCategoryService.findTransactionCategoryListByParentCategory(1);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        verify(transactionCategoryDao, times(1)).findTransactionCategoryListByParentCategory(1);
    }

    @Test
    void shouldReturnEmptyListWhenNoChildCategories() {
        when(transactionCategoryDao.findTransactionCategoryListByParentCategory(999)).thenReturn(Collections.emptyList());

        List<TransactionCategory> result = transactionCategoryService.findTransactionCategoryListByParentCategory(999);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(transactionCategoryDao, times(1)).findTransactionCategoryListByParentCategory(999);
    }

    // ========== getDefaultTransactionCategoryByTransactionCategoryId Tests ==========

    @Test
    void shouldReturnDefaultCategoryById() {
        when(transactionCategoryDao.getDefaultTransactionCategoryByTransactionCategoryId(1)).thenReturn(category1);

        TransactionCategory result = transactionCategoryService.getDefaultTransactionCategoryByTransactionCategoryId(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(category1);
        verify(transactionCategoryDao, times(1)).getDefaultTransactionCategoryByTransactionCategoryId(1);
    }

    @Test
    void shouldReturnNullWhenDefaultCategoryNotFound() {
        when(transactionCategoryDao.getDefaultTransactionCategoryByTransactionCategoryId(999)).thenReturn(null);

        TransactionCategory result = transactionCategoryService.getDefaultTransactionCategoryByTransactionCategoryId(999);

        assertThat(result).isNull();
        verify(transactionCategoryDao, times(1)).getDefaultTransactionCategoryByTransactionCategoryId(999);
    }

    // ========== persist Tests ==========

    @Test
    void shouldPersistTransactionCategory() {
        transactionCategoryService.persist(category1);

        verify(transactionCategoryDao, times(1)).persist(eq(category1));
    }

    @Test
    void shouldPersistWithActivity() {
        transactionCategoryService.persist(category1);

        ArgumentCaptor<TransactionCategory> categoryCaptor = ArgumentCaptor.forClass(TransactionCategory.class);
        verify(transactionCategoryDao, times(1)).persist(categoryCaptor.capture());

        TransactionCategory captured = categoryCaptor.getValue();
        assertThat(captured).isEqualTo(category1);
    }

    // ========== update Tests ==========

    @Test
    void shouldUpdateTransactionCategory() {
        when(transactionCategoryDao.update(any(TransactionCategory.class))).thenReturn(category1);

        TransactionCategory result = transactionCategoryService.update(category1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(category1);
        verify(transactionCategoryDao, times(1)).update(any(TransactionCategory.class));
    }

    @Test
    void shouldUpdateAndReturnUpdatedCategory() {
        category1.setTransactionCategoryName("Updated Name");
        when(transactionCategoryDao.update(any(TransactionCategory.class))).thenReturn(category1);

        TransactionCategory result = transactionCategoryService.update(category1);

        assertThat(result).isNotNull();
        assertThat(result.getTransactionCategoryName()).isEqualTo("Updated Name");
        verify(transactionCategoryDao, times(1)).update(any(TransactionCategory.class));
    }

    // ========== deleteByIds Tests ==========

    @Test
    void shouldDeleteCategoriesByIds() {
        List<Integer> ids = Arrays.asList(1, 2, 3);

        transactionCategoryService.deleteByIds(ids);

        verify(transactionCategoryDao, times(1)).deleteByIds(ids);
    }

    @Test
    void shouldHandleEmptyIdsList() {
        List<Integer> ids = Collections.emptyList();

        transactionCategoryService.deleteByIds(ids);

        verify(transactionCategoryDao, times(1)).deleteByIds(ids);
    }

    @Test
    void shouldHandleSingleId() {
        List<Integer> ids = Collections.singletonList(1);

        transactionCategoryService.deleteByIds(ids);

        verify(transactionCategoryDao, times(1)).deleteByIds(ids);
    }

    // ========== getTransactionCategoryList Tests ==========

    @Test
    void shouldReturnPaginatedTransactionCategoryList() {
        Map<TransactionCategoryFilterEnum, Object> filterMap = Collections.emptyMap();
        PaginationModel paginationModel = new PaginationModel();
        PaginationResponseModel expectedResponse = new PaginationResponseModel();

        when(transactionCategoryDao.getTransactionCategoryList(filterMap, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = transactionCategoryService.getTransactionCategoryList(filterMap, paginationModel);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(expectedResponse);
        verify(transactionCategoryDao, times(1)).getTransactionCategoryList(filterMap, paginationModel);
    }

    @Test
    void shouldHandleNullFilterMapInGetList() {
        PaginationModel paginationModel = new PaginationModel();
        PaginationResponseModel expectedResponse = new PaginationResponseModel();

        when(transactionCategoryDao.getTransactionCategoryList(null, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = transactionCategoryService.getTransactionCategoryList(null, paginationModel);

        assertThat(result).isNotNull();
        verify(transactionCategoryDao, times(1)).getTransactionCategoryList(null, paginationModel);
    }

    // ========== getNxtTransactionCatCodeByChartOfAccount Tests ==========

    @Test
    void shouldReturnNextTransactionCategoryCode() {
        when(transactionCategoryDao.getNxtTransactionCatCodeByChartOfAccount(chartOfAccount)).thenReturn("CAT004");

        String result = transactionCategoryService.getNxtTransactionCatCodeByChartOfAccount(chartOfAccount);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo("CAT004");
        verify(transactionCategoryDao, times(1)).getNxtTransactionCatCodeByChartOfAccount(chartOfAccount);
    }

    @Test
    void shouldReturnNullWhenNoNextCodeAvailable() {
        when(transactionCategoryDao.getNxtTransactionCatCodeByChartOfAccount(chartOfAccount)).thenReturn(null);

        String result = transactionCategoryService.getNxtTransactionCatCodeByChartOfAccount(chartOfAccount);

        assertThat(result).isNull();
        verify(transactionCategoryDao, times(1)).getNxtTransactionCatCodeByChartOfAccount(chartOfAccount);
    }

    @Test
    void shouldHandleNullChartOfAccount() {
        when(transactionCategoryDao.getNxtTransactionCatCodeByChartOfAccount(null)).thenReturn(null);

        String result = transactionCategoryService.getNxtTransactionCatCodeByChartOfAccount(null);

        assertThat(result).isNull();
        verify(transactionCategoryDao, times(1)).getNxtTransactionCatCodeByChartOfAccount(null);
    }

    // ========== getTransactionCatByChartOfAccountCategoryId Tests ==========

    @Test
    void shouldReturnCategoriesByChartOfAccountCategoryId() {
        when(transactionCategoryDao.getTransactionCatByChartOfAccountCategoryId(1)).thenReturn(categoryList);

        List<TransactionCategory> result = transactionCategoryService.getTransactionCatByChartOfAccountCategoryId(1);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        verify(transactionCategoryDao, times(1)).getTransactionCatByChartOfAccountCategoryId(1);
    }

    @Test
    void shouldReturnEmptyListWhenNoMatchingCategories() {
        when(transactionCategoryDao.getTransactionCatByChartOfAccountCategoryId(999)).thenReturn(Collections.emptyList());

        List<TransactionCategory> result = transactionCategoryService.getTransactionCatByChartOfAccountCategoryId(999);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(transactionCategoryDao, times(1)).getTransactionCatByChartOfAccountCategoryId(999);
    }

    // ========== getListForReceipt Tests ==========

    @Test
    void shouldReturnCategoriesForReceipt() {
        when(transactionCategoryDao.findTnxCatForReicpt()).thenReturn(categoryList);

        List<TransactionCategory> result = transactionCategoryService.getListForReceipt();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        verify(transactionCategoryDao, times(1)).findTnxCatForReicpt();
    }

    @Test
    void shouldReturnEmptyListWhenNoCategoriesForReceipt() {
        when(transactionCategoryDao.findTnxCatForReicpt()).thenReturn(Collections.emptyList());

        List<TransactionCategory> result = transactionCategoryService.getListForReceipt();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(transactionCategoryDao, times(1)).findTnxCatForReicpt();
    }

    // ========== getTransactionCategoryListForSalesProduct Tests ==========

    @Test
    void shouldReturnCategoriesForSalesProduct() {
        when(transactionCategoryDao.getTransactionCategoryListForSalesProduct()).thenReturn(categoryList);

        List<TransactionCategory> result = transactionCategoryService.getTransactionCategoryListForSalesProduct();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        verify(transactionCategoryDao, times(1)).getTransactionCategoryListForSalesProduct();
    }

    @Test
    void shouldReturnEmptyListWhenNoSalesProductCategories() {
        when(transactionCategoryDao.getTransactionCategoryListForSalesProduct()).thenReturn(Collections.emptyList());

        List<TransactionCategory> result = transactionCategoryService.getTransactionCategoryListForSalesProduct();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(transactionCategoryDao, times(1)).getTransactionCategoryListForSalesProduct();
    }

    // ========== getTransactionCategoryListForPurchaseProduct Tests ==========

    @Test
    void shouldReturnCategoriesForPurchaseProduct() {
        when(transactionCategoryDao.getTransactionCategoryListForPurchaseProduct()).thenReturn(categoryList);

        List<TransactionCategory> result = transactionCategoryService.getTransactionCategoryListForPurchaseProduct();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        verify(transactionCategoryDao, times(1)).getTransactionCategoryListForPurchaseProduct();
    }

    @Test
    void shouldReturnEmptyListWhenNoPurchaseProductCategories() {
        when(transactionCategoryDao.getTransactionCategoryListForPurchaseProduct()).thenReturn(Collections.emptyList());

        List<TransactionCategory> result = transactionCategoryService.getTransactionCategoryListForPurchaseProduct();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(transactionCategoryDao, times(1)).getTransactionCategoryListForPurchaseProduct();
    }

    // ========== getTransactionCategoryListForInventory Tests ==========

    @Test
    void shouldReturnCategoriesForInventory() {
        when(transactionCategoryDao.getTransactionCategoryListForInventory()).thenReturn(categoryList);

        List<TransactionCategory> result = transactionCategoryService.getTransactionCategoryListForInventory();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        verify(transactionCategoryDao, times(1)).getTransactionCategoryListForInventory();
    }

    @Test
    void shouldReturnEmptyListWhenNoInventoryCategories() {
        when(transactionCategoryDao.getTransactionCategoryListForInventory()).thenReturn(Collections.emptyList());

        List<TransactionCategory> result = transactionCategoryService.getTransactionCategoryListForInventory();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(transactionCategoryDao, times(1)).getTransactionCategoryListForInventory();
    }

    // ========== getTransactionCategoryListManualJornal Tests ==========

    @Test
    void shouldReturnCategoriesForManualJournal() {
        when(transactionCategoryDao.getTransactionCategoryListManualJornal()).thenReturn(categoryList);

        List<TransactionCategory> result = transactionCategoryService.getTransactionCategoryListManualJornal();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        verify(transactionCategoryDao, times(1)).getTransactionCategoryListManualJornal();
    }

    @Test
    void shouldReturnEmptyListWhenNoManualJournalCategories() {
        when(transactionCategoryDao.getTransactionCategoryListManualJornal()).thenReturn(Collections.emptyList());

        List<TransactionCategory> result = transactionCategoryService.getTransactionCategoryListManualJornal();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(transactionCategoryDao, times(1)).getTransactionCategoryListManualJornal();
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleMultipleCallsToFindAllTransactionCategory() {
        when(transactionCategoryDao.findAllTransactionCategory()).thenReturn(categoryList);

        transactionCategoryService.findAllTransactionCategory();
        transactionCategoryService.findAllTransactionCategory();
        transactionCategoryService.findAllTransactionCategory();

        verify(transactionCategoryDao, times(3)).findAllTransactionCategory();
    }

    @Test
    void shouldHandleCategoryWithNullCode() {
        TransactionCategory categoryWithNullCode = new TransactionCategory();
        categoryWithNullCode.setTransactionCategoryId(10);
        categoryWithNullCode.setTransactionCategoryCode(null);
        categoryWithNullCode.setTransactionCategoryName("Null Code Category");

        when(transactionCategoryDao.update(any(TransactionCategory.class))).thenReturn(categoryWithNullCode);

        TransactionCategory result = transactionCategoryService.update(categoryWithNullCode);

        assertThat(result).isNotNull();
        assertThat(result.getTransactionCategoryCode()).isNull();
        verify(transactionCategoryDao, times(1)).update(any(TransactionCategory.class));
    }

    @Test
    void shouldHandleCategoryWithEmptyName() {
        category1.setTransactionCategoryName("");
        when(transactionCategoryDao.update(any(TransactionCategory.class))).thenReturn(category1);

        TransactionCategory result = transactionCategoryService.update(category1);

        assertThat(result).isNotNull();
        assertThat(result.getTransactionCategoryName()).isEmpty();
        verify(transactionCategoryDao, times(1)).update(any(TransactionCategory.class));
    }

    @Test
    void shouldHandleLargeListOfIds() {
        List<Integer> largeIdList = new ArrayList<>();
        for (int i = 1; i <= 1000; i++) {
            largeIdList.add(i);
        }

        transactionCategoryService.deleteByIds(largeIdList);

        ArgumentCaptor<List<Integer>> captor = ArgumentCaptor.forClass(List.class);
        verify(transactionCategoryDao, times(1)).deleteByIds(captor.capture());

        List<Integer> captured = captor.getValue();
        assertThat(captured).hasSize(1000);
    }

    @Test
    void shouldHandleCategoryWithSpecialCharactersInCode() {
        category1.setTransactionCategoryCode("CAT-001@#$");
        when(transactionCategoryDao.findTransactionCategoryByTransactionCategoryCode("CAT-001@#$")).thenReturn(category1);

        TransactionCategory result = transactionCategoryService.findTransactionCategoryByTransactionCategoryCode("CAT-001@#$");

        assertThat(result).isNotNull();
        assertThat(result.getTransactionCategoryCode()).isEqualTo("CAT-001@#$");
        verify(transactionCategoryDao, times(1)).findTransactionCategoryByTransactionCategoryCode("CAT-001@#$");
    }
}
