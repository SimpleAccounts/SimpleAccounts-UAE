package com.simpleaccounts.service.impl.bankaccount;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.criteria.bankaccount.ImportedDraftTransactionCriteria;
import com.simpleaccounts.criteria.bankaccount.ImportedDraftTransactionFilter;
import com.simpleaccounts.dao.bankaccount.ImportedDraftTransactonDao;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.ImportedDraftTransaction;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ImportedDraftTransactonServiceImplTest {

    @Mock
    private ImportedDraftTransactonDao importedDraftTransactonDao;

    @InjectMocks
    private ImportedDraftTransactonServiceImpl importedDraftTransactonService;

    private ImportedDraftTransaction testTransaction;
    private BankAccount testBankAccount;
    private ImportedDraftTransactionCriteria testCriteria;

    @BeforeEach
    void setUp() {
        testBankAccount = new BankAccount();
        testBankAccount.setBankAccountId(1);
        testBankAccount.setBankAccountName("Test Bank Account");

        testTransaction = new ImportedDraftTransaction();
        testTransaction.setImportedTransactionId(1);
        testTransaction.setImportedTransactionDescription("Test Transaction");
        testTransaction.setImportedTransactionAmount(BigDecimal.valueOf(500.00));
        testTransaction.setImportedDebitCreditFlag('D');
        testTransaction.setImportedTransactionDate(LocalDateTime.now());
        testTransaction.setBankAccount(testBankAccount);
        testTransaction.setCreatedBy(1);
        testTransaction.setCreatedDate(LocalDateTime.now());
        testTransaction.setDeleteFlag(false);

        testCriteria = new ImportedDraftTransactionCriteria();
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnImportedDraftTransactonDaoWhenGetDaoCalled() {
        assertThat(importedDraftTransactonService.getDao()).isEqualTo(importedDraftTransactonDao);
    }

    @Test
    void shouldReturnSameDaoInstanceOnMultipleCalls() {
        assertThat(importedDraftTransactonService.getDao()).isEqualTo(importedDraftTransactonDao);
        assertThat(importedDraftTransactonService.getDao()).isEqualTo(importedDraftTransactonDao);
    }

    // ========== getImportedDraftTransactionsByCriteria Tests ==========

    @Test
    void shouldReturnImportedDraftTransactionsWhenValidCriteriaProvided() throws Exception {
        List<ImportedDraftTransaction> expectedList = Arrays.asList(testTransaction);
        when(importedDraftTransactonDao.filter(any(ImportedDraftTransactionFilter.class))).thenReturn(expectedList);

        List<ImportedDraftTransaction> result = importedDraftTransactonService
                .getImportedDraftTransactionsByCriteria(testCriteria);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testTransaction);
        verify(importedDraftTransactonDao, times(1)).filter(any(ImportedDraftTransactionFilter.class));
    }

    @Test
    void shouldReturnEmptyListWhenNoCriteriaMatches() throws Exception {
        when(importedDraftTransactonDao.filter(any(ImportedDraftTransactionFilter.class)))
                .thenReturn(Collections.emptyList());

        List<ImportedDraftTransaction> result = importedDraftTransactonService
                .getImportedDraftTransactionsByCriteria(testCriteria);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(importedDraftTransactonDao, times(1)).filter(any(ImportedDraftTransactionFilter.class));
    }

    @Test
    void shouldReturnMultipleTransactionsWhenMultipleMatch() throws Exception {
        ImportedDraftTransaction transaction2 = new ImportedDraftTransaction();
        transaction2.setImportedTransactionId(2);
        transaction2.setImportedTransactionDescription("Second Transaction");
        transaction2.setImportedTransactionAmount(BigDecimal.valueOf(750.00));
        transaction2.setImportedDebitCreditFlag('C');

        ImportedDraftTransaction transaction3 = new ImportedDraftTransaction();
        transaction3.setImportedTransactionId(3);
        transaction3.setImportedTransactionDescription("Third Transaction");
        transaction3.setImportedTransactionAmount(BigDecimal.valueOf(1000.00));
        transaction3.setImportedDebitCreditFlag('D');

        List<ImportedDraftTransaction> expectedList = Arrays.asList(testTransaction, transaction2, transaction3);
        when(importedDraftTransactonDao.filter(any(ImportedDraftTransactionFilter.class))).thenReturn(expectedList);

        List<ImportedDraftTransaction> result = importedDraftTransactonService
                .getImportedDraftTransactionsByCriteria(testCriteria);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testTransaction, transaction2, transaction3);
        verify(importedDraftTransactonDao, times(1)).filter(any(ImportedDraftTransactionFilter.class));
    }

    @Test
    void shouldHandleNullCriteriaGracefully() throws Exception {
        when(importedDraftTransactonDao.filter(any(ImportedDraftTransactionFilter.class)))
                .thenReturn(Collections.emptyList());

        List<ImportedDraftTransaction> result = importedDraftTransactonService
                .getImportedDraftTransactionsByCriteria(null);

        assertThat(result).isNotNull();
        verify(importedDraftTransactonDao, times(1)).filter(any(ImportedDraftTransactionFilter.class));
    }

    @Test
    void shouldPropagateExceptionWhenDaoThrowsException() throws Exception {
        when(importedDraftTransactonDao.filter(any(ImportedDraftTransactionFilter.class)))
                .thenThrow(new RuntimeException("Database error"));

        assertThatThrownBy(() -> importedDraftTransactonService
                .getImportedDraftTransactionsByCriteria(testCriteria))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Database error");

        verify(importedDraftTransactonDao, times(1)).filter(any(ImportedDraftTransactionFilter.class));
    }

    @Test
    void shouldHandleLargeNumberOfTransactions() throws Exception {
        List<ImportedDraftTransaction> largeList = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            ImportedDraftTransaction transaction = new ImportedDraftTransaction();
            transaction.setImportedTransactionId(i);
            transaction.setImportedTransactionDescription("Transaction " + i);
            transaction.setImportedTransactionAmount(BigDecimal.valueOf(i * 100));
            transaction.setImportedDebitCreditFlag(i % 2 == 0 ? 'C' : 'D');
            largeList.add(transaction);
        }

        when(importedDraftTransactonDao.filter(any(ImportedDraftTransactionFilter.class))).thenReturn(largeList);

        List<ImportedDraftTransaction> result = importedDraftTransactonService
                .getImportedDraftTransactionsByCriteria(testCriteria);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(100);
        assertThat(result.get(0).getImportedTransactionId()).isEqualTo(1);
        assertThat(result.get(99).getImportedTransactionId()).isEqualTo(100);
        verify(importedDraftTransactonDao, times(1)).filter(any(ImportedDraftTransactionFilter.class));
    }

    // ========== updateOrCreateImportedDraftTransaction Tests ==========

    @Test
    void shouldUpdateExistingImportedDraftTransaction() {
        testTransaction.setImportedTransactionDescription("Updated Description");
        when(importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(testTransaction))
                .thenReturn(testTransaction);

        ImportedDraftTransaction result = importedDraftTransactonService
                .updateOrCreateImportedDraftTransaction(testTransaction);

        assertThat(result).isNotNull();
        assertThat(result.getImportedTransactionDescription()).isEqualTo("Updated Description");
        verify(importedDraftTransactonDao, times(1)).updateOrCreateImportedDraftTransaction(testTransaction);
    }

    @Test
    void shouldCreateNewImportedDraftTransaction() {
        ImportedDraftTransaction newTransaction = new ImportedDraftTransaction();
        newTransaction.setImportedTransactionDescription("New Transaction");
        newTransaction.setImportedTransactionAmount(BigDecimal.valueOf(1500.00));
        newTransaction.setImportedDebitCreditFlag('C');
        newTransaction.setImportedTransactionDate(LocalDateTime.now());

        when(importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(newTransaction))
                .thenReturn(newTransaction);

        ImportedDraftTransaction result = importedDraftTransactonService
                .updateOrCreateImportedDraftTransaction(newTransaction);

        assertThat(result).isNotNull();
        assertThat(result.getImportedTransactionDescription()).isEqualTo("New Transaction");
        assertThat(result.getImportedTransactionAmount()).isEqualByComparingTo(BigDecimal.valueOf(1500.00));
        verify(importedDraftTransactonDao, times(1)).updateOrCreateImportedDraftTransaction(newTransaction);
    }

    @Test
    void shouldHandleUpdateWithBankAccount() {
        testTransaction.setBankAccount(testBankAccount);
        when(importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(testTransaction))
                .thenReturn(testTransaction);

        ImportedDraftTransaction result = importedDraftTransactonService
                .updateOrCreateImportedDraftTransaction(testTransaction);

        assertThat(result).isNotNull();
        assertThat(result.getBankAccount()).isNotNull();
        assertThat(result.getBankAccount().getBankAccountId()).isEqualTo(1);
        verify(importedDraftTransactonDao, times(1)).updateOrCreateImportedDraftTransaction(testTransaction);
    }

    @Test
    void shouldUpdateTransactionWithAllFields() {
        testTransaction.setImportedTransactionDescription("Complete Update");
        testTransaction.setImportedTransactionAmount(BigDecimal.valueOf(2500.00));
        testTransaction.setImportedDebitCreditFlag('C');
        testTransaction.setLastUpdateBy(2);
        testTransaction.setLastUpdateDate(LocalDateTime.now());

        when(importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(testTransaction))
                .thenReturn(testTransaction);

        ImportedDraftTransaction result = importedDraftTransactonService
                .updateOrCreateImportedDraftTransaction(testTransaction);

        assertThat(result).isNotNull();
        assertThat(result.getImportedTransactionDescription()).isEqualTo("Complete Update");
        assertThat(result.getImportedTransactionAmount()).isEqualByComparingTo(BigDecimal.valueOf(2500.00));
        assertThat(result.getImportedDebitCreditFlag()).isEqualTo('C');
        verify(importedDraftTransactonDao, times(1)).updateOrCreateImportedDraftTransaction(testTransaction);
    }

    @Test
    void shouldHandleNullTransactionUpdate() {
        when(importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(null)).thenReturn(null);

        ImportedDraftTransaction result = importedDraftTransactonService
                .updateOrCreateImportedDraftTransaction(null);

        assertThat(result).isNull();
        verify(importedDraftTransactonDao, times(1)).updateOrCreateImportedDraftTransaction(null);
    }

    @Test
    void shouldHandleTransactionWithZeroAmount() {
        testTransaction.setImportedTransactionAmount(BigDecimal.ZERO);
        when(importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(testTransaction))
                .thenReturn(testTransaction);

        ImportedDraftTransaction result = importedDraftTransactonService
                .updateOrCreateImportedDraftTransaction(testTransaction);

        assertThat(result).isNotNull();
        assertThat(result.getImportedTransactionAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        verify(importedDraftTransactonDao, times(1)).updateOrCreateImportedDraftTransaction(testTransaction);
    }

    @Test
    void shouldHandleTransactionWithNegativeAmount() {
        testTransaction.setImportedTransactionAmount(BigDecimal.valueOf(-500.00));
        when(importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(testTransaction))
                .thenReturn(testTransaction);

        ImportedDraftTransaction result = importedDraftTransactonService
                .updateOrCreateImportedDraftTransaction(testTransaction);

        assertThat(result).isNotNull();
        assertThat(result.getImportedTransactionAmount()).isEqualByComparingTo(BigDecimal.valueOf(-500.00));
        verify(importedDraftTransactonDao, times(1)).updateOrCreateImportedDraftTransaction(testTransaction);
    }

    @Test
    void shouldHandleTransactionWithVeryLargeAmount() {
        testTransaction.setImportedTransactionAmount(BigDecimal.valueOf(999999999.99));
        when(importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(testTransaction))
                .thenReturn(testTransaction);

        ImportedDraftTransaction result = importedDraftTransactonService
                .updateOrCreateImportedDraftTransaction(testTransaction);

        assertThat(result).isNotNull();
        assertThat(result.getImportedTransactionAmount()).isEqualByComparingTo(BigDecimal.valueOf(999999999.99));
        verify(importedDraftTransactonDao, times(1)).updateOrCreateImportedDraftTransaction(testTransaction);
    }

    // ========== deleteImportedDraftTransaction Tests ==========

    @Test
    void shouldDeleteImportedDraftTransactionWhenValidIdProvided() {
        when(importedDraftTransactonDao.deleteImportedDraftTransaction(1)).thenReturn(true);

        boolean result = importedDraftTransactonService.deleteImportedDraftTransaction(1);

        assertThat(result).isTrue();
        verify(importedDraftTransactonDao, times(1)).deleteImportedDraftTransaction(1);
    }

    @Test
    void shouldReturnFalseWhenDeletionFails() {
        when(importedDraftTransactonDao.deleteImportedDraftTransaction(999)).thenReturn(false);

        boolean result = importedDraftTransactonService.deleteImportedDraftTransaction(999);

        assertThat(result).isFalse();
        verify(importedDraftTransactonDao, times(1)).deleteImportedDraftTransaction(999);
    }

    @Test
    void shouldHandleNullIdInDelete() {
        when(importedDraftTransactonDao.deleteImportedDraftTransaction(null)).thenReturn(false);

        boolean result = importedDraftTransactonService.deleteImportedDraftTransaction(null);

        assertThat(result).isFalse();
        verify(importedDraftTransactonDao, times(1)).deleteImportedDraftTransaction(null);
    }

    @Test
    void shouldDeleteMultipleTransactionsSequentially() {
        when(importedDraftTransactonDao.deleteImportedDraftTransaction(1)).thenReturn(true);
        when(importedDraftTransactonDao.deleteImportedDraftTransaction(2)).thenReturn(true);
        when(importedDraftTransactonDao.deleteImportedDraftTransaction(3)).thenReturn(true);

        boolean result1 = importedDraftTransactonService.deleteImportedDraftTransaction(1);
        boolean result2 = importedDraftTransactonService.deleteImportedDraftTransaction(2);
        boolean result3 = importedDraftTransactonService.deleteImportedDraftTransaction(3);

        assertThat(result1).isTrue();
        assertThat(result2).isTrue();
        assertThat(result3).isTrue();
        verify(importedDraftTransactonDao, times(1)).deleteImportedDraftTransaction(1);
        verify(importedDraftTransactonDao, times(1)).deleteImportedDraftTransaction(2);
        verify(importedDraftTransactonDao, times(1)).deleteImportedDraftTransaction(3);
    }

    @Test
    void shouldHandleMixedDeletionResults() {
        when(importedDraftTransactonDao.deleteImportedDraftTransaction(1)).thenReturn(true);
        when(importedDraftTransactonDao.deleteImportedDraftTransaction(2)).thenReturn(false);
        when(importedDraftTransactonDao.deleteImportedDraftTransaction(3)).thenReturn(true);

        boolean result1 = importedDraftTransactonService.deleteImportedDraftTransaction(1);
        boolean result2 = importedDraftTransactonService.deleteImportedDraftTransaction(2);
        boolean result3 = importedDraftTransactonService.deleteImportedDraftTransaction(3);

        assertThat(result1).isTrue();
        assertThat(result2).isFalse();
        assertThat(result3).isTrue();
        verify(importedDraftTransactonDao, times(1)).deleteImportedDraftTransaction(1);
        verify(importedDraftTransactonDao, times(1)).deleteImportedDraftTransaction(2);
        verify(importedDraftTransactonDao, times(1)).deleteImportedDraftTransaction(3);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleTransactionWithMinimalData() {
        ImportedDraftTransaction minimalTransaction = new ImportedDraftTransaction();
        minimalTransaction.setImportedTransactionId(999);
        minimalTransaction.setImportedTransactionAmount(BigDecimal.ZERO);
        minimalTransaction.setImportedDebitCreditFlag('D');

        when(importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(minimalTransaction))
                .thenReturn(minimalTransaction);

        ImportedDraftTransaction result = importedDraftTransactonService
                .updateOrCreateImportedDraftTransaction(minimalTransaction);

        assertThat(result).isNotNull();
        assertThat(result.getImportedTransactionId()).isEqualTo(999);
        verify(importedDraftTransactonDao, times(1)).updateOrCreateImportedDraftTransaction(minimalTransaction);
    }

    @Test
    void shouldHandleTransactionWithSpecialCharactersInDescription() {
        testTransaction.setImportedTransactionDescription("Transaction with <special> & characters!");
        when(importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(testTransaction))
                .thenReturn(testTransaction);

        ImportedDraftTransaction result = importedDraftTransactonService
                .updateOrCreateImportedDraftTransaction(testTransaction);

        assertThat(result).isNotNull();
        assertThat(result.getImportedTransactionDescription()).contains("&");
        assertThat(result.getImportedTransactionDescription()).contains("<special>");
        verify(importedDraftTransactonDao, times(1)).updateOrCreateImportedDraftTransaction(testTransaction);
    }

    @Test
    void shouldHandleTransactionWithVeryLongDescription() {
        String longDescription = "A".repeat(1000);
        testTransaction.setImportedTransactionDescription(longDescription);
        when(importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(testTransaction))
                .thenReturn(testTransaction);

        ImportedDraftTransaction result = importedDraftTransactonService
                .updateOrCreateImportedDraftTransaction(testTransaction);

        assertThat(result).isNotNull();
        assertThat(result.getImportedTransactionDescription()).hasSize(1000);
        verify(importedDraftTransactonDao, times(1)).updateOrCreateImportedDraftTransaction(testTransaction);
    }

    @Test
    void shouldHandleTransactionWithPreciseDecimalAmount() {
        testTransaction.setImportedTransactionAmount(new BigDecimal("123.456789"));
        when(importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(testTransaction))
                .thenReturn(testTransaction);

        ImportedDraftTransaction result = importedDraftTransactonService
                .updateOrCreateImportedDraftTransaction(testTransaction);

        assertThat(result).isNotNull();
        assertThat(result.getImportedTransactionAmount()).isEqualByComparingTo(new BigDecimal("123.456789"));
        verify(importedDraftTransactonDao, times(1)).updateOrCreateImportedDraftTransaction(testTransaction);
    }

    @Test
    void shouldVerifyDaoInteractionForMultipleGetDaoCalls() {
        assertThat(importedDraftTransactonService.getDao()).isEqualTo(importedDraftTransactonDao);
        assertThat(importedDraftTransactonService.getDao()).isEqualTo(importedDraftTransactonDao);
        assertThat(importedDraftTransactonService.getDao()).isEqualTo(importedDraftTransactonDao);
    }

    @Test
    void shouldHandleTransactionWithDebitFlag() {
        testTransaction.setImportedDebitCreditFlag('D');
        when(importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(testTransaction))
                .thenReturn(testTransaction);

        ImportedDraftTransaction result = importedDraftTransactonService
                .updateOrCreateImportedDraftTransaction(testTransaction);

        assertThat(result).isNotNull();
        assertThat(result.getImportedDebitCreditFlag()).isEqualTo('D');
        verify(importedDraftTransactonDao, times(1)).updateOrCreateImportedDraftTransaction(testTransaction);
    }

    @Test
    void shouldHandleTransactionWithCreditFlag() {
        testTransaction.setImportedDebitCreditFlag('C');
        when(importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(testTransaction))
                .thenReturn(testTransaction);

        ImportedDraftTransaction result = importedDraftTransactonService
                .updateOrCreateImportedDraftTransaction(testTransaction);

        assertThat(result).isNotNull();
        assertThat(result.getImportedDebitCreditFlag()).isEqualTo('C');
        verify(importedDraftTransactonDao, times(1)).updateOrCreateImportedDraftTransaction(testTransaction);
    }

    @Test
    void shouldHandleTransactionWithDeleteFlagSet() {
        testTransaction.setDeleteFlag(true);
        when(importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(testTransaction))
                .thenReturn(testTransaction);

        ImportedDraftTransaction result = importedDraftTransactonService
                .updateOrCreateImportedDraftTransaction(testTransaction);

        assertThat(result).isNotNull();
        assertThat(result.getDeleteFlag()).isTrue();
        verify(importedDraftTransactonDao, times(1)).updateOrCreateImportedDraftTransaction(testTransaction);
    }

    @Test
    void shouldHandleTransactionWithFutureDate() {
        LocalDateTime futureDate = LocalDateTime.now().plusDays(30);
        testTransaction.setImportedTransactionDate(futureDate);
        when(importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(testTransaction))
                .thenReturn(testTransaction);

        ImportedDraftTransaction result = importedDraftTransactonService
                .updateOrCreateImportedDraftTransaction(testTransaction);

        assertThat(result).isNotNull();
        assertThat(result.getImportedTransactionDate()).isAfter(LocalDateTime.now());
        verify(importedDraftTransactonDao, times(1)).updateOrCreateImportedDraftTransaction(testTransaction);
    }

    @Test
    void shouldHandleTransactionWithPastDate() {
        LocalDateTime pastDate = LocalDateTime.now().minusYears(5);
        testTransaction.setImportedTransactionDate(pastDate);
        when(importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(testTransaction))
                .thenReturn(testTransaction);

        ImportedDraftTransaction result = importedDraftTransactonService
                .updateOrCreateImportedDraftTransaction(testTransaction);

        assertThat(result).isNotNull();
        assertThat(result.getImportedTransactionDate()).isBefore(LocalDateTime.now());
        verify(importedDraftTransactonDao, times(1)).updateOrCreateImportedDraftTransaction(testTransaction);
    }
}
