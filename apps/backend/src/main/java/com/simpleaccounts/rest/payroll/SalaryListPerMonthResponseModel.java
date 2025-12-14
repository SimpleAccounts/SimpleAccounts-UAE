package com.simpleaccounts.rest.payroll;

import java.util.List;
import lombok.Data;

@Data
public class SalaryListPerMonthResponseModel {

    private List<SalaryPerMonthModel> resultSalaryPerMonthList;

}
