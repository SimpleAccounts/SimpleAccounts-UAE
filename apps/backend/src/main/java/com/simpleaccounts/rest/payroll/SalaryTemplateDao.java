package com.simpleaccounts.rest.payroll;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.SalaryTemplate;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface SalaryTemplateDao extends Dao<Integer, SalaryTemplate> {

   public PaginationResponseModel getSalaryTemplateList(Map<Object, Object> filterDataMap, PaginationModel paginationModel);

   public  List getDefaultTemplates();

}
