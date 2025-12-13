package com.simpleaccounts.model;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class AppliedInvoiceCreditNote {
    private Integer invoiceId;
    private String transactionType;
    private BigDecimal totalAmount;
    private String invoiceNumber;
    private String customerName;
    private String creditNoteId;
}
