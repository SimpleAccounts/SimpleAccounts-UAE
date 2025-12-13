package com.simpleaccounts.rest.financialreport;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

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
