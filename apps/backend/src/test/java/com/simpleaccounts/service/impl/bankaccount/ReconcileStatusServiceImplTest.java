package com.simpleaccounts.service.impl.bankaccount;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.TransactionExplinationStatusEnum;
import com.simpleaccounts.dao.bankaccount.ReconcileStatusDao;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.ReconcileStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReconcileStatusServiceImplTest {

    @Mock
    private ReconcileStatusDao reconcileStatusDao;
    @Mock
    private TransactionServiceImpl transactionService;

    @InjectMocks
    private ReconcileStatusServiceImpl service;

    @Test
    void deleteByIdsShouldResetTransactionsAndSoftDeleteStatuses() {
        BankAccount bankAccount = new BankAccount();
        bankAccount.setBankAccountId(5);

        ReconcileStatus status = new ReconcileStatus();
        status.setReconciledStartDate(LocalDateTime.now().minusDays(5));
        status.setReconciledDate(LocalDateTime.now().minusDays(1));
        status.setBankAccount(bankAccount);

        when(reconcileStatusDao.findByPK(77)).thenReturn(status);

        service.deleteByIds(new ArrayList<>(Collections.singletonList(77)));

        verify(transactionService).updateTransactionStatusReconcile(
                status.getReconciledStartDate(),
                status.getReconciledDate(),
                bankAccount.getBankAccountId(),
                TransactionExplinationStatusEnum.FULL);
        assertThat(status.getDeleteFlag()).isTrue();
        verify(reconcileStatusDao).update(status);
    }
}








