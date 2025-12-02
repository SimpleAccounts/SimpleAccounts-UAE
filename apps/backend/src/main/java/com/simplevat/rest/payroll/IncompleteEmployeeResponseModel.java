package com.simplevat.rest.payroll;

import com.simplevat.entity.Employee;
import com.simplevat.rest.payroll.service.IncompleteEmployeeProfileModel;
import lombok.Data;

import java.util.List;

@Data
public class IncompleteEmployeeResponseModel {

    private List<IncompleteEmployeeProfileModel> incompleteEmployeeList;

}
