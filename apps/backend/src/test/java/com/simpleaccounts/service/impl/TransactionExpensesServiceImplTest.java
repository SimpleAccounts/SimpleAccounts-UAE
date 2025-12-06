package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.TransactionExpensesDao;
import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.entity.TransactionExpenses;
import com.simpleaccounts.exceptions.ServiceException;
import java.math.BigDecimal;
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
@DisplayName("TransactionExpensesServiceImpl Tests")
class TransactionExpensesServiceImplTest {

    @Mock
    private TransactionExpensesDao transactionExpensesDao;

    @InjectMocks
    private TransactionExpensesServiceImpl transactionExpensesService;

    private TransactionExpenses testTransactionExpense;
    private Expense testExpense;
    private Integer transactionExpenseId;

    @BeforeEach
    void setUp() {
        transactionExpenseId = 1;

        testExpense = new Expense();
        testExpense.setExpenseId(100);
        testExpense.setExpenseName("Office Supplies");
        testExpense.setExpenseCode("EXP001");
        testExpense.setExpenseDescription("Monthly office supplies");

        testTransactionExpense = new TransactionExpenses();
        testTransactionExpense.setId(transactionExpenseId);
        testTransactionExpense.setExpense(testExpense);
        testTransactionExpense.setTransactionId(500);
        testTransactionExpense.setAmount(new BigDecimal("150.00"));
        testTransactionExpense.setCreatedBy(1);
        testTransactionExpense.setCreatedDate(LocalDateTime.now());
    }

    @Nested
    @DisplayName("getDao() Tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return TransactionExpensesDao instance")
        void shouldReturnTransactionExpensesDao() {
            assertThat(transactionExpensesService.getDao()).isEqualTo(transactionExpensesDao);
        }

        @Test
        @DisplayName("Should not return null")
        void shouldNotReturnNull() {
            assertThat(transactionExpensesService.getDao()).isNotNull();
        }

