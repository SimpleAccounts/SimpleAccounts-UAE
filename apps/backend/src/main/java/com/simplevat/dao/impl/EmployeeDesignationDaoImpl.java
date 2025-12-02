package com.simplevat.dao.impl;

import com.simplevat.constant.dbfilter.DbFilter;
import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.EmployeeDesignationDao;
import com.simplevat.entity.EmployeeDesignation;
import com.simplevat.entity.SalaryStructure;
import com.simplevat.rest.DropdownObjectModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import org.springframework.stereotype.Repository;

import javax.persistence.TypedQuery;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository(value = "employeeDesignationDao")
public class EmployeeDesignationDaoImpl extends AbstractDao<Integer, EmployeeDesignation> implements EmployeeDesignationDao
{


    public List<DropdownObjectModel> getEmployeeDesignationDropdown(){

        String query = "SELECT ed FROM EmployeeDesignation ed Where  ed.deleteFlag!=true order by ed.id ASC ";
        TypedQuery<EmployeeDesignation> typedQuery = getEntityManager().createQuery(query, EmployeeDesignation.class);
        List<EmployeeDesignation> employeeDesignationList = typedQuery.getResultList();

        List<DropdownObjectModel> dropdownObjectModelList = new ArrayList<>();
        if (employeeDesignationList != null && employeeDesignationList.size() > 0) {
            for (EmployeeDesignation employeeDesignation : employeeDesignationList) {
                DropdownObjectModel dropdownObjectModel = new DropdownObjectModel(employeeDesignation.getId(), employeeDesignation.getDesignationName());
                dropdownObjectModelList.add(dropdownObjectModel);
            }
        }
        return dropdownObjectModelList;
    }

    public  List<DropdownObjectModel> getParentEmployeeDesignationForDropdown(){
        String query = "SELECT ed FROM EmployeeDesignation ed Where ed.parentId=null AND ed.deleteFlag!=true  order by ed.id ASC ";
        TypedQuery<EmployeeDesignation> typedQuery = getEntityManager().createQuery(query, EmployeeDesignation.class);
        List<EmployeeDesignation> employeeDesignationList = typedQuery.getResultList();

        List<DropdownObjectModel> dropdownObjectModelList = new ArrayList<>();
        if (employeeDesignationList != null && employeeDesignationList.size() > 0) {
            for (EmployeeDesignation employeeDesignation : employeeDesignationList) {
                DropdownObjectModel dropdownObjectModel = new DropdownObjectModel(employeeDesignation.getId(), employeeDesignation.getDesignationName());
                dropdownObjectModelList.add(dropdownObjectModel);
            }
        }
        return dropdownObjectModelList;
    }

    public PaginationResponseModel getEmployeeDesignationList(Map<Object, Object> filterDataMap, PaginationModel paginationModel){

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