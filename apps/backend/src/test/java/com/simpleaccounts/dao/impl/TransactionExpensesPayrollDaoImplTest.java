package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.entity.TransactionExpensesPayroll;
import com.simpleaccounts.entity.bankaccount.Transaction;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Path;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.DetachedCriteria;
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
@DisplayName("TransactionExpensesPayrollDaoImpl Unit Tests")
class TransactionExpensesPayrollDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private Session session;

    @Mock
    private Criteria criteria;

    @Mock
    private TypedQuery<TransactionExpensesPayroll> typedQuery;

    @Mock
    private TypedQuery<Long> countQuery;

    @Mock
    private CriteriaBuilder criteriaBuilder;

    @Mock
    private CriteriaQuery<TransactionExpensesPayroll> criteriaQuery;

    @Mock
    private CriteriaQuery<Long> countCriteriaQuery;

    @Mock
    private Root<TransactionExpensesPayroll> root;

    @Mock
    private Predicate predicate;

    @Mock
    private Path<Object> path;

    @InjectMocks
    private TransactionExpensesPayrollDaoImpl transactionExpensesPayrollDao;

    private TransactionExpensesPayroll testTransactionExpenses;
    private Expense testExpense;
    private Transaction testTransaction;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(transactionExpensesPayrollDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(transactionExpensesPayrollDao, "entityClass", TransactionExpensesPayroll.class);

        testExpense = createTestExpense(1, "Salary Expense", BigDecimal.valueOf(5000));
        testTransaction = createTestTransaction(1, "TXN001", BigDecimal.valueOf(5000));
        testTransactionExpenses = createTestTransactionExpensesPayroll(1, testExpense, testTransaction);

        lenient().when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
        lenient().when(criteriaBuilder.createQuery(TransactionExpensesPayroll.class)).thenReturn(criteriaQuery);
        lenient().when(criteriaQuery.from(TransactionExpensesPayroll.class)).thenReturn(root);
        lenient().when(entityManager.createQuery(criteriaQuery)).thenReturn(typedQuery);
        lenient().when(root.get(anyString())).thenReturn(path);
        lenient().when(criteriaBuilder.equal(any(), any())).thenReturn(predicate);

        lenient().when(criteriaBuilder.createQuery(Long.class)).thenReturn(countCriteriaQuery);
        lenient().when(countCriteriaQuery.from(TransactionExpensesPayroll.class)).thenReturn(root);
        lenient().when(entityManager.createQuery(countCriteriaQuery)).thenReturn(countQuery);
        lenient().when(countQuery.getSingleResult()).thenReturn(0L);

        lenient().when(entityManager.getDelegate()).thenReturn(session);
    }

    @Test
    @DisplayName("Should find by primary key when exists")
    void findByPKReturnsTransactionExpensesWhenExists() {
        Integer id = 1;
        when(entityManager.find(TransactionExpensesPayroll.class, id)).thenReturn(testTransactionExpenses);

        TransactionExpensesPayroll result = transactionExpensesPayrollDao.findByPK(id);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(id);
        assertThat(result.getExpense()).isEqualTo(testExpense);
        assertThat(result.getTransaction()).isEqualTo(testTransaction);
        verify(entityManager).find(TransactionExpensesPayroll.class, id);
    }

    @Test
    @DisplayName("Should return null when not found by primary key")
    void findByPKReturnsNullWhenNotFound() {
        Integer id = 999;
        when(entityManager.find(TransactionExpensesPayroll.class, id)).thenReturn(null);

        TransactionExpensesPayroll result = transactionExpensesPayrollDao.findByPK(id);

        assertThat(result).isNull();
        verify(entityManager).find(TransactionExpensesPayroll.class, id);
    }

    @Test
    @DisplayName("Should persist new transaction expenses payroll")
    void persistSavesNewTransactionExpenses() {
        TransactionExpensesPayroll newExpenses = createTestTransactionExpensesPayroll(null, testExpense, testTransaction);

        transactionExpensesPayrollDao.persist(newExpenses);

        verify(entityManager).persist(newExpenses);
        verify(entityManager).flush();
        verify(entityManager).refresh(newExpenses);
    }

    @Test
    @DisplayName("Should update existing transaction expenses payroll")
    void updateModifiesExistingTransactionExpenses() {
        Expense newExpense = createTestExpense(2, "Updated Expense", BigDecimal.valueOf(6000));
        testTransactionExpenses.setExpense(newExpense);
        when(entityManager.merge(testTransactionExpenses)).thenReturn(testTransactionExpenses);

        TransactionExpensesPayroll result = transactionExpensesPayrollDao.update(testTransactionExpenses);

        assertThat(result).isNotNull();
        assertThat(result.getExpense().getExpenseDescription()).isEqualTo("Updated Expense");
        verify(entityManager).merge(testTransactionExpenses);
    }

    @Test
    @DisplayName("Should delete transaction expenses payroll when managed")
    void deleteRemovesTransactionExpensesWhenManaged() {
        when(entityManager.contains(testTransactionExpenses)).thenReturn(true);

        transactionExpensesPayrollDao.delete(testTransactionExpenses);

        verify(entityManager).contains(testTransactionExpenses);
        verify(entityManager).remove(testTransactionExpenses);
    }

    @Test
    @DisplayName("Should merge and delete transaction expenses payroll when not managed")
    void deleteRemovesTransactionExpensesWhenNotManaged() {
        when(entityManager.contains(testTransactionExpenses)).thenReturn(false);
        when(entityManager.merge(testTransactionExpenses)).thenReturn(testTransactionExpenses);

        transactionExpensesPayrollDao.delete(testTransactionExpenses);

        verify(entityManager).contains(testTransactionExpenses);
        verify(entityManager).merge(testTransactionExpenses);
        verify(entityManager).remove(testTransactionExpenses);
    }

    @Test
    @DisplayName("Should dump all data")
    void dumpDataReturnsAllTransactionExpenses() {
        List<TransactionExpensesPayroll> allExpenses = Arrays.asList(
            testTransactionExpenses,
            createTestTransactionExpensesPayroll(2, createTestExpense(2, "Bonus", BigDecimal.valueOf(1000)), testTransaction)
        );

        when(typedQuery.getResultList()).thenReturn(allExpenses);

        List<TransactionExpensesPayroll> result = transactionExpensesPayrollDao.dumpData();

        assertThat(result).isNotNull().hasSize(2);
    }

    @Test
    @DisplayName("Should return entity manager instance")
    void getEntityManagerReturnsInstance() {
        EntityManager result = transactionExpensesPayrollDao.getEntityManager();

        assertThat(result).isNotNull().isEqualTo(entityManager);
    }

    @Test
    @DisplayName("Should handle empty result for dump data")
    void dumpDataReturnsEmptyList() {
        when(typedQuery.getResultList()).thenReturn(Collections.emptyList());

        List<TransactionExpensesPayroll> result = transactionExpensesPayrollDao.dumpData();

        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should handle multiple expenses for same transaction")
    void handlesMultipleExpensesForSameTransaction() {
        Expense expense1 = createTestExpense(1, "Salary", BigDecimal.valueOf(5000));
        Expense expense2 = createTestExpense(2, "Allowance", BigDecimal.valueOf(1000));
        Expense expense3 = createTestExpense(3, "Bonus", BigDecimal.valueOf(500));

        List<TransactionExpensesPayroll> multipleExpenses = Arrays.asList(
            createTestTransactionExpensesPayroll(1, expense1, testTransaction),
            createTestTransactionExpensesPayroll(2, expense2, testTransaction),
            createTestTransactionExpensesPayroll(3, expense3, testTransaction)
        );

        when(typedQuery.getResultList()).thenReturn(multipleExpenses);

        List<TransactionExpensesPayroll> result = transactionExpensesPayrollDao.dumpData();

        assertThat(result).hasSize(3);
        BigDecimal totalAmount = result.stream()
            .map(te -> te.getExpense().getExpenseAmount())
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertThat(totalAmount).isEqualTo(BigDecimal.valueOf(6500));
    }

    @Test
    @DisplayName("Should handle large list of transaction expenses")
    void handlesLargeListOfTransactionExpenses() {
        List<TransactionExpensesPayroll> largeList = new java.util.ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            Expense expense = createTestExpense(i, "Expense " + i, BigDecimal.valueOf(100 * i));
            largeList.add(createTestTransactionExpensesPayroll(i, expense, testTransaction));
        }

        when(typedQuery.getResultList()).thenReturn(largeList);

        List<TransactionExpensesPayroll> result = transactionExpensesPayrollDao.dumpData();

        assertThat(result).hasSize(100);
    }

    @Test
    @DisplayName("Should handle transaction expenses with null expense")
    void handlesTransactionExpensesWithNullExpense() {
        TransactionExpensesPayroll expensesWithNull = new TransactionExpensesPayroll();
        expensesWithNull.setId(1);
        expensesWithNull.setExpense(null);
        expensesWithNull.setTransaction(testTransaction);

        when(entityManager.find(TransactionExpensesPayroll.class, 1)).thenReturn(expensesWithNull);

        TransactionExpensesPayroll result = transactionExpensesPayrollDao.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getExpense()).isNull();
    }

    @Test
    @DisplayName("Should handle transaction expenses with null transaction")
    void handlesTransactionExpensesWithNullTransaction() {
        TransactionExpensesPayroll expensesWithNull = new TransactionExpensesPayroll();
        expensesWithNull.setId(1);
        expensesWithNull.setExpense(testExpense);
        expensesWithNull.setTransaction(null);

        when(entityManager.find(TransactionExpensesPayroll.class, 1)).thenReturn(expensesWithNull);

        TransactionExpensesPayroll result = transactionExpensesPayrollDao.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getTransaction()).isNull();
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
