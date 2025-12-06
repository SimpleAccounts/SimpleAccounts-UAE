package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.CustomerInvoiceReceiptDao;
import com.simpleaccounts.entity.CustomerInvoiceReceipt;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CustomerInvoiceReceiptServiceImplTest {

    @Mock
    private CustomerInvoiceReceiptDao customerInvoiceReceiptDao;

    @InjectMocks
    private CustomerInvoiceReceiptServiceImpl customerInvoiceReceiptService;

    private CustomerInvoiceReceipt testReceipt;
    private List<CustomerInvoiceReceipt> testReceiptList;

    @BeforeEach
    void setUp() {
        testReceipt = new CustomerInvoiceReceipt();
        testReceipt.setId(1);
        testReceipt.setInvoiceId(100);
        testReceipt.setReceiptId(200);
        testReceipt.setReceiptNo(1);
        testReceipt.setAmount(BigDecimal.valueOf(1000.00));
        testReceipt.setCreatedDate(LocalDateTime.now());
        testReceipt.setDeleteFlag(false);

        testReceiptList = new ArrayList<>();
        testReceiptList.add(testReceipt);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnCustomerInvoiceReceiptDaoFromGetDao() {
        assertThat(customerInvoiceReceiptService.getDao()).isEqualTo(customerInvoiceReceiptDao);
    }

    // ========== findNextReceiptNoForInvoice Tests ==========

    @Test
    void shouldFindNextReceiptNoForInvoiceWhenReceiptsExist() {
        when(customerInvoiceReceiptDao.findAllForInvoice(100)).thenReturn(testReceiptList);

        Integer result = customerInvoiceReceiptService.findNextReceiptNoForInvoice(100);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(2);
        verify(customerInvoiceReceiptDao, times(1)).findAllForInvoice(100);
    }

    @Test
    void shouldReturnOneWhenNoReceiptsExistForInvoice() {
        when(customerInvoiceReceiptDao.findAllForInvoice(100)).thenReturn(Collections.emptyList());

        Integer result = customerInvoiceReceiptService.findNextReceiptNoForInvoice(100);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(1);
        verify(customerInvoiceReceiptDao, times(1)).findAllForInvoice(100);
    }

    @Test
    void shouldReturnOneWhenReceiptListIsNull() {
        when(customerInvoiceReceiptDao.findAllForInvoice(100)).thenReturn(null);

        Integer result = customerInvoiceReceiptService.findNextReceiptNoForInvoice(100);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(1);
        verify(customerInvoiceReceiptDao, times(1)).findAllForInvoice(100);
    }

    @Test
    void shouldCalculateNextReceiptNoCorrectlyForMultipleReceipts() {
        CustomerInvoiceReceipt receipt2 = new CustomerInvoiceReceipt();
        receipt2.setId(2);
        receipt2.setInvoiceId(100);
        receipt2.setReceiptNo(2);

        CustomerInvoiceReceipt receipt3 = new CustomerInvoiceReceipt();
        receipt3.setId(3);
        receipt3.setInvoiceId(100);
        receipt3.setReceiptNo(3);

        List<CustomerInvoiceReceipt> multipleReceipts = Arrays.asList(testReceipt, receipt2, receipt3);
        when(customerInvoiceReceiptDao.findAllForInvoice(100)).thenReturn(multipleReceipts);

        Integer result = customerInvoiceReceiptService.findNextReceiptNoForInvoice(100);

        assertThat(result).isEqualTo(4);
        verify(customerInvoiceReceiptDao, times(1)).findAllForInvoice(100);
    }

    @Test
    void shouldHandleDifferentInvoiceIds() {
        when(customerInvoiceReceiptDao.findAllForInvoice(200)).thenReturn(Collections.emptyList());
        when(customerInvoiceReceiptDao.findAllForInvoice(300)).thenReturn(testReceiptList);

        Integer result1 = customerInvoiceReceiptService.findNextReceiptNoForInvoice(200);
        Integer result2 = customerInvoiceReceiptService.findNextReceiptNoForInvoice(300);

        assertThat(result1).isEqualTo(1);
        assertThat(result2).isEqualTo(2);
        verify(customerInvoiceReceiptDao, times(1)).findAllForInvoice(200);
        verify(customerInvoiceReceiptDao, times(1)).findAllForInvoice(300);
    }

    @Test
    void shouldHandleZeroInvoiceId() {
        when(customerInvoiceReceiptDao.findAllForInvoice(0)).thenReturn(Collections.emptyList());

        Integer result = customerInvoiceReceiptService.findNextReceiptNoForInvoice(0);

        assertThat(result).isEqualTo(1);
        verify(customerInvoiceReceiptDao, times(1)).findAllForInvoice(0);
    }

    @Test
    void shouldHandleNullInvoiceId() {
        when(customerInvoiceReceiptDao.findAllForInvoice(null)).thenReturn(null);

        Integer result = customerInvoiceReceiptService.findNextReceiptNoForInvoice(null);

        assertThat(result).isEqualTo(1);
        verify(customerInvoiceReceiptDao, times(1)).findAllForInvoice(null);
    }

    @Test
    void shouldHandleLargeNumberOfReceipts() {
        List<CustomerInvoiceReceipt> largeList = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            CustomerInvoiceReceipt receipt = new CustomerInvoiceReceipt();
            receipt.setId(i);
            receipt.setInvoiceId(100);
            receipt.setReceiptNo(i);
            largeList.add(receipt);
        }

        when(customerInvoiceReceiptDao.findAllForInvoice(100)).thenReturn(largeList);

        Integer result = customerInvoiceReceiptService.findNextReceiptNoForInvoice(100);

        assertThat(result).isEqualTo(101);
        verify(customerInvoiceReceiptDao, times(1)).findAllForInvoice(100);
    }

    // ========== findForReceipt Tests ==========

    @Test
    void shouldFindForReceiptWhenReceiptsExist() {
        when(customerInvoiceReceiptDao.findForReceipt(200)).thenReturn(testReceiptList);

        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptService.findForReceipt(200);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getReceiptId()).isEqualTo(200);
        verify(customerInvoiceReceiptDao, times(1)).findForReceipt(200);
    }

    @Test
    void shouldReturnNullWhenNoReceiptsFoundForReceipt() {
        when(customerInvoiceReceiptDao.findForReceipt(200)).thenReturn(Collections.emptyList());

        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptService.findForReceipt(200);

        assertThat(result).isNull();
        verify(customerInvoiceReceiptDao, times(1)).findForReceipt(200);
    }

    @Test
    void shouldReturnNullWhenReceiptListIsNull() {
        when(customerInvoiceReceiptDao.findForReceipt(200)).thenReturn(null);

        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptService.findForReceipt(200);

        assertThat(result).isNull();
        verify(customerInvoiceReceiptDao, times(1)).findForReceipt(200);
    }

    @Test
    void shouldFindMultipleReceiptsForReceipt() {
        CustomerInvoiceReceipt receipt2 = new CustomerInvoiceReceipt();
        receipt2.setId(2);
        receipt2.setReceiptId(200);
        receipt2.setAmount(BigDecimal.valueOf(500.00));

        CustomerInvoiceReceipt receipt3 = new CustomerInvoiceReceipt();
        receipt3.setId(3);
        receipt3.setReceiptId(200);
        receipt3.setAmount(BigDecimal.valueOf(750.00));

        List<CustomerInvoiceReceipt> multipleReceipts = Arrays.asList(testReceipt, receipt2, receipt3);
        when(customerInvoiceReceiptDao.findForReceipt(200)).thenReturn(multipleReceipts);

        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptService.findForReceipt(200);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getAmount()).isEqualByComparingTo(BigDecimal.valueOf(1000.00));
        assertThat(result.get(1).getAmount()).isEqualByComparingTo(BigDecimal.valueOf(500.00));
        assertThat(result.get(2).getAmount()).isEqualByComparingTo(BigDecimal.valueOf(750.00));
        verify(customerInvoiceReceiptDao, times(1)).findForReceipt(200);
    }

    @Test
    void shouldHandleDifferentReceiptIds() {
        when(customerInvoiceReceiptDao.findForReceipt(200)).thenReturn(testReceiptList);
        when(customerInvoiceReceiptDao.findForReceipt(300)).thenReturn(Collections.emptyList());

        List<CustomerInvoiceReceipt> result1 = customerInvoiceReceiptService.findForReceipt(200);
        List<CustomerInvoiceReceipt> result2 = customerInvoiceReceiptService.findForReceipt(300);

        assertThat(result1).isNotNull();
        assertThat(result1).hasSize(1);
        assertThat(result2).isNull();
        verify(customerInvoiceReceiptDao, times(1)).findForReceipt(200);
        verify(customerInvoiceReceiptDao, times(1)).findForReceipt(300);
    }

    @Test
    void shouldHandleZeroReceiptId() {
        when(customerInvoiceReceiptDao.findForReceipt(0)).thenReturn(Collections.emptyList());

        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptService.findForReceipt(0);

        assertThat(result).isNull();
        verify(customerInvoiceReceiptDao, times(1)).findForReceipt(0);
    }

    @Test
    void shouldHandleNullReceiptId() {
        when(customerInvoiceReceiptDao.findForReceipt(null)).thenReturn(null);

        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptService.findForReceipt(null);

        assertThat(result).isNull();
        verify(customerInvoiceReceiptDao, times(1)).findForReceipt(null);
    }

    @Test
    void shouldHandleNegativeReceiptId() {
        when(customerInvoiceReceiptDao.findForReceipt(-1)).thenReturn(Collections.emptyList());

        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptService.findForReceipt(-1);

        assertThat(result).isNull();
        verify(customerInvoiceReceiptDao, times(1)).findForReceipt(-1);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleReceiptWithNullAmount() {
        CustomerInvoiceReceipt receiptWithNullAmount = new CustomerInvoiceReceipt();
        receiptWithNullAmount.setId(4);
        receiptWithNullAmount.setReceiptId(200);
        receiptWithNullAmount.setAmount(null);

        List<CustomerInvoiceReceipt> receipts = Arrays.asList(receiptWithNullAmount);
        when(customerInvoiceReceiptDao.findForReceipt(200)).thenReturn(receipts);

        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptService.findForReceipt(200);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAmount()).isNull();
        verify(customerInvoiceReceiptDao, times(1)).findForReceipt(200);
    }

    @Test
    void shouldHandleReceiptWithDeletedFlag() {
        CustomerInvoiceReceipt deletedReceipt = new CustomerInvoiceReceipt();
        deletedReceipt.setId(5);
        deletedReceipt.setReceiptId(200);
        deletedReceipt.setDeleteFlag(true);

        List<CustomerInvoiceReceipt> receipts = Arrays.asList(deletedReceipt);
        when(customerInvoiceReceiptDao.findForReceipt(200)).thenReturn(receipts);

        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptService.findForReceipt(200);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDeleteFlag()).isTrue();
        verify(customerInvoiceReceiptDao, times(1)).findForReceipt(200);
    }

    @Test
    void shouldHandleListWithOneReceipt() {
        List<CustomerInvoiceReceipt> singleReceipt = Collections.singletonList(testReceipt);
        when(customerInvoiceReceiptDao.findForReceipt(200)).thenReturn(singleReceipt);

        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptService.findForReceipt(200);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(customerInvoiceReceiptDao, times(1)).findForReceipt(200);
    }

    @Test
    void shouldCalculateNextReceiptNoWithSingleReceipt() {
        List<CustomerInvoiceReceipt> singleReceipt = Collections.singletonList(testReceipt);
        when(customerInvoiceReceiptDao.findAllForInvoice(100)).thenReturn(singleReceipt);

        Integer result = customerInvoiceReceiptService.findNextReceiptNoForInvoice(100);

        assertThat(result).isEqualTo(2);
        verify(customerInvoiceReceiptDao, times(1)).findAllForInvoice(100);
    }

    @Test
    void shouldHandleVeryLargeReceiptId() {
        Integer largeId = Integer.MAX_VALUE;
        when(customerInvoiceReceiptDao.findForReceipt(largeId)).thenReturn(testReceiptList);

        List<CustomerInvoiceReceipt> result = customerInvoiceReceiptService.findForReceipt(largeId);

        assertThat(result).isNotNull();
        verify(customerInvoiceReceiptDao, times(1)).findForReceipt(largeId);
    }

    @Test
    void shouldHandleVeryLargeInvoiceId() {
        Integer largeId = Integer.MAX_VALUE;
        when(customerInvoiceReceiptDao.findAllForInvoice(largeId)).thenReturn(testReceiptList);

        Integer result = customerInvoiceReceiptService.findNextReceiptNoForInvoice(largeId);

        assertThat(result).isEqualTo(2);
        verify(customerInvoiceReceiptDao, times(1)).findAllForInvoice(largeId);
    }

    // ========== Integration-like Tests ==========

    @Test
    void shouldHandleSequentialReceiptNumberGeneration() {
        when(customerInvoiceReceiptDao.findAllForInvoice(100))
                .thenReturn(Collections.emptyList())
                .thenReturn(testReceiptList)
                .thenReturn(Arrays.asList(testReceipt, testReceipt));

        Integer firstReceiptNo = customerInvoiceReceiptService.findNextReceiptNoForInvoice(100);
        Integer secondReceiptNo = customerInvoiceReceiptService.findNextReceiptNoForInvoice(100);
        Integer thirdReceiptNo = customerInvoiceReceiptService.findNextReceiptNoForInvoice(100);

        assertThat(firstReceiptNo).isEqualTo(1);
        assertThat(secondReceiptNo).isEqualTo(2);
        assertThat(thirdReceiptNo).isEqualTo(3);
        verify(customerInvoiceReceiptDao, times(3)).findAllForInvoice(100);
    }

    @Test
    void shouldVerifyDaoInteractionForMultipleInvoices() {
        when(customerInvoiceReceiptDao.findAllForInvoice(100)).thenReturn(testReceiptList);
        when(customerInvoiceReceiptDao.findAllForInvoice(200)).thenReturn(Collections.emptyList());
        when(customerInvoiceReceiptDao.findAllForInvoice(300)).thenReturn(testReceiptList);

        customerInvoiceReceiptService.findNextReceiptNoForInvoice(100);
        customerInvoiceReceiptService.findNextReceiptNoForInvoice(200);
        customerInvoiceReceiptService.findNextReceiptNoForInvoice(300);

        verify(customerInvoiceReceiptDao, times(1)).findAllForInvoice(100);
        verify(customerInvoiceReceiptDao, times(1)).findAllForInvoice(200);
        verify(customerInvoiceReceiptDao, times(1)).findAllForInvoice(300);
    }
}
