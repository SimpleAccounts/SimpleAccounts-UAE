package com.simplevat.constant.dbfilter;

import lombok.Getter;

public enum TransactionParsingSettingFilterEnum {
	DELETE_FLAG("deleteFlag", " = :deleteFlag");

	@Getter
	String dbColumnName;

	@Getter
	String condition;

	private TransactionParsingSettingFilterEnum(String dbColumnName, String condition) {
		this.dbColumnName = dbColumnName;
		this.condition = condition;
	}
}
