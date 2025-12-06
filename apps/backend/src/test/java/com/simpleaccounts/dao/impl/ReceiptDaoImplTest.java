package com.simpleaccounts.dao.impl;

import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.constant.dbfilter.ReceiptFilterEnum;
import com.simpleaccounts.dao.CustomerInvoiceReceiptDao;
import com.simpleaccounts.dao.InvoiceDao;
import com.simpleaccounts.dao.JournalDao;
import com.simpleaccounts.dao.JournalLineItemDao;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.persistence.EntityManager;
import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReceiptDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private DatatableSortingFilterConstant dataTableUtil;

    @Mock
    private CustomerInvoiceReceiptDao customerInvoiceReceiptDao;

    @Mock
    private JournalLineItemDao journalLineItemDao;

    @Mock
    private JournalDao journalDao;

    @Mock
    private InvoiceDao invoiceDao;

    @InjectMocks
    private ReceiptDaoImpl receiptDao;

    private Receipt testReceipt;
    private Invoice testInvoice;
    private CustomerInvoiceReceipt testCustomerInvoiceReceipt;
    private JournalLineItem testJournalLineItem;
    private Journal testJournal;

    @BeforeEach
    void setUp() {
        testReceipt = new Receipt();
        testReceipt.setId(1);
        testReceipt.setAmount(BigDecimal.valueOf(500));
        testReceipt.setDeleteFlag(false);

        testInvoice = new Invoice();
        testInvoice.setId(1);
        testInvoice.setTotalAmount(BigDecimal.valueOf(1000));
        testInvoice.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
        testInvoice.setDeleteFlag(false);

        testCustomerInvoiceReceipt = new CustomerInvoiceReceipt();
        testCustomerInvoiceReceipt.setId(1);
        testCustomerInvoiceReceipt.setCustomerInvoice(testInvoice);
        testCustomerInvoiceReceipt.setReceipt(testReceipt);
        testCustomerInvoiceReceipt.setDeleteFlag(false);

        testJournal = new Journal();
        testJournal.setId(1);

        testJournalLineItem = new JournalLineItem();
        testJournalLineItem.setId(1);
        testJournalLineItem.setReferenceType(PostingReferenceTypeEnum.RECEIPT);
        testJournalLineItem.setReferenceId(1);
        testJournalLineItem.setJournal(testJournal);
        testJournalLineItem.setDeleteFlag(false);
    }

    @Test
    void testGetProductList_Success() {
        // Arrange
        Map<ReceiptFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(ReceiptFilterEnum.RECEIPT_ID, 1);

        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("receiptDate");
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.RECEIPT)))
                .thenReturn("r.receiptDate");

        // Act
        PaginationResponseModel result = receiptDao.getProductList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        verify(dataTableUtil).getColName("receiptDate", DatatableSortingFilterConstant.RECEIPT);
    }

    @Test
    void testGetProductList_EmptyFilterMap() {
        // Arrange
        Map<ReceiptFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("id");

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.RECEIPT)))
                .thenReturn("r.id");

        // Act
        PaginationResponseModel result = receiptDao.getProductList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        verify(dataTableUtil).getColName("id", DatatableSortingFilterConstant.RECEIPT);
    }

    @Test
    void testGetProductList_WithMultipleFilters() {
        // Arrange
        Map<ReceiptFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(ReceiptFilterEnum.RECEIPT_ID, 1);
        filterMap.put(ReceiptFilterEnum.USER_ID, 10);

        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("amount");

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.RECEIPT)))
                .thenReturn("r.amount");

        // Act
        PaginationResponseModel result = receiptDao.getProductList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    void testDeleteByIds_Success() {
        // Arrange
        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Receipt.class, 1)).thenReturn(testReceipt);
        when(customerInvoiceReceiptDao.findForReceipt(1))
                .thenReturn(Arrays.asList(testCustomerInvoiceReceipt));

        Map<String, Object> param = new HashMap<>();
        param.put("referenceType", PostingReferenceTypeEnum.RECEIPT);
        param.put("referenceId", 1);
        param.put("deleteFlag", false);
        when(journalLineItemDao.findByAttributes(param))
                .thenReturn(Arrays.asList(testJournalLineItem));

        // Act
        receiptDao.deleteByIds(ids);

        // Assert
        assertThat(testReceipt.getDeleteFlag()).isTrue();
        verify(customerInvoiceReceiptDao).findForReceipt(1);
        verify(invoiceDao).update(testInvoice);
        verify(customerInvoiceReceiptDao).update(testCustomerInvoiceReceipt);
        verify(journalDao).deleteByIds(anyList());
    }

    @Test
    void testDeleteByIds_MultipleIds() {
        // Arrange
        Receipt receipt2 = new Receipt();
        receipt2.setId(2);
        receipt2.setAmount(BigDecimal.valueOf(300));
        receipt2.setDeleteFlag(false);

        List<Integer> ids = Arrays.asList(1, 2);
        when(entityManager.find(Receipt.class, 1)).thenReturn(testReceipt);
        when(entityManager.find(Receipt.class, 2)).thenReturn(receipt2);
        when(customerInvoiceReceiptDao.findForReceipt(anyInt())).thenReturn(Collections.emptyList());

        Map<String, Object> param = new HashMap<>();
        param.put("referenceType", PostingReferenceTypeEnum.RECEIPT);
        param.put("deleteFlag", false);
        when(journalLineItemDao.findByAttributes(any())).thenReturn(Collections.emptyList());

        // Act
        receiptDao.deleteByIds(ids);

        // Assert
        assertThat(testReceipt.getDeleteFlag()).isTrue();
        assertThat(receipt2.getDeleteFlag()).isTrue();
        verify(customerInvoiceReceiptDao, times(2)).findForReceipt(anyInt());
    }

    @Test
    void testDeleteByIds_EmptyList() {
        // Arrange
        List<Integer> ids = Collections.emptyList();

        // Act
        receiptDao.deleteByIds(ids);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(customerInvoiceReceiptDao, never()).findForReceipt(anyInt());
    }

    @Test
    void testDeleteByIds_NullList() {
        // Arrange
        List<Integer> ids = null;

        // Act
        receiptDao.deleteByIds(ids);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(customerInvoiceReceiptDao, never()).findForReceipt(anyInt());
    }

    @Test
    void testDeleteByIds_WithJournalLineItems() {
        // Arrange
        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Receipt.class, 1)).thenReturn(testReceipt);
        when(customerInvoiceReceiptDao.findForReceipt(1)).thenReturn(Collections.emptyList());

        Map<String, Object> param = new HashMap<>();
        param.put("referenceType", PostingReferenceTypeEnum.RECEIPT);
        param.put("referenceId", 1);
        param.put("deleteFlag", false);
        when(journalLineItemDao.findByAttributes(param))
                .thenReturn(Arrays.asList(testJournalLineItem));

        // Act
        receiptDao.deleteByIds(ids);

        // Assert
        assertThat(testReceipt.getDeleteFlag()).isTrue();
        verify(journalDao).deleteByIds(Arrays.asList(1));
    }

    @Test
    void testDeleteByIds_NoJournalLineItems() {
        // Arrange
        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Receipt.class, 1)).thenReturn(testReceipt);
        when(customerInvoiceReceiptDao.findForReceipt(1)).thenReturn(Collections.emptyList());

        Map<String, Object> param = new HashMap<>();
        param.put("referenceType", PostingReferenceTypeEnum.RECEIPT);
        param.put("referenceId", 1);
        param.put("deleteFlag", false);
        when(journalLineItemDao.findByAttributes(param)).thenReturn(Collections.emptyList());

        // Act
        receiptDao.deleteByIds(ids);

        // Assert
        assertThat(testReceipt.getDeleteFlag()).isTrue();
        verify(journalDao, never()).deleteByIds(anyList());
    }

    @Test
    void testDeleteByIds_InvoiceStatusChangedToPost() {
        // Arrange
        testInvoice.setTotalAmount(BigDecimal.valueOf(500));
        testReceipt.setAmount(BigDecimal.valueOf(500));

        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Receipt.class, 1)).thenReturn(testReceipt);
        when(customerInvoiceReceiptDao.findForReceipt(1))
                .thenReturn(Arrays.asList(testCustomerInvoiceReceipt));

        Map<String, Object> param = new HashMap<>();
        param.put("referenceType", PostingReferenceTypeEnum.RECEIPT);
        param.put("referenceId", 1);
        param.put("deleteFlag", false);
        when(journalLineItemDao.findByAttributes(param)).thenReturn(Collections.emptyList());

        // Act
        receiptDao.deleteByIds(ids);

        // Assert
        assertThat(testInvoice.getStatus()).isEqualTo(CommonStatusEnum.POST.getValue());
        verify(invoiceDao).update(testInvoice);
    }

    @Test
    void testDeleteByIds_InvoiceStatusChangedToPartiallyPaid() {
        // Arrange
        testInvoice.setTotalAmount(BigDecimal.valueOf(1000));
        testReceipt.setAmount(BigDecimal.valueOf(300));

        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Receipt.class, 1)).thenReturn(testReceipt);
        when(customerInvoiceReceiptDao.findForReceipt(1))
                .thenReturn(Arrays.asList(testCustomerInvoiceReceipt));

        Map<String, Object> param = new HashMap<>();
        param.put("referenceType", PostingReferenceTypeEnum.RECEIPT);
        param.put("referenceId", 1);
        param.put("deleteFlag", false);
        when(journalLineItemDao.findByAttributes(param)).thenReturn(Collections.emptyList());

        // Act
        receiptDao.deleteByIds(ids);

        // Assert
        assertThat(testInvoice.getStatus()).isEqualTo(CommonStatusEnum.PARTIALLY_PAID.getValue());
        verify(invoiceDao).update(testInvoice);
    }

    @Test
    void testDeleteByIds_MultipleCustomerInvoiceReceipts() {
        // Arrange
        CustomerInvoiceReceipt receipt2 = new CustomerInvoiceReceipt();
        receipt2.setId(2);
        receipt2.setCustomerInvoice(testInvoice);
        receipt2.setReceipt(testReceipt);

        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Receipt.class, 1)).thenReturn(testReceipt);
        when(customerInvoiceReceiptDao.findForReceipt(1))
                .thenReturn(Arrays.asList(testCustomerInvoiceReceipt, receipt2));

        Map<String, Object> param = new HashMap<>();
        param.put("referenceType", PostingReferenceTypeEnum.RECEIPT);
        param.put("referenceId", 1);
        param.put("deleteFlag", false);
        when(journalLineItemDao.findByAttributes(param)).thenReturn(Collections.emptyList());

        // Act
        receiptDao.deleteByIds(ids);

        // Assert
        verify(customerInvoiceReceiptDao, times(2)).update(any(CustomerInvoiceReceipt.class));
        verify(invoiceDao, times(2)).update(any(Invoice.class));
    }

    @Test
    void testDeleteByIds_CompleteFlow() {
        // Arrange
        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Receipt.class, 1)).thenReturn(testReceipt);
        when(customerInvoiceReceiptDao.findForReceipt(1))
                .thenReturn(Arrays.asList(testCustomerInvoiceReceipt));

        Map<String, Object> param = new HashMap<>();
        param.put("referenceType", PostingReferenceTypeEnum.RECEIPT);
        param.put("referenceId", 1);
        param.put("deleteFlag", false);
        when(journalLineItemDao.findByAttributes(param))
                .thenReturn(Arrays.asList(testJournalLineItem));

        // Act
        receiptDao.deleteByIds(ids);

        // Assert
        assertThat(testReceipt.getDeleteFlag()).isTrue();
        assertThat(testCustomerInvoiceReceipt.getDeleteFlag()).isTrue();
        verify(customerInvoiceReceiptDao).findForReceipt(1);
        verify(invoiceDao).update(testInvoice);
        verify(customerInvoiceReceiptDao).update(testCustomerInvoiceReceipt);
        verify(journalLineItemDao).findByAttributes(any());
        verify(journalDao).deleteByIds(anyList());
    }

    @Test
    void testDeleteByIds_NullCustomerInvoiceReceiptList() {
        // Arrange
        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Receipt.class, 1)).thenReturn(testReceipt);
        when(customerInvoiceReceiptDao.findForReceipt(1)).thenReturn(null);

        Map<String, Object> param = new HashMap<>();
        param.put("referenceType", PostingReferenceTypeEnum.RECEIPT);
        param.put("referenceId", 1);
        param.put("deleteFlag", false);
        when(journalLineItemDao.findByAttributes(param)).thenReturn(Collections.emptyList());

        // Act
        receiptDao.deleteByIds(ids);

        // Assert
        assertThat(testReceipt.getDeleteFlag()).isTrue();
        verify(invoiceDao, never()).update(any());
    }

    @Test
    void testDeleteByIds_NullJournalLineItemList() {
        // Arrange
        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Receipt.class, 1)).thenReturn(testReceipt);
        when(customerInvoiceReceiptDao.findForReceipt(1)).thenReturn(Collections.emptyList());

        Map<String, Object> param = new HashMap<>();
        param.put("referenceType", PostingReferenceTypeEnum.RECEIPT);
        param.put("referenceId", 1);
        param.put("deleteFlag", false);
        when(journalLineItemDao.findByAttributes(param)).thenReturn(null);

        // Act
        receiptDao.deleteByIds(ids);

        // Assert
        assertThat(testReceipt.getDeleteFlag()).isTrue();
        verify(journalDao, never()).deleteByIds(anyList());
    }

    @Test
    void testGetProductList_DifferentSortingColumns() {
        // Arrange
        Map<ReceiptFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("contactName");

        when(dataTableUtil.getColName("contactName", DatatableSortingFilterConstant.RECEIPT))
                .thenReturn("c.name");

        // Act
        PaginationResponseModel result = receiptDao.getProductList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        verify(dataTableUtil).getColName("contactName", DatatableSortingFilterConstant.RECEIPT);
    }

    @Test
    void testDeleteByIds_ThreeReceipts() {
        // Arrange
        Receipt receipt2 = new Receipt();
        receipt2.setId(2);
        receipt2.setDeleteFlag(false);

        Receipt receipt3 = new Receipt();
        receipt3.setId(3);
        receipt3.setDeleteFlag(false);

        List<Integer> ids = Arrays.asList(1, 2, 3);
        when(entityManager.find(Receipt.class, 1)).thenReturn(testReceipt);
        when(entityManager.find(Receipt.class, 2)).thenReturn(receipt2);
        when(entityManager.find(Receipt.class, 3)).thenReturn(receipt3);
        when(customerInvoiceReceiptDao.findForReceipt(anyInt())).thenReturn(Collections.emptyList());
        when(journalLineItemDao.findByAttributes(any())).thenReturn(Collections.emptyList());

        // Act
        receiptDao.deleteByIds(ids);

        // Assert
        assertThat(testReceipt.getDeleteFlag()).isTrue();
        assertThat(receipt2.getDeleteFlag()).isTrue();
        assertThat(receipt3.getDeleteFlag()).isTrue();
    }

    @Test
    void testGetProductList_WithSearchFilter() {
        // Arrange
        Map<ReceiptFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(ReceiptFilterEnum.SEARCH, "Test Receipt");

        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("receiptNumber");

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.RECEIPT)))
                .thenReturn("r.receiptNumber");

        // Act
        PaginationResponseModel result = receiptDao.getProductList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    void testDeleteByIds_RemainingAmountZero() {
        // Arrange
        testInvoice.setTotalAmount(BigDecimal.valueOf(500));
        testReceipt.setAmount(BigDecimal.valueOf(500));

        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Receipt.class, 1)).thenReturn(testReceipt);
        when(customerInvoiceReceiptDao.findForReceipt(1))
                .thenReturn(Arrays.asList(testCustomerInvoiceReceipt));
        when(journalLineItemDao.findByAttributes(any())).thenReturn(Collections.emptyList());

        // Act
        receiptDao.deleteByIds(ids);

        // Assert
        BigDecimal remainingAmount = testInvoice.getTotalAmount().subtract(testReceipt.getAmount());
        assertThat(remainingAmount.compareTo(BigDecimal.ZERO)).isEqualTo(0);
        assertThat(testInvoice.getStatus()).isEqualTo(CommonStatusEnum.POST.getValue());
    }

    @Test
    void testDeleteByIds_RemainingAmountPositive() {
        // Arrange
        testInvoice.setTotalAmount(BigDecimal.valueOf(1000));
        testReceipt.setAmount(BigDecimal.valueOf(400));

        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Receipt.class, 1)).thenReturn(testReceipt);
        when(customerInvoiceReceiptDao.findForReceipt(1))
                .thenReturn(Arrays.asList(testCustomerInvoiceReceipt));
        when(journalLineItemDao.findByAttributes(any())).thenReturn(Collections.emptyList());

        // Act
        receiptDao.deleteByIds(ids);

        // Assert
        BigDecimal remainingAmount = testInvoice.getTotalAmount().subtract(testReceipt.getAmount());
        assertThat(remainingAmount.compareTo(BigDecimal.ZERO)).isGreaterThan(0);
        assertThat(testInvoice.getStatus()).isEqualTo(CommonStatusEnum.PARTIALLY_PAID.getValue());
    }
}
