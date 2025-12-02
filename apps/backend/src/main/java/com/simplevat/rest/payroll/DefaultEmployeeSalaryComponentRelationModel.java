package com.simplevat.rest.payroll;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class DefaultEmployeeSalaryComponentRelationModel {

    Map<String , List<EmployeeSalaryComponentRelationModel>> salaryComponentResult;
    private BigDecimal ctc;
}
