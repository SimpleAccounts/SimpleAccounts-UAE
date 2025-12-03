package com.simpleaccounts.rest.payroll;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class SalaryDeatilByEmployeeIdNoOfDaysResponseModel {

    private Map<String, List<SalaryDeatilByEmployeeIdNoOfDaysModel>> salaryDetailAsNoOfDaysMap;
    private BigDecimal netPay;
    private String employeeName;
    private BigDecimal noOfDays;


}


