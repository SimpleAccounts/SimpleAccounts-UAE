package com.simpleaccounts.rest.simpleaccountreports.soa;

import com.simpleaccounts.rest.simpleaccountreports.SupplierInvoiceDetailsModel;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class StatementOfAccountResponseModel {

    private BigDecimal openingBalance;
    private BigDecimal totalInvoicedAmount;
    private BigDecimal totalAmountPaid;
    private BigDecimal totalBalance;

    List<TransactionsModel> transactionsModelList;

}