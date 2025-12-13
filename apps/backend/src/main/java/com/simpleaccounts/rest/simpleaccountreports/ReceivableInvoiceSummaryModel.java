package com.simpleaccounts.rest.simpleaccountreports;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ReceivableInvoiceSummaryModel {
    private Integer invoiceId;
    private String invoiceNumber;
    private String customerName;
    private LocalDate invoiceDate;
    private String status;
    private LocalDate invoiceDueDate;
    private BigDecimal balance;
    private BigDecimal invoiceTotalAmount;

}
