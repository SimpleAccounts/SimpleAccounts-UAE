package com.simpleaccounts.rest.payroll.model;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
@Data
public class MoneyPaidToUserModel {
    LocalDate startDate;
    LocalDate endDate;
    Integer employeeId;
    LocalDate transactionDate;
    String transactionType;
    String category;
    BigDecimal amount;

}
