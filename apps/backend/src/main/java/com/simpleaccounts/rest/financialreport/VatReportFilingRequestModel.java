package com.simpleaccounts.rest.financialreport;

import lombok.Data;

@Data
public class VatReportFilingRequestModel {
    private String startDate;
    private String endDate;
    private Integer id;
    private String vrn;
    private String vatNumber;
}
