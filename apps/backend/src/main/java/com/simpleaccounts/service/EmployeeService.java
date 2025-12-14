package com.simpleaccounts.service;

import com.simpleaccounts.constant.dbfilter.EmployeeFilterEnum;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.dto.PayrollEmployeeDto;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.servlet.http.HttpServletRequest;

public abstract class EmployeeService extends SimpleAccountsService<Integer, Employee> {

    public abstract List<DropdownModel> getEmployeesForDropdown();

    public abstract List<DropdownObjectModel> getEmployeesNotInUserForDropdown();

    public abstract List<Employee> getEmployees(Integer pageNo, Integer pageSize);

    public abstract List<Employee> getEmployees(final String searchQuery, Integer pageNo, Integer pageSize);

    public abstract Optional<Employee> getEmployeeByEmail(String email);

    public abstract PaginationResponseModel getEmployeeList(Map<EmployeeFilterEnum, Object> filterMap,PaginationModel paginationModel);

    public abstract void deleteByIds(ArrayList<Integer> ids);

    public abstract List<PayrollEmployeeDto> getAllActiveCompleteEmployee(String payrollDate);

    public abstract boolean sendInvitationMail(Employee employee, HttpServletRequest request);

}
