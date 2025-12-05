package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.PayMode;
import com.simpleaccounts.constant.dbfilter.ReceiptFilterEnum;
import com.simpleaccounts.dao.AbstractFilter;
import com.simpleaccounts.dao.ActivityDao;
import com.simpleaccounts.dao.ReceiptDao;
import com.simpleaccounts.entity.Activity;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.entity.Receipt;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.exceptions.ServiceException;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReceiptServiceImplTest {

    @Mock
    private ReceiptDao receiptDao;

    @Mock
    private ActivityDao activityDao;

    @InjectMocks
    private ReceiptServiceImpl receiptService;

    private Receipt testReceipt;
    private Contact testContact;
    private Invoice testInvoice;
    private TransactionCategory testCategory;

    @BeforeEach
    void setUp() {
        testContact = new Contact();
        testContact.setContactId(1);
        testContact.setFirstName("John");
        testContact.setLastName("Doe");

        testInvoice = new Invoice();
        testInvoice.setInvoiceId(1);
        testInvoice.setInvoiceNumber("INV-001");

        testCategory = new TransactionCategory();
        testCategory.setId(1);
        testCategory.setName("Bank Account");

        testReceipt = new Receipt();
        testReceipt.setId(1);
        testReceipt.setReceiptNo("REC-001");
        testReceipt.setReceiptDate(LocalDateTime.now());
        testReceipt.setReferenceCode("REF-001");
        testReceipt.setContact(testContact);
        testReceipt.setInvoice(testInvoice);
        testReceipt.setAmount(new BigDecimal("1000.00"));
        testReceipt.setNotes("Test receipt");
        testReceipt.setPayMode(PayMode.CASH);
        testReceipt.setDepositeToTransactionCategory(testCategory);
        testReceipt.setCreatedBy(1);
        testReceipt.setCreatedDate(LocalDateTime.now());
        testReceipt.setDeleteFlag(Boolean.FALSE);
        testReceipt.setVersionNumber(1);
    }

    // Test getReceiptList method

    @Test
    void shouldGetReceiptListWithFiltersAndPagination() {
        Map<ReceiptFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(ReceiptFilterEnum.CONTACT, testContact);
        filterMap.put(ReceiptFilterEnum.DELETE, Boolean.FALSE);

        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);

        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setCount(50);
        expectedResponse.setData(Collections.singletonList(testReceipt));

        when(receiptDao.getProductList(filterMap, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = receiptService.getReceiptList(filterMap, paginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(50);
        assertThat(result.getData()).isEqualTo(Collections.singletonList(testReceipt));
        verify(receiptDao, times(1)).getProductList(filterMap, paginationModel);
    }

    @Test
    void shouldGetReceiptListWithEmptyFilter() {
        Map<ReceiptFilterEnum, Object> emptyMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();

        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setCount(0);
        expectedResponse.setData(Collections.emptyList());

        when(receiptDao.getProductList(emptyMap, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = receiptService.getReceiptList(emptyMap, paginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(0);
        verify(receiptDao, times(1)).getProductList(emptyMap, paginationModel);
    }

    @Test
    void shouldGetReceiptListFilteredByContact() {
        Map<ReceiptFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(ReceiptFilterEnum.CONTACT, testContact);

        PaginationModel paginationModel = new PaginationModel();
        PaginationResponseModel expectedResponse = new PaginationResponseModel(10, Collections.singletonList(testReceipt));

        when(receiptDao.getProductList(filterMap, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = receiptService.getReceiptList(filterMap, paginationModel);

        assertThat(result.getCount()).isEqualTo(10);
        verify(receiptDao, times(1)).getProductList(filterMap, paginationModel);
    }

    @Test
    void shouldGetReceiptListFilteredByInvoice() {
        Map<ReceiptFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(ReceiptFilterEnum.INVOICE, testInvoice);

        PaginationModel paginationModel = new PaginationModel();
        PaginationResponseModel expectedResponse = new PaginationResponseModel(5, Collections.singletonList(testReceipt));

        when(receiptDao.getProductList(filterMap, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = receiptService.getReceiptList(filterMap, paginationModel);

        assertThat(result.getCount()).isEqualTo(5);
        verify(receiptDao, times(1)).getProductList(filterMap, paginationModel);
    }

    @Test
    void shouldGetReceiptListFilteredByReferenceCode() {
        Map<ReceiptFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(ReceiptFilterEnum.REFERENCE_CODE, "REF-001");

        PaginationModel paginationModel = new PaginationModel();
        PaginationResponseModel expectedResponse = new PaginationResponseModel(3, Collections.singletonList(testReceipt));

        when(receiptDao.getProductList(filterMap, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = receiptService.getReceiptList(filterMap, paginationModel);

        assertThat(result.getCount()).isEqualTo(3);
        verify(receiptDao, times(1)).getProductList(filterMap, paginationModel);
    }

    @Test
    void shouldGetReceiptListFilteredByUserId() {
        Map<ReceiptFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(ReceiptFilterEnum.USER_ID, 1);

        PaginationModel paginationModel = new PaginationModel();
        PaginationResponseModel expectedResponse = new PaginationResponseModel(25, Collections.singletonList(testReceipt));

        when(receiptDao.getProductList(filterMap, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = receiptService.getReceiptList(filterMap, paginationModel);

        assertThat(result.getCount()).isEqualTo(25);
        verify(receiptDao, times(1)).getProductList(filterMap, paginationModel);
    }

    @Test
    void shouldGetReceiptListWithMultipleFilters() {
        Map<ReceiptFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(ReceiptFilterEnum.CONTACT, testContact);
        filterMap.put(ReceiptFilterEnum.INVOICE, testInvoice);
        filterMap.put(ReceiptFilterEnum.DELETE, Boolean.FALSE);
        filterMap.put(ReceiptFilterEnum.USER_ID, 1);

        PaginationModel paginationModel = new PaginationModel();
        PaginationResponseModel expectedResponse = new PaginationResponseModel(2, Collections.singletonList(testReceipt));

        when(receiptDao.getProductList(filterMap, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = receiptService.getReceiptList(filterMap, paginationModel);

        assertThat(result.getCount()).isEqualTo(2);
        verify(receiptDao, times(1)).getProductList(filterMap, paginationModel);
    }

    @Test
    void shouldGetReceiptListWithNullFilterMap() {
        PaginationModel paginationModel = new PaginationModel();
        PaginationResponseModel expectedResponse = new PaginationResponseModel();

        when(receiptDao.getProductList(null, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = receiptService.getReceiptList(null, paginationModel);

        assertThat(result).isNotNull();
        verify(receiptDao, times(1)).getProductList(null, paginationModel);
    }

    @Test
    void shouldGetReceiptListWithNullPaginationModel() {
        Map<ReceiptFilterEnum, Object> filterMap = new HashMap<>();
        PaginationResponseModel expectedResponse = new PaginationResponseModel();

        when(receiptDao.getProductList(filterMap, null)).thenReturn(expectedResponse);

        PaginationResponseModel result = receiptService.getReceiptList(filterMap, null);

        assertThat(result).isNotNull();
        verify(receiptDao, times(1)).getProductList(filterMap, null);
    }

    // Test deleteByIds method

    @Test
    void shouldDeleteByIds() {
        List<Integer> ids = Arrays.asList(1, 2, 3);
        doNothing().when(receiptDao).deleteByIds(ids);

        receiptService.deleteByIds(ids);

        verify(receiptDao, times(1)).deleteByIds(ids);
    }

    @Test
    void shouldDeleteByIdsWithSingleId() {
        List<Integer> singleId = Collections.singletonList(1);
        doNothing().when(receiptDao).deleteByIds(singleId);

        receiptService.deleteByIds(singleId);

        verify(receiptDao, times(1)).deleteByIds(singleId);
    }

    @Test
    void shouldDeleteByIdsWithEmptyList() {
        List<Integer> emptyIds = Collections.emptyList();
        doNothing().when(receiptDao).deleteByIds(emptyIds);

        receiptService.deleteByIds(emptyIds);

        verify(receiptDao, times(1)).deleteByIds(emptyIds);
    }

    @Test
    void shouldDeleteByIdsWithMultipleIds() {
        List<Integer> ids = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        doNothing().when(receiptDao).deleteByIds(ids);

        receiptService.deleteByIds(ids);

        verify(receiptDao, times(1)).deleteByIds(ids);
    }

    @Test
    void shouldDeleteByIdsWithNullList() {
        doNothing().when(receiptDao).deleteByIds(null);

        receiptService.deleteByIds(null);

        verify(receiptDao, times(1)).deleteByIds(null);
    }

    // Test getDao method

    @Test
    void shouldReturnReceiptDao() {
        assertThat(receiptService.getDao()).isEqualTo(receiptDao);
    }

    @Test
    void shouldReturnNonNullDao() {
        assertThat(receiptService.getDao()).isNotNull();
    }

    // Test inherited findByPK method

    @Test
    void shouldFindReceiptByPrimaryKey() {
        when(receiptDao.findByPK(1)).thenReturn(testReceipt);

        Receipt result = receiptService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1);
        assertThat(result.getReceiptNo()).isEqualTo("REC-001");
        verify(receiptDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenReceiptNotFoundByPK() {
        when(receiptDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> receiptService.findByPK(999))
                .isInstanceOf(ServiceException.class);
        verify(receiptDao, times(1)).findByPK(999);
    }

    @Test
    void shouldFindReceiptByPKWithNullId() {
        when(receiptDao.findByPK(null)).thenReturn(null);

        assertThatThrownBy(() -> receiptService.findByPK(null))
                .isInstanceOf(ServiceException.class);
        verify(receiptDao, times(1)).findByPK(null);
    }

    // Test inherited persist method

    @Test
    void shouldPersistNewReceipt() {
        Receipt newReceipt = new Receipt();
        newReceipt.setReceiptNo("REC-002");
        newReceipt.setAmount(new BigDecimal("500.00"));

        when(receiptDao.findByPK(null)).thenReturn(null);
        doNothing().when(receiptDao).persist(newReceipt);
        doNothing().when(activityDao).persist(any(Activity.class));

        receiptService.persist(newReceipt);

        verify(receiptDao, times(1)).persist(newReceipt);
        verify(activityDao, times(1)).persist(any(Activity.class));
    }

    @Test
    void shouldPersistReceiptWithoutCheckingExistence() {
        Receipt newReceipt = new Receipt();
        newReceipt.setReceiptNo("REC-003");

        doNothing().when(receiptDao).persist(newReceipt);
        doNothing().when(activityDao).persist(any(Activity.class));

        receiptService.persist(newReceipt);

        verify(receiptDao, times(1)).persist(newReceipt);
        verify(receiptDao, never()).findByPK(any());
    }

    @Test
    void shouldPersistReceiptWithPrimaryKey() {
        Receipt newReceipt = new Receipt();
        newReceipt.setReceiptNo("REC-004");

        when(receiptDao.findByPK(2)).thenReturn(null);
        doNothing().when(receiptDao).persist(newReceipt);
        doNothing().when(activityDao).persist(any(Activity.class));

        receiptService.persist(newReceipt, 2);

        verify(receiptDao, times(1)).findByPK(2);
        verify(receiptDao, times(1)).persist(newReceipt);
    }

    @Test
    void shouldThrowExceptionWhenPersistingExistingReceipt() {
        when(receiptDao.findByPK(1)).thenReturn(testReceipt);

        assertThatThrownBy(() -> receiptService.persist(testReceipt, 1))
                .isInstanceOf(ServiceException.class);
        verify(receiptDao, times(1)).findByPK(1);
        verify(receiptDao, never()).persist(any());
    }

    // Test inherited update method

    @Test
    void shouldUpdateReceipt() {
        testReceipt.setAmount(new BigDecimal("2000.00"));
        when(receiptDao.update(testReceipt)).thenReturn(testReceipt);
        doNothing().when(activityDao).persist(any(Activity.class));

        Receipt result = receiptService.update(testReceipt);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualTo(new BigDecimal("2000.00"));
        verify(receiptDao, times(1)).update(testReceipt);
        verify(activityDao, times(1)).persist(any(Activity.class));
    }

    @Test
    void shouldUpdateReceiptWithPrimaryKey() {
        testReceipt.setNotes("Updated notes");
        when(receiptDao.update(testReceipt)).thenReturn(testReceipt);
        doNothing().when(activityDao).persist(any(Activity.class));

        Receipt result = receiptService.update(testReceipt, 1);

        assertThat(result).isNotNull();
        assertThat(result.getNotes()).isEqualTo("Updated notes");
        verify(receiptDao, times(1)).update(testReceipt);
    }

    @Test
    void shouldUpdateReceiptWithNullPrimaryKey() {
        when(receiptDao.update(testReceipt)).thenReturn(testReceipt);
        doNothing().when(activityDao).persist(any(Activity.class));

        Receipt result = receiptService.update(testReceipt, null);

        assertThat(result).isNotNull();
        verify(receiptDao, times(1)).update(testReceipt);
    }

    @Test
    void shouldUpdateReceiptAndReturnUpdatedEntity() {
        Receipt updatedReceipt = new Receipt();
        updatedReceipt.setId(1);
        updatedReceipt.setReceiptNo("REC-001-UPDATED");

        when(receiptDao.update(testReceipt)).thenReturn(updatedReceipt);
        doNothing().when(activityDao).persist(any(Activity.class));

        Receipt result = receiptService.update(testReceipt);

        assertThat(result.getReceiptNo()).isEqualTo("REC-001-UPDATED");
        verify(receiptDao, times(1)).update(testReceipt);
    }

    // Test inherited delete method

    @Test
    void shouldDeleteReceipt() {
        doNothing().when(receiptDao).delete(testReceipt);
        doNothing().when(activityDao).persist(any(Activity.class));

        receiptService.delete(testReceipt);

        verify(receiptDao, times(1)).delete(testReceipt);
        verify(activityDao, times(1)).persist(any(Activity.class));
    }

    @Test
    void shouldDeleteReceiptWithPrimaryKey() {
        when(receiptDao.findByPK(1)).thenReturn(testReceipt);
        doNothing().when(receiptDao).delete(testReceipt);
        doNothing().when(activityDao).persist(any(Activity.class));

        receiptService.delete(testReceipt, 1);

        verify(receiptDao, times(1)).findByPK(1);
        verify(receiptDao, times(1)).delete(testReceipt);
    }

    @Test
    void shouldThrowExceptionWhenDeletingNonExistentReceipt() {
        when(receiptDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> receiptService.delete(testReceipt, 999))
                .isInstanceOf(ServiceException.class);
        verify(receiptDao, times(1)).findByPK(999);
        verify(receiptDao, never()).delete(any());
    }

    @Test
    void shouldDeleteReceiptWithNullPrimaryKey() {
        doNothing().when(receiptDao).delete(testReceipt);
        doNothing().when(activityDao).persist(any(Activity.class));

        receiptService.delete(testReceipt, null);

        verify(receiptDao, never()).findByPK(any());
        verify(receiptDao, times(1)).delete(testReceipt);
    }

    // Test inherited findByAttributes method

    @Test
    void shouldFindReceiptsByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("receiptNo", "REC-001");
        attributes.put("deleteFlag", Boolean.FALSE);

        List<Receipt> expectedReceipts = Arrays.asList(testReceipt);
        when(receiptDao.findByAttributes(attributes)).thenReturn(expectedReceipts);

        List<Receipt> result = receiptService.findByAttributes(attributes);

        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getReceiptNo()).isEqualTo("REC-001");
        verify(receiptDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("receiptNo", "NON-EXISTENT");

        when(receiptDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<Receipt> result = receiptService.findByAttributes(attributes);

        assertThat(result).isEmpty();
        verify(receiptDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListForNullAttributes() {
        List<Receipt> result = receiptService.findByAttributes(null);

        assertThat(result).isEmpty();
        verify(receiptDao, never()).findByAttributes(any());
    }

    @Test
    void shouldReturnEmptyListForEmptyAttributes() {
        Map<String, Object> emptyAttributes = new HashMap<>();

        List<Receipt> result = receiptService.findByAttributes(emptyAttributes);

        assertThat(result).isEmpty();
        verify(receiptDao, never()).findByAttributes(any());
    }

    @Test
    void shouldFindReceiptsByMultipleAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("contact", testContact);
        attributes.put("invoice", testInvoice);
        attributes.put("deleteFlag", Boolean.FALSE);

        List<Receipt> expectedReceipts = Arrays.asList(testReceipt);
        when(receiptDao.findByAttributes(attributes)).thenReturn(expectedReceipts);

        List<Receipt> result = receiptService.findByAttributes(attributes);

        assertThat(result).hasSize(1);
        verify(receiptDao, times(1)).findByAttributes(attributes);
    }

    // Test inherited filter method

    @Test
    void shouldFilterReceipts() {
        AbstractFilter<Receipt> filter = mock(AbstractFilter.class);
        List<Receipt> expectedReceipts = Arrays.asList(testReceipt);

        when(receiptDao.filter(filter)).thenReturn(expectedReceipts);

        List<Receipt> result = receiptService.filter(filter);

        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
        verify(receiptDao, times(1)).filter(filter);
    }

    @Test
    void shouldReturnEmptyListForNullFilter() {
        List<Receipt> result = receiptService.filter(null);

        assertThat(result).isEmpty();
        verify(receiptDao, never()).filter(any());
    }

    @Test
    void shouldFilterReceiptsAndReturnEmptyList() {
        AbstractFilter<Receipt> filter = mock(AbstractFilter.class);
        when(receiptDao.filter(filter)).thenReturn(Collections.emptyList());

        List<Receipt> result = receiptService.filter(filter);

        assertThat(result).isEmpty();
        verify(receiptDao, times(1)).filter(filter);
    }

    @Test
    void shouldFilterReceiptsWithMultipleResults() {
        AbstractFilter<Receipt> filter = mock(AbstractFilter.class);

        Receipt receipt2 = new Receipt();
        receipt2.setId(2);
        receipt2.setReceiptNo("REC-002");

        Receipt receipt3 = new Receipt();
        receipt3.setId(3);
        receipt3.setReceiptNo("REC-003");

        List<Receipt> expectedReceipts = Arrays.asList(testReceipt, receipt2, receipt3);
        when(receiptDao.filter(filter)).thenReturn(expectedReceipts);

        List<Receipt> result = receiptService.filter(filter);

        assertThat(result).hasSize(3);
        verify(receiptDao, times(1)).filter(filter);
    }

    // Test inherited executeNamedQuery method

    @Test
    void shouldExecuteNamedQuery() {
        String namedQuery = "Receipt.findAll";
        List<Receipt> expectedReceipts = Arrays.asList(testReceipt);

        when(receiptDao.executeNamedQuery(namedQuery)).thenReturn(expectedReceipts);

        List<Receipt> result = receiptService.executeNamedQuery(namedQuery);

        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
        verify(receiptDao, times(1)).executeNamedQuery(namedQuery);
    }

    @Test
    void shouldExecuteNamedQueryWithNoResults() {
        String namedQuery = "Receipt.findByInvalidCriteria";
        when(receiptDao.executeNamedQuery(namedQuery)).thenReturn(Collections.emptyList());

        List<Receipt> result = receiptService.executeNamedQuery(namedQuery);

        assertThat(result).isEmpty();
        verify(receiptDao, times(1)).executeNamedQuery(namedQuery);
    }

    @Test
    void shouldExecuteNamedQueryWithNullQueryName() {
        when(receiptDao.executeNamedQuery(null)).thenReturn(Collections.emptyList());

        List<Receipt> result = receiptService.executeNamedQuery(null);

        assertThat(result).isEmpty();
        verify(receiptDao, times(1)).executeNamedQuery(null);
    }

    // Test inherited getFirstElement method

    @Test
    void shouldGetFirstElementFromList() {
        List<Receipt> receipts = Arrays.asList(testReceipt, new Receipt(), new Receipt());

        Receipt result = receiptService.getFirstElement(receipts);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testReceipt);
        assertThat(result.getId()).isEqualTo(1);
    }

    @Test
    void shouldReturnNullForEmptyList() {
        List<Receipt> emptyList = Collections.emptyList();

        Receipt result = receiptService.getFirstElement(emptyList);

        assertThat(result).isNull();
    }

    @Test
    void shouldReturnNullForNullList() {
        Receipt result = receiptService.getFirstElement(null);

        assertThat(result).isNull();
    }

    @Test
    void shouldGetFirstElementFromSingleElementList() {
        List<Receipt> singleReceipt = Collections.singletonList(testReceipt);

        Receipt result = receiptService.getFirstElement(singleReceipt);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testReceipt);
    }

    // Test inherited getLastElement method

    @Test
    void shouldGetLastElementFromList() {
        Receipt lastReceipt = new Receipt();
        lastReceipt.setId(3);
        lastReceipt.setReceiptNo("REC-003");

        List<Receipt> receipts = Arrays.asList(testReceipt, new Receipt(), lastReceipt);

        Receipt result = receiptService.getLastElement(receipts);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(lastReceipt);
        assertThat(result.getId()).isEqualTo(3);
    }

    @Test
    void shouldReturnNullForEmptyListWhenGettingLastElement() {
        List<Receipt> emptyList = Collections.emptyList();

        Receipt result = receiptService.getLastElement(emptyList);

        assertThat(result).isNull();
    }

    @Test
    void shouldReturnNullForNullListWhenGettingLastElement() {
        Receipt result = receiptService.getLastElement(null);

        assertThat(result).isNull();
    }

    @Test
    void shouldGetLastElementFromSingleElementList() {
        List<Receipt> singleReceipt = Collections.singletonList(testReceipt);

        Receipt result = receiptService.getLastElement(singleReceipt);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testReceipt);
    }

    // Edge case tests

    @Test
    void shouldHandleReceiptWithNullContact() {
        Receipt receiptWithNullContact = new Receipt();
        receiptWithNullContact.setId(2);
        receiptWithNullContact.setReceiptNo("REC-002");
        receiptWithNullContact.setContact(null);

        when(receiptDao.findByPK(2)).thenReturn(receiptWithNullContact);

        Receipt result = receiptService.findByPK(2);

        assertThat(result).isNotNull();
        assertThat(result.getContact()).isNull();
        verify(receiptDao, times(1)).findByPK(2);
    }

    @Test
    void shouldHandleReceiptWithNullInvoice() {
        Receipt receiptWithNullInvoice = new Receipt();
        receiptWithNullInvoice.setId(3);
        receiptWithNullInvoice.setReceiptNo("REC-003");
        receiptWithNullInvoice.setInvoice(null);

        when(receiptDao.findByPK(3)).thenReturn(receiptWithNullInvoice);

        Receipt result = receiptService.findByPK(3);

        assertThat(result).isNotNull();
        assertThat(result.getInvoice()).isNull();
        verify(receiptDao, times(1)).findByPK(3);
    }

    @Test
    void shouldHandleReceiptWithZeroAmount() {
        Receipt receiptWithZeroAmount = new Receipt();
        receiptWithZeroAmount.setId(4);
        receiptWithZeroAmount.setAmount(BigDecimal.ZERO);

        when(receiptDao.findByPK(4)).thenReturn(receiptWithZeroAmount);

        Receipt result = receiptService.findByPK(4);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualTo(BigDecimal.ZERO);
        verify(receiptDao, times(1)).findByPK(4);
    }

    @Test
    void shouldHandleReceiptWithNullPayMode() {
        Receipt receiptWithNullPayMode = new Receipt();
        receiptWithNullPayMode.setId(5);
        receiptWithNullPayMode.setPayMode(null);

        when(receiptDao.findByPK(5)).thenReturn(receiptWithNullPayMode);

        Receipt result = receiptService.findByPK(5);

        assertThat(result).isNotNull();
        assertThat(result.getPayMode()).isNull();
        verify(receiptDao, times(1)).findByPK(5);
    }

    @Test
    void shouldHandleReceiptWithAllPayModes() {
        for (PayMode payMode : PayMode.values()) {
            Receipt receipt = new Receipt();
            receipt.setId(100 + payMode.ordinal());
            receipt.setPayMode(payMode);

            when(receiptDao.findByPK(receipt.getId())).thenReturn(receipt);

            Receipt result = receiptService.findByPK(receipt.getId());

            assertThat(result.getPayMode()).isEqualTo(payMode);
        }
    }

    @Test
    void shouldHandleReceiptWithDeletedFlag() {
        Receipt deletedReceipt = new Receipt();
        deletedReceipt.setId(6);
        deletedReceipt.setDeleteFlag(Boolean.TRUE);

        when(receiptDao.findByPK(6)).thenReturn(deletedReceipt);

        Receipt result = receiptService.findByPK(6);

        assertThat(result).isNotNull();
        assertThat(result.getDeleteFlag()).isTrue();
        verify(receiptDao, times(1)).findByPK(6);
    }

    @Test
    void shouldHandleReceiptWithEmptyNotes() {
        Receipt receiptWithEmptyNotes = new Receipt();
        receiptWithEmptyNotes.setId(7);
        receiptWithEmptyNotes.setNotes("");

        when(receiptDao.findByPK(7)).thenReturn(receiptWithEmptyNotes);

        Receipt result = receiptService.findByPK(7);

        assertThat(result).isNotNull();
        assertThat(result.getNotes()).isEmpty();
        verify(receiptDao, times(1)).findByPK(7);
    }

    @Test
    void shouldHandleReceiptWithLargeAmount() {
        Receipt receiptWithLargeAmount = new Receipt();
        receiptWithLargeAmount.setId(8);
        receiptWithLargeAmount.setAmount(new BigDecimal("999999999.99"));

        when(receiptDao.findByPK(8)).thenReturn(receiptWithLargeAmount);

        Receipt result = receiptService.findByPK(8);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualTo(new BigDecimal("999999999.99"));
        verify(receiptDao, times(1)).findByPK(8);
    }

    @Test
    void shouldVerifyActivityLoggingOnPersist() {
        Receipt newReceipt = new Receipt();
        newReceipt.setReceiptNo("REC-999");

        doNothing().when(receiptDao).persist(newReceipt);

        ArgumentCaptor<Activity> activityCaptor = ArgumentCaptor.forClass(Activity.class);
        doNothing().when(activityDao).persist(activityCaptor.capture());

        receiptService.persist(newReceipt);

        verify(activityDao, times(1)).persist(any(Activity.class));
        Activity capturedActivity = activityCaptor.getValue();
        assertThat(capturedActivity).isNotNull();
        assertThat(capturedActivity.getModuleCode()).isEqualTo("Receipt");
    }

    @Test
    void shouldVerifyActivityLoggingOnUpdate() {
        when(receiptDao.update(testReceipt)).thenReturn(testReceipt);

        ArgumentCaptor<Activity> activityCaptor = ArgumentCaptor.forClass(Activity.class);
        doNothing().when(activityDao).persist(activityCaptor.capture());

        receiptService.update(testReceipt);

        verify(activityDao, times(1)).persist(any(Activity.class));
        Activity capturedActivity = activityCaptor.getValue();
        assertThat(capturedActivity).isNotNull();
        assertThat(capturedActivity.getModuleCode()).isEqualTo("Receipt");
    }

    @Test
    void shouldVerifyActivityLoggingOnDelete() {
        doNothing().when(receiptDao).delete(testReceipt);

        ArgumentCaptor<Activity> activityCaptor = ArgumentCaptor.forClass(Activity.class);
        doNothing().when(activityDao).persist(activityCaptor.capture());

        receiptService.delete(testReceipt);

        verify(activityDao, times(1)).persist(any(Activity.class));
        Activity capturedActivity = activityCaptor.getValue();
        assertThat(capturedActivity).isNotNull();
        assertThat(capturedActivity.getModuleCode()).isEqualTo("Receipt");
    }
}
