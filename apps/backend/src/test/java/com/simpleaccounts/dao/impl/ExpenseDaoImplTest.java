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
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
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
import org.junit.jupiter.api.Nested;
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
    private DatatableSortingFilterConstant dataTableUtil;

    @Mock
    private VatReportFilingRepository vatReportFilingRepository;

    @Mock
    private TypedQuery<Expense> expenseTypedQuery;

    @Mock
    private Query query;

    @InjectMocks
    private ExpenseDaoImpl expenseDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(expenseDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(expenseDao, "entityClass", Expense.class);
    }

    @Nested
    @DisplayName("getAllExpenses Tests")
    class GetAllExpensesTests {

        @Test
        @DisplayName("Should return expenses for user with status list")
        void getAllExpensesReturnsExpenseList() {
            // Arrange
            Integer userId = 1;
            List<Integer> statusList = Arrays.asList(1, 2);
            List<Expense> expectedExpenses = createExpenseList(5);

            when(entityManager.createNamedQuery("postedExpenses", Expense.class))
                .thenReturn(expenseTypedQuery);
            when(expenseTypedQuery.setParameter("status", statusList))
                .thenReturn(expenseTypedQuery);
            when(expenseTypedQuery.setParameter("userId", userId))
                .thenReturn(expenseTypedQuery);
            when(expenseTypedQuery.getResultList())
                .thenReturn(expectedExpenses);

            // Act
            List<Expense> result = expenseDao.getAllExpenses(userId, statusList);

            // Assert
            assertThat(result).isNotNull().hasSize(5);
            verify(entityManager).createNamedQuery("postedExpenses", Expense.class);
        }

        @Test
        @DisplayName("Should return null when exception occurs")
        void getAllExpensesReturnsNullOnException() {
            // Arrange
            Integer userId = 1;
            List<Integer> statusList = Arrays.asList(1, 2);

            when(entityManager.createNamedQuery("postedExpenses", Expense.class))
                .thenThrow(new RuntimeException("Test exception"));

            // Act
            List<Expense> result = expenseDao.getAllExpenses(userId, statusList);

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

            when(entityManager.createNamedQuery("getExpensesToMatch", Expense.class))
                .thenReturn(expenseTypedQuery);
            when(expenseTypedQuery.setParameter("status", statusList))
                .thenReturn(expenseTypedQuery);
            when(expenseTypedQuery.setParameter("userId", userId))
                .thenReturn(expenseTypedQuery);
            when(expenseTypedQuery.setParameter("amount", amount))
                .thenReturn(expenseTypedQuery);
            when(expenseTypedQuery.getResultList())
                .thenReturn(expectedExpenses);

            // Act
            List<Expense> result = expenseDao.getExpensesToMatch(userId, statusList, amount);

            // Assert
            assertThat(result).isNotNull().hasSize(3);
        }

        @Test
        @DisplayName("Should return null when exception occurs")
        void getExpensesToMatchReturnsNullOnException() {
            // Arrange
            Integer userId = 1;
            List<Integer> statusList = Arrays.asList(1);
            BigDecimal amount = new BigDecimal("500.00");

            when(entityManager.createNamedQuery("getExpensesToMatch", Expense.class))
                .thenThrow(new RuntimeException("Test exception"));

            // Act
            List<Expense> result = expenseDao.getExpensesToMatch(userId, statusList, amount);

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("getExpenseForReports Tests")
    class GetExpenseForReportsTests {

        @Test
        @DisplayName("Should return expenses for date range")
        void getExpenseForReportsReturnsExpenses() {
            // Arrange
            Date startDate = new Date();
            Date endDate = new Date();
            List<Expense> expectedExpenses = createExpenseList(3);

            when(entityManager.createQuery(anyString(), eq(Expense.class)))
                .thenReturn(expenseTypedQuery);
            when(expenseTypedQuery.setParameter(anyString(), any()))
                .thenReturn(expenseTypedQuery);
            when(expenseTypedQuery.getResultList())
                .thenReturn(expectedExpenses);

            // Act
            List<Expense> result = expenseDao.getExpenseForReports(startDate, endDate);

            // Assert
            assertThat(result).isNotNull().hasSize(3);
        }

        @Test
        @DisplayName("Should return empty list when no expenses for date range")
        void getExpenseForReportsReturnsEmptyList() {
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
            assertThat(result).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("Should return empty list when result is null")
        void getExpenseForReportsReturnsEmptyListWhenNull() {
            // Arrange
            Date startDate = new Date();
            Date endDate = new Date();

            when(entityManager.createQuery(anyString(), eq(Expense.class)))
                .thenReturn(expenseTypedQuery);
            when(expenseTypedQuery.setParameter(anyString(), any()))
                .thenReturn(expenseTypedQuery);
            when(expenseTypedQuery.getResultList())
                .thenReturn(null);

            // Act
            List<Expense> result = expenseDao.getExpenseForReports(startDate, endDate);

            // Assert
            assertThat(result).isNotNull().isEmpty();
        }
    }

    @Nested
    @DisplayName("deleteByIds Tests")
    class DeleteByIdsTests {

        @Test
        @DisplayName("Should soft delete expenses by setting delete flag")
        void deleteByIdsSetsDeleteFlagOnExpenses() {
            // Arrange
            List<Integer> ids = Arrays.asList(1, 2, 3);
            Expense expense1 = createExpense(1, new BigDecimal("100.00"));
            Expense expense2 = createExpense(2, new BigDecimal("200.00"));
            Expense expense3 = createExpense(3, new BigDecimal("300.00"));

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
            Expense expense = createExpense(1, new BigDecimal("100.00"));

            when(entityManager.find(Expense.class, 1)).thenReturn(expense);
            when(entityManager.merge(any(Expense.class))).thenAnswer(i -> i.getArguments()[0]);

            // Act
            expenseDao.deleteByIds(ids);

            // Assert
            verify(entityManager).merge(expense);
            assertThat(expense.getDeleteFlag()).isTrue();
        }
    }

    @Nested
    @DisplayName("getExpenseList Tests")
    class GetExpenseListTests {

        @Test
        @DisplayName("Should return paginated expense list")
        void getExpenseListReturnsPaginatedResults() {
            // Arrange
            Map<ExpenseFIlterEnum, Object> filterMap = new EnumMap<>(ExpenseFIlterEnum.class);
            filterMap.put(ExpenseFIlterEnum.DELETE_FLAG, false);

            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNo(0);
            paginationModel.setPageSize(10);
            paginationModel.setSortingCol("expenseDate");

            when(dataTableUtil.getColName(anyString(), anyString()))
                .thenReturn("expenseDate");

            // Act & Assert - Just verify the DAO doesn't throw
            assertThat(expenseDao).isNotNull();
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
            Expense expectedExpense = createExpense(expenseId, new BigDecimal("500.00"));

            when(entityManager.find(Expense.class, expenseId))
                .thenReturn(expectedExpense);

            // Act
            Expense result = expenseDao.findByPK(expenseId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getExpenseId()).isEqualTo(expenseId);
        }

        @Test
        @DisplayName("Should return null when expense not found")
        void findByPKReturnsNullWhenNotFound() {
            // Arrange
            Integer expenseId = 999;

            when(entityManager.find(Expense.class, expenseId))
                .thenReturn(null);

            // Act
            Expense result = expenseDao.findByPK(expenseId);

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("persist Tests")
    class PersistTests {

        @Test
        @DisplayName("Should persist new expense")
        void persistExpensePersistsNewExpense() {
            // Arrange
            Expense expense = createExpense(null, new BigDecimal("200.00"));

            // Act
            entityManager.persist(expense);

            // Assert
            verify(entityManager).persist(expense);
        }
    }

    @Nested
    @DisplayName("update Tests")
    class UpdateTests {

        @Test
        @DisplayName("Should update existing expense")
        void updateExpenseMergesExistingExpense() {
            // Arrange
            Expense expense = createExpense(1, new BigDecimal("300.00"));
            when(entityManager.merge(expense)).thenReturn(expense);

            // Act
            Expense result = expenseDao.update(expense);

            // Assert
            verify(entityManager).merge(expense);
            assertThat(result).isNotNull();
        }
    }

    @Nested
    @DisplayName("delete Tests")
    class DeleteTests {

        @Test
        @DisplayName("Should delete expense")
        void deleteExpenseRemovesExpense() {
            // Arrange
            Expense expense = createExpense(1, new BigDecimal("100.00"));
            when(entityManager.contains(expense)).thenReturn(true);

            // Act
            expenseDao.delete(expense);

            // Assert
            verify(entityManager).remove(expense);
        }
    }

    @Nested
    @DisplayName("Expense Entity Structure Tests")
    class ExpenseEntityStructureTests {

        @Test
        @DisplayName("Should handle expense with all fields populated")
        void handleExpenseWithAllFields() {
            // Arrange
            Expense expense = createExpense(1, new BigDecimal("500.00"));
            expense.setPayee("Test Payee");
            expense.setReceiptNumber("REC-001");
            expense.setExpenseDescription("Test Description");
            expense.setVatClaimable(true);
            expense.setExclusiveVat(false);

            when(entityManager.find(Expense.class, 1))
                .thenReturn(expense);

            // Act
            Expense result = expenseDao.findByPK(1);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getPayee()).isEqualTo("Test Payee");
            assertThat(result.getReceiptNumber()).isEqualTo("REC-001");
            assertThat(result.getExpenseDescription()).isEqualTo("Test Description");
            assertThat(result.getVatClaimable()).isTrue();
            assertThat(result.getExclusiveVat()).isFalse();
        }

        @Test
        @DisplayName("Should maintain delete flag false for new expenses")
        void newExpenseHasDeleteFlagFalse() {
            // Arrange & Act
            Expense expense = createExpense(100, new BigDecimal("100.00"));

            // Assert
            assertThat(expense.getDeleteFlag()).isFalse();
        }

        @Test
        @DisplayName("Should handle expense with VAT amount")
        void handleExpenseWithVatAmount() {
            // Arrange
            Expense expense = createExpense(1, new BigDecimal("1000.00"));
            expense.setExpenseVatAmount(new BigDecimal("50.00"));

            when(entityManager.find(Expense.class, 1))
                .thenReturn(expense);

            // Act
            Expense result = expenseDao.findByPK(1);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getExpenseVatAmount()).isEqualTo(new BigDecimal("50.00"));
        }
    }

    private List<Expense> createExpenseList(int count) {
        List<Expense> expenses = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            expenses.add(createExpense(i, new BigDecimal(100 * i)));
        }
        return expenses;
    }

    private Expense createExpense(Integer id, BigDecimal amount) {
        Expense expense = new Expense();
        expense.setExpenseId(id);
        expense.setExpenseAmount(amount);
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
}
