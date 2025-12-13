package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.constant.dbfilter.ExpenseFIlterEnum;
import com.simpleaccounts.dao.CompanyDao;
import com.simpleaccounts.dao.ExpenseDao;
import com.simpleaccounts.dao.ProjectDao;
import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.model.VatReportResponseModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simpleaccounts.service.TransactionExpensesService;
import com.simpleaccounts.service.report.model.BankAccountTransactionReportModel;
import com.simpleaccounts.utils.ChartUtil;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("ExpenseServiceImpl Unit Tests")
class ExpenseServiceImplTest {

    @Mock
    private ExpenseDao expenseDao;

    @Mock
    private ProjectDao projectDao;

    @Mock
    private CompanyDao companyDao;

    @Mock
    private ChartUtil util;

    @Mock
    private TransactionExpensesService transactionExpensesService;

    @InjectMocks
    private ExpenseServiceImpl expenseService;

    @Nested
    @DisplayName("getExpenses Tests")
    class GetExpensesTests {

        @Test
        @DisplayName("Should return expenses for user with status list")
        void getExpensesReturnsExpenseList() {
            // Arrange
            Integer userId = 1;
            List<Integer> statusList = Arrays.asList(1, 2);
            List<Expense> expectedExpenses = createExpenseList(5);

            when(expenseDao.getAllExpenses(userId, statusList))
                .thenReturn(expectedExpenses);

            // Act
            List<Expense> result = expenseService.getExpenses(userId, statusList);

            // Assert
            assertThat(result).isNotNull().hasSize(5);
            verify(expenseDao).getAllExpenses(userId, statusList);
        }

