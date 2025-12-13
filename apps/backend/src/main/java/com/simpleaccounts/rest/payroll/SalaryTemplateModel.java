package com.simpleaccounts.rest.payroll;

import lombok.Data;

import javax.persistence.*;

@Data
public class SalaryTemplateModel {

    private Integer id ;
    private String description;
    private String formula;
    private String flatAmount;

}
