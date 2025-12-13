package com.simpleaccounts.rest.payroll;

import java.util.List;
import java.util.Map;
import lombok.Data;

@Data
public class DefaultSalaryTemplateModel {

    Map<String , List<SalaryTemplateModel>> salaryComponentResult;

}
