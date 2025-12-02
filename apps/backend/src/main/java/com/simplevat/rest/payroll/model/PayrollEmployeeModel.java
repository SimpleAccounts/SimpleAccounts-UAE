package com.simplevat.rest.payroll.model;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;

@Data
public class PayrollEmployeeModel {
    private Integer payrollId;
    private Integer employeeId;
    private String payPeriod;
    private String payrollSubject;
    private LocalDateTime payrollDate;
    private String employeeName;
}
