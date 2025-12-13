package com.simpleaccounts.service.impl.bankaccount;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.TransactionCreationMode;
import com.simpleaccounts.dao.bankaccount.BankAccountDao;
import com.simpleaccounts.dao.bankaccount.TransactionDao;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.ReconcileStatus;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.bankaccount.ReconcileStatusService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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
class TransactionServiceImplTest {

    @Mock
    private TransactionDao transactionDao;
    @Mock
    private BankAccountDao bankAccountDao;
    @Mock
    private BankAccountService bankAccountService;
    @Mock
    private ReconcileStatusService reconcileStatusService;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    private BankAccount bankAccount;

    @BeforeEach
    void setUp() {
        bankAccount = new BankAccount();
        bankAccount.setBankAccountId(99);
        bankAccount.setOpeningDate(LocalDateTime.now().minusDays(30));
        bankAccount.setCurrentBalance(new BigDecimal("1000.00"));
    }

    @Test
    void saveTransactionsShouldPersistOnlyValidTransactionsAndUpdateBalance() {
        Transaction valid = buildTransaction(LocalDateTime.now().minusDays(5), new BigDecimal("200.00"));
        Transaction invalid = buildTransaction(LocalDateTime.now().minusDays(90), new BigDecimal("50.00"));
        List<Transaction> transactions = java.util.Arrays.asList(valid, invalid);

        when(bankAccountService.findByPK(99)).thenReturn(bankAccount);
        when(reconcileStatusService.getAllReconcileStatusListByBankAccountId(99))
                .thenReturn(Collections.singletonList(latestReconcileStatus(LocalDateTime.now().minusDays(10))));
        when(transactionDao.isAlreadyExistSimilarTransaction(any(), any(), any(), any())).thenReturn(false);

        String message = transactionService.saveTransactions(transactions);

        ArgumentCaptor<Transaction> persisted = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionDao).persist(persisted.capture());
        assertThat(persisted.getValue().getCurrentBalance())
                .isEqualByComparingTo(new BigDecimal("1200.00"));
        verify(bankAccountService).update(bankAccount);
        assertThat(bankAccount.getCurrentBalance()).isEqualByComparingTo(new BigDecimal("1200.00"));
        verify(transactionDao, never()).persist(invalid);
        assertThat(message).contains("Transactions Imported 1");
    }

    @Test
    void saveTransactionsShouldFlagDuplicatesAsPotential() {
        Transaction duplicate = buildTransaction(LocalDateTime.now().minusDays(2), new BigDecimal("30.00"));
        List<Transaction> transactions = java.util.Collections.singletonList(duplicate);

        when(bankAccountService.findByPK(99)).thenReturn(bankAccount);
        when(reconcileStatusService.getAllReconcileStatusListByBankAccountId(99))
                .thenReturn(Collections.emptyList());
        when(transactionDao.isAlreadyExistSimilarTransaction(any(), any(), any(), any())).thenReturn(true);

        transactionService.saveTransactions(transactions);

        assertThat(duplicate.getCreationMode()).isEqualTo(TransactionCreationMode.POTENTIAL_DUPLICATE);
    }

    private Transaction buildTransaction(LocalDateTime date, BigDecimal amount) {
        Transaction transaction = new Transaction();
        transaction.setTransactionDate(date);
        transaction.setTransactionAmount(amount);
        transaction.setDebitCreditFlag('C');
        transaction.setBankAccount(bankAccount);
        transaction.setTransactionDescription("Test");
        return transaction;
    }

    private ReconcileStatus latestReconcileStatus(LocalDateTime dateTime) {
        ReconcileStatus status = new ReconcileStatus();
        status.setReconciledDate(dateTime);
        return status;
    }
}

