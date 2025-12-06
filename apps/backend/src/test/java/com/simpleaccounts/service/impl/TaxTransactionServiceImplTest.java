package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.TaxTransactionDao;
import com.simpleaccounts.entity.TaxTransaction;
import com.simpleaccounts.exceptions.ServiceException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TaxTransactionServiceImplTest {

    @Mock
    private TaxTransactionDao taxTransactionDao;

    @InjectMocks
    private TaxTransactionServiceImpl taxTransactionService;

    private TaxTransaction openTaxTransaction1;
    private TaxTransaction openTaxTransaction2;
    private TaxTransaction closedTaxTransaction1;
    private TaxTransaction closedTaxTransaction2;

    @BeforeEach
    void setUp() {
        openTaxTransaction1 = new TaxTransaction();
        openTaxTransaction1.setTaxTransactionId(1);
        openTaxTransaction1.setTransactionDate(LocalDate.of(2025, 1, 1));
        openTaxTransaction1.setAmount(BigDecimal.valueOf(1000.00));
        openTaxTransaction1.setTaxAmount(BigDecimal.valueOf(50.00));
        openTaxTransaction1.setStatus("OPEN");
        openTaxTransaction1.setClosed(false);

        openTaxTransaction2 = new TaxTransaction();
        openTaxTransaction2.setTaxTransactionId(2);
        openTaxTransaction2.setTransactionDate(LocalDate.of(2025, 1, 15));
        openTaxTransaction2.setAmount(BigDecimal.valueOf(2000.00));
        openTaxTransaction2.setTaxAmount(BigDecimal.valueOf(100.00));
        openTaxTransaction2.setStatus("OPEN");
        openTaxTransaction2.setClosed(false);

        closedTaxTransaction1 = new TaxTransaction();
        closedTaxTransaction1.setTaxTransactionId(3);
        closedTaxTransaction1.setTransactionDate(LocalDate.of(2024, 12, 1));
        closedTaxTransaction1.setAmount(BigDecimal.valueOf(1500.00));
        closedTaxTransaction1.setTaxAmount(BigDecimal.valueOf(75.00));
        closedTaxTransaction1.setStatus("CLOSED");
        closedTaxTransaction1.setClosed(true);

        closedTaxTransaction2 = new TaxTransaction();
        closedTaxTransaction2.setTaxTransactionId(4);
        closedTaxTransaction2.setTransactionDate(LocalDate.of(2024, 11, 15));
        closedTaxTransaction2.setAmount(BigDecimal.valueOf(3000.00));
        closedTaxTransaction2.setTaxAmount(BigDecimal.valueOf(150.00));
        closedTaxTransaction2.setStatus("CLOSED");
        closedTaxTransaction2.setClosed(true);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnTaxTransactionDaoWhenGetDaoCalled() {
        assertThat(taxTransactionService.getDao()).isEqualTo(taxTransactionDao);
    }

    @Test
    void shouldReturnNonNullDaoInstance() {
        assertThat(taxTransactionService.getDao()).isNotNull();
    }

    // ========== getClosedTaxTransactionList Tests ==========

    @Test
    void shouldReturnClosedTransactionsWhenClosedTransactionsExist() {
        List<TaxTransaction> expectedList = Arrays.asList(closedTaxTransaction1, closedTaxTransaction2);
        when(taxTransactionDao.getClosedTaxTransactionList()).thenReturn(expectedList);

        List<TaxTransaction> result = taxTransactionService.getClosedTaxTransactionList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(closedTaxTransaction1, closedTaxTransaction2);
        verify(taxTransactionDao, times(1)).getClosedTaxTransactionList();
    }

    @Test
    void shouldReturnEmptyListWhenNoClosedTransactionsExist() {
        when(taxTransactionDao.getClosedTaxTransactionList()).thenReturn(Collections.emptyList());

        List<TaxTransaction> result = taxTransactionService.getClosedTaxTransactionList();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(taxTransactionDao, times(1)).getClosedTaxTransactionList();
    }

    @Test
    void shouldReturnSingleClosedTransactionWhenOnlyOneExists() {
        List<TaxTransaction> expectedList = Collections.singletonList(closedTaxTransaction1);
        when(taxTransactionDao.getClosedTaxTransactionList()).thenReturn(expectedList);

        List<TaxTransaction> result = taxTransactionService.getClosedTaxTransactionList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(closedTaxTransaction1);
        assertThat(result.get(0).getStatus()).isEqualTo("CLOSED");
        assertThat(result.get(0).isClosed()).isTrue();
        verify(taxTransactionDao, times(1)).getClosedTaxTransactionList();
    }

    @Test
    void shouldReturnNullWhenDaoReturnsNull() {
        when(taxTransactionDao.getClosedTaxTransactionList()).thenReturn(null);

        List<TaxTransaction> result = taxTransactionService.getClosedTaxTransactionList();

        assertThat(result).isNull();
        verify(taxTransactionDao, times(1)).getClosedTaxTransactionList();
    }

    @Test
    void shouldReturnClosedTransactionsWithCompleteData() {
        TaxTransaction detailedClosed = new TaxTransaction();
        detailedClosed.setTaxTransactionId(10);
        detailedClosed.setTransactionDate(LocalDate.of(2024, 10, 15));
        detailedClosed.setAmount(BigDecimal.valueOf(5000.00));
        detailedClosed.setTaxAmount(BigDecimal.valueOf(250.00));
        detailedClosed.setStatus("CLOSED");
        detailedClosed.setClosed(true);
        detailedClosed.setDescription("Completed Tax Transaction");

        List<TaxTransaction> expectedList = Collections.singletonList(detailedClosed);
        when(taxTransactionDao.getClosedTaxTransactionList()).thenReturn(expectedList);

        List<TaxTransaction> result = taxTransactionService.getClosedTaxTransactionList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTaxTransactionId()).isEqualTo(10);
        assertThat(result.get(0).getAmount()).isEqualByComparingTo(BigDecimal.valueOf(5000.00));
        assertThat(result.get(0).getTaxAmount()).isEqualByComparingTo(BigDecimal.valueOf(250.00));
        assertThat(result.get(0).getDescription()).isEqualTo("Completed Tax Transaction");
        verify(taxTransactionDao, times(1)).getClosedTaxTransactionList();
    }

    @Test
    void shouldHandleMultipleCallsToGetClosedTransactions() {
        List<TaxTransaction> expectedList = Arrays.asList(closedTaxTransaction1);
        when(taxTransactionDao.getClosedTaxTransactionList()).thenReturn(expectedList);

        List<TaxTransaction> result1 = taxTransactionService.getClosedTaxTransactionList();
        List<TaxTransaction> result2 = taxTransactionService.getClosedTaxTransactionList();

        assertThat(result1).hasSize(1);
        assertThat(result2).hasSize(1);
        verify(taxTransactionDao, times(2)).getClosedTaxTransactionList();
    }

    @Test
    void shouldReturnLargeListOfClosedTransactions() {
        List<TaxTransaction> largeList = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            TaxTransaction transaction = new TaxTransaction();
            transaction.setTaxTransactionId(i);
            transaction.setStatus("CLOSED");
            transaction.setClosed(true);
            transaction.setAmount(BigDecimal.valueOf(i * 100));
            largeList.add(transaction);
        }

        when(taxTransactionDao.getClosedTaxTransactionList()).thenReturn(largeList);

        List<TaxTransaction> result = taxTransactionService.getClosedTaxTransactionList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(100);
        assertThat(result.get(0).getTaxTransactionId()).isEqualTo(1);
        assertThat(result.get(99).getTaxTransactionId()).isEqualTo(100);
        verify(taxTransactionDao, times(1)).getClosedTaxTransactionList();
    }

    @Test
    void shouldVerifyOnlyClosedTransactionsReturned() {
        List<TaxTransaction> expectedList = Arrays.asList(closedTaxTransaction1, closedTaxTransaction2);
        when(taxTransactionDao.getClosedTaxTransactionList()).thenReturn(expectedList);

        List<TaxTransaction> result = taxTransactionService.getClosedTaxTransactionList();

        assertThat(result).isNotNull();
        assertThat(result).allMatch(TaxTransaction::isClosed);
        assertThat(result).allMatch(t -> "CLOSED".equals(t.getStatus()));
        verify(taxTransactionDao, times(1)).getClosedTaxTransactionList();
    }

    // ========== getOpenTaxTransactionList Tests ==========

    @Test
    void shouldReturnOpenTransactionsWhenOpenTransactionsExist() {
        List<TaxTransaction> expectedList = Arrays.asList(openTaxTransaction1, openTaxTransaction2);
        when(taxTransactionDao.getOpenTaxTransactionList()).thenReturn(expectedList);

        List<TaxTransaction> result = taxTransactionService.getOpenTaxTransactionList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(openTaxTransaction1, openTaxTransaction2);
        verify(taxTransactionDao, times(1)).getOpenTaxTransactionList();
    }

    @Test
    void shouldReturnEmptyListWhenNoOpenTransactionsExist() {
        when(taxTransactionDao.getOpenTaxTransactionList()).thenReturn(Collections.emptyList());

        List<TaxTransaction> result = taxTransactionService.getOpenTaxTransactionList();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(taxTransactionDao, times(1)).getOpenTaxTransactionList();
    }

    @Test
    void shouldReturnSingleOpenTransactionWhenOnlyOneExists() {
        List<TaxTransaction> expectedList = Collections.singletonList(openTaxTransaction1);
        when(taxTransactionDao.getOpenTaxTransactionList()).thenReturn(expectedList);

        List<TaxTransaction> result = taxTransactionService.getOpenTaxTransactionList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(openTaxTransaction1);
        assertThat(result.get(0).getStatus()).isEqualTo("OPEN");
        assertThat(result.get(0).isClosed()).isFalse();
        verify(taxTransactionDao, times(1)).getOpenTaxTransactionList();
    }

    @Test
    void shouldReturnNullWhenDaoReturnsNullForOpenTransactions() {
        when(taxTransactionDao.getOpenTaxTransactionList()).thenReturn(null);

        List<TaxTransaction> result = taxTransactionService.getOpenTaxTransactionList();

        assertThat(result).isNull();
        verify(taxTransactionDao, times(1)).getOpenTaxTransactionList();
    }

    @Test
    void shouldReturnOpenTransactionsWithCompleteData() {
        TaxTransaction detailedOpen = new TaxTransaction();
        detailedOpen.setTaxTransactionId(20);
        detailedOpen.setTransactionDate(LocalDate.of(2025, 2, 1));
        detailedOpen.setAmount(BigDecimal.valueOf(7500.00));
        detailedOpen.setTaxAmount(BigDecimal.valueOf(375.00));
        detailedOpen.setStatus("OPEN");
        detailedOpen.setClosed(false);
        detailedOpen.setDescription("Pending Tax Transaction");

        List<TaxTransaction> expectedList = Collections.singletonList(detailedOpen);
        when(taxTransactionDao.getOpenTaxTransactionList()).thenReturn(expectedList);

        List<TaxTransaction> result = taxTransactionService.getOpenTaxTransactionList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTaxTransactionId()).isEqualTo(20);
        assertThat(result.get(0).getAmount()).isEqualByComparingTo(BigDecimal.valueOf(7500.00));
        assertThat(result.get(0).getTaxAmount()).isEqualByComparingTo(BigDecimal.valueOf(375.00));
        assertThat(result.get(0).getDescription()).isEqualTo("Pending Tax Transaction");
        verify(taxTransactionDao, times(1)).getOpenTaxTransactionList();
    }

    @Test
    void shouldHandleMultipleCallsToGetOpenTransactions() {
        List<TaxTransaction> expectedList = Arrays.asList(openTaxTransaction1, openTaxTransaction2);
        when(taxTransactionDao.getOpenTaxTransactionList()).thenReturn(expectedList);

        List<TaxTransaction> result1 = taxTransactionService.getOpenTaxTransactionList();
        List<TaxTransaction> result2 = taxTransactionService.getOpenTaxTransactionList();

        assertThat(result1).hasSize(2);
        assertThat(result2).hasSize(2);
        verify(taxTransactionDao, times(2)).getOpenTaxTransactionList();
    }

    @Test
    void shouldReturnLargeListOfOpenTransactions() {
        List<TaxTransaction> largeList = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            TaxTransaction transaction = new TaxTransaction();
            transaction.setTaxTransactionId(i);
            transaction.setStatus("OPEN");
            transaction.setClosed(false);
            transaction.setAmount(BigDecimal.valueOf(i * 50));
            largeList.add(transaction);
        }

        when(taxTransactionDao.getOpenTaxTransactionList()).thenReturn(largeList);

        List<TaxTransaction> result = taxTransactionService.getOpenTaxTransactionList();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(50);
        assertThat(result.get(0).getTaxTransactionId()).isEqualTo(1);
        assertThat(result.get(49).getTaxTransactionId()).isEqualTo(50);
        verify(taxTransactionDao, times(1)).getOpenTaxTransactionList();
    }

    @Test
    void shouldVerifyOnlyOpenTransactionsReturned() {
        List<TaxTransaction> expectedList = Arrays.asList(openTaxTransaction1, openTaxTransaction2);
        when(taxTransactionDao.getOpenTaxTransactionList()).thenReturn(expectedList);

        List<TaxTransaction> result = taxTransactionService.getOpenTaxTransactionList();

        assertThat(result).isNotNull();
        assertThat(result).allMatch(t -> !t.isClosed());
        assertThat(result).allMatch(t -> "OPEN".equals(t.getStatus()));
        verify(taxTransactionDao, times(1)).getOpenTaxTransactionList();
    }

    @Test
    void shouldHandleConsecutiveCallsToBothMethods() {
        when(taxTransactionDao.getOpenTaxTransactionList())
                .thenReturn(Arrays.asList(openTaxTransaction1, openTaxTransaction2));
        when(taxTransactionDao.getClosedTaxTransactionList())
                .thenReturn(Arrays.asList(closedTaxTransaction1, closedTaxTransaction2));

        List<TaxTransaction> openList = taxTransactionService.getOpenTaxTransactionList();
        List<TaxTransaction> closedList = taxTransactionService.getClosedTaxTransactionList();

        assertThat(openList).hasSize(2);
        assertThat(closedList).hasSize(2);
        assertThat(openList).allMatch(t -> !t.isClosed());
        assertThat(closedList).allMatch(TaxTransaction::isClosed);
        verify(taxTransactionDao, times(1)).getOpenTaxTransactionList();
        verify(taxTransactionDao, times(1)).getClosedTaxTransactionList();
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindTaxTransactionByPrimaryKey() {
        when(taxTransactionDao.findByPK(1)).thenReturn(openTaxTransaction1);

        TaxTransaction result = taxTransactionService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(openTaxTransaction1);
        assertThat(result.getTaxTransactionId()).isEqualTo(1);
        verify(taxTransactionDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenTaxTransactionNotFoundByPK() {
        when(taxTransactionDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> taxTransactionService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(taxTransactionDao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewTaxTransaction() {
        taxTransactionService.persist(openTaxTransaction1);

        verify(taxTransactionDao, times(1)).persist(openTaxTransaction1);
    }

    @Test
    void shouldPersistMultipleTaxTransactions() {
        taxTransactionService.persist(openTaxTransaction1);
        taxTransactionService.persist(openTaxTransaction2);
        taxTransactionService.persist(closedTaxTransaction1);

        verify(taxTransactionDao, times(1)).persist(openTaxTransaction1);
        verify(taxTransactionDao, times(1)).persist(openTaxTransaction2);
        verify(taxTransactionDao, times(1)).persist(closedTaxTransaction1);
    }

    @Test
    void shouldUpdateExistingTaxTransaction() {
        when(taxTransactionDao.update(openTaxTransaction1)).thenReturn(openTaxTransaction1);

        TaxTransaction result = taxTransactionService.update(openTaxTransaction1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(openTaxTransaction1);
        verify(taxTransactionDao, times(1)).update(openTaxTransaction1);
    }

    @Test
    void shouldUpdateTaxTransactionAndReturnUpdatedEntity() {
        openTaxTransaction1.setStatus("CLOSED");
        openTaxTransaction1.setClosed(true);
        openTaxTransaction1.setAmount(BigDecimal.valueOf(1200.00));
        when(taxTransactionDao.update(openTaxTransaction1)).thenReturn(openTaxTransaction1);

        TaxTransaction result = taxTransactionService.update(openTaxTransaction1);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo("CLOSED");
        assertThat(result.isClosed()).isTrue();
        assertThat(result.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(1200.00));
        verify(taxTransactionDao, times(1)).update(openTaxTransaction1);
    }

    @Test
    void shouldDeleteTaxTransaction() {
        taxTransactionService.delete(openTaxTransaction1);

        verify(taxTransactionDao, times(1)).delete(openTaxTransaction1);
    }

    @Test
    void shouldDeleteMultipleTaxTransactions() {
        taxTransactionService.delete(openTaxTransaction1);
        taxTransactionService.delete(closedTaxTransaction1);

        verify(taxTransactionDao, times(1)).delete(openTaxTransaction1);
        verify(taxTransactionDao, times(1)).delete(closedTaxTransaction1);
    }

    @Test
    void shouldFindTaxTransactionsByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("status", "OPEN");

        List<TaxTransaction> expectedList = Arrays.asList(openTaxTransaction1, openTaxTransaction2);
        when(taxTransactionDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<TaxTransaction> result = taxTransactionService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(openTaxTransaction1, openTaxTransaction2);
        verify(taxTransactionDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("status", "PENDING");

        when(taxTransactionDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<TaxTransaction> result = taxTransactionService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(taxTransactionDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<TaxTransaction> result = taxTransactionService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(taxTransactionDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<TaxTransaction> result = taxTransactionService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(taxTransactionDao, never()).findByAttributes(any());
    }

    @Test
    void shouldFindTaxTransactionsByMultipleAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("status", "OPEN");
        attributes.put("closed", false);

        List<TaxTransaction> expectedList = Arrays.asList(openTaxTransaction1, openTaxTransaction2);
        when(taxTransactionDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<TaxTransaction> result = taxTransactionService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).allMatch(t -> "OPEN".equals(t.getStatus()));
        assertThat(result).allMatch(t -> !t.isClosed());
        verify(taxTransactionDao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleTaxTransactionWithMinimalData() {
        TaxTransaction minimalTransaction = new TaxTransaction();
        minimalTransaction.setTaxTransactionId(99);

        when(taxTransactionDao.findByPK(99)).thenReturn(minimalTransaction);

        TaxTransaction result = taxTransactionService.findByPK(99);

        assertThat(result).isNotNull();
        assertThat(result.getTaxTransactionId()).isEqualTo(99);
        assertThat(result.getStatus()).isNull();
        assertThat(result.getAmount()).isNull();
        verify(taxTransactionDao, times(1)).findByPK(99);
    }

    @Test
    void shouldHandleTaxTransactionWithZeroAmounts() {
        TaxTransaction zeroTransaction = new TaxTransaction();
        zeroTransaction.setTaxTransactionId(50);
        zeroTransaction.setAmount(BigDecimal.ZERO);
        zeroTransaction.setTaxAmount(BigDecimal.ZERO);

        when(taxTransactionDao.findByPK(50)).thenReturn(zeroTransaction);

        TaxTransaction result = taxTransactionService.findByPK(50);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.getTaxAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        verify(taxTransactionDao, times(1)).findByPK(50);
    }

    @Test
    void shouldHandleTaxTransactionWithNegativeAmounts() {
        TaxTransaction negativeTransaction = new TaxTransaction();
        negativeTransaction.setTaxTransactionId(60);
        negativeTransaction.setAmount(BigDecimal.valueOf(-1000.00));
        negativeTransaction.setTaxAmount(BigDecimal.valueOf(-50.00));

        when(taxTransactionDao.findByPK(60)).thenReturn(negativeTransaction);

        TaxTransaction result = taxTransactionService.findByPK(60);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(-1000.00));
        assertThat(result.getTaxAmount()).isEqualByComparingTo(BigDecimal.valueOf(-50.00));
        verify(taxTransactionDao, times(1)).findByPK(60);
    }

    @Test
    void shouldHandleTaxTransactionWithLargeAmounts() {
        TaxTransaction largeTransaction = new TaxTransaction();
        largeTransaction.setTaxTransactionId(70);
        largeTransaction.setAmount(BigDecimal.valueOf(999999999.99));
        largeTransaction.setTaxAmount(BigDecimal.valueOf(49999999.99));

        when(taxTransactionDao.findByPK(70)).thenReturn(largeTransaction);

        TaxTransaction result = taxTransactionService.findByPK(70);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(999999999.99));
        assertThat(result.getTaxAmount()).isEqualByComparingTo(BigDecimal.valueOf(49999999.99));
        verify(taxTransactionDao, times(1)).findByPK(70);
    }

    @Test
    void shouldHandleTaxTransactionWithEmptyStrings() {
        TaxTransaction emptyTransaction = new TaxTransaction();
        emptyTransaction.setTaxTransactionId(80);
        emptyTransaction.setStatus("");
        emptyTransaction.setDescription("");

        when(taxTransactionDao.findByPK(80)).thenReturn(emptyTransaction);

        TaxTransaction result = taxTransactionService.findByPK(80);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEmpty();
        assertThat(result.getDescription()).isEmpty();
        verify(taxTransactionDao, times(1)).findByPK(80);
    }

    @Test
    void shouldVerifyDaoInteractionForMultipleOperations() {
        when(taxTransactionDao.getOpenTaxTransactionList())
                .thenReturn(Arrays.asList(openTaxTransaction1));
        when(taxTransactionDao.getClosedTaxTransactionList())
                .thenReturn(Arrays.asList(closedTaxTransaction1));
        when(taxTransactionDao.findByPK(1)).thenReturn(openTaxTransaction1);

        taxTransactionService.getOpenTaxTransactionList();
        taxTransactionService.getClosedTaxTransactionList();
        taxTransactionService.findByPK(1);

        verify(taxTransactionDao, times(1)).getOpenTaxTransactionList();
        verify(taxTransactionDao, times(1)).getClosedTaxTransactionList();
        verify(taxTransactionDao, times(1)).findByPK(1);
    }

    @Test
    void shouldHandleMixedStatusTransactions() {
        List<TaxTransaction> openList = Arrays.asList(openTaxTransaction1, openTaxTransaction2);
        List<TaxTransaction> closedList = Arrays.asList(closedTaxTransaction1, closedTaxTransaction2);

        when(taxTransactionDao.getOpenTaxTransactionList()).thenReturn(openList);
        when(taxTransactionDao.getClosedTaxTransactionList()).thenReturn(closedList);

        List<TaxTransaction> openResult = taxTransactionService.getOpenTaxTransactionList();
        List<TaxTransaction> closedResult = taxTransactionService.getClosedTaxTransactionList();

        assertThat(openResult).hasSize(2);
        assertThat(closedResult).hasSize(2);
        assertThat(openResult).noneMatch(TaxTransaction::isClosed);
        assertThat(closedResult).allMatch(TaxTransaction::isClosed);
    }

    @Test
    void shouldHandleNullDatesInTransactions() {
        TaxTransaction nullDateTransaction = new TaxTransaction();
        nullDateTransaction.setTaxTransactionId(90);
        nullDateTransaction.setTransactionDate(null);

        when(taxTransactionDao.findByPK(90)).thenReturn(nullDateTransaction);

        TaxTransaction result = taxTransactionService.findByPK(90);

        assertThat(result).isNotNull();
        assertThat(result.getTransactionDate()).isNull();
        verify(taxTransactionDao, times(1)).findByPK(90);
    }
}
