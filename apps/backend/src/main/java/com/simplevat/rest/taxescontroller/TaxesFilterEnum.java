package com.simplevat.rest.taxescontroller;

import lombok.Getter;


public enum TaxesFilterEnum {


    USER_ID("createdBy", " = :createdBy "),
    DELETE_FLAG("deleteFlag", " = :deleteFlag "),
    ORDER_BY("id"," =:id"),
    VAT_AMOUNT("",""),
    VAT_CODE("",""),
    TYPE("transactionCategory", " IN :transactionCategory "),
    TRANSACTION_DATE("createdDate","=:createdDate"),
    SOURCE("referenceType","=:referenceType"),
    STATUS("","");
    @Getter
    String dbColumnName;

    @Getter
    String condition;

    private TaxesFilterEnum(String dbColumnName, String condition) {
        this.dbColumnName = dbColumnName;
        this.condition = condition;
    }
}