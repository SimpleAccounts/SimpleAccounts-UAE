package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.CoacTransactionCategoryDao;
import com.simpleaccounts.entity.CoacTransactionCategory;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
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
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CoacTransactionCategoryServiceImplTest {

    @Mock
    private CoacTransactionCategoryDao dao;

    @InjectMocks
    private CoacTransactionCategoryServiceImpl coacTransactionCategoryService;

    private CoacTransactionCategory testCoacTransactionCategory;
    private ChartOfAccount testChartOfAccount;
    private TransactionCategory testTransactionCategory;

    @BeforeEach
    void setUp() {
        testChartOfAccount = new ChartOfAccount();
        testChartOfAccount.setChartOfAccountId(1);
        testChartOfAccount.setChartOfAccountCode("1000");
        testChartOfAccount.setChartOfAccountName("Cash");

        testTransactionCategory = new TransactionCategory();
        testTransactionCategory.setTransactionCategoryId(1);
        testTransactionCategory.setTransactionCategoryCode("INCOME");
        testTransactionCategory.setTransactionCategoryDescription("Income Category");

        testCoacTransactionCategory = new CoacTransactionCategory();
        testCoacTransactionCategory.setCoacTransactionCategoryId(1);
        testCoacTransactionCategory.setChartOfAccount(testChartOfAccount);
        testCoacTransactionCategory.setTransactionCategory(testTransactionCategory);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnDaoWhenGetDaoCalled() {
        assertThat(coacTransactionCategoryService.getDao()).isEqualTo(dao);
    }

    // ========== addCoacTransactionCategory Tests ==========

    @Test
    void shouldAddCoacTransactionCategoryWhenValidDataProvided() {
        coacTransactionCategoryService.addCoacTransactionCategory(testChartOfAccount, testTransactionCategory);

        verify(dao, times(1)).addCoacTransactionCategory(testChartOfAccount, testTransactionCategory);
    }

    @Test
    void shouldAddCoacTransactionCategoryWithDifferentChartOfAccount() {
        ChartOfAccount bankAccount = new ChartOfAccount();
        bankAccount.setChartOfAccountId(2);
        bankAccount.setChartOfAccountCode("1010");
        bankAccount.setChartOfAccountName("Bank Account");

        coacTransactionCategoryService.addCoacTransactionCategory(bankAccount, testTransactionCategory);

        ArgumentCaptor<ChartOfAccount> chartCaptor = ArgumentCaptor.forClass(ChartOfAccount.class);
        ArgumentCaptor<TransactionCategory> categoryCaptor = ArgumentCaptor.forClass(TransactionCategory.class);

        verify(dao, times(1)).addCoacTransactionCategory(chartCaptor.capture(), categoryCaptor.capture());

        assertThat(chartCaptor.getValue()).isEqualTo(bankAccount);
        assertThat(chartCaptor.getValue().getChartOfAccountId()).isEqualTo(2);
        assertThat(categoryCaptor.getValue()).isEqualTo(testTransactionCategory);
    }

    @Test
    void shouldAddCoacTransactionCategoryWithDifferentTransactionCategory() {
        TransactionCategory expenseCategory = new TransactionCategory();
        expenseCategory.setTransactionCategoryId(2);
        expenseCategory.setTransactionCategoryCode("EXPENSE");
        expenseCategory.setTransactionCategoryDescription("Expense Category");

        coacTransactionCategoryService.addCoacTransactionCategory(testChartOfAccount, expenseCategory);

        ArgumentCaptor<ChartOfAccount> chartCaptor = ArgumentCaptor.forClass(ChartOfAccount.class);
        ArgumentCaptor<TransactionCategory> categoryCaptor = ArgumentCaptor.forClass(TransactionCategory.class);

        verify(dao, times(1)).addCoacTransactionCategory(chartCaptor.capture(), categoryCaptor.capture());

        assertThat(chartCaptor.getValue()).isEqualTo(testChartOfAccount);
        assertThat(categoryCaptor.getValue()).isEqualTo(expenseCategory);
        assertThat(categoryCaptor.getValue().getTransactionCategoryId()).isEqualTo(2);
    }

    @Test
    void shouldAddMultipleCoacTransactionCategories() {
        ChartOfAccount account1 = createChartOfAccount(1, "1000", "Cash");
        ChartOfAccount account2 = createChartOfAccount(2, "1010", "Bank");
        ChartOfAccount account3 = createChartOfAccount(3, "1020", "Petty Cash");

        TransactionCategory income = createTransactionCategory(1, "INCOME", "Income");
        TransactionCategory expense = createTransactionCategory(2, "EXPENSE", "Expense");

        coacTransactionCategoryService.addCoacTransactionCategory(account1, income);
        coacTransactionCategoryService.addCoacTransactionCategory(account2, expense);
        coacTransactionCategoryService.addCoacTransactionCategory(account3, income);

        verify(dao, times(1)).addCoacTransactionCategory(account1, income);
        verify(dao, times(1)).addCoacTransactionCategory(account2, expense);
        verify(dao, times(1)).addCoacTransactionCategory(account3, income);
        verify(dao, times(3)).addCoacTransactionCategory(any(ChartOfAccount.class), any(TransactionCategory.class));
    }

    @Test
    void shouldHandleNullChartOfAccount() {
        coacTransactionCategoryService.addCoacTransactionCategory(null, testTransactionCategory);

        verify(dao, times(1)).addCoacTransactionCategory(null, testTransactionCategory);
    }

    @Test
    void shouldHandleNullTransactionCategory() {
        coacTransactionCategoryService.addCoacTransactionCategory(testChartOfAccount, null);

        verify(dao, times(1)).addCoacTransactionCategory(testChartOfAccount, null);
    }

    @Test
    void shouldHandleBothParametersNull() {
        coacTransactionCategoryService.addCoacTransactionCategory(null, null);

        verify(dao, times(1)).addCoacTransactionCategory(null, null);
    }

    @Test
    void shouldAddSameChartOfAccountWithDifferentCategories() {
        TransactionCategory category1 = createTransactionCategory(1, "INCOME", "Income");
        TransactionCategory category2 = createTransactionCategory(2, "EXPENSE", "Expense");
        TransactionCategory category3 = createTransactionCategory(3, "TRANSFER", "Transfer");

        coacTransactionCategoryService.addCoacTransactionCategory(testChartOfAccount, category1);
        coacTransactionCategoryService.addCoacTransactionCategory(testChartOfAccount, category2);
        coacTransactionCategoryService.addCoacTransactionCategory(testChartOfAccount, category3);

        verify(dao, times(1)).addCoacTransactionCategory(testChartOfAccount, category1);
        verify(dao, times(1)).addCoacTransactionCategory(testChartOfAccount, category2);
        verify(dao, times(1)).addCoacTransactionCategory(testChartOfAccount, category3);
    }

    @Test
    void shouldAddDifferentChartOfAccountsWithSameCategory() {
        ChartOfAccount account1 = createChartOfAccount(1, "1000", "Cash");
        ChartOfAccount account2 = createChartOfAccount(2, "1010", "Bank");
        ChartOfAccount account3 = createChartOfAccount(3, "1020", "Petty Cash");

        coacTransactionCategoryService.addCoacTransactionCategory(account1, testTransactionCategory);
        coacTransactionCategoryService.addCoacTransactionCategory(account2, testTransactionCategory);
        coacTransactionCategoryService.addCoacTransactionCategory(account3, testTransactionCategory);

        verify(dao, times(1)).addCoacTransactionCategory(account1, testTransactionCategory);
        verify(dao, times(1)).addCoacTransactionCategory(account2, testTransactionCategory);
        verify(dao, times(1)).addCoacTransactionCategory(account3, testTransactionCategory);
    }

    @Test
    void shouldVerifyParametersPassedToDaoCorrectly() {
        coacTransactionCategoryService.addCoacTransactionCategory(testChartOfAccount, testTransactionCategory);

        ArgumentCaptor<ChartOfAccount> chartCaptor = ArgumentCaptor.forClass(ChartOfAccount.class);
        ArgumentCaptor<TransactionCategory> categoryCaptor = ArgumentCaptor.forClass(TransactionCategory.class);

        verify(dao, times(1)).addCoacTransactionCategory(chartCaptor.capture(), categoryCaptor.capture());

        ChartOfAccount capturedChart = chartCaptor.getValue();
        TransactionCategory capturedCategory = categoryCaptor.getValue();

        assertThat(capturedChart).isEqualTo(testChartOfAccount);
        assertThat(capturedChart.getChartOfAccountId()).isEqualTo(1);
        assertThat(capturedChart.getChartOfAccountCode()).isEqualTo("1000");

        assertThat(capturedCategory).isEqualTo(testTransactionCategory);
        assertThat(capturedCategory.getTransactionCategoryId()).isEqualTo(1);
        assertThat(capturedCategory.getTransactionCategoryCode()).isEqualTo("INCOME");
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindCoacTransactionCategoryByPrimaryKey() {
        when(dao.findByPK(1)).thenReturn(testCoacTransactionCategory);

        CoacTransactionCategory result = coacTransactionCategoryService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testCoacTransactionCategory);
        assertThat(result.getCoacTransactionCategoryId()).isEqualTo(1);
        verify(dao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenCoacTransactionCategoryNotFoundByPK() {
        when(dao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> coacTransactionCategoryService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(dao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewCoacTransactionCategory() {
        coacTransactionCategoryService.persist(testCoacTransactionCategory);

        verify(dao, times(1)).persist(testCoacTransactionCategory);
    }

    @Test
    void shouldUpdateExistingCoacTransactionCategory() {
        when(dao.update(testCoacTransactionCategory)).thenReturn(testCoacTransactionCategory);

        CoacTransactionCategory result = coacTransactionCategoryService.update(testCoacTransactionCategory);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testCoacTransactionCategory);
        verify(dao, times(1)).update(testCoacTransactionCategory);
    }

    @Test
    void shouldUpdateCoacTransactionCategoryAndReturnUpdatedEntity() {
        TransactionCategory newCategory = new TransactionCategory();
        newCategory.setTransactionCategoryId(2);
        newCategory.setTransactionCategoryCode("EXPENSE");

        testCoacTransactionCategory.setTransactionCategory(newCategory);
        when(dao.update(testCoacTransactionCategory)).thenReturn(testCoacTransactionCategory);

        CoacTransactionCategory result = coacTransactionCategoryService.update(testCoacTransactionCategory);

        assertThat(result).isNotNull();
        assertThat(result.getTransactionCategory().getTransactionCategoryCode()).isEqualTo("EXPENSE");
        verify(dao, times(1)).update(testCoacTransactionCategory);
    }

    @Test
    void shouldDeleteCoacTransactionCategory() {
        coacTransactionCategoryService.delete(testCoacTransactionCategory);

        verify(dao, times(1)).delete(testCoacTransactionCategory);
    }

    @Test
    void shouldFindCoacTransactionCategoriesByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("chartOfAccountId", 1);
        attributes.put("transactionCategoryId", 1);

        List<CoacTransactionCategory> expectedList = Arrays.asList(testCoacTransactionCategory);
        when(dao.findByAttributes(attributes)).thenReturn(expectedList);

        List<CoacTransactionCategory> result = coacTransactionCategoryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testCoacTransactionCategory);
        verify(dao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("chartOfAccountId", 999);

        when(dao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<CoacTransactionCategory> result = coacTransactionCategoryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(dao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<CoacTransactionCategory> result = coacTransactionCategoryService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(dao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<CoacTransactionCategory> result = coacTransactionCategoryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(dao, never()).findByAttributes(any());
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleCoacTransactionCategoryWithMinimalData() {
        CoacTransactionCategory minimal = new CoacTransactionCategory();
        minimal.setCoacTransactionCategoryId(99);

        when(dao.findByPK(99)).thenReturn(minimal);

        CoacTransactionCategory result = coacTransactionCategoryService.findByPK(99);

        assertThat(result).isNotNull();
        assertThat(result.getCoacTransactionCategoryId()).isEqualTo(99);
        assertThat(result.getChartOfAccount()).isNull();
        assertThat(result.getTransactionCategory()).isNull();
        verify(dao, times(1)).findByPK(99);
    }

    @Test
    void shouldHandleChartOfAccountWithCompleteDetails() {
        ChartOfAccount detailedAccount = new ChartOfAccount();
        detailedAccount.setChartOfAccountId(5);
        detailedAccount.setChartOfAccountCode("2000");
        detailedAccount.setChartOfAccountName("Accounts Payable");
        detailedAccount.setChartOfAccountDescription("Vendor payables");

        coacTransactionCategoryService.addCoacTransactionCategory(detailedAccount, testTransactionCategory);

        ArgumentCaptor<ChartOfAccount> captor = ArgumentCaptor.forClass(ChartOfAccount.class);
        verify(dao, times(1)).addCoacTransactionCategory(captor.capture(), any(TransactionCategory.class));

        ChartOfAccount captured = captor.getValue();
        assertThat(captured.getChartOfAccountCode()).isEqualTo("2000");
        assertThat(captured.getChartOfAccountName()).isEqualTo("Accounts Payable");
        assertThat(captured.getChartOfAccountDescription()).isEqualTo("Vendor payables");
    }

    @Test
    void shouldHandleTransactionCategoryWithCompleteDetails() {
        TransactionCategory detailedCategory = new TransactionCategory();
        detailedCategory.setTransactionCategoryId(5);
        detailedCategory.setTransactionCategoryCode("PAYROLL");
        detailedCategory.setTransactionCategoryDescription("Payroll related transactions");

        coacTransactionCategoryService.addCoacTransactionCategory(testChartOfAccount, detailedCategory);

        ArgumentCaptor<TransactionCategory> captor = ArgumentCaptor.forClass(TransactionCategory.class);
        verify(dao, times(1)).addCoacTransactionCategory(any(ChartOfAccount.class), captor.capture());

        TransactionCategory captured = captor.getValue();
        assertThat(captured.getTransactionCategoryCode()).isEqualTo("PAYROLL");
        assertThat(captured.getTransactionCategoryDescription()).isEqualTo("Payroll related transactions");
    }

    @Test
    void shouldHandleMultipleUpdatesToSameCoacTransactionCategory() {
        when(dao.update(testCoacTransactionCategory)).thenReturn(testCoacTransactionCategory);

        coacTransactionCategoryService.update(testCoacTransactionCategory);
        coacTransactionCategoryService.update(testCoacTransactionCategory);
        coacTransactionCategoryService.update(testCoacTransactionCategory);

        verify(dao, times(3)).update(testCoacTransactionCategory);
    }

    @Test
    void shouldHandleLargeNumberOfAdditions() {
        for (int i = 1; i <= 20; i++) {
            ChartOfAccount account = createChartOfAccount(i, "ACC" + i, "Account " + i);
            TransactionCategory category = createTransactionCategory(i, "CAT" + i, "Category " + i);
            coacTransactionCategoryService.addCoacTransactionCategory(account, category);
        }

        verify(dao, times(20)).addCoacTransactionCategory(any(ChartOfAccount.class), any(TransactionCategory.class));
    }

    @Test
    void shouldFindMultipleCoacTransactionCategories() {
        CoacTransactionCategory ctc1 = new CoacTransactionCategory();
        ctc1.setCoacTransactionCategoryId(1);

        CoacTransactionCategory ctc2 = new CoacTransactionCategory();
        ctc2.setCoacTransactionCategoryId(2);

        CoacTransactionCategory ctc3 = new CoacTransactionCategory();
        ctc3.setCoacTransactionCategoryId(3);

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("chartOfAccountId", 1);

        List<CoacTransactionCategory> expectedList = Arrays.asList(ctc1, ctc2, ctc3);
        when(dao.findByAttributes(attributes)).thenReturn(expectedList);

        List<CoacTransactionCategory> result = coacTransactionCategoryService.findByAttributes(attributes);

        assertThat(result).hasSize(3);
        assertThat(result.get(0).getCoacTransactionCategoryId()).isEqualTo(1);
        assertThat(result.get(2).getCoacTransactionCategoryId()).isEqualTo(3);
        verify(dao, times(1)).findByAttributes(attributes);
    }

    // ========== Helper Methods ==========

    private ChartOfAccount createChartOfAccount(int id, String code, String name) {
        ChartOfAccount account = new ChartOfAccount();
        account.setChartOfAccountId(id);
        account.setChartOfAccountCode(code);
        account.setChartOfAccountName(name);
        return account;
    }

    private TransactionCategory createTransactionCategory(int id, String code, String description) {
        TransactionCategory category = new TransactionCategory();
        category.setTransactionCategoryId(id);
        category.setTransactionCategoryCode(code);
        category.setTransactionCategoryDescription(description);
        return category;
    }
}
