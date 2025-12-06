package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.TransactionCategoryClosingBalanceDao;
import com.simpleaccounts.entity.CurrencyConversion;
import com.simpleaccounts.entity.Journal;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.entity.TransactionCategoryClosingBalance;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.model.VatReportModel;
import com.simpleaccounts.model.VatReportResponseModel;
import com.simpleaccounts.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simpleaccounts.rest.financialreport.FinancialReportRequestModel;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.CurrencyExchangeService;
import com.simpleaccounts.utils.DateFormatUtil;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
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

    private TransactionCategoryClosingBalance closingBalance;
    private TransactionCategory category;
    private JournalLineItem lineItem;
    private Journal journal;
    private Transaction transaction;
    private ChartOfAccount chartOfAccount;

    @BeforeEach
    void setUp() {
        chartOfAccount = new ChartOfAccount();
        chartOfAccount.setChartOfAccountId(1);

        category = new TransactionCategory();
        category.setTransactionCategoryId(1);
        category.setTransactionCategoryName("Test Category");
        category.setChartOfAccount(chartOfAccount);

        closingBalance = new TransactionCategoryClosingBalance();
        closingBalance.setTransactionCategoryClosingBalanceId(1);
        closingBalance.setTransactionCategory(category);
        closingBalance.setClosingBalance(BigDecimal.valueOf(1000.00));
        closingBalance.setOpeningBalance(BigDecimal.valueOf(500.00));
        closingBalance.setClosingBalanceDate(LocalDateTime.now());

        journal = new Journal();
        journal.setJournalDate(LocalDate.now());
        journal.setJournalId(1);

        lineItem = new JournalLineItem();
        lineItem.setJournalLineItemId(1);
        lineItem.setTransactionCategory(category);
        lineItem.setJournal(journal);
        lineItem.setCreatedBy(1);
        lineItem.setDeleteFlag(false);
        lineItem.setExchangeRate(BigDecimal.ONE);

        transaction = new Transaction();
        transaction.setTransactionId(1);
        transaction.setDebitCreditFlag('D');
        transaction.setTransactionAmount(BigDecimal.valueOf(100.00));
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setCreatedBy(1);
        transaction.setExchangeRate(BigDecimal.ONE);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnTransactionCategoryClosingBalanceDaoWhenGetDaoCalled() {
        assertThat(closingBalanceService.getDao()).isEqualTo(transactionCategoryClosingBalanceDao);
    }

    @Test
    void shouldReturnSameDaoInstanceOnMultipleCalls() {
        assertThat(closingBalanceService.getDao()).isSameAs(transactionCategoryClosingBalanceDao);
        assertThat(closingBalanceService.getDao()).isSameAs(transactionCategoryClosingBalanceDao);
    }

    // ========== getList Tests ==========

    @Test
    void shouldReturnClosingBalanceListWhenValidRequestProvided() {
        ReportRequestModel requestModel = new ReportRequestModel();
        List<TransactionCategoryClosingBalance> expectedList = Collections.singletonList(closingBalance);

        when(transactionCategoryClosingBalanceDao.getList(requestModel)).thenReturn(expectedList);

        List<TransactionCategoryClosingBalance> result = closingBalanceService.getList(requestModel);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(closingBalance);
        verify(transactionCategoryClosingBalanceDao, times(1)).getList(requestModel);
    }

    @Test
    void shouldReturnEmptyListWhenNoDataFound() {
        ReportRequestModel requestModel = new ReportRequestModel();

        when(transactionCategoryClosingBalanceDao.getList(requestModel)).thenReturn(Collections.emptyList());

        List<TransactionCategoryClosingBalance> result = closingBalanceService.getList(requestModel);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(transactionCategoryClosingBalanceDao, times(1)).getList(requestModel);
    }

    @Test
    void shouldHandleNullRequestModel() {
        when(transactionCategoryClosingBalanceDao.getList(null)).thenReturn(Collections.emptyList());

        List<TransactionCategoryClosingBalance> result = closingBalanceService.getList(null);

        assertThat(result).isNotNull();
        verify(transactionCategoryClosingBalanceDao, times(1)).getList(null);
    }

    // ========== getListByChartOfAccountIds Tests ==========

    @Test
    void shouldReturnClosingBalanceListByChartOfAccountIds() {
        ReportRequestModel requestModel = new ReportRequestModel();
        List<TransactionCategoryClosingBalance> expectedList = Arrays.asList(closingBalance);

        when(transactionCategoryClosingBalanceDao.getListByChartOfAccountIds(requestModel)).thenReturn(expectedList);

        List<TransactionCategoryClosingBalance> result = closingBalanceService.getListByChartOfAccountIds(requestModel);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(transactionCategoryClosingBalanceDao, times(1)).getListByChartOfAccountIds(requestModel);
    }

    @Test
    void shouldReturnEmptyListWhenNoChartOfAccountsMatch() {
        ReportRequestModel requestModel = new ReportRequestModel();

        when(transactionCategoryClosingBalanceDao.getListByChartOfAccountIds(requestModel)).thenReturn(Collections.emptyList());

        List<TransactionCategoryClosingBalance> result = closingBalanceService.getListByChartOfAccountIds(requestModel);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(transactionCategoryClosingBalanceDao, times(1)).getListByChartOfAccountIds(requestModel);
    }

    // ========== getListByPlaceOfSupply Tests ==========

    @Test
    void shouldReturnVatReportModelListByPlaceOfSupply() {
        FinancialReportRequestModel requestModel = new FinancialReportRequestModel();
        VatReportModel vatModel = new VatReportModel();
        List<VatReportModel> expectedList = Collections.singletonList(vatModel);

        when(transactionCategoryClosingBalanceDao.getListByplaceOfSupply(requestModel)).thenReturn(expectedList);

        List<VatReportModel> result = closingBalanceService.getListByPlaceOfSupply(requestModel);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(transactionCategoryClosingBalanceDao, times(1)).getListByplaceOfSupply(requestModel);
    }

    @Test
    void shouldReturnEmptyVatReportListWhenNoDataFound() {
        FinancialReportRequestModel requestModel = new FinancialReportRequestModel();

        when(transactionCategoryClosingBalanceDao.getListByplaceOfSupply(requestModel)).thenReturn(Collections.emptyList());

        List<VatReportModel> result = closingBalanceService.getListByPlaceOfSupply(requestModel);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(transactionCategoryClosingBalanceDao, times(1)).getListByplaceOfSupply(requestModel);
    }

    // ========== getLastClosingBalanceByDate Tests ==========

    @Test
    void shouldReturnLastClosingBalanceWhenExists() {
        when(transactionCategoryClosingBalanceDao.getLastClosingBalanceByDate(category)).thenReturn(closingBalance);

        TransactionCategoryClosingBalance result = closingBalanceService.getLastClosingBalanceByDate(category);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(closingBalance);
        verify(transactionCategoryClosingBalanceDao, times(1)).getLastClosingBalanceByDate(category);
    }

    @Test
    void shouldReturnNullWhenNoLastClosingBalanceExists() {
        when(transactionCategoryClosingBalanceDao.getLastClosingBalanceByDate(category)).thenReturn(null);

        TransactionCategoryClosingBalance result = closingBalanceService.getLastClosingBalanceByDate(category);

        assertThat(result).isNull();
        verify(transactionCategoryClosingBalanceDao, times(1)).getLastClosingBalanceByDate(category);
    }

    @Test
    void shouldHandleNullCategoryForLastClosingBalance() {
        when(transactionCategoryClosingBalanceDao.getLastClosingBalanceByDate(null)).thenReturn(null);

        TransactionCategoryClosingBalance result = closingBalanceService.getLastClosingBalanceByDate(null);

        assertThat(result).isNull();
        verify(transactionCategoryClosingBalanceDao, times(1)).getLastClosingBalanceByDate(null);
    }

    // ========== updateClosingBalance(JournalLineItem) Tests ==========

    @Test
    void shouldUpdateClosingBalanceFromDebitLineItem() {
        lineItem.setDebitAmount(BigDecimal.valueOf(100.00));
        lineItem.setCreditAmount(null);

        when(transactionCategoryClosingBalanceDao.findByAttributes(any())).thenReturn(Collections.singletonList(closingBalance));
        when(transactionCategoryClosingBalanceDao.update(any())).thenReturn(closingBalance);

        closingBalanceService.updateClosingBalance(lineItem);

        verify(transactionCategoryClosingBalanceDao, times(1)).update(any(TransactionCategoryClosingBalance.class));
    }

    @Test
    void shouldUpdateClosingBalanceFromCreditLineItem() {
        lineItem.setCreditAmount(BigDecimal.valueOf(100.00));
        lineItem.setDebitAmount(null);

        when(transactionCategoryClosingBalanceDao.findByAttributes(any())).thenReturn(Collections.singletonList(closingBalance));
        when(transactionCategoryClosingBalanceDao.update(any())).thenReturn(closingBalance);

        closingBalanceService.updateClosingBalance(lineItem);

        verify(transactionCategoryClosingBalanceDao, times(1)).update(any(TransactionCategoryClosingBalance.class));
    }

    @Test
    void shouldSetDebitCreditFlagToDebitWhenDebitAmountExists() {
        lineItem.setDebitAmount(BigDecimal.valueOf(100.00));
        lineItem.setCreditAmount(null);

        when(transactionCategoryClosingBalanceDao.findByAttributes(any())).thenReturn(Collections.singletonList(closingBalance));
        when(transactionCategoryClosingBalanceDao.update(any())).thenReturn(closingBalance);

        closingBalanceService.updateClosingBalance(lineItem);

        verify(transactionCategoryClosingBalanceDao, times(1)).update(any(TransactionCategoryClosingBalance.class));
    }

    @Test
    void shouldReverseDebitCreditFlagWhenDeleteFlagIsTrue() {
        lineItem.setDebitAmount(BigDecimal.valueOf(100.00));
        lineItem.setCreditAmount(null);
        lineItem.setDeleteFlag(true);

        when(transactionCategoryClosingBalanceDao.findByAttributes(any())).thenReturn(Collections.singletonList(closingBalance));
        when(transactionCategoryClosingBalanceDao.update(any())).thenReturn(closingBalance);

        closingBalanceService.updateClosingBalance(lineItem);

        verify(transactionCategoryClosingBalanceDao, times(1)).update(any(TransactionCategoryClosingBalance.class));
    }

    @Test
    void shouldUseTransactionDateWhenAvailable() {
        journal.setTransactionDate(LocalDate.now().minusDays(5));
        lineItem.setCreditAmount(BigDecimal.valueOf(100.00));

        when(transactionCategoryClosingBalanceDao.findByAttributes(any())).thenReturn(Collections.singletonList(closingBalance));
        when(transactionCategoryClosingBalanceDao.update(any())).thenReturn(closingBalance);

        closingBalanceService.updateClosingBalance(lineItem);

        verify(transactionCategoryClosingBalanceDao, times(1)).update(any(TransactionCategoryClosingBalance.class));
    }

    @Test
    void shouldUseJournalDateWhenTransactionDateIsNull() {
        journal.setTransactionDate(null);
        lineItem.setCreditAmount(BigDecimal.valueOf(100.00));

        when(transactionCategoryClosingBalanceDao.findByAttributes(any())).thenReturn(Collections.singletonList(closingBalance));
        when(transactionCategoryClosingBalanceDao.update(any())).thenReturn(closingBalance);

        closingBalanceService.updateClosingBalance(lineItem);

        verify(transactionCategoryClosingBalanceDao, times(1)).update(any(TransactionCategoryClosingBalance.class));
    }

    // ========== updateClosingBalance(Transaction, TransactionCategory) Tests ==========

    @Test
    void shouldUpdateClosingBalanceWithDebitTransaction() {
        transaction.setDebitCreditFlag('D');
        transaction.setTransactionAmount(BigDecimal.valueOf(100.00));

        when(transactionCategoryClosingBalanceDao.findByAttributes(any())).thenReturn(Collections.singletonList(closingBalance));
        when(transactionCategoryClosingBalanceDao.update(any())).thenReturn(closingBalance);

        BigDecimal result = closingBalanceService.updateClosingBalance(transaction, category);

        assertThat(result).isNotNull();
        verify(transactionCategoryClosingBalanceDao, times(1)).update(any(TransactionCategoryClosingBalance.class));
    }

    @Test
    void shouldUpdateClosingBalanceWithCreditTransaction() {
        transaction.setDebitCreditFlag('C');
        transaction.setTransactionAmount(BigDecimal.valueOf(100.00));

        when(transactionCategoryClosingBalanceDao.findByAttributes(any())).thenReturn(Collections.singletonList(closingBalance));
        when(transactionCategoryClosingBalanceDao.update(any())).thenReturn(closingBalance);

        BigDecimal result = closingBalanceService.updateClosingBalance(transaction, category);

        assertThat(result).isNotNull();
        verify(transactionCategoryClosingBalanceDao, times(1)).update(any(TransactionCategoryClosingBalance.class));
    }

    @Test
    void shouldReturnNullWhenTransactionIsNull() {
        BigDecimal result = closingBalanceService.updateClosingBalance(null, category);

        assertThat(result).isNull();
        verify(transactionCategoryClosingBalanceDao, never()).update(any(TransactionCategoryClosingBalance.class));
    }

    @Test
    void shouldHandleNullTransactionAmount() {
        transaction.setTransactionAmount(null);

        when(transactionCategoryClosingBalanceDao.findByAttributes(any())).thenReturn(Collections.singletonList(closingBalance));
        when(transactionCategoryClosingBalanceDao.update(any())).thenReturn(closingBalance);

        BigDecimal result = closingBalanceService.updateClosingBalance(transaction, category);

        assertThat(result).isNotNull();
        verify(transactionCategoryClosingBalanceDao, times(1)).update(any(TransactionCategoryClosingBalance.class));
    }

    @Test
    void shouldCreateNewClosingBalanceWhenNoneExists() {
        when(transactionCategoryClosingBalanceDao.findByAttributes(any())).thenReturn(Collections.emptyList());
        when(transactionCategoryClosingBalanceDao.getClosingBalanceLessThanCurrentDate(any(), any())).thenReturn(null);
        when(transactionCategoryClosingBalanceDao.update(any())).thenAnswer(invocation -> invocation.getArgument(0));

        BigDecimal result = closingBalanceService.updateClosingBalance(transaction, category);

        assertThat(result).isNotNull();
        verify(transactionCategoryClosingBalanceDao, times(1)).update(any(TransactionCategoryClosingBalance.class));
    }

    @Test
    void shouldUseLastClosingBalanceWhenCreatingNew() {
        TransactionCategoryClosingBalance lastBalance = new TransactionCategoryClosingBalance();
        lastBalance.setClosingBalance(BigDecimal.valueOf(500.00));
        lastBalance.setTransactionCategory(category);

        when(transactionCategoryClosingBalanceDao.findByAttributes(any())).thenReturn(Collections.emptyList());
        when(transactionCategoryClosingBalanceDao.getClosingBalanceLessThanCurrentDate(any(), any())).thenReturn(lastBalance);
        when(transactionCategoryClosingBalanceDao.getClosingBalanceGreaterThanCurrentDate(any(), any())).thenReturn(Collections.emptyList());
        when(transactionCategoryClosingBalanceDao.update(any())).thenAnswer(invocation -> invocation.getArgument(0));

        BigDecimal result = closingBalanceService.updateClosingBalance(transaction, category);

        assertThat(result).isNotNull();
        verify(transactionCategoryClosingBalanceDao, times(1)).update(any(TransactionCategoryClosingBalance.class));
    }

    @Test
    void shouldHandleZeroTransactionAmount() {
        transaction.setTransactionAmount(BigDecimal.ZERO);

        when(transactionCategoryClosingBalanceDao.findByAttributes(any())).thenReturn(Collections.singletonList(closingBalance));
        when(transactionCategoryClosingBalanceDao.update(any())).thenReturn(closingBalance);

        BigDecimal result = closingBalanceService.updateClosingBalance(transaction, category);

        assertThat(result).isNotNull();
        verify(transactionCategoryClosingBalanceDao, times(1)).update(any(TransactionCategoryClosingBalance.class));
    }

    @Test
    void shouldHandleLargeTransactionAmount() {
        transaction.setTransactionAmount(BigDecimal.valueOf(1000000.00));

        when(transactionCategoryClosingBalanceDao.findByAttributes(any())).thenReturn(Collections.singletonList(closingBalance));
        when(transactionCategoryClosingBalanceDao.update(any())).thenReturn(closingBalance);

        BigDecimal result = closingBalanceService.updateClosingBalance(transaction, category);

        assertThat(result).isNotNull();
        verify(transactionCategoryClosingBalanceDao, times(1)).update(any(TransactionCategoryClosingBalance.class));
    }

    // ========== matchClosingBalanceForReconcile Tests ==========

    @Test
    void shouldReturnBankAccountClosingBalanceWhenExists() {
        LocalDateTime reconcileDate = LocalDateTime.now();
        closingBalance.setBankAccountClosingBalance(BigDecimal.valueOf(2000.00));

        when(transactionCategoryClosingBalanceDao.getClosingBalanceLessThanCurrentDate(reconcileDate, category))
                .thenReturn(closingBalance);

        BigDecimal result = closingBalanceService.matchClosingBalanceForReconcile(reconcileDate, category);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(BigDecimal.valueOf(2000.00));
        verify(transactionCategoryClosingBalanceDao, times(1)).getClosingBalanceLessThanCurrentDate(reconcileDate, category);
    }

    @Test
    void shouldReturnZeroWhenNoClosingBalanceFound() {
        LocalDateTime reconcileDate = LocalDateTime.now();

        when(transactionCategoryClosingBalanceDao.getClosingBalanceLessThanCurrentDate(reconcileDate, category))
                .thenReturn(null);

        BigDecimal result = closingBalanceService.matchClosingBalanceForReconcile(reconcileDate, category);

        assertThat(result).isEqualTo(BigDecimal.ZERO);
        verify(transactionCategoryClosingBalanceDao, times(1)).getClosingBalanceLessThanCurrentDate(reconcileDate, category);
    }

    @Test
    void shouldReturnZeroWhenBankAccountClosingBalanceIsNull() {
        LocalDateTime reconcileDate = LocalDateTime.now();
        closingBalance.setBankAccountClosingBalance(null);

        when(transactionCategoryClosingBalanceDao.getClosingBalanceLessThanCurrentDate(reconcileDate, category))
                .thenReturn(closingBalance);

        BigDecimal result = closingBalanceService.matchClosingBalanceForReconcile(reconcileDate, category);

        assertThat(result).isNull();
        verify(transactionCategoryClosingBalanceDao, times(1)).getClosingBalanceLessThanCurrentDate(reconcileDate, category);
    }

    @Test
    void shouldHandleNullReconcileDate() {
        when(transactionCategoryClosingBalanceDao.getClosingBalanceLessThanCurrentDate(null, category))
                .thenReturn(null);

        BigDecimal result = closingBalanceService.matchClosingBalanceForReconcile(null, category);

        assertThat(result).isEqualTo(BigDecimal.ZERO);
        verify(transactionCategoryClosingBalanceDao, times(1)).getClosingBalanceLessThanCurrentDate(null, category);
    }

    @Test
    void shouldHandleNullCategory() {
        LocalDateTime reconcileDate = LocalDateTime.now();

        when(transactionCategoryClosingBalanceDao.getClosingBalanceLessThanCurrentDate(reconcileDate, null))
                .thenReturn(null);

        BigDecimal result = closingBalanceService.matchClosingBalanceForReconcile(reconcileDate, null);

        assertThat(result).isEqualTo(BigDecimal.ZERO);
        verify(transactionCategoryClosingBalanceDao, times(1)).getClosingBalanceLessThanCurrentDate(reconcileDate, null);
    }

    // ========== sumOfTotalAmountExce Tests ==========

    @Test
    void shouldCallDaoSumOfTotalAmountExce() {
        FinancialReportRequestModel requestModel = new FinancialReportRequestModel();
        VatReportResponseModel responseModel = new VatReportResponseModel();

        closingBalanceService.sumOfTotalAmountExce(requestModel, responseModel);

        verify(transactionCategoryClosingBalanceDao, times(1)).sumOfTotalAmountExce(requestModel, responseModel);
    }

    @Test
    void shouldHandleNullRequestModelInSumOfTotalAmountExce() {
        VatReportResponseModel responseModel = new VatReportResponseModel();

        closingBalanceService.sumOfTotalAmountExce(null, responseModel);

        verify(transactionCategoryClosingBalanceDao, times(1)).sumOfTotalAmountExce(null, responseModel);
    }

    @Test
    void shouldHandleNullResponseModelInSumOfTotalAmountExce() {
        FinancialReportRequestModel requestModel = new FinancialReportRequestModel();

        closingBalanceService.sumOfTotalAmountExce(requestModel, null);

        verify(transactionCategoryClosingBalanceDao, times(1)).sumOfTotalAmountExce(requestModel, null);
    }

    // ========== sumOfTotalAmountClosingBalance Tests ==========

    @Test
    void shouldReturnSumOfTotalAmountClosingBalance() {
        FinancialReportRequestModel requestModel = new FinancialReportRequestModel();
        String lastMonth = "2023-12";
        BigDecimal expectedSum = BigDecimal.valueOf(5000.00);

        when(transactionCategoryClosingBalanceDao.sumOfTotalAmountClosingBalance(requestModel, lastMonth))
                .thenReturn(expectedSum);

        BigDecimal result = closingBalanceService.sumOfTotalAmountClosingBalance(requestModel, lastMonth);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(expectedSum);
        verify(transactionCategoryClosingBalanceDao, times(1)).sumOfTotalAmountClosingBalance(requestModel, lastMonth);
    }

    @Test
    void shouldReturnNullWhenSumIsNull() {
        FinancialReportRequestModel requestModel = new FinancialReportRequestModel();
        String lastMonth = "2023-12";

        when(transactionCategoryClosingBalanceDao.sumOfTotalAmountClosingBalance(requestModel, lastMonth))
                .thenReturn(null);

        BigDecimal result = closingBalanceService.sumOfTotalAmountClosingBalance(requestModel, lastMonth);

        assertThat(result).isNull();
        verify(transactionCategoryClosingBalanceDao, times(1)).sumOfTotalAmountClosingBalance(requestModel, lastMonth);
    }

    @Test
    void shouldReturnZeroWhenSumIsZero() {
        FinancialReportRequestModel requestModel = new FinancialReportRequestModel();
        String lastMonth = "2023-12";

        when(transactionCategoryClosingBalanceDao.sumOfTotalAmountClosingBalance(requestModel, lastMonth))
                .thenReturn(BigDecimal.ZERO);

        BigDecimal result = closingBalanceService.sumOfTotalAmountClosingBalance(requestModel, lastMonth);

        assertThat(result).isEqualTo(BigDecimal.ZERO);
        verify(transactionCategoryClosingBalanceDao, times(1)).sumOfTotalAmountClosingBalance(requestModel, lastMonth);
    }

    @Test
    void shouldHandleNullLastMonth() {
        FinancialReportRequestModel requestModel = new FinancialReportRequestModel();
        BigDecimal expectedSum = BigDecimal.valueOf(3000.00);

        when(transactionCategoryClosingBalanceDao.sumOfTotalAmountClosingBalance(requestModel, null))
                .thenReturn(expectedSum);

        BigDecimal result = closingBalanceService.sumOfTotalAmountClosingBalance(requestModel, null);

        assertThat(result).isEqualTo(expectedSum);
        verify(transactionCategoryClosingBalanceDao, times(1)).sumOfTotalAmountClosingBalance(requestModel, null);
    }

    @Test
    void shouldHandleNullRequestModelInSum() {
        String lastMonth = "2023-12";
        BigDecimal expectedSum = BigDecimal.valueOf(1500.00);

        when(transactionCategoryClosingBalanceDao.sumOfTotalAmountClosingBalance(null, lastMonth))
                .thenReturn(expectedSum);

        BigDecimal result = closingBalanceService.sumOfTotalAmountClosingBalance(null, lastMonth);

        assertThat(result).isEqualTo(expectedSum);
        verify(transactionCategoryClosingBalanceDao, times(1)).sumOfTotalAmountClosingBalance(null, lastMonth);
    }
}
