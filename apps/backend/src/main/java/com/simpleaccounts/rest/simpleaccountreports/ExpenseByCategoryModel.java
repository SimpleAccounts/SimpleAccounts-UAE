package com.simpleaccounts.rest.simpleaccountreports;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class ExpenseByCategoryModel {

    private String transactionCategoryName;
    private BigDecimal expensesAmountSum;
    private  BigDecimal expensesAmountWithoutTaxSum;
    private  BigDecimal expensesVatAmountSum;
}