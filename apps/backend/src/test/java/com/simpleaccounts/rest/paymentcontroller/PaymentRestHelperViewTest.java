package com.simpleaccounts.rest.paymentcontroller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.entity.Payment;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.service.ContactService;
import com.simpleaccounts.service.ContactTransactionCategoryService;
import com.simpleaccounts.service.InvoiceService;
import com.simpleaccounts.service.JournalLineItemService;
import com.simpleaccounts.service.PaymentService;
import com.simpleaccounts.service.SupplierInvoicePaymentService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.utils.FileHelper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PaymentRestHelperViewTest {

    private PaymentRestHelper paymentRestHelper;

    @Mock private ContactService contactService;
    @Mock private TransactionCategoryService transactionCategoryService;
    @Mock private FileHelper fileHelper;
    @Mock private JournalLineItemService journalLineItemService;
    @Mock private SupplierInvoicePaymentService supplierInvoicePaymentService;
    @Mock private InvoiceService invoiceService;
    @Mock private PaymentService paymentService;
    @Mock private ContactTransactionCategoryService contactTransactionCategoryService;

    @BeforeEach
    void setUp() {
        paymentRestHelper = new PaymentRestHelper(
            contactService,
            transactionCategoryService,
            fileHelper,
            journalLineItemService,
            supplierInvoicePaymentService,
            invoiceService,
            paymentService,
            contactTransactionCategoryService
        );
    }

    @Test
    void testConvertToPaymentViewModel() {
        // Arrange
        Payment payment = new Payment();
        payment.setPaymentId(100);
        payment.setInvoiceAmount(new BigDecimal("500.00"));
        payment.setPaymentDate(LocalDate.now());
        
        Invoice mockInvoice = mock(Invoice.class);
        lenient().when(mockInvoice.getStatus()).thenReturn(CommonStatusEnum.PAID.getValue());
        lenient().when(mockInvoice.getReferenceNumber()).thenReturn("INV-123");
        
        Currency mockCurrency = new Currency();
        mockCurrency.setCurrencySymbol("$");
        lenient().when(mockInvoice.getCurrency()).thenReturn(mockCurrency);
        
        Contact mockContact = new Contact();
        mockContact.setContactId(1);
        mockContact.setOrganization("Test Supplier");
        payment.setSupplier(mockContact);
        
        payment.setInvoice(mockInvoice);
        
        BankAccount mockBankAccount = new BankAccount();
        mockBankAccount.setBankAccountName("Test Bank");
        payment.setBankAccount(mockBankAccount);

        lenient().when(supplierInvoicePaymentService.findForPayment(100)).thenReturn(Collections.emptyList());

        // Act
        PaymentViewModel result = paymentRestHelper.convertToPaymentViewModel(payment);

        // Assert
        assertNotNull(result);
        assertEquals(100, result.getPaymentId());
        assertEquals(new BigDecimal("500.00"), result.getInvoiceAmount());
        assertEquals("Test Supplier", result.getSupplierName());
        assertEquals("Test Bank", result.getBankName());
        assertEquals("$", result.getCurrencySymbol());
        assertEquals("INV-123", result.getInvoiceNumber());
    }
}
