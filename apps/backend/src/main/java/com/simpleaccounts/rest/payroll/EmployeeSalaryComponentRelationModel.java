package com.simpleaccounts.rest.payroll;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class EmployeeSalaryComponentRelationModel {

    private Integer id ;
    private String description;
    private String formula;
    private String flatAmount;
    private Integer employeeId;
    private Integer salaryComponentId;
    private Integer salaryStructure;
    private BigDecimal monthlyAmount;
    private BigDecimal yearlyAmount;

}
