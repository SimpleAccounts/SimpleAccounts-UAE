package com.simpleaccounts.rest.payroll;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.PayrollFilterEnum;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.entity.EmployeeBankDetails;
import com.simpleaccounts.entity.Payroll;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository(value = "payrollDao")
public class PayrollDaoImpl extends AbstractDao<Integer, Payroll> implements PayrollDao
 {
  @Autowired
  private DatatableSortingFilterConstant datatableUtil;

  public PaginationResponseModel getList(Map<PayrollFilterEnum, Object> filterMap, PaginationModel paginationModel){
   List<DbFilter> dbFilters = new ArrayList<>();
   filterMap.forEach(
           (productFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(productFilter.getDbColumnName())
                   .condition(productFilter.getCondition()).value(value).build()));
   paginationModel.setSortingCol(
           datatableUtil.getColName(paginationModel.getSortingCol(), DatatableSortingFilterConstant.PAYROLL));
   PaginationResponseModel response = new PaginationResponseModel();
   response.setCount(this.getResultCount(dbFilters));
   response.setData(this.executeQuery(dbFilters, paginationModel));
   return response;
  }
}