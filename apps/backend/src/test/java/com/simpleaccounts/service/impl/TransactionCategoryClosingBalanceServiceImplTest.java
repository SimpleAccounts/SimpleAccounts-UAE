package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.TransactionCategoryClosingBalanceDao;
import com.simpleaccounts.entity.Journal;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.entity.TransactionCategoryClosingBalance;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.CurrencyExchangeService;
import com.simpleaccounts.utils.DateFormatUtil;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
@DisplayName("TransactionCategoryClosingBalanceServiceImpl Tests")
class TransactionCategoryClosingBalanceServiceImplTest {

    @Mock
    private TransactionCategoryClosingBalanceDao transactionCategoryClosingBalanceDao;

    @Mock
    private DateFormatUtil dateFormatUtil;

    @Mock
    private BankAccountService bankAccountService;

    @Mock
    private CurrencyExchangeService currencyExchangeService;

    @InjectMocks
    private TransactionCategoryClosingBalanceServiceImpl closingBalanceService;

    private TransactionCategory testCategory;
    private ChartOfAccount testChartOfAccount;
    private TransactionCategoryClosingBalance testClosingBalance;
    private Transaction testTransaction;

    @BeforeEach
    void setUp() {
        testChartOfAccount = new ChartOfAccount();
        testChartOfAccount.setChartOfAccountId(1);
        testChartOfAccount.setChartOfAccountName("Test COA");

        testCategory = new TransactionCategory();
        testCategory.setTransactionCategoryId(1);
        testCategory.setTransactionCategoryName("Test Category");
        testCategory.setChartOfAccount(testChartOfAccount);

        testClosingBalance = new TransactionCategoryClosingBalance();
        testClosingBalance.setTransactionCategoryClosingBalanceId(1);
        testClosingBalance.setTransactionCategory(testCategory);
        testClosingBalance.setClosingBalance(new BigDecimal("1000.00"));
        testClosingBalance.setBankAccountClosingBalance(new BigDecimal("1000.00"));
        testClosingBalance.setClosingBalanceDate(LocalDateTime.now());

        testTransaction = new Transaction();
        testTransaction.setTransactionId(1);
        testTransaction.setTransactionAmount(new BigDecimal("100.00"));
        testTransaction.setDebitCreditFlag('C');
        testTransaction.setTransactionDate(LocalDateTime.now());
        testTransaction.setExchangeRate(BigDecimal.ONE);
        testTransaction.setCreatedBy(1);
    }

