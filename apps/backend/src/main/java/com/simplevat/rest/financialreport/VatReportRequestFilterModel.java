package com.simplevat.rest.financialreport;

import com.simplevat.rest.PaginationModel;
import lombok.Data;

@Data
public class VatReportRequestFilterModel extends PaginationModel {
    private String status;
}
