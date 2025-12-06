package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.JournalLineItemDao;
import com.simpleaccounts.entity.Journal;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.entity.VatReportFiling;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simpleaccounts.rest.financialreport.CreditDebitAggregator;
import com.simpleaccounts.rest.financialreport.FinancialReportRequestModel;
import com.simpleaccounts.rest.financialreport.VatReportFilingRequestModel;
import com.simpleaccounts.rest.taxescontroller.TaxesFilterEnum;
import com.simpleaccounts.rest.taxescontroller.TaxesFilterModel;
import java.math.BigDecimal;
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
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class JournalLineItemServiceImplTest {

    @Mock
    private JournalLineItemDao journalLineItemDao;

    @InjectMocks
    private JournalLineItemServiceImpl journalLineItemService;

    private JournalLineItem testJournalLineItem;
    private Journal testJournal;
    private TransactionCategory testTransactionCategory;
    private ReportRequestModel testReportRequestModel;
    private FinancialReportRequestModel testFinancialReportRequestModel;
    private VatReportFilingRequestModel testVatReportFilingRequestModel;
    private VatReportFiling testVatReportFiling;

    @BeforeEach
    void setUp() {
        testTransactionCategory = new TransactionCategory();
        testTransactionCategory.setTransactionCategoryId(1);
        testTransactionCategory.setTransactionCategoryName("Test Category");

        testJournal = new Journal();
        testJournal.setJournalId(1);
        testJournal.setJournalDate(new Date());

        testJournalLineItem = new JournalLineItem();
        testJournalLineItem.setJournalLineItemId(1);
        testJournalLineItem.setJournalId(testJournal);
        testJournalLineItem.setTransactionCategory(testTransactionCategory);
        testJournalLineItem.setCreditAmount(BigDecimal.valueOf(100.00));
        testJournalLineItem.setDebitAmount(null);
        testJournalLineItem.setCurrentBalance(BigDecimal.valueOf(100.00));

        testReportRequestModel = new ReportRequestModel();
        testReportRequestModel.setStartDate(new Date());
        testReportRequestModel.setEndDate(new Date());

        testFinancialReportRequestModel = new FinancialReportRequestModel();
        testFinancialReportRequestModel.setStartDate(new Date());
        testFinancialReportRequestModel.setEndDate(new Date());

        testVatReportFilingRequestModel = new VatReportFilingRequestModel();
        testVatReportFilingRequestModel.setStartDate(new Date());
        testVatReportFilingRequestModel.setEndDate(new Date());

        testVatReportFiling = new VatReportFiling();
        testVatReportFiling.setVatReportFilingId(1);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnJournalLineItemDaoWhenGetDaoCalled() {
        assertThat(journalLineItemService.getDao()).isEqualTo(journalLineItemDao);
    }

    @Test
    void shouldReturnNonNullDao() {
        assertThat(journalLineItemService.getDao()).isNotNull();
    }

    // ========== deleteByJournalId Tests ==========

    @Test
    void shouldDeleteLineItemsWhenValidJournalIdProvided() {
        doNothing().when(journalLineItemDao).deleteByJournalId(1);

        journalLineItemService.deleteByJournalId(1);

        verify(journalLineItemDao, times(1)).deleteByJournalId(1);
    }

    @Test
    void shouldHandleDeleteWithNullJournalId() {
        doNothing().when(journalLineItemDao).deleteByJournalId(null);

        journalLineItemService.deleteByJournalId(null);

        verify(journalLineItemDao, times(1)).deleteByJournalId(null);
    }

    @Test
    void shouldHandleDeleteWithZeroJournalId() {
        doNothing().when(journalLineItemDao).deleteByJournalId(0);

        journalLineItemService.deleteByJournalId(0);

        verify(journalLineItemDao, times(1)).deleteByJournalId(0);
    }

    @Test
    void shouldHandleDeleteWithNegativeJournalId() {
        doNothing().when(journalLineItemDao).deleteByJournalId(-1);

        journalLineItemService.deleteByJournalId(-1);

        verify(journalLineItemDao, times(1)).deleteByJournalId(-1);
    }

    // ========== getList Tests ==========

    @Test
    void shouldReturnListWhenValidReportRequestModelProvided() {
        List<JournalLineItem> expectedList = Arrays.asList(testJournalLineItem);

        when(journalLineItemDao.getList(testReportRequestModel)).thenReturn(expectedList);

        List<JournalLineItem> result = journalLineItemService.getList(testReportRequestModel);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testJournalLineItem);
        verify(journalLineItemDao, times(1)).getList(testReportRequestModel);
    }

    @Test
    void shouldReturnEmptyListWhenNoDataFound() {
        when(journalLineItemDao.getList(testReportRequestModel)).thenReturn(Collections.emptyList());

        List<JournalLineItem> result = journalLineItemService.getList(testReportRequestModel);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(journalLineItemDao, times(1)).getList(testReportRequestModel);
    }

    @Test
    void shouldHandleNullReportRequestModel() {
        when(journalLineItemDao.getList(null)).thenReturn(null);

        List<JournalLineItem> result = journalLineItemService.getList(null);

        assertThat(result).isNull();
        verify(journalLineItemDao, times(1)).getList(null);
    }

    @Test
    void shouldReturnMultipleJournalLineItems() {
        JournalLineItem item2 = new JournalLineItem();
        item2.setJournalLineItemId(2);
        JournalLineItem item3 = new JournalLineItem();
        item3.setJournalLineItemId(3);

        List<JournalLineItem> expectedList = Arrays.asList(testJournalLineItem, item2, item3);

        when(journalLineItemDao.getList(testReportRequestModel)).thenReturn(expectedList);

        List<JournalLineItem> result = journalLineItemService.getList(testReportRequestModel);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        verify(journalLineItemDao, times(1)).getList(testReportRequestModel);
    }

    // ========== updateCurrentBalance Tests ==========

    @Test
    void shouldUpdateBalanceWhenCreditAmountExists() {
        List<JournalLineItem> items = new ArrayList<>();
        items.add(testJournalLineItem);

        when(journalLineItemDao.getListByTransactionCategory(testTransactionCategory)).thenReturn(items);

        BigDecimal result = journalLineItemService.updateCurrentBalance(testTransactionCategory, BigDecimal.valueOf(1000.00));

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(BigDecimal.valueOf(1100.00));
        assertThat(testJournalLineItem.getCurrentBalance()).isEqualTo(BigDecimal.valueOf(1100.00));
        verify(journalLineItemDao, times(1)).getListByTransactionCategory(testTransactionCategory);
    }

    @Test
    void shouldUpdateBalanceWhenDebitAmountExists() {
        testJournalLineItem.setCreditAmount(null);
        testJournalLineItem.setDebitAmount(BigDecimal.valueOf(50.00));

        List<JournalLineItem> items = new ArrayList<>();
        items.add(testJournalLineItem);

        when(journalLineItemDao.getListByTransactionCategory(testTransactionCategory)).thenReturn(items);

        BigDecimal result = journalLineItemService.updateCurrentBalance(testTransactionCategory, BigDecimal.valueOf(1000.00));

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(BigDecimal.valueOf(950.00));
        assertThat(testJournalLineItem.getCurrentBalance()).isEqualTo(BigDecimal.valueOf(950.00));
        verify(journalLineItemDao, times(1)).getListByTransactionCategory(testTransactionCategory);
    }

    @Test
    void shouldHandleEmptyItemList() {
        when(journalLineItemDao.getListByTransactionCategory(testTransactionCategory)).thenReturn(Collections.emptyList());

        BigDecimal result = journalLineItemService.updateCurrentBalance(testTransactionCategory, BigDecimal.valueOf(1000.00));

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(BigDecimal.valueOf(1000.00));
        verify(journalLineItemDao, times(1)).getListByTransactionCategory(testTransactionCategory);
    }

    @Test
    void shouldHandleMultipleItems() {
        JournalLineItem item2 = new JournalLineItem();
        item2.setJournalLineItemId(2);
        item2.setCreditAmount(BigDecimal.valueOf(200.00));
        item2.setDebitAmount(null);

        JournalLineItem item3 = new JournalLineItem();
        item3.setJournalLineItemId(3);
        item3.setCreditAmount(null);
        item3.setDebitAmount(BigDecimal.valueOf(150.00));

        List<JournalLineItem> items = Arrays.asList(testJournalLineItem, item2, item3);

        when(journalLineItemDao.getListByTransactionCategory(testTransactionCategory)).thenReturn(items);

        BigDecimal result = journalLineItemService.updateCurrentBalance(testTransactionCategory, BigDecimal.valueOf(1000.00));

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(BigDecimal.valueOf(1150.00));
        verify(journalLineItemDao, times(1)).getListByTransactionCategory(testTransactionCategory);
    }

    @Test
    void shouldHandleZeroBalance() {
        List<JournalLineItem> items = new ArrayList<>();
        items.add(testJournalLineItem);

        when(journalLineItemDao.getListByTransactionCategory(testTransactionCategory)).thenReturn(items);

        BigDecimal result = journalLineItemService.updateCurrentBalance(testTransactionCategory, BigDecimal.ZERO);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(BigDecimal.valueOf(100.00));
        verify(journalLineItemDao, times(1)).getListByTransactionCategory(testTransactionCategory);
    }

    @Test
    void shouldHandleNegativeBalance() {
        testJournalLineItem.setCreditAmount(null);
        testJournalLineItem.setDebitAmount(BigDecimal.valueOf(50.00));

        List<JournalLineItem> items = new ArrayList<>();
        items.add(testJournalLineItem);

        when(journalLineItemDao.getListByTransactionCategory(testTransactionCategory)).thenReturn(items);

        BigDecimal result = journalLineItemService.updateCurrentBalance(testTransactionCategory, BigDecimal.valueOf(-100.00));

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(BigDecimal.valueOf(-150.00));
        verify(journalLineItemDao, times(1)).getListByTransactionCategory(testTransactionCategory);
    }

    // ========== getAggregateTransactionCategoryMap Tests ==========

    @Test
    void shouldReturnAggregateMapWhenDataExists() {
        Map<Integer, CreditDebitAggregator> expectedMap = new HashMap<>();
        CreditDebitAggregator aggregator = new CreditDebitAggregator();
        aggregator.setCreditAmount(BigDecimal.valueOf(1000.00));
        aggregator.setDebitAmount(BigDecimal.valueOf(500.00));
        expectedMap.put(1, aggregator);

        when(journalLineItemDao.getAggregateTransactionCategoryMap(testFinancialReportRequestModel, "INCOME"))
                .thenReturn(expectedMap);

        Map<Integer, CreditDebitAggregator> result = journalLineItemService
                .getAggregateTransactionCategoryMap(testFinancialReportRequestModel, "INCOME");

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(1).getCreditAmount()).isEqualTo(BigDecimal.valueOf(1000.00));
        verify(journalLineItemDao, times(1))
                .getAggregateTransactionCategoryMap(testFinancialReportRequestModel, "INCOME");
    }

    @Test
    void shouldReturnEmptyMapWhenNoData() {
        when(journalLineItemDao.getAggregateTransactionCategoryMap(testFinancialReportRequestModel, "EXPENSE"))
                .thenReturn(Collections.emptyMap());

        Map<Integer, CreditDebitAggregator> result = journalLineItemService
                .getAggregateTransactionCategoryMap(testFinancialReportRequestModel, "EXPENSE");

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(journalLineItemDao, times(1))
                .getAggregateTransactionCategoryMap(testFinancialReportRequestModel, "EXPENSE");
    }

    @Test
    void shouldHandleNullReportType() {
        when(journalLineItemDao.getAggregateTransactionCategoryMap(testFinancialReportRequestModel, null))
                .thenReturn(Collections.emptyMap());

        Map<Integer, CreditDebitAggregator> result = journalLineItemService
                .getAggregateTransactionCategoryMap(testFinancialReportRequestModel, null);

        assertThat(result).isNotNull();
        verify(journalLineItemDao, times(1))
                .getAggregateTransactionCategoryMap(testFinancialReportRequestModel, null);
    }

    // ========== getVatTransactionList Tests ==========

    @Test
    void shouldReturnVatTransactionListWhenDataExists() {
        Map<TaxesFilterEnum, Object> filterMap = new HashMap<>();
        TaxesFilterModel paginationModel = new TaxesFilterModel();
        List<TransactionCategory> categoryList = Arrays.asList(testTransactionCategory);
        PaginationResponseModel responseModel = new PaginationResponseModel();
        responseModel.setTotalElements(1L);

        when(journalLineItemDao.getVatTransactionList(filterMap, paginationModel, categoryList))
                .thenReturn(responseModel);

        PaginationResponseModel result = journalLineItemService
                .getVatTransactionList(filterMap, paginationModel, categoryList);

        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1L);
        verify(journalLineItemDao, times(1)).getVatTransactionList(filterMap, paginationModel, categoryList);
    }

    @Test
    void shouldHandleEmptyFilterMap() {
        Map<TaxesFilterEnum, Object> filterMap = new HashMap<>();
        TaxesFilterModel paginationModel = new TaxesFilterModel();
        List<TransactionCategory> categoryList = Collections.emptyList();
        PaginationResponseModel responseModel = new PaginationResponseModel();

        when(journalLineItemDao.getVatTransactionList(filterMap, paginationModel, categoryList))
                .thenReturn(responseModel);

        PaginationResponseModel result = journalLineItemService
                .getVatTransactionList(filterMap, paginationModel, categoryList);

        assertThat(result).isNotNull();
        verify(journalLineItemDao, times(1)).getVatTransactionList(filterMap, paginationModel, categoryList);
    }

    // ========== getTaxReport Tests ==========

    @Test
    void shouldReturnTaxReportWhenValidDatesProvided() {
        Date startDate = new Date();
        Date endDate = new Date();
        Map<Integer, CreditDebitAggregator> expectedMap = new HashMap<>();

        when(journalLineItemDao.getTaxReport(startDate, endDate)).thenReturn(expectedMap);

        Map<Integer, CreditDebitAggregator> result = journalLineItemService.getTaxReport(startDate, endDate);

        assertThat(result).isNotNull();
        verify(journalLineItemDao, times(1)).getTaxReport(startDate, endDate);
    }

    @Test
    void shouldHandleNullStartDate() {
        Date endDate = new Date();
        when(journalLineItemDao.getTaxReport(null, endDate)).thenReturn(Collections.emptyMap());

        Map<Integer, CreditDebitAggregator> result = journalLineItemService.getTaxReport(null, endDate);

        assertThat(result).isNotNull();
        verify(journalLineItemDao, times(1)).getTaxReport(null, endDate);
    }

    @Test
    void shouldHandleNullEndDate() {
        Date startDate = new Date();
        when(journalLineItemDao.getTaxReport(startDate, null)).thenReturn(Collections.emptyMap());

        Map<Integer, CreditDebitAggregator> result = journalLineItemService.getTaxReport(startDate, null);

        assertThat(result).isNotNull();
        verify(journalLineItemDao, times(1)).getTaxReport(startDate, null);
    }

    // ========== totalInputVatAmountAndOutputVatAmount Tests ==========

    @Test
    void shouldReturnVatAmountsWhenDataExists() {
        List<Object[]> expectedList = new ArrayList<>();
        Object[] row = new Object[]{BigDecimal.valueOf(100.00), BigDecimal.valueOf(200.00)};
        expectedList.add(row);

        when(journalLineItemDao.totalInputVatAmountAndOutputVatAmount(testVatReportFilingRequestModel))
                .thenReturn(expectedList);

        List<Object[]> result = journalLineItemService
                .totalInputVatAmountAndOutputVatAmount(testVatReportFilingRequestModel);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(journalLineItemDao, times(1)).totalInputVatAmountAndOutputVatAmount(testVatReportFilingRequestModel);
    }

    @Test
    void shouldReturnEmptyListWhenNoVatData() {
        when(journalLineItemDao.totalInputVatAmountAndOutputVatAmount(testVatReportFilingRequestModel))
                .thenReturn(Collections.emptyList());

        List<Object[]> result = journalLineItemService
                .totalInputVatAmountAndOutputVatAmount(testVatReportFilingRequestModel);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(journalLineItemDao, times(1)).totalInputVatAmountAndOutputVatAmount(testVatReportFilingRequestModel);
    }

    // ========== totalInputVatAmount Tests ==========

    @Test
    void shouldReturnInputVatAmountWhenDataExists() {
        BigDecimal expectedAmount = BigDecimal.valueOf(500.00);

        when(journalLineItemDao.totalInputVatAmount(testVatReportFiling, testVatReportFilingRequestModel, 1))
                .thenReturn(expectedAmount);

        BigDecimal result = journalLineItemService
                .totalInputVatAmount(testVatReportFiling, testVatReportFilingRequestModel, 1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(expectedAmount);
        verify(journalLineItemDao, times(1))
                .totalInputVatAmount(testVatReportFiling, testVatReportFilingRequestModel, 1);
    }

    @Test
    void shouldReturnZeroInputVatWhenNoData() {
        when(journalLineItemDao.totalInputVatAmount(testVatReportFiling, testVatReportFilingRequestModel, 1))
                .thenReturn(BigDecimal.ZERO);

        BigDecimal result = journalLineItemService
                .totalInputVatAmount(testVatReportFiling, testVatReportFilingRequestModel, 1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(BigDecimal.ZERO);
        verify(journalLineItemDao, times(1))
                .totalInputVatAmount(testVatReportFiling, testVatReportFilingRequestModel, 1);
    }

    // ========== totalOutputVatAmount Tests ==========

    @Test
    void shouldReturnOutputVatAmountWhenDataExists() {
        BigDecimal expectedAmount = BigDecimal.valueOf(750.00);

        when(journalLineItemDao.totalOutputVatAmount(testVatReportFiling, testVatReportFilingRequestModel, 1))
                .thenReturn(expectedAmount);

        BigDecimal result = journalLineItemService
                .totalOutputVatAmount(testVatReportFiling, testVatReportFilingRequestModel, 1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(expectedAmount);
        verify(journalLineItemDao, times(1))
                .totalOutputVatAmount(testVatReportFiling, testVatReportFilingRequestModel, 1);
    }

    @Test
    void shouldReturnZeroOutputVatWhenNoData() {
        when(journalLineItemDao.totalOutputVatAmount(testVatReportFiling, testVatReportFilingRequestModel, 1))
                .thenReturn(BigDecimal.ZERO);

        BigDecimal result = journalLineItemService
                .totalOutputVatAmount(testVatReportFiling, testVatReportFilingRequestModel, 1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(BigDecimal.ZERO);
        verify(journalLineItemDao, times(1))
                .totalOutputVatAmount(testVatReportFiling, testVatReportFilingRequestModel, 1);
    }

    // ========== getIdsAndTypeInTotalInputVat Tests ==========

    @Test
    void shouldReturnInputVatIdsWhenDataExists() {
        List<Object> expectedList = Arrays.asList(1, "INVOICE", 2, "BILL");

        when(journalLineItemDao.getIdsAndTypeInTotalInputVat(testVatReportFiling, testVatReportFilingRequestModel, 1))
                .thenReturn(expectedList);

        List<Object> result = journalLineItemService
                .getIdsAndTypeInTotalInputVat(testVatReportFiling, testVatReportFilingRequestModel, 1);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(4);
        verify(journalLineItemDao, times(1))
                .getIdsAndTypeInTotalInputVat(testVatReportFiling, testVatReportFilingRequestModel, 1);
    }

    @Test
    void shouldReturnEmptyListWhenNoInputVatIds() {
        when(journalLineItemDao.getIdsAndTypeInTotalInputVat(testVatReportFiling, testVatReportFilingRequestModel, 1))
                .thenReturn(Collections.emptyList());

        List<Object> result = journalLineItemService
                .getIdsAndTypeInTotalInputVat(testVatReportFiling, testVatReportFilingRequestModel, 1);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(journalLineItemDao, times(1))
                .getIdsAndTypeInTotalInputVat(testVatReportFiling, testVatReportFilingRequestModel, 1);
    }

    // ========== getIdsAndTypeInTotalOutputVat Tests ==========

    @Test
    void shouldReturnOutputVatIdsWhenDataExists() {
        List<Object> expectedList = Arrays.asList(3, "INVOICE", 4, "CREDIT_NOTE");

        when(journalLineItemDao.getIdsAndTypeInTotalOutputVat(testVatReportFiling, testVatReportFilingRequestModel, 1))
                .thenReturn(expectedList);

        List<Object> result = journalLineItemService
                .getIdsAndTypeInTotalOutputVat(testVatReportFiling, testVatReportFilingRequestModel, 1);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(4);
        verify(journalLineItemDao, times(1))
                .getIdsAndTypeInTotalOutputVat(testVatReportFiling, testVatReportFilingRequestModel, 1);
    }

    @Test
    void shouldReturnEmptyListWhenNoOutputVatIds() {
        when(journalLineItemDao.getIdsAndTypeInTotalOutputVat(testVatReportFiling, testVatReportFilingRequestModel, 1))
                .thenReturn(Collections.emptyList());

        List<Object> result = journalLineItemService
                .getIdsAndTypeInTotalOutputVat(testVatReportFiling, testVatReportFilingRequestModel, 1);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(journalLineItemDao, times(1))
                .getIdsAndTypeInTotalOutputVat(testVatReportFiling, testVatReportFilingRequestModel, 1);
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldPersistNewJournalLineItem() {
        journalLineItemService.persist(testJournalLineItem);

        verify(journalLineItemDao, times(1)).persist(testJournalLineItem);
    }

    @Test
    void shouldUpdateExistingJournalLineItem() {
        when(journalLineItemDao.update(testJournalLineItem)).thenReturn(testJournalLineItem);

        JournalLineItem result = journalLineItemService.update(testJournalLineItem);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testJournalLineItem);
        verify(journalLineItemDao, times(1)).update(testJournalLineItem);
    }

    @Test
    void shouldDeleteJournalLineItem() {
        journalLineItemService.delete(testJournalLineItem);

        verify(journalLineItemDao, times(1)).delete(testJournalLineItem);
    }

    @Test
    void shouldFindJournalLineItemByPrimaryKey() {
        when(journalLineItemDao.findByPK(1)).thenReturn(testJournalLineItem);

        JournalLineItem result = journalLineItemService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testJournalLineItem);
        verify(journalLineItemDao, times(1)).findByPK(1);
    }
}
