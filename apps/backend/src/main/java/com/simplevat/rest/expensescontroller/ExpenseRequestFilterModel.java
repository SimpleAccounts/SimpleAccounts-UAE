package com.simplevat.rest.expensescontroller;

import com.simplevat.rest.PaginationModel;

import lombok.Data;

@Data
public class ExpenseRequestFilterModel extends PaginationModel{

	private String expenseDate;
	private String payee;
	private Integer transactionCategoryId;
	private Integer currencyCode;
	
}
