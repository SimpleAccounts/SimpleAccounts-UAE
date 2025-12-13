package com.simpleaccounts.rest.simpleaccountreports;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class PurchaseByVendorModel {

    private int invoiceId;
    private String vendorName;
    private long invoiceCount;
    private BigDecimal salesExcludingvat;
    private  BigDecimal getSalesWithvat;

}
