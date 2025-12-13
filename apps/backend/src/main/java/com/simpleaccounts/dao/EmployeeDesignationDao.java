package com.simpleaccounts.dao;

import com.simpleaccounts.entity.EmployeeDesignation;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

import java.util.List;
import java.util.Map;

public interface EmployeeDesignationDao extends Dao<Integer, EmployeeDesignation> {

   public List<DropdownObjectModel> getEmployeeDesignationDropdown();

   public  List<DropdownObjectModel> getParentEmployeeDesignationForDropdown();

   public  PaginationResponseModel getEmployeeDesignationList(Map<Object, Object> filterDataMap, PaginationModel paginationModel);

}
