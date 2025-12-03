package com.simpleaccounts.constant.dbfilter;

import lombok.Getter;

public enum BankAccounrFilterEnum {

	BANK_ACCOUNT_NAME("bankAccountName", " like CONCAT('%',:bankAccountName,'%')"),
	BANK_ACCOUNT_TYPE("bankAccountType", " =:bankAccountType"),
	BANK_BNAME("bankName", " like CONCAT('%',:bankName,'%')"),
	TRANSACTION_DATE("transactionDate","=:transactionDate"),
	ACCOUNT_NO("accountNumber", " like CONCAT('%',:accountNumber,'%')"),
	CURRENCY_CODE("bankAccountCurrency"," =:bankAccountCurrency"),
	ORDER_BY("bankAccountId"," =:bankAccountId"),
	DELETE_FLAG("deleteFlag", " =:deleteFlag"),
	USER_ID("createdBy", " = :createdBy ");

	@Getter
	String dbColumnName;

	@Getter
	String condition;

	private BankAccounrFilterEnum(String dbColumnName, String condition) {
		this.dbColumnName = dbColumnName;
		this.condition = condition;
	}

}
