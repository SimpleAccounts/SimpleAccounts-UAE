package com.simplevat.rest.payroll.daoimpl;

import com.simplevat.constant.dbfilter.DbFilter;
import com.simplevat.dao.AbstractDao;
import com.simplevat.entity.SalaryRole;
import com.simplevat.rest.DropdownObjectModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.payroll.SalaryRoleDao;
import org.springframework.stereotype.Repository;

import javax.persistence.TypedQuery;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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