package com.simpleaccounts.rfq_po;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;

@Data
public class RfqRequestFilterModel extends PaginationModel {
    private Integer supplierId;
    private String rfqNumber;
    private Integer status;
    private Integer type;
}
