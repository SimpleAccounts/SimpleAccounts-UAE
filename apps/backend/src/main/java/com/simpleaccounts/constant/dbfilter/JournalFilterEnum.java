package com.simpleaccounts.constant.dbfilter;

import lombok.Getter;

public enum JournalFilterEnum {

    USER_ID("createdBy", "= :createdBy"),
    DELETE_FLAG("deleteFlag", "= :deleteFlag"),
    JOURNAL_DATE("journalDate", " = :journalDate "),
    REFERENCE_NO("journlReferencenNo", " like CONCAT('%',:journlReferencenNo,'%')"),
    POSTING_REFERENCE_TYPE("postingReferenceType", "= :postingReferenceType"),
    DESCRIPTION("description", " like CONCAT('%',:description,'%')"),
    ORDER_BY("id"," =:id");

    @Getter
    String dbColumnName;

    @Getter
    String condition;
    
    private JournalFilterEnum(String dbColumnName, String condition) {
        this.dbColumnName = dbColumnName;
        this.condition = condition;
    }

}
