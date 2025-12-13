package com.simpleaccounts.rest.payroll.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

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
