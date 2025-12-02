package com.simplevat.rest.payroll.service;

import com.simplevat.entity.Employee;
import com.simplevat.entity.Salary;
import com.simplevat.rest.payroll.*;
import com.simplevat.service.SimpleVatService;

import java.time.LocalDateTime;
import java.util.List;

public abstract class SalaryService extends SimpleVatService<Integer, Salary> {

    public abstract SalarySlipModel getSalaryByEmployeeId(Integer employeeId, String salaryDate);

    public abstract SalaryListPerMonthResponseModel getSalaryPerMonthList(SalaryPerMonthRequestModel requestModel , SalaryListPerMonthResponseModel salaryListPerMonthResponseModel);


    public abstract SalarySlipListtResponseModel getSalarySlipListt(Integer employeeId, SalarySlipListtResponseModel salarySlipListtResponseModel);

    public abstract IncompleteEmployeeResponseModel getIncompleteEmployeeList(IncompleteEmployeeResponseModel incompleteEmployeeResponseModel);
}
