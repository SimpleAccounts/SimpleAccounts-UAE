package com.simplevat.rest.simpleaccountreports;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ExpenseByCategoryModel {

//    private int transactionCategoryId;
    private String transactionCategoryName;
    private BigDecimal expensesAmountSum;
    private  BigDecimal expensesAmountWithoutTaxSum;
    private  BigDecimal expensesVatAmountSum;
}