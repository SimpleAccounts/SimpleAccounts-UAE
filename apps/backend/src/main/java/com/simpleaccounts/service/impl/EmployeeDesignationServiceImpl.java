package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.dao.EmployeeDesignationDao;
import com.simpleaccounts.entity.EmployeeDesignation;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.EmployeeDesignationService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("employeeDesignationService")
@Transactional
@RequiredArgsConstructor
public class EmployeeDesignationServiceImpl extends EmployeeDesignationService {

    private final EmployeeDesignationDao employeeDesignationDao;
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