package com.simpleaccounts.rest.simpleaccountreports.FTA;

import lombok.Data;

@Data
public class FtaAuditRequestModel {

    private String startDate;
    private String endDate;
    private Integer companyId;
    private Integer userId;
    private Integer taxAgencyId;

}
