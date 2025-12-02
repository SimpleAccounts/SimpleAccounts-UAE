package com.simplevat.rest.payroll;

import com.simplevat.constant.dbfilter.PayrollFilterEnum;
import com.simplevat.dao.Dao;
import com.simplevat.entity.EmployeeBankDetails;
import com.simplevat.entity.Invoice;
import com.simplevat.entity.Payroll;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

import java.util.Map;

public interface PayrollDao extends Dao<Integer, Payroll>  {

    PaginationResponseModel getList(Map<PayrollFilterEnum, Object> map, PaginationModel paginationModel);
}
