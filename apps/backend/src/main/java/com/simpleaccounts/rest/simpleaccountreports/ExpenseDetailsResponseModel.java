package com.simpleaccounts.rest.simpleaccountreports;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;


@Data
public class ExpenseDetailsResponseModel {

    List<ExpenseSummaryModel> expenseSummaryModelModelList;
    private BigDecimal totalAmount;
    private BigDecimal totalVatAmount;
    private BigDecimal totalAmountWithoutTax;

}