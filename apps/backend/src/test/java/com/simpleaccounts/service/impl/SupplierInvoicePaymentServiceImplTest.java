package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.SupplierInvoicePaymentDao;
import com.simpleaccounts.entity.SupplierInvoicePayment;
import com.simpleaccounts.exceptions.ServiceException;
import java.math.BigDecimal;
import java.util.ArrayList;
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

@ExtendWith(MockitoExtension.class)
class SupplierInvoicePaymentServiceImplTest {

    @Mock
    private SupplierInvoicePaymentDao supplierInvoicePaymentDao;

    @InjectMocks
    private SupplierInvoicePaymentServiceImpl supplierInvoicePaymentService;

    private SupplierInvoicePayment testPayment1;
    private SupplierInvoicePayment testPayment2;
    private SupplierInvoicePayment testPayment3;

    @BeforeEach
    void setUp() {
        testPayment1 = new SupplierInvoicePayment();
        testPayment1.setSupplierInvoicePaymentId(1);
        testPayment1.setInvoiceId(100);
        testPayment1.setPaymentId(200);
        testPayment1.setPaymentNo(1);
        testPayment1.setAmount(BigDecimal.valueOf(1000.00));

        testPayment2 = new SupplierInvoicePayment();
        testPayment2.setSupplierInvoicePaymentId(2);
        testPayment2.setInvoiceId(100);
        testPayment2.setPaymentId(201);
        testPayment2.setPaymentNo(2);
        testPayment2.setAmount(BigDecimal.valueOf(500.00));

        testPayment3 = new SupplierInvoicePayment();
        testPayment3.setSupplierInvoicePaymentId(3);
        testPayment3.setInvoiceId(100);
        testPayment3.setPaymentId(202);
        testPayment3.setPaymentNo(3);
        testPayment3.setAmount(BigDecimal.valueOf(250.00));
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnSupplierInvoicePaymentDaoWhenGetDaoCalled() {
        assertThat(supplierInvoicePaymentService.getDao()).isEqualTo(supplierInvoicePaymentDao);
    }

    @Test
    void shouldReturnNonNullDaoInstance() {
        assertThat(supplierInvoicePaymentService.getDao()).isNotNull();
    }

    // ========== findNextPaymentNoForInvoice Tests ==========

    @Test
    void shouldReturnOneWhenNoPaymentsExist() {
        Integer invoiceId = 100;
        when(supplierInvoicePaymentDao.findAllForInvoice(invoiceId)).thenReturn(Collections.emptyList());

        Integer result = supplierInvoicePaymentService.findNextPaymentNoForInvoice(invoiceId);

        assertThat(result).isEqualTo(1);
        verify(supplierInvoicePaymentDao, times(1)).findAllForInvoice(invoiceId);
    }

    @Test
    void shouldReturnOneWhenPaymentListIsNull() {
        Integer invoiceId = 100;
        when(supplierInvoicePaymentDao.findAllForInvoice(invoiceId)).thenReturn(null);

        Integer result = supplierInvoicePaymentService.findNextPaymentNoForInvoice(invoiceId);

        assertThat(result).isEqualTo(1);
        verify(supplierInvoicePaymentDao, times(1)).findAllForInvoice(invoiceId);
    }

    @Test
    void shouldReturnTwoWhenOnePaymentExists() {
        Integer invoiceId = 100;
        List<SupplierInvoicePayment> payments = Collections.singletonList(testPayment1);
        when(supplierInvoicePaymentDao.findAllForInvoice(invoiceId)).thenReturn(payments);

        Integer result = supplierInvoicePaymentService.findNextPaymentNoForInvoice(invoiceId);

        assertThat(result).isEqualTo(2);
        verify(supplierInvoicePaymentDao, times(1)).findAllForInvoice(invoiceId);
    }

    @Test
    void shouldReturnThreeWhenTwoPaymentsExist() {
        Integer invoiceId = 100;
        List<SupplierInvoicePayment> payments = Arrays.asList(testPayment1, testPayment2);
        when(supplierInvoicePaymentDao.findAllForInvoice(invoiceId)).thenReturn(payments);

        Integer result = supplierInvoicePaymentService.findNextPaymentNoForInvoice(invoiceId);

        assertThat(result).isEqualTo(3);
        verify(supplierInvoicePaymentDao, times(1)).findAllForInvoice(invoiceId);
    }

    @Test
    void shouldReturnFourWhenThreePaymentsExist() {
        Integer invoiceId = 100;
        List<SupplierInvoicePayment> payments = Arrays.asList(testPayment1, testPayment2, testPayment3);
        when(supplierInvoicePaymentDao.findAllForInvoice(invoiceId)).thenReturn(payments);

        Integer result = supplierInvoicePaymentService.findNextPaymentNoForInvoice(invoiceId);

        assertThat(result).isEqualTo(4);
        verify(supplierInvoicePaymentDao, times(1)).findAllForInvoice(invoiceId);
    }

    @Test
    void shouldHandleNullInvoiceId() {
        when(supplierInvoicePaymentDao.findAllForInvoice(null)).thenReturn(null);

        Integer result = supplierInvoicePaymentService.findNextPaymentNoForInvoice(null);

        assertThat(result).isEqualTo(1);
        verify(supplierInvoicePaymentDao, times(1)).findAllForInvoice(null);
    }

    @Test
    void shouldHandleZeroInvoiceId() {
        Integer invoiceId = 0;
        when(supplierInvoicePaymentDao.findAllForInvoice(invoiceId)).thenReturn(Collections.emptyList());

        Integer result = supplierInvoicePaymentService.findNextPaymentNoForInvoice(invoiceId);

        assertThat(result).isEqualTo(1);
        verify(supplierInvoicePaymentDao, times(1)).findAllForInvoice(invoiceId);
    }

    @Test
    void shouldHandleNegativeInvoiceId() {
        Integer invoiceId = -1;
        when(supplierInvoicePaymentDao.findAllForInvoice(invoiceId)).thenReturn(Collections.emptyList());

        Integer result = supplierInvoicePaymentService.findNextPaymentNoForInvoice(invoiceId);

        assertThat(result).isEqualTo(1);
        verify(supplierInvoicePaymentDao, times(1)).findAllForInvoice(invoiceId);
    }

    @Test
    void shouldHandleLargeNumberOfPayments() {
        Integer invoiceId = 100;
        List<SupplierInvoicePayment> payments = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            SupplierInvoicePayment payment = new SupplierInvoicePayment();
            payment.setSupplierInvoicePaymentId(i);
            payment.setInvoiceId(invoiceId);
            payment.setPaymentNo(i);
            payments.add(payment);
        }
        when(supplierInvoicePaymentDao.findAllForInvoice(invoiceId)).thenReturn(payments);

        Integer result = supplierInvoicePaymentService.findNextPaymentNoForInvoice(invoiceId);

        assertThat(result).isEqualTo(51);
        verify(supplierInvoicePaymentDao, times(1)).findAllForInvoice(invoiceId);
    }

