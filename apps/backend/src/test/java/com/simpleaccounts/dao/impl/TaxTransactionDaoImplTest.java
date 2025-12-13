package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.constant.TaxTransactionStatusConstant;
import com.simpleaccounts.entity.TaxTransaction;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import javax.persistence.EntityManager;
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
@DisplayName("TaxTransactionDaoImpl Unit Tests")
class TaxTransactionDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<TaxTransaction> typedQuery;

    @InjectMocks
    private TaxTransactionDaoImpl taxTransactionDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(taxTransactionDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(taxTransactionDao, "entityClass", TaxTransaction.class);
    }

    @Nested
    @DisplayName("getClosedTaxTransactionList Tests")
    class GetClosedTaxTransactionListTests {

        @Test
        @DisplayName("Should return list of closed tax transactions")
        void getClosedTaxTransactionListReturnsList() {
            // Arrange
            List<TaxTransaction> expectedList = createTaxTransactionList(3, TaxTransactionStatusConstant.CLOSE);
            when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
                .thenReturn(typedQuery);
            when(typedQuery.setParameter(CommonColumnConstants.STATUS, TaxTransactionStatusConstant.CLOSE))
                .thenReturn(typedQuery);
            when(typedQuery.getResultList()).thenReturn(expectedList);

            // Act
            List<TaxTransaction> result = taxTransactionDao.getClosedTaxTransactionList();

            // Assert
            assertThat(result).isNotNull().hasSize(3);
            verify(typedQuery).setParameter(CommonColumnConstants.STATUS, TaxTransactionStatusConstant.CLOSE);
        }

        @Test
        @DisplayName("Should return empty list when no closed transactions")
        void getClosedTaxTransactionListReturnsEmptyList() {
            // Arrange
            when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
                .thenReturn(typedQuery);
            when(typedQuery.setParameter(CommonColumnConstants.STATUS, TaxTransactionStatusConstant.CLOSE))
                .thenReturn(typedQuery);
            when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

            // Act
            List<TaxTransaction> result = taxTransactionDao.getClosedTaxTransactionList();

            // Assert
            assertThat(result).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("Should return null when query returns null")
        void getClosedTaxTransactionListReturnsNull() {
            // Arrange
            when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
                .thenReturn(typedQuery);
            when(typedQuery.setParameter(CommonColumnConstants.STATUS, TaxTransactionStatusConstant.CLOSE))
                .thenReturn(typedQuery);
            when(typedQuery.getResultList()).thenReturn(null);

            // Act
            List<TaxTransaction> result = taxTransactionDao.getClosedTaxTransactionList();

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("getOpenTaxTransactionList Tests")
    class GetOpenTaxTransactionListTests {

        @Test
        @DisplayName("Should return list of open tax transactions")
        void getOpenTaxTransactionListReturnsList() {
            // Arrange
            List<TaxTransaction> expectedList = createTaxTransactionList(5, TaxTransactionStatusConstant.OPEN);
            when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
                .thenReturn(typedQuery);
            when(typedQuery.setParameter(CommonColumnConstants.STATUS, TaxTransactionStatusConstant.OPEN))
                .thenReturn(typedQuery);
            when(typedQuery.getResultList()).thenReturn(expectedList);

            // Act
            List<TaxTransaction> result = taxTransactionDao.getOpenTaxTransactionList();

            // Assert
            assertThat(result).isNotNull().hasSize(5);
            verify(typedQuery).setParameter(CommonColumnConstants.STATUS, TaxTransactionStatusConstant.OPEN);
        }

        @Test
        @DisplayName("Should return empty list when no open transactions")
        void getOpenTaxTransactionListReturnsEmptyList() {
            // Arrange
            when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
                .thenReturn(typedQuery);
            when(typedQuery.setParameter(CommonColumnConstants.STATUS, TaxTransactionStatusConstant.OPEN))
                .thenReturn(typedQuery);
            when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

            // Act
            List<TaxTransaction> result = taxTransactionDao.getOpenTaxTransactionList();

            // Assert
            assertThat(result).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("Should return null when query returns null")
        void getOpenTaxTransactionListReturnsNull() {
            // Arrange
            when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
                .thenReturn(typedQuery);
            when(typedQuery.setParameter(CommonColumnConstants.STATUS, TaxTransactionStatusConstant.OPEN))
                .thenReturn(typedQuery);
            when(typedQuery.getResultList()).thenReturn(null);

            // Act
            List<TaxTransaction> result = taxTransactionDao.getOpenTaxTransactionList();

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("Multiple Transactions Tests")
    class MultipleTransactionsTests {

        @Test
        @DisplayName("Should differentiate between open and closed transactions")
        void shouldDifferentiateTransactionsByStatus() {
            // Arrange
            List<TaxTransaction> openList = createTaxTransactionList(2, TaxTransactionStatusConstant.OPEN);
            List<TaxTransaction> closedList = createTaxTransactionList(3, TaxTransactionStatusConstant.CLOSE);

            when(entityManager.createQuery(anyString(), eq(TaxTransaction.class)))
                .thenReturn(typedQuery);
            when(typedQuery.setParameter(CommonColumnConstants.STATUS, TaxTransactionStatusConstant.OPEN))
                .thenReturn(typedQuery);
            when(typedQuery.setParameter(CommonColumnConstants.STATUS, TaxTransactionStatusConstant.CLOSE))
                .thenReturn(typedQuery);

            // For open transactions
            when(typedQuery.getResultList()).thenReturn(openList, closedList);

            // Act
            when(typedQuery.setParameter(CommonColumnConstants.STATUS, TaxTransactionStatusConstant.OPEN))
                .thenReturn(typedQuery);
            when(typedQuery.getResultList()).thenReturn(openList);
            List<TaxTransaction> openResult = taxTransactionDao.getOpenTaxTransactionList();

            when(typedQuery.setParameter(CommonColumnConstants.STATUS, TaxTransactionStatusConstant.CLOSE))
                .thenReturn(typedQuery);
            when(typedQuery.getResultList()).thenReturn(closedList);
            List<TaxTransaction> closedResult = taxTransactionDao.getClosedTaxTransactionList();

            // Assert
            assertThat(openResult).hasSize(2);
            assertThat(closedResult).hasSize(3);
        }
    }

    private List<TaxTransaction> createTaxTransactionList(int count, String status) {
        List<TaxTransaction> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            list.add(createTaxTransaction(i + 1, status));
        }
        return list;
    }

    private TaxTransaction createTaxTransaction(Integer id, String status) {
        TaxTransaction transaction = new TaxTransaction();
        transaction.setTaxTransactionId(id);
        transaction.setStatus(status);
        transaction.setVatIn(BigDecimal.valueOf(1000));
        transaction.setVatOut(BigDecimal.valueOf(800));
        transaction.setDueAmount(BigDecimal.valueOf(200));
        transaction.setPaidAmount(BigDecimal.ZERO);
        transaction.setStartDate(new Date());
        transaction.setEndDate(new Date());
        transaction.setCreatedBy(1);
        transaction.setCreatedDate(LocalDateTime.now());
        return transaction;
    }
}
