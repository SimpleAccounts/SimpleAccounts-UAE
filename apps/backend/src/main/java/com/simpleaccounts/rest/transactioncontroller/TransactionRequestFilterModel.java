package com.simpleaccounts.rest.transactioncontroller;

import com.simpleaccounts.rest.PaginationModel;

import lombok.Data;

@Data
public class TransactionRequestFilterModel extends PaginationModel{
	private Integer bankId;
	//formate
	private String transactionDate;
	private Integer chartOfAccountId;
	private Integer transactionStatusCode;
	private String transactionType;
}
