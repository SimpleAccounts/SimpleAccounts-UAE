package com.simpleaccounts.rest.simpleaccountreports;

import lombok.Data;
import java.math.BigDecimal;

import java.util.Date;

@Data
public class SupplierInvoiceDetailsModel {

    private String invoiceNumber;
    private String customerName;
    private Date invoiceDate;
    private String status;
    private Date invoiceDueDate;
    private BigDecimal balance;
    private BigDecimal invoiceTotalAmount;

}