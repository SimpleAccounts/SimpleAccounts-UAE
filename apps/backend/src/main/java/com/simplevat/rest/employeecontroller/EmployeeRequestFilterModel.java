package com.simplevat.rest.employeecontroller;

import com.simplevat.rest.PaginationModel;
import lombok.Data;

@Data
public class EmployeeRequestFilterModel extends PaginationModel{
    private String name;
    private String email;

}
