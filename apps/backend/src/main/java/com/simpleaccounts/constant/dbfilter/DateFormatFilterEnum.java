package com.simpleaccounts.constant.dbfilter;

import lombok.Getter;

public enum DateFormatFilterEnum {
	USER_ID("createdBy", " = :createdBy "),
	DELETE_FLAG("deleteFlag", " = :deleteFlag");

	@Getter
	String dbColumnName;

	@Getter
	String condition;

	private DateFormatFilterEnum(String dbColumnName, String condition) {
		this.dbColumnName = dbColumnName;
		this.condition = condition;
	}
}
