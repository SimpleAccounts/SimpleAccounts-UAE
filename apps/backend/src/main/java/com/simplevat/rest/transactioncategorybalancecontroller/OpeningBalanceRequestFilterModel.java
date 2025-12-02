package com.simplevat.rest.transactioncategorybalancecontroller;

import com.simplevat.rest.PaginationModel;
import lombok.Data;

@Data
public class OpeningBalanceRequestFilterModel extends PaginationModel {
    private String name;
}