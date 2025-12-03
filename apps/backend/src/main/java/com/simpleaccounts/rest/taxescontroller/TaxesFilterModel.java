package com.simpleaccounts.rest.taxescontroller;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;

import java.math.BigDecimal;
@Data
public class TaxesFilterModel  extends PaginationModel {
    private Integer contact;
    private String referenceType;
    private String transactionDate;
    private BigDecimal amount;
    private Integer status;
    private Integer type;
}

