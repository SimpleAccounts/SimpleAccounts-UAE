package com.simpleaccounts.rest.bankaccountcontroller;

import java.util.Date;

import com.simpleaccounts.rest.PaginationModel;

import lombok.Data;

@Data
public class BankAccountFilterModel extends PaginationModel{

	private String bankName;
	private Integer bankAccountTypeId;
	private String bankAccountName;
	private Date transactionDate;
	private String accountNumber;
	private Integer currencyCode;
}
