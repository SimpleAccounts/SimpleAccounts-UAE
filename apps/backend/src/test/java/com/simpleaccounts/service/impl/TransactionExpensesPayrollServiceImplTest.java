package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.TransactionExpensesPayrollDao;
import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.entity.TransactionExpensesPayroll;
import com.simpleaccounts.entity.bankaccount.Transaction;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("TransactionExpensesPayrollServiceImpl Unit Tests")
class TransactionExpensesPayrollServiceImplTest {

    @Mock
    private TransactionExpensesPayrollDao transactionExpensesPayrollDao;

    @InjectMocks
    private TransactionExpensesPayrollServiceImpl transactionExpensesPayrollService;

    private TransactionExpensesPayroll testTransactionExpenses;
    private Expense testExpense;
    private Transaction testTransaction;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(transactionExpensesPayrollService, "dao", transactionExpensesPayrollDao);
        testExpense = createTestExpense(1, "Salary Expense", BigDecimal.valueOf(5000));
        testTransaction = createTestTransaction(1, "TXN001", BigDecimal.valueOf(5000));
        testTransactionExpenses = createTestTransactionExpensesPayroll(1, testExpense, testTransaction);
    }

    @Test
    @DisplayName("Should return mapped expenses when expenses exist")
    void getMappedExpensesReturnsExpensesList() {
        Expense expense1 = createTestExpense(1, "Salary", BigDecimal.valueOf(5000));
        Expense expense2 = createTestExpense(2, "Bonus", BigDecimal.valueOf(1000));

        TransactionExpensesPayroll trExp1 = createTestTransactionExpensesPayroll(1, expense1, testTransaction);
        TransactionExpensesPayroll trExp2 = createTestTransactionExpensesPayroll(2, expense2, testTransaction);

        when(transactionExpensesPayrollDao.dumpData()).thenReturn(Arrays.asList(trExp1, trExp2));

        List<Expense> result = transactionExpensesPayrollService.getMappedExpenses();

        assertThat(result).isNotNull().hasSize(2);
        assertThat(result).extracting(Expense::getExpenseDescription)
            .containsExactlyInAnyOrder("Salary", "Bonus");
        verify(transactionExpensesPayrollDao).dumpData();
    }

    @Test
    @DisplayName("Should return null when no mapped expenses exist")
    void getMappedExpensesReturnsNullWhenEmpty() {
        when(transactionExpensesPayrollDao.dumpData()).thenReturn(Collections.emptyList());

        List<Expense> result = transactionExpensesPayrollService.getMappedExpenses();

        assertThat(result).isNull();
        verify(transactionExpensesPayrollDao).dumpData();
    }

    @Test
    @DisplayName("Should return null when dump data returns null")
    void getMappedExpensesReturnsNullWhenDumpDataReturnsNull() {
        when(transactionExpensesPayrollDao.dumpData()).thenReturn(null);

        List<Expense> result = transactionExpensesPayrollService.getMappedExpenses();

        assertThat(result).isNull();
        verify(transactionExpensesPayrollDao).dumpData();
    }

    @Test
    @DisplayName("Should find all transaction expenses for transaction ID")
    void findAllForTransactionExpensesReturnsListForTransaction() {
        Integer transactionId = 1;
        List<TransactionExpensesPayroll> expectedList = Arrays.asList(testTransactionExpenses);

        when(transactionExpensesPayrollDao.getMappedExpenses(transactionId)).thenReturn(expectedList);

        List<TransactionExpensesPayroll> result = transactionExpensesPayrollService.findAllForTransactionExpenses(transactionId);

        assertThat(result).isNotNull().hasSize(1);
        assertThat(result.get(0).getExpense()).isEqualTo(testExpense);
        verify(transactionExpensesPayrollDao).getMappedExpenses(transactionId);
    }

    @Test
    @DisplayName("Should return empty list when no expenses for transaction")
    void findAllForTransactionExpensesReturnsEmptyListWhenNone() {
        Integer transactionId = 999;

        when(transactionExpensesPayrollDao.getMappedExpenses(transactionId)).thenReturn(Collections.emptyList());

        List<TransactionExpensesPayroll> result = transactionExpensesPayrollService.findAllForTransactionExpenses(transactionId);

        assertThat(result).isNotNull().isEmpty();
        verify(transactionExpensesPayrollDao).getMappedExpenses(transactionId);
    }

    @Test
    @DisplayName("Should find by primary key")
    void findByPKReturnsTransactionExpenses() {
        Integer id = 1;
        when(transactionExpensesPayrollDao.findByPK(id)).thenReturn(testTransactionExpenses);

        TransactionExpensesPayroll result = transactionExpensesPayrollService.findByPK(id);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(id);
        verify(transactionExpensesPayrollDao).findByPK(id);
    }

    @Test
    @DisplayName("Should return null when not found by primary key")
    void findByPKReturnsNullWhenNotFound() {
        Integer id = 999;
        when(transactionExpensesPayrollDao.findByPK(id)).thenReturn(null);

        TransactionExpensesPayroll result = transactionExpensesPayrollService.findByPK(id);

        assertThat(result).isNull();
        verify(transactionExpensesPayrollDao).findByPK(id);
    }

    @Test
    @DisplayName("Should persist new transaction expenses payroll")
    void persistSavesNewTransactionExpenses() {
        TransactionExpensesPayroll newExpenses = createTestTransactionExpensesPayroll(null, testExpense, testTransaction);

        transactionExpensesPayrollService.persist(newExpenses);

        verify(transactionExpensesPayrollDao).persist(newExpenses);
    }

    @Test
    @DisplayName("Should update existing transaction expenses payroll")
    void updateModifiesExistingTransactionExpenses() {
        Expense newExpense = createTestExpense(2, "Updated Expense", BigDecimal.valueOf(6000));
        testTransactionExpenses.setExpense(newExpense);
        when(transactionExpensesPayrollDao.update(testTransactionExpenses)).thenReturn(testTransactionExpenses);

        TransactionExpensesPayroll result = transactionExpensesPayrollService.update(testTransactionExpenses);

        assertThat(result).isNotNull();
        assertThat(result.getExpense().getExpenseDescription()).isEqualTo("Updated Expense");
        verify(transactionExpensesPayrollDao).update(testTransactionExpenses);
    }

    @Test
    @DisplayName("Should delete transaction expenses payroll")
    void deleteRemovesTransactionExpenses() {
        transactionExpensesPayrollService.delete(testTransactionExpenses);

        verify(transactionExpensesPayrollDao).delete(testTransactionExpenses);
    }

    @Test
    @DisplayName("Should return DAO instance")
    void getDaoReturnsCorrectDao() {
        when(transactionExpensesPayrollDao.findByPK(1)).thenReturn(testTransactionExpenses);

        transactionExpensesPayrollService.findByPK(1);

        verify(transactionExpensesPayrollDao).findByPK(1);
    }

    @Test
    @DisplayName("Should handle multiple expenses for same transaction")
    void handlesMultipleExpensesForSameTransaction() {
        Integer transactionId = 1;
        Expense expense1 = createTestExpense(1, "Salary", BigDecimal.valueOf(5000));
        Expense expense2 = createTestExpense(2, "Allowance", BigDecimal.valueOf(1000));
        Expense expense3 = createTestExpense(3, "Bonus", BigDecimal.valueOf(500));

        TransactionExpensesPayroll trExp1 = createTestTransactionExpensesPayroll(1, expense1, testTransaction);
        TransactionExpensesPayroll trExp2 = createTestTransactionExpensesPayroll(2, expense2, testTransaction);
        TransactionExpensesPayroll trExp3 = createTestTransactionExpensesPayroll(3, expense3, testTransaction);

        when(transactionExpensesPayrollDao.getMappedExpenses(transactionId))
            .thenReturn(Arrays.asList(trExp1, trExp2, trExp3));

        List<TransactionExpensesPayroll> result = transactionExpensesPayrollService.findAllForTransactionExpenses(transactionId);

        assertThat(result).isNotNull().hasSize(3);
        BigDecimal totalAmount = result.stream()
            .map(te -> te.getExpense().getExpenseAmount())
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertThat(totalAmount).isEqualTo(BigDecimal.valueOf(6500));
    }

    private Expense createTestExpense(Integer id, String description, BigDecimal amount) {
        Expense expense = new Expense();
        expense.setExpenseId(id);
        expense.setExpenseDescription(description);
        expense.setExpenseAmount(amount);
        expense.setDeleteFlag(false);
        return expense;
    }

    private Transaction createTestTransaction(Integer id, String transactionRef, BigDecimal amount) {
        Transaction transaction = new Transaction();
        transaction.setTransactionId(id);
        transaction.setReferenceNumber(transactionRef);
        transaction.setAmount(amount);
        transaction.setDeleteFlag(false);
        return transaction;
    }

    private TransactionExpensesPayroll createTestTransactionExpensesPayroll(Integer id, Expense expense, Transaction transaction) {
        TransactionExpensesPayroll trExpenses = new TransactionExpensesPayroll();
        trExpenses.setId(id);
        trExpenses.setExpense(expense);
        trExpenses.setTransaction(transaction);
        return trExpenses;
    }
}
