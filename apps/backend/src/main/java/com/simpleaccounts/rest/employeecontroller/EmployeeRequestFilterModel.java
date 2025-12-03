package com.simpleaccounts.rest.employeecontroller;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;

@Data
public class EmployeeRequestFilterModel extends PaginationModel{
    private String name;
    private String email;

}
