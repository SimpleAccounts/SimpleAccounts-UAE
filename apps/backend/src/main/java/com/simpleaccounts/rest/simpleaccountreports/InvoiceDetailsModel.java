package com.simpleaccounts.rest.simpleaccountreports;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

@Data
public class InvoiceDetailsModel {

    private Integer invoiceId;
    private String invoiceNumber;
    private String customerName;
    private LocalDate invoiceDate;
    private String status;
    private LocalDate invoiceDueDate;
    private BigDecimal balance;
    private BigDecimal invoiceTotalAmount;

}
