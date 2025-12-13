package com.simpleaccounts.rest.transactioncategorybalancecontroller;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class TransactionCategoryBalanceListModel {
	private Integer transactionCategoryBalanceId;
	private Integer transactionCategoryId;
	private String transactionCategoryName;
	private String effectiveDate; // dd/MM/yyyy
	private BigDecimal openingBalance;
	private BigDecimal runningBalance;
	private String currencySymbol;
	private String chartOfAccount;
}
