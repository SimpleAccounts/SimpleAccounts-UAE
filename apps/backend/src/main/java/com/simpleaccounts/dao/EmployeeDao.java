package com.simpleaccounts.dao;

import com.simpleaccounts.constant.dbfilter.EmployeeFilterEnum;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
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
