package com.simplevat.service.impl;

import com.simplevat.dao.Dao;
import com.simplevat.dao.EmployeeDesignationDao;
import com.simplevat.entity.EmployeeDesignation;
import com.simplevat.rest.DropdownObjectModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.service.EmployeeDesignationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service("employeeDesignationService")
@Transactional
public class EmployeeDesignationServiceImpl extends EmployeeDesignationService {

    @Autowired
    private EmployeeDesignationDao employeeDesignationDao;
    @Override
    protected Dao<Integer, EmployeeDesignation> getDao() {
        return this.employeeDesignationDao;
    }

    public List<DropdownObjectModel> getEmployeeDesignationDropdown(){

        return employeeDesignationDao.getEmployeeDesignationDropdown();
    }

    public  List<DropdownObjectModel> getParentEmployeeDesignationForDropdown(){
        return employeeDesignationDao.getParentEmployeeDesignationForDropdown();
    }

    public PaginationResponseModel getEmployeeDesignationList(Map<Object, Object> filterDataMap, PaginationModel paginationModel){

        return employeeDesignationDao.getEmployeeDesignationList(filterDataMap,paginationModel);
    }

}