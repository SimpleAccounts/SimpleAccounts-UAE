package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.never;
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
import java.util.Collections;
import java.util.Date;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("TransactionCategoryBalanceServiceImpl Tests")
class TransactionCategoryBalanceServiceImplTest {

    @Mock
    private TransactionCategoryBalanceDao transactionCategoryBalanceDao;

    @Mock
    private DateUtils dateUtils;

    @Mock
    private TransactionCategoryClosingBalanceService transactionCategoryClosingBalanceService;

    @InjectMocks
    private TransactionCategoryBalanceServiceImpl transactionCategoryBalanceService;

    private TransactionCategory testCategory;
    private JournalLineItem testLineItem;
    private Journal testJournal;
    private TransactionCategoryBalance testBalance;

    @BeforeEach
    void setUp() {
        testCategory = new TransactionCategory();
        testCategory.setTransactionCategoryId(1);
        testCategory.setTransactionCategoryName("Test Category");

        testJournal = new Journal();
        testJournal.setJournalId(1);
        testJournal.setJournalDate(LocalDate.now());

        testLineItem = new JournalLineItem();
        testLineItem.setJournalLineItemId(1);
        testLineItem.setTransactionCategory(testCategory);
        testLineItem.setJournal(testJournal);
        testLineItem.setCreatedBy(1);
        testLineItem.setDeleteFlag(false);

        testBalance = new TransactionCategoryBalance();
        testBalance.setTransactionCategoryBalanceId(1);
        testBalance.setTransactionCategory(testCategory);
        testBalance.setRunningBalance(new BigDecimal("1000.00"));
        testBalance.setOpeningBalance(new BigDecimal("500.00"));
    }

