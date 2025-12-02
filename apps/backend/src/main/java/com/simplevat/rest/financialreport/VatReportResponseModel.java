package com.simplevat.rest.financialreport;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VatReportResponseModel {
    private Integer id;
    private String taxReturns;
    private String startDate;
    private String endDate;
    private BigDecimal totalTaxPayable;
    private BigDecimal totalTaxReclaimable;
    private LocalDateTime filedOn;
    private String status;
    private BigDecimal balanceDue;
    private Boolean action = Boolean.TRUE;
    private String currency;
    private String createdBy;
    private Integer userId;
    private LocalDateTime createdDate = LocalDateTime.now();
    private  Integer taxAgencyId;
    private String vatNumber;
}
