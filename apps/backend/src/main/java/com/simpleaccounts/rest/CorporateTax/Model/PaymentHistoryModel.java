package com.simpleaccounts.rest.CorporateTax.Model;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

@Data
public class PaymentHistoryModel {
    private Integer id;
    private String startDate;
    private String endDate;
    private BigDecimal amountPaid;
    private LocalDate paymentDate;
}
