package com.simplevat.rest;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

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
