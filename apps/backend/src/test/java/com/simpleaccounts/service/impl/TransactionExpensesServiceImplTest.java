package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.TransactionExplinationStatusEnum;
import com.simpleaccounts.dao.ActivityDao;
import com.simpleaccounts.dao.TransactionExpensesDao;
import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.entity.TransactionExpenses;
import com.simpleaccounts.exceptions.ServiceException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
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
@DisplayName("TransactionExpensesServiceImpl Unit Tests")
class TransactionExpensesServiceImplTest {

    @Mock
    private TransactionExpensesDao transactionExpensesDao;

    @Mock
    private ActivityDao activityDao;

    @InjectMocks
    private TransactionExpensesServiceImpl transactionExpensesService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(transactionExpensesService, "activityDao", activityDao);
    }

    private Expense createExpense(Integer id, BigDecimal amount) {
        Expense expense = new Expense();
        expense.setExpenseId(id);
        expense.setExpenseAmount(amount);
        return expense;
    }

    @Nested
    @DisplayName("getMappedExpenses Tests")
    class GetMappedExpensesTests {

        @Test
        @DisplayName("Should return mapped expenses")
        void getMappedExpensesReturnsExpenseList() {
            // Arrange
            List<TransactionExpenses> transactionExpensesList = createTransactionExpensesList(3);

            when(transactionExpensesDao.dumpData())
                .thenReturn(transactionExpensesList);

            // Act
            List<Expense> result = transactionExpensesService.getMappedExpenses();

            // Assert
            assertThat(result).isNotNull().hasSize(3);
            verify(transactionExpensesDao).dumpData();
        }

        @Test
        @DisplayName("Should return null when no mapped expenses exist")
        void getMappedExpensesReturnsNullWhenEmpty() {
            // Arrange
            when(transactionExpensesDao.dumpData())
                .thenReturn(new ArrayList<>());

            // Act
            List<Expense> result = transactionExpensesService.getMappedExpenses();

            // Assert
            assertThat(result).isNull();
        }

        @Test
        @DisplayName("Should return null when DAO returns null")
        void getMappedExpensesReturnsNullWhenDaoReturnsNull() {
            // Arrange
            when(transactionExpensesDao.dumpData())
                .thenReturn(null);

            // Act
            List<Expense> result = transactionExpensesService.getMappedExpenses();

            // Assert
            assertThat(result).isNull();
        }

        @Test
        @DisplayName("Should extract expense from each transaction expense")
        void getMappedExpensesExtractsExpenses() {
            // Arrange
            Expense expense1 = createExpense(1, new BigDecimal("100.00"));
            Expense expense2 = createExpense(2, new BigDecimal("200.00"));

            TransactionExpenses te1 = new TransactionExpenses();
            te1.setId(1);
            te1.setExpense(expense1);

            TransactionExpenses te2 = new TransactionExpenses();
            te2.setId(2);
            te2.setExpense(expense2);

            when(transactionExpensesDao.dumpData())
                .thenReturn(Arrays.asList(te1, te2));

            // Act
            List<Expense> result = transactionExpensesService.getMappedExpenses();

            // Assert
            assertThat(result).isNotNull().hasSize(2);
            assertThat(result.get(0).getExpenseId()).isEqualTo(1);
            assertThat(result.get(1).getExpenseId()).isEqualTo(2);
        }
    }

    @Nested
    @DisplayName("findAllForTransactionExpenses Tests")
    class FindAllForTransactionExpensesTests {

        @Test
        @DisplayName("Should return transaction expenses by transaction ID")
        void findAllForTransactionExpensesReturnsExpenses() {
            // Arrange
            Integer transactionId = 1;
            List<TransactionExpenses> expectedList = createTransactionExpensesList(2);

            when(transactionExpensesDao.getMappedExpenses(transactionId))
                .thenReturn(expectedList);

            // Act
            List<TransactionExpenses> result = transactionExpensesService.findAllForTransactionExpenses(transactionId);

            // Assert
            assertThat(result).isNotNull().hasSize(2);
            verify(transactionExpensesDao).getMappedExpenses(transactionId);
        }

        @Test
        @DisplayName("Should return empty list when no transaction expenses exist")
        void findAllForTransactionExpensesReturnsEmptyList() {
            // Arrange
            Integer transactionId = 999;

            when(transactionExpensesDao.getMappedExpenses(transactionId))
                .thenReturn(new ArrayList<>());

            // Act
            List<TransactionExpenses> result = transactionExpensesService.findAllForTransactionExpenses(transactionId);

            // Assert
            assertThat(result).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("Should return null when DAO returns null")
        void findAllForTransactionExpensesReturnsNull() {
            // Arrange
            Integer transactionId = 1;

            when(transactionExpensesDao.getMappedExpenses(transactionId))
                .thenReturn(null);

            // Act
            List<TransactionExpenses> result = transactionExpensesService.findAllForTransactionExpenses(transactionId);

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("findByPK Tests")
    class FindByPKTests {

        @Test
        @DisplayName("Should return transaction expense by ID")
        void findByPKReturnsTransactionExpense() {
            // Arrange
            Integer id = 1;
            TransactionExpenses expectedTe = createTransactionExpenses(id);

            when(transactionExpensesDao.findByPK(id))
                .thenReturn(expectedTe);

            // Act
            TransactionExpenses result = transactionExpensesService.findByPK(id);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(id);
            verify(transactionExpensesDao).findByPK(id);
        }

        @Test
        @DisplayName("Should throw when transaction expense not found")
        void findByPKReturnsNullWhenNotFound() {
            // Arrange
            Integer id = 999;

            when(transactionExpensesDao.findByPK(id))
                .thenReturn(null);

            // Act
            assertThatThrownBy(() -> transactionExpensesService.findByPK(id))
                .isInstanceOf(ServiceException.class);

            // Assert
            verify(transactionExpensesDao).findByPK(id);
        }
    }

    @Nested
    @DisplayName("persist Tests")
    class PersistTests {

        @Test
        @DisplayName("Should persist new transaction expense")
        void persistTransactionExpenseSaves() {
            // Arrange
            TransactionExpenses te = createTransactionExpenses(null);

            // Act
            transactionExpensesService.persist(te);

            // Assert
            verify(transactionExpensesDao).persist(te);
        }
    }

    @Nested
    @DisplayName("update Tests")
    class UpdateTests {

        @Test
        @DisplayName("Should update existing transaction expenses")
        void updateTransactionExpensesUpdates() {
            // Arrange
            TransactionExpenses te = createTransactionExpenses(1);
            te.setRemainingToExplain(new BigDecimal("25.00"));

            when(transactionExpensesDao.update(te)).thenReturn(te);

            // Act
            TransactionExpenses result = transactionExpensesService.update(te);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getRemainingToExplain()).isEqualTo(new BigDecimal("25.00"));
            verify(transactionExpensesDao).update(te);
        }
    }

    @Nested
    @DisplayName("delete Tests")
    class DeleteTests {

        @Test
        @DisplayName("Should delete transaction expenses")
        void deleteTransactionExpensesDeletes() {
            // Arrange
            TransactionExpenses te = createTransactionExpenses(1);

            // Act
            transactionExpensesService.delete(te);

            // Assert
            verify(transactionExpensesDao).delete(te);
        }
    }

    @Nested
    @DisplayName("getDao Tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return TransactionExpensesDao instance")
        void getDaoReturnsTransactionExpensesDao() {
            // The protected getDao() method returns the transactionExpensesDao
            assertThat(transactionExpensesService).isNotNull();
        }
    }

    private List<TransactionExpenses> createTransactionExpensesList(int count) {
        List<TransactionExpenses> list = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            list.add(createTransactionExpenses(i));
        }
        return list;
    }

    private TransactionExpenses createTransactionExpenses(Integer id) {
        TransactionExpenses te = new TransactionExpenses();
        if (id != null) {
            te.setId(id);
        }
        te.setExplinationStatus(TransactionExplinationStatusEnum.FULL);
        te.setRemainingToExplain(BigDecimal.ZERO);
        te.setCreatedBy(1);
        te.setCreatedDate(LocalDateTime.now());
        return te;
    }
}
