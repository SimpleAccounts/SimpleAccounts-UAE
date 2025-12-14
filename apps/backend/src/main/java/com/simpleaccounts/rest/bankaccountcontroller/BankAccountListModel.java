package com.simpleaccounts.rest.bankaccountcontroller;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class BankAccountListModel {

	private Integer bankAccountId;
	private String name;
	private String bankAccountTypeName;
	private String bankAccountNo;
	private String accounName;
	private String currancyName;
	private Double openingBalance;
	private String reconcileDate;
	private BigDecimal closingBalance;
	private String curruncySymbol;
	private Integer transactionCount;

	
}
