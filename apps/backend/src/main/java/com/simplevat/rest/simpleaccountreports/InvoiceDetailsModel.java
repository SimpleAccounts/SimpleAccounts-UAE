package com.simplevat.rest.simpleaccountreports;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

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
