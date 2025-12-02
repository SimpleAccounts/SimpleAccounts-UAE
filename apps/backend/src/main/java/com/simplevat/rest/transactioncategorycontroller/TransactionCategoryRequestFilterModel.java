package com.simplevat.rest.transactioncategorycontroller;

import com.simplevat.rest.PaginationModel;
import lombok.Data;

@Data
public class TransactionCategoryRequestFilterModel extends PaginationModel {

    private String transactionCategoryName;
    private String transactionCategoryCode;
    private Integer chartOfAccountId;
}
