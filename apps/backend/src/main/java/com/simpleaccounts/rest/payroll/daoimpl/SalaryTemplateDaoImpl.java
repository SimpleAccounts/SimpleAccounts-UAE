package com.simpleaccounts.rest.payroll.daoimpl;

import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.entity.SalaryTemplate;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.SalaryTemplateDao;
import org.springframework.stereotype.Repository;

import javax.persistence.Query;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository(value = "salaryTemplateDao")
public class SalaryTemplateDaoImpl extends AbstractDao<Integer, SalaryTemplate> implements SalaryTemplateDao
{

  public PaginationResponseModel getSalaryTemplateList(Map<Object, Object> filterDataMap, PaginationModel paginationModel){
    List<DbFilter> dbFilters = new ArrayList<>();
    PaginationResponseModel resposne = new PaginationResponseModel();
    resposne.setCount(this.getResultCount(dbFilters));
    resposne.setData(this.executeQuery(dbFilters, paginationModel));
    return resposne;

  }

  public  List getDefaultTemplates(){

    String quertStr = " SELECT st.salaryComponentId.salaryStructure.name,st.salaryComponentId.description,st.salaryComponentId.formula,st.salaryComponentId.flatAmount,st.id FROM SalaryTemplate st";
    Query query = getEntityManager().createQuery(quertStr);
    List<Object> list = query.getResultList();

    return list;
  }

}