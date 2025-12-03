package com.simpleaccounts.rest.simpleaccountreports;

import com.simpleaccounts.constant.PayMode;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ExpenseSummaryModel {
    private Integer expenseId;
    private LocalDate expenseDate;
    private String status;
    private String paidBy;
    private PayMode payMode;
    private String transactionCategoryName;
    private BigDecimal amountWithoutTax;
    private BigDecimal expenseVatAmount;
    private BigDecimal expenseAmount;
    private String vatName;
    private String expenseNumber;

}