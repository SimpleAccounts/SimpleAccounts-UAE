package com.simpleaccounts.rest.financialreport;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data
public class VatPaymentHistoryModel {

    private Integer id;

    private String taxReturns;
    private LocalDateTime dateOfFiling;
    private BigDecimal amountPaid;
    private BigDecimal amountReclaimed;
    private String currency;
    private String vatNumber;

}
