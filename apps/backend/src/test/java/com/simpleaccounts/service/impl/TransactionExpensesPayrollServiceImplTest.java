package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.TransactionExpensesPayrollDao;
import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.entity.TransactionExpensesPayroll;
import com.simpleaccounts.exceptions.ServiceException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("TransactionExpensesPayrollServiceImpl Tests")
class TransactionExpensesPayrollServiceImplTest {

    @Mock
    private TransactionExpensesPayrollDao transactionExpensesPayrollDao;

    @InjectMocks
    private TransactionExpensesPayrollServiceImpl transactionExpensesPayrollService;

    private TransactionExpensesPayroll testTransactionExpense;
    private Expense testExpense;
    private Integer transactionExpenseId;

    @BeforeEach
    void setUp() {
        transactionExpenseId = 1;

        testExpense = new Expense();
        testExpense.setExpenseId(100);
        testExpense.setExpenseName("Salary Expense");
        testExpense.setExpenseCode("EXP001");

        testTransactionExpense = new TransactionExpensesPayroll();
        testTransactionExpense.setId(transactionExpenseId);
        testTransactionExpense.setExpense(testExpense);
        testTransactionExpense.setTransactionId(500);
        testTransactionExpense.setCreatedBy(1);
        testTransactionExpense.setCreatedDate(LocalDateTime.now());
    }

    @Nested
    @DisplayName("getDao() Tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return TransactionExpensesPayrollDao instance")
        void shouldReturnTransactionExpensesPayrollDao() {
            assertThat(transactionExpensesPayrollService.getDao()).isEqualTo(transactionExpensesPayrollDao);
        }

        @Test
        @DisplayName("Should not return null")
        void shouldNotReturnNull() {
            assertThat(transactionExpensesPayrollService.getDao()).isNotNull();
        }

