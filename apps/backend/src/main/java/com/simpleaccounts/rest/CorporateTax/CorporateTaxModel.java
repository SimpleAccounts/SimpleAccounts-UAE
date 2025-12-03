package com.simpleaccounts.rest.CorporateTax;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;

@Data
public class CorporateTaxModel {
    private Integer id;
    private String startDate;
    private String endDate;
    private String dueDate;
    private String taxFiledOn;
    private String status;
    private BigDecimal balanceDue;
    private BigDecimal netIncome;
    private BigDecimal taxableAmount;
    private BigDecimal taxAmount;
    private String reportingPeriod;
    private String reportingForYear;
    private String viewCtReport;
}
