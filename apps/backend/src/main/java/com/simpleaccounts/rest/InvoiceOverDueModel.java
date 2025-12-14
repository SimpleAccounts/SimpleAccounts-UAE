package com.simpleaccounts.rest;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InvoiceOverDueModel {
    BigDecimal creditAmount;
    BigDecimal debitAmount;

    public InvoiceOverDueModel(BigDecimal creditAmount, BigDecimal debitAmount) {
        this.creditAmount = creditAmount;
        this.debitAmount = debitAmount;
    }
}
