package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.ExpenseFIlterEnum;
import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.entity.VatCategory;
import com.simpleaccounts.entity.VatReportFiling;
import com.simpleaccounts.model.VatReportResponseModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simpleaccounts.rest.financialreport.VatReportFilingRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.EnumMap;
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
@DisplayName("ExpenseDaoImpl Unit Tests")
class ExpenseDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<Expense> expenseTypedQuery;

    @Mock
    private Query query;

    @Mock
    private DatatableSortingFilterConstant dataTableUtil;

    @Mock
    private VatReportFilingRepository vatReportFilingRepository;

    @InjectMocks
    private ExpenseDaoImpl expenseDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(expenseDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(expenseDao, "entityClass", Expense.class);
    }

    @Test
    @DisplayName("Should return all expenses for user with status list")
    void getAllExpensesReturnsExpensesForUserAndStatus() {
        // Arrange
        Integer userId = 1;
        List<Integer> statusList = Arrays.asList(1, 2, 3);
        List<Expense> expenses = createExpenseList(5);

        when(entityManager.createNamedQuery("postedExpenses", Expense.class))
            .thenReturn(expenseTypedQuery);
        when(expenseTypedQuery.setParameter("status", statusList))
            .thenReturn(expenseTypedQuery);
        when(expenseTypedQuery.setParameter("userId", userId))
            .thenReturn(expenseTypedQuery);
        when(expenseTypedQuery.getResultList())
            .thenReturn(expenses);

        // Act
        List<Expense> result = expenseDao.getAllExpenses(userId, statusList);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
    }

    @Test
    @DisplayName("Should return empty list when no expenses found")
    void getAllExpensesReturnsEmptyListWhenNoExpenses() {
        // Arrange
        Integer userId = 1;
        List<Integer> statusList = Arrays.asList(1, 2);

        when(entityManager.createNamedQuery("postedExpenses", Expense.class))
            .thenReturn(expenseTypedQuery);
        when(expenseTypedQuery.setParameter("status", statusList))
            .thenReturn(expenseTypedQuery);
        when(expenseTypedQuery.setParameter("userId", userId))
            .thenReturn(expenseTypedQuery);
        when(expenseTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<Expense> result = expenseDao.getAllExpenses(userId, statusList);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle exception in getAllExpenses and return null")
    void getAllExpensesHandlesExceptionAndReturnsNull() {
        // Arrange
        Integer userId = 1;
        List<Integer> statusList = Arrays.asList(1, 2);

        when(entityManager.createNamedQuery("postedExpenses", Expense.class))
            .thenThrow(new RuntimeException("Database error"));

        // Act
        List<Expense> result = expenseDao.getAllExpenses(userId, statusList);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return expenses to match by amount")
    void getExpensesToMatchReturnsExpensesByAmount() {
        // Arrange
        Integer userId = 1;
        List<Integer> statusList = Arrays.asList(1, 2);
        BigDecimal amount = BigDecimal.valueOf(100.00);
        List<Expense> expenses = createExpenseList(3);

        when(entityManager.createNamedQuery("getExpensesToMatch", Expense.class))
            .thenReturn(expenseTypedQuery);
        when(expenseTypedQuery.setParameter("status", statusList))
            .thenReturn(expenseTypedQuery);
        when(expenseTypedQuery.setParameter("userId", userId))
            .thenReturn(expenseTypedQuery);
        when(expenseTypedQuery.setParameter("amount", amount))
            .thenReturn(expenseTypedQuery);
        when(expenseTypedQuery.getResultList())
            .thenReturn(expenses);

        // Act
        List<Expense> result = expenseDao.getExpensesToMatch(userId, statusList, amount);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        verify(expenseTypedQuery).setParameter("amount", amount);
    }

    @Test
    @DisplayName("Should handle exception in getExpensesToMatch and return null")
    void getExpensesToMatchHandlesExceptionAndReturnsNull() {
        // Arrange
        Integer userId = 1;
        List<Integer> statusList = Arrays.asList(1, 2);
        BigDecimal amount = BigDecimal.valueOf(100.00);

        when(entityManager.createNamedQuery("getExpensesToMatch", Expense.class))
            .thenThrow(new RuntimeException("Database error"));

        // Act
        List<Expense> result = expenseDao.getExpensesToMatch(userId, statusList, amount);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return expense per month data")
    void getExpensePerMonthReturnsMonthlyData() {
        // Arrange
        Date startDate = new Date();
        Date endDate = new Date();
        List<Object[]> monthlyData = Arrays.asList(
            new Object[]{BigDecimal.valueOf(1000), "1-2023"},
            new Object[]{BigDecimal.valueOf(1500), "2-2023"}
        );

        when(entityManager.createQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter(anyString(), any(), any()))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(monthlyData);

        // Act
        List<Object[]> result = expenseDao.getExpensePerMonth(startDate, endDate);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Should handle exception in getExpensePerMonth and return empty list")
    void getExpensePerMonthHandlesExceptionAndReturnsEmptyList() {
        // Arrange
        Date startDate = new Date();
        Date endDate = new Date();

        when(entityManager.createQuery(anyString()))
            .thenThrow(new RuntimeException("Database error"));

        // Act
        List<Object[]> result = expenseDao.getExpensePerMonth(startDate, endDate);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return expenses between dates")
    void getExpensesReturnsExpensesBetweenDates() {
        // Arrange
        Date startDate = new Date();
        Date endDate = new Date();
        List<Object[]> expenseData = Arrays.asList(
            new Object[]{BigDecimal.valueOf(100), new Date(), "REF001"},
            new Object[]{BigDecimal.valueOf(200), new Date(), "REF002"}
        );

        when(entityManager.createQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter(anyString(), any(), any()))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(expenseData);

        // Act
        List<Object[]> result = expenseDao.getExpenses(startDate, endDate);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Should handle exception in getExpenses and return empty list")
    void getExpensesHandlesExceptionAndReturnsEmptyList() {
        // Arrange
        Date startDate = new Date();
        Date endDate = new Date();

        when(entityManager.createQuery(anyString()))
            .thenThrow(new RuntimeException("Database error"));

        // Act
        List<Object[]> result = expenseDao.getExpenses(startDate, endDate);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return VAT out per month data")
    void getVatOutPerMonthWiseReturnsMonthlyVatData() {
        // Arrange
        Date startDate = new Date();
        Date endDate = new Date();
        List<Object[]> vatData = Arrays.asList(
            new Object[]{BigDecimal.valueOf(50), "1-2023"},
            new Object[]{BigDecimal.valueOf(75), "2-2023"}
        );

        when(entityManager.createQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter(anyString(), any(), any()))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(vatData);

        // Act
        List<Object[]> result = expenseDao.getVatOutPerMonthWise(startDate, endDate);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Should handle exception in getVatOutPerMonthWise and return empty list")
    void getVatOutPerMonthWiseHandlesExceptionAndReturnsEmptyList() {
        // Arrange
        Date startDate = new Date();
        Date endDate = new Date();

        when(entityManager.createQuery(anyString()))
            .thenThrow(new RuntimeException("Database error"));

        // Act
        List<Object[]> result = expenseDao.getVatOutPerMonthWise(startDate, endDate);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return expenses for reports between dates")
    void getExpenseForReportsReturnsExpenses() {
        // Arrange
        Date startDate = new Date();
        Date endDate = new Date();
        List<Expense> expenses = createExpenseList(10);

        when(entityManager.createQuery(anyString(), eq(Expense.class)))
            .thenReturn(expenseTypedQuery);
        when(expenseTypedQuery.setParameter(anyString(), any()))
            .thenReturn(expenseTypedQuery);
        when(expenseTypedQuery.getResultList())
            .thenReturn(expenses);

        // Act
        List<Expense> result = expenseDao.getExpenseForReports(startDate, endDate);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(10);
    }

    @Test
    @DisplayName("Should return empty list when no expenses for reports")
    void getExpenseForReportsReturnsEmptyListWhenNoExpenses() {
        // Arrange
        Date startDate = new Date();
        Date endDate = new Date();

        when(entityManager.createQuery(anyString(), eq(Expense.class)))
            .thenReturn(expenseTypedQuery);
        when(expenseTypedQuery.setParameter(anyString(), any()))
            .thenReturn(expenseTypedQuery);
        when(expenseTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<Expense> result = expenseDao.getExpenseForReports(startDate, endDate);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should soft delete expenses by setting delete flag")
    void deleteByIdsSetsDeleteFlagOnExpenses() {
        // Arrange
        List<Integer> ids = Arrays.asList(1, 2, 3);
        Expense expense1 = createExpense(1, BigDecimal.valueOf(100), false);
        Expense expense2 = createExpense(2, BigDecimal.valueOf(200), false);
        Expense expense3 = createExpense(3, BigDecimal.valueOf(300), false);

        when(entityManager.find(Expense.class, 1)).thenReturn(expense1);
        when(entityManager.find(Expense.class, 2)).thenReturn(expense2);
        when(entityManager.find(Expense.class, 3)).thenReturn(expense3);
        when(entityManager.merge(any(Expense.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        expenseDao.deleteByIds(ids);

        // Assert
        verify(entityManager, times(3)).merge(any(Expense.class));
        assertThat(expense1.getDeleteFlag()).isTrue();
        assertThat(expense2.getDeleteFlag()).isTrue();
        assertThat(expense3.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should not delete when IDs list is empty")
    void deleteByIdsDoesNotDeleteWhenListEmpty() {
        // Arrange
        List<Integer> emptyIds = new ArrayList<>();

        // Act
        expenseDao.deleteByIds(emptyIds);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should not delete when IDs list is null")
    void deleteByIdsDoesNotDeleteWhenListNull() {
        // Act
        expenseDao.deleteByIds(null);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should delete single expense")
    void deleteByIdsDeletesSingleExpense() {
        // Arrange
        List<Integer> ids = Collections.singletonList(1);
        Expense expense = createExpense(1, BigDecimal.valueOf(150), false);

        when(entityManager.find(Expense.class, 1)).thenReturn(expense);
        when(entityManager.merge(any(Expense.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        expenseDao.deleteByIds(ids);

        // Assert
        verify(entityManager).merge(expense);
        assertThat(expense.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should return expense list with filters and pagination")
    void getExpenseListReturnsListWithFiltersAndPagination() {
        // Arrange
        Map<ExpenseFIlterEnum, Object> filterMap = new EnumMap<>(ExpenseFIlterEnum.class);
        filterMap.put(ExpenseFIlterEnum.DELETE_FLAG, false);

        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("expenseDate");
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);

        List<Expense> expenses = createExpenseList(5);

        when(dataTableUtil.getColName(anyString(), any()))
            .thenReturn("expenseDate");
        when(entityManager.createQuery(any(String.class), eq(Expense.class)))
            .thenReturn(expenseTypedQuery);
        when(expenseTypedQuery.getResultList())
            .thenReturn(expenses);

        // Act
        PaginationResponseModel result = expenseDao.getExpenseList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getData()).isNotNull();
    }

    @Test
    @DisplayName("Should calculate sum of total expenses with VAT")
    void sumOfTotalExpensesWithVatCalculatesSums() {
        // Arrange
        ReportRequestModel reportRequest = new ReportRequestModel();
        reportRequest.setStartDate("01/01/2023");
        reportRequest.setEndDate("31/12/2023");

        VatReportResponseModel vatReportResponse = new VatReportResponseModel();

        List<Object> queryResults = Collections.singletonList(
            new Object[]{BigDecimal.valueOf(1000), BigDecimal.valueOf(50)}
        );

        when(vatReportFilingRepository.getVatReportFilingByStartDateAndEndDate(any(), any()))
            .thenReturn(null);
        when(entityManager.createQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter(anyString(), any()))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(queryResults);

        // Act
        expenseDao.sumOfTotalExpensesWithVat(reportRequest, vatReportResponse);

        // Assert
        assertThat(vatReportResponse.getTotalAmountForExpense())
            .isEqualByComparingTo(BigDecimal.valueOf(1000));
        assertThat(vatReportResponse.getTotalVatAmountForExpense())
            .isEqualByComparingTo(BigDecimal.valueOf(50));
    }

    @Test
    @DisplayName("Should set zero when total amount is null in VAT calculation")
    void sumOfTotalExpensesWithVatSetsZeroWhenTotalAmountIsNull() {
        // Arrange
        ReportRequestModel reportRequest = new ReportRequestModel();
        reportRequest.setStartDate("01/01/2023");
        reportRequest.setEndDate("31/12/2023");

        VatReportResponseModel vatReportResponse = new VatReportResponseModel();

        List<Object> queryResults = Collections.singletonList(
            new Object[]{null, BigDecimal.valueOf(50)}
        );

        when(vatReportFilingRepository.getVatReportFilingByStartDateAndEndDate(any(), any()))
            .thenReturn(null);
        when(entityManager.createQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter(anyString(), any()))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(queryResults);

        // Act
        expenseDao.sumOfTotalExpensesWithVat(reportRequest, vatReportResponse);

        // Assert
        assertThat(vatReportResponse.getTotalAmountForExpense())
            .isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should set zero when VAT amount is null in VAT calculation")
    void sumOfTotalExpensesWithVatSetsZeroWhenVatAmountIsNull() {
        // Arrange
        ReportRequestModel reportRequest = new ReportRequestModel();
        reportRequest.setStartDate("01/01/2023");
        reportRequest.setEndDate("31/12/2023");

        VatReportResponseModel vatReportResponse = new VatReportResponseModel();

        List<Object> queryResults = Collections.singletonList(
            new Object[]{BigDecimal.valueOf(1000), null}
        );

        when(vatReportFilingRepository.getVatReportFilingByStartDateAndEndDate(any(), any()))
            .thenReturn(null);
        when(entityManager.createQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter(anyString(), any()))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(queryResults);

        // Act
        expenseDao.sumOfTotalExpensesWithVat(reportRequest, vatReportResponse);

        // Assert
        assertThat(vatReportResponse.getTotalVatAmountForExpense())
            .isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should use edit flag true when VAT filing status is unfiled")
    void sumOfTotalExpensesWithVatUsesEditFlagTrueWhenUnfiled() {
        // Arrange
        ReportRequestModel reportRequest = new ReportRequestModel();
        reportRequest.setStartDate("01/01/2023");
        reportRequest.setEndDate("31/12/2023");

        VatReportResponseModel vatReportResponse = new VatReportResponseModel();

        VatReportFiling vatReportFiling = new VatReportFiling();
        vatReportFiling.setStatus(CommonStatusEnum.UN_FILED.getValue());

        when(vatReportFilingRepository.getVatReportFilingByStartDateAndEndDate(any(), any()))
            .thenReturn(vatReportFiling);
        when(entityManager.createQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter(anyString(), any()))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        expenseDao.sumOfTotalExpensesWithVat(reportRequest, vatReportResponse);

        // Assert
        verify(query).setParameter(eq("editFlag"), eq(Boolean.TRUE));
    }

    @Test
    @DisplayName("Should use edit flag false when VAT filing status is filed")
    void sumOfTotalExpensesWithVatUsesEditFlagFalseWhenFiled() {
        // Arrange
        ReportRequestModel reportRequest = new ReportRequestModel();
        reportRequest.setStartDate("01/01/2023");
        reportRequest.setEndDate("31/12/2023");

        VatReportResponseModel vatReportResponse = new VatReportResponseModel();

        VatReportFiling vatReportFiling = new VatReportFiling();
        vatReportFiling.setStatus(CommonStatusEnum.FILED.getValue());

        when(vatReportFilingRepository.getVatReportFilingByStartDateAndEndDate(any(), any()))
            .thenReturn(vatReportFiling);
        when(entityManager.createQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter(anyString(), any()))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        expenseDao.sumOfTotalExpensesWithVat(reportRequest, vatReportResponse);

        // Assert
        verify(query).setParameter(eq("editFlag"), eq(Boolean.FALSE));
    }

    @Test
    @DisplayName("Should handle empty result list in VAT calculation")
    void sumOfTotalExpensesWithVatHandlesEmptyResultList() {
        // Arrange
        ReportRequestModel reportRequest = new ReportRequestModel();
        reportRequest.setStartDate("01/01/2023");
        reportRequest.setEndDate("31/12/2023");

        VatReportResponseModel vatReportResponse = new VatReportResponseModel();

        when(vatReportFilingRepository.getVatReportFilingByStartDateAndEndDate(any(), any()))
            .thenReturn(null);
        when(entityManager.createQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter(anyString(), any()))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        expenseDao.sumOfTotalExpensesWithVat(reportRequest, vatReportResponse);

        // Assert - should not throw exception
        verify(query).getResultList();
    }

    @Test
    @DisplayName("Should preserve expense amount when deleting")
    void deleteByIdsPreservesExpenseAmount() {
        // Arrange
        BigDecimal amount = BigDecimal.valueOf(250.50);
        Expense expense = createExpense(1, amount, false);

        when(entityManager.find(Expense.class, 1)).thenReturn(expense);
        when(entityManager.merge(any(Expense.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        expenseDao.deleteByIds(Collections.singletonList(1));

        // Assert
        assertThat(expense.getExpenseAmount()).isEqualByComparingTo(amount);
        assertThat(expense.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should handle large number of expenses for deletion")
    void deleteByIdsHandlesLargeNumberOfIds() {
        // Arrange
        List<Integer> ids = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            ids.add(i);
            when(entityManager.find(Expense.class, i))
                .thenReturn(createExpense(i, BigDecimal.valueOf(100 * i), false));
        }
        when(entityManager.merge(any(Expense.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        expenseDao.deleteByIds(ids);

        // Assert
        verify(entityManager, times(50)).find(eq(Expense.class), any(Integer.class));
        verify(entityManager, times(50)).merge(any(Expense.class));
    }

    @Test
    @DisplayName("Should use correct named query for posted expenses")
    void getAllExpensesUsesCorrectNamedQuery() {
        // Arrange
        Integer userId = 1;
        List<Integer> statusList = Arrays.asList(1, 2);

        when(entityManager.createNamedQuery("postedExpenses", Expense.class))
            .thenReturn(expenseTypedQuery);
        when(expenseTypedQuery.setParameter(anyString(), any()))
            .thenReturn(expenseTypedQuery);
        when(expenseTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        expenseDao.getAllExpenses(userId, statusList);

        // Assert
        verify(entityManager).createNamedQuery("postedExpenses", Expense.class);
    }

    @Test
    @DisplayName("Should use correct named query for expenses to match")
    void getExpensesToMatchUsesCorrectNamedQuery() {
        // Arrange
        Integer userId = 1;
        List<Integer> statusList = Arrays.asList(1, 2);
        BigDecimal amount = BigDecimal.valueOf(100);

        when(entityManager.createNamedQuery("getExpensesToMatch", Expense.class))
            .thenReturn(expenseTypedQuery);
        when(expenseTypedQuery.setParameter(anyString(), any()))
            .thenReturn(expenseTypedQuery);
        when(expenseTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        expenseDao.getExpensesToMatch(userId, statusList, amount);

        // Assert
        verify(entityManager).createNamedQuery("getExpensesToMatch", Expense.class);
    }

    private Expense createExpense(int id, BigDecimal amount, boolean deleteFlag) {
        Expense expense = new Expense();
        expense.setExpenseId(id);
        expense.setExpenseAmount(amount);
        expense.setDeleteFlag(deleteFlag);
        expense.setExpenseDate(LocalDateTime.now());
        expense.setReceiptNumber("REC-" + id);
        return expense;
    }

    private List<Expense> createExpenseList(int count) {
        List<Expense> expenses = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            expenses.add(createExpense(i + 1, BigDecimal.valueOf(100 * (i + 1)), false));
        }
        return expenses;
    }
}
