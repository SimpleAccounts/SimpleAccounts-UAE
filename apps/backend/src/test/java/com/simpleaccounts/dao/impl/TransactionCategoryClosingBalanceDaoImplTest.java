package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.constant.dbfilter.TransactionCategoryBalanceFilterEnum;
import com.simpleaccounts.entity.TransactionCategoryClosingBalance;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.model.VatReportModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simpleaccounts.rest.financialreport.FinancialReportRequestModel;
import com.simpleaccounts.utils.DateFormatUtil;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.persistence.EntityManager;
import javax.persistence.Query;
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
@DisplayName("TransactionCategoryClosingBalanceDaoImpl Unit Tests")
class TransactionCategoryClosingBalanceDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<TransactionCategoryClosingBalance> closingBalanceTypedQuery;

    @Mock
    private TypedQuery<BigDecimal> bigDecimalTypedQuery;

    @Mock
    private Query query;

    @Mock
    private DateFormatUtil dateUtil;

    @InjectMocks
    private TransactionCategoryClosingBalanceDaoImpl closingBalanceDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(closingBalanceDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(closingBalanceDao, "entityClass", TransactionCategoryClosingBalance.class);
    }

    @Test
    @DisplayName("Should return closing balance list for date range")
    void getListReturnsClosingBalancesForDateRange() {
        // Arrange
        ReportRequestModel reportRequest = createReportRequestModel("01/01/2024", "31/01/2024");
        List<TransactionCategoryClosingBalance> balances = createClosingBalanceList(5);

        when(entityManager.createQuery(anyString(), eq(TransactionCategoryClosingBalance.class)))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter(eq(CommonColumnConstants.START_DATE), any(LocalDateTime.class)))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter(eq(CommonColumnConstants.END_DATE), any(LocalDateTime.class)))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.getResultList()).thenReturn(balances);

        // Act
        List<TransactionCategoryClosingBalance> result = closingBalanceDao.getList(reportRequest);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
    }

    @Test
    @DisplayName("Should return null when no closing balances found")
    void getListReturnsNullWhenNoBalances() {
        // Arrange
        ReportRequestModel reportRequest = createReportRequestModel("01/01/2024", "31/01/2024");

        when(entityManager.createQuery(anyString(), eq(TransactionCategoryClosingBalance.class)))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter(any(String.class), any()))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<TransactionCategoryClosingBalance> result = closingBalanceDao.getList(reportRequest);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return closing balances by chart of account IDs")
    void getListByChartOfAccountIdsReturnsBalances() {
        // Arrange
        ReportRequestModel reportRequest = createReportRequestModel("01/01/2024", "31/01/2024");
        reportRequest.setChartOfAccountCodes("'1001','1002'");
        List<TransactionCategoryClosingBalance> balances = createClosingBalanceList(3);

        when(dateUtil.getDateStrAsLocalDateTime(anyString(), anyString())).thenReturn(LocalDateTime.now());
        when(entityManager.createQuery(anyString(), eq(TransactionCategoryClosingBalance.class)))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter(any(String.class), any()))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.getResultList()).thenReturn(balances);

        // Act
        List<TransactionCategoryClosingBalance> result = closingBalanceDao.getListByChartOfAccountIds(reportRequest);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("Should return null when no balances found by chart of account IDs")
    void getListByChartOfAccountIdsReturnsNullWhenNoBalances() {
        // Arrange
        ReportRequestModel reportRequest = createReportRequestModel("01/01/2024", "31/01/2024");
        reportRequest.setChartOfAccountCodes("'1001'");

        when(dateUtil.getDateStrAsLocalDateTime(anyString(), anyString())).thenReturn(LocalDateTime.now());
        when(entityManager.createQuery(anyString(), eq(TransactionCategoryClosingBalance.class)))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter(any(String.class), any()))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<TransactionCategoryClosingBalance> result = closingBalanceDao.getListByChartOfAccountIds(reportRequest);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return all balances with filter map")
    void getAllReturnsBalancesWithFilters() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        List<TransactionCategoryClosingBalance> balances = createClosingBalanceList(5);

        when(query.getSingleResult()).thenReturn(5L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(balances);

        // Act
        PaginationResponseModel result = closingBalanceDao.getAll(filterMap);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(5);
        assertThat(result.getData()).hasSize(5);
    }

    @Test
    @DisplayName("Should return closing balance for time range")
    void getClosingBalanceForTimeRangeReturnsBalances() {
        // Arrange
        LocalDateTime startDate = LocalDateTime.now().minusDays(30);
        LocalDateTime endDate = LocalDateTime.now();
        TransactionCategory category = createTransactionCategory(1);
        List<TransactionCategoryClosingBalance> balances = createClosingBalanceList(3);

        when(entityManager.createNamedQuery("getListByFrmToDate", TransactionCategoryClosingBalance.class))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter("startDate", startDate))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter("endDate", endDate))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter("transactionCategory", category))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.getResultList()).thenReturn(balances);

        // Act
        List<TransactionCategoryClosingBalance> result = closingBalanceDao.getClosingBalanceForTimeRange(startDate, endDate, category);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("Should return null when no balances in time range")
    void getClosingBalanceForTimeRangeReturnsNullWhenNoBalances() {
        // Arrange
        LocalDateTime startDate = LocalDateTime.now().minusDays(30);
        LocalDateTime endDate = LocalDateTime.now();
        TransactionCategory category = createTransactionCategory(1);

        when(entityManager.createNamedQuery("getListByFrmToDate", TransactionCategoryClosingBalance.class))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter(any(String.class), any()))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<TransactionCategoryClosingBalance> result = closingBalanceDao.getClosingBalanceForTimeRange(startDate, endDate, category);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return closing balances greater than current date")
    void getClosingBalanceGreaterThanCurrentDateReturnsBalances() {
        // Arrange
        LocalDateTime endDate = LocalDateTime.now();
        TransactionCategory category = createTransactionCategory(1);
        List<TransactionCategoryClosingBalance> balances = createClosingBalanceList(2);

        when(entityManager.createNamedQuery("getListByFrmDate", TransactionCategoryClosingBalance.class))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter("endDate", endDate))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter("transactionCategory", category))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.getResultList()).thenReturn(balances);

        // Act
        List<TransactionCategoryClosingBalance> result = closingBalanceDao.getClosingBalanceGreaterThanCurrentDate(endDate, category);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Should return empty list when no balances greater than current date")
    void getClosingBalanceGreaterThanCurrentDateReturnsEmptyList() {
        // Arrange
        LocalDateTime endDate = LocalDateTime.now();
        TransactionCategory category = createTransactionCategory(1);

        when(entityManager.createNamedQuery("getListByFrmDate", TransactionCategoryClosingBalance.class))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter(any(String.class), any()))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<TransactionCategoryClosingBalance> result = closingBalanceDao.getClosingBalanceGreaterThanCurrentDate(endDate, category);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return closing balance less than current date")
    void getClosingBalanceLessThanCurrentDateReturnsBalance() {
        // Arrange
        LocalDateTime endDate = LocalDateTime.now();
        TransactionCategory category = createTransactionCategory(1);
        TransactionCategoryClosingBalance balance = createClosingBalance(1);

        when(entityManager.createNamedQuery("getListByForDate", TransactionCategoryClosingBalance.class))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter("endDate", endDate))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter("transactionCategory", category))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.getResultList()).thenReturn(Collections.singletonList(balance));

        // Act
        TransactionCategoryClosingBalance result = closingBalanceDao.getClosingBalanceLessThanCurrentDate(endDate, category);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(balance);
    }

    @Test
    @DisplayName("Should return null when no balance less than current date")
    void getClosingBalanceLessThanCurrentDateReturnsNull() {
        // Arrange
        LocalDateTime endDate = LocalDateTime.now();
        TransactionCategory category = createTransactionCategory(1);

        when(entityManager.createNamedQuery("getListByForDate", TransactionCategoryClosingBalance.class))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter(any(String.class), any()))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        TransactionCategoryClosingBalance result = closingBalanceDao.getClosingBalanceLessThanCurrentDate(endDate, category);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return last closing balance by date")
    void getLastClosingBalanceByDateReturnsBalance() {
        // Arrange
        TransactionCategory category = createTransactionCategory(1);
        TransactionCategoryClosingBalance balance = createClosingBalance(1);

        when(entityManager.createNamedQuery("getLastClosingBalanceByDate", TransactionCategoryClosingBalance.class))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter("transactionCategory", category))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.getResultList()).thenReturn(Collections.singletonList(balance));

        // Act
        TransactionCategoryClosingBalance result = closingBalanceDao.getLastClosingBalanceByDate(category);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(balance);
    }

    @Test
    @DisplayName("Should return null when no last closing balance")
    void getLastClosingBalanceByDateReturnsNull() {
        // Arrange
        TransactionCategory category = createTransactionCategory(1);

        when(entityManager.createNamedQuery("getLastClosingBalanceByDate", TransactionCategoryClosingBalance.class))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter("transactionCategory", category))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        TransactionCategoryClosingBalance result = closingBalanceDao.getLastClosingBalanceByDate(category);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return first closing balance by date")
    void getFirstClosingBalanceByDateReturnsBalance() {
        // Arrange
        TransactionCategory category = createTransactionCategory(1);
        List<TransactionCategoryClosingBalance> balances = createClosingBalanceList(3);

        when(entityManager.createNamedQuery("getLastClosingBalanceByDate", TransactionCategoryClosingBalance.class))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter("transactionCategory", category))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.getResultList()).thenReturn(balances);

        // Act
        TransactionCategoryClosingBalance result = closingBalanceDao.getFirstClosingBalanceByDate(category);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(balances.get(2));
    }

    @Test
    @DisplayName("Should return null when no first closing balance")
    void getFirstClosingBalanceByDateReturnsNull() {
        // Arrange
        TransactionCategory category = createTransactionCategory(1);

        when(entityManager.createNamedQuery("getLastClosingBalanceByDate", TransactionCategoryClosingBalance.class))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter("transactionCategory", category))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        TransactionCategoryClosingBalance result = closingBalanceDao.getFirstClosingBalanceByDate(category);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return VAT report list by place of supply")
    void getListByplaceOfSupplyReturnsVatReports() {
        // Arrange
        FinancialReportRequestModel reportRequest = createFinancialReportRequestModel("01/01/2024", "31/01/2024");
        Object[] row = new Object[]{new BigDecimal("1000"), new BigDecimal("50"), 1, "UAE"};
        List<Object> results = Collections.singletonList(row);

        when(dateUtil.getDateStrAsLocalDateTime(anyString(), anyString())).thenReturn(LocalDateTime.now());
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter(any(String.class), any())).thenReturn(query);
        when(query.getResultList()).thenReturn(results);

        // Act
        List<VatReportModel> result = closingBalanceDao.getListByplaceOfSupply(reportRequest);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should return empty list when no VAT reports by place of supply")
    void getListByplaceOfSupplyReturnsEmptyList() {
        // Arrange
        FinancialReportRequestModel reportRequest = createFinancialReportRequestModel("01/01/2024", "31/01/2024");

        when(dateUtil.getDateStrAsLocalDateTime(anyString(), anyString())).thenReturn(LocalDateTime.now());
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter(any(String.class), any())).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<VatReportModel> result = closingBalanceDao.getListByplaceOfSupply(reportRequest);

        // Assert
        assertThat(result).isNotEmpty();
    }

    @Test
    @DisplayName("Should return total zero VAT amount")
    void getTotalZeroVatAmountReturnsAmount() {
        // Arrange
        Object[] row = new Object[]{new BigDecimal("500")};
        List<Object> results = Collections.singletonList(row);

        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.getResultList()).thenReturn(results);

        // Act
        BigDecimal result = closingBalanceDao.getTotalZeroVatAmount();

        // Assert
        assertThat(result).isEqualByComparingTo(new BigDecimal("500"));
    }

    @Test
    @DisplayName("Should return zero when no zero VAT amount")
    void getTotalZeroVatAmountReturnsZero() {
        // Arrange
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        BigDecimal result = closingBalanceDao.getTotalZeroVatAmount();

        // Assert
        assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should return sum of total amount closing balance")
    void sumOfTotalAmountClosingBalanceReturnsSum() {
        // Arrange
        FinancialReportRequestModel reportRequest = createFinancialReportRequestModel("01/01/2024", "31/01/2024");
        String lastMonth = "2024-01";

        when(dateUtil.getDateStrAsLocalDateTime(anyString(), anyString())).thenReturn(LocalDateTime.now());
        when(entityManager.createQuery(anyString(), eq(BigDecimal.class))).thenReturn(bigDecimalTypedQuery);
        when(bigDecimalTypedQuery.setParameter("lastMonth", lastMonth)).thenReturn(bigDecimalTypedQuery);
        when(bigDecimalTypedQuery.getSingleResult()).thenReturn(new BigDecimal("5000"));

        // Act
        BigDecimal result = closingBalanceDao.sumOfTotalAmountClosingBalance(reportRequest, lastMonth);

        // Assert
        assertThat(result).isEqualByComparingTo(new BigDecimal("5000"));
    }

    @Test
    @DisplayName("Should handle empty filter map in getAll")
    void getAllHandlesEmptyFilterMap() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> emptyFilterMap = new HashMap<>();

        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        PaginationResponseModel result = closingBalanceDao.getAll(emptyFilterMap);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should use named query for time range query")
    void getClosingBalanceForTimeRangeUsesNamedQuery() {
        // Arrange
        LocalDateTime startDate = LocalDateTime.now().minusDays(30);
        LocalDateTime endDate = LocalDateTime.now();
        TransactionCategory category = createTransactionCategory(1);

        when(entityManager.createNamedQuery("getListByFrmToDate", TransactionCategoryClosingBalance.class))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter(any(String.class), any()))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        closingBalanceDao.getClosingBalanceForTimeRange(startDate, endDate, category);

        // Assert
        verify(entityManager).createNamedQuery("getListByFrmToDate", TransactionCategoryClosingBalance.class);
    }

    @Test
    @DisplayName("Should set parameters correctly for date range query")
    void getListSetsParametersCorrectly() {
        // Arrange
        ReportRequestModel reportRequest = createReportRequestModel("01/01/2024", "31/01/2024");

        when(entityManager.createQuery(anyString(), eq(TransactionCategoryClosingBalance.class)))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter(any(String.class), any()))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        closingBalanceDao.getList(reportRequest);

        // Assert
        verify(closingBalanceTypedQuery, times(2)).setParameter(any(String.class), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("Should handle null start date in getListByChartOfAccountIds")
    void getListByChartOfAccountIdsHandlesNullStartDate() {
        // Arrange
        ReportRequestModel reportRequest = createReportRequestModel(null, "31/01/2024");
        reportRequest.setChartOfAccountCodes("'1001'");

        when(dateUtil.getDateStrAsLocalDateTime(anyString(), anyString())).thenReturn(LocalDateTime.now());
        when(entityManager.createQuery(anyString(), eq(TransactionCategoryClosingBalance.class)))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter(any(String.class), any()))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<TransactionCategoryClosingBalance> result = closingBalanceDao.getListByChartOfAccountIds(reportRequest);

        // Assert
        verify(closingBalanceTypedQuery, times(1)).setParameter(eq(CommonColumnConstants.END_DATE), any());
    }

    @Test
    @DisplayName("Should return first element from list for less than current date")
    void getClosingBalanceLessThanCurrentDateReturnsFirstElement() {
        // Arrange
        LocalDateTime endDate = LocalDateTime.now();
        TransactionCategory category = createTransactionCategory(1);
        List<TransactionCategoryClosingBalance> balances = createClosingBalanceList(3);

        when(entityManager.createNamedQuery("getListByForDate", TransactionCategoryClosingBalance.class))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.setParameter(any(String.class), any()))
            .thenReturn(closingBalanceTypedQuery);
        when(closingBalanceTypedQuery.getResultList()).thenReturn(balances);

        // Act
        TransactionCategoryClosingBalance result = closingBalanceDao.getClosingBalanceLessThanCurrentDate(endDate, category);

        // Assert
        assertThat(result).isEqualTo(balances.get(0));
    }

    @Test
    @DisplayName("Should handle multiple VAT report rows")
    void getListByplaceOfSupplyHandlesMultipleRows() {
        // Arrange
        FinancialReportRequestModel reportRequest = createFinancialReportRequestModel("01/01/2024", "31/01/2024");
        Object[] row1 = new Object[]{new BigDecimal("1000"), new BigDecimal("50"), 1, "UAE"};
        Object[] row2 = new Object[]{new BigDecimal("2000"), new BigDecimal("100"), 2, "Saudi"};
        List<Object> results = Arrays.asList(row1, row2);

        when(dateUtil.getDateStrAsLocalDateTime(anyString(), anyString())).thenReturn(LocalDateTime.now());
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter(any(String.class), any())).thenReturn(query);
        when(query.getResultList()).thenReturn(results);

        // Act
        List<VatReportModel> result = closingBalanceDao.getListByplaceOfSupply(reportRequest);

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTotalAmount()).isEqualByComparingTo(new BigDecimal("1000"));
        assertThat(result.get(1).getTotalAmount()).isEqualByComparingTo(new BigDecimal("2000"));
    }

    private List<TransactionCategoryClosingBalance> createClosingBalanceList(int count) {
        List<TransactionCategoryClosingBalance> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            list.add(createClosingBalance(i + 1));
        }
        return list;
    }

    private TransactionCategoryClosingBalance createClosingBalance(int id) {
        TransactionCategoryClosingBalance balance = new TransactionCategoryClosingBalance();
        balance.setTransactionCategoryClosingBalanceId(id);
        balance.setClosingBalance(new BigDecimal("1000.00"));
        balance.setClosingBalanceDate(LocalDateTime.now());
        return balance;
    }

    private TransactionCategory createTransactionCategory(int id) {
        TransactionCategory category = new TransactionCategory();
        category.setTransactionCategoryId(id);
        category.setTransactionCategoryName("Category " + id);
        return category;
    }

    private ReportRequestModel createReportRequestModel(String startDate, String endDate) {
        ReportRequestModel model = new ReportRequestModel();
        model.setStartDate(startDate);
        model.setEndDate(endDate);
        return model;
    }

    private FinancialReportRequestModel createFinancialReportRequestModel(String startDate, String endDate) {
        FinancialReportRequestModel model = new FinancialReportRequestModel();
        model.setStartDate(startDate);
        model.setEndDate(endDate);
        return model;
    }
}
