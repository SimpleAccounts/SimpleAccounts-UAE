package com.simpleaccounts.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExplainedInvoiceListModel implements Serializable {
	private static final long serialVersionUID = 1L;
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