        @Test
        @DisplayName("Should return same instance on multiple calls")
        void shouldReturnSameInstanceOnMultipleCalls() {
            var dao1 = transactionExpensesPayrollService.getDao();
            var dao2 = transactionExpensesPayrollService.getDao();

            assertThat(dao1).isSameAs(dao2);
            assertThat(dao1).isEqualTo(transactionExpensesPayrollDao);
        }
    }

    @Nested
    @DisplayName("getMappedExpenses() Tests")
    class GetMappedExpensesTests {

        @Test
        @DisplayName("Should return list of expenses when transaction expenses exist")
        void shouldReturnListOfExpensesWhenTransactionExpensesExist() {
            List<TransactionExpensesPayroll> transactionExpensesList = Arrays.asList(
                testTransactionExpense,
                createTransactionExpense(2, 101, "Bonus"),
                createTransactionExpense(3, 102, "Overtime")
            );

            when(transactionExpensesPayrollDao.dumpData()).thenReturn(transactionExpensesList);

            List<Expense> result = transactionExpensesPayrollService.getMappedExpenses();

            assertThat(result).isNotNull();
            assertThat(result).hasSize(3);
            assertThat(result.get(0).getExpenseId()).isEqualTo(100);
            assertThat(result.get(1).getExpenseId()).isEqualTo(101);
            assertThat(result.get(2).getExpenseId()).isEqualTo(102);
            verify(transactionExpensesPayrollDao, times(1)).dumpData();
        }

        @Test
        @DisplayName("Should return null when transaction expenses list is null")
        void shouldReturnNullWhenTransactionExpensesListIsNull() {
            when(transactionExpensesPayrollDao.dumpData()).thenReturn(null);

            List<Expense> result = transactionExpensesPayrollService.getMappedExpenses();

            assertThat(result).isNull();
            verify(transactionExpensesPayrollDao, times(1)).dumpData();
        }

        @Test
        @DisplayName("Should return null when transaction expenses list is empty")
        void shouldReturnNullWhenTransactionExpensesListIsEmpty() {
            when(transactionExpensesPayrollDao.dumpData()).thenReturn(Collections.emptyList());

            List<Expense> result = transactionExpensesPayrollService.getMappedExpenses();

            assertThat(result).isNull();
            verify(transactionExpensesPayrollDao, times(1)).dumpData();
        }

        @Test
        @DisplayName("Should return single expense when only one transaction expense exists")
        void shouldReturnSingleExpenseWhenOnlyOneTransactionExpenseExists() {
            List<TransactionExpensesPayroll> singleList = Collections.singletonList(testTransactionExpense);

            when(transactionExpensesPayrollDao.dumpData()).thenReturn(singleList);

            List<Expense> result = transactionExpensesPayrollService.getMappedExpenses();

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            assertThat(result.get(0)).isEqualTo(testExpense);
            verify(transactionExpensesPayrollDao, times(1)).dumpData();
        }

        @Test
        @DisplayName("Should handle large number of transaction expenses")
        void shouldHandleLargeNumberOfTransactionExpenses() {
            List<TransactionExpensesPayroll> largeList = new ArrayList<>();
            for (int i = 0; i < 100; i++) {
                largeList.add(createTransactionExpense(i, 100 + i, "Expense " + i));
            }

            when(transactionExpensesPayrollDao.dumpData()).thenReturn(largeList);

            List<Expense> result = transactionExpensesPayrollService.getMappedExpenses();

            assertThat(result).isNotNull();
            assertThat(result).hasSize(100);
            assertThat(result.get(0).getExpenseId()).isEqualTo(100);
            assertThat(result.get(99).getExpenseId()).isEqualTo(199);
            verify(transactionExpensesPayrollDao, times(1)).dumpData();
        }

        @Test
        @DisplayName("Should extract expenses correctly maintaining order")
        void shouldExtractExpensesCorrectlyMaintainingOrder() {
            List<TransactionExpensesPayroll> orderedList = Arrays.asList(
                createTransactionExpense(1, 101, "First"),
                createTransactionExpense(2, 102, "Second"),
                createTransactionExpense(3, 103, "Third")
            );

            when(transactionExpensesPayrollDao.dumpData()).thenReturn(orderedList);

            List<Expense> result = transactionExpensesPayrollService.getMappedExpenses();

            assertThat(result).isNotNull();
            assertThat(result).hasSize(3);
            assertThat(result.get(0).getExpenseName()).isEqualTo("First");
            assertThat(result.get(1).getExpenseName()).isEqualTo("Second");
            assertThat(result.get(2).getExpenseName()).isEqualTo("Third");
        }

        @Test
        @DisplayName("Should handle transaction expenses with null expense objects")
        void shouldHandleTransactionExpensesWithNullExpenseObjects() {
            TransactionExpensesPayroll expenseWithNull = new TransactionExpensesPayroll();
            expenseWithNull.setId(5);
            expenseWithNull.setExpense(null);

            List<TransactionExpensesPayroll> listWithNull = Collections.singletonList(expenseWithNull);
            when(transactionExpensesPayrollDao.dumpData()).thenReturn(listWithNull);

            List<Expense> result = transactionExpensesPayrollService.getMappedExpenses();

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            assertThat(result.get(0)).isNull();
        }
    }

    @Nested
    @DisplayName("findAllForTransactionExpenses() Tests")
    class FindAllForTransactionExpensesTests {

        @Test
        @DisplayName("Should find all expenses for given transaction ID")
        void shouldFindAllExpensesForGivenTransactionId() {
            Integer transactionId = 500;
            List<TransactionExpensesPayroll> expectedList = Arrays.asList(
                testTransactionExpense,
                createTransactionExpense(2, 101, "Expense 2")
            );

            when(transactionExpensesPayrollDao.getMappedExpenses(transactionId)).thenReturn(expectedList);

            List<TransactionExpensesPayroll> result =
                transactionExpensesPayrollService.findAllForTransactionExpenses(transactionId);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(2);
            assertThat(result).isEqualTo(expectedList);
            verify(transactionExpensesPayrollDao, times(1)).getMappedExpenses(transactionId);
        }

        @Test
        @DisplayName("Should return empty list when no expenses found for transaction ID")
        void shouldReturnEmptyListWhenNoExpensesFoundForTransactionId() {
            Integer transactionId = 999;

            when(transactionExpensesPayrollDao.getMappedExpenses(transactionId))
                .thenReturn(Collections.emptyList());

            List<TransactionExpensesPayroll> result =
                transactionExpensesPayrollService.findAllForTransactionExpenses(transactionId);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(transactionExpensesPayrollDao, times(1)).getMappedExpenses(transactionId);
        }

        @Test
        @DisplayName("Should return null when transaction ID returns null")
        void shouldReturnNullWhenTransactionIdReturnsNull() {
            Integer transactionId = 123;

            when(transactionExpensesPayrollDao.getMappedExpenses(transactionId)).thenReturn(null);

            List<TransactionExpensesPayroll> result =
                transactionExpensesPayrollService.findAllForTransactionExpenses(transactionId);

            assertThat(result).isNull();
            verify(transactionExpensesPayrollDao, times(1)).getMappedExpenses(transactionId);
        }

        @Test
        @DisplayName("Should handle null transaction ID")
        void shouldHandleNullTransactionId() {
            when(transactionExpensesPayrollDao.getMappedExpenses(null)).thenReturn(Collections.emptyList());

            List<TransactionExpensesPayroll> result =
                transactionExpensesPayrollService.findAllForTransactionExpenses(null);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(transactionExpensesPayrollDao, times(1)).getMappedExpenses(null);
        }

        @Test
        @DisplayName("Should handle zero transaction ID")
        void shouldHandleZeroTransactionId() {
            Integer zeroId = 0;

            when(transactionExpensesPayrollDao.getMappedExpenses(zeroId)).thenReturn(Collections.emptyList());

            List<TransactionExpensesPayroll> result =
                transactionExpensesPayrollService.findAllForTransactionExpenses(zeroId);

            assertThat(result).isNotNull();
            verify(transactionExpensesPayrollDao, times(1)).getMappedExpenses(zeroId);
        }

        @Test
        @DisplayName("Should handle negative transaction ID")
        void shouldHandleNegativeTransactionId() {
            Integer negativeId = -1;

            when(transactionExpensesPayrollDao.getMappedExpenses(negativeId))
                .thenReturn(Collections.emptyList());

            List<TransactionExpensesPayroll> result =
                transactionExpensesPayrollService.findAllForTransactionExpenses(negativeId);

            assertThat(result).isNotNull();
            verify(transactionExpensesPayrollDao, times(1)).getMappedExpenses(negativeId);
        }

        @Test
        @DisplayName("Should return single expense for transaction with one expense")
        void shouldReturnSingleExpenseForTransactionWithOneExpense() {
            Integer transactionId = 100;
            List<TransactionExpensesPayroll> singleList = Collections.singletonList(testTransactionExpense);

            when(transactionExpensesPayrollDao.getMappedExpenses(transactionId)).thenReturn(singleList);

            List<TransactionExpensesPayroll> result =
                transactionExpensesPayrollService.findAllForTransactionExpenses(transactionId);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            assertThat(result.get(0)).isEqualTo(testTransactionExpense);
        }

        @Test
        @DisplayName("Should return multiple expenses for transaction with many expenses")
        void shouldReturnMultipleExpensesForTransactionWithManyExpenses() {
            Integer transactionId = 200;
            List<TransactionExpensesPayroll> multipleExpenses = new ArrayList<>();
            for (int i = 0; i < 10; i++) {
                multipleExpenses.add(createTransactionExpense(i, 100 + i, "Expense " + i));
            }

            when(transactionExpensesPayrollDao.getMappedExpenses(transactionId)).thenReturn(multipleExpenses);

            List<TransactionExpensesPayroll> result =
                transactionExpensesPayrollService.findAllForTransactionExpenses(transactionId);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(10);
        }
    }

    @Nested
    @DisplayName("Inherited CRUD Operation Tests")
    class InheritedCrudOperationTests {

        @Test
        @DisplayName("Should find transaction expense by primary key")
        void shouldFindTransactionExpenseByPrimaryKey() {
            when(transactionExpensesPayrollDao.findByPK(transactionExpenseId)).thenReturn(testTransactionExpense);

            TransactionExpensesPayroll result = transactionExpensesPayrollService.findByPK(transactionExpenseId);

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(testTransactionExpense);
            assertThat(result.getId()).isEqualTo(transactionExpenseId);
            verify(transactionExpensesPayrollDao, times(1)).findByPK(transactionExpenseId);
        }

        @Test
        @DisplayName("Should throw exception when transaction expense not found by PK")
        void shouldThrowExceptionWhenTransactionExpenseNotFoundByPK() {
            when(transactionExpensesPayrollDao.findByPK(999)).thenReturn(null);

            assertThatThrownBy(() -> transactionExpensesPayrollService.findByPK(999))
                    .isInstanceOf(ServiceException.class);

            verify(transactionExpensesPayrollDao, times(1)).findByPK(999);
        }

        @Test
        @DisplayName("Should persist new transaction expense")
        void shouldPersistNewTransactionExpense() {
            transactionExpensesPayrollService.persist(testTransactionExpense);

            verify(transactionExpensesPayrollDao, times(1)).persist(testTransactionExpense);
        }

        @Test
        @DisplayName("Should update existing transaction expense")
        void shouldUpdateExistingTransactionExpense() {
            when(transactionExpensesPayrollDao.update(testTransactionExpense)).thenReturn(testTransactionExpense);

            TransactionExpensesPayroll result = transactionExpensesPayrollService.update(testTransactionExpense);

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(testTransactionExpense);
            verify(transactionExpensesPayrollDao, times(1)).update(testTransactionExpense);
        }

        @Test
        @DisplayName("Should delete transaction expense")
        void shouldDeleteTransactionExpense() {
            transactionExpensesPayrollService.delete(testTransactionExpense);

            verify(transactionExpensesPayrollDao, times(1)).delete(testTransactionExpense);
        }

        @Test
        @DisplayName("Should find transaction expenses by attributes")
        void shouldFindTransactionExpensesByAttributes() {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("transactionId", 500);

            List<TransactionExpensesPayroll> expectedList = Arrays.asList(testTransactionExpense);
            when(transactionExpensesPayrollDao.findByAttributes(attributes)).thenReturn(expectedList);

            List<TransactionExpensesPayroll> result = transactionExpensesPayrollService.findByAttributes(attributes);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            assertThat(result).containsExactly(testTransactionExpense);
            verify(transactionExpensesPayrollDao, times(1)).findByAttributes(attributes);
        }

        @Test
        @DisplayName("Should return empty list when no attributes match")
        void shouldReturnEmptyListWhenNoAttributesMatch() {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("transactionId", 9999);

            when(transactionExpensesPayrollDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

            List<TransactionExpensesPayroll> result = transactionExpensesPayrollService.findByAttributes(attributes);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(transactionExpensesPayrollDao, times(1)).findByAttributes(attributes);
        }

        @Test
        @DisplayName("Should handle null attributes map")
        void shouldHandleNullAttributesMap() {
            List<TransactionExpensesPayroll> result = transactionExpensesPayrollService.findByAttributes(null);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(transactionExpensesPayrollDao, never()).findByAttributes(any());
        }

        @Test
        @DisplayName("Should handle empty attributes map")
        void shouldHandleEmptyAttributesMap() {
            Map<String, Object> attributes = new HashMap<>();

            List<TransactionExpensesPayroll> result = transactionExpensesPayrollService.findByAttributes(attributes);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(transactionExpensesPayrollDao, never()).findByAttributes(any());
        }
    }

    @Nested
    @DisplayName("Edge Cases and Error Handling Tests")
    class EdgeCasesAndErrorHandlingTests {

        @Test
        @DisplayName("Should handle transaction expense with minimal data")
        void shouldHandleTransactionExpenseWithMinimalData() {
            TransactionExpensesPayroll minimalExpense = new TransactionExpensesPayroll();
            minimalExpense.setId(10);

            when(transactionExpensesPayrollDao.findByPK(10)).thenReturn(minimalExpense);

            TransactionExpensesPayroll result = transactionExpensesPayrollService.findByPK(10);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(10);
            assertThat(result.getExpense()).isNull();
        }

        @Test
        @DisplayName("Should handle very large transaction ID")
        void shouldHandleVeryLargeTransactionId() {
            Integer largeId = Integer.MAX_VALUE;

            when(transactionExpensesPayrollDao.getMappedExpenses(largeId)).thenReturn(Collections.emptyList());

            List<TransactionExpensesPayroll> result =
                transactionExpensesPayrollService.findAllForTransactionExpenses(largeId);

            assertThat(result).isNotNull();
            verify(transactionExpensesPayrollDao, times(1)).getMappedExpenses(largeId);
        }

        @Test
        @DisplayName("Should handle concurrent calls to getMappedExpenses")
        void shouldHandleConcurrentCallsToGetMappedExpenses() {
            List<TransactionExpensesPayroll> expectedList = Collections.singletonList(testTransactionExpense);
            when(transactionExpensesPayrollDao.dumpData()).thenReturn(expectedList);

            List<Expense> result1 = transactionExpensesPayrollService.getMappedExpenses();
            List<Expense> result2 = transactionExpensesPayrollService.getMappedExpenses();

            assertThat(result1).isNotNull();
            assertThat(result2).isNotNull();
            assertThat(result1).hasSize(1);
            assertThat(result2).hasSize(1);
            verify(transactionExpensesPayrollDao, times(2)).dumpData();
        }

        @Test
        @DisplayName("Should handle update with null expense ID")
        void shouldHandleUpdateWithNullExpenseId() {
            TransactionExpensesPayroll expenseWithNullId = new TransactionExpensesPayroll();
            expenseWithNullId.setId(null);

            when(transactionExpensesPayrollDao.update(expenseWithNullId)).thenReturn(expenseWithNullId);

            TransactionExpensesPayroll result = transactionExpensesPayrollService.update(expenseWithNullId);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isNull();
            verify(transactionExpensesPayrollDao, times(1)).update(expenseWithNullId);
        }

        @Test
        @DisplayName("Should handle transaction expenses with duplicate expense references")
        void shouldHandleTransactionExpensesWithDuplicateExpenseReferences() {
            Expense sharedExpense = new Expense();
            sharedExpense.setExpenseId(200);
            sharedExpense.setExpenseName("Shared");

            TransactionExpensesPayroll expense1 = new TransactionExpensesPayroll();
            expense1.setId(1);
            expense1.setExpense(sharedExpense);

            TransactionExpensesPayroll expense2 = new TransactionExpensesPayroll();
            expense2.setId(2);
            expense2.setExpense(sharedExpense);

            List<TransactionExpensesPayroll> duplicateList = Arrays.asList(expense1, expense2);
            when(transactionExpensesPayrollDao.dumpData()).thenReturn(duplicateList);

            List<Expense> result = transactionExpensesPayrollService.getMappedExpenses();

            assertThat(result).isNotNull();
            assertThat(result).hasSize(2);
            assertThat(result.get(0).getExpenseId()).isEqualTo(200);
            assertThat(result.get(1).getExpenseId()).isEqualTo(200);
        }
    }

    // Helper method
    private TransactionExpensesPayroll createTransactionExpense(Integer id, Integer expenseId, String expenseName) {
        Expense expense = new Expense();
        expense.setExpenseId(expenseId);
        expense.setExpenseName(expenseName);

        TransactionExpensesPayroll transactionExpense = new TransactionExpensesPayroll();
        transactionExpense.setId(id);
        transactionExpense.setExpense(expense);
        transactionExpense.setTransactionId(500 + id);
        transactionExpense.setCreatedBy(1);
        transactionExpense.setCreatedDate(LocalDateTime.now());

        return transactionExpense;
    }
}