    @Test
    void shouldCalculateNextPaymentNoCorrectly() {
        Integer invoiceId = 500;
        List<SupplierInvoicePayment> payments = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            SupplierInvoicePayment payment = new SupplierInvoicePayment();
            payment.setSupplierInvoicePaymentId(i);
            payments.add(payment);
        }
        when(supplierInvoicePaymentDao.findAllForInvoice(invoiceId)).thenReturn(payments);

        Integer result = supplierInvoicePaymentService.findNextPaymentNoForInvoice(invoiceId);

        assertThat(result).isEqualTo(11);
        verify(supplierInvoicePaymentDao, times(1)).findAllForInvoice(invoiceId);
    }

    @Test
    void shouldHandleMultipleCallsForSameInvoice() {
        Integer invoiceId = 100;
        when(supplierInvoicePaymentDao.findAllForInvoice(invoiceId))
                .thenReturn(Collections.singletonList(testPayment1))
                .thenReturn(Arrays.asList(testPayment1, testPayment2))
                .thenReturn(Arrays.asList(testPayment1, testPayment2, testPayment3));

        Integer result1 = supplierInvoicePaymentService.findNextPaymentNoForInvoice(invoiceId);
        Integer result2 = supplierInvoicePaymentService.findNextPaymentNoForInvoice(invoiceId);
        Integer result3 = supplierInvoicePaymentService.findNextPaymentNoForInvoice(invoiceId);

        assertThat(result1).isEqualTo(2);
        assertThat(result2).isEqualTo(3);
        assertThat(result3).isEqualTo(4);
        verify(supplierInvoicePaymentDao, times(3)).findAllForInvoice(invoiceId);
    }

    // ========== findForPayment Tests ==========

    @Test
    void shouldReturnPaymentsWhenPaymentsExist() {
        Integer paymentId = 200;
        List<SupplierInvoicePayment> expectedPayments = Arrays.asList(testPayment1);
        when(supplierInvoicePaymentDao.findForPayment(paymentId)).thenReturn(expectedPayments);

        List<SupplierInvoicePayment> result = supplierInvoicePaymentService.findForPayment(paymentId);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testPayment1);
        verify(supplierInvoicePaymentDao, times(1)).findForPayment(paymentId);
    }

    @Test
    void shouldReturnNullWhenNoPaymentsExist() {
        Integer paymentId = 999;
        when(supplierInvoicePaymentDao.findForPayment(paymentId)).thenReturn(Collections.emptyList());

        List<SupplierInvoicePayment> result = supplierInvoicePaymentService.findForPayment(paymentId);

        assertThat(result).isNull();
        verify(supplierInvoicePaymentDao, times(1)).findForPayment(paymentId);
    }

    @Test
    void shouldReturnNullWhenPaymentListIsNull() {
        Integer paymentId = 200;
        when(supplierInvoicePaymentDao.findForPayment(paymentId)).thenReturn(null);

        List<SupplierInvoicePayment> result = supplierInvoicePaymentService.findForPayment(paymentId);

        assertThat(result).isNull();
        verify(supplierInvoicePaymentDao, times(1)).findForPayment(paymentId);
    }

    @Test
    void shouldReturnMultiplePaymentsWhenMultipleExist() {
        Integer paymentId = 200;
        List<SupplierInvoicePayment> expectedPayments = Arrays.asList(testPayment1, testPayment2, testPayment3);
        when(supplierInvoicePaymentDao.findForPayment(paymentId)).thenReturn(expectedPayments);

        List<SupplierInvoicePayment> result = supplierInvoicePaymentService.findForPayment(paymentId);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testPayment1, testPayment2, testPayment3);
        verify(supplierInvoicePaymentDao, times(1)).findForPayment(paymentId);
    }

    @Test
    void shouldHandleNullPaymentId() {
        when(supplierInvoicePaymentDao.findForPayment(null)).thenReturn(null);

        List<SupplierInvoicePayment> result = supplierInvoicePaymentService.findForPayment(null);

        assertThat(result).isNull();
        verify(supplierInvoicePaymentDao, times(1)).findForPayment(null);
    }

    @Test
    void shouldHandleZeroPaymentId() {
        Integer paymentId = 0;
        when(supplierInvoicePaymentDao.findForPayment(paymentId)).thenReturn(Collections.emptyList());

        List<SupplierInvoicePayment> result = supplierInvoicePaymentService.findForPayment(paymentId);

        assertThat(result).isNull();
        verify(supplierInvoicePaymentDao, times(1)).findForPayment(paymentId);
    }

    @Test
    void shouldHandleNegativePaymentId() {
        Integer paymentId = -1;
        when(supplierInvoicePaymentDao.findForPayment(paymentId)).thenReturn(Collections.emptyList());

        List<SupplierInvoicePayment> result = supplierInvoicePaymentService.findForPayment(paymentId);

        assertThat(result).isNull();
        verify(supplierInvoicePaymentDao, times(1)).findForPayment(paymentId);
    }

    @Test
    void shouldReturnPaymentsWithCompleteData() {
        Integer paymentId = 200;
        SupplierInvoicePayment detailedPayment = new SupplierInvoicePayment();
        detailedPayment.setSupplierInvoicePaymentId(10);
        detailedPayment.setInvoiceId(100);
        detailedPayment.setPaymentId(200);
        detailedPayment.setPaymentNo(5);
        detailedPayment.setAmount(BigDecimal.valueOf(2500.50));

        List<SupplierInvoicePayment> expectedPayments = Collections.singletonList(detailedPayment);
        when(supplierInvoicePaymentDao.findForPayment(paymentId)).thenReturn(expectedPayments);

        List<SupplierInvoicePayment> result = supplierInvoicePaymentService.findForPayment(paymentId);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSupplierInvoicePaymentId()).isEqualTo(10);
        assertThat(result.get(0).getAmount()).isEqualByComparingTo(BigDecimal.valueOf(2500.50));
        verify(supplierInvoicePaymentDao, times(1)).findForPayment(paymentId);
    }

    @Test
    void shouldHandleLargeListOfPayments() {
        Integer paymentId = 200;
        List<SupplierInvoicePayment> largeList = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            SupplierInvoicePayment payment = new SupplierInvoicePayment();
            payment.setSupplierInvoicePaymentId(i);
            payment.setPaymentId(paymentId);
            payment.setAmount(BigDecimal.valueOf(i * 10));
            largeList.add(payment);
        }
        when(supplierInvoicePaymentDao.findForPayment(paymentId)).thenReturn(largeList);

        List<SupplierInvoicePayment> result = supplierInvoicePaymentService.findForPayment(paymentId);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(100);
        assertThat(result.get(0).getSupplierInvoicePaymentId()).isEqualTo(1);
        assertThat(result.get(99).getSupplierInvoicePaymentId()).isEqualTo(100);
        verify(supplierInvoicePaymentDao, times(1)).findForPayment(paymentId);
    }

    @Test
    void shouldHandleMultipleCallsForDifferentPayments() {
        when(supplierInvoicePaymentDao.findForPayment(200)).thenReturn(Collections.singletonList(testPayment1));
        when(supplierInvoicePaymentDao.findForPayment(201)).thenReturn(Collections.singletonList(testPayment2));
        when(supplierInvoicePaymentDao.findForPayment(202)).thenReturn(Collections.singletonList(testPayment3));

        List<SupplierInvoicePayment> result1 = supplierInvoicePaymentService.findForPayment(200);
        List<SupplierInvoicePayment> result2 = supplierInvoicePaymentService.findForPayment(201);
        List<SupplierInvoicePayment> result3 = supplierInvoicePaymentService.findForPayment(202);

        assertThat(result1).hasSize(1);
        assertThat(result2).hasSize(1);
        assertThat(result3).hasSize(1);
        verify(supplierInvoicePaymentDao, times(1)).findForPayment(200);
        verify(supplierInvoicePaymentDao, times(1)).findForPayment(201);
        verify(supplierInvoicePaymentDao, times(1)).findForPayment(202);
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindSupplierInvoicePaymentByPrimaryKey() {
        when(supplierInvoicePaymentDao.findByPK(1)).thenReturn(testPayment1);

        SupplierInvoicePayment result = supplierInvoicePaymentService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testPayment1);
        assertThat(result.getSupplierInvoicePaymentId()).isEqualTo(1);
        verify(supplierInvoicePaymentDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenPaymentNotFoundByPK() {
        when(supplierInvoicePaymentDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> supplierInvoicePaymentService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(supplierInvoicePaymentDao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewSupplierInvoicePayment() {
        supplierInvoicePaymentService.persist(testPayment1);

        verify(supplierInvoicePaymentDao, times(1)).persist(testPayment1);
    }

    @Test
    void shouldPersistMultipleSupplierInvoicePayments() {
        supplierInvoicePaymentService.persist(testPayment1);
        supplierInvoicePaymentService.persist(testPayment2);
        supplierInvoicePaymentService.persist(testPayment3);

        verify(supplierInvoicePaymentDao, times(1)).persist(testPayment1);
        verify(supplierInvoicePaymentDao, times(1)).persist(testPayment2);
        verify(supplierInvoicePaymentDao, times(1)).persist(testPayment3);
    }

    @Test
    void shouldUpdateExistingSupplierInvoicePayment() {
        when(supplierInvoicePaymentDao.update(testPayment1)).thenReturn(testPayment1);

        SupplierInvoicePayment result = supplierInvoicePaymentService.update(testPayment1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testPayment1);
        verify(supplierInvoicePaymentDao, times(1)).update(testPayment1);
    }

    @Test
    void shouldUpdatePaymentAndReturnUpdatedEntity() {
        testPayment1.setAmount(BigDecimal.valueOf(1500.00));
        testPayment1.setPaymentNo(10);
        when(supplierInvoicePaymentDao.update(testPayment1)).thenReturn(testPayment1);

        SupplierInvoicePayment result = supplierInvoicePaymentService.update(testPayment1);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(1500.00));
        assertThat(result.getPaymentNo()).isEqualTo(10);
        verify(supplierInvoicePaymentDao, times(1)).update(testPayment1);
    }

    @Test
    void shouldDeleteSupplierInvoicePayment() {
        supplierInvoicePaymentService.delete(testPayment1);

        verify(supplierInvoicePaymentDao, times(1)).delete(testPayment1);
    }

    @Test
    void shouldDeleteMultipleSupplierInvoicePayments() {
        supplierInvoicePaymentService.delete(testPayment1);
        supplierInvoicePaymentService.delete(testPayment2);

        verify(supplierInvoicePaymentDao, times(1)).delete(testPayment1);
        verify(supplierInvoicePaymentDao, times(1)).delete(testPayment2);
    }

    @Test
    void shouldFindSupplierInvoicePaymentsByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("invoiceId", 100);

        List<SupplierInvoicePayment> expectedList = Arrays.asList(testPayment1, testPayment2, testPayment3);
        when(supplierInvoicePaymentDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<SupplierInvoicePayment> result = supplierInvoicePaymentService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testPayment1, testPayment2, testPayment3);
        verify(supplierInvoicePaymentDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("invoiceId", 999);

        when(supplierInvoicePaymentDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<SupplierInvoicePayment> result = supplierInvoicePaymentService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(supplierInvoicePaymentDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<SupplierInvoicePayment> result = supplierInvoicePaymentService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(supplierInvoicePaymentDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<SupplierInvoicePayment> result = supplierInvoicePaymentService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(supplierInvoicePaymentDao, never()).findByAttributes(any());
    }

    @Test
    void shouldFindPaymentsByMultipleAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("invoiceId", 100);
        attributes.put("paymentId", 200);

        List<SupplierInvoicePayment> expectedList = Collections.singletonList(testPayment1);
        when(supplierInvoicePaymentDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<SupplierInvoicePayment> result = supplierInvoicePaymentService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getInvoiceId()).isEqualTo(100);
        assertThat(result.get(0).getPaymentId()).isEqualTo(200);
        verify(supplierInvoicePaymentDao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandlePaymentWithMinimalData() {
        SupplierInvoicePayment minimalPayment = new SupplierInvoicePayment();
        minimalPayment.setSupplierInvoicePaymentId(99);

        when(supplierInvoicePaymentDao.findByPK(99)).thenReturn(minimalPayment);

        SupplierInvoicePayment result = supplierInvoicePaymentService.findByPK(99);

        assertThat(result).isNotNull();
        assertThat(result.getSupplierInvoicePaymentId()).isEqualTo(99);
        assertThat(result.getAmount()).isNull();
        verify(supplierInvoicePaymentDao, times(1)).findByPK(99);
    }

    @Test
    void shouldHandlePaymentWithZeroAmount() {
        SupplierInvoicePayment zeroPayment = new SupplierInvoicePayment();
        zeroPayment.setSupplierInvoicePaymentId(50);
        zeroPayment.setAmount(BigDecimal.ZERO);

        when(supplierInvoicePaymentDao.findByPK(50)).thenReturn(zeroPayment);

        SupplierInvoicePayment result = supplierInvoicePaymentService.findByPK(50);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        verify(supplierInvoicePaymentDao, times(1)).findByPK(50);
    }

    @Test
    void shouldHandlePaymentWithNegativeAmount() {
        SupplierInvoicePayment negativePayment = new SupplierInvoicePayment();
        negativePayment.setSupplierInvoicePaymentId(60);
        negativePayment.setAmount(BigDecimal.valueOf(-100.00));

        when(supplierInvoicePaymentDao.findByPK(60)).thenReturn(negativePayment);

        SupplierInvoicePayment result = supplierInvoicePaymentService.findByPK(60);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(-100.00));
        verify(supplierInvoicePaymentDao, times(1)).findByPK(60);
    }

    @Test
    void shouldHandlePaymentWithLargeAmount() {
        SupplierInvoicePayment largePayment = new SupplierInvoicePayment();
        largePayment.setSupplierInvoicePaymentId(70);
        largePayment.setAmount(BigDecimal.valueOf(999999999.99));

        when(supplierInvoicePaymentDao.findByPK(70)).thenReturn(largePayment);

        SupplierInvoicePayment result = supplierInvoicePaymentService.findByPK(70);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(999999999.99));
        verify(supplierInvoicePaymentDao, times(1)).findByPK(70);
    }

    @Test
    void shouldVerifyDaoInteractionForMultipleOperations() {
        Integer invoiceId = 100;
        Integer paymentId = 200;
        when(supplierInvoicePaymentDao.findAllForInvoice(invoiceId))
                .thenReturn(Collections.singletonList(testPayment1));
        when(supplierInvoicePaymentDao.findForPayment(paymentId))
                .thenReturn(Collections.singletonList(testPayment1));

        supplierInvoicePaymentService.findNextPaymentNoForInvoice(invoiceId);
        supplierInvoicePaymentService.findForPayment(paymentId);

        verify(supplierInvoicePaymentDao, times(1)).findAllForInvoice(invoiceId);
        verify(supplierInvoicePaymentDao, times(1)).findForPayment(paymentId);
    }

    @Test
    void shouldHandleConsecutiveCallsToDifferentMethods() {
        when(supplierInvoicePaymentDao.findAllForInvoice(100))
                .thenReturn(Arrays.asList(testPayment1));
        when(supplierInvoicePaymentDao.findForPayment(200))
                .thenReturn(Arrays.asList(testPayment1));
        when(supplierInvoicePaymentDao.findByPK(1)).thenReturn(testPayment1);

        Integer nextNo = supplierInvoicePaymentService.findNextPaymentNoForInvoice(100);
        List<SupplierInvoicePayment> payments = supplierInvoicePaymentService.findForPayment(200);
        SupplierInvoicePayment payment = supplierInvoicePaymentService.findByPK(1);

        assertThat(nextNo).isEqualTo(2);
        assertThat(payments).hasSize(1);
        assertThat(payment).isEqualTo(testPayment1);
    }
}
