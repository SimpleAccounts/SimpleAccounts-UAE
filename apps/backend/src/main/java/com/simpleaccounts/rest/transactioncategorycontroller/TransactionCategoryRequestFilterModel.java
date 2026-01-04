package com.simpleaccounts.rest.transactioncategorycontroller;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class TransactionCategoryRequestFilterModel extends PaginationModel {

    private String transactionCategoryName;
    private String transactionCategoryCode;
    private Integer chartOfAccountId;
}
