package com.simpleaccounts.rest.simpleaccountreports;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class SalesByCustomerModel {

    private int invoiceId;
    private String customerName;
    private long invoiceCount;
    private BigDecimal salesExcludingvat;
    private BigDecimal getSalesWithvat;

}
