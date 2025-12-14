package com.simpleaccounts.rest.payroll.model;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class PayrollEmployeeModel {
    private Integer payrollId;
    private Integer employeeId;
    private String payPeriod;
    private String payrollSubject;
    private LocalDateTime payrollDate;
    private String employeeName;
}
