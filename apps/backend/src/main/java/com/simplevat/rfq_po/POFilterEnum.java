package com.simplevat.rfq_po;

import lombok.Getter;

public enum POFilterEnum {
    SUPPLIERID("supplierId", " = :supplierId"),
    PO_NUMBER("poNumber", " = :poNumber"),
    GRN_NUMBER("grnNumber", " = :grnNumber"),
    TYPE("type", " = :type "),
    STATUS("status", " = :status "),
    USER_ID("createdBy", " = :createdBy "),
    USER_ID_IN("createdBy", " IN :createdBy "),
    DELETE_FLAG("deleteFlag", " = :deleteFlag "),
    ORDER_BY("id"," =:id");

    @Getter
    String dbColumnName;

    @Getter
    String condition;

    private POFilterEnum(String dbColumnName, String condition) {
        this.dbColumnName = dbColumnName;
        this.condition = condition;
    }
}
