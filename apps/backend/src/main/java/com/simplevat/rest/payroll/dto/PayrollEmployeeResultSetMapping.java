package com.simplevat.rest.payroll.dto;

public interface PayrollEmployeeResultSetMapping {
    Integer getId();
    Integer getEmpId();
    String  getEmpFirstName();
    String  getEmpLastName();
    String  getEmpCode();
    Integer getLopDays();
    Integer getNoOfDays();
}
