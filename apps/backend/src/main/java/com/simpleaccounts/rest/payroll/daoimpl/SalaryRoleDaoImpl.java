package com.simpleaccounts.rest.payroll.daoimpl;

import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.entity.SalaryRole;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.SalaryRoleDao;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import javax.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

@Repository(value = "salaryRole")
public class SalaryRoleDaoImpl extends AbstractDao<Integer, SalaryRole> implements SalaryRoleDao
{

   public List<DropdownObjectModel> getSalaryRolesForDropdownObjectModel() {

       String query = "SELECT s FROM SalaryRole s order by s.id ASC ";
       TypedQuery<SalaryRole> typedQuery = getEntityManager().createQuery(query, SalaryRole.class);
       List<SalaryRole> salaryRoleList = typedQuery.getResultList();

       List<DropdownObjectModel> dropdownObjectModelList = new ArrayList<>();
       if (salaryRoleList != null && salaryRoleList.size() > 0) {
           for (SalaryRole salaryRole : salaryRoleList) {
               DropdownObjectModel dropdownObjectModel = new DropdownObjectModel(salaryRole.getId(), salaryRole.getRoleName());
               dropdownObjectModelList.add(dropdownObjectModel);
           }
       }
           return dropdownObjectModelList;
       }

    public PaginationResponseModel getSalaryRoleList(Map<Object, Object> filterDataMap, PaginationModel paginationModel){
        List<DbFilter> dbFilters = new ArrayList<>();
        PaginationResponseModel resposne = new PaginationResponseModel();
        dbFilters.add(DbFilter.builder().dbCoulmnName("deleteFlag")
                .condition("=:deleteFlag")
                .value(false).build());
        resposne.setCount(this.getResultCount(dbFilters));
        resposne.setData(this.executeQuery(dbFilters, paginationModel));
        return resposne;
    }
 }