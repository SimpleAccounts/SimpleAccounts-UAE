package com.simpleaccounts.rest.financialreport;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;

@Data
public class VatReportRequestFilterModel extends PaginationModel {
    private String status;
}
