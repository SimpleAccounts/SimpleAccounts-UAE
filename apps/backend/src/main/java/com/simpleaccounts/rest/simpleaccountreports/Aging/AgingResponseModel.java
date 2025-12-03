package com.simpleaccounts.rest.simpleaccountreports.Aging;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AgingResponseModel {

    private String contactName;
    private String organizationName;
    private BigDecimal currentAmount;
    private BigDecimal lessthen15 = BigDecimal.ZERO;
    private BigDecimal between15to30 = BigDecimal.ZERO;
    private BigDecimal morethan30 = BigDecimal.ZERO;
    private BigDecimal totalAmount = BigDecimal.ZERO;
}
