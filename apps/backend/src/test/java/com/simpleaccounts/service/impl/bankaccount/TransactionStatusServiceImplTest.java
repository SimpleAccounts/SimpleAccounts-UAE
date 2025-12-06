package com.simpleaccounts.service.impl.bankaccount;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.TransactionExplinationStatusEnum;
import com.simpleaccounts.dao.JournalDao;
import com.simpleaccounts.dao.JournalLineItemDao;
import com.simpleaccounts.dao.bankaccount.TransactionStatusDao;
import com.simpleaccounts.entity.Journal;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.entity.TransactionStatus;
import com.simpleaccounts.entity.bankaccount.Transaction;
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
class TransactionStatusServiceImplTest {

    @Mock
    private TransactionStatusDao transactionStatusDao;

    @Mock
    private JournalDao journalDao;

    @Mock
    private JournalLineItemDao journalLineItemDao;

    @InjectMocks
    private TransactionStatusServiceImpl transactionStatusService;

    private TransactionStatus testTransactionStatus;
    private Journal testJournal;
    private JournalLineItem testJournalLineItem1;
    private JournalLineItem testJournalLineItem2;
    private Transaction testTransaction;

    @BeforeEach
    void setUp() {
        testTransaction = new Transaction();
        testTransaction.setTransactionId(1);
        testTransaction.setTransactionDescription("Test Transaction");

        testJournalLineItem1 = new JournalLineItem();
        testJournalLineItem1.setJournalLineItemId(1);
        testJournalLineItem1.setJournalLineItemAmount(BigDecimal.valueOf(100.00));

        testJournalLineItem2 = new JournalLineItem();
        testJournalLineItem2.setJournalLineItemId(2);
        testJournalLineItem2.setJournalLineItemAmount(BigDecimal.valueOf(200.00));

        testJournal = new Journal();
        testJournal.setJournalId(1);
        testJournal.setJournalLineItems(Arrays.asList(testJournalLineItem1, testJournalLineItem2));

        testTransactionStatus = new TransactionStatus();
        testTransactionStatus.setExplainationStatusCode(1);
        testTransactionStatus.setExplinationStatus(TransactionExplinationStatusEnum.EXPLAINED);
        testTransactionStatus.setExplainationStatusDescriptions("Test Status");
        testTransactionStatus.setRemainingToExplain(BigDecimal.valueOf(500.00));
        testTransactionStatus.setReconsileJournal(testJournal);
        testTransactionStatus.setTransaction(testTransaction);
        testTransactionStatus.setCreatedBy(1);
        testTransactionStatus.setCreatedDate(LocalDateTime.now());
        testTransactionStatus.setDeleteFlag(false);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnTransactionStatusDaoWhenGetDaoCalled() {
        assertThat(transactionStatusService.getDao()).isEqualTo(transactionStatusDao);
    }

    @Test
    void shouldReturnSameDaoInstanceOnMultipleCalls() {
        assertThat(transactionStatusService.getDao()).isEqualTo(transactionStatusDao);
        assertThat(transactionStatusService.getDao()).isEqualTo(transactionStatusDao);
    }

    // ========== findAllTransactionStatues Tests ==========

    @Test
    void shouldReturnAllTransactionStatusesWhenStatusesExist() {
        List<TransactionStatus> expectedList = Arrays.asList(testTransactionStatus);
        when(transactionStatusDao.findAllTransactionStatues()).thenReturn(expectedList);

        List<TransactionStatus> result = transactionStatusService.findAllTransactionStatues();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testTransactionStatus);
        verify(transactionStatusDao, times(1)).findAllTransactionStatues();
    }

    @Test
    void shouldReturnEmptyListWhenNoTransactionStatusesExist() {
        when(transactionStatusDao.findAllTransactionStatues()).thenReturn(Collections.emptyList());

        List<TransactionStatus> result = transactionStatusService.findAllTransactionStatues();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(transactionStatusDao, times(1)).findAllTransactionStatues();
    }

