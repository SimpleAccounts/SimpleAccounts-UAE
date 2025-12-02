package com.simplevat.constant.dbfilter;

import lombok.Getter;

public enum StateFilterEnum {

	COUNTRY("country", " = :country"), 
	DELETE_FLAG("deleteFlag", " = :deleteFlag");

	@Getter
	String dbColumnName;

	@Getter
	String condition;

	private StateFilterEnum(String dbColumnName, String condition) {
		this.dbColumnName = dbColumnName;
		this.condition = condition;
	}

}
