package com.simpleaccounts.rest.payroll.payrolService;


import com.simpleaccounts.constant.dbfilter.InvoiceFilterEnum;
import com.simpleaccounts.constant.dbfilter.PayrollFilterEnum;
import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.entity.Payroll;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.UserDto;
import com.simpleaccounts.rest.payroll.dto.PayrollEmployeeDto;
import com.simpleaccounts.rest.payroll.model.PayrolRequestModel;
import com.simpleaccounts.service.SimpleAccountsService;

import java.util.List;
import java.util.Map;

public abstract class PayrolService extends SimpleAccountsService<Integer, Payroll> {

   public abstract Payroll createNewPayrol(User user, PayrolRequestModel payrolRequestModel, Integer userId);
   
   public abstract Payroll updatePayrol(User user, PayrolRequestModel payrolRequestModel, Integer userId);

   public  abstract void savePayrollEmployeeRelation(Integer payrollId, User user, List<Integer> employeeListIds);

   public abstract void deleteByIds(List<Integer> payEmpListIds);
   
   public abstract Payroll getByPayrollById(Integer payrollId);

   public abstract List<UserDto> getAprovedUserList();

   public abstract List<PayrollEmployeeDto>getAllPayrollEmployee(Integer payrollId,String payrollDate);

   public abstract List<PayrollEmployeeDto> getAllPayrollEmployeeForApprover(Integer payrollid);


   public abstract void deletePayroll(Integer id);
    
   public abstract List<Integer> getEmployeeList(Integer id);

   public abstract PaginationResponseModel getList(Map<PayrollFilterEnum, Object> map,
                                                          PaginationModel paginationModel);

}
