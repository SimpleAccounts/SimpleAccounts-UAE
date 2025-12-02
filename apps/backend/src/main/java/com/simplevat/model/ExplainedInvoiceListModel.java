package com.simplevat.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExplainedInvoiceListModel {
    private Integer invoiceId;
    private LocalDate invoiceDate;
    private BigDecimal invoiceAmount;
    private BigDecimal invoiceDueAmount;
    private BigDecimal convertedInvoiceAmount;
    private BigDecimal nonConvertedInvoiceAmount;
    private BigDecimal convertedToBaseCurrencyAmount;
    private BigDecimal explainedAmount;
    private BigDecimal exchangeRate;
    private Boolean partiallyPaid;
    private BigDecimal exchangeGainOrLossAmount;
    private String invoiceNumber;
}
