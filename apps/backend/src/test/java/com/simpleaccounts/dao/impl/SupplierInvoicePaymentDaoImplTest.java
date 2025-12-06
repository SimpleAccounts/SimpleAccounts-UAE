package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.SupplierInvoicePayment;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("SupplierInvoicePaymentDaoImpl Unit Tests")
class SupplierInvoicePaymentDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private Query query;

    @InjectMocks
    private SupplierInvoicePaymentDaoImpl supplierInvoicePaymentDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(supplierInvoicePaymentDao, "entityManager", entityManager);
    }

    @Test
    @DisplayName("Should return supplier invoice payments when invoice has payments")
    void findAllForInvoiceReturnsPaymentsWhenInvoiceHasPayments() {
        // Arrange
        Integer invoiceId = 1;
        List<SupplierInvoicePayment> expectedPayments = createSupplierInvoicePaymentList(3);

        when(entityManager.createNamedQuery("findForSupplierInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(expectedPayments);

        // Act
        List<SupplierInvoicePayment> result = supplierInvoicePaymentDao.findAllForInvoice(invoiceId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).isEqualTo(expectedPayments);
        verify(entityManager).createNamedQuery("findForSupplierInvoice");
        verify(query).setParameter("id", invoiceId);
        verify(query).getResultList();
    }

    @Test
    @DisplayName("Should return empty list when invoice has no payments")
    void findAllForInvoiceReturnsEmptyListWhenNoPayments() {
        // Arrange
        Integer invoiceId = 1;

        when(entityManager.createNamedQuery("findForSupplierInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        List<SupplierInvoicePayment> result = supplierInvoicePaymentDao.findAllForInvoice(invoiceId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use correct named query for finding invoice payments")
    void findAllForInvoiceUsesCorrectNamedQuery() {
        // Arrange
        Integer invoiceId = 1;

        when(entityManager.createNamedQuery("findForSupplierInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        supplierInvoicePaymentDao.findAllForInvoice(invoiceId);

        // Assert
        verify(entityManager).createNamedQuery("findForSupplierInvoice");
    }

    @Test
    @DisplayName("Should set correct parameter for invoice ID")
    void findAllForInvoiceSetsCorrectInvoiceIdParameter() {
        // Arrange
        Integer invoiceId = 42;

        when(entityManager.createNamedQuery("findForSupplierInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        supplierInvoicePaymentDao.findAllForInvoice(invoiceId);

        // Assert
        verify(query).setParameter("id", 42);
    }

    @Test
    @DisplayName("Should handle null invoice ID gracefully")
    void findAllForInvoiceHandlesNullInvoiceId() {
        // Arrange
        Integer invoiceId = null;

        when(entityManager.createNamedQuery("findForSupplierInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        List<SupplierInvoicePayment> result = supplierInvoicePaymentDao.findAllForInvoice(invoiceId);

        // Assert
        assertThat(result).isNotNull();
        verify(query).setParameter("id", null);
    }

    @Test
    @DisplayName("Should return single payment when invoice has one payment")
    void findAllForInvoiceReturnsSinglePayment() {
        // Arrange
        Integer invoiceId = 1;
        List<SupplierInvoicePayment> expectedPayments = createSupplierInvoicePaymentList(1);

        when(entityManager.createNamedQuery("findForSupplierInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(expectedPayments);

        // Act
        List<SupplierInvoicePayment> result = supplierInvoicePaymentDao.findAllForInvoice(invoiceId);

        // Assert
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should return multiple payments when invoice has multiple payments")
    void findAllForInvoiceReturnsMultiplePayments() {
        // Arrange
        Integer invoiceId = 1;
        List<SupplierInvoicePayment> expectedPayments = createSupplierInvoicePaymentList(10);

        when(entityManager.createNamedQuery("findForSupplierInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(expectedPayments);

        // Act
        List<SupplierInvoicePayment> result = supplierInvoicePaymentDao.findAllForInvoice(invoiceId);

        // Assert
        assertThat(result).hasSize(10);
    }

    @Test
    @DisplayName("Should return payments for payment ID when payments exist")
    void findForPaymentReturnsPaymentsWhenPaymentsExist() {
        // Arrange
        Integer paymentId = 1;
        List<SupplierInvoicePayment> expectedPayments = createSupplierInvoicePaymentList(2);

        when(entityManager.createNamedQuery("findForPayment"))
            .thenReturn(query);
        when(query.setParameter("id", paymentId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(expectedPayments);

        // Act
        List<SupplierInvoicePayment> result = supplierInvoicePaymentDao.findForPayment(paymentId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).isEqualTo(expectedPayments);
    }

    @Test
    @DisplayName("Should return empty list when no payments found for payment ID")
    void findForPaymentReturnsEmptyListWhenNoPayments() {
        // Arrange
        Integer paymentId = 1;

        when(entityManager.createNamedQuery("findForPayment"))
            .thenReturn(query);
        when(query.setParameter("id", paymentId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        List<SupplierInvoicePayment> result = supplierInvoicePaymentDao.findForPayment(paymentId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use correct named query for finding payment")
    void findForPaymentUsesCorrectNamedQuery() {
        // Arrange
        Integer paymentId = 1;

        when(entityManager.createNamedQuery("findForPayment"))
            .thenReturn(query);
        when(query.setParameter("id", paymentId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        supplierInvoicePaymentDao.findForPayment(paymentId);

        // Assert
        verify(entityManager).createNamedQuery("findForPayment");
    }

    @Test
    @DisplayName("Should set correct parameter for payment ID")
    void findForPaymentSetsCorrectPaymentIdParameter() {
        // Arrange
        Integer paymentId = 99;

        when(entityManager.createNamedQuery("findForPayment"))
            .thenReturn(query);
        when(query.setParameter("id", paymentId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        supplierInvoicePaymentDao.findForPayment(paymentId);

        // Assert
        verify(query).setParameter("id", 99);
    }

    @Test
    @DisplayName("Should handle null payment ID gracefully")
    void findForPaymentHandlesNullPaymentId() {
        // Arrange
        Integer paymentId = null;

        when(entityManager.createNamedQuery("findForPayment"))
            .thenReturn(query);
        when(query.setParameter("id", paymentId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        List<SupplierInvoicePayment> result = supplierInvoicePaymentDao.findForPayment(paymentId);

        // Assert
        assertThat(result).isNotNull();
        verify(query).setParameter("id", null);
    }

    @Test
    @DisplayName("Should call query methods in correct order for invoice payments")
    void findAllForInvoiceCallsMethodsInCorrectOrder() {
        // Arrange
        Integer invoiceId = 1;

        when(entityManager.createNamedQuery("findForSupplierInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        supplierInvoicePaymentDao.findAllForInvoice(invoiceId);

        // Assert
        verify(entityManager).createNamedQuery("findForSupplierInvoice");
        verify(query).setParameter("id", invoiceId);
        verify(query).getResultList();
    }

    @Test
    @DisplayName("Should call query methods in correct order for payment")
    void findForPaymentCallsMethodsInCorrectOrder() {
        // Arrange
        Integer paymentId = 1;

        when(entityManager.createNamedQuery("findForPayment"))
            .thenReturn(query);
        when(query.setParameter("id", paymentId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        supplierInvoicePaymentDao.findForPayment(paymentId);

        // Assert
        verify(entityManager).createNamedQuery("findForPayment");
        verify(query).setParameter("id", paymentId);
        verify(query).getResultList();
    }

    @Test
    @DisplayName("Should create query exactly once for invoice payments")
    void findAllForInvoiceCreatesQueryOnce() {
        // Arrange
        Integer invoiceId = 1;

        when(entityManager.createNamedQuery("findForSupplierInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        supplierInvoicePaymentDao.findAllForInvoice(invoiceId);

        // Assert
        verify(entityManager, times(1)).createNamedQuery("findForSupplierInvoice");
    }

    @Test
    @DisplayName("Should create query exactly once for payment")
    void findForPaymentCreatesQueryOnce() {
        // Arrange
        Integer paymentId = 1;

        when(entityManager.createNamedQuery("findForPayment"))
            .thenReturn(query);
        when(query.setParameter("id", paymentId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        supplierInvoicePaymentDao.findForPayment(paymentId);

        // Assert
        verify(entityManager, times(1)).createNamedQuery("findForPayment");
    }

    @Test
    @DisplayName("Should handle different invoice IDs independently")
    void findAllForInvoiceHandlesDifferentInvoiceIds() {
        // Arrange
        Integer invoiceId1 = 1;
        Integer invoiceId2 = 2;
        List<SupplierInvoicePayment> payments1 = createSupplierInvoicePaymentList(2);
        List<SupplierInvoicePayment> payments2 = createSupplierInvoicePaymentList(3);

        when(entityManager.createNamedQuery("findForSupplierInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId1))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId2))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(payments1)
            .thenReturn(payments2);

        // Act
        List<SupplierInvoicePayment> result1 = supplierInvoicePaymentDao.findAllForInvoice(invoiceId1);
        List<SupplierInvoicePayment> result2 = supplierInvoicePaymentDao.findAllForInvoice(invoiceId2);

        // Assert
        assertThat(result1).hasSize(2);
        assertThat(result2).hasSize(3);
    }

    @Test
    @DisplayName("Should handle different payment IDs independently")
    void findForPaymentHandlesDifferentPaymentIds() {
        // Arrange
        Integer paymentId1 = 1;
        Integer paymentId2 = 2;
        List<SupplierInvoicePayment> payments1 = createSupplierInvoicePaymentList(1);
        List<SupplierInvoicePayment> payments2 = createSupplierInvoicePaymentList(4);

        when(entityManager.createNamedQuery("findForPayment"))
            .thenReturn(query);
        when(query.setParameter("id", paymentId1))
            .thenReturn(query);
        when(query.setParameter("id", paymentId2))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(payments1)
            .thenReturn(payments2);

        // Act
        List<SupplierInvoicePayment> result1 = supplierInvoicePaymentDao.findForPayment(paymentId1);
        List<SupplierInvoicePayment> result2 = supplierInvoicePaymentDao.findForPayment(paymentId2);

        // Assert
        assertThat(result1).hasSize(1);
        assertThat(result2).hasSize(4);
    }

    @Test
    @DisplayName("Should not return null list for invoice payments")
    void findAllForInvoiceNeverReturnsNull() {
        // Arrange
        Integer invoiceId = 1;

        when(entityManager.createNamedQuery("findForSupplierInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        List<SupplierInvoicePayment> result = supplierInvoicePaymentDao.findAllForInvoice(invoiceId);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should not return null list for payment")
    void findForPaymentNeverReturnsNull() {
        // Arrange
        Integer paymentId = 1;

        when(entityManager.createNamedQuery("findForPayment"))
            .thenReturn(query);
        when(query.setParameter("id", paymentId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        List<SupplierInvoicePayment> result = supplierInvoicePaymentDao.findForPayment(paymentId);

        // Assert
        assertThat(result).isNotNull();
    }

    private List<SupplierInvoicePayment> createSupplierInvoicePaymentList(int count) {
        List<SupplierInvoicePayment> payments = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            SupplierInvoicePayment payment = new SupplierInvoicePayment();
            payment.setSupplierInvoicePaymentID(i + 1);
            payments.add(payment);
        }
        return payments;
    }
}
