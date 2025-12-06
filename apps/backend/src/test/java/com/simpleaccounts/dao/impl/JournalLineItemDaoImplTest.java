package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.DbFilter;
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
import com.simpleaccounts.utils.DateFormatUtil;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.persistence.EntityManager;
import javax.persistence.ParameterMode;
import javax.persistence.Query;
import javax.persistence.StoredProcedureQuery;
import javax.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("JournalLineItemDaoImpl Unit Tests")
class JournalLineItemDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private DateFormatUtil dateUtil;

    @Mock
    private DatatableSortingFilterConstant datatableUtil;

    @Mock
    private Query query;

    @Mock
    private TypedQuery<JournalLineItem> typedQuery;

    @Mock
    private StoredProcedureQuery storedProcedureQuery;

    @InjectMocks
    private JournalLineItemDaoImpl journalLineItemDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(journalLineItemDao, "entityManager", entityManager);
    }

    @Test
    @DisplayName("Should delete journal line items by journal ID successfully")
    void deleteByJournalIdDeletesItemsSuccessfully() {
        // Arrange
        Integer journalId = 1;

        when(entityManager.createQuery("DELETE FROM JournalLineItem e WHERE e.journal.id = :journalId "))
            .thenReturn(query);
        when(query.setParameter("journalId", journalId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(5);

        // Act
        journalLineItemDao.deleteByJournalId(journalId);

        // Assert
        verify(entityManager).createQuery("DELETE FROM JournalLineItem e WHERE e.journal.id = :journalId ");
        verify(query).setParameter("journalId", journalId);
        verify(query).executeUpdate();
    }

    @Test
    @DisplayName("Should set correct journal ID parameter for delete")
    void deleteByJournalIdSetsCorrectParameter() {
        // Arrange
        Integer journalId = 42;

        when(entityManager.createQuery("DELETE FROM JournalLineItem e WHERE e.journal.id = :journalId "))
            .thenReturn(query);
        when(query.setParameter("journalId", journalId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(0);

        // Act
        journalLineItemDao.deleteByJournalId(journalId);

        // Assert
        verify(query).setParameter("journalId", 42);
    }

    @Test
    @DisplayName("Should handle delete when no items exist")
    void deleteByJournalIdHandlesNoItems() {
        // Arrange
        Integer journalId = 1;

        when(entityManager.createQuery("DELETE FROM JournalLineItem e WHERE e.journal.id = :journalId "))
            .thenReturn(query);
        when(query.setParameter("journalId", journalId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(0);

        // Act
        journalLineItemDao.deleteByJournalId(journalId);

        // Assert
        verify(query).executeUpdate();
    }

    @Test
    @DisplayName("Should return list when report request has valid dates")
    void getListReturnsListWhenValidDates() {
        // Arrange
        ReportRequestModel reportRequestModel = new ReportRequestModel();
        reportRequestModel.setStartDate("01/01/2024");
        reportRequestModel.setEndDate("31/12/2024");

        List<JournalLineItem> expectedList = createJournalLineItemList(5);

        when(entityManager.createQuery(anyString(), eq(JournalLineItem.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq(CommonColumnConstants.START_DATE), any(LocalDate.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq(CommonColumnConstants.END_DATE), any(LocalDate.class)))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedList);

        // Act
        List<JournalLineItem> result = journalLineItemDao.getList(reportRequestModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
    }

    @Test
    @DisplayName("Should return null when getList result is empty")
    void getListReturnsNullWhenResultEmpty() {
        // Arrange
        ReportRequestModel reportRequestModel = new ReportRequestModel();
        reportRequestModel.setStartDate("01/01/2024");
        reportRequestModel.setEndDate("31/12/2024");

        when(entityManager.createQuery(anyString(), eq(JournalLineItem.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq(CommonColumnConstants.START_DATE), any(LocalDate.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq(CommonColumnConstants.END_DATE), any(LocalDate.class)))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        List<JournalLineItem> result = journalLineItemDao.getList(reportRequestModel);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return null when getList result is null")
    void getListReturnsNullWhenResultNull() {
        // Arrange
        ReportRequestModel reportRequestModel = new ReportRequestModel();
        reportRequestModel.setStartDate("01/01/2024");
        reportRequestModel.setEndDate("31/12/2024");

        when(entityManager.createQuery(anyString(), eq(JournalLineItem.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq(CommonColumnConstants.START_DATE), any(LocalDate.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq(CommonColumnConstants.END_DATE), any(LocalDate.class)))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(null);

        // Act
        List<JournalLineItem> result = journalLineItemDao.getList(reportRequestModel);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should include chart of account ID in query when provided")
    void getListIncludesChartOfAccountIdWhenProvided() {
        // Arrange
        ReportRequestModel reportRequestModel = new ReportRequestModel();
        reportRequestModel.setStartDate("01/01/2024");
        reportRequestModel.setEndDate("31/12/2024");
        reportRequestModel.setChartOfAccountId(10);

        when(entityManager.createQuery(anyString(), eq(JournalLineItem.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq(CommonColumnConstants.START_DATE), any(LocalDate.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq(CommonColumnConstants.END_DATE), any(LocalDate.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq("transactionCategoryId"), anyInt()))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(createJournalLineItemList(2));

        // Act
        journalLineItemDao.getList(reportRequestModel);

        // Assert
        verify(typedQuery).setParameter("transactionCategoryId", 10);
    }

    @Test
    @DisplayName("Should return list by transaction category when results exist")
    void getListByTransactionCategoryReturnsListWhenResultsExist() {
        // Arrange
        TransactionCategory transactionCategory = new TransactionCategory();
        transactionCategory.setTransactionCategoryId(1);
        List<JournalLineItem> expectedList = createJournalLineItemList(3);

        when(entityManager.createNamedQuery("getListByTransactionCategory"))
            .thenReturn(query);
        when(query.setParameter("transactionCategory", transactionCategory))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(expectedList);

        // Act
        List<JournalLineItem> result = journalLineItemDao.getListByTransactionCategory(transactionCategory);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).isEqualTo(expectedList);
    }

    @Test
    @DisplayName("Should use correct named query for transaction category")
    void getListByTransactionCategoryUsesCorrectNamedQuery() {
        // Arrange
        TransactionCategory transactionCategory = new TransactionCategory();

        when(entityManager.createNamedQuery("getListByTransactionCategory"))
            .thenReturn(query);
        when(query.setParameter("transactionCategory", transactionCategory))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        journalLineItemDao.getListByTransactionCategory(transactionCategory);

        // Assert
        verify(entityManager).createNamedQuery("getListByTransactionCategory");
    }

    @Test
    @DisplayName("Should return pagination response for VAT transaction list")
    void getVatTransactionListReturnsPaginationResponse() {
        // Arrange
        Map<TaxesFilterEnum, Object> filterMap = new HashMap<>();
        TaxesFilterModel paginationModel = new TaxesFilterModel();
        paginationModel.setSortingCol("test");
        List<TransactionCategory> transactionCategoryList = new ArrayList<>();

        when(datatableUtil.getColName(anyString(), anyString()))
            .thenReturn("mappedColumn");

        // Act
        PaginationResponseModel result = journalLineItemDao.getVatTransactionList(
            filterMap, paginationModel, transactionCategoryList);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should map sorting column correctly for VAT transaction list")
    void getVatTransactionListMapsSortingColumn() {
        // Arrange
        Map<TaxesFilterEnum, Object> filterMap = new HashMap<>();
        TaxesFilterModel paginationModel = new TaxesFilterModel();
        paginationModel.setSortingCol("originalColumn");
        List<TransactionCategory> transactionCategoryList = new ArrayList<>();

        when(datatableUtil.getColName("originalColumn", DatatableSortingFilterConstant.JOURNAL_LINE_ITEM))
            .thenReturn("mappedColumn");

        // Act
        journalLineItemDao.getVatTransactionList(filterMap, paginationModel, transactionCategoryList);

        // Assert
        verify(datatableUtil).getColName("originalColumn", DatatableSortingFilterConstant.JOURNAL_LINE_ITEM);
        assertThat(paginationModel.getSortingCol()).isEqualTo("mappedColumn");
    }

    @Test
    @DisplayName("Should return empty map when aggregate transaction map has no results")
    void getAggregateTransactionCategoryMapReturnsEmptyMapWhenNoResults() {
        // Arrange
        FinancialReportRequestModel requestModel = new FinancialReportRequestModel();
        requestModel.setStartDate("01/01/2024");
        requestModel.setEndDate("31/12/2024");

        when(dateUtil.getDateStrAsLocalDateTime(anyString(), eq(CommonColumnConstants.DD_MM_YYYY)))
            .thenReturn(LocalDateTime.now());
        when(entityManager.createStoredProcedureQuery(anyString()))
            .thenReturn(storedProcedureQuery);
        when(storedProcedureQuery.registerStoredProcedureParameter(anyString(), any(), any()))
            .thenReturn(storedProcedureQuery);
        when(storedProcedureQuery.setParameter(anyString(), any()))
            .thenReturn(storedProcedureQuery);
        when(storedProcedureQuery.execute())
            .thenReturn(true);
        when(storedProcedureQuery.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        Map<Integer, CreditDebitAggregator> result = journalLineItemDao.getAggregateTransactionCategoryMap(
            requestModel, "ProfitAndLoss");

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should call profit and loss stored procedure for ProfitAndLoss report type")
    void getAggregateTransactionCategoryMapCallsProfitAndLossStoredProcedure() {
        // Arrange
        FinancialReportRequestModel requestModel = new FinancialReportRequestModel();
        requestModel.setStartDate("01/01/2024");
        requestModel.setEndDate("31/12/2024");

        when(dateUtil.getDateStrAsLocalDateTime(anyString(), eq(CommonColumnConstants.DD_MM_YYYY)))
            .thenReturn(LocalDateTime.now());
        when(entityManager.createStoredProcedureQuery("profitAndLossStoredProcedure"))
            .thenReturn(storedProcedureQuery);
        when(storedProcedureQuery.registerStoredProcedureParameter(anyString(), any(), any()))
            .thenReturn(storedProcedureQuery);
        when(storedProcedureQuery.setParameter(anyString(), any()))
            .thenReturn(storedProcedureQuery);
        when(storedProcedureQuery.execute())
            .thenReturn(true);
        when(storedProcedureQuery.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        journalLineItemDao.getAggregateTransactionCategoryMap(requestModel, "ProfitAndLoss");

        // Assert
        verify(entityManager).createStoredProcedureQuery("profitAndLossStoredProcedure");
    }

    @Test
    @DisplayName("Should call balance sheet stored procedure for BalanceSheet report type")
    void getAggregateTransactionCategoryMapCallsBalanceSheetStoredProcedure() {
        // Arrange
        FinancialReportRequestModel requestModel = new FinancialReportRequestModel();
        requestModel.setStartDate("01/01/2024");
        requestModel.setEndDate("31/12/2024");

        when(dateUtil.getDateStrAsLocalDateTime(anyString(), eq(CommonColumnConstants.DD_MM_YYYY)))
            .thenReturn(LocalDateTime.now());
        when(entityManager.createStoredProcedureQuery("balanceSheetStoredProcedure"))
            .thenReturn(storedProcedureQuery);
        when(storedProcedureQuery.registerStoredProcedureParameter(anyString(), any(), any()))
            .thenReturn(storedProcedureQuery);
        when(storedProcedureQuery.setParameter(anyString(), any()))
            .thenReturn(storedProcedureQuery);
        when(storedProcedureQuery.execute())
            .thenReturn(true);
        when(storedProcedureQuery.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        journalLineItemDao.getAggregateTransactionCategoryMap(requestModel, "BalanceSheet");

        // Assert
        verify(entityManager).createStoredProcedureQuery("balanceSheetStoredProcedure");
    }

    @Test
    @DisplayName("Should call trial balance stored procedure for TrialBalance report type")
    void getAggregateTransactionCategoryMapCallsTrialBalanceStoredProcedure() {
        // Arrange
        FinancialReportRequestModel requestModel = new FinancialReportRequestModel();
        requestModel.setStartDate("01/01/2024");
        requestModel.setEndDate("31/12/2024");

        when(dateUtil.getDateStrAsLocalDateTime(anyString(), eq(CommonColumnConstants.DD_MM_YYYY)))
            .thenReturn(LocalDateTime.now());
        when(entityManager.createStoredProcedureQuery("trialBalanceStoredProcedure"))
            .thenReturn(storedProcedureQuery);
        when(storedProcedureQuery.registerStoredProcedureParameter(anyString(), any(), any()))
            .thenReturn(storedProcedureQuery);
        when(storedProcedureQuery.setParameter(anyString(), any()))
            .thenReturn(storedProcedureQuery);
        when(storedProcedureQuery.execute())
            .thenReturn(true);
        when(storedProcedureQuery.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        journalLineItemDao.getAggregateTransactionCategoryMap(requestModel, "TrialBalance");

        // Assert
        verify(entityManager).createStoredProcedureQuery("trialBalanceStoredProcedure");
    }

    @Test
    @DisplayName("Should return tax report map when results exist")
    void getTaxReportReturnsMapWhenResultsExist() {
        // Arrange
        Date startDate = new Date();
        Date endDate = new Date();
        LocalDateTime localDateTime = LocalDateTime.now();

        when(dateUtil.getDateStrAsLocalDateTime(any(Date.class), eq(CommonColumnConstants.DD_MM_YYYY)))
            .thenReturn(localDateTime);
        when(entityManager.createStoredProcedureQuery("taxesStoredProcedure"))
            .thenReturn(storedProcedureQuery);
        when(storedProcedureQuery.registerStoredProcedureParameter(anyString(), any(), any()))
            .thenReturn(storedProcedureQuery);
        when(storedProcedureQuery.setParameter(anyString(), any()))
            .thenReturn(storedProcedureQuery);
        when(storedProcedureQuery.execute())
            .thenReturn(true);

        List<Object[]> resultList = new ArrayList<>();
        Object[] row = new Object[]{"Input VAT", new BigDecimal("1000"), new BigDecimal("500"), "INPUTVAT"};
        resultList.add(row);

        when(storedProcedureQuery.getResultList())
            .thenReturn(resultList);

        // Act
        Map<Integer, CreditDebitAggregator> result = journalLineItemDao.getTaxReport(startDate, endDate);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isNotNull();
        assertThat(result.get(0).getCreditAmount()).isEqualTo(1000.0);
        assertThat(result.get(0).getDebitAmount()).isEqualTo(500.0);
    }

    @Test
    @DisplayName("Should call taxes stored procedure for tax report")
    void getTaxReportCallsTaxesStoredProcedure() {
        // Arrange
        Date startDate = new Date();
        Date endDate = new Date();

        when(dateUtil.getDateStrAsLocalDateTime(any(Date.class), eq(CommonColumnConstants.DD_MM_YYYY)))
            .thenReturn(LocalDateTime.now());
        when(entityManager.createStoredProcedureQuery("taxesStoredProcedure"))
            .thenReturn(storedProcedureQuery);
        when(storedProcedureQuery.registerStoredProcedureParameter(anyString(), any(), any()))
            .thenReturn(storedProcedureQuery);
        when(storedProcedureQuery.setParameter(anyString(), any()))
            .thenReturn(storedProcedureQuery);
        when(storedProcedureQuery.execute())
            .thenReturn(true);
        when(storedProcedureQuery.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        journalLineItemDao.getTaxReport(startDate, endDate);

        // Assert
        verify(entityManager).createStoredProcedureQuery("taxesStoredProcedure");
    }

    @Test
    @DisplayName("Should return list for total input and output VAT amounts")
    void totalInputVatAmountAndOutputVatAmountReturnsList() {
        // Arrange
        VatReportFilingRequestModel requestModel = new VatReportFilingRequestModel();
        requestModel.setStartDate("01/01/2024");
        requestModel.setEndDate("31/12/2024");

        LocalDateTime localDateTime = LocalDateTime.now();
        List<Object[]> expectedList = new ArrayList<>();

        when(dateUtil.getDateStrAsLocalDateTime(anyString(), eq(CommonColumnConstants.DD_MM_YYYY)))
            .thenReturn(localDateTime);
        when(entityManager.createNamedQuery("totalInputVatAmountAndOutputVatAmount"))
            .thenReturn(query);
        when(query.setParameter("startDate", localDateTime))
            .thenReturn(query);
        when(query.setParameter("endDate", localDateTime))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(expectedList);

        // Act
        List<Object[]> result = journalLineItemDao.totalInputVatAmountAndOutputVatAmount(requestModel);

        // Assert
        assertThat(result).isNotNull();
        verify(entityManager).createNamedQuery("totalInputVatAmountAndOutputVatAmount");
    }

    @Test
    @DisplayName("Should calculate total input VAT amount correctly")
    void totalInputVatAmountCalculatesCorrectly() {
        // Arrange
        VatReportFiling vatReportFiling = new VatReportFiling();
        vatReportFiling.setStartDate(LocalDate.now());
        vatReportFiling.setEndDate(LocalDate.now());
        VatReportFilingRequestModel requestModel = new VatReportFilingRequestModel();
        Integer transactionCategoryId = 1;

        BigDecimal invoiceAmount = new BigDecimal("1000");
        BigDecimal expenseAmount = new BigDecimal("500");
        BigDecimal debitNoteAmount = new BigDecimal("200");

        when(entityManager.createNamedQuery("totalInputVatAmountValue"))
            .thenReturn(query);
        when(entityManager.createNamedQuery("totalInputVatAmountValueOfExpense"))
            .thenReturn(query);
        when(entityManager.createNamedQuery("totalInputVatAmountValueDebitNote"))
            .thenReturn(query);
        when(query.setParameter(eq("startDate"), any()))
            .thenReturn(query);
        when(query.setParameter(eq("endDate"), any()))
            .thenReturn(query);
        when(query.setParameter("transactionCategoryId", transactionCategoryId))
            .thenReturn(query);
        when(query.getSingleResult())
            .thenReturn(invoiceAmount)
            .thenReturn(expenseAmount)
            .thenReturn(debitNoteAmount);

        // Act
        BigDecimal result = journalLineItemDao.totalInputVatAmount(vatReportFiling, requestModel, transactionCategoryId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(new BigDecimal("1700"));
    }

    @Test
    @DisplayName("Should handle null amounts in total input VAT calculation")
    void totalInputVatAmountHandlesNullAmounts() {
        // Arrange
        VatReportFiling vatReportFiling = new VatReportFiling();
        vatReportFiling.setStartDate(LocalDate.now());
        vatReportFiling.setEndDate(LocalDate.now());
        VatReportFilingRequestModel requestModel = new VatReportFilingRequestModel();
        Integer transactionCategoryId = 1;

        when(entityManager.createNamedQuery("totalInputVatAmountValue"))
            .thenReturn(query);
        when(entityManager.createNamedQuery("totalInputVatAmountValueOfExpense"))
            .thenReturn(query);
        when(entityManager.createNamedQuery("totalInputVatAmountValueDebitNote"))
            .thenReturn(query);
        when(query.setParameter(eq("startDate"), any()))
            .thenReturn(query);
        when(query.setParameter(eq("endDate"), any()))
            .thenReturn(query);
        when(query.setParameter("transactionCategoryId", transactionCategoryId))
            .thenReturn(query);
        when(query.getSingleResult())
            .thenReturn(null)
            .thenReturn(null)
            .thenReturn(null);

        // Act
        BigDecimal result = journalLineItemDao.totalInputVatAmount(vatReportFiling, requestModel, transactionCategoryId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should calculate total output VAT amount correctly")
    void totalOutputVatAmountCalculatesCorrectly() {
        // Arrange
        VatReportFiling vatReportFiling = new VatReportFiling();
        vatReportFiling.setStartDate(LocalDate.now());
        vatReportFiling.setEndDate(LocalDate.now());
        VatReportFilingRequestModel requestModel = new VatReportFilingRequestModel();
        Integer transactionCategoryId = 1;

        BigDecimal outputAmount = new BigDecimal("2000");

        when(entityManager.createNamedQuery("totalOutputVatAmountValue"))
            .thenReturn(query);
        when(query.setParameter(eq("startDate"), any()))
            .thenReturn(query);
        when(query.setParameter(eq("endDate"), any()))
            .thenReturn(query);
        when(query.setParameter("transactionCategoryId", transactionCategoryId))
            .thenReturn(query);
        when(query.getSingleResult())
            .thenReturn(outputAmount);

        // Act
        BigDecimal result = journalLineItemDao.totalOutputVatAmount(vatReportFiling, requestModel, transactionCategoryId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(new BigDecimal("2000"));
    }

    @Test
    @DisplayName("Should return IDs and types for total input VAT")
    void getIdsAndTypeInTotalInputVatReturnsIdsList() {
        // Arrange
        VatReportFiling vatReportFiling = new VatReportFiling();
        vatReportFiling.setStartDate(LocalDate.now());
        vatReportFiling.setEndDate(LocalDate.now());
        VatReportFilingRequestModel requestModel = new VatReportFilingRequestModel();
        Integer transactionCategoryId = 1;

        List<Object> invoiceList = new ArrayList<>();
        invoiceList.add(new Object[]{1, "INVOICE"});

        List<Object> expenseList = new ArrayList<>();
        expenseList.add(new Object[]{2, "EXPENSE"});

        when(entityManager.createNamedQuery("IdsAndTypeInTotalInputVat"))
            .thenReturn(query);
        when(entityManager.createNamedQuery("IdsForTotalInputVatExpense"))
            .thenReturn(query);
        when(query.setParameter(eq("startDate"), any()))
            .thenReturn(query);
        when(query.setParameter(eq("endDate"), any()))
            .thenReturn(query);
        when(query.setParameter("transactionCategoryId", transactionCategoryId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(invoiceList)
            .thenReturn(expenseList);

        // Act
        List<Object> result = journalLineItemDao.getIdsAndTypeInTotalInputVat(
            vatReportFiling, requestModel, transactionCategoryId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Should return IDs and types for total output VAT")
    void getIdsAndTypeInTotalOutputVatReturnsIdsList() {
        // Arrange
        VatReportFiling vatReportFiling = new VatReportFiling();
        vatReportFiling.setStartDate(LocalDate.now());
        vatReportFiling.setEndDate(LocalDate.now());
        VatReportFilingRequestModel requestModel = new VatReportFilingRequestModel();
        Integer transactionCategoryId = 1;

        List<Object> outputList = new ArrayList<>();
        outputList.add(new Object[]{3, "SALES"});

        when(entityManager.createNamedQuery("IdsAndTypeInTotalOutputVat"))
            .thenReturn(query);
        when(query.setParameter(eq("startDate"), any()))
            .thenReturn(query);
        when(query.setParameter(eq("endDate"), any()))
            .thenReturn(query);
        when(query.setParameter("transactionCategoryId", transactionCategoryId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(outputList);

        // Act
        List<Object> result = journalLineItemDao.getIdsAndTypeInTotalOutputVat(
            vatReportFiling, requestModel, transactionCategoryId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should handle exception in aggregate transaction map gracefully")
    void getAggregateTransactionCategoryMapHandlesExceptionGracefully() {
        // Arrange
        FinancialReportRequestModel requestModel = new FinancialReportRequestModel();
        requestModel.setStartDate("01/01/2024");
        requestModel.setEndDate("31/12/2024");

        when(dateUtil.getDateStrAsLocalDateTime(anyString(), eq(CommonColumnConstants.DD_MM_YYYY)))
            .thenThrow(new RuntimeException("Date parsing error"));

        // Act
        Map<Integer, CreditDebitAggregator> result = journalLineItemDao.getAggregateTransactionCategoryMap(
            requestModel, "ProfitAndLoss");

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle exception in tax report gracefully")
    void getTaxReportHandlesExceptionGracefully() {
        // Arrange
        Date startDate = new Date();
        Date endDate = new Date();

        when(dateUtil.getDateStrAsLocalDateTime(any(Date.class), eq(CommonColumnConstants.DD_MM_YYYY)))
            .thenThrow(new RuntimeException("Date parsing error"));

        // Act
        Map<Integer, CreditDebitAggregator> result = journalLineItemDao.getTaxReport(startDate, endDate);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    private List<JournalLineItem> createJournalLineItemList(int count) {
        List<JournalLineItem> items = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            JournalLineItem item = new JournalLineItem();
            item.setJournalLineItemId(i + 1);
            items.add(item);
        }
        return items;
    }
}
