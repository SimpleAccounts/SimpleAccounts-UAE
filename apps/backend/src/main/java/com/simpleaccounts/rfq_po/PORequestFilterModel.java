package com.simpleaccounts.rfq_po;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;


@Data
public class PORequestFilterModel extends PaginationModel {
    private Integer supplierId;
    private String poNumber;
    private String grnNumber;
    private String quatationNumber;
    private Integer status;
    private Integer type;
}