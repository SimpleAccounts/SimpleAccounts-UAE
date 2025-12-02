package com.simplevat.rfq_po;

import com.simplevat.rest.PaginationModel;
import lombok.Data;

@Data
public class RfqRequestFilterModel extends PaginationModel {
    private Integer supplierId;
    private String rfqNumber;
    private Integer status;
    private Integer type;
}
