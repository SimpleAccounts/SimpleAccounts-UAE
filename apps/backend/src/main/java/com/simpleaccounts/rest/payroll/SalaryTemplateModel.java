package com.simpleaccounts.rest.payroll;

import javax.persistence.*;
import lombok.Data;

@Data
public class SalaryTemplateModel {

    private Integer id ;
    private String description;
    private String formula;
    private String flatAmount;

}
