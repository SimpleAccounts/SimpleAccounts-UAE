package com.simpleaccounts.rest.simpleaccountreports;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SalesByCustomerModel {

    private int invoiceId;
    private String customerName;
    private long invoiceCount;
    private BigDecimal salesExcludingvat;
    private BigDecimal getSalesWithvat;

}
