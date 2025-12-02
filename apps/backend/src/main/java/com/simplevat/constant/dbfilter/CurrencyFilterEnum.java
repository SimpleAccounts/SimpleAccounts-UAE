package com.simplevat.constant.dbfilter;

import lombok.Getter;

public enum CurrencyFilterEnum {
	ORDER_BY("currencyCode"," =:currencyCode"),
	DELETE_FLAG("deleteFlag", " = :deleteFlag");

	@Getter
	String dbColumnName;

	@Getter
	String condition;

	private CurrencyFilterEnum(String dbColumnName, String condition) {
		this.dbColumnName = dbColumnName;
		this.condition = condition;
	}
}
