package com.simpleaccounts.rest.simpleaccountreports;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class PayrollSummaryModel {

    private String payrollDate;
    private String payrollSubject;
    private Integer payrollId;
    private String payPeriod;
    private Integer employeeCount;
    private String generatedBy;
    private String approvedBy;
    private String status;
    private String runDate;
    private String comment;
    private Boolean isActive;
    private Integer payrollApprover;
    private String  generatedByName;
    private String payrollApproverName;
    private BigDecimal totalAmount;
    private BigDecimal dueAmount;

}