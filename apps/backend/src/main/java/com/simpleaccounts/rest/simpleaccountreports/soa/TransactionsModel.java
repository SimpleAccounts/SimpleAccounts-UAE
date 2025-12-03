package com.simpleaccounts.rest.simpleaccountreports.soa;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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