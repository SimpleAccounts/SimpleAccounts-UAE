package com.simpleaccounts.rest.payroll.dto;

public interface PayrollEmployeeResultSetMapping {
    Integer getId();
    Integer getEmpId();
    String  getEmpFirstName();
    String  getEmpLastName();
    String  getEmpCode();
    Integer getLopDays();
    Integer getNoOfDays();
}
