package com.simpleaccounts.rest.simpleaccountreports.soa;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

/**
 * Created by Suraj Rahade on Dec 2020
 *
 *
 */
@Data
public class TransactionsModel {

    private LocalDateTime date;
    private String typeName;
    private String invoiceNumber;

    private BigDecimal amount;
    private BigDecimal paymentAmount;
    private BigDecimal balanceAmount;

}