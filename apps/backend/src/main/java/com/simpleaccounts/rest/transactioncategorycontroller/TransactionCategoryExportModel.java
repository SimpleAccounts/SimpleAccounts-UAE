package com.simpleaccounts.rest.transactioncategorycontroller;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransactionCategoryExportModel {
    private Integer TransactionCategoryId;
    private String TransactionCategoryName;
    private String TransactionCategoryCode;
    private String TransactionTypeName;
}
