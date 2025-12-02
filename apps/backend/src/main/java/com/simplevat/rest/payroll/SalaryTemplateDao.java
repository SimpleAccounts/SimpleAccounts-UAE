package com.simplevat.rest.payroll;

import com.simplevat.dao.Dao;
import com.simplevat.entity.SalaryTemplate;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface SalaryTemplateDao extends Dao<Integer, SalaryTemplate> {


   public PaginationResponseModel getSalaryTemplateList(Map<Object, Object> filterDataMap, PaginationModel paginationModel);


   public  List getDefaultTemplates();


}
