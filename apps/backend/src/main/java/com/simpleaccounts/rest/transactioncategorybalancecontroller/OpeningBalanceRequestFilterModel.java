package com.simpleaccounts.rest.transactioncategorybalancecontroller;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class OpeningBalanceRequestFilterModel extends PaginationModel {
    private String name;
}