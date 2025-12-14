package com.simpleaccounts.uae;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.simpleaccounts.repository.InvoiceRepository;
import com.simpleaccounts.rest.financialreport.AmountDetailRequestModel;
import com.simpleaccounts.rest.financialreport.VatReportFilingRepository;
import com.simpleaccounts.rest.invoice.dto.InvoiceAmoutResultSet;
import com.simpleaccounts.rest.invoice.dto.VatAmountDto;
import com.simpleaccounts.service.impl.InvoiceServiceImpl;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.test.util.ReflectionTestUtils;

@RunWith(MockitoJUnitRunner.class)
public class VatCalculationTest {

    @InjectMocks
    private InvoiceServiceImpl invoiceService;

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private VatReportFilingRepository vatReportFilingRepository;

    @Before
    public void setUp() {
        ReflectionTestUtils.setField(invoiceService, "invoiceRepository", invoiceRepository);
        ReflectionTestUtils.setField(invoiceService, "vatReportFilingRepository", vatReportFilingRepository);
        when(vatReportFilingRepository.getVatReportFilingByStartDateAndEndDate(any(LocalDate.class),
            any(LocalDate.class))).thenReturn(null);
    }

    @Test
    public void shouldCalculateStandardRateVat() {
        AmountDetailRequestModel request = createRequest(1);
        when(invoiceRepository.getAmountDetails(eq(1), any(LocalDate.class), any(LocalDate.class), eq(Boolean.TRUE)))
            .thenReturn(Collections.singletonList(resultSet("INV-001", 105, 5)));

        List<VatAmountDto> dtos = invoiceService.getAmountDetails(request);

        assertEquals(1, dtos.size());
        assertEquals(BigDecimal.valueOf(100.0), dtos.get(0).getAmount());
        assertEquals(BigDecimal.valueOf(5.0), dtos.get(0).getVatAmount());
    }

    @Test
    public void shouldHandleZeroRatedGoods() {
        AmountDetailRequestModel request = createRequest(9);
        when(invoiceRepository.getZeroRatedSupplies(any(LocalDate.class), any(LocalDate.class), eq(Boolean.TRUE)))
            .thenReturn(Collections.singletonList(resultSet("INV-002", 100, 0)));

        List<VatAmountDto> dtos = invoiceService.getAmountDetails(request);

        assertEquals(0, dtos.get(0).getVatAmount().compareTo(BigDecimal.ZERO));
    }

    @Test
    public void shouldHandleExemptServices() {
        AmountDetailRequestModel request = createRequest(10);
        when(invoiceRepository.getExemptSupplies(any(LocalDate.class), any(LocalDate.class), eq(Boolean.TRUE)))
            .thenReturn(Collections.singletonList(resultSet("INV-003", 250, 0)));

        List<VatAmountDto> dtos = invoiceService.getAmountDetails(request);

        assertEquals(BigDecimal.valueOf(250.0), dtos.get(0).getAmount());
        assertEquals(0, dtos.get(0).getVatAmount().compareTo(BigDecimal.ZERO));
    }

    @Test
    public void shouldHandleReverseChargeMechanism() {
        AmountDetailRequestModel request = createRequest(8);
        when(invoiceRepository.getReverseChargeProvisions(any(LocalDate.class), any(LocalDate.class), eq(Boolean.TRUE)))
            .thenReturn(Collections.singletonList(resultSet("RC-INV", 210, 10)));
        when(invoiceRepository.getReverseChargeForExpense(any(LocalDate.class), any(LocalDate.class), eq(Boolean.TRUE)))
            .thenReturn(Collections.singletonList(expenseResultSet("RC-EXP", 105, 5, false)));

        List<VatAmountDto> dtos = invoiceService.getAmountDetails(request);

        assertEquals(2, dtos.size());
        assertEquals("RC-INV", dtos.get(0).getEntry());
        assertEquals("RC-EXP", dtos.get(1).getEntry());
    }

    @Test
    public void shouldHandleMixedBasketPerLineCalculations() {
        AmountDetailRequestModel request = createRequest(11);
        when(invoiceRepository.geStanderdRatedInvoice(any(LocalDate.class), any(LocalDate.class), eq(Boolean.TRUE)))
            .thenReturn(Collections.singletonList(resultSet("INV-LINE", 210, 10)));
        when(invoiceRepository.geStanderdRatedExpense(any(LocalDate.class), any(LocalDate.class), eq(Boolean.TRUE)))
            .thenReturn(Arrays.asList(
                expenseResultSet("EXP-EXCLUSIVE", 100, 5, true),
                expenseResultSet("EXP-INCLUSIVE", 210, 10, false)
            ));

        List<VatAmountDto> dtos = invoiceService.getAmountDetails(request);

        VatAmountDto exclusive = dtos.stream()
            .filter(dto -> "EXP-EXCLUSIVE".equals(dto.getEntry()))
            .findFirst()
            .orElseThrow(AssertionError::new);
        assertEquals(BigDecimal.valueOf(100.0), exclusive.getAmount());
    }

    private AmountDetailRequestModel createRequest(int placeOfSupply) {
        AmountDetailRequestModel request = new AmountDetailRequestModel();
        request.setStartDate("01-01-2025");
        request.setEndDate("31-01-2025");
        request.setPlaceOfSyply(placeOfSupply);
        return request;
    }

    private InvoiceAmoutResultSet resultSet(String reference, double total, double vat) {
        return expenseResultSet(reference, total, vat, false);
    }

    private InvoiceAmoutResultSet expenseResultSet(String reference, double total, double vat, boolean exclusive) {
        return new InvoiceAmoutResultSet() {
            @Override
            public Integer getId() {
                return 1;
            }

            @Override
            public BigDecimal getTotalAmount() {
                return BigDecimal.valueOf(total);
            }

            @Override
            public BigDecimal getTotalVatAmount() {
                return BigDecimal.valueOf(vat);
            }

            @Override
            public String getPlaceOfSupply() {
                return "UAE";
            }

            @Override
            public String getReferenceNumber() {
                return reference;
            }

            @Override
            public String getInvoiceDate() {
                return "2025-01-05";
            }

            @Override
            public String getCurrency() {
                return "AED";
            }

            @Override
            public Boolean getExclusiveVat() {
                return exclusive;
            }
        };
    }
}

