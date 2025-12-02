package com.simplevat.rest.taxescontroller;

import com.simplevat.rest.PaginationModel;
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

