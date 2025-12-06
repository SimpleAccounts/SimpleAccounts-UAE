package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.TransactionCategoryBalanceFilterEnum;
import com.simpleaccounts.dao.TransactionCategoryBalanceDao;
import com.simpleaccounts.entity.Journal;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.entity.TransactionCategoryBalance;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.TransactionCategoryClosingBalanceService;
import com.simpleaccounts.utils.DateUtils;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
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
class TransactionCategoryBalanceServiceImplTest {

    @Mock
    private TransactionCategoryBalanceDao transactionCategoryBalanceDao;

    @Mock
    private DateUtils dateUtils;

    @Mock
    private TransactionCategoryClosingBalanceService transactionCategoryClosingBalanceService;

    @InjectMocks
    private TransactionCategoryBalanceServiceImpl transactionCategoryBalanceService;

    private TransactionCategoryBalance balance;
    private TransactionCategory category;
    private JournalLineItem lineItem;
    private Journal journal;

    @BeforeEach
    void setUp() {
        category = new TransactionCategory();
        category.setTransactionCategoryId(1);
        category.setTransactionCategoryName("Test Category");

        balance = new TransactionCategoryBalance();
        balance.setTransactionCategoryBalanceId(1);
        balance.setTransactionCategory(category);
        balance.setRunningBalance(BigDecimal.valueOf(1000.00));
        balance.setOpeningBalance(BigDecimal.valueOf(500.00));
        balance.setCreatedBy(1);
        balance.setEffectiveDate(new Date());

        journal = new Journal();
        journal.setJournalDate(LocalDate.now());
        journal.setJournalId(1);

        lineItem = new JournalLineItem();
        lineItem.setJournalLineItemId(1);
        lineItem.setTransactionCategory(category);
        lineItem.setJournal(journal);
        lineItem.setCreatedBy(1);
        lineItem.setDeleteFlag(false);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnTransactionCategoryBalanceDaoWhenGetDaoCalled() {
        assertThat(transactionCategoryBalanceService.getDao()).isEqualTo(transactionCategoryBalanceDao);
    }

    @Test
    void shouldReturnSameDaoInstanceOnMultipleCalls() {
        assertThat(transactionCategoryBalanceService.getDao()).isSameAs(transactionCategoryBalanceDao);
        assertThat(transactionCategoryBalanceService.getDao()).isSameAs(transactionCategoryBalanceDao);
    }

    // ========== getAll Tests ==========

    @Test
    void shouldReturnPaginationResponseWhenGetAllCalled() {
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();
        PaginationResponseModel expectedResponse = new PaginationResponseModel();

        when(transactionCategoryBalanceDao.getAll(filterMap, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = transactionCategoryBalanceService.getAll(filterMap, paginationModel);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(expectedResponse);
        verify(transactionCategoryBalanceDao, times(1)).getAll(filterMap, paginationModel);
    }

    @Test
    void shouldHandleNullFilterMap() {
        PaginationModel paginationModel = new PaginationModel();
        PaginationResponseModel expectedResponse = new PaginationResponseModel();

        when(transactionCategoryBalanceDao.getAll(null, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = transactionCategoryBalanceService.getAll(null, paginationModel);

        assertThat(result).isNotNull();
        verify(transactionCategoryBalanceDao, times(1)).getAll(null, paginationModel);
    }

    @Test
    void shouldHandleEmptyFilterMap() {
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();
        PaginationResponseModel expectedResponse = new PaginationResponseModel();

        when(transactionCategoryBalanceDao.getAll(filterMap, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = transactionCategoryBalanceService.getAll(filterMap, paginationModel);

        assertThat(result).isNotNull();
        verify(transactionCategoryBalanceDao, times(1)).getAll(filterMap, paginationModel);
    }

    // ========== updateRunningBalance Tests - Credit Transactions ==========

    @Test
    void shouldUpdateRunningBalanceWithCreditAmountWhenBalanceExists() {
        lineItem.setCreditAmount(BigDecimal.valueOf(100.00));
        lineItem.setDebitAmount(null);

        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenReturn(balance);

        List<TransactionCategoryBalance> existingBalances = Collections.singletonList(balance);
        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(existingBalances);

        BigDecimal result = transactionCategoryBalanceService.updateRunningBalance(lineItem);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(BigDecimal.valueOf(1100.00));
        assertThat(balance.getRunningBalance()).isEqualTo(BigDecimal.valueOf(1100.00));
        verify(transactionCategoryBalanceDao, times(1)).update(balance);
        verify(transactionCategoryClosingBalanceService, times(1)).updateClosingBalance(lineItem);
    }

    @Test
    void shouldUpdateRunningBalanceWithDebitAmountWhenBalanceExists() {
        lineItem.setDebitAmount(BigDecimal.valueOf(200.00));
        lineItem.setCreditAmount(null);

        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenReturn(balance);

        List<TransactionCategoryBalance> existingBalances = Collections.singletonList(balance);
        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(existingBalances);

        BigDecimal result = transactionCategoryBalanceService.updateRunningBalance(lineItem);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(BigDecimal.valueOf(800.00));
        assertThat(balance.getRunningBalance()).isEqualTo(BigDecimal.valueOf(800.00));
        verify(transactionCategoryBalanceDao, times(1)).update(balance);
        verify(transactionCategoryClosingBalanceService, times(1)).updateClosingBalance(lineItem);
    }

    @Test
    void shouldCreateNewBalanceWhenNoneExists() {
        lineItem.setCreditAmount(BigDecimal.valueOf(100.00));
        lineItem.setDebitAmount(null);

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.emptyList());
        when(dateUtils.get(any(LocalDateTime.class))).thenReturn(new Date());
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BigDecimal result = transactionCategoryBalanceService.updateRunningBalance(lineItem);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(BigDecimal.valueOf(100.00));
        verify(transactionCategoryBalanceDao, times(1)).update(any(TransactionCategoryBalance.class));
        verify(transactionCategoryClosingBalanceService, times(1)).updateClosingBalance(lineItem);
    }

    @Test
    void shouldReturnNullWhenLineItemIsNull() {
        BigDecimal result = transactionCategoryBalanceService.updateRunningBalance(null);

        assertThat(result).isNull();
        verify(transactionCategoryBalanceDao, never()).update(any(TransactionCategoryBalance.class));
        verify(transactionCategoryClosingBalanceService, never()).updateClosingBalance(any(JournalLineItem.class));
    }

    @Test
    void shouldHandleZeroRunningBalance() {
        balance.setRunningBalance(BigDecimal.ZERO);
        lineItem.setCreditAmount(BigDecimal.valueOf(50.00));
        lineItem.setDebitAmount(null);

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.singletonList(balance));
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenReturn(balance);

        BigDecimal result = transactionCategoryBalanceService.updateRunningBalance(lineItem);

        assertThat(result).isEqualTo(BigDecimal.valueOf(50.00));
        verify(transactionCategoryBalanceDao, times(1)).update(balance);
    }

    @Test
    void shouldHandleNullRunningBalance() {
        balance.setRunningBalance(null);
        lineItem.setCreditAmount(BigDecimal.valueOf(75.00));
        lineItem.setDebitAmount(null);

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.singletonList(balance));
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenReturn(balance);

        BigDecimal result = transactionCategoryBalanceService.updateRunningBalance(lineItem);

        assertThat(result).isEqualTo(BigDecimal.valueOf(75.00));
        verify(transactionCategoryBalanceDao, times(1)).update(balance);
    }

    // ========== updateRunningBalance Tests - Delete Flag ==========

    @Test
    void shouldReverseDebitWhenDeleteFlagIsTrue() {
        lineItem.setDebitAmount(BigDecimal.valueOf(100.00));
        lineItem.setCreditAmount(null);
        lineItem.setDeleteFlag(true);

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.singletonList(balance));
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenReturn(balance);

        BigDecimal result = transactionCategoryBalanceService.updateRunningBalance(lineItem);

        assertThat(result).isEqualTo(BigDecimal.valueOf(1100.00));
        verify(transactionCategoryBalanceDao, times(1)).update(balance);
    }

    @Test
    void shouldReverseCreditWhenDeleteFlagIsTrue() {
        lineItem.setCreditAmount(BigDecimal.valueOf(100.00));
        lineItem.setDebitAmount(null);
        lineItem.setDeleteFlag(true);

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.singletonList(balance));
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenReturn(balance);

        BigDecimal result = transactionCategoryBalanceService.updateRunningBalance(lineItem);

        assertThat(result).isEqualTo(BigDecimal.valueOf(900.00));
        verify(transactionCategoryBalanceDao, times(1)).update(balance);
    }

    @Test
    void shouldHandleZeroDebitAmount() {
        lineItem.setDebitAmount(BigDecimal.ZERO);
        lineItem.setCreditAmount(BigDecimal.valueOf(100.00));

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.singletonList(balance));
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenReturn(balance);

        BigDecimal result = transactionCategoryBalanceService.updateRunningBalance(lineItem);

        assertThat(result).isEqualTo(BigDecimal.valueOf(1100.00));
        verify(transactionCategoryBalanceDao, times(1)).update(balance);
    }

    @Test
    void shouldHandleZeroCreditAmount() {
        lineItem.setCreditAmount(BigDecimal.ZERO);
        lineItem.setDebitAmount(BigDecimal.valueOf(100.00));

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.singletonList(balance));
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenReturn(balance);

        BigDecimal result = transactionCategoryBalanceService.updateRunningBalance(lineItem);

        assertThat(result).isEqualTo(BigDecimal.valueOf(900.00));
        verify(transactionCategoryBalanceDao, times(1)).update(balance);
    }

