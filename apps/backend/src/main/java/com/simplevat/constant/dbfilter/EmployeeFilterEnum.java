package com.simplevat.constant.dbfilter;

import lombok.Getter;

public enum EmployeeFilterEnum {

	   EMAIL("email", " like CONCAT('%',:email,'%')"),
	    FIRST_NAME("firstName", " like CONCAT('%',:firstName,'%')"),
		ORDER_BY("id"," =:id"),
	DELETE_FLAG("deleteFlag", " = :deleteFlag"),
	IS_ACTIVE("isActive", " = :isActive");

	    @Getter
	    String dbColumnName;

	    @Getter
	    String condition;

	    private EmployeeFilterEnum(String dbColumnName, String condition) {
	        this.dbColumnName = dbColumnName;
	        this.condition = condition;
	    }
}
