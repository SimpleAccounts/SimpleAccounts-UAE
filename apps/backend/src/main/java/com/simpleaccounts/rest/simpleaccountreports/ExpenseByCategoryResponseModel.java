package com.simpleaccounts.rest.simpleaccountreports;

import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
public class ExpenseByCategoryResponseModel {

    List<ExpenseByCategoryModel> expenseByCategoryList;
    BigDecimal totalVatAmount;
    BigDecimal totalAmount;
    BigDecimal totalAmountWithoutTax;
}