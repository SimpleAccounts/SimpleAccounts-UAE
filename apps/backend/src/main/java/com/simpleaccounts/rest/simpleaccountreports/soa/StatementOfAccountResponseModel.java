package com.simpleaccounts.rest.simpleaccountreports.soa;

import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
public class StatementOfAccountResponseModel {

    private BigDecimal openingBalance;
    private BigDecimal totalInvoicedAmount;
    private BigDecimal totalAmountPaid;
    private BigDecimal totalBalance;

    List<TransactionsModel> transactionsModelList;

}