package com.simpleaccounts.rest.CorporateTax.Model;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentHistoryModel {
    private Integer id;
    private String startDate;
    private String endDate;
    private BigDecimal amountPaid;
    private LocalDate paymentDate;
}
