package com.simpleaccounts.rest.simpleaccountreports;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

@Data
public class PayableInvoiceDetailModel {
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

}
