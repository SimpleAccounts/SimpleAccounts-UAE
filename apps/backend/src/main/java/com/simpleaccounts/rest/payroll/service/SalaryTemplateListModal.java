package com.simpleaccounts.rest.payroll.service;

import lombok.Data;

import javax.persistence.*;

@Data
public class SalaryTemplateListModal {

    private Integer id;
    private Integer salaryComponentId;
    private Integer salaryRoleId;
    private String description;
    private String formula;
    private String flatAmount;
    private String salaryStructure;

}
