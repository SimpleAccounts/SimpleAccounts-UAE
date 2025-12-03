package com.simpleaccounts.rest.payroll;

import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.rest.payroll.service.IncompleteEmployeeProfileModel;
import lombok.Data;

import java.util.List;

@Data
public class IncompleteEmployeeResponseModel {

    private List<IncompleteEmployeeProfileModel> incompleteEmployeeList;

}
