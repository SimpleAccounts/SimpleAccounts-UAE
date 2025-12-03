package com.simpleaccounts.model;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AppliedInvoiceCreditNote {
    private Integer invoiceId;
    private String transactionType;
    private BigDecimal totalAmount;
    private String invoiceNumber;
    private String customerName;
    private String creditNoteId;
}
