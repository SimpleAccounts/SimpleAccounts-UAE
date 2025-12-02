package com.simplevat.rest.simpleaccountreports;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ExpenseByCategoryResponseModel {

    List<ExpenseByCategoryModel> expenseByCategoryList;
    BigDecimal totalVatAmount;
    BigDecimal totalAmount;
    BigDecimal totalAmountWithoutTax;
}