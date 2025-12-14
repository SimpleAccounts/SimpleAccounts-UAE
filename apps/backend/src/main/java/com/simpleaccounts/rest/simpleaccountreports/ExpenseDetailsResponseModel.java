package com.simpleaccounts.rest.simpleaccountreports;

import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
public class ExpenseDetailsResponseModel {

    List<ExpenseSummaryModel> expenseSummaryModelModelList;
    private BigDecimal totalAmount;
    private BigDecimal totalVatAmount;
    private BigDecimal totalAmountWithoutTax;

}