package com.simplevat.rfq_po;

import lombok.Getter;

public enum RfqFilterEnum {
    SUPPLIERID("supplierId", " = :supplierId"),
    RFQ_NUMBER("rfqNumber", " = :rfqNumber"),
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

    private RfqFilterEnum(String dbColumnName, String condition) {
        this.dbColumnName = dbColumnName;
        this.condition = condition;
    }
}
