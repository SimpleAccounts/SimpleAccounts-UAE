package com.simpleaccounts.rest.payroll;


import lombok.Data;

import java.math.BigDecimal;

@Data
public class SalaryPerMonthModel {

private Integer employeeId;
private String employeeName;
private BigDecimal payDays;
private BigDecimal earnings = BigDecimal.ZERO ;
private BigDecimal grossSalary = BigDecimal.ZERO ;
private BigDecimal deductions = BigDecimal.ZERO ;
private BigDecimal netPay = BigDecimal.ZERO;
private String status;

}
