package com.simpleaccounts.rest.payroll.model;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class GeneratePayrollPersistModel {

    private static final long serialVersionUID = 1L;
    private  Integer id;
    private Integer empId;
    private String empCode;
    private String empName;
    private BigDecimal lopDay;
    private BigDecimal noOfDays;
    private BigDecimal grossPay;
    private BigDecimal deduction;
    private BigDecimal netPay;
    private  Integer payrollId;
    private String salaryDate;
    private BigDecimal originalGrossPay;
    private BigDecimal perDaySal;
    private Integer originalNoOfDays;
    private BigDecimal originalDeduction;

}
