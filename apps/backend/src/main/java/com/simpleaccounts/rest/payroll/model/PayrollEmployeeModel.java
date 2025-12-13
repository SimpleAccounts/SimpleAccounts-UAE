package com.simpleaccounts.rest.payroll.model;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PayrollEmployeeModel {
    private Integer payrollId;
    private Integer employeeId;
    private String payPeriod;
    private String payrollSubject;
    private LocalDateTime payrollDate;
    private String employeeName;
}