    @Nested
    @DisplayName("getDao Tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return closing balance dao")
        void shouldReturnClosingBalanceDao() {
            assertThat(closingBalanceService.getDao()).isEqualTo(transactionCategoryClosingBalanceDao);
        }
    }

    @Nested
    @DisplayName("getList Tests")
    class GetListTests {

        @Test
        @DisplayName("Should return closing balance list by report request")
        void shouldReturnClosingBalanceListByReportRequest() {
            ReportRequestModel reportRequestModel = new ReportRequestModel();
            List<TransactionCategoryClosingBalance> expectedList = Collections.singletonList(testClosingBalance);
            when(transactionCategoryClosingBalanceDao.getList(reportRequestModel)).thenReturn(expectedList);

            List<TransactionCategoryClosingBalance> result = closingBalanceService.getList(reportRequestModel);

            assertThat(result).isNotNull().hasSize(1);
            verify(transactionCategoryClosingBalanceDao).getList(reportRequestModel);
        }
    }

    @Nested
    @DisplayName("getListByChartOfAccountIds Tests")
    class GetListByChartOfAccountIdsTests {

        @Test
        @DisplayName("Should return list by chart of account ids")
        void shouldReturnListByChartOfAccountIds() {
            ReportRequestModel reportRequestModel = new ReportRequestModel();
            List<TransactionCategoryClosingBalance> expectedList = Collections.singletonList(testClosingBalance);
            when(transactionCategoryClosingBalanceDao.getListByChartOfAccountIds(reportRequestModel))
                    .thenReturn(expectedList);

            List<TransactionCategoryClosingBalance> result =
                    closingBalanceService.getListByChartOfAccountIds(reportRequestModel);

            assertThat(result).isNotNull().hasSize(1);
            verify(transactionCategoryClosingBalanceDao).getListByChartOfAccountIds(reportRequestModel);
        }
    }

    @Nested
    @DisplayName("getLastClosingBalanceByDate Tests")
    class GetLastClosingBalanceByDateTests {

        @Test
        @DisplayName("Should return last closing balance by date")
        void shouldReturnLastClosingBalanceByDate() {
            when(transactionCategoryClosingBalanceDao.getLastClosingBalanceByDate(testCategory))
                    .thenReturn(testClosingBalance);

            TransactionCategoryClosingBalance result = closingBalanceService.getLastClosingBalanceByDate(testCategory);

            assertThat(result).isNotNull();
            assertThat(result.getClosingBalance()).isEqualByComparingTo(new BigDecimal("1000.00"));
            verify(transactionCategoryClosingBalanceDao).getLastClosingBalanceByDate(testCategory);
        }

        @Test
        @DisplayName("Should return null when no closing balance exists")
        void shouldReturnNullWhenNoClosingBalance() {
            when(transactionCategoryClosingBalanceDao.getLastClosingBalanceByDate(testCategory))
                    .thenReturn(null);

            TransactionCategoryClosingBalance result = closingBalanceService.getLastClosingBalanceByDate(testCategory);

            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("matchClosingBalanceForReconcile Tests")
    class MatchClosingBalanceForReconcileTests {

        @Test
        @DisplayName("Should return bank account closing balance when exists")
        void shouldReturnBankAccountClosingBalanceWhenExists() {
            LocalDateTime reconcileDate = LocalDateTime.now();
            testClosingBalance.setBankAccountClosingBalance(new BigDecimal("500.00"));
            when(transactionCategoryClosingBalanceDao.getClosingBalanceLessThanCurrentDate(reconcileDate, testCategory))
                    .thenReturn(testClosingBalance);

            BigDecimal result = closingBalanceService.matchClosingBalanceForReconcile(reconcileDate, testCategory);

            assertThat(result).isEqualByComparingTo(new BigDecimal("500.00"));
        }

        @Test
        @DisplayName("Should return zero when no closing balance exists")
        void shouldReturnZeroWhenNoClosingBalance() {
            LocalDateTime reconcileDate = LocalDateTime.now();
            when(transactionCategoryClosingBalanceDao.getClosingBalanceLessThanCurrentDate(reconcileDate, testCategory))
                    .thenReturn(null);

            BigDecimal result = closingBalanceService.matchClosingBalanceForReconcile(reconcileDate, testCategory);

            assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
        }
    }

    @Nested
    @DisplayName("updateClosingBalance with JournalLineItem Tests")
    class UpdateClosingBalanceWithJournalLineItemTests {

        @Test
        @DisplayName("Should create transaction from journal line item")
        void shouldCreateTransactionFromJournalLineItem() {
            Journal journal = new Journal();
            journal.setJournalDate(LocalDate.now());
            journal.setTransactionDate(LocalDate.now());

            JournalLineItem lineItem = new JournalLineItem();
            lineItem.setTransactionCategory(testCategory);
            lineItem.setJournal(journal);
            lineItem.setCreditAmount(new BigDecimal("100.00"));
            lineItem.setDebitAmount(null);
            lineItem.setCreatedBy(1);
            lineItem.setDeleteFlag(false);
            lineItem.setExchangeRate(BigDecimal.ONE);

            when(closingBalanceService.findByAttributes(anyMap())).thenReturn(Collections.singletonList(testClosingBalance));
            when(transactionCategoryClosingBalanceDao.getLastClosingBalanceByDate(testCategory))
                    .thenReturn(testClosingBalance);

            closingBalanceService.updateClosingBalance(lineItem);

            verify(transactionCategoryClosingBalanceDao).update(any(TransactionCategoryClosingBalance.class));
        }
    }

    @Nested
    @DisplayName("updateClosingBalance with Transaction Tests")
    class UpdateClosingBalanceWithTransactionTests {

        @Test
        @DisplayName("Should return null when transaction is null")
        void shouldReturnNullWhenTransactionIsNull() {
            BigDecimal result = closingBalanceService.updateClosingBalance(null, testCategory);

            assertThat(result).isNull();
            verify(transactionCategoryClosingBalanceDao, never()).update(any());
        }

        @Test
        @DisplayName("Should add credit amount to closing balance")
        void shouldAddCreditAmountToClosingBalance() {
            testTransaction.setDebitCreditFlag('C');
            testTransaction.setTransactionAmount(new BigDecimal("100.00"));

            when(closingBalanceService.findByAttributes(anyMap()))
                    .thenReturn(Collections.singletonList(testClosingBalance));
            when(transactionCategoryClosingBalanceDao.getLastClosingBalanceByDate(testCategory))
                    .thenReturn(testClosingBalance);

            BigDecimal result = closingBalanceService.updateClosingBalance(testTransaction, testCategory);

            assertThat(result).isNotNull();
            verify(transactionCategoryClosingBalanceDao).update(any(TransactionCategoryClosingBalance.class));
        }

        @Test
        @DisplayName("Should subtract debit amount from closing balance")
        void shouldSubtractDebitAmountFromClosingBalance() {
            testTransaction.setDebitCreditFlag('D');
            testTransaction.setTransactionAmount(new BigDecimal("200.00"));

            when(closingBalanceService.findByAttributes(anyMap()))
                    .thenReturn(Collections.singletonList(testClosingBalance));
            when(transactionCategoryClosingBalanceDao.getLastClosingBalanceByDate(testCategory))
                    .thenReturn(testClosingBalance);

            BigDecimal result = closingBalanceService.updateClosingBalance(testTransaction, testCategory);

            assertThat(result).isNotNull();
            verify(transactionCategoryClosingBalanceDao).update(any(TransactionCategoryClosingBalance.class));
        }
    }
}
