package com.simpleaccounts.rest.migration.model;

import lombok.Data;

@Data
public class ExpenseModel {
	
	String expenseDate;
	String expenseDescription;
	String currencyCode;
	String taxAmount;
	String expenseReferenceID;
	String exchangeRate;
	String paidThrough;
	String total;
}
