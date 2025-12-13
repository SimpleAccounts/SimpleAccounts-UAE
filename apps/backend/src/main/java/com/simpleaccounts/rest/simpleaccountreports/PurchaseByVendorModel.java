package com.simpleaccounts.rest.simpleaccountreports;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PurchaseByVendorModel {

    private int invoiceId;
    private String vendorName;
    private long invoiceCount;
    private BigDecimal salesExcludingvat;
    private  BigDecimal getSalesWithvat;

}
