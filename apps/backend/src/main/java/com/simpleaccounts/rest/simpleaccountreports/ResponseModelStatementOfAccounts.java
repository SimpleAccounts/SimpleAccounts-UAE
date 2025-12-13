package com.simpleaccounts.rest.simpleaccountreports;

import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
public class ResponseModelStatementOfAccounts {
    private List<StatementOfAccountsModel> statementOfAccountsModels;
    private BigDecimal balanceAmountTotal;
}
