package com.simpleaccounts.rest.payroll;


import lombok.Data;

@Data
public class SalaryComponentListModel {

    private Integer id;
    private String description;
    private String formula;
    private String flatAmount;
    private String salaryStructure;




}
