package com.simpleaccounts.rest.payroll.daoimpl;

import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.dao.AbstractDao;

import com.simpleaccounts.entity.SalaryComponent;

import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.dao.SalaryComponentDao;
import org.springframework.stereotype.Repository;

import javax.persistence.Query;
import javax.persistence.TypedQuery;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository(value = "salaryComponentDao")
public class SalaryComponentDaoImpl extends AbstractDao<Integer, SalaryComponent> implements SalaryComponentDao {

   public List<DropdownObjectModel> getSalaryComponentsForDropdownObjectModel(Integer id){

         String quertStr = "SELECT s FROM SalaryComponent s where s.salaryStructure.id = :salaryStructure and s.deleteFlag = false order by s.id ASC";
               Query query = getEntityManager().createQuery(quertStr);
               query.setParameter("salaryStructure", id);
               List<SalaryComponent> salaryComponentList = query.getResultList();

       List<DropdownObjectModel> dropdownObjectModelList = new ArrayList<>();
       if (salaryComponentList != null && salaryComponentList.size() > 0) {
           for (SalaryComponent salaryComponent : salaryComponentList) {
               if(salaryComponent.getDescription().equalsIgnoreCase("Basic SALARY"))
                   continue;
               DropdownObjectModel dropdownObjectModel = new DropdownObjectModel(salaryComponent.getId(), salaryComponent.getDescription());
               dropdownObjectModelList.add(dropdownObjectModel);
           }
       }
       return dropdownObjectModelList;
   }

    public PaginationResponseModel getSalaryComponentList(Map<Object, Object> filterDataMap, PaginationModel paginationModel){

        List<DbFilter> dbFilters = new ArrayList<>();
        PaginationResponseModel resposne = new PaginationResponseModel();
        resposne.setCount(this.getResultCount(dbFilters));
        resposne.setData(this.executeQuery(dbFilters, paginationModel));
        return resposne;
    }

    public List<SalaryComponent> getDefaultSalaryComponentList(){

        String query = "SELECT s FROM SalaryComponent s where s.id < 4 and s.deleteFlag = false order by s.id ASC ";
        TypedQuery<SalaryComponent> typedQuery = getEntityManager().createQuery(query, SalaryComponent.class);
        List<SalaryComponent> salaryComponentList = typedQuery.getResultList();

        return salaryComponentList;
    }

}
