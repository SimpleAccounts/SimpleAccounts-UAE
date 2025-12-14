package com.simpleaccounts.rest.taxescontroller;

import com.simpleaccounts.rest.PaginationModel;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class TaxesFilterModel  extends PaginationModel {
    private Integer contact;
    private String referenceType;
    private String transactionDate;
    private BigDecimal amount;
    private Integer status;
    private Integer type;
}

