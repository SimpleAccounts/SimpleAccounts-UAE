package com.simplevat.rest.transactioncontroller;

import com.simplevat.rest.PaginationModel;

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
