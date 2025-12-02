package com.simplevat.constant.dbfilter;

import lombok.Getter;

public enum UserFilterEnum {

    FIRST_NAME("firstName", " like CONCAT('%',:firstName,'%')"),
    DOB("dateOfBirth", " = :dateOfBirth"),
    ROLE("role", " like CONCAT('%',:role,'%')"),
    ACTIVE("isActive", " = :isActive"),
    COMPANY("company", " = :company"),
	ORDER_BY("userId"," =:userId"),
    DELETE_FLAG("deleteFlag", " = :deleteFlag");

    @Getter
    String dbColumnName;

    @Getter
    String condition;

    private UserFilterEnum(String dbColumnName, String condition) {
        this.dbColumnName = dbColumnName;
        this.condition = condition;
    }

}