    @Nested
    @DisplayName("getDao Tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return transaction category balance dao")
        void shouldReturnTransactionCategoryBalanceDao() {
            assertThat(transactionCategoryBalanceService.getDao()).isEqualTo(transactionCategoryBalanceDao);
        }
    }

    @Nested
    @DisplayName("getAll Tests")
    class GetAllTests {

        @Test
        @DisplayName("Should return paginated balance list")
        void shouldReturnPaginatedBalanceList() {
            Map<TransactionCategoryBalanceFilterEnum, Object> filterMap =
                    new EnumMap<>(TransactionCategoryBalanceFilterEnum.class);
            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNo(0);
            paginationModel.setPageSize(10);

            PaginationResponseModel expectedResponse = new PaginationResponseModel(1, new HashMap<>());
            when(transactionCategoryBalanceDao.getAll(filterMap, paginationModel)).thenReturn(expectedResponse);

            PaginationResponseModel result = transactionCategoryBalanceService.getAll(filterMap, paginationModel);

            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(1);
            verify(transactionCategoryBalanceDao).getAll(filterMap, paginationModel);
        }
    }

    @Nested
    @DisplayName("updateRunningBalance Tests")
    class UpdateRunningBalanceTests {

        @Test
        @DisplayName("Should return null when line item is null")
        void shouldReturnNullWhenLineItemIsNull() {
            BigDecimal result = transactionCategoryBalanceService.updateRunningBalance(null);

            assertThat(result).isNull();
            verify(transactionCategoryBalanceDao, never()).update(any());
        }

        @Test
        @DisplayName("Should add credit amount to running balance")
        void shouldAddCreditAmountToRunningBalance() {
            testLineItem.setCreditAmount(new BigDecimal("100.00"));
            testLineItem.setDebitAmount(null);

            when(transactionCategoryBalanceDao.findByAttributes(anyMap()))
                    .thenReturn(Collections.singletonList(testBalance));

            BigDecimal result = transactionCategoryBalanceService.updateRunningBalance(testLineItem);

            assertThat(result).isEqualByComparingTo(new BigDecimal("1100.00"));
            verify(transactionCategoryBalanceDao).update(testBalance);
            verify(transactionCategoryClosingBalanceService).updateClosingBalance(testLineItem);
        }

        @Test
        @DisplayName("Should subtract debit amount from running balance")
        void shouldSubtractDebitAmountFromRunningBalance() {
            testLineItem.setDebitAmount(new BigDecimal("200.00"));
            testLineItem.setCreditAmount(null);

            when(transactionCategoryBalanceDao.findByAttributes(anyMap()))
                    .thenReturn(Collections.singletonList(testBalance));

            BigDecimal result = transactionCategoryBalanceService.updateRunningBalance(testLineItem);

            assertThat(result).isEqualByComparingTo(new BigDecimal("800.00"));
            verify(transactionCategoryBalanceDao).update(testBalance);
        }

        @Test
        @DisplayName("Should create new balance when none exists")
        void shouldCreateNewBalanceWhenNoneExists() {
            testLineItem.setCreditAmount(new BigDecimal("300.00"));
            testLineItem.setDebitAmount(null);

            when(transactionCategoryBalanceDao.findByAttributes(anyMap()))
                    .thenReturn(Collections.emptyList());
            when(dateUtils.get(any())).thenReturn(new Date());

            BigDecimal result = transactionCategoryBalanceService.updateRunningBalance(testLineItem);

            ArgumentCaptor<TransactionCategoryBalance> balanceCaptor =
                    ArgumentCaptor.forClass(TransactionCategoryBalance.class);
            verify(transactionCategoryBalanceDao).update(balanceCaptor.capture());

            TransactionCategoryBalance capturedBalance = balanceCaptor.getValue();
            assertThat(capturedBalance.getTransactionCategory()).isEqualTo(testCategory);
            assertThat(capturedBalance.getOpeningBalance()).isEqualByComparingTo(new BigDecimal("300.00"));
        }

        @Test
        @DisplayName("Should reverse credit when deleted")
        void shouldReverseCreditWhenDeleted() {
            testLineItem.setCreditAmount(new BigDecimal("100.00"));
            testLineItem.setDebitAmount(null);
            testLineItem.setDeleteFlag(true);

            when(transactionCategoryBalanceDao.findByAttributes(anyMap()))
                    .thenReturn(Collections.singletonList(testBalance));

            BigDecimal result = transactionCategoryBalanceService.updateRunningBalance(testLineItem);

            assertThat(result).isEqualByComparingTo(new BigDecimal("900.00"));
        }

        @Test
        @DisplayName("Should reverse debit when deleted")
        void shouldReverseDebitWhenDeleted() {
            testLineItem.setDebitAmount(new BigDecimal("200.00"));
            testLineItem.setCreditAmount(null);
            testLineItem.setDeleteFlag(true);

            when(transactionCategoryBalanceDao.findByAttributes(anyMap()))
                    .thenReturn(Collections.singletonList(testBalance));

            BigDecimal result = transactionCategoryBalanceService.updateRunningBalance(testLineItem);

            assertThat(result).isEqualByComparingTo(new BigDecimal("1200.00"));
        }
    }

    @Nested
    @DisplayName("updateRunningBalanceAndOpeningBalance Tests")
    class UpdateRunningBalanceAndOpeningBalanceTests {

        @Test
        @DisplayName("Should return null when line item is null")
        void shouldReturnNullWhenLineItemIsNull() {
            BigDecimal result = transactionCategoryBalanceService
                    .updateRunningBalanceAndOpeningBalance(null, true);

            assertThat(result).isNull();
        }

        @Test
        @DisplayName("Should update opening balance when flag is true")
        void shouldUpdateOpeningBalanceWhenFlagIsTrue() {
            testLineItem.setCreditAmount(new BigDecimal("100.00"));
            testLineItem.setDebitAmount(null);

            when(transactionCategoryBalanceDao.findByAttributes(anyMap()))
                    .thenReturn(Collections.singletonList(testBalance));

            BigDecimal result = transactionCategoryBalanceService
                    .updateRunningBalanceAndOpeningBalance(testLineItem, true);

            assertThat(result).isEqualByComparingTo(new BigDecimal("1100.00"));
            assertThat(testBalance.getOpeningBalance()).isEqualByComparingTo(new BigDecimal("1100.00"));
        }

        @Test
        @DisplayName("Should negate opening balance when negative")
        void shouldNegateOpeningBalanceWhenNegative() {
            testLineItem.setDebitAmount(new BigDecimal("2000.00"));
            testLineItem.setCreditAmount(null);
            testBalance.setRunningBalance(new BigDecimal("500.00"));

            when(transactionCategoryBalanceDao.findByAttributes(anyMap()))
                    .thenReturn(Collections.singletonList(testBalance));

            BigDecimal result = transactionCategoryBalanceService
                    .updateRunningBalanceAndOpeningBalance(testLineItem, true);

            assertThat(result).isEqualByComparingTo(new BigDecimal("-1500.00"));
            assertThat(testBalance.getOpeningBalance()).isEqualByComparingTo(new BigDecimal("1500.00"));
        }
    }
}
