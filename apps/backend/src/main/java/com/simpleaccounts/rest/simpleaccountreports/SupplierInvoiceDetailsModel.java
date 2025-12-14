package com.simpleaccounts.rest.simpleaccountreports;

import java.math.BigDecimal;
import java.util.Date;
import lombok.Data;

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