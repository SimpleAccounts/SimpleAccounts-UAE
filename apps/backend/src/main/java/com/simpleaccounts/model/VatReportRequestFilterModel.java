package com.simpleaccounts.model;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;

@Data
public class VatReportRequestFilterModel extends PaginationModel {
    private String status;
}
