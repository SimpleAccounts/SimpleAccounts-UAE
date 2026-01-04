package com.simpleaccounts.model;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class VatReportRequestFilterModel extends PaginationModel {
    private String status;
}
