package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.TaxTransactionStatusConstant;
import com.simpleaccounts.entity.TaxTransaction;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import javax.persistence.EntityManager;
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
@DisplayName("TaxTransactionDaoImpl Unit Tests")
class TaxTransactionDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<TaxTransaction> taxTransactionTypedQuery;

    @InjectMocks
    private TaxTransactionDaoImpl taxTransactionDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(taxTransactionDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(taxTransactionDao, "entityClass", TaxTransaction.class);
    }

    @Test
    @DisplayName("Should return closed tax transaction list when transactions exist")
    void getClosedTaxTransactionListReturnsTransactionsWhenExist() {
        // Arrange
        List<TaxTransaction> closedTransactions = createTaxTransactionList(3, TaxTransactionStatusConstant.CLOSE);
        when(entityManager.createQuery("Select t from TaxTransaction t WHERE t.status =:status", TaxTransaction.class))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter("status", TaxTransactionStatusConstant.CLOSE))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(closedTransactions);

        // Act
        List<TaxTransaction> result = taxTransactionDao.getClosedTaxTransactionList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).isEqualTo(closedTransactions);
    }

    @Test
    @DisplayName("Should return empty list when no closed tax transactions exist")
    void getClosedTaxTransactionListReturnsEmptyListWhenNoneExist() {
        // Arrange
        when(entityManager.createQuery("Select t from TaxTransaction t WHERE t.status =:status", TaxTransaction.class))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter("status", TaxTransactionStatusConstant.CLOSE))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<TaxTransaction> result = taxTransactionDao.getClosedTaxTransactionList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return empty list when closed tax transaction list is null")
    void getClosedTaxTransactionListReturnsEmptyListWhenNull() {
        // Arrange
        when(entityManager.createQuery("Select t from TaxTransaction t WHERE t.status =:status", TaxTransaction.class))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter("status", TaxTransactionStatusConstant.CLOSE))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(null);

        // Act
        List<TaxTransaction> result = taxTransactionDao.getClosedTaxTransactionList();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should execute correct query for closed tax transactions")
    void getClosedTaxTransactionListExecutesCorrectQuery() {
        // Arrange
        when(entityManager.createQuery("Select t from TaxTransaction t WHERE t.status =:status", TaxTransaction.class))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter("status", TaxTransactionStatusConstant.CLOSE))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        taxTransactionDao.getClosedTaxTransactionList();

        // Assert
        verify(entityManager).createQuery("Select t from TaxTransaction t WHERE t.status =:status", TaxTransaction.class);
        verify(taxTransactionTypedQuery).setParameter("status", TaxTransactionStatusConstant.CLOSE);
    }

    @Test
    @DisplayName("Should return open tax transaction list when transactions exist")
    void getOpenTaxTransactionListReturnsTransactionsWhenExist() {
        // Arrange
        List<TaxTransaction> openTransactions = createTaxTransactionList(5, TaxTransactionStatusConstant.OPEN);
        when(entityManager.createQuery("Select t from TaxTransaction t WHERE t.status =:status", TaxTransaction.class))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter("status", TaxTransactionStatusConstant.OPEN))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(openTransactions);

        // Act
        List<TaxTransaction> result = taxTransactionDao.getOpenTaxTransactionList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).isEqualTo(openTransactions);
    }

    @Test
    @DisplayName("Should return empty list when no open tax transactions exist")
    void getOpenTaxTransactionListReturnsEmptyListWhenNoneExist() {
        // Arrange
        when(entityManager.createQuery("Select t from TaxTransaction t WHERE t.status =:status", TaxTransaction.class))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter("status", TaxTransactionStatusConstant.OPEN))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<TaxTransaction> result = taxTransactionDao.getOpenTaxTransactionList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return empty list when open tax transaction list is null")
    void getOpenTaxTransactionListReturnsEmptyListWhenNull() {
        // Arrange
        when(entityManager.createQuery("Select t from TaxTransaction t WHERE t.status =:status", TaxTransaction.class))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter("status", TaxTransactionStatusConstant.OPEN))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(null);

        // Act
        List<TaxTransaction> result = taxTransactionDao.getOpenTaxTransactionList();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should execute correct query for open tax transactions")
    void getOpenTaxTransactionListExecutesCorrectQuery() {
        // Arrange
        when(entityManager.createQuery("Select t from TaxTransaction t WHERE t.status =:status", TaxTransaction.class))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter("status", TaxTransactionStatusConstant.OPEN))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        taxTransactionDao.getOpenTaxTransactionList();

        // Assert
        verify(entityManager).createQuery("Select t from TaxTransaction t WHERE t.status =:status", TaxTransaction.class);
        verify(taxTransactionTypedQuery).setParameter("status", TaxTransactionStatusConstant.OPEN);
    }

    @Test
    @DisplayName("Should set CLOSE status parameter for closed transactions")
    void getClosedTaxTransactionListSetsCloseStatus() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter(eq("status"), any()))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        taxTransactionDao.getClosedTaxTransactionList();

        // Assert
        verify(taxTransactionTypedQuery).setParameter("status", TaxTransactionStatusConstant.CLOSE);
    }

    @Test
    @DisplayName("Should set OPEN status parameter for open transactions")
    void getOpenTaxTransactionListSetsOpenStatus() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter(eq("status"), any()))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        taxTransactionDao.getOpenTaxTransactionList();

        // Assert
        verify(taxTransactionTypedQuery).setParameter("status", TaxTransactionStatusConstant.OPEN);
    }

    @Test
    @DisplayName("Should return single closed transaction")
    void getClosedTaxTransactionListReturnsSingleTransaction() {
        // Arrange
        List<TaxTransaction> transactions = createTaxTransactionList(1, TaxTransactionStatusConstant.CLOSE);
        when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter("status", TaxTransactionStatusConstant.CLOSE))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(transactions);

        // Act
        List<TaxTransaction> result = taxTransactionDao.getClosedTaxTransactionList();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(TaxTransactionStatusConstant.CLOSE);
    }

    @Test
    @DisplayName("Should return single open transaction")
    void getOpenTaxTransactionListReturnsSingleTransaction() {
        // Arrange
        List<TaxTransaction> transactions = createTaxTransactionList(1, TaxTransactionStatusConstant.OPEN);
        when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter("status", TaxTransactionStatusConstant.OPEN))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(transactions);

        // Act
        List<TaxTransaction> result = taxTransactionDao.getOpenTaxTransactionList();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(TaxTransactionStatusConstant.OPEN);
    }

    @Test
    @DisplayName("Should return multiple closed transactions")
    void getClosedTaxTransactionListReturnsMultipleTransactions() {
        // Arrange
        List<TaxTransaction> transactions = createTaxTransactionList(10, TaxTransactionStatusConstant.CLOSE);
        when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter("status", TaxTransactionStatusConstant.CLOSE))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(transactions);

        // Act
        List<TaxTransaction> result = taxTransactionDao.getClosedTaxTransactionList();

        // Assert
        assertThat(result).hasSize(10);
        result.forEach(t -> assertThat(t.getStatus()).isEqualTo(TaxTransactionStatusConstant.CLOSE));
    }

    @Test
    @DisplayName("Should return multiple open transactions")
    void getOpenTaxTransactionListReturnsMultipleTransactions() {
        // Arrange
        List<TaxTransaction> transactions = createTaxTransactionList(8, TaxTransactionStatusConstant.OPEN);
        when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter("status", TaxTransactionStatusConstant.OPEN))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(transactions);

        // Act
        List<TaxTransaction> result = taxTransactionDao.getOpenTaxTransactionList();

        // Assert
        assertThat(result).hasSize(8);
        result.forEach(t -> assertThat(t.getStatus()).isEqualTo(TaxTransactionStatusConstant.OPEN));
    }

    @Test
    @DisplayName("Should call getResultList once for closed transactions")
    void getClosedTaxTransactionListCallsGetResultListOnce() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter(eq("status"), any()))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        taxTransactionDao.getClosedTaxTransactionList();

        // Assert
        verify(taxTransactionTypedQuery, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should call getResultList once for open transactions")
    void getOpenTaxTransactionListCallsGetResultListOnce() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter(eq("status"), any()))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        taxTransactionDao.getOpenTaxTransactionList();

        // Assert
        verify(taxTransactionTypedQuery, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should handle large list of closed transactions")
    void getClosedTaxTransactionListHandlesLargeList() {
        // Arrange
        List<TaxTransaction> transactions = createTaxTransactionList(100, TaxTransactionStatusConstant.CLOSE);
        when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter("status", TaxTransactionStatusConstant.CLOSE))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(transactions);

        // Act
        List<TaxTransaction> result = taxTransactionDao.getClosedTaxTransactionList();

        // Assert
        assertThat(result).hasSize(100);
    }

    @Test
    @DisplayName("Should handle large list of open transactions")
    void getOpenTaxTransactionListHandlesLargeList() {
        // Arrange
        List<TaxTransaction> transactions = createTaxTransactionList(100, TaxTransactionStatusConstant.OPEN);
        when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter("status", TaxTransactionStatusConstant.OPEN))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(transactions);

        // Act
        List<TaxTransaction> result = taxTransactionDao.getOpenTaxTransactionList();

        // Assert
        assertThat(result).hasSize(100);
    }

    @Test
    @DisplayName("Should return same list on multiple calls for closed transactions")
    void getClosedTaxTransactionListReturnsConsistentResults() {
        // Arrange
        List<TaxTransaction> transactions = createTaxTransactionList(3, TaxTransactionStatusConstant.CLOSE);
        when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter("status", TaxTransactionStatusConstant.CLOSE))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(transactions);

        // Act
        List<TaxTransaction> result1 = taxTransactionDao.getClosedTaxTransactionList();
        List<TaxTransaction> result2 = taxTransactionDao.getClosedTaxTransactionList();

        // Assert
        assertThat(result1).isEqualTo(result2);
    }

    @Test
    @DisplayName("Should return same list on multiple calls for open transactions")
    void getOpenTaxTransactionListReturnsConsistentResults() {
        // Arrange
        List<TaxTransaction> transactions = createTaxTransactionList(3, TaxTransactionStatusConstant.OPEN);
        when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter("status", TaxTransactionStatusConstant.OPEN))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(transactions);

        // Act
        List<TaxTransaction> result1 = taxTransactionDao.getOpenTaxTransactionList();
        List<TaxTransaction> result2 = taxTransactionDao.getOpenTaxTransactionList();

        // Assert
        assertThat(result1).isEqualTo(result2);
    }

    @Test
    @DisplayName("Should properly check list null and empty for closed transactions")
    void getClosedTaxTransactionListProperlyChecksNullAndEmpty() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter("status", TaxTransactionStatusConstant.CLOSE))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<TaxTransaction> result = taxTransactionDao.getClosedTaxTransactionList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should properly check list null and empty for open transactions")
    void getOpenTaxTransactionListProperlyChecksNullAndEmpty() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter("status", TaxTransactionStatusConstant.OPEN))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<TaxTransaction> result = taxTransactionDao.getOpenTaxTransactionList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should maintain transaction properties for closed transactions")
    void getClosedTaxTransactionListMaintainsProperties() {
        // Arrange
        TaxTransaction transaction = createTaxTransaction(1, TaxTransactionStatusConstant.CLOSE);
        transaction.setAmount(new BigDecimal("100.50"));
        when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter("status", TaxTransactionStatusConstant.CLOSE))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(Collections.singletonList(transaction));

        // Act
        List<TaxTransaction> result = taxTransactionDao.getClosedTaxTransactionList();

        // Assert
        assertThat(result.get(0).getAmount()).isEqualByComparingTo(new BigDecimal("100.50"));
    }

    @Test
    @DisplayName("Should maintain transaction properties for open transactions")
    void getOpenTaxTransactionListMaintainsProperties() {
        // Arrange
        TaxTransaction transaction = createTaxTransaction(1, TaxTransactionStatusConstant.OPEN);
        transaction.setAmount(new BigDecimal("200.75"));
        when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.setParameter("status", TaxTransactionStatusConstant.OPEN))
            .thenReturn(taxTransactionTypedQuery);
        when(taxTransactionTypedQuery.getResultList())
            .thenReturn(Collections.singletonList(transaction));

        // Act
        List<TaxTransaction> result = taxTransactionDao.getOpenTaxTransactionList();

        // Assert
        assertThat(result.get(0).getAmount()).isEqualByComparingTo(new BigDecimal("200.75"));
    }

    private List<TaxTransaction> createTaxTransactionList(int count, String status) {
        List<TaxTransaction> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            list.add(createTaxTransaction(i + 1, status));
        }
        return list;
    }

    private TaxTransaction createTaxTransaction(int id, String status) {
        TaxTransaction transaction = new TaxTransaction();
        transaction.setTaxTransactionId(id);
        transaction.setStatus(status);
        transaction.setAmount(new BigDecimal("100.00"));
        transaction.setTransactionDate(LocalDateTime.now());
        return transaction;
    }
}
