package com.simpleaccounts.rest.payroll;

import lombok.Data;

import java.util.List;

@Data
public class SalaryListPerMonthResponseModel {

    private List<SalaryPerMonthModel> resultSalaryPerMonthList;

}
