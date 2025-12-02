package com.simplevat.rest.payroll.payrolService;


import com.simplevat.constant.dbfilter.InvoiceFilterEnum;
import com.simplevat.constant.dbfilter.PayrollFilterEnum;
import com.simplevat.entity.Invoice;
import com.simplevat.entity.Payroll;
import com.simplevat.entity.User;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.payroll.UserDto;
import com.simplevat.rest.payroll.dto.PayrollEmployeeDto;
import com.simplevat.rest.payroll.model.PayrolRequestModel;
import com.simplevat.service.SimpleVatService;

import java.util.List;
import java.util.Map;

public abstract class PayrolService extends SimpleVatService<Integer, Payroll> {

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
