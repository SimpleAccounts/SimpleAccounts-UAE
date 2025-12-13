package com.simpleaccounts.rest.CorporateTax;

import java.io.Serializable;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class CorporateTaxModel implements Serializable {
	private static final long serialVersionUID = 1L;
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
