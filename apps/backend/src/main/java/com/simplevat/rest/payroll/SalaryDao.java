package com.simplevat.rest.payroll;

import com.simplevat.dao.Dao;
import com.simplevat.entity.Employee;
import com.simplevat.entity.Salary;
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
