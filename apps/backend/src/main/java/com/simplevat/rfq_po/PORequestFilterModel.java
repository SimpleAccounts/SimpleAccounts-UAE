package com.simplevat.rfq_po;

import com.simplevat.rest.PaginationModel;
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