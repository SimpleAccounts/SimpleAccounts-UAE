package com.simplevat.dao;

import com.simplevat.constant.dbfilter.EmployeeFilterEnum;
import com.simplevat.entity.Employee;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.DropdownObjectModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface EmployeeDao extends Dao<Integer, Employee> {

    public List<DropdownModel> getEmployeesForDropdown();
    public List<DropdownObjectModel> getEmployeesNotInUserForDropdown();

    public List<Employee> getEmployees(Integer pageNo, Integer pageSize);

    public List<Employee> getEmployees(final String searchQuery, Integer pageNo, Integer pageSize);

    public Optional<Employee> getEmployeeByEmail(String email);

	public PaginationResponseModel getEmployeeList(Map<EmployeeFilterEnum, Object> filterMap,PaginationModel paginationModel);

	public void deleteByIds(List<Integer> ids);
}
