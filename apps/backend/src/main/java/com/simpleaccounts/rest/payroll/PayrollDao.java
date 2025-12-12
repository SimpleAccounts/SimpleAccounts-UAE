package com.simpleaccounts.rest.payroll;

import com.simpleaccounts.constant.dbfilter.PayrollFilterEnum;
import com.simpleaccounts.dao.Dao;

import com.simpleaccounts.entity.Payroll;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

import java.util.Map;

public interface PayrollDao extends Dao<Integer, Payroll>  {

    PaginationResponseModel getList(Map<PayrollFilterEnum, Object> map, PaginationModel paginationModel);
}
