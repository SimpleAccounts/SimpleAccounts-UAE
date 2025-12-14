package com.simpleaccounts.rest.payroll;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import lombok.Data;

@Data
public class SalaryDeatilByEmployeeIdNoOfDaysResponseModel {

    private Map<String, List<SalaryDeatilByEmployeeIdNoOfDaysModel>> salaryDetailAsNoOfDaysMap;
    private BigDecimal netPay;
    private String employeeName;
    private BigDecimal noOfDays;

}

