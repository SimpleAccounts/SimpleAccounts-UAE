package com.simpleaccounts.constant.dbfilter;

import lombok.Getter;

public enum TransactionCategoryFilterEnum {

    TRANSACTION_CATEGORY_CODE("transactionCategoryCode", " = :transactionCategoryCode"),
    TRANSACTION_CATEGORY_NAME("transactionCategoryName", " like CONCAT('%',:transactionCategoryName,'%')"),
    CHART_OF_ACCOUNT("chartOfAccount", " = :chartOfAccount"),
    CHART_OF_ACCOUNT_NOT_EQUAL("chartOfAccount", " != :chartOfAccount"),
    DELETE_FLAG("deleteFlag", " = :deleteFlag"),
	ORDER_BY("transactionCategoryId"," =:transactionCategoryId"),
    USER_ID("createdBy", "= :createdBy");

    @Getter
    String dbColumnName;

    @Getter
    String condition;

    private TransactionCategoryFilterEnum(String dbColumnName, String condition) {
        this.dbColumnName = dbColumnName;
        this.condition = condition;
    }
}
