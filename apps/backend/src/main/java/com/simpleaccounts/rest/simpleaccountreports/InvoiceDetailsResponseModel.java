package com.simpleaccounts.rest.simpleaccountreports;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class InvoiceDetailsResponseModel {

    List<InvoiceDetailsModel> invoiceSummaryModelList;
    private BigDecimal totalAmount;
    private BigDecimal totalBalance;

}