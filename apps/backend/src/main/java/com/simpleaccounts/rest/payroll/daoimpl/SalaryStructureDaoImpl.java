package com.simpleaccounts.rest.payroll.daoimpl;

import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.entity.SalaryStructure;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.SalaryStructureDao;
import org.springframework.stereotype.Repository;

import javax.persistence.TypedQuery;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;


@Repository(value = "salaryStructureDao")
public class SalaryStructureDaoImpl extends AbstractDao<Integer, SalaryStructure> implements SalaryStructureDao
{
    public PaginationResponseModel getSalaryStructureList(Map<Object, Object> filterDataMap, PaginationModel paginationModel)
    {
        List<DbFilter> dbFilters = new ArrayList<>();
        PaginationResponseModel resposne = new PaginationResponseModel();
        resposne.setCount(this.getResultCount(dbFilters));
        resposne.setData(this.executeQuery(dbFilters, paginationModel));
        return resposne;
    }

    public List<DropdownObjectModel> getSalaryStructureDropdown(){
        String query = "SELECT s FROM SalaryStructure s order by s.id ASC ";
        TypedQuery<SalaryStructure> typedQuery = getEntityManager().createQuery(query, SalaryStructure.class);
        List<SalaryStructure> salaryStructureList = typedQuery.getResultList();

        List<DropdownObjectModel> dropdownObjectModelList = new ArrayList<>();
        if (salaryStructureList != null && salaryStructureList.size() > 0) {
            for (SalaryStructure salaryStructure : salaryStructureList) {
                DropdownObjectModel dropdownObjectModel = new DropdownObjectModel(salaryStructure.getId(), salaryStructure.getName());
                dropdownObjectModelList.add(dropdownObjectModel);
            }
        }
        return dropdownObjectModelList;
    }
}