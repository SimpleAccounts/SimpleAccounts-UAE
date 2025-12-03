package com.simpleaccounts.constant.dbfilter;

import lombok.Getter;

public enum PayrollFilterEnum {
    PAYROLL_DATE("payrollDate", " = :payrollDate"),
    PAYROLL_SUBJECT("payrollSubject", " like CONCAT('%',:payrollSubject,'%')"),
    PAY_PERIOD("payPeriod", " like  CONCAT('%', :payPeriod ,'%') "),
    EMPLOYEE_COUNT("employeeCount", " like  CONCAT('%', :employeeCount ,'%') "),
    GENERATED_BY("generatedBy", " = :generatedBy "),
    APPROVED_BY("approvedBy", " = :approvedBy "),
    STATUS("status", " = :status "),
    RUN_DATE("runDate", " IN :runDate ");

    @Getter
    String dbColumnName;

    @Getter
    String condition;

    private PayrollFilterEnum(String dbColumnName, String condition) {
        this.dbColumnName = dbColumnName;
        this.condition = condition;
    }
}
