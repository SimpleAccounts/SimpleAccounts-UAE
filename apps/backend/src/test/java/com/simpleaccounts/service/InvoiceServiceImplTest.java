package com.simpleaccounts.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.constant.dbfilter.InvoiceFilterEnum;
import com.simpleaccounts.dao.InvoiceDao;
import com.simpleaccounts.dao.JournalDao;
import com.simpleaccounts.dao.JournalLineItemDao;
import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.entity.Journal;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.repository.InvoiceRepository;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.financialreport.AmountDetailRequestModel;
import com.simpleaccounts.rest.financialreport.VatReportFilingRepository;
import com.simpleaccounts.rest.invoice.dto.InvoiceAmoutResultSet;
import com.simpleaccounts.rest.invoice.dto.VatAmountDto;
import com.simpleaccounts.service.impl.InvoiceServiceImpl;
import com.simpleaccounts.utils.ChartUtil;
import com.simpleaccounts.utils.DateUtils;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceImplTest {

    @Mock
    private InvoiceDao supplierInvoiceDao;
    @Mock
    private ChartUtil chartUtil;
    @Mock
    private DateUtils dateUtils;
    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private VatReportFilingRepository vatReportFilingRepository;
    @Mock
    private JournalDao journalDao;
    @Mock
    private JournalLineItemDao journalLineItemDao;

    @InjectMocks
    private InvoiceServiceImpl invoiceService;

    private AmountDetailRequestModel buildAmountDetailRequest(Integer placeOfSupply) {
        AmountDetailRequestModel requestModel = new AmountDetailRequestModel();
        requestModel.setStartDate("01/01/2024");
        requestModel.setEndDate("31/01/2024");
        requestModel.setPlaceOfSyply(placeOfSupply);
        return requestModel;
    }

    @Test
    void shouldIncrementLastInvoiceNumberWhenPreviousReferenceExists() {
        Invoice existing = new Invoice();
        existing.setReferenceNumber("INV-1001");
        when(supplierInvoiceDao.getLastInvoice(2)).thenReturn(existing);

        Integer next = invoiceService.getLastInvoiceNo(2);

        assertThat(next).isEqualTo(1002);
    }

    @Test
    void shouldReturnOneWhenThereAreNoInvoicesYet() {
        when(supplierInvoiceDao.getLastInvoice(1)).thenReturn(null);

        Integer next = invoiceService.getLastInvoiceNo(1);

        assertThat(next).isEqualTo(1);
    }

    @Test
    void shouldReturnZeroWhenReferenceIsNotNumeric() {
        Invoice existing = new Invoice();
        existing.setReferenceNumber("INVALID");
        when(supplierInvoiceDao.getLastInvoice(3)).thenReturn(existing);

        Integer next = invoiceService.getLastInvoiceNo(3);

        assertThat(next).isZero();
    }

    @Test
    void shouldAggregateStandardRatedAmountsIntoVatAmountDtos() {
        AmountDetailRequestModel request = buildAmountDetailRequest(11);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 31);

        InvoiceAmoutResultSet invoiceAmount = stubAmountResult(
                1,
                new BigDecimal("200.00"),
                new BigDecimal("10.00"),
                "INV-001",
                "2024-01-05",
                "AED",
                false
        );
        InvoiceAmoutResultSet expenseAmount = stubAmountResult(
                2,
                new BigDecimal("150.00"),
                new BigDecimal("5.00"),
                "EXP-002",
                "2024-01-07",
                "AED",
                true
        );

        when(invoiceRepository.geStanderdRatedInvoice(eq(start), eq(end), eq(Boolean.TRUE)))
                .thenReturn(Collections.singletonList(invoiceAmount));
        when(invoiceRepository.geStanderdRatedExpense(eq(start), eq(end), eq(Boolean.TRUE)))
                .thenReturn(Collections.singletonList(expenseAmount));

        List<VatAmountDto> result = invoiceService.getAmountDetails(request);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getAmount()).isEqualByComparingTo("190.00");
        assertThat(result.get(0).getCurrency()).isEqualTo("AED");
        assertThat(result.get(1).getAmount()).isEqualByComparingTo("150.00");
        assertThat(result.get(1).getVatAmount()).isEqualByComparingTo("5.00");

        verify(invoiceRepository).geStanderdRatedInvoice(eq(start), eq(end), eq(Boolean.TRUE));
        verify(invoiceRepository).geStanderdRatedExpense(eq(start), eq(end), eq(Boolean.TRUE));
    }

    @Test
    void shouldRouteZeroRatedRequestsToZeroRatedQuery() {
        AmountDetailRequestModel request = buildAmountDetailRequest(9);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 31);

        InvoiceAmoutResultSet zeroRatedAmount = stubAmountResult(
                3,
                BigDecimal.TEN,
                BigDecimal.ZERO,
                "INV-003",
                "2024-01-10",
                "AED",
                false
        );

        when(invoiceRepository.getZeroRatedSupplies(eq(start), eq(end), eq(Boolean.TRUE)))
                .thenReturn(Collections.singletonList(zeroRatedAmount));

        List<VatAmountDto> result = invoiceService.getAmountDetails(request);

        assertThat(result).hasSize(1);
        verify(invoiceRepository).getZeroRatedSupplies(eq(start), eq(end), eq(Boolean.TRUE));
        verify(invoiceRepository, never()).geStanderdRatedInvoice(any(), any(), any());
    }

    @Test
    void shouldHandleRegionalSuppliesCorrectly() {
        // Covers cases 1 through 7
        AmountDetailRequestModel request = buildAmountDetailRequest(1);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 31);

        InvoiceAmoutResultSet amount = stubAmountResult(
                4,
                new BigDecimal("100.00"),
                new BigDecimal("5.00"),
                "INV-REG-001",
                "2024-01-02",
                "AED",
                false
        );

        when(invoiceRepository.getAmountDetails(eq(1), eq(start), eq(end), eq(Boolean.TRUE)))
                .thenReturn(Collections.singletonList(amount));

        List<VatAmountDto> result = invoiceService.getAmountDetails(request);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAmount()).isEqualByComparingTo("95.00");
        verify(invoiceRepository).getAmountDetails(eq(1), eq(start), eq(end), eq(Boolean.TRUE));
    }

    @Test
    void shouldHandleReverseChargeProvisions() {
        // Case 8
        AmountDetailRequestModel request = buildAmountDetailRequest(8);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 31);

        InvoiceAmoutResultSet revChargeInvoice = stubAmountResult(
                5,
                new BigDecimal("300.00"),
                new BigDecimal("15.00"),
                "INV-REV-001",
                "2024-01-15",
                "AED",
                false
        );
        InvoiceAmoutResultSet revChargeExpense = stubAmountResult(
                6,
                new BigDecimal("50.00"),
                BigDecimal.ZERO,
                "EXP-REV-001",
                "2024-01-16",
                "AED",
                true
        );

        when(invoiceRepository.getReverseChargeProvisions(eq(start), eq(end), eq(Boolean.TRUE)))
                .thenReturn(Collections.singletonList(revChargeInvoice));
        when(invoiceRepository.getReverseChargeForExpense(eq(start), eq(end), eq(Boolean.TRUE)))
                .thenReturn(Collections.singletonList(revChargeExpense));

        List<VatAmountDto> result = invoiceService.getAmountDetails(request);

        assertThat(result).hasSize(2);
        // Invoice: 300 - 15 = 285
        assertThat(result.get(0).getAmount()).isEqualByComparingTo("285.00");
        // Expense: 50 (Exclusive Vat = true)
        assertThat(result.get(1).getAmount()).isEqualByComparingTo("50.00");
    }

    @Test
    void shouldHandleExemptSupplies() {
        // Case 10
        AmountDetailRequestModel request = buildAmountDetailRequest(10);
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = LocalDate.of(2024, 1, 31);

        InvoiceAmoutResultSet exemptAmount = stubAmountResult(
                7,
                new BigDecimal("500.00"),
                BigDecimal.ZERO,
                "INV-EXEMPT",
                "2024-01-20",
                "AED",
                false
        );

        when(invoiceRepository.getExemptSupplies(eq(start), eq(end), eq(Boolean.TRUE)))
                .thenReturn(Collections.singletonList(exemptAmount));

        List<VatAmountDto> result = invoiceService.getAmountDetails(request);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAmount()).isEqualByComparingTo("500.00");
    }

    @Test
    void shouldDeleteJournalForInvoiceWhenJournalLineItemExists() {
        Invoice invoice = new Invoice();
        invoice.setId(123);
        
        Journal journal = new Journal();
        journal.setId(456);

        JournalLineItem lineItem = new JournalLineItem();
        lineItem.setJournal(journal);

        when(journalLineItemDao.findByAttributes(any(Map.class)))
                .thenReturn(Collections.singletonList(lineItem));

        invoiceService.deleteJournaForInvoice(invoice);

        ArgumentCaptor<Map<String, Object>> paramCaptor = ArgumentCaptor.forClass(Map.class);
        verify(journalLineItemDao).findByAttributes(paramCaptor.capture());
        
        Map<String, Object> capturedParams = paramCaptor.getValue();
        assertThat(capturedParams)
                .containsEntry("referenceType", PostingReferenceTypeEnum.INVOICE)
                .containsEntry("referenceId", 123)
                .containsEntry("deleteFlag", false);

        verify(journalDao).deleteByIds(Collections.singletonList(456));
    }

    @Test
    void shouldNotDeleteJournalWhenNoLineItemsFound() {
        Invoice invoice = new Invoice();
        invoice.setId(123);

        when(journalLineItemDao.findByAttributes(any(Map.class))).thenReturn(Collections.emptyList());

        invoiceService.deleteJournaForInvoice(invoice);

        verify(journalDao, never()).deleteByIds(any());
    }

    @Test
    void shouldDelegateGetInvoiceListToDao() {
        Map<InvoiceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();
        PaginationResponseModel expectedResponse = new PaginationResponseModel();

        when(supplierInvoiceDao.getInvoiceList(filterMap, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = invoiceService.getInvoiceList(filterMap, paginationModel);

        assertThat(result).isSameAs(expectedResponse);
        verify(supplierInvoiceDao).getInvoiceList(filterMap, paginationModel);
    }

    private InvoiceAmoutResultSet stubAmountResult(
            Integer id,
            BigDecimal total,
            BigDecimal vat,
            String reference,
            String invoiceDate,
            String currency,
            boolean exclusiveVat
    ) {
        return new InvoiceAmoutResultSet() {
            @Override
            public Integer getId() {
                return id;
            }

            @Override
            public BigDecimal getTotalAmount() {
                return total;
            }

            @Override
            public BigDecimal getTotalVatAmount() {
                return vat;
            }

            @Override
            public String getPlaceOfSupply() {
                return "AE";
            }

            @Override
            public String getReferenceNumber() {
                return reference;
            }

            @Override
            public String getInvoiceDate() {
                return invoiceDate;
            }

            @Override
            public String getCurrency() {
                return currency;
            }

            @Override
            public Boolean getExclusiveVat() {
                return exclusiveVat;
            }
        };
    }
}

