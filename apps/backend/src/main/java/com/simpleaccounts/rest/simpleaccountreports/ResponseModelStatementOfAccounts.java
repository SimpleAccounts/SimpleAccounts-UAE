package com.simpleaccounts.rest.simpleaccountreports;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ResponseModelStatementOfAccounts {
    private List<StatementOfAccountsModel> statementOfAccountsModels;
    private BigDecimal balanceAmountTotal;
}