        @Test
        @DisplayName("Should return same instance on multiple calls")
        void shouldReturnSameInstanceOnMultipleCalls() {
            var dao1 = transactionExpensesService.getDao();
            var dao2 = transactionExpensesService.getDao();

            assertThat(dao1).isSameAs(dao2);
            assertThat(dao1).isEqualTo(transactionExpensesDao);
        }
    }

    @Nested
    @DisplayName("getMappedExpenses() Tests")
    class GetMappedExpensesTests {

        @Test
        @DisplayName("Should return list of expenses when transaction expenses exist")
        void shouldReturnListOfExpensesWhenTransactionExpensesExist() {
            List<TransactionExpenses> transactionExpensesList = Arrays.asList(
                testTransactionExpense,
                createTransactionExpense(2, 101, "Travel Expense"),
                createTransactionExpense(3, 102, "Utilities")
            );

            when(transactionExpensesDao.dumpData()).thenReturn(transactionExpensesList);

            List<Expense> result = transactionExpensesService.getMappedExpenses();

            assertThat(result).isNotNull();
            assertThat(result).hasSize(3);
            assertThat(result.get(0).getExpenseId()).isEqualTo(100);
            assertThat(result.get(1).getExpenseId()).isEqualTo(101);
            assertThat(result.get(2).getExpenseId()).isEqualTo(102);
            verify(transactionExpensesDao, times(1)).dumpData();
        }

        @Test
        @DisplayName("Should return null when transaction expenses list is null")
        void shouldReturnNullWhenTransactionExpensesListIsNull() {
            when(transactionExpensesDao.dumpData()).thenReturn(null);

            List<Expense> result = transactionExpensesService.getMappedExpenses();

            assertThat(result).isNull();
            verify(transactionExpensesDao, times(1)).dumpData();
        }

        @Test
        @DisplayName("Should return null when transaction expenses list is empty")
        void shouldReturnNullWhenTransactionExpensesListIsEmpty() {
            when(transactionExpensesDao.dumpData()).thenReturn(Collections.emptyList());

            List<Expense> result = transactionExpensesService.getMappedExpenses();

            assertThat(result).isNull();
            verify(transactionExpensesDao, times(1)).dumpData();
        }

        @Test
        @DisplayName("Should return single expense when only one transaction expense exists")
        void shouldReturnSingleExpenseWhenOnlyOneTransactionExpenseExists() {
            List<TransactionExpenses> singleList = Collections.singletonList(testTransactionExpense);

            when(transactionExpensesDao.dumpData()).thenReturn(singleList);

            List<Expense> result = transactionExpensesService.getMappedExpenses();

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            assertThat(result.get(0)).isEqualTo(testExpense);
            assertThat(result.get(0).getExpenseName()).isEqualTo("Office Supplies");
            verify(transactionExpensesDao, times(1)).dumpData();
        }

        @Test
        @DisplayName("Should handle large number of transaction expenses")
        void shouldHandleLargeNumberOfTransactionExpenses() {
            List<TransactionExpenses> largeList = new ArrayList<>();
            for (int i = 0; i < 100; i++) {
                largeList.add(createTransactionExpense(i, 100 + i, "Expense " + i));
            }

            when(transactionExpensesDao.dumpData()).thenReturn(largeList);

            List<Expense> result = transactionExpensesService.getMappedExpenses();

            assertThat(result).isNotNull();
            assertThat(result).hasSize(100);
            assertThat(result.get(0).getExpenseId()).isEqualTo(100);
            assertThat(result.get(99).getExpenseId()).isEqualTo(199);
            verify(transactionExpensesDao, times(1)).dumpData();
        }

        @Test
        @DisplayName("Should extract expenses correctly maintaining order")
        void shouldExtractExpensesCorrectlyMaintainingOrder() {
            List<TransactionExpenses> orderedList = Arrays.asList(
                createTransactionExpense(1, 101, "First Expense"),
                createTransactionExpense(2, 102, "Second Expense"),
                createTransactionExpense(3, 103, "Third Expense")
            );

            when(transactionExpensesDao.dumpData()).thenReturn(orderedList);

            List<Expense> result = transactionExpensesService.getMappedExpenses();

            assertThat(result).isNotNull();
            assertThat(result).hasSize(3);
            assertThat(result.get(0).getExpenseName()).isEqualTo("First Expense");
            assertThat(result.get(1).getExpenseName()).isEqualTo("Second Expense");
            assertThat(result.get(2).getExpenseName()).isEqualTo("Third Expense");
        }

        @Test
        @DisplayName("Should handle transaction expenses with null expense objects")
        void shouldHandleTransactionExpensesWithNullExpenseObjects() {
            TransactionExpenses expenseWithNull = new TransactionExpenses();
            expenseWithNull.setId(5);
            expenseWithNull.setExpense(null);

            List<TransactionExpenses> listWithNull = Collections.singletonList(expenseWithNull);
            when(transactionExpensesDao.dumpData()).thenReturn(listWithNull);

            List<Expense> result = transactionExpensesService.getMappedExpenses();

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            assertThat(result.get(0)).isNull();
        }

        @Test
        @DisplayName("Should handle mixed null and non-null expenses")
        void shouldHandleMixedNullAndNonNullExpenses() {
            TransactionExpenses validExpense = createTransactionExpense(1, 101, "Valid");
            TransactionExpenses nullExpense = new TransactionExpenses();
            nullExpense.setId(2);
            nullExpense.setExpense(null);

            List<TransactionExpenses> mixedList = Arrays.asList(validExpense, nullExpense);
            when(transactionExpensesDao.dumpData()).thenReturn(mixedList);

            List<Expense> result = transactionExpensesService.getMappedExpenses();

            assertThat(result).isNotNull();
            assertThat(result).hasSize(2);
            assertThat(result.get(0)).isNotNull();
            assertThat(result.get(1)).isNull();
        }
    }

    @Nested
    @DisplayName("findAllForTransactionExpenses() Tests")
    class FindAllForTransactionExpensesTests {

        @Test
        @DisplayName("Should find all expenses for given transaction ID")
        void shouldFindAllExpensesForGivenTransactionId() {
            Integer transactionId = 500;
            List<TransactionExpenses> expectedList = Arrays.asList(
                testTransactionExpense,
                createTransactionExpense(2, 101, "Another Expense")
            );

            when(transactionExpensesDao.getMappedExpenses(transactionId)).thenReturn(expectedList);

            List<TransactionExpenses> result =
                transactionExpensesService.findAllForTransactionExpenses(transactionId);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(2);
            assertThat(result).isEqualTo(expectedList);
            verify(transactionExpensesDao, times(1)).getMappedExpenses(transactionId);
        }

        @Test
        @DisplayName("Should return empty list when no expenses found for transaction ID")
        void shouldReturnEmptyListWhenNoExpensesFoundForTransactionId() {
            Integer transactionId = 999;

            when(transactionExpensesDao.getMappedExpenses(transactionId))
                .thenReturn(Collections.emptyList());

            List<TransactionExpenses> result =
                transactionExpensesService.findAllForTransactionExpenses(transactionId);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(transactionExpensesDao, times(1)).getMappedExpenses(transactionId);
        }

        @Test
        @DisplayName("Should return null when transaction ID returns null")
        void shouldReturnNullWhenTransactionIdReturnsNull() {
            Integer transactionId = 123;

            when(transactionExpensesDao.getMappedExpenses(transactionId)).thenReturn(null);

            List<TransactionExpenses> result =
                transactionExpensesService.findAllForTransactionExpenses(transactionId);

            assertThat(result).isNull();
            verify(transactionExpensesDao, times(1)).getMappedExpenses(transactionId);
        }

        @Test
        @DisplayName("Should handle null transaction ID")
        void shouldHandleNullTransactionId() {
            when(transactionExpensesDao.getMappedExpenses(null)).thenReturn(Collections.emptyList());

            List<TransactionExpenses> result =
                transactionExpensesService.findAllForTransactionExpenses(null);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(transactionExpensesDao, times(1)).getMappedExpenses(null);
        }

        @Test
        @DisplayName("Should handle zero transaction ID")
        void shouldHandleZeroTransactionId() {
            Integer zeroId = 0;

            when(transactionExpensesDao.getMappedExpenses(zeroId)).thenReturn(Collections.emptyList());

            List<TransactionExpenses> result =
                transactionExpensesService.findAllForTransactionExpenses(zeroId);

            assertThat(result).isNotNull();
            verify(transactionExpensesDao, times(1)).getMappedExpenses(zeroId);
        }

        @Test
        @DisplayName("Should handle negative transaction ID")
        void shouldHandleNegativeTransactionId() {
            Integer negativeId = -1;

            when(transactionExpensesDao.getMappedExpenses(negativeId))
                .thenReturn(Collections.emptyList());

            List<TransactionExpenses> result =
                transactionExpensesService.findAllForTransactionExpenses(negativeId);

            assertThat(result).isNotNull();
            verify(transactionExpensesDao, times(1)).getMappedExpenses(negativeId);
        }

        @Test
        @DisplayName("Should return single expense for transaction with one expense")
        void shouldReturnSingleExpenseForTransactionWithOneExpense() {
            Integer transactionId = 100;
            List<TransactionExpenses> singleList = Collections.singletonList(testTransactionExpense);

            when(transactionExpensesDao.getMappedExpenses(transactionId)).thenReturn(singleList);

            List<TransactionExpenses> result =
                transactionExpensesService.findAllForTransactionExpenses(transactionId);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            assertThat(result.get(0)).isEqualTo(testTransactionExpense);
        }

        @Test
        @DisplayName("Should return multiple expenses for transaction with many expenses")
        void shouldReturnMultipleExpensesForTransactionWithManyExpenses() {
            Integer transactionId = 200;
            List<TransactionExpenses> multipleExpenses = new ArrayList<>();
            for (int i = 0; i < 10; i++) {
                multipleExpenses.add(createTransactionExpense(i, 100 + i, "Expense " + i));
            }

            when(transactionExpensesDao.getMappedExpenses(transactionId)).thenReturn(multipleExpenses);

            List<TransactionExpenses> result =
                transactionExpensesService.findAllForTransactionExpenses(transactionId);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(10);
        }

        @Test
        @DisplayName("Should handle very large transaction ID")
        void shouldHandleVeryLargeTransactionId() {
            Integer largeId = Integer.MAX_VALUE;

            when(transactionExpensesDao.getMappedExpenses(largeId)).thenReturn(Collections.emptyList());

            List<TransactionExpenses> result =
                transactionExpensesService.findAllForTransactionExpenses(largeId);

            assertThat(result).isNotNull();
            verify(transactionExpensesDao, times(1)).getMappedExpenses(largeId);
        }
    }

    @Nested
    @DisplayName("Inherited CRUD Operation Tests")
    class InheritedCrudOperationTests {

        @Test
        @DisplayName("Should find transaction expense by primary key")
        void shouldFindTransactionExpenseByPrimaryKey() {
            when(transactionExpensesDao.findByPK(transactionExpenseId)).thenReturn(testTransactionExpense);

            TransactionExpenses result = transactionExpensesService.findByPK(transactionExpenseId);

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(testTransactionExpense);
            assertThat(result.getId()).isEqualTo(transactionExpenseId);
            verify(transactionExpensesDao, times(1)).findByPK(transactionExpenseId);
        }

        @Test
        @DisplayName("Should throw exception when transaction expense not found by PK")
        void shouldThrowExceptionWhenTransactionExpenseNotFoundByPK() {
            when(transactionExpensesDao.findByPK(999)).thenReturn(null);

            assertThatThrownBy(() -> transactionExpensesService.findByPK(999))
                    .isInstanceOf(ServiceException.class);

            verify(transactionExpensesDao, times(1)).findByPK(999);
        }

        @Test
        @DisplayName("Should persist new transaction expense")
        void shouldPersistNewTransactionExpense() {
            transactionExpensesService.persist(testTransactionExpense);

            verify(transactionExpensesDao, times(1)).persist(testTransactionExpense);
        }

        @Test
        @DisplayName("Should update existing transaction expense")
        void shouldUpdateExistingTransactionExpense() {
            when(transactionExpensesDao.update(testTransactionExpense)).thenReturn(testTransactionExpense);

            TransactionExpenses result = transactionExpensesService.update(testTransactionExpense);

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(testTransactionExpense);
            verify(transactionExpensesDao, times(1)).update(testTransactionExpense);
        }

        @Test
        @DisplayName("Should delete transaction expense")
        void shouldDeleteTransactionExpense() {
            transactionExpensesService.delete(testTransactionExpense);

            verify(transactionExpensesDao, times(1)).delete(testTransactionExpense);
        }

        @Test
        @DisplayName("Should find transaction expenses by attributes")
        void shouldFindTransactionExpensesByAttributes() {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("transactionId", 500);

            List<TransactionExpenses> expectedList = Arrays.asList(testTransactionExpense);
            when(transactionExpensesDao.findByAttributes(attributes)).thenReturn(expectedList);

            List<TransactionExpenses> result = transactionExpensesService.findByAttributes(attributes);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            assertThat(result).containsExactly(testTransactionExpense);
            verify(transactionExpensesDao, times(1)).findByAttributes(attributes);
        }

        @Test
        @DisplayName("Should return empty list when no attributes match")
        void shouldReturnEmptyListWhenNoAttributesMatch() {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("transactionId", 9999);

            when(transactionExpensesDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

            List<TransactionExpenses> result = transactionExpensesService.findByAttributes(attributes);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(transactionExpensesDao, times(1)).findByAttributes(attributes);
        }

        @Test
        @DisplayName("Should handle null attributes map")
        void shouldHandleNullAttributesMap() {
            List<TransactionExpenses> result = transactionExpensesService.findByAttributes(null);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(transactionExpensesDao, never()).findByAttributes(any());
        }

        @Test
        @DisplayName("Should handle empty attributes map")
        void shouldHandleEmptyAttributesMap() {
            Map<String, Object> attributes = new HashMap<>();

            List<TransactionExpenses> result = transactionExpensesService.findByAttributes(attributes);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(transactionExpensesDao, never()).findByAttributes(any());
        }
    }

    @Nested
    @DisplayName("Edge Cases and Error Handling Tests")
    class EdgeCasesAndErrorHandlingTests {

        @Test
        @DisplayName("Should handle transaction expense with minimal data")
        void shouldHandleTransactionExpenseWithMinimalData() {
            TransactionExpenses minimalExpense = new TransactionExpenses();
            minimalExpense.setId(10);

            when(transactionExpensesDao.findByPK(10)).thenReturn(minimalExpense);

            TransactionExpenses result = transactionExpensesService.findByPK(10);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(10);
            assertThat(result.getExpense()).isNull();
        }

        @Test
        @DisplayName("Should handle transaction expense with zero amount")
        void shouldHandleTransactionExpenseWithZeroAmount() {
            testTransactionExpense.setAmount(BigDecimal.ZERO);

            when(transactionExpensesDao.update(testTransactionExpense)).thenReturn(testTransactionExpense);

            TransactionExpenses result = transactionExpensesService.update(testTransactionExpense);

            assertThat(result).isNotNull();
            assertThat(result.getAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should handle transaction expense with negative amount")
        void shouldHandleTransactionExpenseWithNegativeAmount() {
            testTransactionExpense.setAmount(new BigDecimal("-50.00"));

            when(transactionExpensesDao.update(testTransactionExpense)).thenReturn(testTransactionExpense);

            TransactionExpenses result = transactionExpensesService.update(testTransactionExpense);

            assertThat(result).isNotNull();
            assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("-50.00"));
        }

        @Test
        @DisplayName("Should handle concurrent calls to getMappedExpenses")
        void shouldHandleConcurrentCallsToGetMappedExpenses() {
            List<TransactionExpenses> expectedList = Collections.singletonList(testTransactionExpense);
            when(transactionExpensesDao.dumpData()).thenReturn(expectedList);

            List<Expense> result1 = transactionExpensesService.getMappedExpenses();
            List<Expense> result2 = transactionExpensesService.getMappedExpenses();

            assertThat(result1).isNotNull();
            assertThat(result2).isNotNull();
            assertThat(result1).hasSize(1);
            assertThat(result2).hasSize(1);
            verify(transactionExpensesDao, times(2)).dumpData();
        }

        @Test
        @DisplayName("Should handle update with null expense ID")
        void shouldHandleUpdateWithNullExpenseId() {
            TransactionExpenses expenseWithNullId = new TransactionExpenses();
            expenseWithNullId.setId(null);

            when(transactionExpensesDao.update(expenseWithNullId)).thenReturn(expenseWithNullId);

            TransactionExpenses result = transactionExpensesService.update(expenseWithNullId);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isNull();
            verify(transactionExpensesDao, times(1)).update(expenseWithNullId);
        }

        @Test
        @DisplayName("Should handle transaction expenses with duplicate expense references")
        void shouldHandleTransactionExpensesWithDuplicateExpenseReferences() {
            Expense sharedExpense = new Expense();
            sharedExpense.setExpenseId(200);
            sharedExpense.setExpenseName("Shared Expense");

            TransactionExpenses expense1 = new TransactionExpenses();
            expense1.setId(1);
            expense1.setExpense(sharedExpense);

            TransactionExpenses expense2 = new TransactionExpenses();
            expense2.setId(2);
            expense2.setExpense(sharedExpense);

            List<TransactionExpenses> duplicateList = Arrays.asList(expense1, expense2);
            when(transactionExpensesDao.dumpData()).thenReturn(duplicateList);

            List<Expense> result = transactionExpensesService.getMappedExpenses();

            assertThat(result).isNotNull();
            assertThat(result).hasSize(2);
            assertThat(result.get(0).getExpenseId()).isEqualTo(200);
            assertThat(result.get(1).getExpenseId()).isEqualTo(200);
        }

        @Test
        @DisplayName("Should handle transaction expense with very large amount")
        void shouldHandleTransactionExpenseWithVeryLargeAmount() {
            testTransactionExpense.setAmount(new BigDecimal("999999999.99"));

            when(transactionExpensesDao.update(testTransactionExpense)).thenReturn(testTransactionExpense);

            TransactionExpenses result = transactionExpensesService.update(testTransactionExpense);

            assertThat(result).isNotNull();
            assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("999999999.99"));
        }

        @Test
        @DisplayName("Should handle multiple attribute searches")
        void shouldHandleMultipleAttributeSearches() {
            Map<String, Object> attributes1 = new HashMap<>();
            attributes1.put("transactionId", 100);

            Map<String, Object> attributes2 = new HashMap<>();
            attributes2.put("transactionId", 200);

            when(transactionExpensesDao.findByAttributes(attributes1))
                .thenReturn(Collections.singletonList(testTransactionExpense));
            when(transactionExpensesDao.findByAttributes(attributes2))
                .thenReturn(Collections.emptyList());

            List<TransactionExpenses> result1 = transactionExpensesService.findByAttributes(attributes1);
            List<TransactionExpenses> result2 = transactionExpensesService.findByAttributes(attributes2);

            assertThat(result1).hasSize(1);
            assertThat(result2).isEmpty();
            verify(transactionExpensesDao, times(1)).findByAttributes(attributes1);
            verify(transactionExpensesDao, times(1)).findByAttributes(attributes2);
        }
    }

    // Helper method
    private TransactionExpenses createTransactionExpense(Integer id, Integer expenseId, String expenseName) {
        Expense expense = new Expense();
        expense.setExpenseId(expenseId);
        expense.setExpenseName(expenseName);
        expense.setExpenseCode("EXP" + String.format("%03d", expenseId));

        TransactionExpenses transactionExpense = new TransactionExpenses();
        transactionExpense.setId(id);
        transactionExpense.setExpense(expense);
        transactionExpense.setTransactionId(500 + id);
        transactionExpense.setAmount(new BigDecimal("100.00"));
        transactionExpense.setCreatedBy(1);
        transactionExpense.setCreatedDate(LocalDateTime.now());

        return transactionExpense;
    }
}
