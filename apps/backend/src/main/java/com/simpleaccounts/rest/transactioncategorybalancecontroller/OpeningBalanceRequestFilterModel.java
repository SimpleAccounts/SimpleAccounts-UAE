package com.simpleaccounts.rest.transactioncategorybalancecontroller;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;

@Data
public class OpeningBalanceRequestFilterModel extends PaginationModel {
    private String name;
}