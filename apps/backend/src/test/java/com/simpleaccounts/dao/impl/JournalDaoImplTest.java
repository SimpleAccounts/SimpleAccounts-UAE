package com.simpleaccounts.dao.impl;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.constant.dbfilter.JournalFilterEnum;
import com.simpleaccounts.dao.JournalLineItemDao;
import com.simpleaccounts.entity.Journal;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.TransactionCategoryBalanceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JournalDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private DatatableSortingFilterConstant dataTableUtil;

    @Mock
    private TransactionCategoryBalanceService transactionCategoryBalanceService;

    @Mock
    private JournalLineItemDao journalLineItemDao;

    @Mock
    private Query query;

    @InjectMocks
    private JournalDaoImpl journalDao;

    private Journal testJournal;
    private JournalLineItem testLineItem;

    @BeforeEach
    void setUp() {
        testJournal = new Journal();
        testJournal.setId(1);
        testJournal.setDescription("Test Journal");
        testJournal.setDeleteFlag(false);

        testLineItem = new JournalLineItem();
        testLineItem.setId(1);
        testLineItem.setJournal(testJournal);
        testLineItem.setReferenceId(100);
        testLineItem.setDeleteFlag(false);

        List<JournalLineItem> lineItems = new ArrayList<>();
        lineItems.add(testLineItem);
        testJournal.setJournalLineItems(lineItems);
    }

    @Test
    void testDeleteByIds_Success() {
        // Arrange
        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Journal.class, 1)).thenReturn(testJournal);

        // Act
        journalDao.deleteByIds(ids);

        // Assert
        assertThat(testJournal.getDeleteFlag()).isTrue();
        assertThat(testLineItem.getDeleteFlag()).isTrue();
        verify(transactionCategoryBalanceService).updateRunningBalance(testLineItem);
        verify(journalLineItemDao).delete(testLineItem);
    }

    @Test
    void testDeleteByIds_MultipleIds() {
        // Arrange
        Journal journal2 = new Journal();
        journal2.setId(2);
        journal2.setDeleteFlag(false);
        JournalLineItem lineItem2 = new JournalLineItem();
        lineItem2.setId(2);
        journal2.setJournalLineItems(Arrays.asList(lineItem2));

        List<Integer> ids = Arrays.asList(1, 2);
        when(entityManager.find(Journal.class, 1)).thenReturn(testJournal);
        when(entityManager.find(Journal.class, 2)).thenReturn(journal2);

        // Act
        journalDao.deleteByIds(ids);

        // Assert
        assertThat(testJournal.getDeleteFlag()).isTrue();
        assertThat(journal2.getDeleteFlag()).isTrue();
        verify(journalLineItemDao, times(2)).delete(any(JournalLineItem.class));
    }

    @Test
    void testDeleteByIds_EmptyList() {
        // Arrange
        List<Integer> ids = Collections.emptyList();

        // Act
        journalDao.deleteByIds(ids);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(journalLineItemDao, never()).delete(any());
    }

    @Test
    void testDeleteByIds_NullList() {
        // Arrange
        List<Integer> ids = null;

        // Act
        journalDao.deleteByIds(ids);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(journalLineItemDao, never()).delete(any());
    }

    @Test
    void testDeleteByIds_JournalWithNoLineItems() {
        // Arrange
        Journal journalWithoutItems = new Journal();
        journalWithoutItems.setId(3);
        journalWithoutItems.setJournalLineItems(Collections.emptyList());

        List<Integer> ids = Arrays.asList(3);
        when(entityManager.find(Journal.class, 3)).thenReturn(journalWithoutItems);

        // Act
        journalDao.deleteByIds(ids);

        // Assert
        assertThat(journalWithoutItems.getDeleteFlag()).isTrue();
        verify(journalLineItemDao, never()).delete(any());
    }

    @Test
    void testDeleteAndUpdateByIds_Success() {
        // Arrange
        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Journal.class, 1)).thenReturn(testJournal);

        // Act
        journalDao.deleteAndUpdateByIds(ids, true);

        // Assert
        assertThat(testJournal.getDeleteFlag()).isTrue();
        assertThat(testLineItem.getDeleteFlag()).isTrue();
        verify(transactionCategoryBalanceService)
                .updateRunningBalanceAndOpeningBalance(testLineItem, true);
        verify(journalLineItemDao).delete(testLineItem);
    }

    @Test
    void testDeleteAndUpdateByIds_WithoutOpeningBalanceUpdate() {
        // Arrange
        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Journal.class, 1)).thenReturn(testJournal);

        // Act
        journalDao.deleteAndUpdateByIds(ids, false);

        // Assert
        assertThat(testJournal.getDeleteFlag()).isTrue();
        verify(transactionCategoryBalanceService)
                .updateRunningBalanceAndOpeningBalance(testLineItem, false);
    }

    @Test
    void testDeleteAndUpdateByIds_EmptyList() {
        // Arrange
        List<Integer> ids = Collections.emptyList();

        // Act
        journalDao.deleteAndUpdateByIds(ids, true);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(transactionCategoryBalanceService, never())
                .updateRunningBalanceAndOpeningBalance(any(), anyBoolean());
    }

    @Test
    void testDeleteAndUpdateByIds_NullList() {
        // Arrange
        List<Integer> ids = null;

        // Act
        journalDao.deleteAndUpdateByIds(ids, true);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(transactionCategoryBalanceService, never())
                .updateRunningBalanceAndOpeningBalance(any(), anyBoolean());
    }

    @Test
    void testGetJornalList_Success() {
        // Arrange
        Map<JournalFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("date");
        paginationModel.setPageNo(0);

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.JOURNAL)))
                .thenReturn("j.date");

        // Act
        PaginationResponseModel result = journalDao.getJornalList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        verify(dataTableUtil).getColName("date", DatatableSortingFilterConstant.JOURNAL);
    }

    @Test
    void testGetJornalList_WithFilters() {
        // Arrange
        Map<JournalFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(JournalFilterEnum.JOURNAL_ID, 1);

        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("description");

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.JOURNAL)))
                .thenReturn("j.description");

        // Act
        PaginationResponseModel result = journalDao.getJornalList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        verify(dataTableUtil).getColName("description", DatatableSortingFilterConstant.JOURNAL);
    }

    @Test
    void testGetJornalList_CountLessThanTen() {
        // Arrange
        Map<JournalFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("date");
        paginationModel.setPageNo(1);

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.JOURNAL)))
                .thenReturn("j.date");

        // Act
        PaginationResponseModel result = journalDao.getJornalList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    void testGetJournalByReferenceId_Found() {
        // Arrange
        List<Journal> journals = Arrays.asList(testJournal);
        when(entityManager.createNamedQuery("getJournalByReferenceId")).thenReturn(query);
        when(query.setParameter("referenceId", 100)).thenReturn(query);
        when(query.getResultList()).thenReturn(journals);

        // Act
        Journal result = journalDao.getJournalByReferenceId(100);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1);
        verify(query).setParameter("referenceId", 100);
    }

    @Test
    void testGetJournalByReferenceId_NotFound() {
        // Arrange
        when(entityManager.createNamedQuery("getJournalByReferenceId")).thenReturn(query);
        when(query.setParameter("referenceId", 999)).thenReturn(query);
        when(query.getResultList()).thenReturn(Collections.emptyList());

        // Act
        Journal result = journalDao.getJournalByReferenceId(999);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    void testGetJournalByReferenceId_MultipleResults() {
        // Arrange
        Journal journal2 = new Journal();
        journal2.setId(2);
        List<Journal> journals = Arrays.asList(testJournal, journal2);
        when(entityManager.createNamedQuery("getJournalByReferenceId")).thenReturn(query);
        when(query.setParameter("referenceId", 100)).thenReturn(query);
        when(query.getResultList()).thenReturn(journals);

        // Act
        Journal result = journalDao.getJournalByReferenceId(100);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1);
    }

    @Test
    void testGetJournalByReferenceIdAndType_Found() {
        // Arrange
        List<Journal> journals = Arrays.asList(testJournal);
        when(entityManager.createNamedQuery("getJournalByReferenceIdAndType")).thenReturn(query);
        when(query.setParameter("referenceId", 100)).thenReturn(query);
        when(query.setParameter("referenceType", PostingReferenceTypeEnum.INVOICE)).thenReturn(query);
        when(query.getResultList()).thenReturn(journals);

        // Act
        Journal result = journalDao.getJournalByReferenceIdAndType(100, PostingReferenceTypeEnum.INVOICE);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1);
        verify(query).setParameter("referenceId", 100);
        verify(query).setParameter("referenceType", PostingReferenceTypeEnum.INVOICE);
    }

    @Test
    void testGetJournalByReferenceIdAndType_NotFound() {
        // Arrange
        when(entityManager.createNamedQuery("getJournalByReferenceIdAndType")).thenReturn(query);
        when(query.setParameter("referenceId", 999)).thenReturn(query);
        when(query.setParameter("referenceType", PostingReferenceTypeEnum.PAYMENT)).thenReturn(query);
        when(query.getResultList()).thenReturn(Collections.emptyList());

        // Act
        Journal result = journalDao.getJournalByReferenceIdAndType(999, PostingReferenceTypeEnum.PAYMENT);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    void testGetJournalByReferenceIdAndType_DifferentTypes() {
        // Arrange
        List<Journal> journals = Arrays.asList(testJournal);
        when(entityManager.createNamedQuery("getJournalByReferenceIdAndType")).thenReturn(query);
        when(query.setParameter("referenceId", 100)).thenReturn(query);
        when(query.setParameter("referenceType", PostingReferenceTypeEnum.RECEIPT)).thenReturn(query);
        when(query.getResultList()).thenReturn(journals);

        // Act
        Journal result = journalDao.getJournalByReferenceIdAndType(100, PostingReferenceTypeEnum.RECEIPT);

        // Assert
        assertThat(result).isNotNull();
        verify(query).setParameter("referenceType", PostingReferenceTypeEnum.RECEIPT);
    }

    @Test
    void testDeleteByIds_WithMultipleLineItems() {
        // Arrange
        JournalLineItem lineItem2 = new JournalLineItem();
        lineItem2.setId(2);
        lineItem2.setReferenceId(101);
        testJournal.getJournalLineItems().add(lineItem2);

        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Journal.class, 1)).thenReturn(testJournal);

        // Act
        journalDao.deleteByIds(ids);

        // Assert
        assertThat(testJournal.getDeleteFlag()).isTrue();
        verify(journalLineItemDao, times(2)).delete(any(JournalLineItem.class));
        verify(transactionCategoryBalanceService, times(2)).updateRunningBalance(any(JournalLineItem.class));
    }

    @Test
    void testDeleteAndUpdateByIds_WithMultipleLineItems() {
        // Arrange
        JournalLineItem lineItem2 = new JournalLineItem();
        lineItem2.setId(2);
        lineItem2.setReferenceId(101);
        testJournal.getJournalLineItems().add(lineItem2);

        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Journal.class, 1)).thenReturn(testJournal);

        // Act
        journalDao.deleteAndUpdateByIds(ids, true);

        // Assert
        assertThat(testJournal.getDeleteFlag()).isTrue();
        verify(journalLineItemDao, times(2)).delete(any(JournalLineItem.class));
        verify(transactionCategoryBalanceService, times(2))
                .updateRunningBalanceAndOpeningBalance(any(JournalLineItem.class), eq(true));
    }
}