        @Test
        @DisplayName("Should return empty list when no expenses exist")
        void getExpensesReturnsEmptyList() {
            // Arrange
            Integer userId = 1;
            List<Integer> statusList = Arrays.asList(1);

            when(expenseDao.getAllExpenses(userId, statusList))
                .thenReturn(new ArrayList<>());

            // Act
            List<Expense> result = expenseService.getExpenses(userId, statusList);

            // Assert
            assertThat(result).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("Should return null when DAO returns null")
        void getExpensesReturnsNull() {
            // Arrange
            Integer userId = 1;
            List<Integer> statusList = Arrays.asList(1);

            when(expenseDao.getAllExpenses(userId, statusList))
                .thenReturn(null);

            // Act
            List<Expense> result = expenseService.getExpenses(userId, statusList);

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("getExpensesToMatch Tests")
    class GetExpensesToMatchTests {

        @Test
        @DisplayName("Should return expenses matching amount")
        void getExpensesToMatchReturnsExpenses() {
            // Arrange
            Integer userId = 1;
            List<Integer> statusList = Arrays.asList(CommonStatusEnum.POST.getValue());
            BigDecimal amount = new BigDecimal("1000.00");
            List<Expense> expectedExpenses = createExpenseList(3);

            when(expenseDao.getExpensesToMatch(userId, statusList, amount))
                .thenReturn(expectedExpenses);

            // Act
            List<Expense> result = expenseService.getExpensesToMatch(userId, statusList, amount);

            // Assert
            assertThat(result).isNotNull().hasSize(3);
            verify(expenseDao).getExpensesToMatch(userId, statusList, amount);
        }
    }

    @Nested
    @DisplayName("updateOrCreateExpense Tests")
    class UpdateOrCreateExpenseTests {

        @Test
        @DisplayName("Should update existing expense")
        void updateOrCreateExpenseUpdates() {
            // Arrange
            Expense expense = createExpense(1, new BigDecimal("500.00"), "Test Expense");

            when(expenseDao.update(expense)).thenReturn(expense);

            // Act
            Expense result = expenseService.updateOrCreateExpense(expense);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getExpenseAmount()).isEqualTo(new BigDecimal("500.00"));
            verify(expenseDao).update(expense);
        }
    }

    @Nested
    @DisplayName("getExpensesForReport Tests")
    class GetExpensesForReportTests {

        @Test
        @DisplayName("Should return expenses for report with date range")
        void getExpensesForReportReturnsExpenses() {
            // Arrange
            Date startDate = new Date();
            Date endDate = new Date();
            List<Object[]> rows = new ArrayList<>();
            List<BankAccountTransactionReportModel> expectedModels = createReportModels(3);

            when(expenseDao.getExpenses(startDate, endDate)).thenReturn(rows);
            when(util.convertToTransactionReportModel(rows)).thenReturn(expectedModels);

            // Act
            List<BankAccountTransactionReportModel> result = expenseService.getExpensesForReport(startDate, endDate);

            // Assert
            assertThat(result).isNotNull().hasSize(3);
            verify(expenseDao).getExpenses(startDate, endDate);
        }

        @Test
        @DisplayName("Should return empty list when no expenses for date range")
        void getExpensesForReportReturnsEmptyList() {
            // Arrange
            Date startDate = new Date();
            Date endDate = new Date();

            when(expenseDao.getExpenses(startDate, endDate)).thenReturn(new ArrayList<>());
            when(util.convertToTransactionReportModel(any())).thenReturn(null);

            // Act
            List<BankAccountTransactionReportModel> result = expenseService.getExpensesForReport(startDate, endDate);

            // Assert
            assertThat(result).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("Should set credit flag to false for all expenses")
        void getExpensesForReportSetsCreditFlagFalse() {
            // Arrange
            Date startDate = new Date();
            Date endDate = new Date();
            List<Object[]> rows = new ArrayList<>();
            List<BankAccountTransactionReportModel> models = createReportModels(2);

            when(expenseDao.getExpenses(startDate, endDate)).thenReturn(rows);
            when(util.convertToTransactionReportModel(rows)).thenReturn(models);

            // Act
            List<BankAccountTransactionReportModel> result = expenseService.getExpensesForReport(startDate, endDate);

            // Assert
            assertThat(result).allSatisfy(model -> assertThat(model.isCredit()).isFalse());
        }
    }

    @Nested
    @DisplayName("deleteByIds Tests")
    class DeleteByIdsTests {

        @Test
        @DisplayName("Should delete expenses by IDs")
        void deleteByIdsDeletesExpenses() {
            // Arrange
            List<Integer> ids = Arrays.asList(1, 2, 3);

            // Act
            expenseService.deleteByIds(ids);

            // Assert
            verify(expenseDao).deleteByIds(ids);
        }

        @Test
        @DisplayName("Should handle empty ID list")
        void deleteByIdsHandlesEmptyList() {
            // Arrange
            List<Integer> ids = new ArrayList<>();

            // Act
            expenseService.deleteByIds(ids);

            // Assert
            verify(expenseDao).deleteByIds(ids);
        }
    }

    @Nested
    @DisplayName("getExpensesList Tests")
    class GetExpensesListTests {

        @Test
        @DisplayName("Should return paginated expense list")
        void getExpensesListReturnsPaginatedResults() {
            // Arrange
            Map<ExpenseFIlterEnum, Object> filterMap = new EnumMap<>(ExpenseFIlterEnum.class);
            filterMap.put(ExpenseFIlterEnum.DELETE_FLAG, false);
            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNo(0);
            paginationModel.setPageSize(10);

            List<Expense> expenses = createExpenseList(5);
            PaginationResponseModel expectedResponse = new PaginationResponseModel(5, expenses);

            when(expenseDao.getExpenseList(filterMap, paginationModel))
                .thenReturn(expectedResponse);

            // Act
            PaginationResponseModel result = expenseService.getExpensesList(filterMap, paginationModel);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(5);
            verify(expenseDao).getExpenseList(filterMap, paginationModel);
        }
    }

    @Nested
    @DisplayName("getUnMappedExpenses Tests")
    class GetUnMappedExpensesTests {

        @Test
        @DisplayName("Should return unmapped expenses")
        void getUnMappedExpensesReturnsExpenses() {
            // Arrange
            Integer userId = 1;
            BigDecimal amount = new BigDecimal("500.00");
            List<Expense> expectedExpenses = createExpenseList(3);

            when(expenseDao.getExpensesToMatch(userId, Arrays.asList(CommonStatusEnum.POST.getValue()), amount))
                .thenReturn(expectedExpenses);

            // Act
            List<Expense> result = expenseService.getUnMappedExpenses(userId, amount);

            // Assert
            assertThat(result).isNotNull().hasSize(3);
        }
    }

    @Nested
    @DisplayName("sumOfTotalExpensesWithVat Tests")
    class SumOfTotalExpensesWithVatTests {

        @Test
        @DisplayName("Should calculate sum of expenses with VAT")
        void sumOfTotalExpensesWithVatCalculatesSum() {
            // Arrange
            ReportRequestModel reportRequestModel = new ReportRequestModel();
            reportRequestModel.setStartDate("01/01/2024");
            reportRequestModel.setEndDate("31/12/2024");
            VatReportResponseModel vatReportResponseModel = new VatReportResponseModel();

            // Act
            expenseService.sumOfTotalExpensesWithVat(reportRequestModel, vatReportResponseModel);

            // Assert
            verify(expenseDao).sumOfTotalExpensesWithVat(reportRequestModel, vatReportResponseModel);
        }
    }

    @Nested
    @DisplayName("findByPK Tests")
    class FindByPKTests {

        @Test
        @DisplayName("Should return expense by ID")
        void findByPKReturnsExpense() {
            // Arrange
            Integer expenseId = 1;
            Expense expectedExpense = createExpense(expenseId, new BigDecimal("100.00"), "Test");

            when(expenseDao.findByPK(expenseId))
                .thenReturn(expectedExpense);

            // Act
            Expense result = expenseService.findByPK(expenseId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getExpenseId()).isEqualTo(expenseId);
            verify(expenseDao).findByPK(expenseId);
        }

        @Test
        @DisplayName("Should return null when expense not found")
        void findByPKReturnsNullWhenNotFound() {
            // Arrange
            Integer expenseId = 999;

            when(expenseDao.findByPK(expenseId))
                .thenReturn(null);

            // Act
            Expense result = expenseService.findByPK(expenseId);

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("persist Tests")
    class PersistTests {

        @Test
        @DisplayName("Should persist new expense")
        void persistExpenseSaves() {
            // Arrange
            Expense expense = createExpense(null, new BigDecimal("200.00"), "New Expense");

            // Act
            expenseService.persist(expense);

            // Assert
            verify(expenseDao).persist(expense);
        }
    }

    @Nested
    @DisplayName("update Tests")
    class UpdateTests {

        @Test
        @DisplayName("Should update existing expense")
        void updateExpenseUpdates() {
            // Arrange
            Expense expense = createExpense(1, new BigDecimal("300.00"), "Updated Expense");

            when(expenseDao.update(expense)).thenReturn(expense);

            // Act
            Expense result = expenseService.update(expense);

            // Assert
            assertThat(result).isNotNull();
            verify(expenseDao).update(expense);
        }
    }

    private List<Expense> createExpenseList(int count) {
        List<Expense> expenses = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            expenses.add(createExpense(i, new BigDecimal(100 * i), "Expense " + i));
        }
        return expenses;
    }

    private Expense createExpense(Integer id, BigDecimal amount, String description) {
        Expense expense = new Expense();
        expense.setExpenseId(id);
        expense.setExpenseAmount(amount);
        expense.setExpenseDescription(description);
        expense.setExpenseNumber("EXP-" + id);
        expense.setExpenseDate(LocalDate.now());
        expense.setExpenseVatAmount(amount.multiply(new BigDecimal("0.05")));
        expense.setExchangeRate(BigDecimal.ONE);
        expense.setDeleteFlag(false);
        expense.setVatClaimable(true);
        expense.setExclusiveVat(false);
        expense.setStatus(CommonStatusEnum.POST.getValue());
        expense.setCreatedBy(1);
        expense.setCreatedDate(LocalDateTime.now());
        expense.setVersionNumber(1);
        return expense;
    }

    private List<BankAccountTransactionReportModel> createReportModels(int count) {
        List<BankAccountTransactionReportModel> models = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            BankAccountTransactionReportModel model = new BankAccountTransactionReportModel();
            model.setAmount(new BigDecimal(100 * i));
            model.setCredit(true);
            models.add(model);
        }
        return models;
    }
}
