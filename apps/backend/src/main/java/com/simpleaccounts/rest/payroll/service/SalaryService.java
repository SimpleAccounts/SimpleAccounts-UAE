package com.simpleaccounts.rest.payroll.service;

import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.Salary;
import com.simpleaccounts.rest.payroll.*;
import com.simpleaccounts.service.SimpleAccountsService;

import java.time.LocalDateTime;
import java.util.List;

public abstract class SalaryService extends SimpleAccountsService<Integer, Salary> {

    public abstract SalarySlipModel getSalaryByEmployeeId(Integer employeeId, String salaryDate);

    public abstract SalaryListPerMonthResponseModel getSalaryPerMonthList(SalaryPerMonthRequestModel requestModel , SalaryListPerMonthResponseModel salaryListPerMonthResponseModel);


    public abstract SalarySlipListtResponseModel getSalarySlipListt(Integer employeeId, SalarySlipListtResponseModel salarySlipListtResponseModel);

    public abstract IncompleteEmployeeResponseModel getIncompleteEmployeeList(IncompleteEmployeeResponseModel incompleteEmployeeResponseModel);
}
