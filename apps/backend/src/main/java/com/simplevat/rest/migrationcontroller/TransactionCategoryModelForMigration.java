package com.simplevat.rest.migrationcontroller;

import lombok.Data;

@Data
public class TransactionCategoryModelForMigration {
    private Integer transactionId;
    private String accountCode;
    private String transactionName;
    private String chartOfAccountName;
    private Boolean editableFlag;
}
