package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.entity.CustomerInvoiceReceipt;
import com.simpleaccounts.entity.Receipt;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.Query;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("CustomerInvoiceReceiptDaoImpl Unit Tests")
class CustomerInvoiceReceiptDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private Query query;

    @InjectMocks
    private CustomerInvoiceReceiptDaoImpl customerInvoiceReceiptDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(customerInvoiceReceiptDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(customerInvoiceReceiptDao, "entityClass", CustomerInvoiceReceipt.class);
    }

    @Test
    @DisplayName("Should return all invoice receipts for given invoice ID")
    void findAllForInvoiceReturnsListWhenInvoiceExists() {
        // Arrange
        Integer invoiceId = 1;
        List<CustomerInvoiceReceipt> receipts = createCustomerInvoiceReceiptList(3);

        when(entityManager.createNamedQuery("findForInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(receipts);

        // Act
        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptDao.findAllForInvoice(invoiceId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).isEqualTo(receipts);
    }

    @Test
    @DisplayName("Should return empty list when no receipts for invoice")
    void findAllForInvoiceReturnsEmptyListWhenNoReceipts() {
        // Arrange
        Integer invoiceId = 999;

        when(entityManager.createNamedQuery("findForInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptDao.findAllForInvoice(invoiceId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use findForInvoice named query")
    void findAllForInvoiceUsesNamedQuery() {
        // Arrange
        Integer invoiceId = 1;

        when(entityManager.createNamedQuery("findForInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        customerInvoiceReceiptDao.findAllForInvoice(invoiceId);

        // Assert
        verify(entityManager).createNamedQuery("findForInvoice");
    }

    @Test
    @DisplayName("Should set correct invoice ID parameter")
    void findAllForInvoiceSetsCorrectParameter() {
        // Arrange
        Integer invoiceId = 5;

        when(entityManager.createNamedQuery("findForInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        customerInvoiceReceiptDao.findAllForInvoice(invoiceId);

        // Assert
        verify(query).setParameter("id", invoiceId);
    }

    @Test
    @DisplayName("Should handle null invoice ID")
    void findAllForInvoiceHandlesNullInvoiceId() {
        // Arrange
        when(entityManager.createNamedQuery("findForInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", null))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptDao.findAllForInvoice(null);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return single receipt for invoice")
    void findAllForInvoiceReturnsSingleReceipt() {
        // Arrange
        Integer invoiceId = 1;
        CustomerInvoiceReceipt receipt = createCustomerInvoiceReceipt(1, 1, 1);

        when(entityManager.createNamedQuery("findForInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.singletonList(receipt));

        // Act
        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptDao.findAllForInvoice(invoiceId);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(receipt);
    }

    @Test
    @DisplayName("Should return all receipts for given receipt ID")
    void findForReceiptReturnsListWhenReceiptExists() {
        // Arrange
        Integer receiptId = 1;
        List<CustomerInvoiceReceipt> receipts = createCustomerInvoiceReceiptList(2);

        when(entityManager.createNamedQuery("findForReceipt"))
            .thenReturn(query);
        when(query.setParameter("id", receiptId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(receipts);

        // Act
        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptDao.findForReceipt(receiptId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).isEqualTo(receipts);
    }

    @Test
    @DisplayName("Should return empty list when no receipts for receipt ID")
    void findForReceiptReturnsEmptyListWhenNoReceipts() {
        // Arrange
        Integer receiptId = 999;

        when(entityManager.createNamedQuery("findForReceipt"))
            .thenReturn(query);
        when(query.setParameter("id", receiptId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptDao.findForReceipt(receiptId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use findForReceipt named query")
    void findForReceiptUsesNamedQuery() {
        // Arrange
        Integer receiptId = 1;

        when(entityManager.createNamedQuery("findForReceipt"))
            .thenReturn(query);
        when(query.setParameter("id", receiptId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        customerInvoiceReceiptDao.findForReceipt(receiptId);

        // Assert
        verify(entityManager).createNamedQuery("findForReceipt");
    }

    @Test
    @DisplayName("Should set correct receipt ID parameter")
    void findForReceiptSetsCorrectParameter() {
        // Arrange
        Integer receiptId = 7;

        when(entityManager.createNamedQuery("findForReceipt"))
            .thenReturn(query);
        when(query.setParameter("id", receiptId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        customerInvoiceReceiptDao.findForReceipt(receiptId);

        // Assert
        verify(query).setParameter("id", receiptId);
    }

    @Test
    @DisplayName("Should handle null receipt ID")
    void findForReceiptHandlesNullReceiptId() {
        // Arrange
        when(entityManager.createNamedQuery("findForReceipt"))
            .thenReturn(query);
        when(query.setParameter("id", null))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptDao.findForReceipt(null);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return single receipt for receipt ID")
    void findForReceiptReturnsSingleReceipt() {
        // Arrange
        Integer receiptId = 1;
        CustomerInvoiceReceipt receipt = createCustomerInvoiceReceipt(1, 1, 1);

        when(entityManager.createNamedQuery("findForReceipt"))
            .thenReturn(query);
        when(query.setParameter("id", receiptId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.singletonList(receipt));

        // Act
        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptDao.findForReceipt(receiptId);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(receipt);
    }

    @Test
    @DisplayName("Should handle large number of receipts for invoice")
    void findAllForInvoiceHandlesLargeList() {
        // Arrange
        Integer invoiceId = 1;
        List<CustomerInvoiceReceipt> receipts = createCustomerInvoiceReceiptList(100);

        when(entityManager.createNamedQuery("findForInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(receipts);

        // Act
        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptDao.findAllForInvoice(invoiceId);

        // Assert
        assertThat(result).hasSize(100);
    }

    @Test
    @DisplayName("Should handle large number of receipts for receipt ID")
    void findForReceiptHandlesLargeList() {
        // Arrange
        Integer receiptId = 1;
        List<CustomerInvoiceReceipt> receipts = createCustomerInvoiceReceiptList(50);

        when(entityManager.createNamedQuery("findForReceipt"))
            .thenReturn(query);
        when(query.setParameter("id", receiptId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(receipts);

        // Act
        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptDao.findForReceipt(receiptId);

        // Assert
        assertThat(result).hasSize(50);
    }

    @Test
    @DisplayName("Should call getResultList exactly once for findAllForInvoice")
    void findAllForInvoiceCallsGetResultListOnce() {
        // Arrange
        Integer invoiceId = 1;

        when(entityManager.createNamedQuery("findForInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        customerInvoiceReceiptDao.findAllForInvoice(invoiceId);

        // Assert
        verify(query, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should call getResultList exactly once for findForReceipt")
    void findForReceiptCallsGetResultListOnce() {
        // Arrange
        Integer receiptId = 1;

        when(entityManager.createNamedQuery("findForReceipt"))
            .thenReturn(query);
        when(query.setParameter("id", receiptId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        customerInvoiceReceiptDao.findForReceipt(receiptId);

        // Assert
        verify(query, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should handle multiple receipts with different amounts for invoice")
    void findAllForInvoiceHandlesMultipleAmounts() {
        // Arrange
        Integer invoiceId = 1;
        List<CustomerInvoiceReceipt> receipts = Arrays.asList(
            createCustomerInvoiceReceiptWithAmount(1, 1, 1, BigDecimal.valueOf(100)),
            createCustomerInvoiceReceiptWithAmount(2, 1, 2, BigDecimal.valueOf(200)),
            createCustomerInvoiceReceiptWithAmount(3, 1, 3, BigDecimal.valueOf(300))
        );

        when(entityManager.createNamedQuery("findForInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(receipts);

        // Act
        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptDao.findAllForInvoice(invoiceId);

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getPaidAmount()).isEqualByComparingTo(BigDecimal.valueOf(100));
        assertThat(result.get(1).getPaidAmount()).isEqualByComparingTo(BigDecimal.valueOf(200));
        assertThat(result.get(2).getPaidAmount()).isEqualByComparingTo(BigDecimal.valueOf(300));
    }

    @Test
    @DisplayName("Should handle multiple receipts with different amounts for receipt")
    void findForReceiptHandlesMultipleAmounts() {
        // Arrange
        Integer receiptId = 1;
        List<CustomerInvoiceReceipt> receipts = Arrays.asList(
            createCustomerInvoiceReceiptWithAmount(1, 1, 1, BigDecimal.valueOf(50)),
            createCustomerInvoiceReceiptWithAmount(2, 2, 1, BigDecimal.valueOf(150))
        );

        when(entityManager.createNamedQuery("findForReceipt"))
            .thenReturn(query);
        when(query.setParameter("id", receiptId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(receipts);

        // Act
        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptDao.findForReceipt(receiptId);

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getPaidAmount()).isEqualByComparingTo(BigDecimal.valueOf(50));
        assertThat(result.get(1).getPaidAmount()).isEqualByComparingTo(BigDecimal.valueOf(150));
    }

    @Test
    @DisplayName("Should return receipts with correct invoice ID")
    void findAllForInvoiceReturnsReceiptsWithCorrectInvoiceId() {
        // Arrange
        Integer invoiceId = 5;
        CustomerInvoiceReceipt receipt = createCustomerInvoiceReceipt(1, invoiceId, 1);

        when(entityManager.createNamedQuery("findForInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.singletonList(receipt));

        // Act
        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptDao.findAllForInvoice(invoiceId);

        // Assert
        assertThat(result.get(0).getCustomerInvoice().getId()).isEqualTo(invoiceId);
    }

    @Test
    @DisplayName("Should return receipts with correct receipt ID")
    void findForReceiptReturnsReceiptsWithCorrectReceiptId() {
        // Arrange
        Integer receiptId = 7;
        CustomerInvoiceReceipt receipt = createCustomerInvoiceReceipt(1, 1, receiptId);

        when(entityManager.createNamedQuery("findForReceipt"))
            .thenReturn(query);
        when(query.setParameter("id", receiptId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.singletonList(receipt));

        // Act
        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptDao.findForReceipt(receiptId);

        // Assert
        assertThat(result.get(0).getReceipt().getId()).isEqualTo(receiptId);
    }

    @Test
    @DisplayName("Should handle zero amount receipts")
    void findAllForInvoiceHandlesZeroAmountReceipts() {
        // Arrange
        Integer invoiceId = 1;
        CustomerInvoiceReceipt receipt = createCustomerInvoiceReceiptWithAmount(1, 1, 1, BigDecimal.ZERO);

        when(entityManager.createNamedQuery("findForInvoice"))
            .thenReturn(query);
        when(query.setParameter("id", invoiceId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.singletonList(receipt));

        // Act
        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptDao.findAllForInvoice(invoiceId);

        // Assert
        assertThat(result.get(0).getPaidAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    private CustomerInvoiceReceipt createCustomerInvoiceReceipt(int id, int invoiceId, int receiptId) {
        return createCustomerInvoiceReceiptWithAmount(id, invoiceId, receiptId, BigDecimal.valueOf(100.00));
    }

    private CustomerInvoiceReceipt createCustomerInvoiceReceiptWithAmount(int id, int invoiceId,
                                                                          int receiptId, BigDecimal amount) {
        CustomerInvoiceReceipt customerInvoiceReceipt = new CustomerInvoiceReceipt();
        customerInvoiceReceipt.setId(id);
        customerInvoiceReceipt.setPaidAmount(amount);
        customerInvoiceReceipt.setCreatedDate(LocalDateTime.now());

        Invoice invoice = new Invoice();
        invoice.setId(invoiceId);
        customerInvoiceReceipt.setCustomerInvoice(invoice);

        Receipt receipt = new Receipt();
        receipt.setId(receiptId);
        customerInvoiceReceipt.setReceipt(receipt);

        return customerInvoiceReceipt;
    }

    private List<CustomerInvoiceReceipt> createCustomerInvoiceReceiptList(int count) {
        List<CustomerInvoiceReceipt> receipts = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            receipts.add(createCustomerInvoiceReceipt(i + 1, 1, i + 1));
        }
        return receipts;
    }
}
