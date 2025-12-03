package com.simpleaccounts.constant.dbfilter;

import lombok.Getter;

public enum VatReportFilterEnum {

    ORDER_BY("id"," =:id"),
    DELETE_FLAG("deleteFlag", " = :deleteFlag"),
    IS_ACTIVE("isActive", " = :isActive");

    @Getter
    String dbColumnName;

    @Getter
    String condition;

    private VatReportFilterEnum(String dbColumnName, String condition) {
        this.dbColumnName = dbColumnName;
        this.condition = condition;
    }
}
