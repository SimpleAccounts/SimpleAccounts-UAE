package com.simpleaccounts.rest.payroll;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SalaryDeatilByEmployeeIdNoOfDaysModel {

    private String name;
    private BigDecimal value;

}