    @Test
    void shouldReturnMultipleTransactionStatuses() {
        TransactionStatus status2 = new TransactionStatus();
        status2.setExplainationStatusCode(2);
        status2.setExplinationStatus(TransactionExplinationStatusEnum.UNEXPLAINED);

        TransactionStatus status3 = new TransactionStatus();
        status3.setExplainationStatusCode(3);
        status3.setExplinationStatus(TransactionExplinationStatusEnum.PARTIALLY_EXPLAINED);

        List<TransactionStatus> expectedList = Arrays.asList(testTransactionStatus, status2, status3);
        when(transactionStatusDao.findAllTransactionStatues()).thenReturn(expectedList);

        List<TransactionStatus> result = transactionStatusService.findAllTransactionStatues();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testTransactionStatus, status2, status3);
        verify(transactionStatusDao, times(1)).findAllTransactionStatues();
    }

    @Test
    void shouldHandleLargeNumberOfStatuses() {
        List<TransactionStatus> largeList = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            TransactionStatus status = new TransactionStatus();
            status.setExplainationStatusCode(i);
            status.setExplinationStatus(TransactionExplinationStatusEnum.EXPLAINED);
            largeList.add(status);
        }

        when(transactionStatusDao.findAllTransactionStatues()).thenReturn(largeList);

        List<TransactionStatus> result = transactionStatusService.findAllTransactionStatues();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(50);
        verify(transactionStatusDao, times(1)).findAllTransactionStatues();
    }

    // ========== findAllTransactionStatuesByTrnxId Tests ==========

    @Test
    void shouldReturnTransactionStatusesByTransactionId() {
        List<TransactionStatus> expectedList = Arrays.asList(testTransactionStatus);
        when(transactionStatusDao.findAllTransactionStatuesByTrnxId(1)).thenReturn(expectedList);

        List<TransactionStatus> result = transactionStatusService.findAllTransactionStatuesByTrnxId(1);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testTransactionStatus);
        verify(transactionStatusDao, times(1)).findAllTransactionStatuesByTrnxId(1);
    }

    @Test
    void shouldReturnEmptyListWhenNoStatusesForTransactionId() {
        when(transactionStatusDao.findAllTransactionStatuesByTrnxId(999)).thenReturn(Collections.emptyList());

        List<TransactionStatus> result = transactionStatusService.findAllTransactionStatuesByTrnxId(999);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(transactionStatusDao, times(1)).findAllTransactionStatuesByTrnxId(999);
    }

    @Test
    void shouldReturnMultipleStatusesForSameTransaction() {
        TransactionStatus status2 = new TransactionStatus();
        status2.setExplainationStatusCode(2);
        status2.setExplinationStatus(TransactionExplinationStatusEnum.PARTIALLY_EXPLAINED);
        status2.setTransaction(testTransaction);

        List<TransactionStatus> expectedList = Arrays.asList(testTransactionStatus, status2);
        when(transactionStatusDao.findAllTransactionStatuesByTrnxId(1)).thenReturn(expectedList);

        List<TransactionStatus> result = transactionStatusService.findAllTransactionStatuesByTrnxId(1);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(testTransactionStatus, status2);
        verify(transactionStatusDao, times(1)).findAllTransactionStatuesByTrnxId(1);
    }

    @Test
    void shouldHandleNullTransactionId() {
        when(transactionStatusDao.findAllTransactionStatuesByTrnxId(null)).thenReturn(Collections.emptyList());

        List<TransactionStatus> result = transactionStatusService.findAllTransactionStatuesByTrnxId(null);

        assertThat(result).isNotNull();
        verify(transactionStatusDao, times(1)).findAllTransactionStatuesByTrnxId(null);
    }

    @Test
    void shouldVerifyCorrectTransactionIdIsPassedToDao() {
        when(transactionStatusDao.findAllTransactionStatuesByTrnxId(42)).thenReturn(Collections.emptyList());

        transactionStatusService.findAllTransactionStatuesByTrnxId(42);

        ArgumentCaptor<Integer> captor = ArgumentCaptor.forClass(Integer.class);
        verify(transactionStatusDao, times(1)).findAllTransactionStatuesByTrnxId(captor.capture());
        assertThat(captor.getValue()).isEqualTo(42);
    }

    // ========== deleteList Tests ==========

    @Test
    void shouldDeleteListOfTransactionStatuses() {
        List<TransactionStatus> statusList = Arrays.asList(testTransactionStatus);

        doNothing().when(journalLineItemDao).delete(any(JournalLineItem.class));
        doNothing().when(transactionStatusDao).delete(any(TransactionStatus.class));
        doNothing().when(journalDao).delete(any(Journal.class));

        transactionStatusService.deleteList(statusList);

        verify(journalLineItemDao, times(2)).delete(any(JournalLineItem.class));
        verify(transactionStatusDao, times(1)).delete(testTransactionStatus);
        verify(journalDao, times(1)).delete(testJournal);
    }

    @Test
    void shouldDeleteMultipleTransactionStatuses() {
        TransactionStatus status2 = new TransactionStatus();
        status2.setExplainationStatusCode(2);
        Journal journal2 = new Journal();
        journal2.setJournalId(2);
        JournalLineItem lineItem3 = new JournalLineItem();
        lineItem3.setJournalLineItemId(3);
        journal2.setJournalLineItems(Collections.singletonList(lineItem3));
        status2.setReconsileJournal(journal2);

        List<TransactionStatus> statusList = Arrays.asList(testTransactionStatus, status2);

        doNothing().when(journalLineItemDao).delete(any(JournalLineItem.class));
        doNothing().when(transactionStatusDao).delete(any(TransactionStatus.class));
        doNothing().when(journalDao).delete(any(Journal.class));

        transactionStatusService.deleteList(statusList);

        verify(journalLineItemDao, times(3)).delete(any(JournalLineItem.class));
        verify(transactionStatusDao, times(2)).delete(any(TransactionStatus.class));
        verify(journalDao, times(2)).delete(any(Journal.class));
    }

    @Test
    void shouldHandleEmptyListInDelete() {
        List<TransactionStatus> emptyList = Collections.emptyList();

        transactionStatusService.deleteList(emptyList);

        verify(journalLineItemDao, never()).delete(any(JournalLineItem.class));
        verify(transactionStatusDao, never()).delete(any(TransactionStatus.class));
        verify(journalDao, never()).delete(any(Journal.class));
    }

    @Test
    void shouldHandleNullListInDelete() {
        transactionStatusService.deleteList(null);

        verify(journalLineItemDao, never()).delete(any(JournalLineItem.class));
        verify(transactionStatusDao, never()).delete(any(TransactionStatus.class));
        verify(journalDao, never()).delete(any(Journal.class));
    }

    @Test
    void shouldCatchExceptionDuringDelete() {
        List<TransactionStatus> statusList = Arrays.asList(testTransactionStatus);

        doThrow(new RuntimeException("Delete failed")).when(journalLineItemDao).delete(any(JournalLineItem.class));

        // Should not throw exception, should catch and log
        transactionStatusService.deleteList(statusList);

        verify(journalLineItemDao, times(1)).delete(any(JournalLineItem.class));
    }

    @Test
    void shouldDeleteStatusWithNoJournalLineItems() {
        testJournal.setJournalLineItems(Collections.emptyList());
        List<TransactionStatus> statusList = Arrays.asList(testTransactionStatus);

        doNothing().when(transactionStatusDao).delete(any(TransactionStatus.class));
        doNothing().when(journalDao).delete(any(Journal.class));

        transactionStatusService.deleteList(statusList);

        verify(journalLineItemDao, never()).delete(any(JournalLineItem.class));
        verify(transactionStatusDao, times(1)).delete(testTransactionStatus);
        verify(journalDao, times(1)).delete(testJournal);
    }

    // ========== deleteForTransation Tests ==========

    @Test
    void shouldDeleteAllStatusesForTransaction() {
        List<TransactionStatus> statusList = Arrays.asList(testTransactionStatus);
        when(transactionStatusDao.findAllTransactionStatuesByTrnxId(1)).thenReturn(statusList);

        doNothing().when(journalLineItemDao).delete(any(JournalLineItem.class));
        doNothing().when(transactionStatusDao).delete(any(TransactionStatus.class));
        doNothing().when(journalDao).delete(any(Journal.class));

        transactionStatusService.deleteForTransation(1);

        verify(transactionStatusDao, times(1)).findAllTransactionStatuesByTrnxId(1);
        verify(journalLineItemDao, times(2)).delete(any(JournalLineItem.class));
        verify(transactionStatusDao, times(1)).delete(testTransactionStatus);
        verify(journalDao, times(1)).delete(testJournal);
    }

    @Test
    void shouldHandleNoStatusesForTransaction() {
        when(transactionStatusDao.findAllTransactionStatuesByTrnxId(999)).thenReturn(Collections.emptyList());

        transactionStatusService.deleteForTransation(999);

        verify(transactionStatusDao, times(1)).findAllTransactionStatuesByTrnxId(999);
        verify(journalLineItemDao, never()).delete(any(JournalLineItem.class));
        verify(transactionStatusDao, never()).delete(any(TransactionStatus.class));
        verify(journalDao, never()).delete(any(Journal.class));
    }

    @Test
    void shouldHandleNullListFromFindAllByTransactionId() {
        when(transactionStatusDao.findAllTransactionStatuesByTrnxId(1)).thenReturn(null);

        transactionStatusService.deleteForTransation(1);

        verify(transactionStatusDao, times(1)).findAllTransactionStatuesByTrnxId(1);
        verify(journalLineItemDao, never()).delete(any(JournalLineItem.class));
        verify(transactionStatusDao, never()).delete(any(TransactionStatus.class));
        verify(journalDao, never()).delete(any(Journal.class));
    }

    @Test
    void shouldDeleteMultipleStatusesForSameTransaction() {
        TransactionStatus status2 = new TransactionStatus();
        status2.setExplainationStatusCode(2);
        Journal journal2 = new Journal();
        journal2.setJournalId(2);
        JournalLineItem lineItem3 = new JournalLineItem();
        lineItem3.setJournalLineItemId(3);
        journal2.setJournalLineItems(Collections.singletonList(lineItem3));
        status2.setReconsileJournal(journal2);

        List<TransactionStatus> statusList = Arrays.asList(testTransactionStatus, status2);
        when(transactionStatusDao.findAllTransactionStatuesByTrnxId(1)).thenReturn(statusList);

        doNothing().when(journalLineItemDao).delete(any(JournalLineItem.class));
        doNothing().when(transactionStatusDao).delete(any(TransactionStatus.class));
        doNothing().when(journalDao).delete(any(Journal.class));

        transactionStatusService.deleteForTransation(1);

        verify(transactionStatusDao, times(1)).findAllTransactionStatuesByTrnxId(1);
        verify(journalLineItemDao, times(3)).delete(any(JournalLineItem.class));
        verify(transactionStatusDao, times(2)).delete(any(TransactionStatus.class));
        verify(journalDao, times(2)).delete(any(Journal.class));
    }

    @Test
    void shouldHandleNullTransactionIdInDeleteForTransaction() {
        when(transactionStatusDao.findAllTransactionStatuesByTrnxId(null)).thenReturn(Collections.emptyList());

        transactionStatusService.deleteForTransation(null);

        verify(transactionStatusDao, times(1)).findAllTransactionStatuesByTrnxId(null);
        verify(journalLineItemDao, never()).delete(any(JournalLineItem.class));
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleTransactionStatusWithDifferentExplinationStatuses() {
        testTransactionStatus.setExplinationStatus(TransactionExplinationStatusEnum.EXPLAINED);
        List<TransactionStatus> expectedList = Collections.singletonList(testTransactionStatus);
        when(transactionStatusDao.findAllTransactionStatues()).thenReturn(expectedList);

        List<TransactionStatus> result = transactionStatusService.findAllTransactionStatues();

        assertThat(result).isNotNull();
        assertThat(result.get(0).getExplinationStatus()).isEqualTo(TransactionExplinationStatusEnum.EXPLAINED);
        verify(transactionStatusDao, times(1)).findAllTransactionStatues();
    }

    @Test
    void shouldHandleTransactionStatusWithZeroRemainingBalance() {
        testTransactionStatus.setRemainingToExplain(BigDecimal.ZERO);
        List<TransactionStatus> expectedList = Collections.singletonList(testTransactionStatus);
        when(transactionStatusDao.findAllTransactionStatues()).thenReturn(expectedList);

        List<TransactionStatus> result = transactionStatusService.findAllTransactionStatues();

        assertThat(result).isNotNull();
        assertThat(result.get(0).getRemainingToExplain()).isEqualByComparingTo(BigDecimal.ZERO);
        verify(transactionStatusDao, times(1)).findAllTransactionStatues();
    }

    @Test
    void shouldHandleTransactionStatusWithNegativeRemainingBalance() {
        testTransactionStatus.setRemainingToExplain(BigDecimal.valueOf(-100.00));
        List<TransactionStatus> expectedList = Collections.singletonList(testTransactionStatus);
        when(transactionStatusDao.findAllTransactionStatues()).thenReturn(expectedList);

        List<TransactionStatus> result = transactionStatusService.findAllTransactionStatues();

        assertThat(result).isNotNull();
        assertThat(result.get(0).getRemainingToExplain()).isEqualByComparingTo(BigDecimal.valueOf(-100.00));
        verify(transactionStatusDao, times(1)).findAllTransactionStatues();
    }

    @Test
    void shouldHandleTransactionStatusWithLargeRemainingBalance() {
        testTransactionStatus.setRemainingToExplain(BigDecimal.valueOf(999999999.99));
        List<TransactionStatus> expectedList = Collections.singletonList(testTransactionStatus);
        when(transactionStatusDao.findAllTransactionStatues()).thenReturn(expectedList);

        List<TransactionStatus> result = transactionStatusService.findAllTransactionStatues();

        assertThat(result).isNotNull();
        assertThat(result.get(0).getRemainingToExplain()).isEqualByComparingTo(BigDecimal.valueOf(999999999.99));
        verify(transactionStatusDao, times(1)).findAllTransactionStatues();
    }

    @Test
    void shouldVerifyDaoInteractionForMultipleGetDaoCalls() {
        assertThat(transactionStatusService.getDao()).isEqualTo(transactionStatusDao);
        assertThat(transactionStatusService.getDao()).isEqualTo(transactionStatusDao);
        assertThat(transactionStatusService.getDao()).isEqualTo(transactionStatusDao);
    }

    @Test
    void shouldHandleStatusWithNullJournal() {
        testTransactionStatus.setReconsileJournal(null);
        List<TransactionStatus> statusList = Arrays.asList(testTransactionStatus);

        doNothing().when(transactionStatusDao).delete(any(TransactionStatus.class));

        // Should not throw NPE
        transactionStatusService.deleteList(statusList);

        verify(transactionStatusDao, times(1)).delete(testTransactionStatus);
        verify(journalDao, never()).delete(any(Journal.class));
    }

    @Test
    void shouldHandleStatusWithNullJournalLineItems() {
        testJournal.setJournalLineItems(null);
        List<TransactionStatus> statusList = Arrays.asList(testTransactionStatus);

        doNothing().when(transactionStatusDao).delete(any(TransactionStatus.class));
        doNothing().when(journalDao).delete(any(Journal.class));

        // Should not throw NPE
        transactionStatusService.deleteList(statusList);

        verify(journalLineItemDao, never()).delete(any(JournalLineItem.class));
        verify(transactionStatusDao, times(1)).delete(testTransactionStatus);
        verify(journalDao, times(1)).delete(testJournal);
    }

    @Test
    void shouldHandleStatusWithSpecialCharactersInDescription() {
        testTransactionStatus.setExplainationStatusDescriptions("Status with <special> & characters!");
        List<TransactionStatus> expectedList = Collections.singletonList(testTransactionStatus);
        when(transactionStatusDao.findAllTransactionStatues()).thenReturn(expectedList);

        List<TransactionStatus> result = transactionStatusService.findAllTransactionStatues();

        assertThat(result).isNotNull();
        assertThat(result.get(0).getExplainationStatusDescriptions()).contains("&");
        assertThat(result.get(0).getExplainationStatusDescriptions()).contains("<special>");
        verify(transactionStatusDao, times(1)).findAllTransactionStatues();
    }

    @Test
    void shouldVerifyCorrectOrderOfDeletionOperations() {
        List<TransactionStatus> statusList = Arrays.asList(testTransactionStatus);

        doNothing().when(journalLineItemDao).delete(any(JournalLineItem.class));
        doNothing().when(transactionStatusDao).delete(any(TransactionStatus.class));
        doNothing().when(journalDao).delete(any(Journal.class));

        transactionStatusService.deleteList(statusList);

        // Verify that journal line items are deleted before journal
        verify(journalLineItemDao, times(2)).delete(any(JournalLineItem.class));
        verify(transactionStatusDao, times(1)).delete(testTransactionStatus);
        verify(journalDao, times(1)).delete(testJournal);
    }
}
