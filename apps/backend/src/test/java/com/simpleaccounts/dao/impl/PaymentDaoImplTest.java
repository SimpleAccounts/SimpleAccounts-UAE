package com.simpleaccounts.dao.impl;

import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.constant.dbfilter.PaymentFilterEnum;
import com.simpleaccounts.dao.InvoiceDao;
import com.simpleaccounts.dao.JournalDao;
import com.simpleaccounts.dao.JournalLineItemDao;
import com.simpleaccounts.dao.SupplierInvoicePaymentDao;
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
class PaymentDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private DatatableSortingFilterConstant dataTableUtil;

    @Mock
    private SupplierInvoicePaymentDao supplierInvoicePaymentDao;

    @Mock
    private JournalLineItemDao journalLineItemDao;

    @Mock
    private JournalDao journalDao;

    @Mock
    private InvoiceDao invoiceDao;

    @InjectMocks
    private PaymentDaoImpl paymentDao;

    private Payment testPayment;
    private Invoice testInvoice;
    private SupplierInvoicePayment testSupplierInvoicePayment;
    private JournalLineItem testJournalLineItem;
    private Journal testJournal;

    @BeforeEach
    void setUp() {
        testPayment = new Payment();
        testPayment.setId(1);
        testPayment.setInvoiceAmount(BigDecimal.valueOf(500));
        testPayment.setDeleteFlag(false);

        testInvoice = new Invoice();
        testInvoice.setId(1);
        testInvoice.setTotalAmount(BigDecimal.valueOf(1000));
        testInvoice.setStatus(CommonStatusEnum.PARTIALLY_PAID.getValue());
        testInvoice.setDeleteFlag(false);

        testSupplierInvoicePayment = new SupplierInvoicePayment();
        testSupplierInvoicePayment.setId(1);
        testSupplierInvoicePayment.setSupplierInvoice(testInvoice);
        testSupplierInvoicePayment.setPayment(testPayment);
        testSupplierInvoicePayment.setDeleteFlag(false);

        testJournal = new Journal();
        testJournal.setId(1);

        testJournalLineItem = new JournalLineItem();
        testJournalLineItem.setId(1);
        testJournalLineItem.setReferenceType(PostingReferenceTypeEnum.PAYMENT);
        testJournalLineItem.setReferenceId(1);
        testJournalLineItem.setJournal(testJournal);
        testJournalLineItem.setDeleteFlag(false);
    }

    @Test
    void testGetPayments_Success() {
        // Arrange
        Map<PaymentFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(PaymentFilterEnum.PAYMENT_ID, 1);

        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("paymentDate");
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.PAYMENT)))
                .thenReturn("p.paymentDate");

        // Act
        PaginationResponseModel result = paymentDao.getPayments(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        verify(dataTableUtil).getColName("paymentDate", DatatableSortingFilterConstant.PAYMENT);
    }

    @Test
    void testGetPayments_EmptyFilterMap() {
        // Arrange
        Map<PaymentFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("id");

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.PAYMENT)))
                .thenReturn("p.id");

        // Act
        PaginationResponseModel result = paymentDao.getPayments(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        verify(dataTableUtil).getColName("id", DatatableSortingFilterConstant.PAYMENT);
    }

    @Test
    void testGetPayments_WithMultipleFilters() {
        // Arrange
        Map<PaymentFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(PaymentFilterEnum.PAYMENT_ID, 1);
        filterMap.put(PaymentFilterEnum.USER_ID, 10);

        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("amount");

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.PAYMENT)))
                .thenReturn("p.amount");

        // Act
        PaginationResponseModel result = paymentDao.getPayments(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    void testDeleteByIds_Success() {
        // Arrange
        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Payment.class, 1)).thenReturn(testPayment);
        when(supplierInvoicePaymentDao.findForPayment(1))
                .thenReturn(Arrays.asList(testSupplierInvoicePayment));

        Map<String, Object> param = new HashMap<>();
        param.put("referenceType", PostingReferenceTypeEnum.PAYMENT);
        param.put("referenceId", 1);
        param.put("deleteFlag", false);
        when(journalLineItemDao.findByAttributes(param))
                .thenReturn(Arrays.asList(testJournalLineItem));

        // Act
        paymentDao.deleteByIds(ids);

        // Assert
        assertThat(testPayment.getDeleteFlag()).isTrue();
        verify(supplierInvoicePaymentDao).findForPayment(1);
        verify(invoiceDao).update(testInvoice);
        verify(supplierInvoicePaymentDao).update(testSupplierInvoicePayment);
        verify(journalDao).deleteByIds(anyList());
    }

    @Test
    void testDeleteByIds_MultipleIds() {
        // Arrange
        Payment payment2 = new Payment();
        payment2.setId(2);
        payment2.setInvoiceAmount(BigDecimal.valueOf(300));
        payment2.setDeleteFlag(false);

        List<Integer> ids = Arrays.asList(1, 2);
        when(entityManager.find(Payment.class, 1)).thenReturn(testPayment);
        when(entityManager.find(Payment.class, 2)).thenReturn(payment2);
        when(supplierInvoicePaymentDao.findForPayment(anyInt())).thenReturn(Collections.emptyList());

        Map<String, Object> param = new HashMap<>();
        param.put("referenceType", PostingReferenceTypeEnum.PAYMENT);
        param.put("deleteFlag", false);
        when(journalLineItemDao.findByAttributes(any())).thenReturn(Collections.emptyList());

        // Act
        paymentDao.deleteByIds(ids);

        // Assert
        assertThat(testPayment.getDeleteFlag()).isTrue();
        assertThat(payment2.getDeleteFlag()).isTrue();
        verify(supplierInvoicePaymentDao, times(2)).findForPayment(anyInt());
    }

    @Test
    void testDeleteByIds_EmptyList() {
        // Arrange
        List<Integer> ids = Collections.emptyList();

        // Act
        paymentDao.deleteByIds(ids);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(supplierInvoicePaymentDao, never()).findForPayment(anyInt());
    }

    @Test
    void testDeleteByIds_NullList() {
        // Arrange
        List<Integer> ids = null;

        // Act
        paymentDao.deleteByIds(ids);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(supplierInvoicePaymentDao, never()).findForPayment(anyInt());
    }

    @Test
    void testDeleteByIds_WithJournalLineItems() {
        // Arrange
        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Payment.class, 1)).thenReturn(testPayment);
        when(supplierInvoicePaymentDao.findForPayment(1)).thenReturn(Collections.emptyList());

        Map<String, Object> param = new HashMap<>();
        param.put("referenceType", PostingReferenceTypeEnum.PAYMENT);
        param.put("referenceId", 1);
        param.put("deleteFlag", false);
        when(journalLineItemDao.findByAttributes(param))
                .thenReturn(Arrays.asList(testJournalLineItem));

        // Act
        paymentDao.deleteByIds(ids);

        // Assert
        assertThat(testPayment.getDeleteFlag()).isTrue();
        verify(journalDao).deleteByIds(Arrays.asList(1));
    }

    @Test
    void testDeleteByIds_NoJournalLineItems() {
        // Arrange
        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Payment.class, 1)).thenReturn(testPayment);
        when(supplierInvoicePaymentDao.findForPayment(1)).thenReturn(Collections.emptyList());

        Map<String, Object> param = new HashMap<>();
        param.put("referenceType", PostingReferenceTypeEnum.PAYMENT);
        param.put("referenceId", 1);
        param.put("deleteFlag", false);
        when(journalLineItemDao.findByAttributes(param)).thenReturn(Collections.emptyList());

        // Act
        paymentDao.deleteByIds(ids);

        // Assert
        assertThat(testPayment.getDeleteFlag()).isTrue();
        verify(journalDao, never()).deleteByIds(anyList());
    }

    @Test
    void testDeleteByIds_InvoiceStatusChangedToPost() {
        // Arrange
        testInvoice.setTotalAmount(BigDecimal.valueOf(500));
        testPayment.setInvoiceAmount(BigDecimal.valueOf(500));

        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Payment.class, 1)).thenReturn(testPayment);
        when(supplierInvoicePaymentDao.findForPayment(1))
                .thenReturn(Arrays.asList(testSupplierInvoicePayment));

        Map<String, Object> param = new HashMap<>();
        param.put("referenceType", PostingReferenceTypeEnum.PAYMENT);
        param.put("referenceId", 1);
        param.put("deleteFlag", false);
        when(journalLineItemDao.findByAttributes(param)).thenReturn(Collections.emptyList());

        // Act
        paymentDao.deleteByIds(ids);

        // Assert
        assertThat(testInvoice.getStatus()).isEqualTo(CommonStatusEnum.POST.getValue());
        verify(invoiceDao).update(testInvoice);
    }

    @Test
    void testDeleteByIds_InvoiceStatusChangedToPartiallyPaid() {
        // Arrange
        testInvoice.setTotalAmount(BigDecimal.valueOf(1000));
        testPayment.setInvoiceAmount(BigDecimal.valueOf(300));

        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Payment.class, 1)).thenReturn(testPayment);
        when(supplierInvoicePaymentDao.findForPayment(1))
                .thenReturn(Arrays.asList(testSupplierInvoicePayment));

        Map<String, Object> param = new HashMap<>();
        param.put("referenceType", PostingReferenceTypeEnum.PAYMENT);
        param.put("referenceId", 1);
        param.put("deleteFlag", false);
        when(journalLineItemDao.findByAttributes(param)).thenReturn(Collections.emptyList());

        // Act
        paymentDao.deleteByIds(ids);

        // Assert
        assertThat(testInvoice.getStatus()).isEqualTo(CommonStatusEnum.PARTIALLY_PAID.getValue());
        verify(invoiceDao).update(testInvoice);
    }

    @Test
    void testDeleteByIds_MultipleSupplierInvoicePayments() {
        // Arrange
        SupplierInvoicePayment payment2 = new SupplierInvoicePayment();
        payment2.setId(2);
        payment2.setSupplierInvoice(testInvoice);
        payment2.setPayment(testPayment);

        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Payment.class, 1)).thenReturn(testPayment);
        when(supplierInvoicePaymentDao.findForPayment(1))
                .thenReturn(Arrays.asList(testSupplierInvoicePayment, payment2));

        Map<String, Object> param = new HashMap<>();
        param.put("referenceType", PostingReferenceTypeEnum.PAYMENT);
        param.put("referenceId", 1);
        param.put("deleteFlag", false);
        when(journalLineItemDao.findByAttributes(param)).thenReturn(Collections.emptyList());

        // Act
        paymentDao.deleteByIds(ids);

        // Assert
        verify(supplierInvoicePaymentDao, times(2)).update(any(SupplierInvoicePayment.class));
        verify(invoiceDao, times(2)).update(any(Invoice.class));
    }

    @Test
    void testDeleteByIds_CompleteFlow() {
        // Arrange
        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Payment.class, 1)).thenReturn(testPayment);
        when(supplierInvoicePaymentDao.findForPayment(1))
                .thenReturn(Arrays.asList(testSupplierInvoicePayment));

        Map<String, Object> param = new HashMap<>();
        param.put("referenceType", PostingReferenceTypeEnum.PAYMENT);
        param.put("referenceId", 1);
        param.put("deleteFlag", false);
        when(journalLineItemDao.findByAttributes(param))
                .thenReturn(Arrays.asList(testJournalLineItem));

        // Act
        paymentDao.deleteByIds(ids);

        // Assert
        assertThat(testPayment.getDeleteFlag()).isTrue();
        assertThat(testSupplierInvoicePayment.getDeleteFlag()).isTrue();
        verify(supplierInvoicePaymentDao).findForPayment(1);
        verify(invoiceDao).update(testInvoice);
        verify(supplierInvoicePaymentDao).update(testSupplierInvoicePayment);
        verify(journalLineItemDao).findByAttributes(any());
        verify(journalDao).deleteByIds(anyList());
    }

    @Test
    void testDeleteByIds_NullSupplierInvoicePaymentList() {
        // Arrange
        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Payment.class, 1)).thenReturn(testPayment);
        when(supplierInvoicePaymentDao.findForPayment(1)).thenReturn(null);

        Map<String, Object> param = new HashMap<>();
        param.put("referenceType", PostingReferenceTypeEnum.PAYMENT);
        param.put("referenceId", 1);
        param.put("deleteFlag", false);
        when(journalLineItemDao.findByAttributes(param)).thenReturn(Collections.emptyList());

        // Act
        paymentDao.deleteByIds(ids);

        // Assert
        assertThat(testPayment.getDeleteFlag()).isTrue();
        verify(invoiceDao, never()).update(any());
    }

    @Test
    void testDeleteByIds_NullJournalLineItemList() {
        // Arrange
        List<Integer> ids = Arrays.asList(1);
        when(entityManager.find(Payment.class, 1)).thenReturn(testPayment);
        when(supplierInvoicePaymentDao.findForPayment(1)).thenReturn(Collections.emptyList());

        Map<String, Object> param = new HashMap<>();
        param.put("referenceType", PostingReferenceTypeEnum.PAYMENT);
        param.put("referenceId", 1);
        param.put("deleteFlag", false);
        when(journalLineItemDao.findByAttributes(param)).thenReturn(null);

        // Act
        paymentDao.deleteByIds(ids);

        // Assert
        assertThat(testPayment.getDeleteFlag()).isTrue();
        verify(journalDao, never()).deleteByIds(anyList());
    }

    @Test
    void testGetPayments_DifferentSortingColumns() {
        // Arrange
        Map<PaymentFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("contactName");

        when(dataTableUtil.getColName("contactName", DatatableSortingFilterConstant.PAYMENT))
                .thenReturn("c.name");

        // Act
        PaginationResponseModel result = paymentDao.getPayments(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        verify(dataTableUtil).getColName("contactName", DatatableSortingFilterConstant.PAYMENT);
    }
}
