package com.simpleaccounts.rest.simpleaccountreports;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ReceivableInvoiceDetailModel {

    private Integer invoiceId;
    private String invoiceNumber ;
    private LocalDate invoiceDate;
    private String status;
    private String productCode;
    private String productName;
    private String description;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal discount;
    private LocalDate dueDate;
    private BigDecimal vatAmount;
    private BigDecimal totalAmount;
    private BigDecimal balance;
    private String currencyName;

}