    // ========== updateRunningBalanceAndOpeningBalance Tests ==========

    @Test
    void shouldUpdateBothRunningAndOpeningBalancesWhenUpdateOpeningBalanceIsTrue() {
        lineItem.setCreditAmount(BigDecimal.valueOf(100.00));
        lineItem.setDebitAmount(null);

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.singletonList(balance));
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenReturn(balance);

        BigDecimal result = transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(lineItem, true);

        assertThat(result).isEqualTo(BigDecimal.valueOf(1100.00));
        assertThat(balance.getRunningBalance()).isEqualTo(BigDecimal.valueOf(1100.00));
        assertThat(balance.getOpeningBalance()).isEqualTo(BigDecimal.valueOf(1100.00));
        verify(transactionCategoryBalanceDao, times(1)).update(balance);
    }

    @Test
    void shouldNotUpdateOpeningBalanceWhenUpdateOpeningBalanceIsFalse() {
        lineItem.setCreditAmount(BigDecimal.valueOf(100.00));
        lineItem.setDebitAmount(null);
        BigDecimal originalOpeningBalance = balance.getOpeningBalance();

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.singletonList(balance));
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenReturn(balance);

        BigDecimal result = transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(lineItem, false);

        assertThat(result).isEqualTo(BigDecimal.valueOf(1100.00));
        assertThat(balance.getRunningBalance()).isEqualTo(BigDecimal.valueOf(1100.00));
        assertThat(balance.getOpeningBalance()).isEqualTo(originalOpeningBalance);
        verify(transactionCategoryBalanceDao, times(1)).update(balance);
    }

    @Test
    void shouldNegateOpeningBalanceWhenRunningBalanceIsNegative() {
        balance.setRunningBalance(BigDecimal.valueOf(100.00));
        lineItem.setDebitAmount(BigDecimal.valueOf(200.00));
        lineItem.setCreditAmount(null);

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.singletonList(balance));
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenReturn(balance);

        BigDecimal result = transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(lineItem, true);

        assertThat(result).isEqualTo(BigDecimal.valueOf(-100.00));
        assertThat(balance.getOpeningBalance()).isEqualTo(BigDecimal.valueOf(100.00));
        verify(transactionCategoryBalanceDao, times(1)).update(balance);
    }

    @Test
    void shouldCreateNewBalanceWithOpeningBalanceWhenNoneExists() {
        lineItem.setCreditAmount(BigDecimal.valueOf(500.00));
        lineItem.setDebitAmount(null);

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.emptyList());
        when(dateUtils.get(any(LocalDateTime.class))).thenReturn(new Date());
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BigDecimal result = transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(lineItem, true);

        assertThat(result).isEqualTo(BigDecimal.valueOf(500.00));
        verify(transactionCategoryBalanceDao, times(1)).update(any(TransactionCategoryBalance.class));
    }

    @Test
    void shouldReturnNullWhenLineItemIsNullForOpeningBalance() {
        BigDecimal result = transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(null, true);

        assertThat(result).isNull();
        verify(transactionCategoryBalanceDao, never()).update(any(TransactionCategoryBalance.class));
    }

    @Test
    void shouldHandleDebitTransactionWithOpeningBalance() {
        lineItem.setDebitAmount(BigDecimal.valueOf(300.00));
        lineItem.setCreditAmount(null);

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.singletonList(balance));
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenReturn(balance);

        BigDecimal result = transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(lineItem, true);

        assertThat(result).isEqualTo(BigDecimal.valueOf(700.00));
        assertThat(balance.getOpeningBalance()).isEqualTo(BigDecimal.valueOf(700.00));
        verify(transactionCategoryBalanceDao, times(1)).update(balance);
    }

    @Test
    void shouldHandleDeletedDebitTransactionWithOpeningBalance() {
        lineItem.setDebitAmount(BigDecimal.valueOf(100.00));
        lineItem.setCreditAmount(null);
        lineItem.setDeleteFlag(true);

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.singletonList(balance));
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenReturn(balance);

        BigDecimal result = transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(lineItem, true);

        assertThat(result).isEqualTo(BigDecimal.valueOf(1100.00));
        verify(transactionCategoryBalanceDao, times(1)).update(balance);
    }

    @Test
    void shouldHandleDeletedCreditTransactionWithOpeningBalance() {
        lineItem.setCreditAmount(BigDecimal.valueOf(100.00));
        lineItem.setDebitAmount(null);
        lineItem.setDeleteFlag(true);

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.singletonList(balance));
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenReturn(balance);

        BigDecimal result = transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(lineItem, true);

        assertThat(result).isEqualTo(BigDecimal.valueOf(900.00));
        verify(transactionCategoryBalanceDao, times(1)).update(balance);
    }

    @Test
    void shouldHandleZeroRunningBalanceWithOpeningBalance() {
        balance.setRunningBalance(BigDecimal.ZERO);
        lineItem.setCreditAmount(BigDecimal.valueOf(250.00));
        lineItem.setDebitAmount(null);

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.singletonList(balance));
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenReturn(balance);

        BigDecimal result = transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(lineItem, true);

        assertThat(result).isEqualTo(BigDecimal.valueOf(250.00));
        assertThat(balance.getOpeningBalance()).isEqualTo(BigDecimal.valueOf(250.00));
        verify(transactionCategoryBalanceDao, times(1)).update(balance);
    }

    @Test
    void shouldHandleLargeAmounts() {
        lineItem.setCreditAmount(BigDecimal.valueOf(1000000.00));
        lineItem.setDebitAmount(null);

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.singletonList(balance));
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenReturn(balance);

        BigDecimal result = transactionCategoryBalanceService.updateRunningBalance(lineItem);

        assertThat(result).isEqualTo(BigDecimal.valueOf(1001000.00));
        verify(transactionCategoryBalanceDao, times(1)).update(balance);
    }

    @Test
    void shouldHandleSmallDecimalAmounts() {
        lineItem.setCreditAmount(BigDecimal.valueOf(0.01));
        lineItem.setDebitAmount(null);

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.singletonList(balance));
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenReturn(balance);

        BigDecimal result = transactionCategoryBalanceService.updateRunningBalance(lineItem);

        assertThat(result).isEqualTo(BigDecimal.valueOf(1000.01));
        verify(transactionCategoryBalanceDao, times(1)).update(balance);
    }

    @Test
    void shouldCallClosingBalanceServiceAfterUpdate() {
        lineItem.setCreditAmount(BigDecimal.valueOf(100.00));
        lineItem.setDebitAmount(null);

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.singletonList(balance));
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenReturn(balance);

        transactionCategoryBalanceService.updateRunningBalance(lineItem);

        verify(transactionCategoryClosingBalanceService, times(1)).updateClosingBalance(lineItem);
    }

    @Test
    void shouldHandleNullCreditAndDebitAmounts() {
        lineItem.setCreditAmount(null);
        lineItem.setDebitAmount(null);

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.singletonList(balance));
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenReturn(balance);

        BigDecimal result = transactionCategoryBalanceService.updateRunningBalance(lineItem);

        assertThat(result).isEqualTo(BigDecimal.valueOf(1000.00));
        verify(transactionCategoryBalanceDao, times(1)).update(balance);
    }

    @Test
    void shouldSetEffectiveDateWhenCreatingNewBalance() {
        lineItem.setCreditAmount(BigDecimal.valueOf(100.00));
        lineItem.setDebitAmount(null);
        Date expectedDate = new Date();

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.emptyList());
        when(dateUtils.get(any(LocalDateTime.class))).thenReturn(expectedDate);
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenAnswer(invocation -> {
            TransactionCategoryBalance capturedBalance = invocation.getArgument(0);
            assertThat(capturedBalance.getEffectiveDate()).isEqualTo(expectedDate);
            return capturedBalance;
        });

        transactionCategoryBalanceService.updateRunningBalance(lineItem);

        verify(dateUtils, times(1)).get(any(LocalDateTime.class));
    }

    @Test
    void shouldSetTransactionCategoryWhenCreatingNewBalance() {
        lineItem.setCreditAmount(BigDecimal.valueOf(100.00));
        lineItem.setDebitAmount(null);

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.emptyList());
        when(dateUtils.get(any(LocalDateTime.class))).thenReturn(new Date());
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenAnswer(invocation -> {
            TransactionCategoryBalance capturedBalance = invocation.getArgument(0);
            assertThat(capturedBalance.getTransactionCategory()).isEqualTo(category);
            return capturedBalance;
        });

        transactionCategoryBalanceService.updateRunningBalance(lineItem);

        verify(transactionCategoryBalanceDao, times(1)).update(any(TransactionCategoryBalance.class));
    }

    @Test
    void shouldSetCreatedByWhenCreatingNewBalance() {
        lineItem.setCreditAmount(BigDecimal.valueOf(100.00));
        lineItem.setDebitAmount(null);
        lineItem.setCreatedBy(999);

        when(transactionCategoryBalanceDao.findByAttributes(any(Map.class))).thenReturn(Collections.emptyList());
        when(dateUtils.get(any(LocalDateTime.class))).thenReturn(new Date());
        when(transactionCategoryBalanceDao.update(any(TransactionCategoryBalance.class))).thenAnswer(invocation -> {
            TransactionCategoryBalance capturedBalance = invocation.getArgument(0);
            assertThat(capturedBalance.getCreatedBy()).isEqualTo(999);
            return capturedBalance;
        });

        transactionCategoryBalanceService.updateRunningBalance(lineItem);

        verify(transactionCategoryBalanceDao, times(1)).update(any(TransactionCategoryBalance.class));
    }
}
