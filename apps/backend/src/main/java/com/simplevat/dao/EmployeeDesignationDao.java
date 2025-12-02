package com.simplevat.dao;

import com.simplevat.entity.EmployeeDesignation;
import com.simplevat.rest.DropdownObjectModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

import java.util.List;
import java.util.Map;


public interface EmployeeDesignationDao extends Dao<Integer, EmployeeDesignation> {

   public List<DropdownObjectModel> getEmployeeDesignationDropdown();

   public  List<DropdownObjectModel> getParentEmployeeDesignationForDropdown();

   public  PaginationResponseModel getEmployeeDesignationList(Map<Object, Object> filterDataMap, PaginationModel paginationModel);


}
