package com.simplevat.service;

import com.simplevat.constant.dbfilter.EmployeeFilterEnum;
import com.simplevat.entity.Employee;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.DropdownObjectModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.payroll.dto.PayrollEmployeeDto;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public abstract class EmployeeService extends SimpleVatService<Integer, Employee> {

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
