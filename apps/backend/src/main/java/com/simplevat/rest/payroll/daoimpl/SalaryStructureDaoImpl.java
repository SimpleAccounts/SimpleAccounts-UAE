package com.simplevat.rest.payroll.daoimpl;

import com.simplevat.constant.dbfilter.DbFilter;
import com.simplevat.dao.AbstractDao;
import com.simplevat.entity.SalaryStructure;
import com.simplevat.rest.DropdownObjectModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.payroll.SalaryStructureDao;
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