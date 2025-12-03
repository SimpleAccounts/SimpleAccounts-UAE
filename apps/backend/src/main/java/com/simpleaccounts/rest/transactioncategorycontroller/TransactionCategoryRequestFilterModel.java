package com.simpleaccounts.rest.transactioncategorycontroller;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;

@Data
public class TransactionCategoryRequestFilterModel extends PaginationModel {

    private String transactionCategoryName;
    private String transactionCategoryCode;
    private Integer chartOfAccountId;
}
