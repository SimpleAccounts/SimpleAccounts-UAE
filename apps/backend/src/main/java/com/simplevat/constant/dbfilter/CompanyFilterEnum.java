package com.simplevat.constant.dbfilter;

import lombok.Getter;

/**
 * @author saurabhg 4/1/2020
 */
public enum CompanyFilterEnum {
	DELETE_FLAG("deleteFlag", " = :deleteFlag");

	@Getter
	String dbColumnName;

	@Getter
	String condition;

	private CompanyFilterEnum(String dbColumnName, String condition) {
		this.dbColumnName = dbColumnName;
		this.condition = condition;
	}
}
