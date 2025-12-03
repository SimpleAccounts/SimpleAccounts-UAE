package com.simpleaccounts.rest.simpleaccountreports.FTA;

import lombok.Data;

import java.util.Date;

@Data
public class FtaAuditRequestModel {

    private String startDate;
    private String endDate;
    private Integer companyId;
    private Integer userId;
    private Integer taxAgencyId;

}
