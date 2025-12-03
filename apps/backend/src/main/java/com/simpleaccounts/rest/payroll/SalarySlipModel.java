package com.simpleaccounts.rest.payroll;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class SalarySlipModel {

    Map<String , Map<LocalDateTime,List<SalaryComponent>>> salarySlipMap;
    Map<String , List<SalaryComponent>> salarySlipResult;
    private String designation ;
    private LocalDate payDate;
    private String payPeriod;
    private LocalDate dateOfJoining;
    private String salaryMonth;
    private String employeename;
    private BigDecimal earnings = BigDecimal.ZERO ;
  //  private BigDecimal grossSalary = BigDecimal.ZERO ;
    private BigDecimal deductions = BigDecimal.ZERO ;
    private BigDecimal netPay = BigDecimal.ZERO;
    private BigDecimal noOfDays;
    private BigDecimal lopDays;

}
