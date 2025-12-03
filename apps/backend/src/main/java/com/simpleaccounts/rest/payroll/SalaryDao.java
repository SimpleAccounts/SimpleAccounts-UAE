package com.simpleaccounts.rest.payroll;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.Salary;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SalaryDao extends Dao<Integer, Salary> {

    List<Salary> getSalaryByEmployeeId(Employee employee, String salaryDate);

    SalaryListPerMonthResponseModel getSalaryPerMonthList(SalaryPerMonthRequestModel requestModel, SalaryListPerMonthResponseModel salaryListPerMonthResponseModel);

    SalarySlipListtResponseModel getSalarySlipListt(Employee employeeId,SalarySlipListtResponseModel salarySlipListtResponseModel);

    IncompleteEmployeeResponseModel getIncompleteEmployeeList(IncompleteEmployeeResponseModel incompleteEmployeeResponseModel);

}
