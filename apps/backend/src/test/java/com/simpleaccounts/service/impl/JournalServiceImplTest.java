package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.constant.dbfilter.JournalFilterEnum;
import com.simpleaccounts.dao.ActivityDao;
import com.simpleaccounts.dao.JournalDao;
import com.simpleaccounts.entity.Journal;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.TransactionCategoryBalanceService;
import java.math.BigDecimal;
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
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class JournalServiceImplTest {

    @Mock
    private JournalDao journalDao;

    @Mock
    private TransactionCategoryBalanceService transactionCategoryBalanceService;

    @Mock
    private ActivityDao activityDao;

    @InjectMocks
    private JournalServiceImpl journalService;

    @BeforeEach
    void setUp() {
        // Manually inject activityDao into parent class SimpleAccountsService
        // because the setter is package-private in a different package
        ReflectionTestUtils.setField(journalService, "activityDao", activityDao);
    }

    @Test
    void shouldDelegateGetJournalListToDao() {
        Map<JournalFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();
        PaginationResponseModel expectedResponse = new PaginationResponseModel();

        when(journalDao.getJornalList(filterMap, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = journalService.getJornalList(filterMap, paginationModel);

        assertThat(result).isSameAs(expectedResponse);
        verify(journalDao).getJornalList(filterMap, paginationModel);
    }

    @Test
    void shouldDelegateGetJournalByReferenceId() {
        Integer transactionId = 123;
        Journal expectedJournal = new Journal();
        when(journalDao.getJournalByReferenceId(transactionId)).thenReturn(expectedJournal);

        Journal result = journalService.getJournalByReferenceId(transactionId);

        assertThat(result).isSameAs(expectedJournal);
        verify(journalDao).getJournalByReferenceId(transactionId);
    }

    @Test
    void shouldDelegateGetJournalByReferenceIdAndType() {
        Integer transactionId = 123;
        PostingReferenceTypeEnum type = PostingReferenceTypeEnum.INVOICE;
        Journal expectedJournal = new Journal();
        when(journalDao.getJournalByReferenceIdAndType(transactionId, type)).thenReturn(expectedJournal);

        Journal result = journalService.getJournalByReferenceIdAndType(transactionId, type);

        assertThat(result).isSameAs(expectedJournal);
        verify(journalDao).getJournalByReferenceIdAndType(transactionId, type);
    }

    @Test
    void shouldDelegateDeleteByIds() {
        List<Integer> ids = Arrays.asList(1, 2, 3);
        journalService.deleteByIds(ids);
        verify(journalDao).deleteByIds(ids);
    }

    @Test
    void shouldDelegateDeleteAndUpdateByIds() {
        List<Integer> ids = Arrays.asList(1, 2, 3);
        Boolean updateOpening = true;
        journalService.deleteAndUpdateByIds(ids, updateOpening);
        verify(journalDao).deleteAndUpdateByIds(ids, updateOpening);
    }

    @Test
    void shouldUpdateRunningBalanceBeforePersisting() {
        Journal journal = new Journal();
        JournalLineItem item1 = new JournalLineItem();
        item1.setId(1);
        JournalLineItem item2 = new JournalLineItem();
        item2.setId(2);
        journal.setJournalLineItems(Arrays.asList(item1, item2));

        BigDecimal balance1 = new BigDecimal("100.00");
        BigDecimal balance2 = new BigDecimal("200.00");

        when(transactionCategoryBalanceService.updateRunningBalance(item1)).thenReturn(balance1);
        when(transactionCategoryBalanceService.updateRunningBalance(item2)).thenReturn(balance2);

        journalService.persist(journal);

        assertThat(item1.getCurrentBalance()).isEqualTo(balance1);
        assertThat(item2.getCurrentBalance()).isEqualTo(balance2);
        
        verify(transactionCategoryBalanceService).updateRunningBalance(item1);
        verify(transactionCategoryBalanceService).updateRunningBalance(item2);
        verify(journalDao).persist(journal);
    }

    @Test
    void shouldUpdateOpeningBalanceAndPersist() {
        Journal journal = new Journal();
        JournalLineItem item1 = new JournalLineItem();
        journal.setJournalLineItems(Collections.singletonList(item1));
        Boolean updateOpening = true;

        BigDecimal balance = new BigDecimal("500.00");

        when(transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(item1, updateOpening))
                .thenReturn(balance);

        journalService.updateOpeningBalance(journal, updateOpening);

        assertThat(item1.getCurrentBalance()).isEqualTo(balance);
        verify(transactionCategoryBalanceService).updateRunningBalanceAndOpeningBalance(item1, updateOpening);
        verify(journalDao).persist(journal);
    }
}
