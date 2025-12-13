package com.simpleaccounts.rest.payroll;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import lombok.Data;

@Data
public class DefaultEmployeeSalaryComponentRelationModel {

    Map<String , List<EmployeeSalaryComponentRelationModel>> salaryComponentResult;
    private BigDecimal ctc;
}
