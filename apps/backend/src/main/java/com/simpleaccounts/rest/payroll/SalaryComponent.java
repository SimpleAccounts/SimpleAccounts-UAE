package com.simpleaccounts.rest.payroll;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class SalaryComponent {

    private LocalDateTime salaryDate;
    private Integer empId;
    private String empName;
    private String componentName ;
    private BigDecimal componentValue;
    private BigDecimal noOfDays;

}
