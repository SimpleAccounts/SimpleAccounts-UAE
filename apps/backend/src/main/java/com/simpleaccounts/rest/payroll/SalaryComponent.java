package com.simpleaccounts.rest.payroll;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SalaryComponent {

    private LocalDateTime salaryDate;
    private Integer empId;
    private String empName;
    private String componentName ;
    private BigDecimal componentValue;
    private BigDecimal noOfDays;

}
