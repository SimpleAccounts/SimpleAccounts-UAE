package com.simplevat.rest.payroll;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class DefaultSalaryTemplateModel {

    Map<String , List<SalaryTemplateModel>> salaryComponentResult;


}
