package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.constant.dbfilter.JournalFilterEnum;
import com.simpleaccounts.dao.JournalDao;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.Journal;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.exceptions.ServiceException;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.TransactionCategoryBalanceService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class JournalServiceImplTest {

    @Mock
    private JournalDao journalDao;

    @Mock
    private TransactionCategoryBalanceService transactionCategoryBalanceService;

    @InjectMocks
    private JournalServiceImpl journalService;

    private Journal testJournal;
    private JournalLineItem testLineItem1;
    private JournalLineItem testLineItem2;
    private Currency testCurrency;
    private TransactionCategory testTransactionCategory;

    @BeforeEach
    void setUp() {
        testCurrency = new Currency();
        testCurrency.setCurrencyCode(1);
        testCurrency.setCurrencyIsoCode("AED");

        testTransactionCategory = new TransactionCategory();
        testTransactionCategory.setTransactionCategoryId(1);
        testTransactionCategory.setTransactionCategoryCode("TC001");

        testLineItem1 = new JournalLineItem();
        testLineItem1.setId(1);
        testLineItem1.setDescription("Line Item 1");
        testLineItem1.setDebitAmount(new BigDecimal("1000.00"));
        testLineItem1.setCreditAmount(BigDecimal.ZERO);
        testLineItem1.setTransactionCategory(testTransactionCategory);
        testLineItem1.setCurrentBalance(new BigDecimal("1000.00"));

        testLineItem2 = new JournalLineItem();
        testLineItem2.setId(2);
        testLineItem2.setDescription("Line Item 2");
        testLineItem2.setDebitAmount(BigDecimal.ZERO);
        testLineItem2.setCreditAmount(new BigDecimal("1000.00"));
        testLineItem2.setTransactionCategory(testTransactionCategory);
        testLineItem2.setCurrentBalance(new BigDecimal("0.00"));

        testJournal = new Journal();
        testJournal.setId(1);
        testJournal.setJournalDate(LocalDate.now());
        testJournal.setJournlReferencenNo("JRN-001");
        testJournal.setDescription("Test Journal");
        testJournal.setCurrency(testCurrency);
        testJournal.setTotalDebitAmount(new BigDecimal("1000.00"));
        testJournal.setTotalCreditAmount(new BigDecimal("1000.00"));
        testJournal.setSubTotalDebitAmount(new BigDecimal("1000.00"));
        testJournal.setSubTotalCreditAmount(new BigDecimal("1000.00"));
        testJournal.setCreatedBy(1);
        testJournal.setCreatedDate(LocalDateTime.now());
        testJournal.setDeleteFlag(false);
        testJournal.setReversalFlag(false);
        testJournal.setPostingReferenceType(PostingReferenceTypeEnum.MANUAL);
        testJournal.setJournalLineItems(Arrays.asList(testLineItem1, testLineItem2));
    }

    @Nested
    @DisplayName("getJornalList tests")
    class GetJournalListTests {

        @Test
        @DisplayName("Should get journal list with valid filter and pagination")
        void shouldGetJournalListWithValidFilterAndPagination() {
            Map<JournalFilterEnum, Object> filterMap = new HashMap<>();
            filterMap.put(JournalFilterEnum.JOURNAL_ID, 1);

            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNumber(0);
            paginationModel.setPageSize(10);

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            expectedResponse.setTotalElements(1L);
            expectedResponse.setData(Collections.singletonList(testJournal));

            when(journalDao.getJornalList(filterMap, paginationModel)).thenReturn(expectedResponse);

            PaginationResponseModel result = journalService.getJornalList(filterMap, paginationModel);

            assertThat(result).isNotNull();
            assertThat(result.getTotalElements()).isEqualTo(1L);
            assertThat(result.getData()).hasSize(1);
            verify(journalDao, times(1)).getJornalList(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should get journal list with empty filter map")
        void shouldGetJournalListWithEmptyFilterMap() {
            Map<JournalFilterEnum, Object> filterMap = new HashMap<>();
            PaginationModel paginationModel = new PaginationModel();

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            expectedResponse.setTotalElements(0L);
            expectedResponse.setData(Collections.emptyList());

            when(journalDao.getJornalList(filterMap, paginationModel)).thenReturn(expectedResponse);

            PaginationResponseModel result = journalService.getJornalList(filterMap, paginationModel);

            assertThat(result).isNotNull();
            assertThat(result.getTotalElements()).isEqualTo(0L);
            verify(journalDao, times(1)).getJornalList(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should get journal list with null filter map")
        void shouldGetJournalListWithNullFilterMap() {
            PaginationModel paginationModel = new PaginationModel();

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(journalDao.getJornalList(null, paginationModel)).thenReturn(expectedResponse);

            PaginationResponseModel result = journalService.getJornalList(null, paginationModel);

            assertThat(result).isNotNull();
            verify(journalDao, times(1)).getJornalList(null, paginationModel);
        }

        @Test
        @DisplayName("Should get journal list with multiple filters")
        void shouldGetJournalListWithMultipleFilters() {
            Map<JournalFilterEnum, Object> filterMap = new HashMap<>();
            filterMap.put(JournalFilterEnum.JOURNAL_ID, 1);
            filterMap.put(JournalFilterEnum.FROM_DATE, LocalDate.now().minusDays(30));
            filterMap.put(JournalFilterEnum.TO_DATE, LocalDate.now());

            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNumber(0);
            paginationModel.setPageSize(20);

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            expectedResponse.setTotalElements(5L);

            when(journalDao.getJornalList(filterMap, paginationModel)).thenReturn(expectedResponse);

            PaginationResponseModel result = journalService.getJornalList(filterMap, paginationModel);

            assertThat(result.getTotalElements()).isEqualTo(5L);
            verify(journalDao, times(1)).getJornalList(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should handle pagination with different page sizes")
        void shouldHandlePaginationWithDifferentPageSizes() {
            Map<JournalFilterEnum, Object> filterMap = new HashMap<>();
            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNumber(2);
            paginationModel.setPageSize(50);

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(journalDao.getJornalList(filterMap, paginationModel)).thenReturn(expectedResponse);

            PaginationResponseModel result = journalService.getJornalList(filterMap, paginationModel);

            assertThat(result).isNotNull();
            verify(journalDao, times(1)).getJornalList(filterMap, paginationModel);
        }
    }

    @Nested
    @DisplayName("getJournalByReferenceId tests")
    class GetJournalByReferenceIdTests {

        @Test
        @DisplayName("Should get journal by valid reference id")
        void shouldGetJournalByValidReferenceId() {
            Integer referenceId = 100;
            when(journalDao.getJournalByReferenceId(referenceId)).thenReturn(testJournal);

            Journal result = journalService.getJournalByReferenceId(referenceId);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(testJournal.getId());
            assertThat(result.getJournlReferencenNo()).isEqualTo("JRN-001");
            verify(journalDao, times(1)).getJournalByReferenceId(referenceId);
        }

        @Test
        @DisplayName("Should return null when journal not found by reference id")
        void shouldReturnNullWhenJournalNotFoundByReferenceId() {
            Integer referenceId = 999;
            when(journalDao.getJournalByReferenceId(referenceId)).thenReturn(null);

            Journal result = journalService.getJournalByReferenceId(referenceId);

            assertThat(result).isNull();
            verify(journalDao, times(1)).getJournalByReferenceId(referenceId);
        }

        @Test
        @DisplayName("Should handle null reference id")
        void shouldHandleNullReferenceId() {
            when(journalDao.getJournalByReferenceId(null)).thenReturn(null);

            Journal result = journalService.getJournalByReferenceId(null);

            assertThat(result).isNull();
            verify(journalDao, times(1)).getJournalByReferenceId(null);
        }

        @Test
        @DisplayName("Should get journal by zero reference id")
        void shouldGetJournalByZeroReferenceId() {
            when(journalDao.getJournalByReferenceId(0)).thenReturn(null);

            Journal result = journalService.getJournalByReferenceId(0);

            assertThat(result).isNull();
            verify(journalDao, times(1)).getJournalByReferenceId(0);
        }

        @Test
        @DisplayName("Should get journal by negative reference id")
        void shouldGetJournalByNegativeReferenceId() {
            when(journalDao.getJournalByReferenceId(-1)).thenReturn(null);

            Journal result = journalService.getJournalByReferenceId(-1);

            assertThat(result).isNull();
            verify(journalDao, times(1)).getJournalByReferenceId(-1);
        }
    }

    @Nested
    @DisplayName("getJournalByReferenceIdAndType tests")
    class GetJournalByReferenceIdAndTypeTests {

        @Test
        @DisplayName("Should get journal by reference id and type - INVOICE")
        void shouldGetJournalByReferenceIdAndTypeInvoice() {
            Integer referenceId = 100;
            PostingReferenceTypeEnum refType = PostingReferenceTypeEnum.INVOICE;

            when(journalDao.getJournalByReferenceIdAndType(referenceId, refType)).thenReturn(testJournal);

            Journal result = journalService.getJournalByReferenceIdAndType(referenceId, refType);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(testJournal.getId());
            verify(journalDao, times(1)).getJournalByReferenceIdAndType(referenceId, refType);
        }

        @Test
        @DisplayName("Should get journal by reference id and type - EXPENSE")
        void shouldGetJournalByReferenceIdAndTypeExpense() {
            Integer referenceId = 200;
            PostingReferenceTypeEnum refType = PostingReferenceTypeEnum.EXPENSE;

            when(journalDao.getJournalByReferenceIdAndType(referenceId, refType)).thenReturn(testJournal);

            Journal result = journalService.getJournalByReferenceIdAndType(referenceId, refType);

            assertThat(result).isNotNull();
            verify(journalDao, times(1)).getJournalByReferenceIdAndType(referenceId, refType);
        }

        @Test
        @DisplayName("Should get journal by reference id and type - RECEIPT")
        void shouldGetJournalByReferenceIdAndTypeReceipt() {
            Integer referenceId = 300;
            PostingReferenceTypeEnum refType = PostingReferenceTypeEnum.RECEIPT;

            when(journalDao.getJournalByReferenceIdAndType(referenceId, refType)).thenReturn(testJournal);

            Journal result = journalService.getJournalByReferenceIdAndType(referenceId, refType);

            assertThat(result).isNotNull();
            verify(journalDao, times(1)).getJournalByReferenceIdAndType(referenceId, refType);
        }

        @Test
        @DisplayName("Should get journal by reference id and type - PAYMENT")
        void shouldGetJournalByReferenceIdAndTypePayment() {
            Integer referenceId = 400;
            PostingReferenceTypeEnum refType = PostingReferenceTypeEnum.PAYMENT;

            when(journalDao.getJournalByReferenceIdAndType(referenceId, refType)).thenReturn(testJournal);

            Journal result = journalService.getJournalByReferenceIdAndType(referenceId, refType);

            assertThat(result).isNotNull();
            verify(journalDao, times(1)).getJournalByReferenceIdAndType(referenceId, refType);
        }

        @Test
        @DisplayName("Should return null when journal not found by reference id and type")
        void shouldReturnNullWhenJournalNotFoundByReferenceIdAndType() {
            Integer referenceId = 999;
            PostingReferenceTypeEnum refType = PostingReferenceTypeEnum.MANUAL;

            when(journalDao.getJournalByReferenceIdAndType(referenceId, refType)).thenReturn(null);

            Journal result = journalService.getJournalByReferenceIdAndType(referenceId, refType);

            assertThat(result).isNull();
            verify(journalDao, times(1)).getJournalByReferenceIdAndType(referenceId, refType);
        }

        @Test
        @DisplayName("Should handle null reference id with valid type")
        void shouldHandleNullReferenceIdWithValidType() {
            PostingReferenceTypeEnum refType = PostingReferenceTypeEnum.INVOICE;

            when(journalDao.getJournalByReferenceIdAndType(null, refType)).thenReturn(null);

            Journal result = journalService.getJournalByReferenceIdAndType(null, refType);

            assertThat(result).isNull();
            verify(journalDao, times(1)).getJournalByReferenceIdAndType(null, refType);
        }

        @Test
        @DisplayName("Should handle valid reference id with null type")
        void shouldHandleValidReferenceIdWithNullType() {
            Integer referenceId = 100;

            when(journalDao.getJournalByReferenceIdAndType(referenceId, null)).thenReturn(null);

            Journal result = journalService.getJournalByReferenceIdAndType(referenceId, null);

            assertThat(result).isNull();
            verify(journalDao, times(1)).getJournalByReferenceIdAndType(referenceId, null);
        }

        @Test
        @DisplayName("Should handle both null reference id and type")
        void shouldHandleBothNullReferenceIdAndType() {
            when(journalDao.getJournalByReferenceIdAndType(null, null)).thenReturn(null);

            Journal result = journalService.getJournalByReferenceIdAndType(null, null);

            assertThat(result).isNull();
            verify(journalDao, times(1)).getJournalByReferenceIdAndType(null, null);
        }

        @Test
        @DisplayName("Should get journal for reverse reference types")
        void shouldGetJournalForReverseReferenceTypes() {
            Integer referenceId = 500;
            PostingReferenceTypeEnum refType = PostingReferenceTypeEnum.REVERSE_INVOICE;

            when(journalDao.getJournalByReferenceIdAndType(referenceId, refType)).thenReturn(testJournal);

            Journal result = journalService.getJournalByReferenceIdAndType(referenceId, refType);

            assertThat(result).isNotNull();
            verify(journalDao, times(1)).getJournalByReferenceIdAndType(referenceId, refType);
        }
    }

    @Nested
    @DisplayName("deleteByIds tests")
    class DeleteByIdsTests {

        @Test
        @DisplayName("Should delete journals by single id")
        void shouldDeleteJournalsBySingleId() {
            List<Integer> ids = Collections.singletonList(1);
            doNothing().when(journalDao).deleteByIds(ids);

            journalService.deleteByIds(ids);

            verify(journalDao, times(1)).deleteByIds(ids);
        }

        @Test
        @DisplayName("Should delete journals by multiple ids")
        void shouldDeleteJournalsByMultipleIds() {
            List<Integer> ids = Arrays.asList(1, 2, 3, 4, 5);
            doNothing().when(journalDao).deleteByIds(ids);

            journalService.deleteByIds(ids);

            verify(journalDao, times(1)).deleteByIds(ids);
        }

        @Test
        @DisplayName("Should handle empty id list")
        void shouldHandleEmptyIdList() {
            List<Integer> ids = Collections.emptyList();
            doNothing().when(journalDao).deleteByIds(ids);

            journalService.deleteByIds(ids);

            verify(journalDao, times(1)).deleteByIds(ids);
        }

        @Test
        @DisplayName("Should handle null id list")
        void shouldHandleNullIdList() {
            doNothing().when(journalDao).deleteByIds(null);

            journalService.deleteByIds(null);

            verify(journalDao, times(1)).deleteByIds(null);
        }

        @Test
        @DisplayName("Should delete journals with duplicate ids")
        void shouldDeleteJournalsWithDuplicateIds() {
            List<Integer> ids = Arrays.asList(1, 1, 2, 2, 3);
            doNothing().when(journalDao).deleteByIds(ids);

            journalService.deleteByIds(ids);

            verify(journalDao, times(1)).deleteByIds(ids);
        }

        @Test
        @DisplayName("Should handle large batch of ids")
        void shouldHandleLargeBatchOfIds() {
            List<Integer> ids = new ArrayList<>();
            for (int i = 1; i <= 1000; i++) {
                ids.add(i);
            }
            doNothing().when(journalDao).deleteByIds(ids);

            journalService.deleteByIds(ids);

            verify(journalDao, times(1)).deleteByIds(ids);
        }
    }

    @Nested
    @DisplayName("deleteAndUpdateByIds tests")
    class DeleteAndUpdateByIdsTests {

        @Test
        @DisplayName("Should delete and update journals with updateOpeningBalance true")
        void shouldDeleteAndUpdateJournalsWithUpdateOpeningBalanceTrue() {
            List<Integer> ids = Arrays.asList(1, 2, 3);
            Boolean updateOpeningBalance = true;

            doNothing().when(journalDao).deleteAndUpdateByIds(ids, updateOpeningBalance);

            journalService.deleteAndUpdateByIds(ids, updateOpeningBalance);

            verify(journalDao, times(1)).deleteAndUpdateByIds(ids, updateOpeningBalance);
        }

        @Test
        @DisplayName("Should delete and update journals with updateOpeningBalance false")
        void shouldDeleteAndUpdateJournalsWithUpdateOpeningBalanceFalse() {
            List<Integer> ids = Arrays.asList(1, 2, 3);
            Boolean updateOpeningBalance = false;

            doNothing().when(journalDao).deleteAndUpdateByIds(ids, updateOpeningBalance);

            journalService.deleteAndUpdateByIds(ids, updateOpeningBalance);

            verify(journalDao, times(1)).deleteAndUpdateByIds(ids, updateOpeningBalance);
        }

        @Test
        @DisplayName("Should delete and update journals with null updateOpeningBalance")
        void shouldDeleteAndUpdateJournalsWithNullUpdateOpeningBalance() {
            List<Integer> ids = Arrays.asList(1, 2, 3);

            doNothing().when(journalDao).deleteAndUpdateByIds(ids, null);

            journalService.deleteAndUpdateByIds(ids, null);

            verify(journalDao, times(1)).deleteAndUpdateByIds(ids, null);
        }

        @Test
        @DisplayName("Should delete and update single journal")
        void shouldDeleteAndUpdateSingleJournal() {
            List<Integer> ids = Collections.singletonList(1);
            Boolean updateOpeningBalance = true;

            doNothing().when(journalDao).deleteAndUpdateByIds(ids, updateOpeningBalance);

            journalService.deleteAndUpdateByIds(ids, updateOpeningBalance);

            verify(journalDao, times(1)).deleteAndUpdateByIds(ids, updateOpeningBalance);
        }

        @Test
        @DisplayName("Should handle empty id list with update flag")
        void shouldHandleEmptyIdListWithUpdateFlag() {
            List<Integer> ids = Collections.emptyList();
            Boolean updateOpeningBalance = true;

            doNothing().when(journalDao).deleteAndUpdateByIds(ids, updateOpeningBalance);

            journalService.deleteAndUpdateByIds(ids, updateOpeningBalance);

            verify(journalDao, times(1)).deleteAndUpdateByIds(ids, updateOpeningBalance);
        }

        @Test
        @DisplayName("Should handle null id list with update flag")
        void shouldHandleNullIdListWithUpdateFlag() {
            Boolean updateOpeningBalance = true;

            doNothing().when(journalDao).deleteAndUpdateByIds(null, updateOpeningBalance);

            journalService.deleteAndUpdateByIds(null, updateOpeningBalance);

            verify(journalDao, times(1)).deleteAndUpdateByIds(null, updateOpeningBalance);
        }

        @Test
        @DisplayName("Should handle both null ids and null update flag")
        void shouldHandleBothNullIdsAndNullUpdateFlag() {
            doNothing().when(journalDao).deleteAndUpdateByIds(null, null);

            journalService.deleteAndUpdateByIds(null, null);

            verify(journalDao, times(1)).deleteAndUpdateByIds(null, null);
        }
    }

    @Nested
    @DisplayName("getDao tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return journal dao instance")
        void shouldReturnJournalDaoInstance() {
            assertThat(journalService.getDao()).isEqualTo(journalDao);
        }

        @Test
        @DisplayName("Should return non-null dao")
        void shouldReturnNonNullDao() {
            assertThat(journalService.getDao()).isNotNull();
        }
    }

    @Nested
    @DisplayName("persist tests")
    class PersistTests {

        @Test
        @DisplayName("Should persist journal with line items and update running balance")
        void shouldPersistJournalWithLineItemsAndUpdateRunningBalance() {
            when(transactionCategoryBalanceService.updateRunningBalance(testLineItem1))
                    .thenReturn(new BigDecimal("1000.00"));
            when(transactionCategoryBalanceService.updateRunningBalance(testLineItem2))
                    .thenReturn(new BigDecimal("0.00"));
            doNothing().when(journalDao).persist(testJournal);

            journalService.persist(testJournal);

            verify(transactionCategoryBalanceService, times(1)).updateRunningBalance(testLineItem1);
            verify(transactionCategoryBalanceService, times(1)).updateRunningBalance(testLineItem2);
            verify(journalDao, times(1)).persist(testJournal);
            assertThat(testLineItem1.getCurrentBalance()).isEqualTo(new BigDecimal("1000.00"));
            assertThat(testLineItem2.getCurrentBalance()).isEqualTo(new BigDecimal("0.00"));
        }

        @Test
        @DisplayName("Should persist journal with single line item")
        void shouldPersistJournalWithSingleLineItem() {
            testJournal.setJournalLineItems(Collections.singletonList(testLineItem1));

            when(transactionCategoryBalanceService.updateRunningBalance(testLineItem1))
                    .thenReturn(new BigDecimal("500.00"));
            doNothing().when(journalDao).persist(testJournal);

            journalService.persist(testJournal);

            verify(transactionCategoryBalanceService, times(1)).updateRunningBalance(testLineItem1);
            verify(journalDao, times(1)).persist(testJournal);
            assertThat(testLineItem1.getCurrentBalance()).isEqualTo(new BigDecimal("500.00"));
        }

        @Test
        @DisplayName("Should persist journal with empty line items")
        void shouldPersistJournalWithEmptyLineItems() {
            testJournal.setJournalLineItems(Collections.emptyList());
            doNothing().when(journalDao).persist(testJournal);

            journalService.persist(testJournal);

            verify(transactionCategoryBalanceService, never()).updateRunningBalance(any());
            verify(journalDao, times(1)).persist(testJournal);
        }

        @Test
        @DisplayName("Should persist journal with multiple line items and different balances")
        void shouldPersistJournalWithMultipleLineItemsAndDifferentBalances() {
            JournalLineItem lineItem3 = new JournalLineItem();
            lineItem3.setId(3);
            lineItem3.setDebitAmount(new BigDecimal("250.00"));
            lineItem3.setTransactionCategory(testTransactionCategory);

            testJournal.setJournalLineItems(Arrays.asList(testLineItem1, testLineItem2, lineItem3));

            when(transactionCategoryBalanceService.updateRunningBalance(testLineItem1))
                    .thenReturn(new BigDecimal("1000.00"));
            when(transactionCategoryBalanceService.updateRunningBalance(testLineItem2))
                    .thenReturn(new BigDecimal("2000.00"));
            when(transactionCategoryBalanceService.updateRunningBalance(lineItem3))
                    .thenReturn(new BigDecimal("2250.00"));
            doNothing().when(journalDao).persist(testJournal);

            journalService.persist(testJournal);

            verify(transactionCategoryBalanceService, times(3)).updateRunningBalance(any());
            verify(journalDao, times(1)).persist(testJournal);
        }

        @Test
        @DisplayName("Should persist journal and set current balance correctly")
        void shouldPersistJournalAndSetCurrentBalanceCorrectly() {
            BigDecimal expectedBalance = new BigDecimal("1500.00");

            when(transactionCategoryBalanceService.updateRunningBalance(any()))
                    .thenReturn(expectedBalance);
            doNothing().when(journalDao).persist(testJournal);

            journalService.persist(testJournal);

            assertThat(testLineItem1.getCurrentBalance()).isEqualTo(expectedBalance);
            assertThat(testLineItem2.getCurrentBalance()).isEqualTo(expectedBalance);
            verify(journalDao, times(1)).persist(testJournal);
        }

        @Test
        @DisplayName("Should persist journal with zero balances")
        void shouldPersistJournalWithZeroBalances() {
            when(transactionCategoryBalanceService.updateRunningBalance(any()))
                    .thenReturn(BigDecimal.ZERO);
            doNothing().when(journalDao).persist(testJournal);

            journalService.persist(testJournal);

            assertThat(testLineItem1.getCurrentBalance()).isEqualTo(BigDecimal.ZERO);
            assertThat(testLineItem2.getCurrentBalance()).isEqualTo(BigDecimal.ZERO);
            verify(journalDao, times(1)).persist(testJournal);
        }

        @Test
        @DisplayName("Should persist journal with negative balances")
        void shouldPersistJournalWithNegativeBalances() {
            BigDecimal negativeBalance = new BigDecimal("-500.00");

            when(transactionCategoryBalanceService.updateRunningBalance(any()))
                    .thenReturn(negativeBalance);
            doNothing().when(journalDao).persist(testJournal);

            journalService.persist(testJournal);

            assertThat(testLineItem1.getCurrentBalance()).isEqualTo(negativeBalance);
            assertThat(testLineItem2.getCurrentBalance()).isEqualTo(negativeBalance);
            verify(journalDao, times(1)).persist(testJournal);
        }
    }

    @Nested
    @DisplayName("updateOpeningBalance tests")
    class UpdateOpeningBalanceTests {

        @Test
        @DisplayName("Should update opening balance with updateOpeningBalance true")
        void shouldUpdateOpeningBalanceWithUpdateOpeningBalanceTrue() {
            Boolean updateOpeningBalance = true;

            when(transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(testLineItem1, updateOpeningBalance))
                    .thenReturn(new BigDecimal("1000.00"));
            when(transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(testLineItem2, updateOpeningBalance))
                    .thenReturn(new BigDecimal("0.00"));
            doNothing().when(journalDao).persist(testJournal);

            journalService.updateOpeningBalance(testJournal, updateOpeningBalance);

            verify(transactionCategoryBalanceService, times(1))
                    .updateRunningBalanceAndOpeningBalance(testLineItem1, updateOpeningBalance);
            verify(transactionCategoryBalanceService, times(1))
                    .updateRunningBalanceAndOpeningBalance(testLineItem2, updateOpeningBalance);
            verify(journalDao, times(1)).persist(testJournal);
            assertThat(testLineItem1.getCurrentBalance()).isEqualTo(new BigDecimal("1000.00"));
            assertThat(testLineItem2.getCurrentBalance()).isEqualTo(new BigDecimal("0.00"));
        }

        @Test
        @DisplayName("Should update opening balance with updateOpeningBalance false")
        void shouldUpdateOpeningBalanceWithUpdateOpeningBalanceFalse() {
            Boolean updateOpeningBalance = false;

            when(transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(testLineItem1, updateOpeningBalance))
                    .thenReturn(new BigDecimal("500.00"));
            when(transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(testLineItem2, updateOpeningBalance))
                    .thenReturn(new BigDecimal("500.00"));
            doNothing().when(journalDao).persist(testJournal);

            journalService.updateOpeningBalance(testJournal, updateOpeningBalance);

            verify(transactionCategoryBalanceService, times(1))
                    .updateRunningBalanceAndOpeningBalance(testLineItem1, updateOpeningBalance);
            verify(transactionCategoryBalanceService, times(1))
                    .updateRunningBalanceAndOpeningBalance(testLineItem2, updateOpeningBalance);
            verify(journalDao, times(1)).persist(testJournal);
        }

        @Test
        @DisplayName("Should update opening balance with null updateOpeningBalance flag")
        void shouldUpdateOpeningBalanceWithNullUpdateOpeningBalanceFlag() {
            when(transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(testLineItem1, null))
                    .thenReturn(new BigDecimal("750.00"));
            when(transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(testLineItem2, null))
                    .thenReturn(new BigDecimal("750.00"));
            doNothing().when(journalDao).persist(testJournal);

            journalService.updateOpeningBalance(testJournal, null);

            verify(transactionCategoryBalanceService, times(1))
                    .updateRunningBalanceAndOpeningBalance(testLineItem1, null);
            verify(transactionCategoryBalanceService, times(1))
                    .updateRunningBalanceAndOpeningBalance(testLineItem2, null);
            verify(journalDao, times(1)).persist(testJournal);
        }

        @Test
        @DisplayName("Should update opening balance for single line item")
        void shouldUpdateOpeningBalanceForSingleLineItem() {
            testJournal.setJournalLineItems(Collections.singletonList(testLineItem1));
            Boolean updateOpeningBalance = true;

            when(transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(testLineItem1, updateOpeningBalance))
                    .thenReturn(new BigDecimal("2000.00"));
            doNothing().when(journalDao).persist(testJournal);

            journalService.updateOpeningBalance(testJournal, updateOpeningBalance);

            verify(transactionCategoryBalanceService, times(1))
                    .updateRunningBalanceAndOpeningBalance(testLineItem1, updateOpeningBalance);
            verify(journalDao, times(1)).persist(testJournal);
            assertThat(testLineItem1.getCurrentBalance()).isEqualTo(new BigDecimal("2000.00"));
        }

        @Test
        @DisplayName("Should update opening balance for empty line items")
        void shouldUpdateOpeningBalanceForEmptyLineItems() {
            testJournal.setJournalLineItems(Collections.emptyList());
            Boolean updateOpeningBalance = true;

            doNothing().when(journalDao).persist(testJournal);

            journalService.updateOpeningBalance(testJournal, updateOpeningBalance);

            verify(transactionCategoryBalanceService, never())
                    .updateRunningBalanceAndOpeningBalance(any(), any());
            verify(journalDao, times(1)).persist(testJournal);
        }

        @Test
        @DisplayName("Should update opening balance for multiple line items")
        void shouldUpdateOpeningBalanceForMultipleLineItems() {
            JournalLineItem lineItem3 = new JournalLineItem();
            lineItem3.setId(3);
            lineItem3.setDebitAmount(new BigDecimal("100.00"));
            lineItem3.setTransactionCategory(testTransactionCategory);

            testJournal.setJournalLineItems(Arrays.asList(testLineItem1, testLineItem2, lineItem3));
            Boolean updateOpeningBalance = true;

            when(transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(any(), eq(updateOpeningBalance)))
                    .thenReturn(new BigDecimal("1100.00"));
            doNothing().when(journalDao).persist(testJournal);

            journalService.updateOpeningBalance(testJournal, updateOpeningBalance);

            verify(transactionCategoryBalanceService, times(3))
                    .updateRunningBalanceAndOpeningBalance(any(), eq(updateOpeningBalance));
            verify(journalDao, times(1)).persist(testJournal);
        }

        @Test
        @DisplayName("Should update opening balance with negative amounts")
        void shouldUpdateOpeningBalanceWithNegativeAmounts() {
            Boolean updateOpeningBalance = true;
            BigDecimal negativeBalance = new BigDecimal("-300.00");

            when(transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(any(), eq(updateOpeningBalance)))
                    .thenReturn(negativeBalance);
            doNothing().when(journalDao).persist(testJournal);

            journalService.updateOpeningBalance(testJournal, updateOpeningBalance);

            assertThat(testLineItem1.getCurrentBalance()).isEqualTo(negativeBalance);
            assertThat(testLineItem2.getCurrentBalance()).isEqualTo(negativeBalance);
            verify(journalDao, times(1)).persist(testJournal);
        }

        @Test
        @DisplayName("Should update opening balance with zero amounts")
        void shouldUpdateOpeningBalanceWithZeroAmounts() {
            Boolean updateOpeningBalance = false;

            when(transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(any(), eq(updateOpeningBalance)))
                    .thenReturn(BigDecimal.ZERO);
            doNothing().when(journalDao).persist(testJournal);

            journalService.updateOpeningBalance(testJournal, updateOpeningBalance);

            assertThat(testLineItem1.getCurrentBalance()).isEqualTo(BigDecimal.ZERO);
            assertThat(testLineItem2.getCurrentBalance()).isEqualTo(BigDecimal.ZERO);
            verify(journalDao, times(1)).persist(testJournal);
        }

        @Test
        @DisplayName("Should update opening balance with large amounts")
        void shouldUpdateOpeningBalanceWithLargeAmounts() {
            Boolean updateOpeningBalance = true;
            BigDecimal largeBalance = new BigDecimal("999999999.99");

            when(transactionCategoryBalanceService.updateRunningBalanceAndOpeningBalance(any(), eq(updateOpeningBalance)))
                    .thenReturn(largeBalance);
            doNothing().when(journalDao).persist(testJournal);

            journalService.updateOpeningBalance(testJournal, updateOpeningBalance);

            assertThat(testLineItem1.getCurrentBalance()).isEqualTo(largeBalance);
            assertThat(testLineItem2.getCurrentBalance()).isEqualTo(largeBalance);
            verify(journalDao, times(1)).persist(testJournal);
        }
    }

    @Nested
    @DisplayName("Integration tests")
    class IntegrationTests {

        @Test
        @DisplayName("Should handle complete journal lifecycle - create, retrieve, delete")
        void shouldHandleCompleteJournalLifecycle() {
            // Create journal
            when(transactionCategoryBalanceService.updateRunningBalance(any()))
                    .thenReturn(new BigDecimal("1000.00"));
            doNothing().when(journalDao).persist(testJournal);

            journalService.persist(testJournal);

            verify(journalDao, times(1)).persist(testJournal);

            // Retrieve journal
            when(journalDao.getJournalByReferenceId(100)).thenReturn(testJournal);

            Journal retrieved = journalService.getJournalByReferenceId(100);

            assertThat(retrieved).isNotNull();
            assertThat(retrieved.getId()).isEqualTo(testJournal.getId());

            // Delete journal
            doNothing().when(journalDao).deleteByIds(Collections.singletonList(1));

            journalService.deleteByIds(Collections.singletonList(1));

            verify(journalDao, times(1)).deleteByIds(Collections.singletonList(1));
        }

        @Test
        @DisplayName("Should handle journal with different reference types")
        void shouldHandleJournalWithDifferentReferenceTypes() {
            testJournal.setPostingReferenceType(PostingReferenceTypeEnum.INVOICE);
            when(journalDao.getJournalByReferenceIdAndType(1, PostingReferenceTypeEnum.INVOICE))
                    .thenReturn(testJournal);

            Journal invoice = journalService.getJournalByReferenceIdAndType(1, PostingReferenceTypeEnum.INVOICE);
            assertThat(invoice.getPostingReferenceType()).isEqualTo(PostingReferenceTypeEnum.INVOICE);

            testJournal.setPostingReferenceType(PostingReferenceTypeEnum.EXPENSE);
            when(journalDao.getJournalByReferenceIdAndType(2, PostingReferenceTypeEnum.EXPENSE))
                    .thenReturn(testJournal);

            Journal expense = journalService.getJournalByReferenceIdAndType(2, PostingReferenceTypeEnum.EXPENSE);
            assertThat(expense.getPostingReferenceType()).isEqualTo(PostingReferenceTypeEnum.EXPENSE);
        }

        @Test
        @DisplayName("Should handle pagination through multiple pages")
        void shouldHandlePaginationThroughMultiplePages() {
            Map<JournalFilterEnum, Object> filterMap = new HashMap<>();

            // Page 1
            PaginationModel page1 = new PaginationModel();
            page1.setPageNumber(0);
            page1.setPageSize(10);
            PaginationResponseModel response1 = new PaginationResponseModel();
            response1.setTotalElements(25L);
            when(journalDao.getJornalList(filterMap, page1)).thenReturn(response1);

            PaginationResponseModel result1 = journalService.getJornalList(filterMap, page1);
            assertThat(result1.getTotalElements()).isEqualTo(25L);

            // Page 2
            PaginationModel page2 = new PaginationModel();
            page2.setPageNumber(1);
            page2.setPageSize(10);
            PaginationResponseModel response2 = new PaginationResponseModel();
            response2.setTotalElements(25L);
            when(journalDao.getJornalList(filterMap, page2)).thenReturn(response2);

            PaginationResponseModel result2 = journalService.getJornalList(filterMap, page2);
            assertThat(result2.getTotalElements()).isEqualTo(25L);
        }
    }

    @Nested
    @DisplayName("Edge case tests")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should handle journal with null currency")
        void shouldHandleJournalWithNullCurrency() {
            testJournal.setCurrency(null);

            when(transactionCategoryBalanceService.updateRunningBalance(any()))
                    .thenReturn(new BigDecimal("100.00"));
            doNothing().when(journalDao).persist(testJournal);

            journalService.persist(testJournal);

            assertThat(testJournal.getCurrency()).isNull();
            verify(journalDao, times(1)).persist(testJournal);
        }

        @Test
        @DisplayName("Should handle journal with null description")
        void shouldHandleJournalWithNullDescription() {
            testJournal.setDescription(null);

            when(journalDao.getJournalByReferenceId(1)).thenReturn(testJournal);

            Journal result = journalService.getJournalByReferenceId(1);

            assertThat(result.getDescription()).isNull();
        }

        @Test
        @DisplayName("Should handle journal with null reference number")
        void shouldHandleJournalWithNullReferenceNumber() {
            testJournal.setJournlReferencenNo(null);

            when(journalDao.getJournalByReferenceId(1)).thenReturn(testJournal);

            Journal result = journalService.getJournalByReferenceId(1);

            assertThat(result.getJournlReferencenNo()).isNull();
        }

        @Test
        @DisplayName("Should handle line item with null transaction category")
        void shouldHandleLineItemWithNullTransactionCategory() {
            testLineItem1.setTransactionCategory(null);

            when(transactionCategoryBalanceService.updateRunningBalance(testLineItem1))
                    .thenReturn(BigDecimal.ZERO);
            doNothing().when(journalDao).persist(testJournal);

            journalService.persist(testJournal);

            assertThat(testLineItem1.getTransactionCategory()).isNull();
            verify(journalDao, times(1)).persist(testJournal);
        }

        @Test
        @DisplayName("Should handle very large debit and credit amounts")
        void shouldHandleVeryLargeDebitAndCreditAmounts() {
            BigDecimal largeAmount = new BigDecimal("999999999999.99");
            testLineItem1.setDebitAmount(largeAmount);
            testLineItem2.setCreditAmount(largeAmount);

            when(transactionCategoryBalanceService.updateRunningBalance(any()))
                    .thenReturn(largeAmount);
            doNothing().when(journalDao).persist(testJournal);

            journalService.persist(testJournal);

            verify(journalDao, times(1)).persist(testJournal);
        }

        @Test
        @DisplayName("Should handle journal with past date")
        void shouldHandleJournalWithPastDate() {
            testJournal.setJournalDate(LocalDate.now().minusYears(5));

            when(journalDao.getJournalByReferenceId(1)).thenReturn(testJournal);

            Journal result = journalService.getJournalByReferenceId(1);

            assertThat(result.getJournalDate()).isBefore(LocalDate.now());
        }

        @Test
        @DisplayName("Should handle journal with future date")
        void shouldHandleJournalWithFuturDate() {
            testJournal.setJournalDate(LocalDate.now().plusYears(1));

            when(journalDao.getJournalByReferenceId(1)).thenReturn(testJournal);

            Journal result = journalService.getJournalByReferenceId(1);

            assertThat(result.getJournalDate()).isAfter(LocalDate.now());
        }

        @Test
        @DisplayName("Should handle journal with reversal flag set")
        void shouldHandleJournalWithReversalFlagSet() {
            testJournal.setReversalFlag(true);

            when(journalDao.getJournalByReferenceId(1)).thenReturn(testJournal);

            Journal result = journalService.getJournalByReferenceId(1);

            assertThat(result.getReversalFlag()).isTrue();
        }

        @Test
        @DisplayName("Should handle journal with delete flag set")
        void shouldHandleJournalWithDeleteFlagSet() {
            testJournal.setDeleteFlag(true);

            when(journalDao.getJournalByReferenceId(1)).thenReturn(testJournal);

            Journal result = journalService.getJournalByReferenceId(1);

            assertThat(result.getDeleteFlag()).isTrue();
        }
    }
}
